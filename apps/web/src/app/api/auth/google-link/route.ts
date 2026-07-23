import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/auditLog";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json(
        { status: "Error", message: "Anda belum login." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { uid, email } = body;

    if (!email || !uid) {
      return NextResponse.json(
        { status: "Error", message: "Data Google Authentication tidak valid." },
        { status: 400 }
      );
    }

    // Check if another account is already linked to this Google email or UID
    const existingOther = await prisma.userAccount.findFirst({
      where: {
        OR: [{ firebaseUid: uid }, { email: email }],
        NOT: { id: session.accountId },
        deletedAt: null,
      },
    });

    if (existingOther) {
      return NextResponse.json(
        {
          status: "Error",
          message: `Akun Gmail ${email} sudah ditautkan ke pengguna lain (${existingOther.username}).`,
        },
        { status: 400 }
      );
    }

    // Update current user's userAccount with firebaseUid & email
    const updated = await prisma.userAccount.update({
      where: { id: session.accountId },
      data: {
        firebaseUid: uid,
        email: email,
      },
      include: { person: true },
    });

    await createAuditLog({
      userId: session.username,
      action: "LINK_GOOGLE",
      entity: "USER_SETTING",
      entityId: session.accountId,
      afterState: { email, googleLinked: true },
    });

    return NextResponse.json({
      status: "Success",
      message: `Akun Google (${email}) berhasil ditautkan!`,
      data: {
        email: updated.email,
        googleLinked: true,
      },
    });
  } catch (err: any) {
    console.error("GOOGLE_LINK_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message || "Gagal menautkan akun Google." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json(
        { status: "Error", message: "Anda belum login." },
        { status: 401 }
      );
    }

    await prisma.userAccount.update({
      where: { id: session.accountId },
      data: {
        firebaseUid: null,
      },
    });

    await createAuditLog({
      userId: session.username,
      action: "UNLINK_GOOGLE",
      entity: "USER_SETTING",
      entityId: session.accountId,
    });

    return NextResponse.json({
      status: "Success",
      message: "Tautan akun Google berhasil dilepas.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "Error", message: err.message || "Gagal melepaskan penautan." },
      { status: 500 }
    );
  }
}
