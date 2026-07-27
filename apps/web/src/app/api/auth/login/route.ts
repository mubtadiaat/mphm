import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/jwt";
import { createAuditLog } from "@/lib/auditLog";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { status: "Error", message: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim();

    const userAccount = await prisma.userAccount.findFirst({
      where: {
        OR: [{ username: cleanUsername }, { email: cleanUsername }],
        deletedAt: null,
      },
      include: {
        person: true,
      },
    });

    if (!userAccount || !userAccount.passwordHash) {
      return NextResponse.json(
        { status: "Error", message: "Username atau password salah." },
        { status: 401 }
      );
    }

    if (userAccount.status !== "ACTIVE") {
      const waSetting = await prisma.systemSetting.findUnique({
        where: { key: "system_whatsapp_contact" },
      });
      const waNumber = waSetting?.value || "6281234567890";

      return NextResponse.json(
        {
          status: "Error",
          message: `Akun Anda dinonaktifkan karena lebih dari 6 bulan tidak digunakan. Silakan hubungi WhatsApp Sekretariat (${waNumber}) untuk mengaktifkan kembali.`,
          isInactive: true,
          waNumber,
        },
        { status: 403 }
      );
    }

    // Check password with bcrypt first
    let isPasswordValid = await bcrypt.compare(password, userAccount.passwordHash);

    // Auto-migration for legacy plain-text passwords
    if (!isPasswordValid && userAccount.passwordHash === password) {
      isPasswordValid = true;
      const newHash = await bcrypt.hash(password, 10);
      await prisma.userAccount.update({
        where: { id: userAccount.id },
        data: { passwordHash: newHash },
      });
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { status: "Error", message: "Username atau password salah." },
        { status: 401 }
      );
    }

    const roleLower = String(userAccount.role || "").trim().toLowerCase();

    // Flexible Portal Role Validation
    if (body.portal === "sekretariat") {
      const allowedKeywords = ["sek", "admin", "sekretariat", "superadmin", "super_admin", "super admin"];
      const isAllowed = allowedKeywords.some((kw) => roleLower.includes(kw));
      if (!isAllowed) {
        return NextResponse.json(
          { status: "Error", message: "Akun Anda tidak memiliki hak akses ke Portal Sekretariat." },
          { status: 403 }
        );
      }
    } else if (body.portal === "staff") {
      const allowedKeywords = ["mustahiq", "mufattisy", "mufat", "mundzir", "pimpinan", "keamanan", "petugas", "staf", "staff"];
      const isAllowed = allowedKeywords.some((kw) => roleLower.includes(kw));
      if (!isAllowed) {
        return NextResponse.json(
          { status: "Error", message: "Akun Anda tidak memiliki hak akses ke Portal Staf & Pengurus." },
          { status: 403 }
        );
      }
    } else if (body.portal === "guardian") {
      const allowedKeywords = ["wali", "santri", "guardian"];
      const isAllowed = allowedKeywords.some((kw) => roleLower.includes(kw));
      if (!isAllowed) {
        return NextResponse.json(
          { status: "Error", message: "Akun Anda bukan merupakan akun Wali Santri." },
          { status: 403 }
        );
      }
    }

    const orgMem = await prisma.organizationMembership.findFirst({
      where: { personId: userAccount.personId, deletedAt: null },
    });

    const sessionPayload = {
      userId: userAccount.id,
      accountId: userAccount.id,
      personId: userAccount.personId,
      username: userAccount.username,
      role: userAccount.role,
      fullName: userAccount.person?.fullName || userAccount.username,
      avatarUrl: userAccount.person?.avatarUrl || null,
      email: userAccount.email || null,
      googleLinked: Boolean(userAccount.firebaseUid),
      assignedClassId: null,
      familyCardNumber: null,
      supervisedLevel: orgMem?.supervisedLevel || null,
    };

    const response = NextResponse.json({
      status: "Success",
      message: "Login berhasil",
      data: sessionPayload,
    });

    await setSessionCookie(response, sessionPayload);

    await createAuditLog({
      userId: userAccount.username,
      action: "LOGIN",
      entity: "AUTH",
      entityId: userAccount.id,
      afterState: { role: userAccount.role, fullName: sessionPayload.fullName },
    });

    return response;
  } catch (err: any) {
    console.error("AUTH_LOGIN_ERROR_DETAILS:", err?.stack || err?.message || err);
    return NextResponse.json(
      { status: "Error", message: err?.message || "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}
