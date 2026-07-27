import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/auditLog";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json(
        { status: "Error", message: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { fullName, oldPassword, newPassword, avatarUrl } = body;

    const userAccount = await prisma.userAccount.findUnique({
      where: { id: session.accountId },
      include: { person: true },
    });

    if (!userAccount) {
      return NextResponse.json(
        { status: "Error", message: "Account not found" },
        { status: 404 }
      );
    }

    if (newPassword) {
      if (userAccount.passwordHash && oldPassword) {
        let isOldValid = await bcrypt.compare(oldPassword, userAccount.passwordHash);
        if (!isOldValid && userAccount.passwordHash === oldPassword) {
          isOldValid = true;
        }
        if (!isOldValid) {
          return NextResponse.json(
            { status: "Error", message: "Password lama tidak sesuai." },
            { status: 400 }
          );
        }
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await prisma.userAccount.update({
        where: { id: userAccount.id },
        data: { passwordHash: hashedNewPassword },
      });
    }

    if (fullName || avatarUrl !== undefined) {
      await prisma.person.update({
        where: { id: userAccount.personId },
        data: {
          ...(fullName ? { fullName } : {}),
          ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        },
      });
    }

    await createAuditLog({
      userId: session.username,
      action: newPassword ? "UPDATE_PASSWORD_PROFILE" : "UPDATE_PROFILE",
      entity: "USER_SETTING",
      entityId: userAccount.id,
      afterState: { fullName, updatedAvatar: Boolean(avatarUrl) },
    });

    return NextResponse.json({
      status: "Success",
      message: "Profil berhasil diperbarui",
    });
  } catch (err: any) {
    console.error("AUTH_PROFILE_PUT_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
