import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/jwt";
import { createAuditLog } from "@/lib/auditLog";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, confirmationText } = body;

    if (confirmationText !== "HAPUS SEMUA DATA") {
      return NextResponse.json(
        { status: "Error", message: "Teks konfirmasi tidak sesuai. Harap ketik 'HAPUS SEMUA DATA'." },
        { status: 400 }
      );
    }

    const now = new Date();
    let deletedCount = 0;
    let categoryLabel = "";

    await prisma.$transaction(async (tx) => {
      if (category === "student" || category === "santri") {
        categoryLabel = "Santriwati / Siswi";
        const students = await tx.studentProfile.findMany({
          where: { deletedAt: null },
          select: { id: true, personId: true },
        });

        const personIds = Array.from(new Set(students.map((s) => s.personId)));
        deletedCount = personIds.length;

        await tx.studentProfile.updateMany({
          where: { deletedAt: null },
          data: { deletedAt: now },
        });

        await tx.person.updateMany({
          where: { id: { in: personIds }, deletedAt: null },
          data: { deletedAt: now },
        });
      } else if (category === "mustahiq") {
        categoryLabel = "Mustahiq (Dewan Pengajar)";
        const teachers = await tx.teacherProfile.findMany({
          where: { deletedAt: null },
          select: { id: true, personId: true },
        });

        const teacherPersonIds = teachers.map((t) => t.personId);

        const memberships = await tx.organizationMembership.findMany({
          where: {
            deletedAt: null,
            role: { contains: "Mustahiq", mode: "insensitive" },
          },
          select: { id: true, personId: true },
        });

        const membershipPersonIds = memberships.map((m) => m.personId);
        const personIds = Array.from(new Set([...teacherPersonIds, ...membershipPersonIds]));
        deletedCount = personIds.length;

        await tx.teacherProfile.updateMany({
          where: { deletedAt: null },
          data: { deletedAt: now },
        });

        await tx.organizationMembership.updateMany({
          where: {
            deletedAt: null,
            role: { contains: "Mustahiq", mode: "insensitive" },
          },
          data: { deletedAt: now },
        });

        await tx.person.updateMany({
          where: { id: { in: personIds }, deletedAt: null },
          data: { deletedAt: now },
        });
      } else if (category === "mufattisy") {
        categoryLabel = "Mufattisy (Dewan Pengawas)";
        const memberships = await tx.organizationMembership.findMany({
          where: {
            deletedAt: null,
            OR: [
              { role: { contains: "Mufattisy", mode: "insensitive" } },
              { role: { contains: "Mufatish", mode: "insensitive" } },
            ],
          },
          select: { id: true, personId: true },
        });

        const personIds = Array.from(new Set(memberships.map((m) => m.personId)));
        deletedCount = personIds.length;

        await tx.organizationMembership.updateMany({
          where: {
            deletedAt: null,
            OR: [
              { role: { contains: "Mufattisy", mode: "insensitive" } },
              { role: { contains: "Mufatish", mode: "insensitive" } },
            ],
          },
          data: { deletedAt: now },
        });

        await tx.person.updateMany({
          where: { id: { in: personIds }, deletedAt: null },
          data: { deletedAt: now },
        });
      } else if (category === "mundzir") {
        categoryLabel = "Mundzir (Pimpinan)";
        const memberships = await tx.organizationMembership.findMany({
          where: {
            deletedAt: null,
            role: { contains: "Mundzir", mode: "insensitive" },
          },
          select: { id: true, personId: true },
        });

        const personIds = Array.from(new Set(memberships.map((m) => m.personId)));
        deletedCount = personIds.length;

        await tx.organizationMembership.updateMany({
          where: {
            deletedAt: null,
            role: { contains: "Mundzir", mode: "insensitive" },
          },
          data: { deletedAt: now },
        });

        await tx.person.updateMany({
          where: { id: { in: personIds }, deletedAt: null },
          data: { deletedAt: now },
        });
      } else if (category === "pengurus" || category === "dewan_pleno" || category === "dewan_harian") {
        categoryLabel = category === "dewan_harian" ? "Dewan Harian" : category === "dewan_pleno" ? "Dewan Pleno" : "Pengurus";
        const memberships = await tx.organizationMembership.findMany({
          where: {
            deletedAt: null,
            NOT: [
              { role: { contains: "Mustahiq", mode: "insensitive" } },
              { role: { contains: "Mufattisy", mode: "insensitive" } },
              { role: { contains: "Mufatish", mode: "insensitive" } },
              { role: { contains: "Mundzir", mode: "insensitive" } },
            ],
          },
          select: { id: true, personId: true },
        });

        const personIds = Array.from(new Set(memberships.map((m) => m.personId)));
        deletedCount = personIds.length;

        await tx.organizationMembership.updateMany({
          where: {
            deletedAt: null,
            NOT: [
              { role: { contains: "Mustahiq", mode: "insensitive" } },
              { role: { contains: "Mufattisy", mode: "insensitive" } },
              { role: { contains: "Mufatish", mode: "insensitive" } },
              { role: { contains: "Mundzir", mode: "insensitive" } },
            ],
          },
          data: { deletedAt: now },
        });

        await tx.person.updateMany({
          where: { id: { in: personIds }, deletedAt: null },
          data: { deletedAt: now },
        });
      } else {
        return NextResponse.json(
          { status: "Error", message: "Kategori pembersihan data tidak valid." },
          { status: 400 }
        );
      }
    });

    const session = await getSessionFromCookies();
    if (session) {
      await createAuditLog({
        userId: session.username || "admin",
        action: "DELETE",
        entity: "SYSTEM_CONFIG_PURGE",
        afterState: { category: categoryLabel, deletedCount },
      });
    }

    return NextResponse.json({
      status: "Success",
      message: `Seluruh data ${categoryLabel} (${deletedCount} data) berhasil dihapus dari sistem.`,
      deletedCount,
    });
  } catch (err: any) {
    console.error("ADMIN_PURGE_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
