import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { fullName, whatsapp, familyCardNumber, username: customUsername, password } = await req.json();

    if (!whatsapp || !familyCardNumber) {
      return NextResponse.json(
        { status: "Error", message: "Nomor WhatsApp dan Nomor Kartu Keluarga (KK) wajib diisi." },
        { status: 400 }
      );
    }

    const cleanKk = String(familyCardNumber).trim();
    const cleanWa = String(whatsapp).trim();
    const cleanName = fullName?.trim() || `Wali Santri (KK: ${cleanKk.slice(-4)})`;
    const cleanUsername = customUsername?.trim().toLowerCase() || `wali_${cleanKk.slice(-6)}`;
    const cleanPassword = password || "mubtadiaat123";
    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    // 1. Check if username is already taken
    if (customUsername) {
      const existingUser = await prisma.userAccount.findFirst({
        where: { username: cleanUsername, deletedAt: null },
      });
      if (existingUser) {
        return NextResponse.json(
          { status: "Error", message: `Username "${cleanUsername}" sudah digunakan. Silakan gunakan username lain.` },
          { status: 400 }
        );
      }
    }

    // 2. Check if person already exists by phone or name
    let person = await prisma.person.findFirst({
      where: { phoneNumber: cleanWa, deletedAt: null },
    });

    if (!person) {
      person = await prisma.person.create({
        data: {
          fullName: cleanName,
          gender: "L",
          phoneNumber: cleanWa,
        },
      });
    } else if (fullName) {
      await prisma.person.update({
        where: { id: person.id },
        data: { fullName: cleanName },
      });
    }

    // 3. Check or create GuardianProfile
    let guardian = await prisma.guardianProfile.findFirst({
      where: { familyCardNumber: cleanKk, deletedAt: null },
    });

    if (!guardian) {
      guardian = await prisma.guardianProfile.create({
        data: {
          personId: person.id,
          familyCardNumber: cleanKk,
          relation: "WALI",
        },
      });
    }

    // 4. Create or update UserAccount
    let userAccount = await prisma.userAccount.findFirst({
      where: { personId: person.id, deletedAt: null },
    });

    if (!userAccount) {
      userAccount = await prisma.userAccount.create({
        data: {
          personId: person.id,
          username: cleanUsername,
          passwordHash: hashedPassword,
          role: "Wali Santri",
          status: "ACTIVE",
        },
      });
    } else {
      userAccount = await prisma.userAccount.update({
        where: { id: userAccount.id },
        data: {
          username: cleanUsername,
          passwordHash: hashedPassword,
          status: "ACTIVE",
        },
      });
    }

    return NextResponse.json({
      status: "Success",
      message: "Pendaftaran Akun Wali Santri berhasil diselesaikan.",
      data: {
        username: userAccount.username,
        personName: person.fullName,
      },
    });
  } catch (err: any) {
    console.error("AUTH_REGISTER_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message || "Gagal mendaftarkan akun Wali Santri." },
      { status: 500 }
    );
  }
}
