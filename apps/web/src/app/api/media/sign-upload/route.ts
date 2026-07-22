import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "r9f9o3jm",
  api_key: process.env.CLOUDINARY_API_KEY || "429861346112812",
  api_secret: process.env.CLOUDINARY_API_SECRET || "12Iqz9E6KivJxavoMraiu7JXgxQ",
});

export async function POST() {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: "mphm_assets" },
      process.env.CLOUDINARY_API_SECRET || "12Iqz9E6KivJxavoMraiu7JXgxQ"
    );

    return NextResponse.json({
      status: "Success",
      data: {
        timestamp,
        signature,
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "r9f9o3jm",
        apiKey: process.env.CLOUDINARY_API_KEY || "429861346112812",
        folder: "mphm_assets",
      },
    });
  } catch (err: any) {
    console.error("CLOUDINARY_SIGN_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
