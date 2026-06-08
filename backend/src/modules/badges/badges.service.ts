import { prisma } from "../../config/prisma";
import { badgeRules } from "./badgeRules";

async function award(userId: string, ruleKey: string) {
  const badge = await prisma.badge.findUnique({ where: { ruleKey } });
  if (!badge) return null;

  const where = {
    userId_badgeId: {
      userId,
      badgeId: badge.id
    }
  };

  const existing = await prisma.userBadge.findUnique({ where });
  if (existing) return existing;

  try {
    return await prisma.userBadge.create({
      data: {
        userId,
        badgeId: badge.id
      }
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return prisma.userBadge.findUnique({ where });
    }
    throw error;
  }
}

export const badgesService = {
  async getMine(userId: string) {
    return prisma.badge.findMany({
      orderBy: { name: "asc" },
      include: {
        userBadges: {
          where: { userId }
        }
      }
    });
  },

  async evaluateForUser(userId: string) {
    const [profile, entriesCount, challengesCount, completedChallenges, completedRecommendations, completedPlanItems] =
      await Promise.all([
        prisma.userProfile.findUnique({ where: { userId } }),
        prisma.footprintEntry.count({ where: { userId } }),
        prisma.userChallenge.count({ where: { userId } }),
        prisma.userChallenge.count({ where: { userId, status: "Completed" } }),
        prisma.recommendation.count({ where: { userId, status: "Completed" } }),
        prisma.actionPlanItem.count({
          where: {
            status: "Completed",
            actionPlan: { userId }
          }
        })
      ]);

    if (profile || entriesCount > 0) {
      await award(userId, badgeRules.ECO_STARTER);
    }

    if (challengesCount > 0) {
      await award(userId, badgeRules.GREEN_EXPLORER);
    }

    if (completedRecommendations > 0 || completedPlanItems > 0) {
      await award(userId, badgeRules.CARBON_REDUCER);
    }

    if (completedChallenges + completedRecommendations + completedPlanItems >= 4) {
      await award(userId, badgeRules.CLIMATE_CHAMPION);
    }
  }
};
