import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock must be defined directly inside the factory to avoid hoisting reference errors
vi.mock("../../config/prisma", () => ({
  prisma: {
    emissionFactor: {
      findFirst: vi.fn(),
    },
  },
}));

// Import the module under test AND the prisma module that will be intercepted
import { emissionsService } from "./emissions.service";
import { prisma } from "../../config/prisma";

describe("Emissions Service - Carbon Calculations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should calculate emissions successfully for valid input", async () => {
    const mockFactor = {
      id: "factor-1",
      categoryId: "cat-1",
      activityType: "car_km",
      unit: "km",
      kgCo2ePerUnit: 0.192,
      source: "EPA",
      category: {
        id: "cat-1",
        name: "Transport",
        slug: "transport",
        description: "Travel emissions"
      }
    };
    
    // Set up mock resolution using vi.mocked
    vi.mocked(prisma.emissionFactor.findFirst).mockResolvedValue(mockFactor as any);

    const result = await emissionsService.calculate({
      categoryId: "cat-1",
      activityType: "car_km",
      quantity: 150
    });

    expect(prisma.emissionFactor.findFirst).toHaveBeenCalledWith({
      where: {
        categoryId: "cat-1",
        activityType: "car_km"
      },
      include: { category: true }
    });

    expect(result.kgCo2e).toBe(28.8); // 150 * 0.192
    expect(result.factor.id).toBe("factor-1");
    expect(result.factor.categoryName).toBe("Transport");
  });

  it("should throw AppError when emission factor is not found", async () => {
    vi.mocked(prisma.emissionFactor.findFirst).mockResolvedValue(null);

    await expect(
      emissionsService.calculate({
        categoryId: "cat-invalid",
        activityType: "car_km",
        quantity: 100
      })
    ).rejects.toThrowError("Emission factor not found for this activity");
  });

  it("should handle zero or fractional values correctly", async () => {
    const mockFactor = {
      id: "factor-2",
      categoryId: "cat-2",
      activityType: "electricity_kwh",
      unit: "kWh",
      kgCo2ePerUnit: 0.42,
      source: "Grid",
      category: {
        id: "cat-2",
        name: "Energy",
        slug: "energy",
        description: "Electricity emissions"
      }
    };
    vi.mocked(prisma.emissionFactor.findFirst).mockResolvedValue(mockFactor as any);

    const resultZero = await emissionsService.calculate({
      categoryId: "cat-2",
      activityType: "electricity_kwh",
      quantity: 0
    });
    expect(resultZero.kgCo2e).toBe(0);

    const resultFraction = await emissionsService.calculate({
      categoryId: "cat-2",
      activityType: "electricity_kwh",
      quantity: 1.5
    });
    expect(resultFraction.kgCo2e).toBe(0.63); // 1.5 * 0.42 = 0.63
  });
});
