import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanOrphanedGuardians } from "@/lib/cleanGuardians";

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
    await cleanOrphanedGuardians();
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
    await cleanOrphanedGuardians();
    let totalPurged = 0;

    await prisma.$transaction(async (tx) => {
      // 1. Find all deleted Person IDs
      const deletedPeople = await tx.person.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true },
      });
      const personIds = deletedPeople.map((p) => p.id);

      if (personIds.length > 0) {
        // Find associated StudentProfiles
        const students = await tx.studentProfile.findMany({
          where: { personId: { in: personIds } },
          select: { id: true },
        });
        const studentIds = students.map((s) => s.id);

        if (studentIds.length > 0) {
          // Delete ClassEnrollments
          await tx.classEnrollment.deleteMany({
            where: { studentId: { in: studentIds } },
          });
          // Delete StudentProfiles
          await tx.studentProfile.deleteMany({
            where: { id: { in: studentIds } },
          });
        }

        // Delete TeacherProfiles
        await tx.teacherProfile.deleteMany({
          where: { personId: { in: personIds } },
        });

        // Delete GuardianProfiles
        await tx.guardianProfile.deleteMany({
          where: { personId: { in: personIds } },
        });

        // Delete OrganizationMemberships
        await tx.organizationMembership.deleteMany({
          where: { personId: { in: personIds } },
        });

        // Delete UserAccounts
        await tx.userAccount.deleteMany({
          where: { personId: { in: personIds } },
        });

        // Delete Persons
        const pRes = await tx.person.deleteMany({
          where: { id: { in: personIds } },
        });

        totalPurged += pRes.count || personIds.length;
      }

      // 2. Delete remaining deleted UserAccounts (standalone)
      const uRes = await tx.userAccount.deleteMany({
        where: { deletedAt: { not: null } },
      });
      totalPurged += uRes.count || 0;

      // 3. Delete remaining deleted AcademicClasses (standalone)
      const cRes = await tx.academicClass.deleteMany({
        where: { deletedAt: { not: null } },
      });
      totalPurged += cRes.count || 0;
    });

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
