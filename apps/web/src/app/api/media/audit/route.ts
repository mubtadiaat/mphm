import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await prisma.auditLog.create({
      data: {
        action: body.action || "DOCUMENT_PRINT",
        entity: body.entity || "DOCUMENT",
        afterState: JSON.stringify(body),
      },
    });
    return NextResponse.json({ status: "Success", message: "Audit logged" });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}
