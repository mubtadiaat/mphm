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

import { deleteFromCloudinary } from "../utils/cloudinary";

// Hapus foto secara manual (jika user cancel/hapus preview dari UI)
media.delete("/", async (c) => {
  const { url } = await c.req.json<{ url: string }>();

  if (!url) {
    return c.json({ status: "Error", message: "URL gambar tidak diberikan." }, 400);
  }

  const success = await deleteFromCloudinary(url, {
    CLOUDINARY_CLOUD_NAME: c.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: c.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: c.env.CLOUDINARY_API_SECRET,
  });

  if (success) {
    return c.json({ status: "Success", message: "Foto berhasil dihapus di server." });
  } else {
    return c.json({ status: "Error", message: "Gagal menghapus foto." }, 500);
  }
});

// Explicit audit log untuk unggahan langsung dari frontend
media.post("/audit", async (c) => {
  const body = await c.req.json<{ url: string, action?: string, details?: string }>().catch(() => null);
  
  if (!body || !body.url) {
    return c.json({ status: "Error", message: "URL gambar tidak diberikan." }, 400);
  }

  // Set data untuk audit log otomatis
  c.set("auditBeforeData", null);

  return c.json({ 
    status: "Success", 
    message: "Jejak audit berhasil dicatat.",
    data: {
      url: body.url,
      action: body.action || "UPLOAD_MEDIA",
      details: body.details
    }
  });
});

export default media;
