import { z } from "zod";

export const simulateCarbonTwinSchema = z.object({
  body: z.object({
    days: z.coerce.number().int().min(7).max(365),
    assumptions: z.record(z.unknown()).default({})
  })
});

export const updateActionPlanItemSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    status: z.enum(["Pending", "Completed"])
  })
});

