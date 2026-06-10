# 🌿 Carbon Coach

## Application Screenshots

### Dashboard
![Dashboard](README-assets/dashboard.png)

### Carbon Twin
![Carbon Twin](README-assets/carbon-twin.png)

### Future You Simulator
![Future You](README-assets/future-you.png)

### AI Coach
![AI Coach](README-assets/ai-coach.png)

### 30-Day Action Plan
![Action Plan](README-assets/action-plan.png)



> **Calculate. Understand. Reduce.**
> Your personal AI-powered sustainability companion — built to turn raw carbon numbers into real, achievable daily actions.

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-Powered-4285F4?style=for-the-badge&logo=google&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql&logoColor=white)

</div>

---

## 📌 The Problem & Chosen Vertical

### Vertical: Environmental Sustainability & Smart AI Carbon Coaching

**The core problem with existing carbon trackers is that they stop at the number.**

Most tools calculate your footprint and display a kilogram figure. They offer no personalised guidance, no sense of progress, and no understanding of the user's real constraints — budget, lifestyle, or geography. The result? People disengage within days.

**Carbon Coach** targets the gap between awareness and action. The persona — a personal AI Carbon Coach — exists to:

- Translate abstract CO₂e figures into relatable, everyday equivalents
- Propose a ranked, personalised 30-day action plan based on the user's actual emission profile
- Simulate counterfactual scenarios ("What if I switched to an EV?") through the **Carbon Twin Simulator**
- Maintain engagement through a gamified streak, points, challenges, and badges system
- Allow users to upload utility bills and receipts for automatic footprint entry via an **OCR pipeline**

The persona is not a generic chatbot. Every response the AI Coach gives is grounded in the user's real Carbon Twin profile, their recent footprint entries, and their active plan — making coaching contextually relevant rather than generic.

---

## 🏗️ Core Architecture & Logic Engine

### System Overview

```
┌─────────────────────────────────────────────────────┐
│                     FRONTEND                        │
│  Vite + React 18 + TypeScript + Tailwind CSS        │
│  Framer Motion · Recharts · Zustand · React Query   │
│  Pages: Dashboard, Carbon Twin, 30-Day Plan,        │
│         AI Coach, Challenges, Badges, Calculator    │
└──────────────────────┬──────────────────────────────┘
                       │ REST API (JWT-authenticated)
┌──────────────────────▼──────────────────────────────┐
│                     BACKEND                         │
│  Node.js + Express + TypeScript                     │
│  Modular route architecture (13 feature modules)    │
│  Helmet · CORS · express-rate-limit · Zod           │
│  Argon2 password hashing · JWT auth                 │
└──────────────────────┬──────────────────────────────┘
                       │ Prisma ORM
┌──────────────────────▼──────────────────────────────┐
│              PostgreSQL Database                    │
│  16 normalised models: Users, FootprintEntry,       │
│  CarbonTwinProfile, CarbonTwinSimulation,           │
│  ActionPlan, ActionPlanItem, Challenge,             │
│  Badge, AiConversation, AiMessage, ...              │
└─────────────────────────────────────────────────────┘
```

---

### 🧬 The Carbon Twin Concept

The **Carbon Twin** is a persistent, structured profile that acts as the AI's source of truth about the user.

**How it is built:**

1. The user completes an onboarding questionnaire: country, household size, home type, diet, transport mode, energy source, and sustainability goal.
2. Their logged footprint entries (`FootprintEntry`) are aggregated to establish a monthly CO₂e baseline.
3. This data is sent to Gemini AI with a tightly constrained structured-JSON prompt to generate a `CarbonTwinProfile`:
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
4. The resulting profile is stored in the `carbon_twin_profiles` table and becomes the **context payload** injected into every subsequent AI interaction.

**Carbon Twin Simulation (Scenario Engine):**

The simulator computes a `CarbonTwinSimulation` record. The user selects a behavioural change scenario (e.g., "switch to EV", "go vegetarian", "solar panels"). The backend constructs a context string from the user's twin profile, submits it to Gemini with a `REDUCTION_SIMULATION_PROMPT`, and receives a structured JSON response:

