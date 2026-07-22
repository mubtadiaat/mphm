// Helper utilitas untuk menghapus aset di Cloudinary

async function generateSHA1(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function deleteFromCloudinary(
  url: string,
  env: {
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
  }
): Promise<boolean> {
  try {
    if (!url || !url.includes("cloudinary.com")) return false;

    // Ekstrak public_id dari URL
    // Contoh URL: https://res.cloudinary.com/cloud/image/upload/v12345/mphm/abcde.jpg
    const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    if (!match || !match[1]) {
      console.warn("[Cloudinary] Could not extract public_id from:", url);
      return false;
    }

    const publicId = match[1]; // e.g. "mphm/abcde"
    const timestamp = Math.round(Date.now() / 1000).toString();

    // Buat signature untuk fungsi destroy
    // Aturan Cloudinary: public_id=<id>&timestamp=<ts><api_secret>
    const signatureParams = `public_id=${publicId}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
    const signature = await generateSHA1(signatureParams);

    // Call Cloudinary API
    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("api_key", env.CLOUDINARY_API_KEY);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      console.error("[Cloudinary] Destroy API failed:", await response.text());
      return false;
    }

    const data = await response.json() as any;
    console.log("[Cloudinary] Destroy API response:", data);
    
    return data.result === "ok";
  } catch (error) {
    console.error("[Cloudinary] Exception during destroy:", error);
    return false;
  }
}
