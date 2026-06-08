import { z } from "zod";
import { generateGeminiText } from "./gemini.client";

function extractJson(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  }
  return trimmed;
}

export async function generateStructuredAi<T>(
  prompt: string,
  schema: z.ZodType<T>,
  fallback: T
): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const text = await generateGeminiText(prompt);
      if (!text) return fallback;

      const json = JSON.parse(extractJson(text));
      return schema.parse(json);
    } catch (error) {
      if (attempt === 1) {
        console.warn("Structured Gemini response failed validation; using fallback.", error);
      }
    }
  }

  return fallback;
}

