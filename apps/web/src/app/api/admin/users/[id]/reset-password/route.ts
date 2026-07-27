import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthSession } from "@/lib/apiGuard";
import bcrypt from "bcryptjs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse } = await requireAuthSession(req, ["sek", "admin", "superadmin"]);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const newPassword = body.newPassword || "mphm123";
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.userAccount.update({
      where: { id },
      data: { passwordHash: hashedPassword },
    });

    return NextResponse.json({
      status: "Success",
      message: `Password berhasil direset menjadi ${newPassword}`,
    });
  } catch (err: any) {
    console.error("ADMIN_USER_RESET_PASSWORD_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
