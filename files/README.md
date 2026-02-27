# 🧠⚡ FitMind AI — Personalized Workout & Diet Planner
> *Built for real students. Not gym bros with protein powder budgets.*

---

## What This Actually Is

FitMind AI is a deeply personalized fitness and nutrition system that treats a student in a hostel room with no gym access, exam stress, and ₹150/day food budget as a **first-class citizen** — not an edge case.

Most fitness apps pretend personalization means picking "Weight Loss" from a dropdown. We go 10 layers deeper.

---

## The 12 Problems We're Solving (And How)

| # | Problem | Our Answer |
|---|---------|------------|
| 1 | Generic personalization | 40-point onboarding + continuous adaptive context |
| 2 | Ignores real-life constraints | Timetable integration, exam calendar, sleep/stress inputs |
| 3 | Western food bias | Regional cuisine DB (Indian, SE Asian, African, LatAm) |
| 4 | Weak budget modeling | Per-item local price estimation, canteen menu parsing |
| 5 | Assumes gym + kitchen | Hostel-mode, bodyweight-first, mess-compatible plans |
| 6 | Cold-start + logging fatigue | Minimal onboarding path, passive inference, smart defaults |
| 7 | Safety + injury gaps | Conservative AI rules, injury flag system, GP referral triggers |
| 8 | Shallow engagement | Behavioral science layer: streaks, micro-wins, mood check-ins |
| 9 | LLM hallucinations + context limits | Structured memory graphs, fact-anchored prompt templates |
| 10 | Fragmented data silos | Unified User Context Object (UCO) synced across modules |
| 11 | Privacy + trust | Local-first storage option, explicit consent flows, data passport |
| 12 | AI bolt-on confusion | AI is a **reasoning engine under the hood**, not a chatbot on top |

---

## Who This Is For

**Primary**: College/university students (18–25), particularly in India, Southeast Asia, and other regions underrepresented in fitness tech.

**Secondary**: Budget-conscious young professionals, hostel/dorm residents globally.

**Explicitly NOT for**: People with serious eating disorders, active injuries requiring physiotherapy, or medical conditions requiring supervised care. The system **detects** these and redirects appropriately.

---

## Core Philosophy

```
PERSONALIZATION > PERFECTION
ADHERENCE > OPTIMIZATION  
SAFETY > PERFORMANCE
CULTURE > CONVENTION
```

A plan the user follows 70% of the time beats the scientifically perfect plan they abandon in week 2.

---

## Tech Stack

```
Frontend        React 18 + Vite  (SPA, PWA-ready)
Styling         Tailwind CSS + custom design tokens
State           Zustand + Immer (client state)
Backend         Node.js + Express (API layer)
Database        PostgreSQL (structured) + Redis (session/cache)
AI Engine       Anthropic Claude API (claude-sonnet-4-6)
Auth            Clerk (or Supabase Auth)
Storage         Supabase Storage (media) + LocalStorage fallback
Deployment      Vercel (frontend) + Railway/Render (backend)
```

---

## Repository Structure

```
fitmind-ai/
├── apps/
│   ├── web/                    # React frontend
│   └── api/                    # Express backend
├── packages/
│   ├── ai-engine/              # Prompt engineering + Claude integration
│   ├── nutrition-db/           # Regional food database
│   ├── workout-engine/         # Exercise logic + plan generation
│   ├── user-context/           # UCO (User Context Object) schema + sync
│   └── shared-types/           # TypeScript types shared across packages
├── docs/
│   ├── README.md               ← You are here
│   ├── ARCHITECTURE.md         # System design + data flow
│   ├── FEATURES_SCOPE.md       # Full feature list + priorities
│   ├── MODULES.md              # Module contracts + interfaces
│   ├── AI_PROMPTS.md           # Prompt engineering guide
│   ├── SAFETY.md               # Medical safety framework
│   └── CONTRIBUTING.md
├── scripts/
│   ├── seed-foods.js           # Seed regional food DB
│   └── migrate.js
└── docker-compose.yml
```

---

## Getting Started (Dev)

```bash
# Clone and install
git clone https://github.com/yourorg/fitmind-ai
cd fitmind-ai
pnpm install

# Environment setup
cp apps/api/.env.example apps/api/.env
# Add: ANTHROPIC_API_KEY, DATABASE_URL, REDIS_URL, CLERK_SECRET

# Start all services
pnpm dev

# Seed the food database
pnpm seed:foods --region=india
```

---

## Environment Variables

```env
# AI
ANTHROPIC_API_KEY=sk-ant-...
AI_MODEL=claude-sonnet-4-6
AI_MAX_TOKENS=4096

# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Auth
CLERK_SECRET_KEY=...
CLERK_PUBLISHABLE_KEY=...

# Storage
SUPABASE_URL=...
SUPABASE_ANON_KEY=...

# Feature flags
ENABLE_WEARABLE_SYNC=false
ENABLE_CANTEEN_PARSER=true
LOCAL_FIRST_MODE=false
```

---

## Key Design Decisions

### 1. The UCO (User Context Object)
Everything the AI knows about a user lives in one structured object. It's versioned, diff-tracked, and partially available to every module. No silos.

### 2. Prompt Templates, Not Prompt Engineering Per-Request
All AI calls use battle-tested templates from `packages/ai-engine/templates/`. The LLM never sees raw user input directly — it sees structured context injected into validated templates.

### 3. Conservative Safety Layer
Before any plan is generated, a `SafetyGate` module runs. Flags like `hasInjury`, `onMedication`, `BMI_extreme`, or `eatingDisorderRisk` block certain plan types and surface appropriate messaging.

### 4. Region-First Food Database
The `nutrition-db` package ships with 3,000+ region-coded food items. Every user is assigned a `foodRegion` during onboarding. The AI only pulls from that region's subset + globally safe items.

### 5. Offline-First Architecture
Plans are cached locally. The app works without internet after first load. Logging works offline and syncs when connected.

---

## Roadmap

```
v1.0  Core onboarding + plan generation + logging
v1.1  Regional food DB expansion + canteen menu input
v1.2  Adaptive plan adjustment (weekly AI review)
v1.3  Behavioral coaching layer + streak system
v1.4  Wearable data ingestion (Google Fit, Apple Health)
v2.0  Social accountability features
v2.1  Nutritionist/trainer marketplace integration
```

---

## License

MIT. But if you build this and charge ₹10,000/month for it, you're missing the point.