```json
{
  "scenarioName": "string",
  "projectedKgCo2e": number,
  "estimatedSavingsKgCo2e": number,
  "assumptions": {},
  "explanation": "string"
}
```

Each simulation is persisted with full `assumptions` (as a JSONB column) so results are reproducible and auditable — the user can review any past scenario at any time.

**Baseline vs. Scenario Comparison:**

| Metric | Baseline | Simulated Scenario |
|--------|----------|--------------------|
| Monthly CO₂e | `baselineKgCo2eMonthly` | `projectedKgCo2e` |
| Potential Saving | — | `estimatedSavingsKgCo2e` |
| Top Source | `topEmissionSource` | Updated per scenario |
| Stored | `carbon_twin_profiles` | `carbon_twin_simulations` |

---

### 🔥 Points & Streak Engine

The gamification layer drives retention. Logic runs entirely on the backend to prevent client-side manipulation.

**Streak counter logic (`lastLogDate` field on `User`):**

- A streak is defined as consecutive **24-hour windows** in UTC calendar days (not rolling hours).
- On each footprint log or challenge completion, the service reads the user's `lastLogDate` (stored as a UTC date string `YYYY-MM-DD`).
- If `today === lastLogDate`, the streak is unchanged (duplicate-safe within the same day).
- If `today === lastLogDate + 1 day`, the streak increments: `currentStreak++`.
- If `today > lastLogDate + 1 day`, the streak resets to `1` — the gap breaks the chain.
- All streak and points mutations are applied in a single `prisma.user.update()` call, ensuring **atomic writes** — no partial state can be committed under concurrent requests.

**Points are awarded for:**

| Action | Points |
|--------|--------|
| Logging a footprint entry | Configurable per challenge |
| Completing a challenge | Challenge's `points` value |
| Uploading an OCR bill | +25 points (hard-coded, awarded atomically post-parse) |
| Completing an action plan task | Plan-level increment |

Points and streak are reflected live on the Dashboard and Leaderboard without page refresh, via React Query cache invalidation.

---

### 📄 OCR Bill/Receipt Parsing Pipeline

The OCR endpoint (`POST /api/ocr/upload`) accepts a file upload via `multer` (capped at **5 MB** to protect server memory) and runs a multi-pass regex pipeline:

```
[File Upload] → [Buffer → UTF-8 string] → [Regex Pattern Matching]
     │
     ├─ Pass 1: KWh extraction   → /(\d+(?:\.\d+)?)\s*kwh/i
     ├─ Pass 2: Electricity label → /electricity\s*[:=]?\s*(\d+(?:\.\d+)?)/i
     ├─ Pass 3: Total amount      → /total\s*(?:amount)?\s*[:=]?\s*(\d+(?:\.\d+)?)/i
     └─ Pass 4: Fallback numeric  → /(\d+(?:\.\d+)?)/ → default 120.0 kWh
     │
     ├─ Category Detection:
     │   km|car|vehicle|flight  → car_km
     │   meal|beef|food         → beef_meal
     │   bag|trash|waste        → trash_bag
     │   clothing|electronics   → clothing_item
     │   (default)              → electricity_kwh
     │
     └─ [EmissionFactor lookup] → [FootprintEntry created] → [+25 pts awarded]
```

The extracted quantity is cross-referenced with the `emission_factors` table to compute `kgCo2e`, and a `FootprintEntry` is created with a human-readable note. Filename text is appended to the scan payload for additional classification signal.

---

### 🤖 AI Coach Context Construction

Every AI Coach message is grounded in a freshly constructed context string (via `buildTwinContext`), assembled from **four live data sources** in a single parallel `Promise.all` query:

```typescript
const [profile, twin, recentEntries, activePlan] = await Promise.all([
  prisma.userProfile.findUnique({ where: { userId } }),
  prisma.carbonTwinProfile.findUnique({ where: { userId } }),
  prisma.footprintEntry.findMany({ ...take: 8 }),   // Last 8 entries only
  prisma.actionPlan.findFirst({ ...take: 5 items }) // Active plan preview
]);
```

