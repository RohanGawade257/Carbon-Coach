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

export async function generateGeminiText(prompt: string) {
  const gemini = getClient();
  if (!gemini) {
    return null;
  }

  const model = gemini.getGenerativeModel({
    model: env.GEMINI_MODEL,
    generationConfig: {
      temperature: 0.4,
      topP: 0.8,
      maxOutputTokens: 4096
    }
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

