import { prisma } from "@/lib/prisma";

/**
 * Automatically detects and soft-deletes orphaned Wali/Guardian records 
 * (Wali profiles, accounts, and person records) whose associated Santri/Students have been deleted.
 */
export async function cleanOrphanedGuardians(): Promise<number> {
  try {
    const now = new Date();

    // 1. Find all active familyCardNumbers associated with active students
    const activeStudentGuardians = await prisma.guardianProfile.findMany({
      where: {
        deletedAt: null,
        person: {
          deletedAt: null,
          studentProfile: {
            deletedAt: null,
          },
        },
      },
      select: { familyCardNumber: true },
    });

    const activeKKSet = new Set(
      activeStudentGuardians
        .map((g) => g.familyCardNumber)
        .filter((kk): kk is string => Boolean(kk && kk !== "-"))
    );

    // 2. Find all active Wali profiles (relation != "ANAK" or Person has no studentProfile)
    const activeWaliProfiles = await prisma.guardianProfile.findMany({
      where: {
        deletedAt: null,
        person: {
          deletedAt: null,
          studentProfile: null,
        },
      },
      select: { id: true, personId: true, familyCardNumber: true },
    });

    // 3. Identify orphaned Wali whose KK is not linked to any active student
    const orphanWaliProfiles = activeWaliProfiles.filter(
      (w) => !activeKKSet.has(w.familyCardNumber)
    );

    if (orphanWaliProfiles.length === 0) {
      return 0;
    }

    const orphanProfileIds = orphanWaliProfiles.map((w) => w.id);
    const orphanPersonIds = Array.from(new Set(orphanWaliProfiles.map((w) => w.personId)));

    // 4. Soft delete orphan GuardianProfiles, UserAccounts, and Persons
    await prisma.$transaction([
      prisma.guardianProfile.updateMany({
        where: { id: { in: orphanProfileIds } },
        data: { deletedAt: now },
      }),
      prisma.userAccount.updateMany({
        where: { personId: { in: orphanPersonIds }, deletedAt: null },
        data: { deletedAt: now, status: "INACTIVE" },
      }),
      prisma.person.updateMany({
        where: { id: { in: orphanPersonIds }, deletedAt: null },
        data: { deletedAt: now },
      }),
    ]);

    console.log(`[cleanOrphanedGuardians] Auto-cleaned ${orphanPersonIds.length} orphaned guardian records.`);
    return orphanPersonIds.length;
  } catch (err: any) {
    console.error("CLEAN_ORPHANED_GUARDIANS_ERROR:", err.message);
    return 0;
  }
}