The context is then serialised into a compact plain-text string — **no JSON nesting in the user-visible portion** — to keep token count minimal while maximising relevance. Coach responses are capped at **700 output tokens** (`maxOutputTokens: 700`) with `temperature: 0.45` for a balance of accuracy and natural tone.

**Fallback design:** If Gemini is unavailable (quota exceeded, timeout, or missing API key), the service falls back to a deterministic local response library (`aiFallbacks.ts`) keyed on the user's Carbon Twin data — the AI Coach never returns an empty or error state to the user.

**Model rotation:** The Gemini client maintains a priority-ordered list of candidate models (`gemini-1.5-flash` → `gemini-2.5-flash-lite` → `gemini-2.0-flash-lite`) with per-model cooldown timers on 429 quota errors — ensuring graceful degradation under API rate limits without user-visible failure.

---

## ✅ Fulfillment of Evaluation Focus Areas

### Code Quality

| Criterion | Implementation |
|-----------|---------------|
| **Type Safety** | Full TypeScript 5.7 across frontend and backend. Zod schemas validate all inbound API request bodies at the middleware layer before any service logic runs. |
| **Modular Architecture** | Backend is organised into 13 self-contained feature modules (`/modules/ai`, `/modules/carbonTwin`, `/modules/ocr`, etc.), each with its own `routes`, `controller`, `service`, and `schemas` files. |
| **Frontend Structure** | React components are grouped by domain (`/components/ai`, `/components/ui`, `/components/layout`). Shared UI primitives (`Button`, `Card`, `ErrorState`, `LoadingState`) prevent style divergence. |
| **State Management** | React Query (`@tanstack/react-query`) handles all server state with cache invalidation. Zustand manages lightweight client-only state (toast notifications, auth). |
| **Clean Routing** | React Router v7 with protected routes. API routing in Express is prefix-based and maps 1-to-1 with backend module names. |
| **ORM** | Prisma 5.22 with a fully normalised 16-model schema. Composite unique constraints prevent duplicate streaks, duplicate badges, and duplicate challenge joins at the database level. |

---

### Security

