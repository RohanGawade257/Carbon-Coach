# 🌿 Carbon Coach

> **Calculate. Understand. Reduce.**
> An AI-powered sustainability companion that turns raw carbon numbers into real, personalised daily actions.

🌐 **Live Demo:** https://carbon-coach-1.onrender.com
📧 **Demo Account:** demo@carboncoach.com / Demo123!

---

## 1. Chosen Vertical

**Environmental Sustainability & AI-Powered Carbon Coaching**

Most carbon trackers stop at the number. They calculate your footprint, display a kilogram figure, and leave you with no sense of what to do next. People disengage within days — not because they don't care, but because abstract CO₂e figures don't translate into concrete behaviour change.

Carbon Coach targets the gap between **awareness and action**. Rather than another emissions calculator, it is a personal AI coach: one that understands your specific lifestyle, pinpoints where your emissions actually come from, and gives you a ranked, realistic plan to reduce them — grounded in your own data, not generic advice.

---

## 2. Approach & Logic

### The Carbon Twin — a persistent user profile for the AI

The central design decision is the **Carbon Twin**: a structured, AI-generated profile that acts as the model's source of truth about each user. Unlike a raw log of emissions, the Twin synthesises the user's behaviour into a stable, queryable context object:

```json
{
  "topEmissionSource": "string",
  "biggestOpportunity": "string",
  "userGoal": "string",
  "userConstraints": "string",
  "baselineKgCo2eMonthly": number,
  "summary": "string"
}
```

This profile is built by sending the user's onboarding answers (country, household size, diet, transport mode, energy source) and their recent footprint entries to Gemini with a tightly constrained structured-JSON prompt. The result is stored in the database and **injected as context into every subsequent AI interaction** — so the coach always knows who it is talking to.

This solves the core weakness of generic AI chatbots: advice is contextually grounded, not generic.

### AI Coach context construction

Each message to the AI Coach is accompanied by a freshly assembled context payload, built from four live data sources in parallel:

- The user's **onboarding profile** (country, household, diet, transport)
- Their **Carbon Twin** (baseline, top source, constraints, goal)
- Their **last 8 footprint entries** (recent behaviour signal)
- Their **active 30-day plan** (top 5 current tasks)

This context is serialised into a compact plain-text string to minimise token usage while maximising relevance. Coach responses are capped at 700 output tokens with `temperature: 0.45` — accurate enough to be trustworthy, natural enough to feel conversational.

### Scenario Simulator

Users can run counterfactual simulations directly on their Twin: "What if I switched to an EV?", "What if I went vegetarian?". Each scenario sends the Twin profile to Gemini with a reduction simulation prompt and receives a structured response:

```json
{
  "scenarioName": "string",
  "projectedKgCo2eMonthly": number,
  "estimatedSavingsKgCo2eMonthly": number,
  "assumptions": {},
  "explanation": "string"
}
```

Every simulation is persisted with its full `assumptions` as a JSONB column, making results reproducible and auditable. Users can review and compare any past scenario at any time.

### Points, Streaks & Gamification

Retention is driven by a backend-authoritative gamification layer. Streak logic runs entirely server-side to prevent client manipulation:

- A streak increments when `today (UTC date) = lastLogDate + 1 calendar day`
- If `today > lastLogDate + 1 day`, the streak resets to 1
- All streak and points mutations are applied in a single atomic `prisma.user.update()` call — no partial state can be committed under concurrent requests

Points are awarded for logging footprint entries, completing challenges, finishing action plan tasks, and uploading bills via the OCR pipeline.

### OCR Bill Parsing Pipeline

Users can upload utility bills or receipts (≤5 MB) for automatic footprint entry. The pipeline runs a multi-pass regex extraction against the file buffer:

- **Pass 1–3:** Targeted patterns for kWh, electricity labels, and total amounts
- **Pass 4:** Numeric fallback (defaults to 120 kWh if no match is found)
- **Category detection:** Keywords map to emission categories (`km/car/vehicle` → `car_km`, `meal/beef/food` → `beef_meal`, etc.)
- The extracted quantity is cross-referenced with the `emission_factors` table to compute `kgCo2e`, a `FootprintEntry` is created automatically, and +25 bonus points are awarded

### AI Fallback Design

When Gemini is unavailable (quota exceeded, timeout, or missing API key), the service falls back to a deterministic local response library (`aiFallbacks.ts`) keyed on the user's Carbon Twin data. The AI Coach never surfaces an empty or error state to the user. The fallback is logged and surfaced as a toast notification so it is observable and testable independently of the Gemini API.

The Gemini client also maintains a priority-ordered model list (`gemini-1.5-flash` → `gemini-2.5-flash-lite` → `gemini-2.0-flash-lite`) with per-model cooldown timers on 429 errors, ensuring graceful degradation under rate limits.

---

## 3. How the Solution Works

### System Architecture

```
┌────────────────────────────────────────────┐
│              FRONTEND                      │
│  Vite + React 18 + TypeScript + Tailwind   │
│  React Query · Zustand · Framer Motion     │
└──────────────────────┬─────────────────────┘
                       │ REST API (JWT-authenticated)
┌──────────────────────▼─────────────────────┐
│              BACKEND                       │
│  Node.js + Express + TypeScript            │
│  13 feature modules · Zod validation       │
│  Helmet · CORS · express-rate-limit        │
└──────────────────────┬─────────────────────┘
                       │ Prisma ORM
┌──────────────────────▼─────────────────────┐
│           PostgreSQL Database              │
│  16 normalised models                      │
│  Composite unique constraints on all       │
│  streak, badge, and challenge operations   │
└────────────────────────────────────────────┘
```

