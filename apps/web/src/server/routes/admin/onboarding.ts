import { Hono } from "hono";
import { createDb } from "@mphm/db";
import type { AppEnv } from "../../types";
import { requireRole } from "../../middlewares/rbacMiddleware";
import { sql } from "drizzle-orm";

const onboardingAdmin = new Hono<AppEnv>();

onboardingAdmin.use("*", requireRole(["Sekretariat", "Mundzir", "Mufattisy"]));

onboardingAdmin.get("/status", async (c) => {
  try {
    const db = createDb();
    
    // 1. Check Mundzir
    const mundzirCount = await db.execute(sql`
      SELECT count(*) as count 
      FROM organization_memberships 
      WHERE role_name LIKE '%Mundzir%' AND deleted_at IS NULL
    `);
    
    // 2. Check Mufattisy
    const mufattisyCount = await db.execute(sql`
      SELECT count(*) as count 
      FROM organization_memberships 
      WHERE role_name LIKE '%Mufattisy%' AND deleted_at IS NULL
    `);

    // 3. Check Mustahiq (Teacher)
    const mustahiqCount = await db.execute(sql`
      SELECT count(*) as count 
      FROM teacher_profiles 
      WHERE deleted_at IS NULL
    `);

    // 4. Check Classes
    const classesCount = await db.execute(sql`
      SELECT count(*) as count 
      FROM academic_classes 
      WHERE deleted_at IS NULL
    `);

    // 5. Check Santri
    const santriCount = await db.execute(sql`
      SELECT count(*) as count 
      FROM student_profiles 
      WHERE deleted_at IS NULL
    `);

    const getCount = (result: any) => ((result?.rows?.[0] as { count?: number })?.count || 0) > 0;

    const hasMundzir = getCount(mundzirCount);
    const hasMufattisy = getCount(mufattisyCount);
    const hasMustahiq = getCount(mustahiqCount);
    const hasClasses = getCount(classesCount);
    const hasSantri = getCount(santriCount);

    return c.json({
      status: "Success",
      data: {
        hasMundzir,
        hasMufattisy,
        hasMustahiq,
        hasClasses,
        hasSantri
      }
    });

  } catch (err: any) {
    console.error("ONBOARDING_STATUS_ERROR:", err.message);
    return c.json({ status: "Error", message: err.message }, 500);
  }
});

export default onboardingAdmin;
