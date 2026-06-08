import { z } from "zod";

export const difficultySchema = z.enum(["Easy", "Medium", "Hard"]);

export const carbonTwinProfileAiSchema = z.object({
  topEmissionSource: z.string().min(2),
  biggestOpportunity: z.string().min(2),
  userGoal: z.string().min(2),
  userConstraints: z.string().min(2),
  baselineKgCo2eMonthly: z.coerce.number().nonnegative(),
  summary: z.string().min(10)
});

export const recommendationAiSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(2),
  estimatedSavingsKgCo2e: z.coerce.number().nonnegative(),
  difficulty: difficultySchema,
  actions: z.array(z.string().min(3)).min(1)
});

export const recommendationListAiSchema = z.array(recommendationAiSchema).min(1).max(6);

export const actionPlanAiSchema = z.object({
  title: z.string().min(3),
  summary: z.string().min(10),
  days: z.array(
    z.object({
      dayNumber: z.coerce.number().int().min(1).max(30),
      title: z.string().min(3),
      description: z.string().min(10),
      category: z.string().min(2),
      estimatedSavingsKgCo2e: z.coerce.number().nonnegative(),
      difficulty: difficultySchema
    })
  ).min(30).max(30)
});

export const dashboardExplanationAiSchema = z.object({
  metricName: z.string().min(2),
  explanation: z.string().min(10),
  recommendationHint: z.string().min(5)
});

export const simulationAiSchema = z.object({
  scenarioName: z.string().min(3),
  projectedKgCo2e: z.coerce.number().nonnegative(),
  estimatedSavingsKgCo2e: z.coerce.number().nonnegative(),
  assumptions: z.record(z.unknown()),
  explanation: z.string().min(10)
});

export type CarbonTwinProfileAi = z.infer<typeof carbonTwinProfileAiSchema>;
export type RecommendationAi = z.infer<typeof recommendationAiSchema>;
export type ActionPlanAi = z.infer<typeof actionPlanAiSchema>;
export type DashboardExplanationAi = z.infer<typeof dashboardExplanationAiSchema>;
export type SimulationAi = z.infer<typeof simulationAiSchema>;

