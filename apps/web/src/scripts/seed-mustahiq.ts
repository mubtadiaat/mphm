import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  const { prisma } = await import("../lib/prisma");

  console.log("🌱 Seeding complete dummy data for Mustahiq, Classes, Students, and Subjects into Neon Database...");

  // 1. Create or ensure Active Academic Year
  let activeYear = await prisma.academicYear.findFirst({
    where: { isActive: true, deletedAt: null },
  });

  if (!activeYear) {
    activeYear = await prisma.academicYear.create({
      data: {
        name: "2026/2027",
        isActive: true,
        startDate: "2026-07-01",
        endDate: "2027-06-30",
      },
    });
  }

  // 2. Create Subjects (Mapel Diniyyah)
  const subjectsData = [
    { code: "FQ-01", name: "Fathul Qorib (Fiqih)", subjectType: "MAPEL" },
    { code: "NAH-01", name: "Alfiyyah Ibn Malik (Nahwu)", subjectType: "MAPEL" },
    { code: "TF-01", name: "Tafsir Jalalain (Tafsir)", subjectType: "MAPEL" },
    { code: "AKH-01", name: "Ta'lim Muta'allim (Akhlaq)", subjectType: "MAPEL" },
    { code: "HD-01", name: "Bulughul Maram (Hadits)", subjectType: "MAPEL" },
  ];

  const subjects = [];
  for (const s of subjectsData) {
    let sub = await prisma.subject.findUnique({ where: { code: s.code } });
    if (!sub) {
      sub = await prisma.subject.create({ data: s });
    }
    subjects.push(sub);
  }

  // 3. Create Mustahiq Person & UserAccount
  let mustahiqPerson = await prisma.person.findFirst({
    where: { userAccount: { role: "mustahiq" } },
  });

  if (!mustahiqPerson) {
    mustahiqPerson = await prisma.person.create({
      data: {
        fullName: "Ust. Ahmad Mustahiq, S.Pd.I",
        gender: "L",
        phoneNumber: "081234567890",
        address: "Lirboyo, Kota Kediri",
      },
    });

    await prisma.userAccount.create({
      data: {
        personId: mustahiqPerson.id,
        username: "mustahiq",
        email: "mustahiq@mphm.id",
        passwordHash: "dummy_password_hash",
        role: "mustahiq",
        status: "ACTIVE",
      },
    });
  }

  // 4. Create Academic Class (1 Ibtida'iyyah A)
  let activeClass = await prisma.academicClass.findFirst({
    where: { academicYearId: activeYear.id, deletedAt: null },
  });

  if (!activeClass) {
    activeClass = await prisma.academicClass.create({
      data: {
        academicYearId: activeYear.id,
        name: "1 Ibtida'iyyah A",
        fullName: "1 Ibtida'iyyah A [MPHM Lirboyo]",
        institutionLevel: "IBTIDAIYYAH",
        levelNumber: 1,
        mustahiqId: mustahiqPerson.id,
      },
    });
  } else if (!activeClass.mustahiqId) {
    activeClass = await prisma.academicClass.update({
      where: { id: activeClass.id },
      data: { mustahiqId: mustahiqPerson.id },
    });
  }

  // 5. Create 10 Siswi (Student Profiles)
  const siswiList = [
    { name: "Ning Fatimah Az-Zahra", stambuk: "P3HM-2026-001", nis: "202601001" },
    { name: "Khadijah Al-Kubro", stambuk: "P3HM-2026-002", nis: "202601002" },
    { name: "Aisha An-Nisa", stambuk: "P3HM-2026-003", nis: "202601003" },
    { name: "Maryam Binti Imran", stambuk: "P3HM-2026-004", nis: "202601004" },
    { name: "Asiyah Binti Muzahim", stambuk: "P3HM-2026-005", nis: "202601005" },
    { name: "Ruqayyah Binti Rasulullah", stambuk: "P3HM-2026-006", nis: "202601006" },
    { name: "Ummi Kalsum", stambuk: "P3HM-2026-007", nis: "202601007" },
    { name: "Shafiyyah Binti Huyai", stambuk: "P3HM-2026-008", nis: "202601008" },
    { name: "Hafshah Binti Umar", stambuk: "P3HM-2026-009", nis: "202601009" },
    { name: "Zaynab Binti Jahsh", stambuk: "P3HM-2026-010", nis: "202601010" },
  ];

  for (const s of siswiList) {
    let student = await prisma.studentProfile.findUnique({ where: { nis: s.nis } });
    if (!student) {
      const person = await prisma.person.create({
        data: {
          fullName: s.name,
          gender: "P",
          birthPlace: "Kediri",
          birthDate: "2010-05-15",
          address: "Pondok Pesantren Lirboyo",
        },
      });

      student = await prisma.studentProfile.create({
        data: {
          personId: person.id,
          stambukNumber: s.stambuk,
          nis: s.nis,
          enrollmentYear: 2026,
          status: "ACTIVE",
        },
      });
    }

    // Ensure Enrollment in class
    const existingEnrollment = await prisma.classEnrollment.findUnique({
      where: {
        classId_studentId: {
          classId: activeClass.id,
          studentId: student.id,
        },
      },
    });

    if (!existingEnrollment) {
      await prisma.classEnrollment.create({
        data: {
          classId: activeClass.id,
          studentId: student.id,
          status: "ACTIVE",
        },
      });
    }

    // Pre-populate Kwartal 1 initial scores for testing
    for (const sub of subjects) {
      const existingScore = await prisma.studentScore.findUnique({
        where: {
          classId_studentId_subjectId_kwartal: {
            classId: activeClass.id,
            studentId: student.id,
            subjectId: sub.id,
            kwartal: 1,
          },
        },
      });

      if (!existingScore) {
        await prisma.studentScore.create({
          data: {
            classId: activeClass.id,
            studentId: student.id,
            subjectId: sub.id,
            kwartal: 1,
            score: Math.floor(Math.random() * 20 + 75) / 10, // 7.5 - 9.5
          },
        });
      }
    }
  }

  console.log("✅ Seed completed successfully into Neon DB! Active Class:", activeClass.fullName);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Seed error:", e);
  process.exit(1);
});
