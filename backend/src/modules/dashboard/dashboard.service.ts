import { prisma } from "../../config/prisma";
import { percentChange, roundCarbon } from "../../shared/utils/carbonMath";
import { endOfMonth, monthKey, previousMonthRange, startOfMonth } from "../../shared/utils/date";
import { buildActionPlanProgress } from "../carbonTwin/actionPlanProgress";
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function gradeForScore(score: number) {
  if (score >= 900) return "A+";
  if (score >= 800) return "A";
  if (score >= 700) return "B+";
  if (score >= 600) return "B";
  if (score >= 500) return "C";
  return "D";
}

function levelForScore(score: number) {
  if (score >= 800) {
    return { level: "Level 5 - Climate Champion", nextLevelTarget: null, nextLevelName: null };
  }
  if (score >= 700) {
    return { level: "Level 4 - Sustainability Advocate", nextLevelTarget: 800, nextLevelName: "Climate Champion" };
  }
  if (score >= 600) {
    return { level: "Level 3 - Eco Explorer", nextLevelTarget: 700, nextLevelName: "Sustainability Advocate" };
  }
  if (score >= 500) {
    return { level: "Level 2 - Conscious Consumer", nextLevelTarget: 600, nextLevelName: "Eco Explorer" };
  }
  return { level: "Level 1 - Beginner", nextLevelTarget: 500, nextLevelName: "Conscious Consumer" };
}

function totalForCategory(entries: { kgCo2e: unknown; category: { name: string } }[], category: string) {
  const normalized = category.toLowerCase();
  return roundCarbon(
    entries
      .filter((entry) => entry.category.name.toLowerCase() === normalized)
      .reduce((sum, entry) => sum + Number(entry.kgCo2e), 0)
  );
}

function missionCopy(category: string) {
  const normalized = category.toLowerCase();
  if (normalized === "transport") {
    return {
      title: "Reduce Transport Emissions",
      description: "Reduce transport emissions by 10% this month."
    };
  }
  if (normalized === "energy") {
    return {
      title: "Reduce Energy Emissions",
      description: "Reduce AC and electricity impact by 10% this month."
    };
  }
  if (normalized === "food") {
    return {
      title: "Plant-Forward Month",
      description: "Add 3 vegetarian meals per week and reduce food emissions by 10%."
    };
  }
  if (normalized === "waste") {
    return {
      title: "Reduce Waste Emissions",
      description: "Reduce waste emissions by 10% this month."
    };
  }
  if (normalized === "shopping") {
    return {
      title: "Lower Shopping Impact",
      description: "Reduce shopping emissions by 10% this month."
    };
  }
  return {
    title: `Reduce ${category} Emissions`,
    description: `Reduce ${category.toLowerCase()} emissions by 10% this month.`
  };
}

function buildMonthlyMission(input: {
  category: string;
  currentCategoryTotal: number;
  previousCategoryTotal: number;
  baseline: number;
  categoryPercentage: number;
}) {
  const baselineCategoryEstimate =
    input.previousCategoryTotal > 0
      ? input.previousCategoryTotal
      : roundCarbon(input.baseline * (input.categoryPercentage > 0 ? input.categoryPercentage / 100 : 1));
  const targetReduction = baselineCategoryEstimate * 0.1;
  const actualReduction = Math.max(0, baselineCategoryEstimate - input.currentCategoryTotal);
  const progress = targetReduction > 0 ? roundCarbon(clamp((actualReduction / targetReduction) * 100, 0, 100)) : 0;
  const copy = missionCopy(input.category);

  return {
    ...copy,
    category: input.category,
    progress,
    reward: 25,
    completed: progress >= 100
  };
}

