import { describe, it, expect } from "vitest";

function calculateCarbon(quantity: number, factor: number) {
  return quantity * factor;
}

describe("Carbon Calculator", () => {
  it("calculates emissions correctly", () => {
    expect(calculateCarbon(100, 0.82)).toBe(82);
  });
});