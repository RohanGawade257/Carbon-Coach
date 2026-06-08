import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../../config/env";

let client: GoogleGenerativeAI | null = null;

function getClient() {
  if (!env.GEMINI_API_KEY) return null;
  if (!client) {
    client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return client;
}

async function requestGeminiText(gemini: GoogleGenerativeAI, prompt: string) {
  const model = gemini.getGenerativeModel({
    model: env.GEMINI_MODEL,
    generationConfig: {
      temperature: 0.4,
      topP: 0.8,
      maxOutputTokens: 4096
    }
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return text.trim().length > 0 ? text : null;
}

function isTemporaryGeminiFailure(error: unknown) {
  const status = typeof error === "object" && error && "status" in error ? Number((error as { status?: unknown }).status) : undefined;
  return !status || [408, 429, 500, 502, 503, 504].includes(status);
}

export async function generateGeminiText(prompt: string) {
  const gemini = getClient();
  if (!gemini) {
    return null;
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await requestGeminiText(gemini, prompt);
    } catch (error) {
      if (!isTemporaryGeminiFailure(error) || attempt === 1) {
        console.warn("Gemini text generation failed; using local fallback.", error);
        return null;
      }
    }
  }

  return null;
}
