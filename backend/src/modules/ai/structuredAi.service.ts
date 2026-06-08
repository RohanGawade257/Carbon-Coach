import { z } from "zod";
import { generateGeminiText } from "./gemini.client";

function extractJson(text: string) {
  const trimmed = text.trim();
  const unfenced = trimmed.startsWith("```")
    ? trimmed.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim()
    : trimmed;

  const firstObject = unfenced.indexOf("{");
  const firstArray = unfenced.indexOf("[");
  const firstJson = [firstObject, firstArray].filter((index) => index >= 0).sort((a, b) => a - b)[0] ?? -1;
  const lastObject = unfenced.lastIndexOf("}");
  const lastArray = unfenced.lastIndexOf("]");
  const lastJson = Math.max(lastObject, lastArray);

  if (firstJson >= 0 && lastJson > firstJson) {
    return unfenced.slice(firstJson, lastJson + 1);
  }

  return unfenced;
}

export async function generateStructuredAiResult<T>(
  prompt: string,
  schema: z.ZodType<T>,
  fallback: T
): Promise<{ data: T; usedFallback: boolean }> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const text = await generateGeminiText(prompt);
      if (!text) return { data: fallback, usedFallback: true };

      const json = JSON.parse(extractJson(text));
      return { data: schema.parse(json), usedFallback: false };
    } catch (error) {
      if (attempt === 1) {
        console.warn("Structured Gemini response failed validation; using fallback.", error);
      }
    }
  }

  return { data: fallback, usedFallback: true };
}

export async function generateStructuredAi<T>(
  prompt: string,
  schema: z.ZodType<T>,
  fallback: T
): Promise<T> {
  const result = await generateStructuredAiResult(prompt, schema, fallback);
  return result.data;
}

