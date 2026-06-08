import { ActionPlanAi, CarbonTwinProfileAi, RecommendationAi, SimulationAi } from "./aiResponse.schemas";

export function fallbackCarbonTwin(input: {
  baselineKgCo2eMonthly: number;
  topEmissionSource: string;
  userGoal: string;
  userConstraints: string;
}): CarbonTwinProfileAi {
  return {
    topEmissionSource: input.topEmissionSource,
    biggestOpportunity: `Reduce ${input.topEmissionSource.toLowerCase()} emissions with two repeatable habits this month.`,
    userGoal: input.userGoal,
    userConstraints: input.userConstraints,
    baselineKgCo2eMonthly: input.baselineKgCo2eMonthly,
    summary: `${input.topEmissionSource} is currently the largest source in your footprint. The best next step is a small weekly change that fits your stated goal and constraints.`
  };
}

export function fallbackRecommendations(topCategory: string): RecommendationAi[] {
  return [
    {
      title: `Reduce ${topCategory} Emissions`,
      description: `Start with one repeatable action in ${topCategory.toLowerCase()} because it is your largest current opportunity.`,
      category: topCategory,
      estimatedSavingsKgCo2e: 45,
      difficulty: "Easy",
      actions: ["Pick two lower-carbon choices this week", "Track the result in Carbon Coach"]
    },
    {
      title: "Plan Low-Carbon Errands",
      description: "Combining errands reduces repeated trips and helps cut weekly transport emissions.",
      category: "Transport",
      estimatedSavingsKgCo2e: 28,
      difficulty: "Easy",
      actions: ["Combine errands into one route", "Use public transport for one local trip"]
    },
    {
      title: "Lower Home Energy Waste",
      description: "A few home energy habits can reduce monthly emissions without requiring new equipment.",
      category: "Energy",
      estimatedSavingsKgCo2e: 32,
      difficulty: "Medium",
      actions: ["Switch off standby devices", "Use efficient cooling settings"]
    }
  ];
}

export function fallbackActionPlan(topCategory: string): ActionPlanAi {
  const actions = [
    "Audit your largest emission source",
    "Choose one low-carbon swap",
    "Track one transport activity",
    "Plan meals for lower waste",
    "Reduce standby power",
    "Try a reusable bottle",
    "Combine errands",
    "Review weekly progress",
    "Replace one high-carbon meal",
    "Wash clothes cold",
    "Use public transport once",
    "Avoid one impulse purchase",
    "Sort recyclables carefully",
    "Shorten one shower",
    "Walk a short trip",
    "Check home energy settings",
    "Prepare a plant-forward meal",
    "Repair before replacing",
    "Track waste for a day",
    "Share progress with a friend",
    "Batch online orders",
    "Unplug unused chargers",
    "Pick seasonal food",
    "Plan a no-car day",
    "Review challenge progress",
    "Complete a recommendation",
    "Calculate a new activity",
    "Compare category totals",
    "Set next month's focus",
    "Celebrate your best reduction"
  ];

  return {
    title: "30-Day Carbon Coach Action Plan",
    summary: `A practical 30-day plan focused on ${topCategory.toLowerCase()} first, then supporting habits across food, energy, shopping, and waste.`,
    days: actions.map((title, index) => ({
      dayNumber: index + 1,
      title,
      description: `Complete this action and log what changed. This keeps the plan measurable and tied to your Carbon Twin.`,
      category: index % 5 === 0 ? topCategory : ["Transport", "Food", "Energy", "Shopping", "Waste"][index % 5],
      estimatedSavingsKgCo2e: Math.round((8 + (index % 6) * 4) * 100) / 100,
      difficulty: index % 7 === 0 ? "Medium" as const : "Easy" as const
    }))
  };
}

export function fallbackSimulation(input: {
  scenarioName: string;
  baselineKgCo2eMonthly: number;
  days: number;
  savingsPercent: number;
  assumptions: Record<string, unknown>;
}): SimulationAi {
  const projectedWithoutChange = (input.baselineKgCo2eMonthly / 30) * input.days;
  const savings = projectedWithoutChange * (input.savingsPercent / 100);
  const projected = Math.max(0, projectedWithoutChange - savings);
  return {
    scenarioName: input.scenarioName,
    projectedKgCo2e: Math.round(projected * 100) / 100,
    estimatedSavingsKgCo2e: Math.round(savings * 100) / 100,
    assumptions: input.assumptions,
    explanation: `This scenario assumes a ${input.savingsPercent}% reduction from your current monthly baseline over ${input.days} days.`
  };
}
