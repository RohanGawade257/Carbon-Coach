import { describe, it, expect, vi, beforeEach } from "vitest";

// Hoisting-safe module mocking
vi.mock("../../config/prisma", () => ({
  prisma: {
    badge: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    userBadge: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    userProfile: {
      findUnique: vi.fn(),
    },
    footprintEntry: {
      count: vi.fn(),
    },
    userChallenge: {
      count: vi.fn(),
    },
    recommendation: {
      count: vi.fn(),
    },
    actionPlanItem: {
      count: vi.fn(),
    },
  },
}));

import { badgesService } from "./badges.service";
import { prisma } from "../../config/prisma";
import { badgeRules } from "./badgeRules";

describe("Badges Service - Achievements Evaluation", () => {
  const userId = "user-123";

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock behavior to return null/0 for counts (no badges awarded)
    vi.mocked(prisma.userProfile.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.footprintEntry.count).mockResolvedValue(0);
    vi.mocked(prisma.userChallenge.count).mockResolvedValue(0);
    vi.mocked(prisma.recommendation.count).mockResolvedValue(0);
    vi.mocked(prisma.actionPlanItem.count).mockResolvedValue(0);

    // Mock findUnique for badges so rule key resolution passes
    vi.mocked(prisma.badge.findUnique).mockImplementation((args: any) => {
      const ruleKey = args.where.ruleKey;
      return Promise.resolve({
        id: `badge-id-${ruleKey}`,
        name: `Badge ${ruleKey}`,
        ruleKey,
      } as any);
    });

    vi.mocked(prisma.userBadge.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.userBadge.create).mockImplementation((args: any) => {
      return Promise.resolve({
        id: "ub-new",
        userId: args.data.userId,
        badgeId: args.data.badgeId,
      } as any);
    });
  });

  it("should get all badges with user badge links", async () => {
    const mockBadges = [
      { id: "b1", name: "Eco Starter", userBadges: [] },
      { id: "b2", name: "Green Explorer", userBadges: [{ userId }] },
    ];
    vi.mocked(prisma.badge.findMany).mockResolvedValue(mockBadges as any);

    const result = await badgesService.getMine(userId);
    expect(prisma.badge.findMany).toHaveBeenCalledWith({
      orderBy: { name: "asc" },
      include: { userBadges: { where: { userId } } },
    });
    expect(result).toHaveLength(2);
  });

  it("should award ECO_STARTER if user has completed onboarding profile", async () => {
    vi.mocked(prisma.userProfile.findUnique).mockResolvedValue({ id: "profile-1" } as any);

    await badgesService.evaluateForUser(userId);

    // Should call create for ECO_STARTER
    expect(prisma.userBadge.create).toHaveBeenCalledWith({
      data: {
        userId,
        badgeId: `badge-id-${badgeRules.ECO_STARTER}`,
      },
    });
  });

  it("should award GREEN_EXPLORER if user has joined eco-challenges", async () => {
    // Return 1 for count of user challenges
    vi.mocked(prisma.userChallenge.count).mockImplementation((args: any) => {
      // If evaluating completed challenges count, return 0, else 1
      if (args.where && args.where.status === "Completed") return 0;
      return 1;
    });

    await badgesService.evaluateForUser(userId);

    // Should call create for GREEN_EXPLORER
    expect(prisma.userBadge.create).toHaveBeenCalledWith({
      data: {
        userId,
        badgeId: `badge-id-${badgeRules.GREEN_EXPLORER}`,
      },
    });
  });

  it("should award CARBON_REDUCER if user has completed recommendation or action plan items", async () => {
    vi.mocked(prisma.recommendation.count).mockResolvedValue(1);

    await badgesService.evaluateForUser(userId);

    expect(prisma.userBadge.create).toHaveBeenCalledWith({
      data: {
        userId,
        badgeId: `badge-id-${badgeRules.CARBON_REDUCER}`,
      },
    });
  });

  it("should award CLIMATE_CHAMPION if user has completed 4 or more reduction actions", async () => {
    // 2 completed challenges, 1 completed recommendation, 1 completed action item = 4
    vi.mocked(prisma.userChallenge.count).mockImplementation((args: any) => {
      if (args.where && args.where.status === "Completed") return 2;
      return 2; // total joined
    });
    vi.mocked(prisma.recommendation.count).mockResolvedValue(1);
    vi.mocked(prisma.actionPlanItem.count).mockResolvedValue(1);

    await badgesService.evaluateForUser(userId);

    expect(prisma.userBadge.create).toHaveBeenCalledWith({
      data: {
        userId,
        badgeId: `badge-id-${badgeRules.CLIMATE_CHAMPION}`,
      },
    });
  });
});
