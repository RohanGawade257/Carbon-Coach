export const STRUCTURED_JSON_RULES = [
  "Return JSON only.",
  "Do not include Markdown.",
  "Do not include prose outside JSON.",
  "Match the requested schema exactly.",
  "Use numbers for all CO2e values.",
  "Allowed difficulty values are Easy, Medium, and Hard."
].join(" ");

export const promptTemplates = {
  CARBON_TWIN_PROFILE_PROMPT(context: string) {
    return `${STRUCTURED_JSON_RULES}
Schema: {"topEmissionSource":"string","biggestOpportunity":"string","userGoal":"string","userConstraints":"string","baselineKgCo2eMonthly":number,"summary":"string"}
Build a simple Carbon Twin from this profile and footprint context:
${context}`;
  },

  REDUCTION_SIMULATION_PROMPT(context: string) {
    return `${STRUCTURED_JSON_RULES}
Schema: {"scenarioName":"string","projectedKgCo2e":number,"estimatedSavingsKgCo2e":number,"assumptions":{},"explanation":"string"}
Explain a realistic emissions reduction simulation using this context:
${context}`;
  },

  THIRTY_DAY_ACTION_PLAN_PROMPT(context: string) {
    return `${STRUCTURED_JSON_RULES}
Schema: {"title":"string","summary":"string","days":[{"dayNumber":number,"title":"string","description":"string","category":"string","estimatedSavingsKgCo2e":number,"difficulty":"Easy|Medium|Hard"}]}
Generate exactly 30 daily sustainability actions. Use low-cost, practical actions first.
Context:
${context}`;
  },

  AI_COACH_SYSTEM_PROMPT() {
    return [
      "You are Carbon Coach, a concise sustainability coach for individuals.",
      "Use the user's Carbon Twin context when available.",
      "Give practical, low-cost advice and explain carbon impact in plain language.",
      "Do not claim exact scientific certainty when estimates are approximate.",
      "Do not use Markdown syntax because responses are displayed as plain chat text.",
      "Do not provide medical, legal, or financial advice."
    ].join(" ");
  },

  AI_COACH_CONTEXT_PROMPT(context: string, message: string) {
    return `User context:
${context}

User message:
${message}

Answer clearly and keep the response under 180 words.`;
  },

  RECOMMENDATION_GENERATION_PROMPT(context: string) {
    return `${STRUCTURED_JSON_RULES}
Schema: [{"title":"string","description":"string","category":"string","estimatedSavingsKgCo2e":number,"difficulty":"Easy|Medium|Hard","actions":["string"]}]
Generate 3 to 5 ranked recommendations from this Carbon Twin and footprint context:
${context}`;
  },

  DASHBOARD_EXPLANATION_PROMPT(context: string) {
    return `${STRUCTURED_JSON_RULES}
Schema: {"metricName":"string","explanation":"string","recommendationHint":"string"}
Explain this dashboard metric in plain English:
${context}`;
  }
};
