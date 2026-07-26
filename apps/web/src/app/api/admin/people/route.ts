import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/jwt";
import { cleanOrphanedGuardians } from "@/lib/cleanGuardians";

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
      let jenjangParam = searchParams.get("jenjang") || searchParams.get("level") || undefined;
      const classParam = searchParams.get("classFilter") || searchParams.get("class") || undefined;

      const session = await getSessionFromCookies();

      if ((!jenjangParam || jenjangParam === "ALL" || jenjangParam === "all") && session) {
        const userRoleLower = String(session.role || "").toLowerCase();
        if (userRoleLower.includes("mufat") || userRoleLower.includes("mundzir")) {
          let sup = session.supervisedLevel;
          if (!sup && session.personId) {
            const om = await prisma.organizationMembership.findFirst({
              where: { personId: session.personId, deletedAt: null },
            });
            sup = om?.supervisedLevel || null;
          }
          if (sup) {
            jenjangParam = sup;
          }
        }
      }
      
      const whereCondition: any = {
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

      if (jenjangParam && jenjangParam !== "all" && jenjangParam !== "ALL") {
        whereCondition.enrollments = {
          some: {
            deletedAt: null,
            academicClass: {
              institutionLevel: { contains: jenjangParam, mode: "insensitive" as const }
            }
          }
        };
      }

      if (classParam && classParam !== "all" && classParam !== "ALL") {
        whereCondition.enrollments = {
          ...whereCondition.enrollments,
          some: {
            ...(whereCondition.enrollments?.some || {}),
            deletedAt: null,
            academicClass: {
              name: { contains: classParam, mode: "insensitive" as const }
            }
          }
        };
      }

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

      // 1-Batch query lookup for matching Wali by familyCardNumber
      const kkList = (list as any[])
        .map((sp) => sp.person?.guardianProfiles?.[0]?.familyCardNumber)
        .filter((kk): kk is string => Boolean(kk && kk !== "-"));

      const waliMap = new Map<string, any>();
      if (kkList.length > 0) {
        const matchedWalis = await prisma.guardianProfile.findMany({
          where: {
            familyCardNumber: { in: Array.from(new Set(kkList)) },
            deletedAt: null,
          },
          include: { person: true },
        });

        for (const w of matchedWalis) {
          if (w.person) {
            waliMap.set(w.familyCardNumber, w);
          }
        }
      }

      const formatted = (list as any[]).map((sp: any) => {
        const primaryEnrollment = sp.enrollments?.[0];
        const primaryGuardian = sp.person?.guardianProfiles?.[0];

        let gName = primaryGuardian?.person?.fullName || "-";
        let gPhone = primaryGuardian?.person?.phoneNumber || "-";
        let gRelation = primaryGuardian?.relation || "WALI";
        let kkNum = primaryGuardian?.familyCardNumber || "-";

        if (kkNum !== "-" && (gName === "-" || gName === sp.person?.fullName)) {
          const matchedWali = waliMap.get(kkNum);
          if (matchedWali?.person) {
            gName = matchedWali.person.fullName;
            gPhone = matchedWali.person.phoneNumber || gPhone;
            gRelation = matchedWali.relation || gRelation;
          }
        }

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
          guardianName: gName,
          guardianPhone: gPhone,
          guardianRelation: gRelation,
          familyCardNumber: kkNum,
        };
      });

      return NextResponse.json({ status: "Success", data: formatted, total });
    }

    if (role === "pengurus") {
      const qLower = (query || "").trim().toLowerCase();
      const isMufattisyQuery = qLower.includes("mufat") || qLower.includes("mufattisy") || qLower.includes("mufatish");
      const isMundzirQuery = qLower.includes("mundzir");

      let whereCondition: any = {
        deletedAt: null,
        person: { deletedAt: null },
      };

      if (isMundzirQuery) {
        whereCondition.role = { contains: "Mundzir", mode: "insensitive" };
      } else if (isMufattisyQuery) {
        whereCondition.OR = [
          { role: { contains: "mufat", mode: "insensitive" } },
          { role: { contains: "mufattisy", mode: "insensitive" } },
          { role: { contains: "mufatish", mode: "insensitive" } },
        ];
      } else {
        // Dewan Harian / Dewan Pleno / General Pengurus:
        // EXCLUDE Mundzir, Mufattisy, and Mustahiq!
        whereCondition.AND = [
          { role: { not: { contains: "Mundzir", mode: "insensitive" } } },
          { role: { not: { contains: "Mufattisy", mode: "insensitive" } } },
          { role: { not: { contains: "Mufatish", mode: "insensitive" } } },
          { role: { not: { contains: "Mufatisy", mode: "insensitive" } } },
          { role: { not: { contains: "Mustahiq", mode: "insensitive" } } },
        ];

        if (query) {
          whereCondition.AND.push({
            OR: [
              { person: { fullName: { contains: query, mode: "insensitive" } } },
              { role: { contains: query, mode: "insensitive" } },
            ],
          });
        }
      }

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
            person: {
              include: {
                organizationMemberships: {
                  where: { deletedAt: null },
                  take: 1,
                },
              },
            },
          },
        }),
      ]);

      const formatted = list.map((tp: any) => {
        const rawRole = tp.person.organizationMemberships?.[0]?.role || "Mustahiq";

        let jenjang = tp.person.organizationMemberships?.[0]?.supervisedLevel || "-";
        if (/i['`’]?dadiyyah/i.test(rawRole)) jenjang = "I'dadiyyah";
        else if (/ibtida['`’]?iyyah/i.test(rawRole)) jenjang = "Ibtida'iyyah";
        else if (/tsanawiyyah/i.test(rawRole)) jenjang = "Tsanawiyyah";
        else if (/aliyyah/i.test(rawRole)) jenjang = "Aliyyah";
        else if (/robithoh/i.test(rawRole)) jenjang = "Al-Robithoh";

        const cleanStr = rawRole
          .replace(/^Mustahiq\s*/i, "")
          .replace(/i['`’]?dadiyyah/i, "")
          .replace(/ibtida['`’]?iyyah/i, "")
          .replace(/tsanawiyyah/i, "")
          .replace(/aliyyah/i, "")
          .replace(/robithoh/i, "")
          .trim();

        let tingkat = "-";
        const tingkatMatch = cleanStr.match(/\b(VI|IV|V|III|II|I|1|2|3|4|5|6)\b/i);
        if (tingkatMatch) {
          tingkat = tingkatMatch[1].toUpperCase();
        }

        let lokal = "-";
        const parts = cleanStr.split(/\s+/);
        const lastPart = parts[parts.length - 1];
        if (/^[A-Z]$/i.test(lastPart)) {
          lokal = lastPart.toUpperCase();
        } else {
          const lokalMatch = cleanStr.match(/\b([A-Z])\b/);
          if (lokalMatch) lokal = lokalMatch[1];
        }

        const tingkatLokal = (tingkat !== "-" || lokal !== "-")
          ? `Tingkat ${tingkat} | Lokal ${lokal}`
          : "-";

        return {
          id: tp.id,
          personId: tp.personId,
          name: tp.person.fullName,
          teacherCode: tp.teacherCode,
          role: rawRole,
          jenjang,
          tingkat,
          lokal,
          tingkatLokal,
          nik: tp.person.nik,
          phone: tp.person.phoneNumber,
          status: tp.status,
          gender: tp.person.gender,
          avatarUrl: tp.person.avatarUrl,
        };
      });

      return NextResponse.json({ status: "Success", data: formatted, total });
    }

    // People who don't have a UserAccount yet (for Generate Akun tab)
    if (role === "without_account") {
      const whereCond: any = {
        deletedAt: null,
        userAccount: { is: null }, // No account yet
        studentProfile: { is: null }, // Exclude Santriwati / Siswi
        guardianProfiles: { none: {} }, // Exclude Wali Santri
        OR: [
          { teacherProfile: { isNot: null } },
          { organizationMemberships: { some: { deletedAt: null } } },
        ],
      };

      const people = await (prisma.person as any).findMany({
        where: whereCond,
        include: {
          teacherProfile: true,
          organizationMemberships: { take: 1 },
          mustahiqClasses: { take: 1 },
        },
        take: limit,
        skip: offset,
      });

      const total = await (prisma.person as any).count({
        where: whereCond,
      });

      const formatted = people.map((p: any) => {
        let suggestedRole = "Mustahiq";
        let jabatan = "-";

        if (p.organizationMemberships && p.organizationMemberships.length > 0) {
          const orgRole = p.organizationMemberships[0].role || "";
          jabatan = orgRole;
          const orgLower = orgRole.toLowerCase();

          if (orgLower.includes("mundzir")) {
            suggestedRole = "Mundzir";
          } else if (orgLower.includes("mufat")) {
            suggestedRole = "Mufattisy";
          } else if (orgLower.includes("mustahiq")) {
            suggestedRole = "Mustahiq";
          } else {
            suggestedRole = "Pengurus Harian";
          }
        } else if (p.teacherProfile) {
          suggestedRole = "Mustahiq";
          jabatan = "Mustahiq / Pengajar";
        }

        return {
          id: p.id,
          fullName: p.fullName,
          gender: p.gender || "L",
          phoneNumber: p.phoneNumber || "-",
          avatarUrl: p.avatarUrl || null,
          jabatan,
          suggestedRole,
        };
      });

      return NextResponse.json({ status: "Success", data: formatted, total });
    }

    if (role === "guardian") {
      await cleanOrphanedGuardians();

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
      role,
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

      // 2. Create StudentProfile if role is explicitly student/santri OR stambuk/nis/class is specified
      let studentProfile = null;
      const isStudentRole = role === "student" || role === "santri";
      const hasStudentData = !!(stambuk || nis || className || classId);
      if (isStudentRole || hasStudentData) {
        studentProfile = await tx.studentProfile.create({
          data: {
            personId: person.id,
            stambukNumber: stambuk || `STB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            nis: nis || `NIS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            nisn: nisn || null,
            enrollmentYear: Number(enrollmentYear) || new Date().getFullYear(),
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
          const normName = className.trim();
          const withDash = normName.replace(/\s+([A-Z0-9]+)$/i, "-$1");
          const withoutDash = normName.replace(/-([A-Z0-9]+)$/i, " $1");

          targetClass = await tx.academicClass.findFirst({
            where: {
              OR: [
                { name: { equals: normName, mode: "insensitive" } },
                { name: { equals: withDash, mode: "insensitive" } },
                { name: { equals: withoutDash, mode: "insensitive" } },
                { fullName: { contains: normName, mode: "insensitive" } },
                { fullName: { contains: withDash, mode: "insensitive" } },
              ],
              deletedAt: null,
            },
          });

          // Auto-create class if not found yet
          if (!targetClass) {
            let jenjang = "Ibtida'iyyah";
            if (/i['`’]?dadiyyah/i.test(normName)) jenjang = "I'dadiyyah";
            else if (/ibtida['`’]?iyyah/i.test(normName)) jenjang = "Ibtida'iyyah";
            else if (/tsanawiyyah/i.test(normName)) jenjang = "Tsanawiyyah";
            else if (/aliyyah/i.test(normName)) jenjang = "Aliyyah";

            const cleanStr = normName
              .replace(/i['`’]?dadiyyah/i, "")
              .replace(/ibtida['`’]?iyyah/i, "")
              .replace(/tsanawiyyah/i, "")
              .replace(/aliyyah/i, "")
              .trim();

            let tingkat = "I";
            const tingkatMatch = cleanStr.match(/\b(VI|IV|V|III|II|I|1|2|3|4|5|6)\b/i);
            if (tingkatMatch) tingkat = tingkatMatch[1].toUpperCase();

            let lokal = "A";
            const parts = cleanStr.split(/[\s-]+/);
            const lastPart = parts[parts.length - 1];
            if (/^[A-Z]$/i.test(lastPart)) lokal = lastPart.toUpperCase();

            const activeYear = await tx.academicYear.findFirst({ where: { isActive: true, deletedAt: null } });
            const targetYearId = activeYear?.id || (await tx.academicYear.findFirst({ where: { deletedAt: null } }))?.id;

            if (targetYearId) {
              targetClass = await tx.academicClass.create({
                data: {
                  academicYearId: targetYearId,
                  name: `${jenjang} ${tingkat}-${lokal}`,
                  fullName: `Kelas ${jenjang} ${tingkat}-${lokal}`,
                  institutionLevel: jenjang,
                  levelNumber: ({ I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6 } as any)[tingkat] || 1,
                },
              });
            }
          }
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

        // 2c. Find or Auto-Create Room/Asrama if specified during creation/import
        const targetRoomName = (body.room || body.roomName || body.kamar || body.asrama || "").trim();
        if (targetRoomName && targetRoomName !== "Belum Ditentukan" && studentProfile) {
          let targetRoom = await tx.room.findFirst({
            where: {
              name: { equals: targetRoomName, mode: "insensitive" },
              deletedAt: null,
            },
          });

          if (!targetRoom) {
            let bName = "Asrama Utama";
            if (/aisyah/i.test(targetRoomName)) bName = "Gedung Aisyah";
            else if (/khadijah/i.test(targetRoomName)) bName = "Gedung Khadijah";
            else if (/fatimah/i.test(targetRoomName)) bName = "Gedung Fatimah";
            else if (/zainab/i.test(targetRoomName)) bName = "Gedung Zainab";

            targetRoom = await tx.room.create({
              data: {
                name: targetRoomName,
                buildingName: bName,
                capacity: 20,
                supervisorId: null,
              },
            });
          }

          if (targetRoom) {
            await tx.studentProfile.update({
              where: { id: studentProfile.id },
              data: { roomId: targetRoom.id },
            });
          }
        }
      }

      // 3. Create / Link Guardian if guardian information provided
      if (familyCardNumber || guardianName) {
        const kkNumber = familyCardNumber || `KK-${Date.now()}`;
        let guardianPerson = person;

        if (guardianName && guardianName !== personFullName) {
          const existingWaliPerson = await tx.person.findFirst({
            where: {
              fullName: { equals: guardianName.trim(), mode: "insensitive" },
              deletedAt: null,
            },
          });

          if (existingWaliPerson) {
            guardianPerson = existingWaliPerson;
          } else {
            guardianPerson = await tx.person.create({
              data: {
                fullName: guardianName.trim(),
                gender: guardianRelation === "IBU" ? "P" : "L",
                phoneNumber: guardianPhone || null,
              },
            });
          }
        }

        // Create GuardianProfile for Guardian Person if not exists
        const existingWaliProfile = await tx.guardianProfile.findFirst({
          where: { personId: guardianPerson.id, deletedAt: null },
        });

        if (!existingWaliProfile) {
          await tx.guardianProfile.create({
            data: {
              personId: guardianPerson.id,
              familyCardNumber: kkNumber,
              relation: guardianRelation || "WALI",
            },
          });
        }

        // ALSO Create GuardianProfile for Student Person so that person.guardianProfiles finds it!
        if (person.id !== guardianPerson.id) {
          const existingSantriGuardian = await tx.guardianProfile.findFirst({
            where: { personId: person.id, deletedAt: null },
          });

          if (!existingSantriGuardian) {
            await tx.guardianProfile.create({
              data: {
                personId: person.id,
                familyCardNumber: kkNumber,
                relation: guardianRelation || "WALI",
              },
            });
          }
        }
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
