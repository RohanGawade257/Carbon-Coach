import { prisma } from "../../config/prisma";
import { percentChange, roundCarbon } from "../../shared/utils/carbonMath";
import { endOfMonth, monthKey, previousMonthRange, startOfMonth } from "../../shared/utils/date";
import { insightService } from "./insight.service";

function sumKg(entries: { kgCo2e: unknown }[]) {
  return roundCarbon(entries.reduce((sum, entry) => sum + Number(entry.kgCo2e), 0));
}

function categoryBreakdown(entries: { kgCo2e: unknown; category: { name: string } }[]) {
  const totals = new Map<string, number>();
  for (const entry of entries) {
    totals.set(entry.category.name, (totals.get(entry.category.name) ?? 0) + Number(entry.kgCo2e));
  }
  const total = Array.from(totals.values()).reduce((sum, value) => sum + value, 0);
  return Array.from(totals.entries())
    .map(([category, kgCo2e]) => {
      const rounded = roundCarbon(kgCo2e);
      const percentage = total > 0 ? Math.round((kgCo2e / total) * 1000) / 10 : 0;
      return {
        category,
        kgCo2e: rounded,
        percentage,
        ...insightService.topCategory(category, rounded, percentage)
      };
    })
    .sort((a, b) => b.kgCo2e - a.kgCo2e);
}

