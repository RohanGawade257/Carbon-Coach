import { z } from "zod";

export const calculateEmissionSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid(),
    activityType: z.string().min(2),
    quantity: z.coerce.number().positive()
  })
});

