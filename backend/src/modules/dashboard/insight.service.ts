import { percentChange } from "../../shared/utils/carbonMath";

export type Insight = {
  explanation: string;
  recommendationHint: string;
};

export const insightService = {
  monthlyFootprint(current: number, topCategory: string): Insight {
    return {
      explanation: `Your current month footprint is ${current.toFixed(1)} kg CO2e. ${topCategory} is the biggest contributor in this period.`,
      recommendationHint: `Start with one repeatable ${topCategory.toLowerCase()} reduction this week.`
    };
  },

  baselineComparison(current: number, baseline: number): Insight {
    const change = percentChange(current, baseline);
    return {
      explanation:
        baseline > 0
          ? `You are ${Math.abs(change).toFixed(1)}% ${change <= 0 ? "below" : "above"} your Carbon Twin baseline.`
          : "Build your Carbon Twin and add more entries to establish a stronger baseline.",
      recommendationHint: change <= 0 ? "Keep repeating the actions that are working." : "Choose one high-impact action from your plan today."
    };
  },

  topCategory(category: string, kgCo2e: number, percentage: number): Insight {
    return {
      explanation: `${category} represents ${percentage.toFixed(0)}% of your logged footprint, about ${kgCo2e.toFixed(1)} kg CO2e this month.`,
      recommendationHint: `Your biggest opportunity is reducing ${category.toLowerCase()} first.`
    };
  },

  savings(kgCo2e: number): Insight {
    return {
      explanation: `Your latest Carbon Twin simulation estimates ${kgCo2e.toFixed(1)} kg CO2e of avoidable emissions.`,
      recommendationHint: "Complete the first three action-plan items to make the savings more likely."
    };
  },

  trend(current: number, previous: number): Insight {
    const change = percentChange(current, previous);
    return {
      explanation:
        previous > 0
          ? `Your month-over-month trend changed by ${change.toFixed(1)}%.`
          : "Add entries over multiple months to unlock a stronger trend view.",
      recommendationHint: "Log activities weekly so your trend stays accurate."
    };
  }
};

