import { ActionPlanAi, CarbonTwinProfileAi, RecommendationAi, SimulationAi } from "./aiResponse.schemas";

type RecentEntrySummary = {
  category: string;
  kgCo2e: number;
  activityType: string;
};

type TwinSummary = {
  baselineKgCo2eMonthly?: number;
  topEmissionSource?: string;
  biggestOpportunity?: string;
  userGoal?: string;
  userConstraints?: string;
  summary?: string;
};

type ProfileSummary = {
  fullName?: string;
  householdSize?: number;
  city?: string;
  country?: string;
};

const categoryActions: Record<string, string[]> = {
  Transport: [
    "combine errands into one route",
    "replace two short car trips with walking, cycling, or public transport",
    "plan one no-car day this week"
  ],
  Food: [
    "make two meals plant-forward this week",
    "plan meals before shopping to reduce food waste",
    "swap one high-carbon meal for a lower-carbon option"
  ],
  Energy: [
    "turn off standby devices overnight",
    "use efficient cooling or heating settings",
    "wash clothes cold and run full loads"
  ],
  Shopping: [
    "delay one non-essential purchase for 48 hours",
    "repair or reuse one item before replacing it",
    "batch deliveries into fewer orders"
  ],
  Waste: [
    "carry a reusable bottle or cup",
    "sort recyclables carefully for one week",
    "track what you throw away for one day"
  ]
};

function extractSection(context: string, label: string) {
  return context
    .split("\n")
    .find((line) => line.startsWith(`${label}:`))
    ?.slice(label.length + 1)
    .trim();
}

function parseJsonSection<T>(context: string, label: string): T | null {
  const section = extractSection(context, label);
  if (!section || section.startsWith("No ")) return null;

  try {
    return JSON.parse(section) as T;
  } catch {
    return null;
  }
}

function parseRecentEntries(context: string): RecentEntrySummary[] {
  const section = extractSection(context, "Recent footprint entries");
  if (!section || section === "No entries yet") return [];

  return section
    .split(";")
    .reduce<RecentEntrySummary[]>((acc, entry) => {
      const match = entry.trim().match(/^(.+?):\s*([\d.]+)\s*kg CO2e from (.+)$/i);
      if (!match) return acc;
      acc.push({
        category: match[1],
        kgCo2e: Number(match[2]),
        activityType: match[3]
      });
      return acc;
    }, [])
    .filter((entry) => Number.isFinite(entry.kgCo2e));
}

function getTopRecentCategory(entries: RecentEntrySummary[]) {
  const totals = entries.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.category] = (acc[entry.category] ?? 0) + entry.kgCo2e;
    return acc;
  }, {});

  return Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
}

function findCategoryFromMessage(message: string) {
  const normalized = message.toLowerCase();
  return Object.keys(categoryActions).find((category) => normalized.includes(category.toLowerCase()));
}

function getRecommendedActions(category: string) {
  return categoryActions[category] ?? [
    "choose one lower-carbon swap you can repeat twice this week",
    "track the result in Carbon Coach",
    "review your dashboard after seven days"
  ];
}

function getNextPlanItem(context: string) {
  const section = extractSection(context, "Active action plan preview");
  if (!section || section === "No active plan") return null;
  return section.split(";")[0]?.trim().replace(/^Day \d+:\s*/i, "") ?? null;
}

function firstName(profile: ProfileSummary | null) {
  return profile?.fullName?.trim().split(/\s+/)[0];
}

function isOnboardingQuestion(message: string) {
  return /\b(new|start|begin|guide|help|hi|hello|hey)\b/i.test(message);
}

export function fallbackCoachResponse(context: string, message: string) {
  const profile = parseJsonSection<ProfileSummary>(context, "Profile");
  const twin = parseJsonSection<TwinSummary>(context, "Carbon Twin");
  const entries = parseRecentEntries(context);
  const topRecentCategory = getTopRecentCategory(entries);
  const requestedCategory = findCategoryFromMessage(message);
  const focusCategory = requestedCategory ?? twin?.topEmissionSource ?? topRecentCategory?.[0] ?? "Transport";
  const actions = getRecommendedActions(focusCategory);
  const recentKg = topRecentCategory?.[0] === focusCategory ? topRecentCategory[1] : undefined;
  const nextPlanItem = getNextPlanItem(context);
  const name = firstName(profile);
  const greeting = name ? `Hi ${name}. ` : "";
  const baseline = twin?.baselineKgCo2eMonthly
    ? `Your current monthly baseline is about ${Math.round(twin.baselineKgCo2eMonthly)} kg CO2e. `
    : "";
  const recentEvidence = recentKg
    ? `Your recent ${focusCategory.toLowerCase()} entries add up to about ${Math.round(recentKg)} kg CO2e, so this is a useful place to act. `
    : "";
  const goal = twin?.userGoal ? `This supports your goal: ${twin.userGoal}. ` : "";
  const nextStep = nextPlanItem ? `Your next plan step is "${nextPlanItem}".` : `Start with this today: ${actions[0]}.`;

  if (isOnboardingQuestion(message)) {
    return [
      `Using local sustainability insights: ${greeting}Start with a simple three-step path.`,
      `1. Log one normal week of transport, food, energy, shopping, and waste.`,
      `2. Build or refresh your Carbon Twin so it can identify your biggest lever.`,
      `3. Focus first on ${focusCategory.toLowerCase()}: ${actions[0]}. ${baseline}${goal}`,
      nextStep
    ].join("\n\n");
  }

  return [
    `Using local sustainability insights: ${greeting}${baseline}${recentEvidence}${twin?.biggestOpportunity ?? `Your best next lever appears to be ${focusCategory.toLowerCase()}.`}`,
    `Try this: ${actions[0]}. Then ${actions[1]}. If you want a stretch goal, ${actions[2]}.`,
    `${goal}${nextStep}`
  ].join("\n\n");
}

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
