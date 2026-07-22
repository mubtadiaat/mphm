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
      const whereCondition = {
        deletedAt: null,
        person: { deletedAt: null },
        ...(statusTab && statusTab !== "all" && statusTab !== "aktif"
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
            enrollments: {
              where: { deletedAt: null },
              include: { academicClass: true },
              take: 1,
            },
          } as any,
        }),
      ]);

      const formatted = list.map((sp: any) => {
        const primaryEnrollment = sp.enrollments[0];
        const primaryGuardian = sp.person.guardianProfiles[0];
        return {
          id: sp.id,
          personId: sp.personId,
          name: sp.person.fullName,
          stambuk: sp.stambukNumber,
          nis: sp.nis,
          nisn: sp.nisn,
          nik: sp.person.nik,
          class: primaryEnrollment?.academicClass?.name || "-",
          mustahiq: "-",
          mufattisy: "-",
          address: sp.person.address || "-",
          status: sp.status,
          gender: sp.person.gender,
          birthPlace: sp.person.birthPlace,
          birthDate: sp.person.birthDate,
          phoneNumber: sp.person.phoneNumber,
          avatarUrl: sp.person.avatarUrl,
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

      // 2. Create StudentProfile if stambuk/nis specified
      let studentProfile = null;
      if (stambuk || nis) {
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
