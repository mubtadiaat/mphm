import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/jwt";
import { requireAuthSession } from "@/lib/apiGuard";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = await requireAuthSession(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const academicYearId = searchParams.get("academicYearId");

    const session = await getSessionFromCookies();
    let supervisedLevel: string | null = session?.supervisedLevel || null;

    if (!supervisedLevel && session?.personId) {
      const om = await prisma.organizationMembership.findFirst({
        where: { personId: session.personId, deletedAt: null },
      });
      supervisedLevel = om?.supervisedLevel || null;
    }

    let targetYearId: string | null = academicYearId;
    if (!targetYearId) {
      const activeYear = await prisma.academicYear.findFirst({
        where: { isActive: true, deletedAt: null },
      });
      targetYearId = activeYear?.id || null;
    }

    if (targetYearId) {
      await autoEnsureClassesFromMustahiqs(targetYearId);
    }

    const mufattisyList = await prisma.organizationMembership.findMany({
      where: {
        role: { contains: "Mufattisy", mode: "insensitive" },
        deletedAt: null,
      },
      include: { person: true },
    });

    const getMufattisyName = (levelStr: string) => {
      const target = (levelStr || "").toLowerCase();
      const match = mufattisyList.find(m => {
        const sup = (m.supervisedLevel || "").toLowerCase();
        const r = (m.role || "").toLowerCase();
        return sup.includes(target) || r.includes(target);
      });
      return match?.person.fullName || "-";
    };

    const classes = await prisma.academicClass.findMany({
      where: {
        ...(targetYearId ? { academicYearId: targetYearId } : {}),
        ...(supervisedLevel ? { institutionLevel: { contains: supervisedLevel, mode: "insensitive" as const } } : {}),
        deletedAt: null,
      },
      include: {
        mustahiq: true,
        curriculum: true,
        enrollments: {
          where: { status: "ACTIVE", deletedAt: null },
        },
      },
      orderBy: { levelNumber: "asc" },
    });

    const formatted = classes.map((c) => ({
      id: c.id,
      name: c.name,
      fullName: c.fullName,
      institutionLevel: c.institutionLevel,
      levelNumber: c.levelNumber,
      mustahiq: c.mustahiq?.fullName || "-",
      mufattisy: getMufattisyName(c.institutionLevel || c.name),
      capacity: 40,
      mustahiqId: c.mustahiqId,
      academicYearId: c.academicYearId,
      curriculumId: c.curriculumId,
      studentCount: c.enrollments?.length || 0,
    }));

    return NextResponse.json({ status: "Success", data: formatted });
  } catch (err: any) {
    console.error("ADMIN_CLASSES_GET_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = await requireAuthSession(req, ["sek", "admin", "superadmin"]);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { academicYearId, name, fullName, institutionLevel, levelNumber, mustahiqId } = body;

    if (!academicYearId || !name || !fullName || !institutionLevel || levelNumber === undefined) {
      return NextResponse.json(
        { status: "Error", message: "Parameter kelas tidak lengkap." },
        { status: 400 }
      );
    }

    const newClass = await prisma.academicClass.create({
      data: {
        academicYearId,
        name,
        fullName,
        institutionLevel,
        levelNumber: Number(levelNumber),
        mustahiqId: mustahiqId || null,
      },
    });

    return NextResponse.json({ status: "Success", data: newClass });
  } catch (err: any) {
    console.error("ADMIN_CLASSES_POST_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}

async function autoEnsureClassesFromMustahiqs(targetYearId: string) {
  try {
    const mustahiqs = await prisma.organizationMembership.findMany({
      where: {
        role: { contains: "Mustahiq", mode: "insensitive" },
        deletedAt: null,
      },
      include: { person: true },
    });

    for (const m of mustahiqs) {
      const rawRole = m.role || "Mustahiq";
      if (!rawRole || rawRole.trim() === "Mustahiq") continue;

      let jenjang = "Ibtida'iyyah";
      if (/i['`’]?dadiyyah/i.test(rawRole)) jenjang = "I'dadiyyah";
      else if (/ibtida['`’]?iyyah/i.test(rawRole)) jenjang = "Ibtida'iyyah";
      else if (/tsanawiyyah/i.test(rawRole)) jenjang = "Tsanawiyyah";
      else if (/aliyyah/i.test(rawRole)) jenjang = "Aliyyah";

      const cleanStr = rawRole
        .replace(/^Mustahiq\s*/i, "")
        .replace(/i['`’]?dadiyyah/i, "")
        .replace(/ibtida['`’]?iyyah/i, "")
        .replace(/tsanawiyyah/i, "")
        .replace(/aliyyah/i, "")
        .trim();

      let tingkat = "I";
      const tingkatMatch = cleanStr.match(/\b(VI|IV|V|III|II|I|1|2|3|4|5|6)\b/i);
      if (tingkatMatch) tingkat = tingkatMatch[1].toUpperCase();

      let lokal = "A";
      const parts = cleanStr.split(/\s+/);
      const lastPart = parts[parts.length - 1];
      if (/^[A-Z]$/i.test(lastPart)) {
        lokal = lastPart.toUpperCase();
      }

      const className = `${jenjang} ${tingkat}-${lokal}`;
      const fullClassName = `Kelas ${jenjang} ${tingkat}-${lokal}`;

      const map: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6 };
      const levelNum = map[tingkat] || 1;

      const existingClass = await prisma.academicClass.findFirst({
        where: {
          academicYearId: targetYearId,
          OR: [{ name: className }, { name: className.replace("-", " ") }],
          deletedAt: null,
        },
      });

      if (!existingClass) {
        await prisma.academicClass.create({
          data: {
            academicYearId: targetYearId,
            name: className,
            fullName: fullClassName,
            institutionLevel: jenjang,
            levelNumber: levelNum,
            mustahiqId: m.personId,
          },
        });
      } else if (!existingClass.mustahiqId) {
        await prisma.academicClass.update({
          where: { id: existingClass.id },
          data: { mustahiqId: m.personId },
        });
      }
    }
  } catch (err) {
    console.error("autoEnsureClassesFromMustahiqs error:", err);
  }
}
