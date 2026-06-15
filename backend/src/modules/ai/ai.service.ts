import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import { buildTwinContext } from "../carbonTwin/twinContext.builder";
import { fallbackCoachResponse } from "./aiFallbacks";
import { generateGeminiTextResult } from "./gemini.client";
import { promptTemplates } from "./promptTemplates";

export const aiService = {
  async createConversation(userId: string, title?: string) {
    return prisma.aiConversation.create({
      data: {
        userId,
        title: title ?? "Sustainability Coaching"
      }
    });
  },

  async listConversations(userId: string) {
    return prisma.aiConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });
  },

  async getConversation(userId: string, id: string) {
    const conversation = await prisma.aiConversation.findFirst({
      where: { id, userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!conversation) {
      throw new AppError("Conversation not found", 404, "CONVERSATION_NOT_FOUND");
    }

    return conversation;
  },

  async sendMessage(userId: string, conversationId: string, content: string) {
    const conversation = await prisma.aiConversation.findFirst({
      where: { id: conversationId, userId }
    });

    if (!conversation) {
      throw new AppError("Conversation not found", 404, "CONVERSATION_NOT_FOUND");
    }

    const context = await buildTwinContext(userId);
    await prisma.aiMessage.create({
      data: {
        conversationId,
        role: "user",
        content,
        model: "user"
      }
    });

    const prompt = [
      promptTemplates.AI_COACH_SYSTEM_PROMPT(),
      promptTemplates.AI_COACH_CONTEXT_PROMPT(context, content)
    ].join("\n\n");

    const fallbackText = fallbackCoachResponse(context, content);
    const generatedResult = await generateGeminiTextResult(prompt, {
      maxOutputTokens: 700,
      temperature: 0.45
    }).catch((error) => {
      console.warn("AI Coach generation failed; using local fallback.", error);
      return null;
    });
    const aiText = generatedResult?.text ?? fallbackText;

    const assistantMessage = await prisma.aiMessage.create({
      data: {
        conversationId,
        role: "assistant",
        content: aiText,
        model: generatedResult?.model ?? "deterministic-fallback"
      }
    });

    await prisma.aiConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return assistantMessage;
  }
};