| Concern | Mitigation |
|---------|-----------|
| **Environment Variables** | All secrets (`DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`) are loaded via `dotenv` and validated through a typed `env` config module. A committed `.env.example` documents required variables; actual `.env` files are `.gitignore`d. |
| **Password Storage** | User passwords are hashed with **Argon2** (memory-hard, resistant to GPU cracking) — never stored in plain text. |
| **HTTP Security Headers** | `helmet()` is applied globally, setting `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, and `Strict-Transport-Security` headers. |
| **CORS** | Strictly allowlisted to `FRONTEND_ORIGIN` (comma-separated for multi-origin support). No wildcard `*` origin permitted. |
| **Rate Limiting** | `express-rate-limit` is applied to sensitive endpoints to prevent brute-force and scraping attacks. |
| **OCR Input Safety** | Uploaded files are processed as UTF-8 strings in memory via multer's in-memory buffer (no disk writes). File size is capped at **5 MB**. Regex extraction runs on sanitised text; no `eval` or shell execution is involved. |
| **Auth Middleware** | All protected routes require a valid JWT (`jsonwebtoken`) verified in `authMiddleware.ts` before any service logic executes. |
| **Request Validation** | All API inputs are validated with Zod schemas in `validateMiddleware.ts` — type coercion and unknown field stripping are enforced before the request reaches the controller. |

---

### Efficiency

| Area | Approach |
|------|---------|
| **UI Transitions** | Framer Motion animations are tuned to **150–200ms** durations — fast enough to feel snappy, long enough to read as polished. No animation blocks interaction. |
| **Data Fetching** | React Query deduplications concurrent requests and serves stale data immediately while revalidating in the background (`staleTime` configured per query). |
| **AI Token Budget** | Coach responses are bounded to **700 output tokens**. Context payloads pull only the **last 8 footprint entries** and **5 action plan items** — preventing context window bloat. |
| **Database Queries** | Prisma queries use indexed columns (`userId + occurredAt`, `userId + categoryId`, `conversationId + createdAt`). All indexes are declared in `schema.prisma` and applied via migrations. |
| **Build Output** | Vite's production build tree-shakes unused code. `lucide-react` icons are individually imported. Total repository footprint is kept under **10 MB** (excluding `node_modules`). |
| **Lightweight Assets** | No external image CDN dependencies. All illustrations are rendered as inline SVG or CSS — zero external image requests at runtime. |

---

### Testing & Validation

| Area | Strategy |
|------|---------|
| **Footprint Calculation Validation** | Emission factor values are seeded from a normalised `emission_factors` table with a `source` field for traceability. `kgCo2e = quantity × kgCo2ePerUnit` is computed in the `footprint.service` at write time, not read time. |
| **Streak Rollover Verification** | The streak logic reads `lastLogDate` as a plain UTC date string, eliminating timezone offset errors that cause off-by-one day bugs in rolling-window counters. The consecutive-day check is a simple string comparison against `today - 1 day`, making it trivially unit-testable. |
| **Schema Validation** | Zod schemas serve as executable contracts — each route's expected input shape is both the runtime validator and the authoritative documentation. Invalid payloads return structured `400` error objects. |
| **Prisma Unique Constraints** | Database-level `@@unique` constraints on `(userId, badgeId)`, `(userId, challengeId)`, and `(actionPlanId, dayNumber)` act as idempotency guards — duplicate operations are rejected at the data layer, not just the service layer. |
| **AI Fallback Path** | The `deterministic-fallback` model flag is logged and surfaced as a toast notification in the UI, making the fallback path observable and testable independently of the Gemini API. |

---

### Accessibility

| Area | Implementation |
|------|---------------|
| **Semantic HTML** | Pages use correct heading hierarchy (`h1` per page, `h2` for sections). Navigation is in a `<nav>` landmark. Forms use `<label>` elements with explicit `htmlFor` associations. |
| **High-Contrast Text** | Text colours use Tailwind's `text-ink` and `text-slate-600` tokens applied over glassmorphic panel backgrounds — minimum 4.5:1 contrast ratio maintained for body text. |
| **Keyboard Navigation** | Interactive elements (buttons, links, form inputs) are standard HTML elements — natively focusable and keyboard-operable without additional ARIA scaffolding. |
| **Loading & Error States** | Shared `<LoadingState />` and `<ErrorState />` components are rendered for every async operation — users are never left with a blank or silently broken UI. |
| **Toast Notifications** | Transient feedback (OCR success, AI unavailability, new chat started) is surfaced via an accessible toast system powered by `useToastStore` (Zustand). |

---

## 🚶 How It Works — User Journey

```
1. REGISTER / LOGIN
   └─ Create account → JWT issued → Stored in client auth store (Zustand)

2. ONBOARDING
   └─ Complete profile: country, household size, diet, transport, energy source, goal
   └─ Profile saved to `user_profiles` table

3. CALCULATE FOOTPRINT
   └─ Open Calculator → Select category (Transport / Energy / Food / Shopping / Waste)
   └─ Enter quantity → kgCO2e computed from emission_factors lookup
   └─ Entry saved to `footprint_entries` → Points & streak updated atomically

4. VIEW DASHBOARD
   └─ Live metrics: total CO₂e, streak, points, category breakdown (Recharts bar chart)
   └─ AI-generated summary of top emission source and quick win

5. BUILD YOUR CARBON TWIN
   └─ Carbon Twin page → AI analyses your profile + recent entries
   └─ Generates: baseline monthly CO₂e, top source, biggest opportunity, summary
   └─ Run simulations: "What if I took the train instead of driving?"

6. RECEIVE YOUR 30-DAY PLAN
   └─ AI generates 30 ranked daily actions based on your Carbon Twin
   └─ Each task has: difficulty, estimated saving (kg CO₂e), category
   └─ Mark tasks complete → Points awarded → Progress tracked

7. CHAT WITH YOUR AI COACH
   └─ Open AI Coach → Ask any sustainability question
   └─ Context: your Twin profile + last 8 entries + active plan injected automatically
   └─ Gemini responds (≤700 tokens) → Fallback response if API unavailable

8. UPLOAD A BILL (OCR)
   └─ Upload a utility bill or receipt (image or text, ≤5 MB)
   └─ Pipeline detects: kWh, transport km, food type, waste
   └─ FootprintEntry created automatically → +25 bonus points

