import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import { calculateKgCo2e } from "../../shared/utils/carbonMath";

export const emissionsService = {
  async listCategories() {
    return prisma.emissionCategory.findMany({
      orderBy: { name: "asc" },
      include: {
        emissionFactors: {
          orderBy: { activityType: "asc" }
        }
      }
    });
  },

  async calculate(input: { categoryId: string; activityType: string; quantity: number }) {
    const factor = await prisma.emissionFactor.findFirst({
      where: {
        categoryId: input.categoryId,
        activityType: input.activityType
      },
      include: { category: true }
    });

    if (!factor) {
      throw new AppError("Emission factor not found for this activity", 404, "FACTOR_NOT_FOUND");
    }

    const kgCo2e = calculateKgCo2e(input.quantity, Number(factor.kgCo2ePerUnit));

    return {
      kgCo2e,
      factor: {
        id: factor.id,
        categoryId: factor.categoryId,
        categoryName: factor.category.name,
        activityType: factor.activityType,
        unit: factor.unit,
        kgCo2ePerUnit: Number(factor.kgCo2ePerUnit),
        source: factor.source
      }
    };
  }
};

