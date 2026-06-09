import { roundCarbon } from "../../shared/utils/carbonMath";

type ProgressItem = {
  dayNumber: number;
  status: string;
  estimatedSavingsKgCo2e: unknown;
};

export function buildActionPlanProgress(items: ProgressItem[]) {
  const ordered = [...items].sort((a, b) => a.dayNumber - b.dayNumber);
  const totalDays = ordered.length;
  const completedDays = ordered.filter((item) => item.status === "Completed").length;
  const remainingDays = Math.max(0, totalDays - completedDays);
  const completionPercentage = totalDays > 0 ? roundCarbon((completedDays / totalDays) * 100) : 0;
  const completedEstimatedSavings = roundCarbon(
    ordered
      .filter((item) => item.status === "Completed")
      .reduce((sum, item) => sum + Number(item.estimatedSavingsKgCo2e), 0)
  );
  const totalEstimatedSavings = roundCarbon(
    ordered.reduce((sum, item) => sum + Number(item.estimatedSavingsKgCo2e), 0)
  );

  let currentStreakDays = 0;
  for (const item of ordered) {
    if (item.status !== "Completed") break;
    currentStreakDays += 1;
  }

  return {
    completedDays,
    totalDays,
    remainingDays,
    completionPercentage,
    estimatedSavingsKgCo2e: completedEstimatedSavings,
    completedEstimatedSavings,
    totalEstimatedSavings,
    currentStreakDays
  };
}
