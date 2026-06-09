import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import { badgesService } from "../badges/badges.service";
import { usersService } from "../users/users.service";

function isUniqueConstraintError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export const challengesService = {
  async list(userId: string) {
    return prisma.challenge.findMany({
      orderBy: { title: "asc" },
      include: {
        category: true,
        userChallenges: {
          where: { userId }
        }
      }
    });
  },

  async join(userId: string, challengeId: string) {
    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) {
      throw new AppError("Challenge not found", 404, "CHALLENGE_NOT_FOUND");
    }

    const where = {
      userId_challengeId: {
        userId,
        challengeId
      }
    };

    const existing = await prisma.userChallenge.findUnique({
      where,
      include: { challenge: { include: { category: true } } }
    });
    if (existing) return existing;

    try {
      const userChallenge = await prisma.userChallenge.create({
        data: {
          userId,
          challengeId,
          status: "Joined",
          progressValue: 0
        },
        include: { challenge: { include: { category: true } } }
      });

      await badgesService.evaluateForUser(userId);
      await usersService.updateUserCarbonScore(userId);
      return userChallenge;
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        const joined = await prisma.userChallenge.findUnique({
          where,
          include: { challenge: { include: { category: true } } }
        });
        if (joined) return joined;
      }
      throw error;
    }
  },

  async update(
    userId: string,
    id: string,
    input: {
      progressValue?: number;
      status?: "Joined" | "Completed";
    }
  ) {
    const userChallenge = await prisma.userChallenge.findFirst({
      where: { id, userId }
    });

    if (!userChallenge) {
      throw new AppError("User challenge not found", 404, "USER_CHALLENGE_NOT_FOUND");
    }

    const status = input.status ?? (input.progressValue === 100 ? "Completed" : userChallenge.status);
    const updated = await prisma.userChallenge.update({
      where: { id },
      data: {
        progressValue: input.progressValue ?? userChallenge.progressValue,
        status,
        completedAt: status === "Completed" ? new Date() : null
      },
      include: { challenge: { include: { category: true } } }
    });

    if (status === "Completed") {
      await badgesService.evaluateForUser(userId);
      await prisma.user.update({
        where: { id: userId },
        data: { points: { increment: 100 } }
      });
    }
    await usersService.updateUserCarbonScore(userId);

    return updated;
  },

  async completeChallenge(userId: string, challengeId?: string, userChallengeId?: string) {
    let userChallenge;
    if (userChallengeId) {
      userChallenge = await prisma.userChallenge.findFirst({
        where: { id: userChallengeId, userId }
      });
    } else if (challengeId) {
      userChallenge = await prisma.userChallenge.findUnique({
        where: {
          userId_challengeId: {
            userId,
            challengeId
          }
        }
      });
    }

    if (!userChallenge) {
      throw new AppError("User challenge not found", 404, "USER_CHALLENGE_NOT_FOUND");
    }

    if (userChallenge.status === "Completed") {
      return userChallenge;
    }

    const updated = await prisma.userChallenge.update({
      where: { id: userChallenge.id },
      data: {
        status: "Completed",
        progressValue: 100,
        completedAt: new Date()
      },
      include: { challenge: { include: { category: true } } }
    });

    await prisma.user.update({
      where: { id: userId },
      data: { points: { increment: 100 } }
    });

    await badgesService.evaluateForUser(userId);
    await usersService.updateUserCarbonScore(userId);

    return updated;
  }
};


