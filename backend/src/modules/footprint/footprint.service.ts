import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import { emissionsService } from "../emissions/emissions.service";
import { badgesService } from "../badges/badges.service";

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
    return { success: true };
  }
};

