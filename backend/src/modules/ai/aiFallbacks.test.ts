import { describe, it, expect } from "vitest";
import {
  fallbackCoachResponse,
  fallbackCarbonTwin,
  fallbackRecommendations,
  fallbackActionPlan,
  fallbackSimulation
} from "./aiFallbacks";

describe("AI Fallbacks Unit Tests", () => {
  describe("fallbackCoachResponse", () => {
    const context = [
      'Profile: {"fullName": "John Doe", "householdSize": 2, "city": "Toronto", "country": "Canada"}',
      'Carbon Twin: {"baselineKgCo2eMonthly": 550, "topEmissionSource": "Transport", "biggestOpportunity": "Drive less", "userGoal": "Reduce daily car travel", "userConstraints": "Cold winter; no EV"}',
      "Recent footprint entries: Transport: 150 kg CO2e from car_km; Food: 45 kg CO2e from beef_meal",
      "Active action plan preview: Day 1: Walk instead of driving; Day 2: Eat a meatless lunch"
    ].join("\n");

    it("should respond to onboarding message", () => {
      const response = fallbackCoachResponse(context, "Hello, can you help me start?");
      expect(response).toContain("Using local sustainability insights:");
      expect(response).toContain("Hi John. Start with a simple three-step path.");
      expect(response).toContain("Walk instead of driving");
      expect(response).toContain("Reduce daily car travel");
    });

    it("should respond to general query", () => {
      const response = fallbackCoachResponse(context, "What is my biggest opportunity?");
      expect(response).toContain("Using local sustainability insights:");
      expect(response).toContain("John");
      expect(response).toContain("Drive less");
      expect(response).toContain("Walk instead of driving");
    });

    it("should handle context with missing sections cleanly", () => {
      const emptyContext = "";
      const response = fallbackCoachResponse(emptyContext, "help");
      expect(response).toContain("Using local sustainability insights:");
      expect(response).toContain("Start with a simple three-step path.");
      expect(response).toContain("Start with this today");
    });
  });

  describe("fallbackCarbonTwin", () => {
    it("should construct twin structure", () => {
      const input = {
        baselineKgCo2eMonthly: 400,
        topEmissionSource: "Food",
        userGoal: "Eat green",
        userConstraints: "Vegan diet"
      };
      const result = fallbackCarbonTwin(input);
      expect(result.topEmissionSource).toBe("Food");
      expect(result.baselineKgCo2eMonthly).toBe(400);
      expect(result.biggestOpportunity).toContain("Reduce food emissions");
      expect(result.summary).toContain("Food is currently the largest source");
    });
  });

  describe("fallbackRecommendations", () => {
    it("should produce exactly three recommendations", () => {
      const list = fallbackRecommendations("Energy");
      expect(list).toHaveLength(3);
      expect(list[0].title).toBe("Reduce Energy Emissions");
      expect(list[1].title).toBe("Plan Low-Carbon Errands");
    });
  });

  describe("fallbackActionPlan", () => {
    it("should produce a 30-day action plan structure", () => {
      const plan = fallbackActionPlan("Energy");
      expect(plan.title).toBe("30-Day Carbon Coach Action Plan");
      expect(plan.summary.toLowerCase()).toContain("energy");
      expect(plan.days).toHaveLength(30);
      expect(plan.days[0].dayNumber).toBe(1);
      expect(plan.days[29].dayNumber).toBe(30);
    });
  });

  describe("fallbackSimulation", () => {
    it("should calculate simulation projections correctly", () => {
      const input = {
        scenarioName: "Eco Upgrade",
        baselineKgCo2eMonthly: 600,
        days: 30,
        savingsPercent: 20,
        assumptions: { notes: "Use solar panel" }
      };
      const result = fallbackSimulation(input);
      expect(result.scenarioName).toBe("Eco Upgrade");
      expect(result.projectedKgCo2e).toBe(480); // 600 - 20%
      expect(result.estimatedSavingsKgCo2e).toBe(120); // 20%
      expect(result.explanation).toContain("20% reduction");
    });
  });
});
