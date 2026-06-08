export type User = {
  id: string;
  email: string;
  displayName: string;
  hasProfile: boolean;
  isDemo: boolean;
};

export type UserProfile = {
  id: string;
  userId: string;
  country: string;
  householdSize: number;
  homeType: string;
  dietType: string;
  transportMode: string;
  energySource: string;
  goalReason: string;
};

export type EmissionFactor = {
  id: string;
  categoryId: string;
  activityType: string;
  unit: string;
  kgCo2ePerUnit: number | string;
  source: string;
};

export type EmissionCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  emissionFactors: EmissionFactor[];
};

export type FootprintEntry = {
  id: string;
  categoryId: string;
  activityType: string;
  quantity: number | string;
  unit: string;
  kgCo2e: number | string;
  occurredAt: string;
  notes?: string;
  category: EmissionCategory;
};

export type CarbonTwinProfile = {
  id: string;
  userId: string;
  baselineKgCo2eMonthly: number | string;
  topEmissionSource: string;
  biggestOpportunity: string;
  userGoal: string;
  userConstraints: string;
  summary: string;
  updatedAt: string;
};

export type CarbonTwinSimulation = {
  id: string;
  scenarioName: string;
  days: number;
  projectedKgCo2e: number | string;
  estimatedSavingsKgCo2e: number | string;
  assumptions: Record<string, unknown>;
  createdAt: string;
};

export type ActionPlanItem = {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  category: string;
  estimatedSavingsKgCo2e: number | string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "Pending" | "Completed";
};

export type ActionPlan = {
  id: string;
  title: string;
  summary: string;
  startDate: string;
  endDate: string;
  status: string;
  items: ActionPlanItem[];
};

export type Recommendation = {
  id: string;
  title: string;
  description: string;
  estimatedSavingsKgCo2e: number | string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "New" | "Accepted" | "Dismissed" | "Completed";
  source: string;
  category: EmissionCategory;
};

export type Challenge = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  points: number;
  durationDays: number;
  category: EmissionCategory;
  userChallenges: UserChallenge[];
};

export type UserChallenge = {
  id: string;
  status: "Joined" | "Completed";
  progressValue: number;
  startedAt: string;
  completedAt?: string;
  challenge: Challenge;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  iconKey: string;
  ruleKey: string;
  userBadges: { id: string; awardedAt: string }[];
};

export type AiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  model: string;
  createdAt: string;
};

export type AiConversation = {
  id: string;
  title: string;
  messages: AiMessage[];
  createdAt: string;
  updatedAt: string;
};

