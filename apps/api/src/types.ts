// ============================================================
// Cloudflare Worker Environment Bindings
// ============================================================
// Interface ini mendefinisikan semua binding yang tersedia di wrangler.jsonc.
// Digunakan sebagai generic type: new Hono<{ Bindings: Bindings }>()

export type Bindings = {
  // Cloudflare D1 — Database utama
  DB: D1Database;

  // KV Namespace — Session cache
  SESSION_KV: KVNamespace;

  // Cloudinary secrets (di-set via `wrangler secret put`)
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;

  // Environment
  ENVIRONMENT: string;
};

// ============================================================
// Session Payload (di-set oleh authMiddleware ke context)
// ============================================================
export type SessionPayload = {
  userId: string;
  accountId: string;
  personId: string;
  role: string;
  username: string;
  assignedClassId?: string;    // Untuk Mustahiq
  familyCardNumber?: string;   // Untuk Wali Santri
};

// ============================================================
// App-level type for Hono context variables
// ============================================================
export type Variables = {
  user: SessionPayload;
  auditBeforeData?: any;
};

// ============================================================
// Combined Hono Environment Type
// ============================================================
export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};
