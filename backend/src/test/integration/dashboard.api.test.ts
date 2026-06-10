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

// Mock the dashboard service calculation logic
vi.mock("../../modules/dashboard/dashboard.service", () => ({
  dashboardService: {
    overview: vi.fn(),
  },
}));

import { app } from "../../app";
import { prisma } from "../../config/prisma";
import { dashboardService } from "../../modules/dashboard/dashboard.service";
import { signToken } from "../../shared/utils/jwt";

describe("Dashboard API Integration Tests", () => {
  const userId = "user-123";
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

  describe("GET /api/dashboard/overview", () => {
    it("should return dashboard statistics successfully when authenticated", async () => {
      const mockOverview = {
        monthlyBaseline: 420.5,
        monthlyCurrent: 380.2,
        savingsKg: 40.3,
        streak: 3,
        points: 120,
        categoryTotals: [
          { category: "Transport", kgCo2e: 180 },
          { category: "Food", kgCo2e: 120 },
        ],
        insights: ["You saved 10% more compared to last month!"],
      };

      vi.mocked(dashboardService.overview).mockResolvedValue(mockOverview as any);

      const response = await request(app)
        .get("/api/dashboard/overview")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("dashboard");
      expect(response.body.dashboard.monthlyBaseline).toBe(420.5);
      expect(response.body.dashboard.streak).toBe(3);
      expect(response.body.dashboard.categoryTotals).toHaveLength(2);
      expect(dashboardService.overview).toHaveBeenCalledWith(userId);
    });

    it("should return 401 when unauthorized", async () => {
      const response = await request(app).get("/api/dashboard/overview");
      expect(response.status).toBe(401);
    });
  });
});
