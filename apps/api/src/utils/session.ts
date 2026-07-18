import { Context } from "hono";
import { setCookie } from "hono/cookie";
import { eq } from "drizzle-orm";
import { userSessions } from "@mphm/db";
import type { AppEnv } from "../types";

/**
 * Rotates the session token if the current session is older than 30 minutes.
 * Migrates any session-linked KV state (e.g. default password checks) to the new token.
 */
export async function rotateSessionIfStale(
  db: any,
  session: { id: string; createdAt: Date | null; sessionToken: string },
  c: Context<AppEnv>
): Promise<{ newToken: string; rotated: boolean }> {
  const now = new Date();
  const sessionAge = now.getTime() - (session.createdAt?.getTime() || 0);
  const THIRTY_MINUTES = 30 * 60 * 1000;

  if (sessionAge > THIRTY_MINUTES) {
    const buffer = new Uint8Array(32);
    crypto.getRandomValues(buffer);
    const newToken = Array.from(buffer, (b) => b.toString(16).padStart(2, "0")).join("");
    const newExpiry = new Date(now.getTime() + 3600000); // 1 hour expiry

    // Update in database
    await db
      .update(userSessions)
      .set({
        sessionToken: newToken,
        expiresAt: newExpiry,
      })
      .where(eq(userSessions.id, session.id));

    // Update HttpOnly cookie
    setCookie(c, "session_token", newToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      path: "/",
      maxAge: 3600,
      domain: c.env.ENVIRONMENT === "production" ? "m.p3hm.my.id" : undefined,
    });

    // Migrate KV cache status for default password check
    try {
      const cached = await c.env.SESSION_KV.get(`session_must_change_pwd:${session.sessionToken}`);
      if (cached !== null) {
        await c.env.SESSION_KV.put(`session_must_change_pwd:${newToken}`, cached, {
          expirationTtl: 3600,
        });
        await c.env.SESSION_KV.delete(`session_must_change_pwd:${session.sessionToken}`);
      }
    } catch (e) {
      console.error("KV session migration failed during session rotation", e);
    }

    return { newToken, rotated: true };
  }

  return { newToken: session.sessionToken, rotated: false };
}
