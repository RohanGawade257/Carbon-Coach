import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import { fallbackRecommendations } from "../ai/aiFallbacks";
import { recommendationListAiSchema } from "../ai/aiResponse.schemas";
import { promptTemplates } from "../ai/promptTemplates";
import { generateStructuredAiResult } from "../ai/structuredAi.service";
import { buildTwinContext } from "../carbonTwin/twinContext.builder";
import { badgesService } from "../badges/badges.service";

async function categoryForName(name: string) {
  const category = await prisma.emissionCategory.findFirst({
    where: {
      OR: [
        { name: { equals: name, mode: "insensitive" } },
        { slug: { equals: name.toLowerCase(), mode: "insensitive" } }
      ]
    }
  });

  if (category) return category;

  const fallback = await prisma.emissionCategory.findFirst({ orderBy: { name: "asc" } });
  if (!fallback) {
    throw new AppError("Emission categories are not seeded", 500, "CATEGORIES_MISSING");
  }
  return fallback;
}

export const recommendationsService = {
  async list(userId: string) {
    return prisma.recommendation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { category: true }
    });
  },

  async generate(userId: string) {
    const twin = await prisma.carbonTwinProfile.findUnique({ where: { userId } });
    const topCategory = twin?.topEmissionSource ?? "Transport";
    const context = await buildTwinContext(userId);
    const recommendationResult = await generateStructuredAiResult(
      promptTemplates.RECOMMENDATION_GENERATION_PROMPT(context),
      recommendationListAiSchema,
      fallbackRecommendations(topCategory)
    );
    const recommendations = recommendationResult.data;

    const created = [];
    for (const recommendation of recommendations) {
      const category = await categoryForName(recommendation.category);
      created.push(
        await prisma.recommendation.create({
          data: {
            userId,
            categoryId: category.id,
            title: recommendation.title,
            description: `${recommendation.description} Actions: ${recommendation.actions.join("; ")}`,
            estimatedSavingsKgCo2e: recommendation.estimatedSavingsKgCo2e,
            difficulty: recommendation.difficulty,
            status: "New",
            source: "AI"
          },
          include: { category: true }
        })
      );
    }

    return { recommendations: created, usedLocalInsights: recommendationResult.usedFallback };
  },

  async update(userId: string, id: string, status: "New" | "Accepted" | "Dismissed" | "Completed") {
    const recommendation = await prisma.recommendation.findFirst({
      where: { id, userId }
    });

    if (!recommendation) {
      throw new AppError("Recommendation not found", 404, "RECOMMENDATION_NOT_FOUND");
    }

    const updated = await prisma.recommendation.update({
      where: { id },
      data: { status },
      include: { category: true }
    });

    if (status === "Completed") {
      await badgesService.evaluateForUser(userId);
    }

    return updated;
  }
};