export const dashboardService = {
  async overview(userId: string) {
    const now = new Date();
    const currentStart = startOfMonth(now);
    const currentEnd = endOfMonth(now);
    const previous = previousMonthRange(now);
    const trendStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      currentEntries,
      previousEntries,
      trendEntries,
      twin,
      latestSimulation,
      actionPlan,
      recommendations,
      activeChallenges,
      badges,
      recentEntries
    ] = await Promise.all([
      prisma.footprintEntry.findMany({
        where: { userId, occurredAt: { gte: currentStart, lte: currentEnd } },
        include: { category: true }
      }),
      prisma.footprintEntry.findMany({
        where: { userId, occurredAt: { gte: previous.start, lte: previous.end } },
        include: { category: true }
      }),
      prisma.footprintEntry.findMany({
        where: { userId, occurredAt: { gte: trendStart } },
        include: { category: true }
      }),
      prisma.carbonTwinProfile.findUnique({ where: { userId } }),
      prisma.carbonTwinSimulation.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } }),
      prisma.actionPlan.findFirst({
        where: { userId, status: "Active" },
        orderBy: { createdAt: "desc" },
        include: { items: { orderBy: { dayNumber: "asc" } } }
      }),
      prisma.recommendation.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { category: true }
      }),
      prisma.userChallenge.findMany({
        where: { userId, status: { in: ["Joined", "Completed"] } },
        orderBy: { startedAt: "desc" },
        take: 3,
        include: { challenge: { include: { category: true } } }
      }),
      prisma.userBadge.findMany({
        where: { userId },
        orderBy: { awardedAt: "desc" },
        take: 4,
        include: { badge: true }
      }),
      prisma.footprintEntry.findMany({
        where: { userId },
        orderBy: { occurredAt: "desc" },
        take: 6,
        include: { category: true }
      })
    ]);

    const currentTotal = sumKg(currentEntries);
    const previousTotal = sumKg(previousEntries);
    const breakdown = categoryBreakdown(currentEntries);
    const top = breakdown[0] ?? {
      category: twin?.topEmissionSource ?? "Transport",
      kgCo2e: 0,
      percentage: 0,
      explanation: "Add footprint entries to identify your largest category.",
      recommendationHint: "Start by logging your weekly transport."
    };
    const baseline = twin ? Number(twin.baselineKgCo2eMonthly) : currentTotal;
    const monthlyTrendMap = new Map<string, number>();

    for (let index = 5; index >= 0; index -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
      monthlyTrendMap.set(monthKey(date), 0);
    }

    for (const entry of trendEntries) {
      const key = monthKey(entry.occurredAt);
      monthlyTrendMap.set(key, (monthlyTrendMap.get(key) ?? 0) + Number(entry.kgCo2e));
    }

    const monthlyTrend = Array.from(monthlyTrendMap.entries()).map(([month, kgCo2e]) => ({
      month,
      kgCo2e: roundCarbon(kgCo2e)
    }));

    const projectedBaseline = latestSimulation ? roundCarbon((baseline / 30) * latestSimulation.days) : baseline;
    const projectedEmissions = latestSimulation ? Number(latestSimulation.projectedKgCo2e) : roundCarbon(projectedBaseline * 0.85);
    const estimatedReductionKg = latestSimulation ? Number(latestSimulation.estimatedSavingsKgCo2e) : roundCarbon(projectedBaseline - projectedEmissions);
    const estimatedReductionPercent = projectedBaseline > 0 ? roundCarbon((estimatedReductionKg / projectedBaseline) * 100) : 0;
    const projection = [
      { label: "Today", baseline: currentTotal, actionPlan: currentTotal },
      {
        label: latestSimulation ? `${latestSimulation.days} days` : "30 days",
        baseline: projectedBaseline,
        actionPlan: projectedEmissions
      }
    ];
    const actionItems = actionPlan?.items ?? [];
    const totalDays = actionItems.length;
    const completedDays = actionItems.filter((item) => item.status === "Completed").length;
    const remainingDays = Math.max(0, totalDays - completedDays);
    const completionPercentage = totalDays > 0 ? roundCarbon((completedDays / totalDays) * 100) : 0;
    const completedEstimatedSavings = roundCarbon(
      actionItems
        .filter((item) => item.status === "Completed")
        .reduce((sum, item) => sum + Number(item.estimatedSavingsKgCo2e), 0)
    );
    const totalEstimatedSavings = roundCarbon(
      actionItems.reduce((sum, item) => sum + Number(item.estimatedSavingsKgCo2e), 0)
    );
    const projectedReductionPercent = baseline > 0 ? roundCarbon((totalEstimatedSavings / baseline) * 100) : estimatedReductionPercent;

    return {
      widgets: {
        monthlyFootprint: {
          title: "Monthly Footprint",
          value: currentTotal,
          unit: "kg CO2e",
          deltaPercent: percentChange(currentTotal, previousTotal),
          ...insightService.monthlyFootprint(currentTotal, top.category)
        },
        baselineComparison: {
          title: "Baseline Comparison",
          value: percentChange(currentTotal, baseline),
          unit: "%",
          ...insightService.baselineComparison(currentTotal, baseline)
        },
        topCategory: {
          title: "Top Category",
          value: top.category,
          kgCo2e: top.kgCo2e,
          percentage: top.percentage,
          explanation: top.explanation,
          recommendationHint: top.recommendationHint
        },
        estimatedSavings: {
          title: "Estimated Savings",
          value: latestSimulation ? Number(latestSimulation.estimatedSavingsKgCo2e) : 0,
          unit: "kg CO2e",
          ...insightService.savings(latestSimulation ? Number(latestSimulation.estimatedSavingsKgCo2e) : 0)
        },
        planProgress: {
          title: "30-Day Plan Progress",
          completedDays,
          totalDays,
          remainingDays,
          completionPercentage,
          completedEstimatedSavings,
          totalEstimatedSavings,
          projectedReductionPercent,
          explanation:
            totalDays > 0
              ? `${completedDays} of ${totalDays} action-plan days are complete. Completed actions represent about ${completedEstimatedSavings.toFixed(1)} kg CO2e of planned savings.`
              : "Generate a 30-day action plan to track daily reduction progress.",
          recommendationHint:
            remainingDays > 0
              ? `Complete the next action to keep progress moving. ${remainingDays} days remain.`
              : "Your current action plan is complete. Generate a new plan when you are ready."
        }
      },
      futureYou: {
        currentEmissions: currentTotal,
        projectedEmissions,
        estimatedReductionKg,
        estimatedReductionPercent,
        timeframeDays: latestSimulation?.days ?? 30,
        explanation: `Future You compares today's ${currentTotal.toFixed(1)} kg CO2e footprint with a projected ${projectedEmissions.toFixed(1)} kg CO2e path if you follow the current plan.`,
        recommendationHint: "Use the next action-plan item to turn the lower projection into real progress."
      },
      charts: {
        categoryBreakdown: breakdown,
        monthlyTrend: {
          data: monthlyTrend,
          ...insightService.trend(currentTotal, previousTotal)
        },
        carbonTwinProjection: {
          data: projection,
          ...insightService.savings(latestSimulation ? Number(latestSimulation.estimatedSavingsKgCo2e) : 0)
        }
      },
      actionPlanPreview: actionPlan,
      recommendations,
      activeChallenges,
      recentBadges: badges,
      recentActivity: recentEntries,
      carbonTwin: twin
    };
  }
};
