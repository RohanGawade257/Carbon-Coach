import { describe, it, expect, vi, beforeEach } from "vitest";

// Define mock behaviors within factory callbacks to ensure they hoist correctly
vi.mock("../../config/prisma", () => ({
  prisma: {
    footprintEntry: {
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("../emissions/emissions.service", () => ({
  emissionsService: {
    calculate: vi.fn(),
  },
}));

vi.mock("../users/users.service", () => ({
  usersService: {
    updateUserCarbonScore: vi.fn(),
  },
}));

vi.mock("../badges/badges.service", () => ({
  badgesService: {
    evaluateForUser: vi.fn(),
  },
}));

import { footprintService } from "./footprint.service";
import { prisma } from "../../config/prisma";
import { emissionsService } from "../emissions/emissions.service";
import { usersService } from "../users/users.service";
import { badgesService } from "../badges/badges.service";

describe("Footprint Service - Streak & Points Logic", () => {
  const userId = "user-123";
  const mockInput = {
    categoryId: "cat-123",
    activityType: "car_km",
    quantity: 100,
    occurredAt: new Date(),
    notes: "Commute",
  };

  const mockCalculation = {
    kgCo2e: 19.2,
    factor: {
      id: "factor-123",
      unit: "km",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(emissionsService.calculate).mockResolvedValue(mockCalculation as any);
    vi.mocked(prisma.footprintEntry.create).mockResolvedValue({
      id: "entry-123",
      userId,
      ...mockInput,
      unit: "km",
      kgCo2e: 19.2,
    } as any);
  });

  it("should initialize streak to 1 when user logs their first entry", async () => {
    const mockUser = {
      id: userId,
      currentStreak: 0,
      lastLogDate: null,
      points: 100,
    };
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
    vi.mocked(prisma.user.update).mockResolvedValue({ ...mockUser, currentStreak: 1 } as any);

    await footprintService.createEntry(userId, mockInput);

    const todayStr = new Date().toISOString().split("T")[0];
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: {
        currentStreak: 1,
        lastLogDate: todayStr,
        points: { increment: 10 },
      },
    });
    expect(usersService.updateUserCarbonScore).toHaveBeenCalledWith(userId);
    expect(badgesService.evaluateForUser).toHaveBeenCalledWith(userId);
  });

  it("should increment streak when logging on consecutive days", async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const mockUser = {
      id: userId,
      currentStreak: 3,
      lastLogDate: yesterdayStr,
      points: 100,
    };
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

    await footprintService.createEntry(userId, mockInput);

    const todayStr = new Date().toISOString().split("T")[0];
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: {
        currentStreak: 4,
        lastLogDate: todayStr,
        points: { increment: 10 },
      },
    });
  });

  it("should reset streak to 1 if user missed days", async () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const threeDaysAgoStr = threeDaysAgo.toISOString().split("T")[0];

    const mockUser = {
      id: userId,
      currentStreak: 5,
      lastLogDate: threeDaysAgoStr,
      points: 200,
    };
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

    await footprintService.createEntry(userId, mockInput);

    const todayStr = new Date().toISOString().split("T")[0];
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: {
        currentStreak: 1,
        lastLogDate: todayStr,
        points: { increment: 10 },
      },
    });
  });

  it("should not increment streak if logging again on the same day", async () => {
    const todayStr = new Date().toISOString().split("T")[0];

    const mockUser = {
      id: userId,
      currentStreak: 2,
      lastLogDate: todayStr,
      points: 150,
    };
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

    await footprintService.createEntry(userId, mockInput);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: {
        currentStreak: 2, // remains 2
        lastLogDate: todayStr,
        points: { increment: 10 },
      },
    });
  });
});
