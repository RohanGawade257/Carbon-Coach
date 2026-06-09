import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import { emissionsService } from "../emissions/emissions.service";
import { badgesService } from "../badges/badges.service";
import { usersService } from "../users/users.service";

export const footprintService = {
  async calculate(input: { categoryId: string; activityType: string; quantity: number }) {
    return emissionsService.calculate(input);
  },

  async createEntry(
    userId: string,
    input: {
      categoryId: string;
      activityType: string;
      quantity: number;
      occurredAt: Date;
      notes?: string;
    }
  ) {
    const result = await emissionsService.calculate(input);

    const entry = await prisma.footprintEntry.create({
      data: {
        userId,
        categoryId: input.categoryId,
        emissionFactorId: result.factor.id,
        activityType: input.activityType,
        quantity: input.quantity,
        unit: result.factor.unit,
        kgCo2e: result.kgCo2e,
        occurredAt: input.occurredAt,
        notes: input.notes
      },
      include: {
        category: true,
        emissionFactor: true
      }
    });

    // Update streak
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const todayStr = new Date().toISOString().split("T")[0];
      let newStreak = user.currentStreak;

      if (!user.lastLogDate) {
        newStreak = 1;
      } else {
        const lastDate = new Date(user.lastLogDate);
        const todayDate = new Date(todayStr);
        const diffTime = todayDate.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          currentStreak: newStreak,
          lastLogDate: todayStr
        }
      });
    }

    await usersService.updateUserCarbonScore(userId);
    await badgesService.evaluateForUser(userId);
    return entry;
  },

  async listEntries(userId: string, filters: { categoryId?: string; from?: Date; to?: Date }) {
    return prisma.footprintEntry.findMany({
      where: {
        userId,
        categoryId: filters.categoryId,
        occurredAt: {
          gte: filters.from,
          lte: filters.to
        }
      },
      orderBy: { occurredAt: "desc" },
      include: {
        category: true,
        emissionFactor: true
      },
      take: 100
    });
  },

  async deleteEntry(userId: string, id: string) {
    const entry = await prisma.footprintEntry.findFirst({
      where: { id, userId }
    });

    if (!entry) {
      throw new AppError("Footprint entry not found", 404, "ENTRY_NOT_FOUND");
    }

    await prisma.footprintEntry.delete({ where: { id } });
    await usersService.updateUserCarbonScore(userId);
    return { success: true };
  }
};


