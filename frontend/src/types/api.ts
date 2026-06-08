import {
  ActionPlan,
  AiConversation,
  AiMessage,
  Badge,
  CarbonTwinProfile,
  CarbonTwinSimulation,
  Challenge,
  EmissionCategory,
  FootprintEntry,
  Recommendation,
  User,
  UserChallenge,
  UserProfile
} from "./domain";

export type AuthResponse = {
  user: User;
  token: string;
  isDemo?: boolean;
};

export type DashboardInsight = {
  explanation: string;
  recommendationHint: string;
};

export type DashboardResponse = {
  dashboard: {
    widgets: {
      monthlyFootprint: DashboardInsight & { title: string; value: number; unit: string; deltaPercent: number };
      baselineComparison: DashboardInsight & { title: string; value: number; unit: string };
      topCategory: DashboardInsight & { title: string; value: string; kgCo2e: number; percentage: number };
      estimatedSavings: DashboardInsight & { title: string; value: number; unit: string };
    };
    charts: {
      categoryBreakdown: Array<DashboardInsight & { category: string; kgCo2e: number; percentage: number }>;
      monthlyTrend: DashboardInsight & { data: Array<{ month: string; kgCo2e: number }> };
      carbonTwinProjection: DashboardInsight & { data: Array<{ label: string; baseline: number; actionPlan: number }> };
    };
    actionPlanPreview: ActionPlan | null;
    recommendations: Recommendation[];
    activeChallenges: UserChallenge[];
    recentBadges: Array<{ id: string; awardedAt: string; badge: Badge }>;
    recentActivity: FootprintEntry[];
    carbonTwin: CarbonTwinProfile | null;
  };
};

export type ApiShapes = {
  categories: { categories: EmissionCategory[] };
  profile: { profile: UserProfile | null };
  footprintEntries: { entries: FootprintEntry[] };
  carbonTwin: { twin: CarbonTwinProfile | null; simulations: CarbonTwinSimulation[]; latestPlan: ActionPlan | null };
  actionPlan: { actionPlan: ActionPlan };
  recommendations: { recommendations: Recommendation[] };
  challenges: { challenges: Challenge[] };
  badges: { badges: Badge[] };
  conversations: { conversations: AiConversation[] };
  conversation: { conversation: AiConversation };
  message: { message: AiMessage };
  userChallenge: { userChallenge: UserChallenge };
};

