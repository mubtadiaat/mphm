import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Serializes a value for DB storage.
 * Objects/arrays are JSON.stringify'd; primitives become strings.
 */
function serializeValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/**
 * Deserializes a DB string value back to its original type.
 * Attempts JSON.parse for objects/arrays; returns string otherwise.
 */
function deserializeValue(raw: string): unknown {
  if (!raw) return raw;
  // Try to parse JSON (arrays, objects, booleans, numbers)
  try {
    const parsed = JSON.parse(raw);
    // Only return parsed if it's actually an object, array, boolean, or number
    if (typeof parsed === "object" || typeof parsed === "boolean" || typeof parsed === "number") {
      return parsed;
    }
    return raw;
  } catch {
    return raw;
  }
}

export async function GET(req: NextRequest) {
  try {
    const settingsList = await prisma.systemSetting.findMany();
    const settingsObject: Record<string, unknown> = {};

    settingsList.forEach((s) => {
      settingsObject[s.key] = deserializeValue(s.value);
    });

    return NextResponse.json({
      status: "Success",
      data: settingsObject,
    });
  } catch (err: any) {
    console.error("GET_SETTINGS_ERROR:", err.message);
    return NextResponse.json({
      status: "Success",
      data: {
        systemMaintenance: "false",
        activeAcademicYear: "2026/2027",
      },
    });
  }
}

async function upsertSettings(body: Record<string, unknown>) {
  if (!body || typeof body !== "object") return;
  const entries = Object.entries(body);
  if (entries.length === 0) return;

  await Promise.all(
    entries.map(async ([key, value]) => {
      if (!key) return;
      try {
        await prisma.systemSetting.upsert({
          where: { key },
          update: { value: serializeValue(value), updatedAt: new Date() },
          create: { key, value: serializeValue(value) },
        });
      } catch (err: any) {
        console.error(`SETTINGS_UPSERT_KEY_ERROR (${key}):`, err?.message || err);
      }
    })
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { status: "Error", message: "Payload tidak valid." },
        { status: 400 }
      );
    }
    await upsertSettings(body);

    return NextResponse.json({
      status: "Success",
      message: "Pengaturan sistem berhasil disimpan.",
    });
  } catch (err: any) {
    console.error("POST_SETTINGS_ERROR:", err?.message || err);
    return NextResponse.json(
      { status: "Error", message: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { status: "Error", message: "Payload tidak valid." },
        { status: 400 }
      );
    }
    await upsertSettings(body);

    return NextResponse.json({
      status: "Success",
      message: "Pengaturan sistem berhasil diperbarui.",
    });
  } catch (err: any) {
    console.error("PUT_SETTINGS_ERROR:", err?.message || err);
    return NextResponse.json(
      { status: "Error", message: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

