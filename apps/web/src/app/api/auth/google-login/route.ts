import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/jwt";
import { createAuditLog } from "@/lib/auditLog";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, email } = body;

    if (!email) {
      return NextResponse.json(
        { status: "Error", message: "Email dari Google Authentication tidak ditemukan." },
        { status: 400 }
      );
    }

    // 1. Cari user_account yang sudah ditautkan berdasarkan firebaseUid atau email
    const userAccount = await prisma.userAccount.findFirst({
      where: {
        OR: [{ firebaseUid: uid }, { email: email }],
        deletedAt: null,
      },
      include: { person: true },
    });

    // 2. Jika akun belum ditautkan di pengaturan, jangan buat akun secara acak
    if (!userAccount) {
      return NextResponse.json(
        {
          status: "Error",
          message: `Akun Google (${email}) belum ditautkan ke akun MPHM Anda. Silakan masuk dengan Username & Password terlebih dahulu, lalu tautkan akun Gmail Anda di menu Pengaturan Akun.`,
        },
        { status: 404 }
      );
    }

    if (userAccount.status !== "ACTIVE") {
      return NextResponse.json(
        { status: "Error", message: "Akun Anda sedang dinonaktifkan." },
        { status: 403 }
      );
    }

    // Tautkan firebaseUid jika belum tersimpan
    if (!userAccount.firebaseUid) {
      await prisma.userAccount.update({
        where: { id: userAccount.id },
        data: { firebaseUid: uid },
      });
    }

    const sessionPayload = {
      userId: userAccount.id,
      accountId: userAccount.id,
      personId: userAccount.personId,
      username: userAccount.username,
      role: userAccount.role,
      fullName: userAccount.person?.fullName || userAccount.username,
      avatarUrl: userAccount.person?.avatarUrl || null,
      email: userAccount.email || email,
      googleLinked: true,
      assignedClassId: null,
      familyCardNumber: null,
    };

    const response = NextResponse.json({
      status: "Success",
      message: "Login Google berhasil",
      data: sessionPayload,
    });

    await setSessionCookie(response, sessionPayload);

    await createAuditLog({
      userId: userAccount.username,
      action: "LOGIN_GOOGLE",
      entity: "AUTH",
      entityId: userAccount.id,
      afterState: { email, role: userAccount.role },
    });

    return response;
  } catch (err: any) {
    console.error("GOOGLE_LOGIN_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message || "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}
