import { prisma } from "../../config/prisma";
import { badgesService } from "../badges/badges.service";

export type ProfileInput = {
  country: string;
  householdSize: number;
  homeType: string;
  dietType: string;
  transportMode: string;
  energySource: string;
  goalReason: string;
};

export const profileService = {
  async get(userId: string) {
    return prisma.userProfile.findUnique({ where: { userId } });
  },

  async upsert(userId: string, input: ProfileInput) {
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: input,
      create: {
        userId,
        ...input
      }
    });

    await badgesService.evaluateForUser(userId);
    return profile;
  }
};

