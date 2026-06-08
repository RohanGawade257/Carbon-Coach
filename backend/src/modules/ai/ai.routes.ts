import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { aiRateLimit } from "../../middleware/rateLimitMiddleware";
import { validate } from "../../middleware/validateMiddleware";
import { aiController } from "./ai.controller";
import { conversationParamsSchema, createConversationSchema, sendMessageSchema } from "./ai.schemas";

export const aiRoutes = Router();

aiRoutes.post("/conversations", authMiddleware, aiRateLimit, validate(createConversationSchema), aiController.createConversation);
aiRoutes.get("/conversations", authMiddleware, aiController.listConversations);
aiRoutes.get("/conversations/:id", authMiddleware, validate(conversationParamsSchema), aiController.getConversation);
aiRoutes.post("/conversations/:id/messages", authMiddleware, aiRateLimit, validate(sendMessageSchema), aiController.sendMessage);

