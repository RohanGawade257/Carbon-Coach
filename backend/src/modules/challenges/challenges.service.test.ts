import { describe, it, expect, vi, beforeEach } from "vitest";

// Hoisting-safe module mocking
vi.mock("../../config/prisma", () => ({
  prisma: {
    challenge: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    userChallenge: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}));

vi.mock("../badges/badges.service", () => ({
  badgesService: {
    evaluateForUser: vi.fn(),
  },
}));

vi.mock("../users/users.service", () => ({
  usersService: {
    updateUserCarbonScore: vi.fn(),
  },
}));

import { challengesService } from "./challenges.service";
import { prisma } from "../../config/prisma";
import { badgesService } from "../badges/badges.service";
import { usersService } from "../users/users.service";

describe("Challenges Service - Points & Participation", () => {
  const userId = "user-123";
  const challengeId = "challenge-abc";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should list challenges with participation details", async () => {
    const mockChallenges = [
      { id: "c1", title: "No Car Monday", userChallenges: [] },
      { id: "c2", title: "Vegan Food Only", userChallenges: [{ userId, status: "Joined" }] },
    ];
    vi.mocked(prisma.challenge.findMany).mockResolvedValue(mockChallenges as any);

    const result = await challengesService.list(userId);
    expect(prisma.challenge.findMany).toHaveBeenCalled();
    expect(result).toHaveLength(2);
    expect(result[1].userChallenges[0].status).toBe("Joined");
  });

  it("should allow a user to join an existing challenge", async () => {
    const mockChallenge = { id: challengeId, title: "Eco-Hero", points: 80 };
    vi.mocked(prisma.challenge.findUnique).mockResolvedValue(mockChallenge as any);
    vi.mocked(prisma.userChallenge.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.userChallenge.create).mockResolvedValue({
      id: "uc-123",
      userId,
      challengeId,
      status: "Joined",
      progressValue: 0,
    } as any);

    const result = await challengesService.join(userId, challengeId);
    expect(prisma.challenge.findUnique).toHaveBeenCalledWith({ where: { id: challengeId } });
    expect(prisma.userChallenge.create).toHaveBeenCalledWith({
      data: {
        userId,
        challengeId,
        status: "Joined",
        progressValue: 0,
      },
      include: { challenge: { include: { category: true } } },
    });
    expect(result.status).toBe("Joined");
    expect(badgesService.evaluateForUser).toHaveBeenCalledWith(userId);
  });

  it("should award 100 points when a user updates their challenge status to Completed", async () => {
    const mockUserChallenge = {
      id: "uc-123",
      userId,
      challengeId,
      status: "Joined",
      progressValue: 45,
    };
    vi.mocked(prisma.userChallenge.findFirst).mockResolvedValue(mockUserChallenge as any);
    vi.mocked(prisma.userChallenge.update).mockResolvedValue({
      ...mockUserChallenge,
      status: "Completed",
      progressValue: 100,
    } as any);

    const result = await challengesService.update(userId, "uc-123", {
      status: "Completed",
    });

    expect(prisma.userChallenge.update).toHaveBeenCalledWith({
      where: { id: "uc-123" },
      data: expect.objectContaining({
        status: "Completed",
        progressValue: mockUserChallenge.progressValue, // since it wasn't specified in input
      }),
      include: { challenge: { include: { category: true } } },
    });

    // Check points reward increment
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { points: { increment: 100 } },
    });
    expect(badgesService.evaluateForUser).toHaveBeenCalledWith(userId);
    expect(result.status).toBe("Completed");
  });

  it("should award 100 points when a user explicitly completes a challenge", async () => {
    const mockUserChallenge = {
      id: "uc-123",
      userId,
      challengeId,
      status: "Joined",
    };
    vi.mocked(prisma.userChallenge.findUnique).mockResolvedValue(mockUserChallenge as any);
    vi.mocked(prisma.userChallenge.update).mockResolvedValue({
      ...mockUserChallenge,
      status: "Completed",
      progressValue: 100,
    } as any);

    const result = await challengesService.completeChallenge(userId, challengeId);

    expect(prisma.userChallenge.update).toHaveBeenCalledWith({
      where: { id: "uc-123" },
      data: expect.objectContaining({
        status: "Completed",
        progressValue: 100,
      }),
      include: { challenge: { include: { category: true } } },
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { points: { increment: 100 } },
    });
    expect(result.status).toBe("Completed");
  });
});
