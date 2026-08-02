import { NextRequest, NextResponse } from "next/server";
import { signJWT } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { detectInstitutionFromRole } from "@/lib/institutionGuard";

// Cast helper: menghindari stale Prisma IDE types untuk field baru (institution)
const db = prisma as any;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken, email, displayName, photoUrl } = body;

    if (!idToken || !email) {
      return NextResponse.json(
        { status: "error", message: "Token atau Email Google tidak valid." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();

    // 1. Cari UserAccount berdasarkan email atau username
    let account = await db.userAccount.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { username: cleanEmail }],
      },
      include: { person: true },
    });

    // 2. Jika user account belum ada, buat Person & UserAccount otomatis
    if (!account) {
      const newPerson = await prisma.person.create({
        data: {
          fullName: displayName || cleanEmail.split("@")[0],
          gender: "P",
          avatarUrl: photoUrl || null,
        },
      });

      account = await db.userAccount.create({
        data: {
          personId: newPerson.id,
          username: cleanEmail.split("@")[0],
          email: cleanEmail,
          role: "wali_santri",
          institution: "MADRASAH",
          passwordHash: "GOOGLE_OAUTH_ENTERPRISE_AUTHENTICATED",
          status: "ACTIVE",
        },
        include: { person: true },
      });
    }

    if (!account) {
      return NextResponse.json(
        { status: "error", message: "Gagal membuat atau menemukan akun." },
        { status: 500 }
      );
    }

    // 3. Generate JWT Token resmi
    const institution = detectInstitutionFromRole(account.role);
    const jwtToken = await signJWT({
      userId: account.id,
      accountId: account.id,
      personId: account.personId,
      username: account.username,
      role: account.role,
      institution,
      fullName: account.person?.fullName || account.username,
      avatarUrl: account.person?.avatarUrl || null,
      email: account.email,
      googleLinked: true,
      assignedClassId: null,
      familyCardNumber: null,
    });

    return NextResponse.json({
      status: "success",
      message: "Otentikasi Google Enterprise Berhasil!",
      token: jwtToken,
      user: {
        id: account.id,
        username: account.username,
        name: account.person?.fullName || account.username,
        email: account.email,
        role: account.role,
        avatarUrl: account.person?.avatarUrl,
      },
    });
  } catch (error: any) {
    console.error("GOOGLE_AUTH_GATEWAY_ERROR:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal memproses otentikasi Google Enterprise." },
      { status: 500 }
    );
  }
}
