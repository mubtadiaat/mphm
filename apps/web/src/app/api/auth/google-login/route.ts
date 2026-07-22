import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, email, displayName, photoURL } = body;

    if (!email) {
      return NextResponse.json(
        { status: "Error", message: "Email dari Google Authentication tidak valid." },
        { status: 400 }
      );
    }

    // 1. Cari user_account berdasarkan firebase_uid atau email
    let userAccount = await prisma.userAccount.findFirst({
      where: {
        OR: [{ firebaseUid: uid }, { email: email }],
        deletedAt: null,
      },
      include: { person: true },
    });

    // 2. Jika user belum ada, daftarkan akun baru (Single Source of Truth)
    if (!userAccount) {
      const personName = displayName || email.split("@")[0];
      const person = await prisma.person.create({
        data: {
          fullName: personName,
          gender: "L",
          avatarUrl: photoURL || null,
        },
      });

      const username = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") + "_" + Math.floor(Math.random() * 1000);

      userAccount = await prisma.userAccount.create({
        data: {
          personId: person.id,
          username: username,
          email: email,
          firebaseUid: uid,
          role: "Wali Santri", // Default role untuk pendaftaran baru via Google
          status: "ACTIVE",
        },
        include: { person: true },
      });
    } else if (!userAccount.firebaseUid || !userAccount.email) {
      // Tautkan firebaseUid dan email jika belum ada
      userAccount = await prisma.userAccount.update({
        where: { id: userAccount.id },
        data: {
          firebaseUid: uid,
          email: email,
        },
        include: { person: true },
      });
    }

    return NextResponse.json({
      status: "Success",
      message: "Login Google berhasil",
      data: {
        id: userAccount.id,
        username: userAccount.username,
        email: userAccount.email,
        role: userAccount.role,
        personName: userAccount.person.fullName,
        avatarUrl: userAccount.person.avatarUrl,
      },
    });
  } catch (err: any) {
    console.error("GOOGLE_LOGIN_PRISMA_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
