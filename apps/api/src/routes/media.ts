import { Hono } from "hono";
import type { AppEnv } from "../types";

const media = new Hono<AppEnv>();

// Helper SHA-1 generator menggunakan Web Crypto API (Cloudflare Workers friendly)
async function generateSHA1(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Direct Signed Upload Signature untuk Cloudinary
media.get("/signature", async (c) => {
  const cloudName = c.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = c.env.CLOUDINARY_API_KEY;
  const apiSecret = c.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return c.json({
      status: "Error",
      message: "Konfigurasi Cloudinary tidak lengkap di server."
    }, 500);
  }

  const timestamp = Math.round(Date.now() / 1000);
  
  // Format string signature sesuai aturan Cloudinary: parameter berurutan alfabetis
  // Kita asumsikan upload ke folder "mphm" dengan timestamp
  const signatureParams = `folder=mphm&timestamp=${timestamp}${apiSecret}`;
  const signature = await generateSHA1(signatureParams);
  
  return c.json({
    status: "Success",
    data: {
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder: "mphm"
    }
  });
});

export default media;
