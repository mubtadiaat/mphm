import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthSession } from "@/lib/apiGuard";
import bcrypt from "bcryptjs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse } = await requireAuthSession(req, ["sek", "admin", "superadmin"]);
    if (errorResponse) return errorResponse;

    const { id: personId } = await params;
    const body = await req.json();
    const { role, roleName, username, email, password, teacherCode, supervisedLevel } = body;

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

    // Handle "pengurus" role → Create OrganizationMembership (no UserAccount needed)
    if (role === "pengurus") {
      const membership = await prisma.organizationMembership.create({
        data: {
          personId,
          role: roleName || "Pengurus Harian",
          supervisedLevel: supervisedLevel || null,
          serviceYear: new Date().getFullYear().toString(),
          status: "ACTIVE",
        },
      });

      return NextResponse.json({
        status: "Success",
        message: `Role ${roleName || "Pengurus"} berhasil ditugaskan`,
        data: membership,
      });
    }

    // Handle "teacher" role → Create TeacherProfile + OrganizationMembership (no UserAccount needed)
    if (role === "teacher") {
      const profile = await prisma.teacherProfile.create({
        data: {
          personId,
          teacherCode: teacherCode || `UST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          status: "ACTIVE",
        },
      });

      // Also create OrganizationMembership for role title
      await prisma.organizationMembership.create({
        data: {
          personId,
          role: roleName || "Mustahiq",
          serviceYear: new Date().getFullYear().toString(),
          status: "ACTIVE",
        },
      });

      return NextResponse.json({
        status: "Success",
        message: "Role Mustahiq/Guru berhasil ditugaskan",
        data: profile,
      });
    }

    // Handle other roles that DO need a UserAccount (guardian, sek.pondok, sek.madrasah, etc.)
    let mappedRole = role;
    if (role === "guardian") mappedRole = "Wali Santri";

    // Generate a unique username with timestamp suffix to prevent collisions
    const baseUsername =
      username ||
      `${role}_${person.fullName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10)}`;
    const uniqueUsername = username || `${baseUsername}_${Date.now().toString(36)}`;
    const hashedPassword = await bcrypt.hash(password || "mubtadiaat123", 10);

    // Check if person already has a UserAccount
    const existingAccount = await prisma.userAccount.findUnique({
      where: { personId },
    });

    let userAccount;
    if (existingAccount) {
      // Update existing account role
      userAccount = await prisma.userAccount.update({
        where: { personId },
        data: {
          role: mappedRole,
          status: "ACTIVE",
          ...(email ? { email } : {}),
          ...(password ? { passwordHash: hashedPassword } : {}),
        },
      });
    } else {
      // Create new account with unique username
      userAccount = await prisma.userAccount.create({
        data: {
          personId,
          username: uniqueUsername,
          email: email || null,
          passwordHash: hashedPassword,
          role: mappedRole,
          status: "ACTIVE",
        },
      });
    }

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
