import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || undefined;
    const role = searchParams.get("role") || undefined;
    const statusTab = searchParams.get("status") || undefined;
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (role === "student" || role === "santri") {
      const isUnassignedTab = statusTab === "tanpa_kelas" || statusTab === "unassigned";
      
      const whereCondition = {
        deletedAt: null,
        person: { deletedAt: null },
        ...(isUnassignedTab
          ? { enrollments: { none: { deletedAt: null } } }
          : statusTab && statusTab !== "all" && statusTab !== "aktif"
          ? { status: statusTab.toUpperCase() }
          : statusTab === "aktif"
          ? { status: "ACTIVE" }
          : {}),
        ...(query
          ? {
              OR: [
                { person: { fullName: { contains: query, mode: "insensitive" as const } } },
                { stambukNumber: { contains: query, mode: "insensitive" as const } },
                { nis: { contains: query, mode: "insensitive" as const } },
              ],
            }
          : {}),
      };

      const [total, list] = await Promise.all([
        prisma.studentProfile.count({ where: whereCondition }),
        prisma.studentProfile.findMany({
          where: whereCondition,
          take: limit,
          skip: offset,
          include: {
            person: {
              include: {
                guardianProfiles: {
                  include: { person: true },
                },
              },
            },
            room: {
              include: { supervisor: true },
            },
            enrollments: {
              where: { deletedAt: null },
              include: {
                academicClass: {
                  include: { mustahiq: true },
                },
              },
              take: 1,
            },
          } as any,
        }),
      ]);

      const formatted = (list as any[]).map((sp: any) => {
        const primaryEnrollment = sp.enrollments?.[0];
        const primaryGuardian = sp.person?.guardianProfiles?.[0];
        return {
          id: sp.id,
          personId: sp.personId,
          name: sp.person?.fullName || "-",
          stambuk: sp.stambukNumber,
          nis: sp.nis,
          nisn: sp.nisn,
          nik: sp.person?.nik || "-",
          class: primaryEnrollment?.academicClass?.name || "-",
          mustahiq: primaryEnrollment?.academicClass?.mustahiq?.fullName || "-",
          mufattisy: "-",
          roomName: sp.room?.name || "-",
          buildingName: sp.room?.buildingName || "-",
          roomSupervisor: sp.room?.supervisor?.fullName || "-",
          address: sp.person?.address || "-",
          status: sp.status,
          gender: sp.person?.gender || "P",
          birthPlace: sp.person?.birthPlace,
          birthDate: sp.person?.birthDate,
          phoneNumber: sp.person?.phoneNumber,
          avatarUrl: sp.person?.avatarUrl,
          enrollmentYear: sp.enrollmentYear,
          guardianName: primaryGuardian?.person?.fullName || "-",
          guardianPhone: primaryGuardian?.person?.phoneNumber || "-",
          guardianRelation: primaryGuardian?.relation || "WALI",
          familyCardNumber: primaryGuardian?.familyCardNumber || "-",
        };
      });

      return NextResponse.json({ status: "Success", data: formatted, total });
    }

    if (role === "pengurus") {
      const whereCondition = {
        deletedAt: null,
        person: { deletedAt: null },
        ...(query
          ? {
              OR: [
                { person: { fullName: { contains: query, mode: "insensitive" as const } } },
                { role: { contains: query, mode: "insensitive" as const } },
              ],
            }
          : {}),
      };

      const [total, list] = await Promise.all([
        prisma.organizationMembership.count({ where: whereCondition }),
        prisma.organizationMembership.findMany({
          where: whereCondition,
          take: limit,
          skip: offset,
          include: {
            person: true,
          },
        }),
      ]);

      const formatted = list.map((om: any) => ({
        id: om.id,
        personId: om.personId,
        name: om.person.fullName,
        role: om.role,
        supervisedLevel: om.supervisedLevel,
        phone: om.person.phoneNumber,
        status: om.status,
        gender: om.person.gender,
        avatarUrl: om.person.avatarUrl,
      }));

      return NextResponse.json({ status: "Success", data: formatted, total });
    }

    if (role === "teacher") {
      const whereCondition = {
        deletedAt: null,
        person: { deletedAt: null },
        ...(query
          ? {
              OR: [
                { person: { fullName: { contains: query, mode: "insensitive" as const } } },
                { teacherCode: { contains: query, mode: "insensitive" as const } },
              ],
            }
          : {}),
      };

      const [total, list] = await Promise.all([
        prisma.teacherProfile.count({ where: whereCondition }),
        prisma.teacherProfile.findMany({
          where: whereCondition,
          take: limit,
          skip: offset,
          include: {
            person: true,
          },
        }),
      ]);

      const formatted = list.map((tp: any) => ({
        id: tp.id,
        personId: tp.personId,
        name: tp.person.fullName,
        teacherCode: tp.teacherCode,
        nik: tp.person.nik,
        phone: tp.person.phoneNumber,
        status: tp.status,
        gender: tp.person.gender,
        avatarUrl: tp.person.avatarUrl,
      }));

      return NextResponse.json({ status: "Success", data: formatted, total });
    }

    // People who don't have a UserAccount yet (for Generate Akun tab)
    if (role === "without_account") {
      const people = await (prisma.person as any).findMany({
        where: {
          deletedAt: null,
          userAccount: { is: null }, // No account yet
        },
        include: {
          teacherProfile: true,
          organizationMemberships: { take: 1 },
          mustahiqClasses: { take: 1 },
        },
        take: limit,
        skip: offset,
      });

      const total = await prisma.person.count({
        where: {
          deletedAt: null,
          userAccount: { is: null },
        },
      });

      const formatted = people.map((p: any) => {
        // Determine suggested role based on profiles
        let suggestedRole = "Mustahiq";
        if (p.mustahiqClasses && p.mustahiqClasses.length > 0) {
          suggestedRole = "Mustahiq";
        } else if (p.teacherProfile) {
          suggestedRole = "Mustahiq"; // teachers who teach are Mustahiq
        } else if (p.organizationMemberships && p.organizationMemberships.length > 0) {
          const orgRole = p.organizationMemberships[0].role;
          if (orgRole === "MUNDZIR" || orgRole === "Mundzir") {
            suggestedRole = "Mundzir";
          } else if (orgRole === "MUFATTISY" || orgRole === "Mufattisy") {
            suggestedRole = "Mufattisy";
          } else {
            suggestedRole = "sek.pondok";
          }
        }

        return {
          id: p.id,
          fullName: p.fullName,
          gender: p.gender || "P",
          suggestedRole,
        };
      });

      return NextResponse.json({ status: "Success", data: formatted, total });
    }

    if (role === "guardian") {

      const whereCondition = {
        deletedAt: null,
        person: { deletedAt: null },
        ...(query
          ? {
              OR: [
                { person: { fullName: { contains: query, mode: "insensitive" as const } } },
                { familyCardNumber: { contains: query, mode: "insensitive" as const } },
              ],
            }
          : {}),
      };

      const [total, list] = await Promise.all([
        prisma.guardianProfile.count({ where: whereCondition }),
        prisma.guardianProfile.findMany({
          where: whereCondition,
          take: limit,
          skip: offset,
          include: {
            person: true,
          },
        }),
      ]);

      const formatted = list.map((gp: any) => ({
        id: gp.id,
        familyCardNumber: gp.familyCardNumber,
        guardianName: gp.person.fullName,
        phone: gp.person.phoneNumber,
        relation: gp.relation,
        nik: gp.person.nik,
      }));

      return NextResponse.json({ status: "Success", data: formatted, total });
    }

    // Default: General People query
    const whereCondition = {
      deletedAt: null,
      ...(query
        ? {
            OR: [
              { fullName: { contains: query, mode: "insensitive" as const } },
              { nik: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [total, list] = await Promise.all([
      prisma.person.count({ where: whereCondition }),
      prisma.person.findMany({
        where: whereCondition,
        take: limit,
        skip: offset,
      }),
    ]);

    return NextResponse.json({ status: "Success", data: list, total });
  } catch (err: any) {
    console.error("PEOPLE_GET_PRISMA_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      fullName,
      nik,
      gender = "L",
      birthPlace,
      birthDate,
      address,
      phoneNumber,
      stambuk,
      nis,
      nisn,
      enrollmentYear = new Date().getFullYear(),
      guardianName,
      guardianPhone,
      guardianRelation = "WALI",
      familyCardNumber,
      class: className,
      classId,
    } = body;

    const personFullName = name || fullName;
    if (!personFullName) {
      return NextResponse.json(
        { status: "Error", message: "Nama lengkap wajib diisi." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Person
      const person = await tx.person.create({
        data: {
          fullName: personFullName,
          nik,
          gender,
          birthPlace,
          birthDate,
          address,
          phoneNumber,
        },
      });

      // 2. Create StudentProfile if stambuk/nis specified or role is student
      let studentProfile = null;
      if (stambuk || nis || className || classId) {
        studentProfile = await tx.studentProfile.create({
          data: {
            personId: person.id,
            stambukNumber: stambuk || `STB-${Date.now()}`,
            nis: nis || `NIS-${Date.now()}`,
            nisn: nisn || null,
            enrollmentYear: Number(enrollmentYear),
            status: "ACTIVE",
          },
        });

        // 2b. Assign to AcademicClass if specified
        let targetClass = null;
        if (classId) {
          targetClass = await tx.academicClass.findFirst({
            where: { id: classId, deletedAt: null },
          });
        } else if (className && className !== "Belum Ditentukan") {
          targetClass = await tx.academicClass.findFirst({
            where: {
              OR: [{ name: className }, { fullName: className }],
              deletedAt: null,
            },
          });
        }

        if (targetClass && studentProfile) {
          await tx.classEnrollment.create({
            data: {
              classId: targetClass.id,
              studentId: studentProfile.id,
              status: "ACTIVE",
            },
          });
        }
      }

      // 3. Create Guardian if guardian information provided
      if (familyCardNumber || guardianName) {
        let guardianPerson = person;
        if (guardianName && guardianName !== personFullName) {
          guardianPerson = await tx.person.create({
            data: {
              fullName: guardianName,
              gender: guardianRelation === "IBU" ? "P" : "L",
              phoneNumber: guardianPhone || null,
            },
          });
        }

        await tx.guardianProfile.create({
          data: {
            personId: guardianPerson.id,
            familyCardNumber: familyCardNumber || `KK-${Date.now()}`,
            relation: guardianRelation,
          },
        });
      }

      return { person, studentProfile };
    });

    return NextResponse.json({
      status: "Success",
      message: "Data orang/santri berhasil ditambahkan.",
      data: result,
    });
  } catch (err: any) {
    console.error("PEOPLE_POST_PRISMA_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
