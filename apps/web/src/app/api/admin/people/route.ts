import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || undefined;
    const role = searchParams.get("role") || undefined;
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

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