function buildCarbonScore(input: {
  completedActionItems: number;
  completedChallenges: number;
  earnedBadges: number;
  completedRecommendations: number;
  baseline: number;
  currentTotal: number;
  missionCompleted: boolean;
}) {
  const footprintImprovement =
    input.baseline > 0 ? clamp(((input.baseline - input.currentTotal) / input.baseline) * 250, 0, 250) : 0;

  return Math.round(
    clamp(
      300 +
        Math.min(input.completedActionItems * 35, 250) +
        Math.min(input.completedChallenges * 90, 180) +
        Math.min(input.earnedBadges * 45, 180) +
        Math.min(input.completedRecommendations * 70, 140) +
        footprintImprovement +
        (input.missionCompleted ? 25 : 0),
      0,
      1000
    )
  );
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
      recentEntries,
      completedActionItems,
      completedChallenges,
      earnedBadges,
      completedRecommendations
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
      }),
      prisma.actionPlanItem.count({
        where: {
          status: "Completed",
          actionPlan: { userId }
        }
      }),
      prisma.userChallenge.count({ where: { userId, status: "Completed" } }),
      prisma.userBadge.count({ where: { userId } }),
      prisma.recommendation.count({ where: { userId, status: "Completed" } })
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
    const missionCategory = top.category || twin?.topEmissionSource || "Transport";
    const monthlyMission = buildMonthlyMission({
      category: missionCategory,
      currentCategoryTotal: totalForCategory(currentEntries, missionCategory),
      previousCategoryTotal: totalForCategory(previousEntries, missionCategory),
      baseline,
      categoryPercentage: top.percentage
    });
    const score = buildCarbonScore({
      completedActionItems,
      completedChallenges,
      earnedBadges,
      completedRecommendations,
      baseline,
      currentTotal,
      missionCompleted: monthlyMission.completed
    });
    const level = levelForScore(score);
    const nextLevelMessage =
      level.nextLevelTarget && level.nextLevelName
        ? `Reach ${level.nextLevelTarget} score to become ${level.nextLevelName}.`
        : "You have reached the top Carbon Coach level.";
    const progression = {
      score,
      grade: gradeForScore(score),
      ...level,
      monthlyMission,
      futureYouMessages: [`Complete your mission to gain +${monthlyMission.reward} Carbon Score.`, nextLevelMessage]
    };
    const monthlyTrendMap = new Map<string, number | null>();

    for (let index = 5; index >= 0; index -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
      monthlyTrendMap.set(monthKey(date), null);
    }

    for (const entry of trendEntries) {
      const key = monthKey(entry.occurredAt);
      const val = monthlyTrendMap.get(key);
      monthlyTrendMap.set(key, (val === null ? 0 : val ?? 0) + Number(entry.kgCo2e));
    }

    const monthlyTrend = Array.from(monthlyTrendMap.entries()).map(([month, kgCo2e]) => ({
      month,
      kgCo2e: kgCo2e === null ? null : roundCarbon(kgCo2e)
    }));

    const projectedBaseline = latestSimulation ? roundCarbon((baseline / 30) * latestSimulation.days) : baseline;
    const projectedEmissions = latestSimulation ? Number(latestSimulation.projectedKgCo2e) : roundCarbon(projectedBaseline * 0.85);
    const estimatedReductionKg = latestSimulation ? Number(latestSimulation.estimatedSavingsKgCo2e) : roundCarbon(projectedBaseline - projectedEmissions);
    const estimatedReductionPercent = projectedBaseline > 0 ? clamp(roundCarbon((estimatedReductionKg / projectedBaseline) * 100), 0, 100) : 0;
    const projection = [
      { label: "Today", baseline: baseline, actionPlan: baseline },
      {
        label: latestSimulation ? `${latestSimulation.days} days` : "30 days",
        baseline: projectedBaseline,
        actionPlan: projectedEmissions
      }
    ];
    const actionItems = actionPlan?.items ?? [];
    const progress = buildActionPlanProgress(actionItems);
    const totalDays = progress.totalDays;
    const completedDays = progress.completedDays;
    const remainingDays = progress.remainingDays;
    const completionPercentage = progress.completionPercentage;
    const completedEstimatedSavings = progress.completedEstimatedSavings;
    const totalEstimatedSavings = progress.totalEstimatedSavings;
    const projectedReductionPercent = baseline > 0 ? clamp(roundCarbon((totalEstimatedSavings / baseline) * 100), 0, 100) : clamp(estimatedReductionPercent, 0, 100);

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
          ...progress,
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
        currentEmissions: baseline,
        projectedEmissions,
        estimatedReductionKg,
        estimatedReductionPercent,
        timeframeDays: latestSimulation?.days ?? 30,
        explanation: `Future You compares your monthly baseline of ${baseline.toFixed(1)} kg CO2e footprint with a projected ${projectedEmissions.toFixed(1)} kg CO2e path if you follow the current plan.`,
        recommendationHint: "Use the next action-plan item to turn the lower projection into real progress.",
        progressionMessages: progression.futureYouMessages
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
      carbonTwin: twin,
      progression
    };
  }
};
