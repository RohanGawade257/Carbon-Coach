import { z } from "zod";

export const challengeParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  })
});

export const updateUserChallengeSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    progressValue: z.coerce.number().int().min(0).max(100).optional(),
    status: z.enum(["Joined", "Completed"]).optional()
  })
});

