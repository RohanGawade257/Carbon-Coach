import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import { addDays, startOfMonth, endOfMonth } from "../../shared/utils/date";
import { fallbackActionPlan, fallbackCarbonTwin, fallbackSimulation } from "../ai/aiFallbacks";
import {
  actionPlanAiSchema,
  carbonTwinProfileAiSchema,
  simulationAiSchema
} from "../ai/aiResponse.schemas";
import { promptTemplates } from "../ai/promptTemplates";
import { generateStructuredAiResult } from "../ai/structuredAi.service";
import { badgesService } from "../badges/badges.service";

async function getCategoryTotals(userId: string) {
  const entries = await prisma.footprintEntry.findMany({
    where: {
      userId,
      occurredAt: {
        gte: startOfMonth(),
        lte: endOfMonth()
      }
    },
    include: { category: true }
  });

  const totals = new Map<string, number>();
  for (const entry of entries) {
    totals.set(entry.category.name, (totals.get(entry.category.name) ?? 0) + Number(entry.kgCo2e));
  }

  return {
    entries,
    totals: Array.from(totals.entries())
      .map(([category, kgCo2e]) => ({ category, kgCo2e: Math.round(kgCo2e * 100) / 100 }))
      .sort((a, b) => b.kgCo2e - a.kgCo2e)
  };
}

function buildConstraints(profile: {
  homeType: string;
  householdSize: number;
  transportMode: string;
  energySource: string;
  dietType: string;
}) {
  return [
    `Home: ${profile.homeType}`,
    `Household size: ${profile.householdSize}`,
    `Primary transport: ${profile.transportMode}`,
    `Energy source: ${profile.energySource}`,
    `Diet: ${profile.dietType}`
  ].join("; ");
}

export const carbonTwinService = {
  async build(userId: string) {
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new AppError("Complete onboarding before building Carbon Twin", 400, "PROFILE_REQUIRED");
    }

    const { totals } = await getCategoryTotals(userId);
    const baseline = totals.reduce((sum, item) => sum + item.kgCo2e, 0);
    const topCategory = totals[0]?.category ?? profile.transportMode ?? "Transport";
    const userConstraints = buildConstraints(profile);

    const context = JSON.stringify({
      profile,
      totals,
      baselineKgCo2eMonthly: baseline,
      topEmissionSource: topCategory,
      userGoal: profile.goalReason,
      userConstraints
    });

    const aiTwinResult = await generateStructuredAiResult(
      promptTemplates.CARBON_TWIN_PROFILE_PROMPT(context),
      carbonTwinProfileAiSchema,
      fallbackCarbonTwin({
        baselineKgCo2eMonthly: baseline,
        topEmissionSource: topCategory,
        userGoal: profile.goalReason,
        userConstraints
      })
    );
    const aiTwin = aiTwinResult.data;

    const twin = await prisma.carbonTwinProfile.upsert({
      where: { userId },
      update: {
        baselineKgCo2eMonthly: aiTwin.baselineKgCo2eMonthly,
        topEmissionSource: aiTwin.topEmissionSource,
        biggestOpportunity: aiTwin.biggestOpportunity,
        userGoal: aiTwin.userGoal,
        userConstraints: aiTwin.userConstraints,
        summary: aiTwin.summary
      },
      create: {
        userId,
        baselineKgCo2eMonthly: aiTwin.baselineKgCo2eMonthly,
        topEmissionSource: aiTwin.topEmissionSource,
        biggestOpportunity: aiTwin.biggestOpportunity,
        userGoal: aiTwin.userGoal,
        userConstraints: aiTwin.userConstraints,
        summary: aiTwin.summary
      }
    });

    return { twin, usedLocalInsights: aiTwinResult.usedFallback };
  },

  async get(userId: string) {
    const [twin, simulations, latestPlan] = await Promise.all([
      prisma.carbonTwinProfile.findUnique({ where: { userId } }),
      prisma.carbonTwinSimulation.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5
      }),
      prisma.actionPlan.findFirst({
        where: { userId, status: "Active" },
        orderBy: { createdAt: "desc" },
        include: { items: { orderBy: { dayNumber: "asc" } } }
      })
    ]);

    return { twin, simulations, latestPlan };
  },

  async simulate(userId: string, input: { days: number; assumptions: Record<string, unknown> }) {
    const existingTwin = await prisma.carbonTwinProfile.findUnique({ where: { userId } });
    const twin = existingTwin ?? (await this.build(userId)).twin;
    const savingsPercent = Number(input.assumptions.savingsPercent ?? 15);
    const scenarioName = String(input.assumptions.scenarioName ?? "30-Day Reduction Scenario");
    const fallback = fallbackSimulation({
      scenarioName,
      baselineKgCo2eMonthly: Number(twin.baselineKgCo2eMonthly),
      days: input.days,
      savingsPercent,
      assumptions: input.assumptions
    });

    const simulationResult = await generateStructuredAiResult(
      promptTemplates.REDUCTION_SIMULATION_PROMPT(JSON.stringify({ twin, days: input.days, assumptions: input.assumptions })),
      simulationAiSchema,
      fallback
    );
    const simulation = simulationResult.data;

    const created = await prisma.carbonTwinSimulation.create({
      data: {
        userId,
        scenarioName: simulation.scenarioName,
        days: input.days,
        projectedKgCo2e: simulation.projectedKgCo2e,
        estimatedSavingsKgCo2e: simulation.estimatedSavingsKgCo2e,
        assumptions: simulation.assumptions as Prisma.InputJsonValue
      }
    });

    return { simulation: created, usedLocalInsights: simulationResult.usedFallback };
  },

  async generateActionPlan(userId: string) {
    const existingTwin = await prisma.carbonTwinProfile.findUnique({ where: { userId } });
    const twin = existingTwin ?? (await this.build(userId)).twin;
    const context = JSON.stringify({
      twin: {
        ...twin,
        baselineKgCo2eMonthly: Number(twin.baselineKgCo2eMonthly)
      }
    });

    const planResult = await generateStructuredAiResult(
      promptTemplates.THIRTY_DAY_ACTION_PLAN_PROMPT(context),
      actionPlanAiSchema,
      fallbackActionPlan(twin.topEmissionSource)
    );
    const plan = planResult.data;

    await prisma.actionPlan.updateMany({
      where: { userId, status: "Active" },
      data: { status: "Archived" }
    });

    const startDate = new Date();
    const actionPlan = await prisma.actionPlan.create({
      data: {
        userId,
        title: plan.title,
        summary: plan.summary,
        startDate,
        endDate: addDays(startDate, 29),
        status: "Active",
        items: {
          create: plan.days.map((day) => ({
            dayNumber: day.dayNumber,
            title: day.title,
            description: day.description,
            category: day.category,
            estimatedSavingsKgCo2e: day.estimatedSavingsKgCo2e,
            difficulty: day.difficulty,
            status: "Pending"
          }))
        }
      },
      include: { items: { orderBy: { dayNumber: "asc" } } }
    });

    return { actionPlan, usedLocalInsights: planResult.usedFallback };
  },

  async updateActionItem(userId: string, id: string, status: "Pending" | "Completed") {
    const item = await prisma.actionPlanItem.findUnique({
      where: { id },
      include: { actionPlan: true }
    });

    if (!item || item.actionPlan.userId !== userId) {
      throw new AppError("Action plan item not found", 404, "ACTION_ITEM_NOT_FOUND");
    }

    const updated = await prisma.actionPlanItem.update({
      where: { id },
      data: { status }
    });

    if (status === "Completed") {
      await badgesService.evaluateForUser(userId);
    }

    return updated;
  }
};
