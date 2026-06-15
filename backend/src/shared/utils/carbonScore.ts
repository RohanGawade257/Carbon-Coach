import { roundCarbon } from "./carbonMath";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function sumKg(entries: { kgCo2e: unknown }[]): number {
  return roundCarbon(entries.reduce((sum, entry) => sum + Number(entry.kgCo2e), 0));
}

export function categoryBreakdown(entries: { kgCo2e: unknown; category: { name: string } }[]) {
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
        percentage
      };
    })
    .sort((a, b) => b.kgCo2e - a.kgCo2e);
}

export function totalForCategory(entries: { kgCo2e: unknown; category: { name: string } }[], category: string): number {
  const normalized = category.toLowerCase();
  return roundCarbon(
    entries
      .filter((entry) => entry.category.name.toLowerCase() === normalized)
      .reduce((sum, entry) => sum + Number(entry.kgCo2e), 0)
  );
}

export function buildMonthlyMission(input: {
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

  return {
    progress,
    completed: progress >= 100
  };
}

export function gradeForScore(score: number): string {
  if (score >= 900) return "A+";
  if (score >= 800) return "A";
  if (score >= 700) return "B+";
  if (score >= 600) return "B";
  if (score >= 500) return "C";
  return "D";
}

export function levelForScore(score: number) {
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

export function computeCarbonScore(input: {
  completedActionItems: number;
  completedChallenges: number;
  earnedBadges: number;
  completedRecommendations: number;
  baseline: number;
  currentTotal: number;
  missionCompleted: boolean;
}): number {
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
