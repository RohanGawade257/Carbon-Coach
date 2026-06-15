import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import { startOfMonth, endOfMonth, previousMonthRange } from "../../shared/utils/date";
import {
  computeCarbonScore,
  sumKg,
  categoryBreakdown,
  totalForCategory,
  buildMonthlyMission
} from "../../shared/utils/carbonScore";

export const usersService = {
  async getById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        createdAt: true,
        profile: true
      }
    });

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    return {
      ...user,
      hasProfile: Boolean(user.profile),
      isDemo: user.email === "demo@carboncoach.local"
    };
  },

  async updateUserCarbonScore(userId: string) {
    const now = new Date();
    const currentStart = startOfMonth(now);
    const currentEnd = endOfMonth(now);
    const previous = previousMonthRange(now);

    const [
      currentEntries,
      previousEntries,
      twin,
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
      prisma.carbonTwinProfile.findUnique({ where: { userId } }),
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
    const breakdown = categoryBreakdown(currentEntries);
    const top = breakdown[0] ?? {
      category: twin?.topEmissionSource ?? "Transport",
      kgCo2e: 0,
      percentage: 0
    };
    const baseline = twin ? Number(twin.baselineKgCo2eMonthly) : currentTotal;
    const missionCategory = top.category || twin?.topEmissionSource || "Transport";
    const missionResult = buildMonthlyMission({
      category: missionCategory,
      currentCategoryTotal: totalForCategory(currentEntries, missionCategory),
      previousCategoryTotal: totalForCategory(previousEntries, missionCategory),
      baseline,
      categoryPercentage: top.percentage
    });

    const newScore = computeCarbonScore({
      completedActionItems,
      completedChallenges,
      earnedBadges,
      completedRecommendations,
      baseline,
      currentTotal,
      missionCompleted: missionResult.completed
    });

    await prisma.user.update({
      where: { id: userId },
      data: { carbonScore: newScore }
    });
  },

  async getLeaderboard(userId: string) {
    const users = await prisma.user.findMany({
      orderBy: { carbonScore: "desc" },
      select: {
        id: true,
        displayName: true,
        currentStreak: true,
        carbonScore: true,
        _count: {
          select: { footprintEntries: true }
        }
      },
      take: 50
    });

    return users.map((user, idx) => ({
      rank: idx + 1,
      id: user.id,
      displayName: user.displayName,
      currentStreak: user.currentStreak,
      carbonScore: user.carbonScore,
      entriesCount: user._count.footprintEntries,
      isCurrentUser: user.id === userId,
      avatarSeed: user.displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    }));
  }
};



