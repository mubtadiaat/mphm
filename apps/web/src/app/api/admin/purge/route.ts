import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/jwt";
import { createAuditLog } from "@/lib/auditLog";
import { cleanOrphanedGuardians } from "@/lib/cleanGuardians";
import { requireAuthSession } from "@/lib/apiGuard";

export async function POST(req: NextRequest) {
  try {
    const { session, errorResponse } = await requireAuthSession(req, ["sek", "admin", "superadmin"]);
    if (errorResponse) return errorResponse;

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
        categoryLabel = "Santriwati / Siswi & Wali Terkait";
        const students = await tx.studentProfile.findMany({
          where: { deletedAt: null },
          select: { id: true, personId: true },
        });

        const studentPersonIds = Array.from(new Set(students.map((s) => s.personId)));

        // Find all active GuardianProfiles
        const activeGuardians = await tx.guardianProfile.findMany({
          where: { deletedAt: null },
          select: { id: true, personId: true },
        });

        const guardianPersonIds = Array.from(new Set(activeGuardians.map((g) => g.personId)));
        const allPersonIds = Array.from(new Set([...studentPersonIds, ...guardianPersonIds]));
        deletedCount = studentPersonIds.length;

        // Soft delete StudentProfile
        await tx.studentProfile.updateMany({
          where: { deletedAt: null },
          data: { deletedAt: now },
        });

        // Soft delete GuardianProfile
        await tx.guardianProfile.updateMany({
          where: { deletedAt: null },
          data: { deletedAt: now },
        });

        // Soft delete UserAccounts for Wali
        if (guardianPersonIds.length > 0) {
          await tx.userAccount.updateMany({
            where: { personId: { in: guardianPersonIds }, deletedAt: null },
            data: { deletedAt: now, status: "INACTIVE" },
          });
        }

        // Soft delete Person for both Santri and Wali
        await tx.person.updateMany({
          where: { id: { in: allPersonIds }, deletedAt: null },
          data: { deletedAt: now },
        });
      } else if (category === "wali" || category === "guardian") {
        categoryLabel = "Wali Santri";
        const guardians = await tx.guardianProfile.findMany({
          where: { deletedAt: null },
          select: { id: true, personId: true },
        });

        const guardianPersonIds = Array.from(new Set(guardians.map((g) => g.personId)));
        deletedCount = guardianPersonIds.length;

        await tx.guardianProfile.updateMany({
          where: { deletedAt: null },
          data: { deletedAt: now },
        });

        if (guardianPersonIds.length > 0) {
          await tx.userAccount.updateMany({
            where: { personId: { in: guardianPersonIds }, deletedAt: null },
            data: { deletedAt: now, status: "INACTIVE" },
          });

          await tx.person.updateMany({
            where: { id: { in: guardianPersonIds }, deletedAt: null },
            data: { deletedAt: now },
          });
        }
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
      } else if (category === "class" || category === "kelas" || category === "rombel") {
        categoryLabel = "Data Kelas Diniyyah / Rombel";
        const classes = await tx.academicClass.findMany({
          where: { deletedAt: null },
          select: { id: true },
        });
        deletedCount = classes.length;

        await tx.classEnrollment.updateMany({
          where: { deletedAt: null },
          data: { deletedAt: now },
        });

        await tx.academicClass.updateMany({
          where: { deletedAt: null },
          data: { deletedAt: now },
        });
      } else if (category === "room" || category === "kamar" || category === "asrama") {
        categoryLabel = "Data Kamar / Asrama";
        const rooms = await (tx as any).room.findMany({
          where: { deletedAt: null },
          select: { id: true },
        });
        deletedCount = rooms.length;

        await tx.studentProfile.updateMany({
          where: { roomId: { not: null }, deletedAt: null },
          data: { roomId: null },
        });

        await (tx as any).room.updateMany({
          where: { deletedAt: null },
          data: { deletedAt: now },
        });
      } else if (category === "subject" || category === "mapel") {
        categoryLabel = "Mata Pelajaran & Kurikulum";
        const subjects = await tx.subject.findMany({ where: { deletedAt: null }, select: { id: true } });
        deletedCount = subjects.length;

        await tx.curriculumSubject.deleteMany({});
        await tx.subject.updateMany({ where: { deletedAt: null }, data: { deletedAt: now } });
        await tx.curriculum.updateMany({ where: { deletedAt: null }, data: { deletedAt: now } });
      } else if (category === "violation" || category === "pelanggaran") {
        categoryLabel = "Catatan Pelanggaran Santri";
        const violations = await tx.studentViolation.findMany({ where: { deletedAt: null }, select: { id: true } });
        deletedCount = violations.length;

        await tx.studentViolation.updateMany({ where: { deletedAt: null }, data: { deletedAt: now } });
      } else if (category === "certificate" || category === "sertifikat" || category === "ijazah") {
        categoryLabel = "Sertifikat & Ijazah Santri";
        const certs = await tx.academicCertificate.findMany({ where: { deletedAt: null }, select: { id: true } });
        deletedCount = certs.length;

        await tx.academicCertificate.updateMany({ where: { deletedAt: null }, data: { deletedAt: now } });
      } else if (category === "khidmah") {
        categoryLabel = "Data Khidmah Alumni";
        const prismaKhidmah = (tx as any).khidmahAssignment || (tx as any).khidmah_assignment;
        if (prismaKhidmah) {
          const khs = await prismaKhidmah.findMany({ where: { deletedAt: null }, select: { id: true } });
          deletedCount = khs.length;
          await prismaKhidmah.updateMany({ where: { deletedAt: null }, data: { deletedAt: now } });
        } else {
          const alumni = await tx.alumniRecord.findMany({ where: { deletedAt: null }, select: { id: true } });
          deletedCount = alumni.length;
          await tx.alumniRecord.updateMany({ where: { deletedAt: null }, data: { deletedAt: now } });
        }
      } else if (category === "all" || category === "semua") {
        categoryLabel = "SEMUA DATA MASTER & OPERASIONAL SISTEM";

        const [stCount, rmCount, clCount] = await Promise.all([
          tx.studentProfile.count({ where: { deletedAt: null } }),
          (tx as any).room ? (tx as any).room.count({ where: { deletedAt: null } }) : Promise.resolve(0),
          tx.academicClass.count({ where: { deletedAt: null } }),
        ]);
        deletedCount = stCount + rmCount + clCount;

        await tx.classEnrollment.updateMany({ where: { deletedAt: null }, data: { deletedAt: now } });
        await tx.studentViolation.updateMany({ where: { deletedAt: null }, data: { deletedAt: now } });
        await tx.academicCertificate.updateMany({ where: { deletedAt: null }, data: { deletedAt: now } });
        await tx.studentProfile.updateMany({ where: { deletedAt: null }, data: { deletedAt: now } });
        await tx.guardianProfile.updateMany({ where: { deletedAt: null }, data: { deletedAt: now } });
        if ((tx as any).room) await (tx as any).room.updateMany({ where: { deletedAt: null }, data: { deletedAt: now } });
        await tx.academicClass.updateMany({ where: { deletedAt: null }, data: { deletedAt: now } });
        await tx.teacherProfile.updateMany({ where: { deletedAt: null }, data: { deletedAt: now } });
        await tx.organizationMembership.updateMany({ where: { deletedAt: null }, data: { deletedAt: now } });
        await tx.subject.updateMany({ where: { deletedAt: null }, data: { deletedAt: now } });
        await tx.curriculum.updateMany({ where: { deletedAt: null }, data: { deletedAt: now } });
        
        // Disable non-admin user accounts
        await tx.userAccount.updateMany({
          where: {
            deletedAt: null,
            NOT: [
              { role: { contains: "sek", mode: "insensitive" } },
              { role: { contains: "admin", mode: "insensitive" } },
            ],
          },
          data: { deletedAt: now, status: "INACTIVE" },
        });
      } else {
        return NextResponse.json(
          { status: "Error", message: "Kategori pembersihan data tidak valid." },
          { status: 400 }
        );
      }
    });

    if (session) {
      await createAuditLog({
        userId: session.username || "admin",
        action: "DELETE",
        entity: "SYSTEM_CONFIG_PURGE",
        afterState: { category: categoryLabel, deletedCount },
      });
    }

    await cleanOrphanedGuardians();

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
