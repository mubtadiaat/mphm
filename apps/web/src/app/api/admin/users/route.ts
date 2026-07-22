import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const whereCondition = {
      deletedAt: null,
      ...(query
        ? {
            OR: [
              { username: { contains: query, mode: "insensitive" as const } },
              { email: { contains: query, mode: "insensitive" as const } },
              { role: { contains: query, mode: "insensitive" as const } },
              { person: { fullName: { contains: query, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    };

    const [total, users] = await Promise.all([
      prisma.userAccount.count({ where: whereCondition }),
      prisma.userAccount.findMany({
        where: whereCondition,
        take: limit,
        skip: offset,
        include: { person: true },
        orderBy: { username: "asc" },
      }),
    ]);

    const formatted = users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      status: u.status,
      personName: u.person.fullName,
      personId: u.personId,
    }));

    return NextResponse.json({ status: "Success", data: formatted, total });
  } catch (err: any) {
    console.error("ADMIN_USERS_GET_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { personId, username, email, password, role = "Mustahiq" } = body;

    if (!username) {
      return NextResponse.json(
        { status: "Error", message: "Username wajib diisi." },
        { status: 400 }
      );
    }

    let targetPersonId = personId;
    if (!targetPersonId) {
      const newPerson = await prisma.person.create({
        data: {
          fullName: username,
          gender: "L",
        },
      });
      targetPersonId = newPerson.id;
    }

    const newUser = await prisma.userAccount.create({
      data: {
        personId: targetPersonId,
        username,
        email: email || null,
        passwordHash: password || null,
        role,
        status: "ACTIVE",
      },
      include: { person: true },
    });

    return NextResponse.json({
      status: "Success",
      message: "Pengguna berhasil ditambahkan.",
      data: newUser,
    });
  } catch (err: any) {
    console.error("ADMIN_USERS_POST_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
