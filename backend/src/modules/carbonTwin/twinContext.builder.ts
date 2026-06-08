import { prisma } from "../../config/prisma";

export async function buildTwinContext(userId: string) {
  const [profile, twin, recentEntries, activePlan] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.carbonTwinProfile.findUnique({ where: { userId } }),
    prisma.footprintEntry.findMany({
      where: { userId },
      orderBy: { occurredAt: "desc" },
      take: 8,
      include: { category: true }
    }),
    prisma.actionPlan.findFirst({
      where: { userId, status: "Active" },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          orderBy: { dayNumber: "asc" },
          take: 5
        }
      }
    })
  ]);

  const entrySummary = recentEntries
    .map((entry) => `${entry.category.name}: ${Number(entry.kgCo2e)} kg CO2e from ${entry.activityType}`)
    .join("; ");

  return [
    `Profile: ${profile ? JSON.stringify(profile) : "No profile yet"}`,
    `Carbon Twin: ${twin ? JSON.stringify({
      baselineKgCo2eMonthly: Number(twin.baselineKgCo2eMonthly),
      topEmissionSource: twin.topEmissionSource,
      biggestOpportunity: twin.biggestOpportunity,
      userGoal: twin.userGoal,
      userConstraints: twin.userConstraints,
      summary: twin.summary
    }) : "No twin yet"}`,
    `Recent footprint entries: ${entrySummary || "No entries yet"}`,
    `Active action plan preview: ${activePlan ? activePlan.items.map((item) => `Day ${item.dayNumber}: ${item.title}`).join("; ") : "No active plan"}`
  ].join("\n");
}

