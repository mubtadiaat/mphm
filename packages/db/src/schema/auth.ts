import { pgTable, text, integer, index, boolean, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { people } from "./people";

// ============================================================
// 1. USER ACCOUNTS (Login & Credential)
// ============================================================
// Setiap user_account terkait ke 1 entitas people.
// Role di sini menentukan peran login, bukan profil.
export const userAccounts = pgTable("user_accounts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(), // bcrypt / argon2 hash
  role: text("role", {
    enum: ["Sekretariat", "Mustahiq", "Mufattisy", "Mundzir", "Petugas Keamanan", "Wali Santri"]
  }).notNull(),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at"),
  deletedAt: timestamp("deleted_at"),
}, (table) => ({
  personIdx: index("user_accounts_person_idx").on(table.personId),
  roleIdx: index("user_accounts_role_idx").on(table.role),
}));

// ============================================================
// 2. USER SESSIONS (HttpOnly Secure Cookie Session)
// ============================================================
// Session-based auth, BUKAN JWT. Token disimpan di HttpOnly cookie.
// Session Rotation: token diperbarui setiap 1 jam atau aksi krusial.
export const userSessions = pgTable("user_sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => userAccounts.id, { onDelete: "cascade" }),
  sessionToken: text("session_token").notNull().unique(),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
}, (table) => ({
  tokenIdx: index("user_sessions_token_idx").on(table.sessionToken),
  userIdx: index("user_sessions_user_idx").on(table.userId),
  expiryIdx: index("user_sessions_expiry_idx").on(table.expiresAt),
}));
