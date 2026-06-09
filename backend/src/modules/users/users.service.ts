import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";

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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        footprintEntries: true,
        userChallenges: { where: { status: "Completed" } },
        actionPlans: {
          include: {
            items: { where: { status: "Completed" } }
          }
        }
      }
    });

    if (!user) return;

    const entryCount = user.footprintEntries.length;
    const completedChallengesCount = user.userChallenges.length;
    const completedActionItemsCount = user.actionPlans.reduce(
      (sum, plan) => sum + plan.items.length,
      0
    );
    const streakBonus = user.currentStreak * 50;

    const newScore = (entryCount * 10) + (completedChallengesCount * 200) + (completedActionItemsCount * 100) + streakBonus;

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
        email: true,
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



