import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma client
vi.mock("../../config/prisma", () => ({
  prisma: {
    userProfile: {
      findUnique: vi.fn(),
    },
    footprintEntry: {
      findMany: vi.fn(),
    },
    carbonTwinProfile: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
    },
    carbonTwinSimulation: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    actionPlan: {
      findFirst: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
      findUnique: vi.fn(),
    },
    actionPlanItem: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(prismaMock)),
    $executeRaw: vi.fn(),
  },
}));

// Mock structuredAi.service.ts
vi.mock("../ai/structuredAi.service", () => ({
  generateStructuredAiResult: vi.fn(),
}));

// Mock badgesService
vi.mock("../badges/badges.service", () => ({
  badgesService: {
    evaluateForUser: vi.fn(),
  },
}));

// Mock usersService
vi.mock("../users/users.service", () => ({
  usersService: {
    updateUserCarbonScore: vi.fn(),
  },
}));

import { carbonTwinService } from "./carbonTwin.service";
import { prisma } from "../../config/prisma";
import { generateStructuredAiResult } from "../ai/structuredAi.service";
import { badgesService } from "../badges/badges.service";
import { usersService } from "../users/users.service";

const prismaMock = prisma as any;

describe("Carbon Twin Service Tests", () => {
  const userId = "user-abc";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("build", () => {
    it("should throw error if user profile is missing", async () => {
      vi.mocked(prisma.userProfile.findUnique).mockResolvedValue(null);

      await expect(carbonTwinService.build(userId)).rejects.toThrow(
        "Complete onboarding before building Carbon Twin"
      );
    });

    it("should successfully build carbon twin profile", async () => {
      const mockProfile = {
        userId,
        homeType: "Apartment",
        householdSize: 2,
        transportMode: "Car",
        energySource: "Grid",
        dietType: "Omnivore",
        goalReason: "Save planet",
      };
      vi.mocked(prisma.userProfile.findUnique).mockResolvedValue(mockProfile as any);
      vi.mocked(prisma.footprintEntry.findMany).mockResolvedValue([]);
      
      const mockAiResult = {
        data: {
          baselineKgCo2eMonthly: 300,
          topEmissionSource: "Transport",
          biggestOpportunity: "Drive less",
          userGoal: "Save planet",
          userConstraints: "Constraints",
          summary: "Summary text",
        },
        usedFallback: false,
      };
      vi.mocked(generateStructuredAiResult).mockResolvedValue(mockAiResult as any);
      vi.mocked(prisma.carbonTwinProfile.upsert).mockResolvedValue({ id: "twin-123" } as any);

      const result = await carbonTwinService.build(userId);

      expect(prisma.userProfile.findUnique).toHaveBeenCalledWith({ where: { userId } });
      expect(generateStructuredAiResult).toHaveBeenCalled();
      expect(prisma.carbonTwinProfile.upsert).toHaveBeenCalled();
      expect(result.twin).toEqual({ id: "twin-123" });
      expect(result.usedLocalInsights).toBe(false);
    });
  });

  describe("simulate", () => {
    it("should create simulation scenario from baseline", async () => {
      const mockTwin = {
        id: "twin-123",
        baselineKgCo2eMonthly: 450.0,
        topEmissionSource: "Transport",
      };
      vi.mocked(prisma.carbonTwinProfile.findUnique).mockResolvedValue(mockTwin as any);

      const mockAiResult = {
        data: {
          scenarioName: "Solar simulation",
          projectedKgCo2e: 380,
          estimatedSavingsKgCo2e: 70,
          assumptions: { panelSize: "large" },
        },
        usedFallback: false,
      };
      vi.mocked(generateStructuredAiResult).mockResolvedValue(mockAiResult as any);
      
      vi.mocked(prisma.carbonTwinSimulation.create).mockResolvedValue({
        id: "sim-789",
        scenarioName: "Solar simulation",
      } as any);

      const result = await carbonTwinService.simulate(userId, {
        days: 30,
        assumptions: { savingsPercent: 15, scenarioName: "Solar simulation" },
      });

      expect(prisma.carbonTwinProfile.findUnique).toHaveBeenCalledWith({ where: { userId } });
      expect(prisma.carbonTwinSimulation.create).toHaveBeenCalled();
      expect(result.simulation.id).toBe("sim-789");
    });
  });

  describe("generateActionPlan", () => {
    it("should return active action plan if one already exists", async () => {
      const activePlan = { id: "plan-123", status: "Active", items: [] };
      vi.mocked(prisma.actionPlan.findFirst).mockResolvedValue(activePlan as any);

      const result = await carbonTwinService.generateActionPlan(userId);

      expect(prisma.actionPlan.findFirst).toHaveBeenCalled();
      expect(result.actionPlan).toEqual(activePlan);
      expect(result.reusedExistingPlan).toBe(true);
    });

    it("should generate a new action plan using AI fallbacks if no active plan exists", async () => {
      vi.mocked(prisma.actionPlan.findFirst).mockResolvedValue(null);

      const mockTwin = {
        id: "twin-123",
        baselineKgCo2eMonthly: 450.0,
        topEmissionSource: "Transport",
      };
      vi.mocked(prisma.carbonTwinProfile.findUnique).mockResolvedValue(mockTwin as any);

      const mockAiResult = {
        data: {
          title: "New 30-Day Plan",
          summary: "Save carbon",
          days: [
            { dayNumber: 1, title: "Day 1 Action", description: "Desc", category: "Transport", estimatedSavingsKgCo2e: 12.0, difficulty: "Easy" }
          ],
        },
        usedFallback: true,
      };
      vi.mocked(generateStructuredAiResult).mockResolvedValue(mockAiResult as any);

      // Setup mock transaction return value
      const createdPlan = { id: "plan-new", title: "New 30-Day Plan", items: [] };
      vi.mocked(prisma.actionPlan.create).mockResolvedValue(createdPlan as any);
      // Under $transaction, prismaMock will return createdPlan
      prismaMock.actionPlan.findFirst.mockResolvedValue(null);
      prismaMock.actionPlan.create.mockResolvedValue(createdPlan);

      const result = await carbonTwinService.generateActionPlan(userId);

      expect(result.actionPlan.id).toBe("plan-new");
      expect(result.reusedExistingPlan).toBe(false);
      expect(result.usedLocalInsights).toBe(true);
    });
  });

  describe("updateActionItem", () => {
    it("should update action item and trigger score/badge calculations on complete", async () => {
      const mockItem = {
        id: "item-123",
        actionPlanId: "plan-123",
        actionPlan: { userId },
      };
      vi.mocked(prisma.actionPlanItem.findUnique).mockResolvedValue(mockItem as any);
      vi.mocked(prisma.actionPlanItem.update).mockResolvedValue({ id: "item-123", status: "Completed" } as any);
      vi.mocked(prisma.actionPlan.findUnique).mockResolvedValue({ id: "plan-123", items: [] } as any);

      const result = await carbonTwinService.updateActionItem(userId, "item-123", "Completed");

      expect(prisma.actionPlanItem.findUnique).toHaveBeenCalledWith({
        where: { id: "item-123" },
        include: { actionPlan: true },
      });
      expect(prisma.actionPlanItem.update).toHaveBeenCalledWith({
        where: { id: "item-123" },
        data: { status: "Completed" },
      });
      expect(badgesService.evaluateForUser).toHaveBeenCalledWith(userId);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { points: { increment: 50 } },
      });
      expect(usersService.updateUserCarbonScore).toHaveBeenCalledWith(userId);
      expect(result.item.status).toBe("Completed");
    });
  });
});
