import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/auditLog";
import { requireAuthSession, getSessionInstitution } from "@/lib/apiGuard";
import bcrypt from "bcryptjs";

// Cast helper: menghindari stale Prisma IDE types untuk field baru (institution)
const db = prisma as any;

export async function GET(req: NextRequest) {
  try {
    const { session, errorResponse } = await requireAuthSession(req, ["sek", "admin", "superadmin"]);
    if (errorResponse) return errorResponse;

    const sessionInstitution = getSessionInstitution(session);

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const statusParam = searchParams.get("status");

    // Filter instansi: hanya tampilkan akun milik instansi yang sama
    const institutionFilter = sessionInstitution === "ALL"
      ? {} // Admin/superadmin bisa lihat semua
      : { institution: sessionInstitution };

    let whereCondition: any = {
      deletedAt: null,
      status: { not: "INACTIVE" },
      ...institutionFilter,
      ...(query
        ? {
            OR: [
              { username: { contains: query, mode: "insensitive" as const } },
              { email: { contains: query, mode: "insensitive" as const } },
              { role: { contains: query, mode: "insensitive" as const } },
              { person: { fullName: { contains: query, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    };

    if (statusParam === "dorman" || statusParam === "trash") {
      whereCondition = {
        ...institutionFilter,
        OR: [
          { deletedAt: { not: null } },
          { status: "INACTIVE" },
        ],
        ...(query
          ? {
              AND: [
                {
                  OR: [
                    { username: { contains: query, mode: "insensitive" as const } },
                    { person: { fullName: { contains: query, mode: "insensitive" as const } } },
                  ],
                },
              ],
            }
          : {}),
      };
    }

    const [total, users] = await Promise.all([
      db.userAccount.count({ where: whereCondition }),
      db.userAccount.findMany({
        where: whereCondition,
        take: limit,
        skip: offset,
        include: { person: true },
        orderBy: { username: "asc" },
      }),
    ]);

    const formatted = users.map((u: any) => {
      return {
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        institution: u.institution,
        status: u.status,
        isActive: u.status === "ACTIVE",
        isOnline: false,
        personName: u.person.fullName,
        personId: u.personId,
        personPhone: u.person.phoneNumber || "",
        avatarUrl: u.person.avatarUrl || null,
        gender: u.person.gender,
        lastLoginAt: null,
      };
    });

    return NextResponse.json({ status: "Success", data: formatted, total });
  } catch (err: any) {
    console.error("ADMIN_USERS_GET_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, errorResponse } = await requireAuthSession(req, ["sek", "admin", "superadmin"]);
    if (errorResponse) return errorResponse;

    const sessionInstitution = getSessionInstitution(session);

    const body = await req.json();
    const { personId, username, email, password, role, fullName, phone, gender } = body;

    if (!username) {
      return NextResponse.json(
        { status: "Error", message: "Username wajib diisi." },
        { status: 400 }
      );
    }

    // Deteksi institution dari role yang diberikan, atau gunakan session institution
    const { detectInstitutionFromRole } = await import("@/lib/institutionGuard");
    const targetInstitution = role ? detectInstitutionFromRole(role) : sessionInstitution;
    // Pastikan sekretariat hanya bisa buat akun untuk instansinya sendiri (kecuali admin)
    if (sessionInstitution !== "ALL" && targetInstitution !== "ALL" && targetInstitution !== sessionInstitution) {
      return NextResponse.json(
        { status: "Error", message: "Anda tidak dapat membuat akun untuk instansi yang berbeda." },
        { status: 403 }
      );
    }

    let targetPersonId = personId;
    if (!targetPersonId) {
      const newPerson = await prisma.person.create({
        data: {
          fullName: fullName || username,
          gender: gender || "L",
          phoneNumber: phone || null,
        },
      });
      targetPersonId = newPerson.id;
    }

    const hashedPassword = await bcrypt.hash(password || "mphm123", 10);

    const newUser = await db.userAccount.create({
      data: {
        personId: targetPersonId,
        username,
        email: email || null,
        passwordHash: hashedPassword,
        role: role || "pengurus",
        institution: targetInstitution,
        status: "ACTIVE",
      },
      include: { person: true },
    });

    await createAuditLog({
      userId: session?.username || "SEKRETARIAT",
      action: "CREATE_USER",
      entity: "USER_ACCOUNT",
      entityId: newUser.id,
      afterState: { username: newUser.username, role: newUser.role, institution: newUser.institution },
    });

    return NextResponse.json({
      status: "Success",
      message: "Akun berhasil diterbitkan.",
      data: newUser,
    });
  } catch (err: any) {
    console.error("ADMIN_USERS_POST_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
