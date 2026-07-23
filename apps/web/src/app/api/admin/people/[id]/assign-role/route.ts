import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: personId } = await params;
    const body = await req.json();
    const { role, username, email, password } = body;

    if (!role) {
      return NextResponse.json(
        { status: "Error", message: "Role is required" },
        { status: 400 }
      );
    }

    const person = await prisma.person.findUnique({ where: { id: personId } });
    if (!person) {
      return NextResponse.json(
        { status: "Error", message: "Person not found" },
        { status: 404 }
      );
    }

    // Map role string to system role
    let mappedRole = role;
    if (role === "pengurus") mappedRole = "Sekretariat";
    if (role === "teacher") mappedRole = "Mustahiq";
    if (role === "guardian") mappedRole = "Wali Santri";

    const generatedUsername =
      username ||
      `${role}_${person.fullName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10)}`;

    const userAccount = await prisma.userAccount.upsert({
      where: { personId },
      update: {
        role: mappedRole,
        status: "ACTIVE",
        ...(email ? { email } : {}),
      },
      create: {
        personId,
        username: generatedUsername,
        email: email || null,
        passwordHash: password || "mphm123",
        role: mappedRole,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      status: "Success",
      message: "Role berhasil ditugaskan",
      data: userAccount,
    });
  } catch (err: any) {
    console.error("PEOPLE_ASSIGN_ROLE_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
