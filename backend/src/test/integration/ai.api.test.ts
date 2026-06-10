import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

// Mock the database client for middleware auth
vi.mock("../../config/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock the AI service
vi.mock("../../modules/ai/ai.service", () => ({
  aiService: {
    createConversation: vi.fn(),
    listConversations: vi.fn(),
    getConversation: vi.fn(),
    sendMessage: vi.fn(),
  },
}));

import { app } from "../../app";
import { prisma } from "../../config/prisma";
import { aiService } from "../../modules/ai/ai.service";
import { signToken } from "../../shared/utils/jwt";

describe("AI Coach API Integration Tests", () => {
  const userId = "user-123";
  const conversationUuid = "f3d331f2-1fb8-4171-aa31-e18e698888e2";
  let token: string;

  beforeEach(() => {
    vi.clearAllMocks();

    token = signToken({ userId, email: "user@example.com" });

    // Mock auth verification
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: userId,
      email: "user@example.com",
      displayName: "Logged In User",
    } as any);
  });

  describe("POST /api/ai/conversations", () => {
    it("should successfully create a new AI conversation", async () => {
      const mockConversation = {
        id: conversationUuid,
        userId,
        title: "Sustainability Coaching",
        createdAt: new Date().toISOString(),
      };
      vi.mocked(aiService.createConversation).mockResolvedValue(mockConversation as any);

      const response = await request(app)
        .post("/api/ai/conversations")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Commute Habits",
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ conversation: mockConversation });
      expect(aiService.createConversation).toHaveBeenCalledWith(userId, "Commute Habits");
    });
  });

  describe("GET /api/ai/conversations", () => {
    it("should list conversations of the authenticated user", async () => {
      const mockList = [
        { id: "c1", title: "Coaching Session 1" },
        { id: "c2", title: "Coaching Session 2" },
      ];
      vi.mocked(aiService.listConversations).mockResolvedValue(mockList as any);

      const response = await request(app)
        .get("/api/ai/conversations")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ conversations: mockList });
      expect(aiService.listConversations).toHaveBeenCalledWith(userId);
    });
  });

  describe("POST /api/ai/conversations/:id/messages", () => {
    it("should successfully post a message and get AI response", async () => {
      const mockAiResponse = {
        id: "msg-456",
        conversationId: conversationUuid,
        role: "assistant",
        content: "To reduce your transport carbon, swap one car trip with public transit.",
        model: "mock-gemini-model",
        createdAt: new Date().toISOString(),
      };

      vi.mocked(aiService.sendMessage).mockResolvedValue(mockAiResponse as any);

      const response = await request(app)
        .post(`/api/ai/conversations/${conversationUuid}/messages`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          content: "How do I cut down my travel footprint?",
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: mockAiResponse });
      expect(aiService.sendMessage).toHaveBeenCalledWith(
        userId,
        conversationUuid,
        "How do I cut down my travel footprint?"
      );
    });

    it("should fail validation if content is empty", async () => {
      const response = await request(app)
        .post(`/api/ai/conversations/${conversationUuid}/messages`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          content: "", // empty message
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });
  });
});
