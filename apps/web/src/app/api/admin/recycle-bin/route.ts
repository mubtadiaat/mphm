import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function formatIndonesianDateTime(dateInput: Date | string | null): string {
  if (!dateInput) return "-";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "-";
  
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  };
  return new Intl.DateTimeFormat("id-ID", options).format(date) + " WIB";
}

function calculateExpiresAt(deletedAtInput: Date | string | null): string {
  if (!deletedAtInput) return "Permanen";
  const deletedTime = new Date(deletedAtInput).getTime();
  const expireTime = deletedTime + (48 * 60 * 60 * 1000);
  const now = Date.now();
  const diffMs = expireTime - now;

  if (diffMs <= 0) return "Otomatis Terhapus Permanen";
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours} Jam ${mins} Menit Tersisa`;
}

export async function GET(req: NextRequest) {
  try {
    const deletedPeople = await prisma.person.findMany({
      where: { deletedAt: { not: null } },
      include: {
        studentProfile: true,
        teacherProfile: true,
        organizationMemberships: true,
      },
      orderBy: { deletedAt: "desc" },
    });

    const deletedUsers = await prisma.userAccount.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    });

    const deletedClasses = await prisma.academicClass.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    });

    const items = [
      ...deletedPeople.map((p) => {
        let type = "TIPE DATA LAIN";
        if (p.studentProfile) {
          type = "SANTRIWATI / SISWI";
        } else if (p.teacherProfile) {
          type = "MUSTAHIQ";
        } else if (p.organizationMemberships && p.organizationMemberships.length > 0) {
          const rolesStr = p.organizationMemberships.map((m) => m.role).join(" ");
          if (/mufat/i.test(rolesStr)) type = "MUFATISH";
          else if (/mundzir/i.test(rolesStr)) type = "MUNDZIR";
          else type = "PENGURUS";
        }

        return {
          id: p.id,
          entityType: "Person",
          type,
          name: p.fullName,
          deletedAt: formatIndonesianDateTime(p.deletedAt),
          expiresAt: calculateExpiresAt(p.deletedAt),
          rawDeletedAt: p.deletedAt,
        };
      }),
      ...deletedUsers.map((u) => ({
        id: u.id,
        entityType: "UserAccount",
        type: "AKUN USER",
        name: u.username,
        deletedAt: formatIndonesianDateTime(u.deletedAt),
        expiresAt: calculateExpiresAt(u.deletedAt),
        rawDeletedAt: u.deletedAt,
      })),
      ...deletedClasses.map((c) => ({
        id: c.id,
        entityType: "AcademicClass",
        type: "KELAS / ROMBEL",
        name: c.fullName || c.name,
        deletedAt: formatIndonesianDateTime(c.deletedAt),
        expiresAt: calculateExpiresAt(c.deletedAt),
        rawDeletedAt: c.deletedAt,
      })),
    ];

    items.sort((a, b) => new Date(b.rawDeletedAt || 0).getTime() - new Date(a.rawDeletedAt || 0).getTime());

    return NextResponse.json({ status: "Success", data: items });
  } catch (err: any) {
    console.error("RECYCLE_BIN_GET_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const [peopleResult, usersResult, classesResult] = await prisma.$transaction([
      prisma.person.deleteMany({ where: { deletedAt: { not: null } } }),
      prisma.userAccount.deleteMany({ where: { deletedAt: { not: null } } }),
      prisma.academicClass.deleteMany({ where: { deletedAt: { not: null } } }),
    ]);

    const totalPurged = (peopleResult.count || 0) + (usersResult.count || 0) + (classesResult.count || 0);

    return NextResponse.json({
      status: "Success",
      message: `Keranjang sampah berhasil dikosongkan. Total ${totalPurged} data dihapus permanen.`,
      purgedCount: totalPurged,
    });
  } catch (err: any) {
    console.error("RECYCLE_BIN_EMPTY_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const [peopleResult, usersResult, classesResult] = await prisma.$transaction([
      prisma.person.updateMany({ where: { deletedAt: { not: null } }, data: { deletedAt: null } }),
      prisma.userAccount.updateMany({ where: { deletedAt: { not: null } }, data: { deletedAt: null } }),
      prisma.academicClass.updateMany({ where: { deletedAt: { not: null } }, data: { deletedAt: null } }),
    ]);

    const totalRestored = (peopleResult.count || 0) + (usersResult.count || 0) + (classesResult.count || 0);

    return NextResponse.json({
      status: "Success",
      message: `Seluruh data di keranjang sampah (${totalRestored} data) berhasil dipulihkan ke sistem aktif.`,
      restoredCount: totalRestored,
    });
  } catch (err: any) {
    console.error("RECYCLE_BIN_RESTORE_ALL_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
