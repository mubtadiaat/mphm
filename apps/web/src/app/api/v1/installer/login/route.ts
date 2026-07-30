import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const username = String(body.username || body.identifier || body.email || "").trim();
    const password = String(body.password || "").trim();

    if (!username || !password) {
      return NextResponse.json(
        {
          status: "Error",
          message: "Harap isi Username/Email dan Kata Sandi Sekretariat.",
        },
        { status: 400 }
      );
    }

    const userAccount = await prisma.userAccount.findFirst({
      where: {
        OR: [{ username }, { email: username }],
        deletedAt: null,
      },
      include: {
        person: true,
      },
    });

    if (!userAccount || !userAccount.passwordHash) {
      return NextResponse.json(
        { status: "Error", message: "Kredensial tidak ditemukan atau kata sandi salah." },
        { status: 401 }
      );
    }

    if (userAccount.status !== "ACTIVE") {
      return NextResponse.json(
        { status: "Error", message: "Akun pengurus ini sedang dinonaktifkan." },
        { status: 403 }
      );
    }

    // Verify password with bcrypt or legacy plaintext match
    let isPasswordValid = await bcrypt.compare(password, userAccount.passwordHash);
    if (!isPasswordValid && userAccount.passwordHash === password) {
      isPasswordValid = true;
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { status: "Error", message: "Kredensial tidak valid. Kata sandi salah." },
        { status: 401 }
      );
    }

    // Strict Role Check: ONLY sek.pondok or sek.madrasah or roles containing sekretariat
    const userRole = String(userAccount.role || "").toLowerCase();
    const isSekretariat =
      userRole.includes("sek.pondok") ||
      userRole.includes("sek.madrasah") ||
      userRole.includes("sekretariat") ||
      userRole.includes("admin") ||
      userRole.includes("super");

    if (!isSekretariat) {
      return NextResponse.json(
        {
          status: "Error",
          message:
            "Akses Ditolak: Hak pasang software desktop dikhususkan untuk Pengurus Sekretariat (Sek. Pondok / Sek. Madrasah). Akun Anda tidak memiliki wewenang ini.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "Otentikasi Sekretariat Berhasil. Izin pemasangan software diberikan.",
        user: {
          id: userAccount.id,
          username: userAccount.username,
          role: userAccount.role,
          fullName: userAccount.person?.fullName || userAccount.username,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in installer login verification:", error);
    return NextResponse.json(
      { status: "Error", message: error.message || "Terjadi kesalahan pada server verifikasi." },
      { status: 500 }
    );
  }
}
