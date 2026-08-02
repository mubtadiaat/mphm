import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setSessionCookie } from "@/lib/jwt";
import { createAuditLog } from "@/lib/auditLog";
import { detectInstitutionFromRole } from "@/lib/institutionGuard";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, email, fullName, familyCardNumber, password } = body;

    if (!familyCardNumber || !password) {
      return NextResponse.json(
        { status: "Error", message: "Nomor Kartu Keluarga (KK) dan Password wajib diisi." },
        { status: 400 }
      );
    }

    if (!uid || !email) {
      return NextResponse.json(
        { status: "Error", message: "Sesi otentikasi Google tidak valid. Silakan coba login Google kembali." },
        { status: 400 }
      );
    }

    const cleanKk = String(familyCardNumber).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanUid = String(uid).trim();
    const cleanName = fullName?.trim() || `Wali Santri (KK: ${cleanKk.slice(-4)})`;
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Generate Username unik: wali_<4_digit_akhir_KK>
    let baseUsername = `wali_${cleanKk.slice(-4)}`;
    let finalUsername = baseUsername;

    const existingByUsername = await prisma.userAccount.findFirst({
      where: { username: finalUsername, deletedAt: null },
    });

    if (existingByUsername) {
      // Fallback 1: wali_<6_digit_akhir_KK>
      finalUsername = `wali_${cleanKk.slice(-6)}`;
      const existingFallback1 = await prisma.userAccount.findFirst({
        where: { username: finalUsername, deletedAt: null },
      });

      if (existingFallback1) {
        // Fallback 2: wali_<4_digit_akhir_KK>_<3_digit_random>
        finalUsername = `wali_${cleanKk.slice(-4)}_${Math.floor(100 + Math.random() * 900)}`;
      }
    }

    // 2. Cek apakah user_account dengan firebaseUid / email sudah terdaftar sebelumnya
    let userAccount = await prisma.userAccount.findFirst({
      where: {
        OR: [{ firebaseUid: cleanUid }, { email: cleanEmail }],
        deletedAt: null,
      },
      include: { person: true },
    });

    let personId: string;
    let personName: string = cleanName;

    if (userAccount) {
      // Jika akun sudah ada, perbarui data
      personId = userAccount.personId;
      personName = userAccount.person?.fullName || cleanName;

      userAccount = await prisma.userAccount.update({
        where: { id: userAccount.id },
        data: {
          firebaseUid: cleanUid,
          email: cleanEmail,
          passwordHash: hashedPassword,
          status: "ACTIVE",
        },
        include: { person: true },
      });
    } else {
      // Cari atau buat Person
      let person = await prisma.person.findFirst({
        where: {
          fullName: cleanName,
          deletedAt: null,
        },
      });

      if (!person) {
        person = await prisma.person.create({
          data: {
            fullName: cleanName,
            gender: "L",
          },
        });
      }

      personId = person.id;
      personName = person.fullName;

      // Cari atau buat GuardianProfile berdasarkan KK
      let guardian = await prisma.guardianProfile.findFirst({
        where: { familyCardNumber: cleanKk, deletedAt: null },
      });

      if (!guardian) {
        guardian = await prisma.guardianProfile.create({
          data: {
            personId: personId,
            familyCardNumber: cleanKk,
            relation: "WALI",
          },
        });
      }

      // Buat UserAccount baru
      userAccount = await prisma.userAccount.create({
        data: {
          personId: personId,
          username: finalUsername,
          email: cleanEmail,
          firebaseUid: cleanUid,
          passwordHash: hashedPassword,
          role: "Wali Santri",
          status: "ACTIVE",
        },
        include: { person: true },
      });
    }

    // 3. Sediakan payload sesi login otomatis (Auto-login)
    const institution = detectInstitutionFromRole(userAccount.role);
    const sessionPayload = {
      userId: userAccount.id,
      accountId: userAccount.id,
      personId: userAccount.personId,
      username: userAccount.username,
      role: userAccount.role,
      institution,
      fullName: personName,
      avatarUrl: userAccount.person?.avatarUrl || null,
      email: userAccount.email || cleanEmail,
      googleLinked: true,
      assignedClassId: null,
      familyCardNumber: cleanKk,
    };

    const response = NextResponse.json({
      status: "Success",
      message: "Pendaftaran Akun Wali Santri berhasil diselesaikan.",
      data: sessionPayload,
    });

    // Pasang session cookie agar langsung masuk (Auto-login)
    await setSessionCookie(response, sessionPayload);

    await createAuditLog({
      userId: userAccount.username,
      action: "REGISTER_GOOGLE",
      entity: "AUTH",
      entityId: userAccount.id,
      afterState: { email: cleanEmail, role: userAccount.role, familyCardNumber: cleanKk },
    });

    return response;
  } catch (err: any) {
    console.error("GOOGLE_REGISTER_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message || "Gagal mendaftarkan akun Wali Santri via Google." },
      { status: 500 }
    );
  }
}
