import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/auth/biometric -> Register or Authenticate via Biometric Token
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId, biometricToken, deviceId } = body;

    if (action === "toggle") {
      if (!userId) {
        return NextResponse.json(
          { status: "error", message: "User ID diperlukan untuk mengubah Biometrik." },
          { status: 400 }
        );
      }

      const user = await (prisma as any).userAccount.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return NextResponse.json(
          { status: "error", message: "Akun pengguna tidak ditemukan." },
          { status: 404 }
        );
      }

      const newStatus = !user.isBiometricEnabled;
      const updatedUser = await (prisma as any).userAccount.update({
        where: { id: userId },
        data: {
          isBiometricEnabled: newStatus,
          biometricToken: newStatus ? (biometricToken || `BIO-TOKEN-${Date.now()}-${userId}`) : null,
        },
      });

      return NextResponse.json({
        status: "success",
        message: newStatus 
          ? "Autentikasi Biometrik (Sidik Jari / Wajah) berhasil DIAKTIFKAN!" 
          : "Autentikasi Biometrik (Sidik Jari / Wajah) DINONAKTIFKAN.",
        isBiometricEnabled: updatedUser.isBiometricEnabled,
        biometricToken: updatedUser.biometricToken,
      });
    }

    if (action === "verify") {
      if (!biometricToken) {
        return NextResponse.json(
          { status: "error", message: "Token biometrik tidak valid." },
          { status: 400 }
        );
      }

      const user = await (prisma as any).userAccount.findFirst({
        where: {
          biometricToken,
          isBiometricEnabled: true,
        },
        include: {
          person: true,
        },
      });

      if (!user) {
        return NextResponse.json(
          { status: "error", message: "Autentikasi biometrik gagal atau belum terdaftar." },
          { status: 401 }
        );
      }

      return NextResponse.json({
        status: "success",
        message: `Selamat datang kembali, ${user.person?.fullName || user.username}! (Masuk via Biometrik)`,
        data: {
          id: user.id,
          username: user.username,
          role: user.role,
          person: user.person,
        },
      });
    }

    return NextResponse.json(
      { status: "error", message: "Aksi biometrik tidak valid." },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal memproses autentikasi biometrik." },
      { status: 500 }
    );
  }
}
