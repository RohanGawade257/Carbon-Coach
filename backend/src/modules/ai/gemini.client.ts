import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../../config/env";

let client: GoogleGenerativeAI | null = null;
const modelCooldownUntil = new Map<string, number>();
const QUOTA_COOLDOWN_MS = 5 * 60 * 1000;
const GEMINI_TIMEOUT_MS = 18_000;

function getClient() {
  if (!env.GEMINI_API_KEY) return null;
  if (!client) {
    client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return client;
}

function cleanModelName(modelName: string) {
  return modelName.trim().replace(/^["']|["']$/g, "").replace(/^models\//, "");
}

type GeminiTextOptions = {
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
};

function getCandidateModels() {
  return [env.GEMINI_MODEL, "gemini-2.5-flash-lite", "gemini-2.0-flash-lite"]
    .map(cleanModelName)
    .filter((modelName, index, models) => modelName.length > 0 && models.indexOf(modelName) === index)
    .filter((modelName) => (modelCooldownUntil.get(modelName) ?? 0) <= Date.now());
}

async function requestGeminiText(gemini: GoogleGenerativeAI, prompt: string, modelName: string, options: GeminiTextOptions) {
  const model = gemini.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: options.temperature ?? 0.4,
      topP: options.topP ?? 0.8,
      maxOutputTokens: options.maxOutputTokens ?? 4096
    }
  });

  const result = await withTimeout(model.generateContent(prompt), GEMINI_TIMEOUT_MS);
  const text = result.response.text();
  return text.trim().length > 0 ? text : null;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return Promise.race([
    promise,
    new Promise<T>((_resolve, reject) => {
      windowlessSetTimeout(() => reject(new Error(`Gemini request timed out after ${timeoutMs}ms`)), timeoutMs);
    })
  ]);
}

function windowlessSetTimeout(callback: () => void, timeoutMs: number) {
  return setTimeout(callback, timeoutMs);
}

function getGeminiStatus(error: unknown) {
  if (typeof error === "object" && error && "status" in error) {
    const status = Number((error as { status?: unknown }).status);
    return Number.isFinite(status) ? status : undefined;
  }
  return undefined;
}

function shouldRetrySameModel(status: number | undefined) {
  return !status || [408, 500, 502, 503, 504].includes(status);
}

function shouldTryNextModel(status: number | undefined) {
  return ![401, 403].includes(status ?? 0);
}

function describeGeminiFailure(error: unknown, modelName: string) {
  return {
    model: modelName,
    status: getGeminiStatus(error),
    message: error instanceof Error ? error.message.slice(0, 280) : String(error).slice(0, 280)
  };
}

function applyGeminiCooldown(error: unknown, modelName: string) {
  if (getGeminiStatus(error) === 429) {
    modelCooldownUntil.set(modelName, Date.now() + QUOTA_COOLDOWN_MS);
  }
}

export type GeminiTextResult = {
  text: string;
  model: string;
};

export async function generateGeminiTextResult(prompt: string, options: GeminiTextOptions = {}): Promise<GeminiTextResult | null> {
  const gemini = getClient();
  if (!gemini) {
    return null;
  }

  for (const modelName of getCandidateModels()) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const text = await requestGeminiText(gemini, prompt, modelName, options);
        return text ? { text, model: modelName } : null;
      } catch (error) {
        const status = getGeminiStatus(error);
        const canRetrySameModel = shouldRetrySameModel(status) && attempt === 0;

        if (canRetrySameModel) {
          continue;
        }

        applyGeminiCooldown(error, modelName);
        console.warn("Gemini model failed; checking fallback options.", describeGeminiFailure(error, modelName));

        if (!shouldTryNextModel(status)) {
          return null;
        }

        break;
      }
    }
  }

  return null;
}

export async function generateGeminiText(prompt: string) {
  const result = await generateGeminiTextResult(prompt);
  return result?.text ?? null;
}
