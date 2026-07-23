import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const newPassword = body.newPassword || "mphm123";

    await prisma.userAccount.update({
      where: { id },
      data: { passwordHash: newPassword },
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
