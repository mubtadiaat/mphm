import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    return NextResponse.json({
      status: "Success",
      message: "Media uploaded",
      data: { url: body.url || "https://res.cloudinary.com/demo/image/upload/sample.jpg" },
    });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    return NextResponse.json({ status: "Success", message: "Media deleted" });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}
