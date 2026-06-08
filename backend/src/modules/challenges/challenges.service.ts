import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import { badgesService } from "../badges/badges.service";

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

    const userChallenge = await prisma.userChallenge.upsert({
      where: {
        userId_challengeId: {
          userId,
          challengeId
        }
      },
      update: {},
      create: {
        userId,
        challengeId,
        status: "Joined",
        progressValue: 0
      },
      include: { challenge: { include: { category: true } } }
    });

    await badgesService.evaluateForUser(userId);
    return userChallenge;
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
    }

    return updated;
  }
};

