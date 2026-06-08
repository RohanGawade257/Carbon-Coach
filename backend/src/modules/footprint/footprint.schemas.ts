import { z } from "zod";

export const calculateFootprintSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid(),
    activityType: z.string().min(2),
    quantity: z.coerce.number().positive()
  })
});

export const createFootprintEntrySchema = z.object({
  body: z.object({
    categoryId: z.string().uuid(),
    activityType: z.string().min(2),
    quantity: z.coerce.number().positive(),
    occurredAt: z.coerce.date(),
    notes: z.string().max(300).optional()
  })
});

export const listFootprintEntriesSchema = z.object({
  query: z.object({
    categoryId: z.string().uuid().optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional()
  }).optional()
});

export const footprintEntryParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  })
});