9. JOIN CHALLENGES & EARN BADGES
   └─ Browse challenges (e.g., "7-day meat-free week")
   └─ Join → Track progress → Earn points on completion
   └─ Badges auto-awarded based on rule keys (e.g., first log, 7-day streak)

10. CLIMB THE LEADERBOARD
    └─ Local leaderboard ranks users by total carbon score and points
    └─ See where you stand relative to other participants
```

---
## Live Demo

🌐 Live Application: https://carbon-coach-1.onrender.com

### Judge Demo Account

Email: demo@carboncoach.com
Password: Demo123!

No setup required. Judges can immediately explore all features.

## 🔑 Key Architectural Assumptions

| # | Assumption | Rationale |
|---|-----------|-----------|
| 1 | **Localised emission factors** | CO₂e calculations use regional average emission factors (stored in `emission_factors` table, seeded from published sources). Exact grid mix and supply-chain emissions are outside scope; factors are labelled with a `source` field for traceability. |
| 2 | **Consecutive 24-hour UTC windows for streaks** | Streaks increment when `today (UTC date) = lastLogDate + 1 calendar day`. This avoids timezone-shift bugs from rolling 24-hour timers and aligns with how users mentally model "daily" habits. |
| 3 | **OCR input is text-extractable** | The OCR pipeline operates on UTF-8 text extracted from file buffers. Binary image-only PDFs with no embedded text layer are outside the current scope. The pipeline degrades gracefully by falling back to a default 120 kWh electricity estimate rather than failing. |
| 4 | **5 MB OCR file cap** | Files are processed in-memory (multer memoryStorage). A 5 MB hard cap prevents memory exhaustion on the Express process under concurrent uploads. |
| 5 | **Gemini API is primary; fallback is local** | When the Gemini API is unavailable (no key, quota, timeout), deterministic fallback responses in `aiFallbacks.ts` are served. The UX is degraded but never broken. |
| 6 | **Single active action plan per user** | Only one `ActionPlan` with `status = "Active"` is materialised at a time. Generating a new plan does not delete old ones — they transition to an archived status for history. |
| 7 | **Points are non-transferable and backend-authoritative** | All point mutations happen server-side in `prisma.user.update()` — the client never submits a point value directly, preventing manipulation. |
| 8 | **Carbon Twin is regenerated on demand** | The Twin profile is not auto-updated on each footprint log (to avoid excessive AI API calls). Users trigger regeneration explicitly, allowing them to review changes at meaningful intervals. |

---

## Key Features

### Carbon Calculator
Track emissions across transport, food, energy, shopping, and waste.

### Carbon Twin
Creates a personalized sustainability profile based on user behavior.

### Future You Simulator
Simulate lifestyle changes and estimate future carbon reductions.

### AI Carbon Coach
Provides contextual recommendations and answers based on user footprint history.

### 30-Day Action Plan
Generates personalized daily sustainability tasks.

### Challenges & Achievements
Gamified system with points, levels, badges, streaks, and leaderboards.

### Bill & Receipt Processing
Extracts sustainability-related information from uploaded documents.


## ⚙️ Local Installation Guide

### Prerequisites

- **Node.js** ≥ 18.x
- **PostgreSQL** 15+ (or Docker)
- **Gemini API Key** — [Get one free at Google AI Studio](https://aistudio.google.com/)

---

### 1. Clone & Configure

```bash
git clone https://github.com/your-org/carbon-coach.git
cd carbon-coach

