import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createDb, rooms, teacherProfiles, people, studentProfiles } from "@mphm/db";
import type { AppEnv } from "../../types";
import { requireRole } from "../../middlewares/rbacMiddleware";
import { eq, isNull, and, like, or, sql } from "drizzle-orm";

const roomsAdmin = new Hono<AppEnv>();

// RBAC: Hanya Sekretariat yang bisa mengelola data Master Asrama/Kamar
// Mundzir/Mufattisy diperbolehkan untuk membaca (GET)
roomsAdmin.get("*", requireRole(["Sekretariat", "Mundzir", "Mufattisy"]));
roomsAdmin.post("*", requireRole(["Sekretariat"]));
roomsAdmin.put("*", requireRole(["Sekretariat"]));
roomsAdmin.delete("*", requireRole(["Sekretariat"]));

const createRoomSchema = z.object({
  name: z.string().min(3, "Nama kamar minimal 3 karakter"),
  buildingName: z.string().min(1, "Nama gedung harus diisi"),
  capacity: z.number().int().positive("Kapasitas harus berupa angka positif"),
  gender: z.enum(["L", "P"]),
  supervisorId: z.string().uuid().nullable().optional(),
});

const updateRoomSchema = createRoomSchema.partial();

// ============================================================
// 1. GET ALL ROOMS (WITH SEARCH, BUILDING FILTER & PAGINATION)
// ============================================================
roomsAdmin.get("/", async (c) => {
  try {
    const query = c.req.query("q") || undefined;
    const building = c.req.query("building") || undefined;
    const limit = parseInt(c.req.query("limit") || "10", 10);
    const offset = parseInt(c.req.query("offset") || "0", 10);

    const db = createDb(c.env.DB);

    // Kueri dasar: Hanya kamar yang belum dihapus (soft delete)
    let whereClause = isNull(rooms.deletedAt);

    if (query) {
      whereClause = and(
        whereClause,
        like(rooms.name, `%${query}%`)
      ) as any;
    }

    if (building) {
      whereClause = and(whereClause, eq(rooms.buildingName, building)) as any;
    }

    // Count total rooms matching filters
    const countRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(rooms)
      .where(whereClause)
      .get();
    const total = countRes?.count || 0;

    // Get rooms with supervisor full name
    // Drizzle SQLite raw query/innerJoin
    const list = await db
      .select({
        id: rooms.id,
        name: rooms.name,
        buildingName: rooms.buildingName,
        capacity: rooms.capacity,
        gender: rooms.gender,
        supervisorId: rooms.supervisorId,
        supervisorName: people.fullName,
        isActive: rooms.isActive,
      })
      .from(rooms)
      .leftJoin(teacherProfiles, eq(rooms.supervisorId, teacherProfiles.id))
      .leftJoin(people, eq(teacherProfiles.personId, people.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .all();

    // Dapatkan kapasitas terisi saat ini untuk setiap kamar
    const formattedList = await Promise.all(
      list.map(async (room) => {
        const filledRes = await db
          .select({ count: sql<number>`count(*)` })
          .from(studentProfiles)
          .where(and(eq(studentProfiles.roomId, room.id), isNull(studentProfiles.deletedAt)))
          .get();
        return {
          ...room,
          filledCapacity: filledRes?.count || 0,
        };
      })
    );

    return c.json({
      status: "Success",
      data: formattedList,
      total,
    });
  } catch (err: any) {
    console.error("ROOMS_GET_ERROR:", err.message);
    return c.json({ status: "Error", message: err.message }, 500);
  }
});

// ============================================================
// 2. CREATE NEW ROOM
// ============================================================
roomsAdmin.post("/", zValidator("json", createRoomSchema), async (c) => {
  try {
    const data = c.req.valid("json");
    const db = createDb(c.env.DB);

    // Cek nama unik
    const existing = await db
      .select()
      .from(rooms)
      .where(and(eq(rooms.name, data.name), isNull(rooms.deletedAt)))
      .get();

    if (existing) {
      return c.json({ status: "Error", message: `Kamar dengan nama ${data.name} sudah terdaftar.` }, 409);
    }

    const newRoom = await db
      .insert(rooms)
      .values({
        name: data.name,
        buildingName: data.buildingName,
        capacity: data.capacity,
        gender: data.gender,
        supervisorId: data.supervisorId || null,
        isActive: true,
      })
      .returning()
      .get();

    return c.json({
      status: "Success",
      message: "Kamar berhasil dibuat.",
      data: newRoom,
    });
  } catch (err: any) {
    console.error("ROOM_CREATE_ERROR:", err.message);
    return c.json({ status: "Error", message: err.message }, 500);
  }
});

// ============================================================
// 3. UPDATE ROOM DETAILS
// ============================================================
roomsAdmin.put("/:id", zValidator("json", updateRoomSchema), async (c) => {
  try {
    const id = c.req.param("id");
    if (!id) return c.json({ status: "Error", message: "id is required" }, 400);

    const data = c.req.valid("json");
    const db = createDb(c.env.DB);

    const existingRoom = await db
      .select()
      .from(rooms)
      .where(and(eq(rooms.id, id), isNull(rooms.deletedAt)))
      .get();

    if (!existingRoom) {
      return c.json({ status: "Error", message: "Kamar tidak ditemukan." }, 404);
    }

    // Cek nama unik jika nama diubah
    if (data.name && data.name !== existingRoom.name) {
      const nameConflict = await db
        .select()
        .from(rooms)
        .where(and(eq(rooms.name, data.name), isNull(rooms.deletedAt)))
        .get();

      if (nameConflict) {
        return c.json({ status: "Error", message: `Kamar dengan nama ${data.name} sudah terdaftar.` }, 409);
      }
    }

    const updatedRoom = await db
      .update(rooms)
      .set({
        ...data,
      })
      .where(eq(rooms.id, id))
      .returning()
      .get();

    return c.json({
      status: "Success",
      message: "Data kamar berhasil diperbarui.",
      data: updatedRoom,
    });
  } catch (err: any) {
    console.error("ROOM_UPDATE_ERROR:", err.message);
    return c.json({ status: "Error", message: err.message }, 500);
  }
});

// ============================================================
// 4. SOFT DELETE ROOM
// ============================================================
roomsAdmin.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    if (!id) return c.json({ status: "Error", message: "id is required" }, 400);

    const db = createDb(c.env.DB);

    const existingRoom = await db
      .select()
      .from(rooms)
      .where(and(eq(rooms.id, id), isNull(rooms.deletedAt)))
      .get();

    if (!existingRoom) {
      return c.json({ status: "Error", message: "Kamar tidak ditemukan." }, 404);
    }

    // Soft delete
    await db
      .update(rooms)
      .set({
        deletedAt: new Date(),
        isActive: false,
      })
      .where(eq(rooms.id, id));

    // Kosongkan room_id dari santri yang menghuni kamar ini
    await db
      .update(studentProfiles)
      .set({ roomId: null })
      .where(eq(studentProfiles.roomId, id));

    return c.json({
      status: "Success",
      message: "Kamar berhasil dinonaktifkan (Soft Delete).",
    });
  } catch (err: any) {
    console.error("ROOM_DELETE_ERROR:", err.message);
    return c.json({ status: "Error", message: err.message }, 500);
  }
});

export default roomsAdmin;
