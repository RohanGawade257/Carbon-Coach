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
      planProgress: DashboardInsight & {
        title: string;
        completedDays: number;
        totalDays: number;
        remainingDays: number;
        completionPercentage: number;
        estimatedSavingsKgCo2e: number;
        completedEstimatedSavings: number;
        totalEstimatedSavings: number;
        projectedReductionPercent: number;
        currentStreakDays: number;
      };
    };
    futureYou: DashboardInsight & {
      currentEmissions: number;
      projectedEmissions: number;
      estimatedReductionKg: number;
      estimatedReductionPercent: number;
      timeframeDays: number;
      progressionMessages?: string[];
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
    progression: {
      score: number;
      grade: string;
      level: string;
      nextLevelTarget: number | null;
      nextLevelName: string | null;
      monthlyMission: {
        title: string;
        description: string;
        category: string;
        progress: number;
        reward: number;
        completed: boolean;
      };
      futureYouMessages: string[];
    };
  };
};

export type LocalInsightsMeta = {
  usedLocalInsights?: boolean;
  reusedExistingPlan?: boolean;
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
  leaderboard: {
    leaderboard: Array<{
      rank: number;
      id: string;
      displayName: string;
      currentStreak: number;
      carbonScore: number;
      entriesCount: number;
      isCurrentUser: boolean;
      avatarSeed: string;
    }>;
  };
};
