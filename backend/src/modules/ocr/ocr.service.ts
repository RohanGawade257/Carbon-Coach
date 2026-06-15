export const ocrService = {
  extractQuantity(textToScan: string): number {
    const kwhMatch = textToScan.match(/(\d+(?:\.\d+)?)\s*kwh/i);
    const elecMatch = textToScan.match(/electricity\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
    const totalMatch = textToScan.match(/total\s*(?:amount)?\s*[:=]?\s*(\d+(?:\.\d+)?)/i);

    if (kwhMatch) {
      return parseFloat(kwhMatch[1]);
    }
    if (elecMatch) {
      return parseFloat(elecMatch[1]);
    }
    if (totalMatch) {
      return parseFloat(totalMatch[1]);
    }

    const anyNum = textToScan.match(/(\d+(?:\.\d+)?)/);
    return anyNum ? parseFloat(anyNum[1]) : 120.0;
  },

  detectActivityType(textToScan: string): string {
    if (textToScan.match(/km|car|vehicle|flight|transport/i)) {
      return "car_km";
    }
    if (textToScan.match(/meal|beef|food|vegetarian|dairy/i)) {
      return "beef_meal";
    }
    if (textToScan.match(/bag|trash|waste|recycle/i)) {
      return "trash_bag";
    }
    if (textToScan.match(/clothing|item|shirt|electronics/i)) {
      return "clothing_item";
    }
    return "electricity_kwh";
  }
};
