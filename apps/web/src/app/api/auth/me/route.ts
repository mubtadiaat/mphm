import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromCookies();

    if (!session) {
      return NextResponse.json(
        { status: "Error", message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Optionally refresh user data from database if needed
    const userAccount = await prisma.userAccount.findUnique({
      where: { id: session.accountId },
      include: { person: true },
    });

    if (!userAccount || userAccount.deletedAt || userAccount.status !== "ACTIVE") {
      return NextResponse.json(
        { status: "Error", message: "User account suspended or not found" },
        { status: 401 }
      );
    }

    const payload = {
      userId: userAccount.id,
      accountId: userAccount.id,
      personId: userAccount.personId,
      username: userAccount.username,
      role: userAccount.role,
      fullName: userAccount.person?.fullName || userAccount.username,
      avatarUrl: userAccount.person?.avatarUrl || null,
      assignedClassId: null,
      familyCardNumber: null,
    };

    return NextResponse.json({
      status: "Success",
      data: payload,
    });
  } catch (err: any) {
    console.error("AUTH_ME_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
