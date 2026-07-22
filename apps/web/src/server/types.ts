// ============================================================
// Cloudflare Worker Environment Bindings
// ============================================================
// Interface ini mendefinisikan semua binding yang tersedia di wrangler.jsonc.
// Digunakan sebagai generic type: new Hono<{ Bindings: Bindings }>()

export type Bindings = {
  ENVIRONMENT: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  SESSION_KV: {
    get: (key: string) => Promise<string | null>;
    put: (key: string, value: string, options?: any) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };
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
  supervisedLevel?: string;    // Untuk Mufattisy
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
