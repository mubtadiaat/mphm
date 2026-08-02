import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/jwt";
import { createAuditLog } from "@/lib/auditLog";
import { detectInstitutionFromRole } from "@/lib/institutionGuard";

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
          isUnregistered: true,
          message: `Akun Google (${email}) belum terdaftar sebagai Wali Santri. Silakan lengkapi Nomor KK & Kata Sandi.`,
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

    const roleLower = String(userAccount.role || "").trim().toLowerCase();

    // Strict Portal Role Validation for Google Login
    if (body.portal === "sekretariat") {
      const allowedKeywords = ["sek", "admin", "sekretariat", "superadmin", "super_admin", "super admin"];
      const isAllowed = allowedKeywords.some((kw) => roleLower.includes(kw));
      if (!isAllowed) {
        return NextResponse.json(
          { status: "Error", message: "Akun Anda bukan merupakan akun Sekretariat. Silakan login di portal Sekretariat." },
          { status: 403 }
        );
      }
    } else if (body.portal === "mustahiq") {
      const isAllowed = roleLower.includes("mustahiq");
      if (!isAllowed) {
        return NextResponse.json(
          { status: "Error", message: "Akun Anda bukan Mustahiq. Silakan login di portal Mustahiq." },
          { status: 403 }
        );
      }
    } else if (body.portal === "staff") {
      const forbiddenRoleKeywords = ["sek.pondok", "sek.madrasah", "mustahiq", "wali_santri", "wali", "guardian"];
      const isForbidden = forbiddenRoleKeywords.some((kw) => roleLower === kw || roleLower.startsWith(kw));
      if (isForbidden) {
        return NextResponse.json(
          { status: "Error", message: "Akun Anda bukan Pengurus. Silakan login di portal yang sesuai." },
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

    // Tautkan firebaseUid jika belum tersimpan
    if (!userAccount.firebaseUid) {
      await prisma.userAccount.update({
        where: { id: userAccount.id },
        data: { firebaseUid: uid },
      });
    }

    const institution = detectInstitutionFromRole(userAccount.role);

    const sessionPayload = {
      userId: userAccount.id,
      accountId: userAccount.id,
      personId: userAccount.personId,
      username: userAccount.username,
      role: userAccount.role,
      institution,
      fullName: userAccount.person?.fullName || userAccount.username,
      avatarUrl: userAccount.person?.avatarUrl || null,
      email: userAccount.email || email,
      googleLinked: true,
      assignedClassId: null,
      familyCardNumber: null,
    };

    const { signJWT, setSessionCookie } = await import("@/lib/jwt");
    const token = await signJWT(sessionPayload);

    const response = NextResponse.json({
      status: "Success",
      message: "Login Google berhasil",
      data: sessionPayload,
      token,
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
