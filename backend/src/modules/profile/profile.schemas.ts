import { z } from "zod";

export const upsertProfileSchema = z.object({
  body: z.object({
    country: z.string().min(2).max(80),
    householdSize: z.coerce.number().int().min(1).max(20),
    homeType: z.string().min(2).max(80),
    dietType: z.string().min(2).max(80),
    transportMode: z.string().min(2).max(80),
    energySource: z.string().min(2).max(80),
    goalReason: z.string().min(5).max(280)
  })
});

