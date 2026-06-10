import { describe, it, expect } from "vitest";
import { calculateKgCo2e, roundCarbon, percentChange } from "./carbonMath";
import { startOfMonth, endOfMonth, previousMonthRange, monthKey, addDays } from "./date";
import { signToken, verifyToken } from "./jwt";
import { hashPassword, verifyPassword } from "./password";

describe("Utility Helpers", () => {
  describe("carbonMath", () => {
    it("should calculate carbon emissions correctly", () => {
      expect(calculateKgCo2e(100, 0.192)).toBe(19.2);
      expect(calculateKgCo2e(3, 18.0)).toBe(54.0);
    });

    it("should round carbon values to 2 decimal places", () => {
      expect(roundCarbon(1.2345)).toBe(1.23);
      expect(roundCarbon(1.236)).toBe(1.24);
      expect(roundCarbon(0)).toBe(0);
    });

    it("should calculate percent change correctly", () => {
      expect(percentChange(150, 100)).toBe(50.0);
      expect(percentChange(50, 100)).toBe(-50.0);
      expect(percentChange(100, 0)).toBe(0); // baseline zero fallback
    });
  });

  describe("date", () => {
    it("should find the start of the month", () => {
      const date = new Date(2026, 5, 15); // June 15, 2026
      const start = startOfMonth(date);
      expect(start.getFullYear()).toBe(2026);
      expect(start.getMonth()).toBe(5);
      expect(start.getDate()).toBe(1);
    });

    it("should find the end of the month", () => {
      const date = new Date(2026, 5, 15); // June 15, 2026
      const end = endOfMonth(date);
      expect(end.getFullYear()).toBe(2026);
      expect(end.getMonth()).toBe(5);
      expect(end.getDate()).toBe(30);
      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
    });

    it("should find previous month ranges", () => {
      const date = new Date(2026, 5, 15); // June 15, 2026
      const { start, end } = previousMonthRange(date);
      expect(start.getFullYear()).toBe(2026);
      expect(start.getMonth()).toBe(4); // May
      expect(start.getDate()).toBe(1);
      expect(end.getMonth()).toBe(4);
      expect(end.getDate()).toBe(31);
    });

    it("should generate the correct month key", () => {
      const date = new Date(2026, 5, 15);
      expect(monthKey(date)).toBe("2026-06");
    });

    it("should add days to a date", () => {
      const date = new Date(2026, 5, 15);
      const next = addDays(date, 5);
      expect(next.getDate()).toBe(20);
    });
  });

  describe("jwt", () => {
    it("should sign and verify tokens correctly", () => {
      const payload = { userId: "test-user-id", email: "test@domain.com" };
      const token = signToken(payload);
      expect(token).toBeTypeOf("string");

      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });
  });

  describe("password", () => {
    it("should hash and verify passwords", async () => {
      const password = "mySecurePassword123";
      const hash = await hashPassword(password);
      expect(hash).toBeTypeOf("string");
      expect(hash).not.toBe(password);

      const isValid = await verifyPassword(hash, password);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword(hash, "wrongPassword");
      expect(isInvalid).toBe(false);
    });
  });
});
