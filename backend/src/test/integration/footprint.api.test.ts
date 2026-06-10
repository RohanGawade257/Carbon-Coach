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

// Mock the footprint service
vi.mock("../../modules/footprint/footprint.service", () => ({
  footprintService: {
    calculate: vi.fn(),
    createEntry: vi.fn(),
    listEntries: vi.fn(),
    deleteEntry: vi.fn(),
  },
}));

import { app } from "../../app";
import { prisma } from "../../config/prisma";
import { footprintService } from "../../modules/footprint/footprint.service";
import { signToken } from "../../shared/utils/jwt";

describe("Footprint API Integration Tests", () => {
  const userId = "user-123";
  const categoryUuid = "80f331f2-1fb8-4171-aa31-e18e698888e2";
  const entryUuid = "72f12345-1234-5678-abcd-123456789abc";
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

  describe("POST /api/footprint/calculate", () => {
    it("should calculate carbon footprints successfully", async () => {
      const mockResult = {
        kgCo2e: 19.2,
        factor: {
          id: "factor-123",
          categoryName: "Transport",
          unit: "km",
        },
      };
      vi.mocked(footprintService.calculate).mockResolvedValue(mockResult as any);

      const response = await request(app)
        .post("/api/footprint/calculate")
        .set("Authorization", `Bearer ${token}`)
        .send({
          categoryId: categoryUuid,
          activityType: "car_km",
          quantity: 100,
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(footprintService.calculate).toHaveBeenCalledWith({
        categoryId: categoryUuid,
        activityType: "car_km",
        quantity: 100,
      });
    });

    it("should fail validation if quantity is negative", async () => {
      const response = await request(app)
        .post("/api/footprint/calculate")
        .set("Authorization", `Bearer ${token}`)
        .send({
          categoryId: categoryUuid,
          activityType: "car_km",
          quantity: -10,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/footprint/entries", () => {
    it("should successfully log a new footprint entry", async () => {
      const mockEntry = {
        id: entryUuid,
        userId,
        categoryId: categoryUuid,
        activityType: "car_km",
        quantity: 100,
        kgCo2e: 19.2,
        occurredAt: new Date().toISOString(),
      };
      vi.mocked(footprintService.createEntry).mockResolvedValue(mockEntry as any);

      const response = await request(app)
        .post("/api/footprint/entries")
        .set("Authorization", `Bearer ${token}`)
        .send({
          categoryId: categoryUuid,
          activityType: "car_km",
          quantity: 100,
          occurredAt: new Date().toISOString(),
          notes: "Daily commute",
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ entry: mockEntry });
      expect(footprintService.createEntry).toHaveBeenCalled();
    });
  });

  describe("GET /api/footprint/entries", () => {
    it("should return list of logged entries", async () => {
      const mockEntries = [
        { id: "e1", activityType: "car_km", kgCo2e: 19.2 },
        { id: "e2", activityType: "electricity_kwh", kgCo2e: 42 },
      ];
      vi.mocked(footprintService.listEntries).mockResolvedValue(mockEntries as any);

      const response = await request(app)
        .get("/api/footprint/entries")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ entries: mockEntries });
    });
  });

  describe("DELETE /api/footprint/entries/:id", () => {
    it("should delete entry successfully", async () => {
      vi.mocked(footprintService.deleteEntry).mockResolvedValue({ success: true } as any);

      const response = await request(app)
        .delete(`/api/footprint/entries/${entryUuid}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(footprintService.deleteEntry).toHaveBeenCalledWith(userId, entryUuid);
    });
  });
});
