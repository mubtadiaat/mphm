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

function matchPersonInstitution(p: any, targetInst: "PONDOK" | "MADRASAH" | null): boolean {
  if (!targetInst) return true;
  if (targetInst === "PONDOK") {
    if (p.studentProfile && (p.studentProfile.residenceType === "PONDOK_MUBTADIAAT" || p.studentProfile.roomId)) return true;
    if (p.organizationMemberships?.some((m: any) => m.institution === "PONDOK" || m.institution === "ALL")) return true;
    if (p.userAccount && (p.userAccount.institution === "PONDOK" || p.userAccount.role?.includes("pondok"))) return true;
    return false;
  } else {
    if (p.teacherProfile) return true;
    if (p.studentProfile && (p.studentProfile.residenceType === "UNIT_LAIN" || p.studentProfile.nisn || p.studentProfile.currentClassId)) return true;
    if (p.organizationMemberships?.some((m: any) => m.institution === "MADRASAH" || m.institution === "ALL")) return true;
    if (p.userAccount && (p.userAccount.institution === "MADRASAH" || p.userAccount.role?.includes("madrasah") || p.userAccount.role === "mustahiq")) return true;
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    await cleanOrphanedGuardians();
    const scope = req.nextUrl.searchParams.get("scope");
    const targetInst = scope === "pondok" ? "PONDOK" : scope === "madrasah" ? "MADRASAH" : null;

    const deletedPeople = await prisma.person.findMany({
      where: { deletedAt: { not: null } },
      include: {
        studentProfile: true,
        teacherProfile: true,
        organizationMemberships: true,
        userAccount: true,
      },
      orderBy: { deletedAt: "desc" },
    });

    const deletedClasses = targetInst === "PONDOK" ? [] : await prisma.academicClass.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    });

    const filteredPeople = deletedPeople.filter((p) => matchPersonInstitution(p, targetInst));

    const items = [
      ...filteredPeople.map((p) => {
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
    const scope = req.nextUrl.searchParams.get("scope");
    const targetInst = scope === "pondok" ? "PONDOK" : scope === "madrasah" ? "MADRASAH" : null;

    let totalPurged = 0;

    await prisma.$transaction(async (tx) => {
      // 1. Find all deleted Person IDs matching target inst
      const deletedPeople = await tx.person.findMany({
        where: { deletedAt: { not: null } },
        include: {
          studentProfile: true,
          teacherProfile: true,
          organizationMemberships: true,
          userAccount: true,
        },
      });
      
      const targetPeople = deletedPeople.filter(p => matchPersonInstitution(p, targetInst));
      const personIds = targetPeople.map((p) => p.id);

      if (personIds.length > 0) {
        // Find associated StudentProfiles
        const students = await tx.studentProfile.findMany({
          where: { personId: { in: personIds } },
          select: { id: true },
        });
        const studentIds = students.map((s) => s.id);

        if (studentIds.length > 0) {
          await tx.classEnrollment.deleteMany({
            where: { studentId: { in: studentIds } },
          });
          await tx.studentProfile.deleteMany({
            where: { id: { in: studentIds } },
          });
        }

        await tx.teacherProfile.deleteMany({
          where: { personId: { in: personIds } },
        });

        await tx.guardianProfile.deleteMany({
          where: { personId: { in: personIds } },
        });

        await tx.organizationMembership.deleteMany({
          where: { personId: { in: personIds } },
        });

        await tx.userAccount.deleteMany({
          where: { personId: { in: personIds } },
        });

        const pRes = await tx.person.deleteMany({
          where: { id: { in: personIds } },
        });

        totalPurged += pRes.count || personIds.length;
      }

      // 2. Delete remaining deleted UserAccounts matching inst
      const userWhere: any = { deletedAt: { not: null } };
      if (targetInst) {
        userWhere.institution = targetInst;
      }
      const uRes = await tx.userAccount.deleteMany({
        where: userWhere,
      });
      totalPurged += uRes.count || 0;

      // 3. Delete remaining deleted AcademicClasses (only if Madrasah or null)
      if (targetInst !== "PONDOK") {
        const cRes = await tx.academicClass.deleteMany({
          where: { deletedAt: { not: null } },
        });
        totalPurged += cRes.count || 0;
      }
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
    const scope = req.nextUrl.searchParams.get("scope");
    const targetInst = scope === "pondok" ? "PONDOK" : scope === "madrasah" ? "MADRASAH" : null;

    let totalRestored = 0;

    await prisma.$transaction(async (tx) => {
      const deletedPeople = await tx.person.findMany({
        where: { deletedAt: { not: null } },
        include: {
          studentProfile: true,
          teacherProfile: true,
          organizationMemberships: true,
          userAccount: true,
        },
      });

      const targetPeople = deletedPeople.filter(p => matchPersonInstitution(p, targetInst));
      const personIds = targetPeople.map(p => p.id);

      if (personIds.length > 0) {
        const pRes = await tx.person.updateMany({
          where: { id: { in: personIds } },
          data: { deletedAt: null },
        });
        totalRestored += pRes.count;
      }

      const userWhere: any = { deletedAt: { not: null } };
      if (targetInst) {
        userWhere.institution = targetInst;
      }
      const uRes = await tx.userAccount.updateMany({
        where: userWhere,
        data: { deletedAt: null },
      });
      totalRestored += uRes.count;

      if (targetInst !== "PONDOK") {
        const cRes = await tx.academicClass.updateMany({
          where: { deletedAt: { not: null } },
          data: { deletedAt: null },
        });
        totalRestored += cRes.count;
      }
    });

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
