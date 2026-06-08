import { z } from "zod";

export const updateRecommendationSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    status: z.enum(["New", "Accepted", "Dismissed", "Completed"])
  })
});

