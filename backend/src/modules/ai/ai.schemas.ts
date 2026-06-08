import { z } from "zod";

export const createConversationSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(80).optional()
  }).optional()
});

export const conversationParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  })
});

export const sendMessageSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    content: z.string().min(1).max(1500)
  })
});

