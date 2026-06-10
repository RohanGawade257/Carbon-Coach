import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

// Mock the database client
vi.mock("../../config/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { app } from "../../app";
import { prisma } from "../../config/prisma";
import { hashPassword } from "../../shared/utils/password";

describe("Auth API Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should successfully register a new user", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: "new-user-123",
        email: "register@example.com",
        displayName: "New User",
        currentStreak: 0,
        lastLogDate: null,
        carbonScore: 0,
        points: 0,
        profile: null,
      } as any);

      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "register@example.com",
          password: "password12345",
          displayName: "New User",
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token");
      expect(response.body.user).toEqual(
        expect.objectContaining({
          email: "register@example.com",
          displayName: "New User",
          isDemo: false,
        })
      );
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it("should reject registration if email is already taken", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "existing-user-id",
        email: "taken@example.com",
      } as any);

      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "taken@example.com",
          password: "password12345",
          displayName: "Existing User",
        });

      expect(response.status).toBe(409);
      expect(response.body.error.message).toBe("Email is already registered");
    });

    it("should fail validation on invalid payload", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "invalid-email",
          password: "short",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      const plainPassword = "validpassword123";
      const hashedPassword = await hashPassword(plainPassword);

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-123",
        email: "user@example.com",
        passwordHash: hashedPassword,
        displayName: "Logged In User",
        currentStreak: 2,
        lastLogDate: "2026-06-09",
        carbonScore: 400,
        points: 500,
        profile: { id: "profile-123" },
      } as any);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "user@example.com",
          password: plainPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body.user.displayName).toBe("Logged In User");
      expect(response.body.user.hasProfile).toBe(true);
    });

    it("should fail login with incorrect password", async () => {
      const hashedPassword = await hashPassword("realpassword");

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-123",
        email: "user@example.com",
        passwordHash: hashedPassword,
      } as any);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "user@example.com",
          password: "wrongpassword",
        });

      expect(response.status).toBe(401);
      expect(response.body.error.message).toBe("Invalid email or password");
    });
  });

  describe("Route Protection & Token Handling", () => {
    it("should block request with 401 when Authorization header is missing", async () => {
      const response = await request(app).get("/api/users/me");
      expect(response.status).toBe(401);
      expect(response.body.error.message).toBe("Authentication required");
    });

    it("should block request with 401 when token is invalid or corrupt", async () => {
      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", "Bearer invalidTokenContentHere");

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe("INVALID_SESSION");
    });
  });
});