### User Journey

**Step 1 — Register & Onboard**
Create an account and complete a short profile: country, household size, diet type, primary transport, energy source, and sustainability goal. This data populates the `user_profiles` table and seeds the Carbon Twin generation.

**Step 2 — Log Your Footprint**
Use the Calculator to log emissions across five categories: Transport, Energy, Food, Shopping, and Waste. Each entry computes `kgCo2e = quantity × emission_factor` at write time using regional averages from the `emission_factors` table. Points and streak update atomically on each log.

**Step 3 — Build Your Carbon Twin**
The Carbon Twin page sends your profile and recent entries to Gemini, which returns a structured profile: your monthly baseline, top emission source, biggest opportunity, constraints, and a personalised summary. The Twin is stored and becomes the permanent context for all AI features.

**Step 4 — Run Simulations**
Use the Future You Simulator to model behavioural changes. Select a scenario, review the projected monthly saving and explanation, and compare simulations side by side. All results are stored for future reference.

**Step 5 — Get Your 30-Day Plan**
The AI generates a ranked list of 30 daily actions tailored to your Carbon Twin — each with a difficulty rating, estimated CO₂e saving, and category. Mark tasks complete to earn points and track progress.

**Step 6 — Chat With Your AI Coach**
Ask any sustainability question. The coach responds with context drawn from your Twin, recent entries, and active plan — not generic advice. Fallback responses are served if the API is unavailable.

**Step 7 — Upload Bills via OCR**
Upload a utility bill or receipt. The pipeline auto-detects energy usage or transport distances, creates a footprint entry, and awards bonus points — no manual data entry required.

**Step 8 — Challenges, Badges & Leaderboard**
Join time-limited challenges (e.g., "7-day meat-free week"), earn badges on milestone achievements (first log, 7-day streak, etc.), and track your ranking on the local leaderboard by carbon score and points.

---

## 4. Assumptions Made

| # | Assumption | Rationale |
|---|-----------|-----------|
| 1 | **Regionalised emission factors are a sufficient approximation** | CO₂e calculations use regional average factors seeded from published sources, stored in the `emission_factors` table with a `source` field for traceability. Exact grid mix and full supply-chain emissions are out of scope; factors are labelled to make their provenance transparent. |
| 2 | **Consecutive UTC calendar days define a streak** | Streaks increment when `today (UTC) = lastLogDate + 1 calendar day`. This avoids timezone-shift bugs that affect rolling 24-hour counters and matches the way users mentally model "daily" habits. |
| 3 | **OCR input is text-extractable** | The pipeline processes UTF-8 text extracted from file buffers. Binary image-only PDFs with no embedded text layer are out of scope. The pipeline degrades gracefully — falling back to a default 120 kWh electricity estimate — rather than failing silently or erroring. |
| 4 | **The Carbon Twin is regenerated on demand, not on every log** | Regenerating the Twin on each footprint entry would incur excessive Gemini API calls and cost. Users trigger regeneration explicitly, at a cadence that makes sense for reviewing meaningful changes (e.g., after a week of new entries). |
| 5 | **One active action plan per user at a time** | Only one `ActionPlan` with `status = "Active"` is materialised at a time. Generating a new plan archives the previous one rather than deleting it, preserving history. |
| 6 | **Points are backend-authoritative and non-transferable** | All point mutations happen server-side inside a single `prisma.user.update()` call. The client never submits a point value directly, preventing any client-side manipulation. |
| 7 | **Gemini is the primary AI provider; local fallbacks cover degraded states** | The application is designed to remain fully functional without the Gemini API. Deterministic fallback responses in `aiFallbacks.ts` are keyed on Carbon Twin data and served transparently, with a UI toast indicating degraded mode. |
| 8 | **5 MB file cap on OCR uploads is sufficient for typical utility bills** | Bills are processed in-memory via multer's memory storage. A 5 MB hard cap prevents memory exhaustion on the Express process under concurrent uploads while comfortably covering all standard utility bill formats. |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 6 + TypeScript 5.7 |
| Styling | Tailwind CSS 3.4 + Framer Motion 12 |
| Server State | TanStack React Query 5 |
| Client State | Zustand 5 |
| Routing | React Router v7 |
| Backend | Node.js + Express 4 + TypeScript |
| Database | PostgreSQL 15 via Prisma ORM 5.22 |
| Auth | JWT + Argon2 password hashing |
| AI | Google Gemini API (`@google/generative-ai`) |
| Validation | Zod (runtime) + TypeScript (compile-time) |
| Security | Helmet + CORS + express-rate-limit |
| File Upload | Multer (in-memory storage) |
| Charts | Recharts 2 |
| Deployment | Render.com |

---

## Quality & Testing

| Metric | Score |
|--------|-------|
| Lighthouse Accessibility | 100 |
| Lighthouse Best Practices | 100 |
| Lighthouse SEO | 100 |
| Lighthouse Performance | 84 |

The application includes **44 automated tests** covering carbon emission calculations, footprint tracking, streak logic, the challenge and badge system, and critical API endpoints (auth, dashboard, footprint, AI coach). Tests are run with Vitest and Supertest with V8 coverage reporting.

```bash
npm test              # Run all tests
npm run test:coverage # Generate coverage report
```

---

*Carbon Coach — Built for the hackathon · 2026*
*Making sustainability actionable, one day at a time.*