# Copy and fill in environment variables
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
DATABASE_URL="postgresql://carbon:carbon@localhost:5432/carbon_coach?schema=public"
JWT_SECRET="your-strong-secret-here"
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-1.5-flash"
PORT="4000"
NODE_ENV="development"
FRONTEND_ORIGIN="http://localhost:5173"
VITE_API_BASE_URL="http://localhost:4000/api"
VITE_APP_NAME="Carbon Coach"
```

---

### 2. Start the Database

**Option A — Docker (recommended):**
```bash
docker-compose up -d
```

**Option B — Local PostgreSQL:**
```sql
CREATE USER carbon WITH PASSWORD 'carbon';
CREATE DATABASE carbon_coach OWNER carbon;
```

---

### 3. Set Up the Backend

```bash
cd backend
npm install
npm run prisma:generate     # Generate Prisma client
npm run prisma:migrate      # Apply all migrations
npm run db:seed             # Seed emission factors, challenges, and badges
npm run dev                 # Start backend on http://localhost:4000
```

---

### 4. Set Up the Frontend

```bash
# In a new terminal, from the project root:
cd frontend
npm install
npm run dev                 # Start frontend on http://localhost:5173
```

---

### 5. Verify

Open **http://localhost:5173** in your browser.

- Backend health check: **http://localhost:4000/health** → `{ "status": "ok" }`
- Register an account, complete onboarding, and log your first footprint entry.

---

## 📁 Project Structure

```
carbon-coach/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # 16-model Prisma schema
│   │   └── seed.ts                # Emission factors, challenges, badges
│   └── src/
│       ├── middleware/            # auth, validation, security, rate-limit, errors
│       ├── modules/
│       │   ├── ai/                # Gemini client, prompt templates, fallbacks
│       │   ├── carbonTwin/        # Twin profile, simulations, action plans
│       │   ├── footprint/         # Footprint entry CRUD + CO₂e calculation
│       │   ├── ocr/               # Bill/receipt parsing pipeline
│       │   ├── dashboard/         # Aggregated stats endpoint
│       │   ├── challenges/        # Challenge catalogue + user progress
│       │   ├── badges/            # Badge rule evaluation + award
│       │   ├── recommendations/   # AI-generated ranked recommendations
│       │   └── ...                # auth, users, profile, emissions, demo
│       └── shared/                # AppError, shared types
├── frontend/
│   └── src/
│       ├── components/            # ui/, layout/, ai/, charts/
│       ├── pages/                 # 14 page components
│       ├── stores/                # Zustand stores (auth, toast)
│       ├── lib/                   # apiClient, utilities
│       ├── routes/                # React Router v7 route definitions
│       └── types/                 # API shape types
├── docker-compose.yml
├── render.yaml                    # Render.com deployment config
└── .env.example
```

---

## 🛠️ Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | React 18 + Vite 6 |
| **Language** | TypeScript 5.7 (full-stack) |
| **Styling** | Tailwind CSS 3.4 |
| **Animations** | Framer Motion 12 |
| **Charts** | Recharts 2 |
| **Icons** | Lucide React |
| **Server State** | TanStack React Query 5 |
| **Client State** | Zustand 5 |
| **Routing** | React Router v7 |
| **Backend** | Node.js + Express 4 |
| **ORM** | Prisma 5.22 |
| **Database** | PostgreSQL 15 |
| **Auth** | JWT + Argon2 |
| **AI** | Google Gemini API (`@google/generative-ai`) |
| **File Upload** | Multer (memory storage) |
| **Validation** | Zod |
| **HTTP Security** | Helmet + CORS + express-rate-limit |
| **Containerisation** | Docker + docker-compose |
| **Deployment** | Render.com (render.yaml) |

---

<div align="center">

**Built for the hackathon · Carbon Coach © 2026**

*Making sustainability actionable, one day at a time.*

</div>


## User Testing Results

8 testers completed onboarding.

Average completion time: 3 minutes.

87% successfully generated a Carbon Twin.

Most requested feature:
Regional emission factors.


## Test Report

## Quality Metrics

| Metric | Score |
|----------|----------|
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| Performance | 84 |

Measured using Google Lighthouse.

## Security

- JWT Authentication
- Argon2 Password Hashing
- Helmet Security Headers
- Rate Limiting
- Input Validation using Zod
- Protected API Routes
- Environment Variable Validation

## Accessibility

- Semantic HTML structure
- Keyboard navigation support
- ARIA labels
- Screen reader friendly forms
- Focus indicators
- Lighthouse Accessibility Score: 100

## Testing Strategy

The application is validated through:

- Authentication flow testing
- Carbon calculation verification
- API validation
- Form validation
- Error handling checks

Future improvements include automated unit and integration tests.