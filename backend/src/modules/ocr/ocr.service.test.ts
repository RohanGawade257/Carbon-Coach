import { describe, it, expect } from "vitest";
import { ocrService } from "./ocr.service";

describe("OCR Service Unit Tests", () => {
  describe("extractQuantity", () => {
    it("should extract quantity from kWh pattern (Pass 1)", () => {
      const text = "Your monthly power usage was 345.5 kWh for June.";
      const quantity = ocrService.extractQuantity(text);
      expect(quantity).toBe(345.5);
    });

    it("should extract quantity from electricity pattern (Pass 2)", () => {
      const text = "Electricity: 180.25";
      const quantity = ocrService.extractQuantity(text);
      expect(quantity).toBe(180.25);
    });

    it("should extract quantity from total pattern (Pass 3)", () => {
      const text = "Total amount: 95.5";
      const quantity = ocrService.extractQuantity(text);
      expect(quantity).toBe(95.5);
    });

    it("should extract any first number if no specific pattern is matched (Pass 4)", () => {
      const text = "No labels, just a number 75 in the text.";
      const quantity = ocrService.extractQuantity(text);
      expect(quantity).toBe(75);
    });

    it("should default to 120.0 if no numbers are present in the text", () => {
      const text = "No numbers here at all!";
      const quantity = ocrService.extractQuantity(text);
      expect(quantity).toBe(120.0);
    });

    it("should prefer kWh over electricity label and total", () => {
      const text = "Total: 100, Electricity: 200, Usage: 300 kWh";
      const quantity = ocrService.extractQuantity(text);
      expect(quantity).toBe(300);
    });

    it("should prefer electricity label over total", () => {
      const text = "Total: 100, Electricity: 200";
      const quantity = ocrService.extractQuantity(text);
      expect(quantity).toBe(200);
    });
  });

  describe("detectActivityType", () => {
    it("should detect car_km category from transport keyword", () => {
      expect(ocrService.detectActivityType("I drove 50 km in my car")).toBe("car_km");
      expect(ocrService.detectActivityType("flight boarding pass")).toBe("car_km");
    });

    it("should detect beef_meal category from food keywords", () => {
      expect(ocrService.detectActivityType("Order: beef burger meal")).toBe("beef_meal");
      expect(ocrService.detectActivityType("vegetarian dairy purchase")).toBe("beef_meal");
    });

    it("should detect trash_bag category from waste keywords", () => {
      expect(ocrService.detectActivityType("garbage bag disposal fee")).toBe("trash_bag");
      expect(ocrService.detectActivityType("recycle schedule")).toBe("trash_bag");
    });

    it("should detect clothing_item category from shopping keywords", () => {
      expect(ocrService.detectActivityType("Receipt: shirt and electronics")).toBe("clothing_item");
      expect(ocrService.detectActivityType("clothing item shopping")).toBe("clothing_item");
    });

    it("should default to electricity_kwh activity if no keywords match", () => {
      expect(ocrService.detectActivityType("random text with nothing else")).toBe("electricity_kwh");
    });
  });
});
