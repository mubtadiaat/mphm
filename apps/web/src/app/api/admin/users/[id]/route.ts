import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { username, email, role, status, fullName, phone, password } = body;

    // Check if username is changing and unique
    if (username) {
      const existing = await prisma.userAccount.findFirst({
        where: {
          username,
          id: { not: id },
          deletedAt: null,
        },
      });
      if (existing) {
        return NextResponse.json(
          { status: "Error", message: "Username sudah digunakan oleh akun lain." },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.userAccount.update({
      where: { id },
      data: {
        ...(username ? { username } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(role ? { role } : {}),
        ...(status ? { status } : {}),
        ...(password ? { passwordHash: password } : {}),
        person: {
          update: {
            ...(fullName ? { fullName } : {}),
            ...(phone !== undefined ? { phoneNumber: phone } : {}),
          },
        },
      },
      include: { person: true },
    });

    return NextResponse.json({
      status: "Success",
      message: "User berhasil diperbarui",
      data: updated,
    });
  } catch (err: any) {
    console.error("ADMIN_USER_ID_PUT_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.userAccount.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      status: "Success",
      message: "User berhasil dihapus",
    });
  } catch (err: any) {
    console.error("ADMIN_USER_ID_DELETE_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
