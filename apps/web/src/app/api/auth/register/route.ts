import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { whatsapp, familyCardNumber } = await req.json();

    if (!whatsapp || !familyCardNumber) {
      return NextResponse.json(
        { status: "Error", message: "Nomor WhatsApp dan Nomor Kartu Keluarga (KK) wajib diisi." },
        { status: 400 }
      );
    }

    // 1. Check if person already exists by phone
    let person = await prisma.person.findFirst({
      where: { phoneNumber: whatsapp, deletedAt: null },
    });

    if (!person) {
      person = await prisma.person.create({
        data: {
          fullName: `Wali Santri (${familyCardNumber.slice(-4)})`,
          gender: "L",
          phoneNumber: whatsapp,
        },
      });
    }

    // 2. Check or create GuardianProfile
    let guardian = await prisma.guardianProfile.findFirst({
      where: { familyCardNumber, deletedAt: null },
    });

    if (!guardian) {
      guardian = await prisma.guardianProfile.create({
        data: {
          personId: person.id,
          familyCardNumber: familyCardNumber,
          relation: "WALI",
        },
      });
    }

    // 3. Create or find UserAccount
    const username = `wali_${familyCardNumber.slice(-6)}_${Math.floor(Math.random() * 1000)}`;
    let userAccount = await prisma.userAccount.findFirst({
      where: { personId: person.id, deletedAt: null },
    });

    if (!userAccount) {
      userAccount = await prisma.userAccount.create({
        data: {
          personId: person.id,
          username: username,
          passwordHash: "mubtadiaat123",
          role: "Wali Santri",
          status: "ACTIVE",
        },
      });
    }

    return NextResponse.json({
      status: "Success",
      message: "Pendaftaran wali santri berhasil.",
      data: {
        username: userAccount.username,
        personName: person.fullName,
      },
    });
  } catch (err: any) {
    console.error("AUTH_REGISTER_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
