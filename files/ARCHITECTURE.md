# 🏗️ ARCHITECTURE.md — FitMind AI System Design

> Brain 1 designed it. Brain 2 stress-tested it. This is what survived.

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT (React PWA)                          │
│                                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ Onboard  │  │Dashboard │  │ Planner  │  │  AI Coach Chat   │   │
│  │  Wizard  │  │+ Logger  │  │ Viewer   │  │  (Structured)    │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘   │
│       │              │              │                  │              │
│       └──────────────┴──────────────┴──────────────────┘            │
│                              │                                        │
│                    ┌─────────▼──────────┐                            │
│                    │  Zustand Store      │                            │
│                    │  (UCO + UI State)   │                            │
│                    └─────────┬──────────┘                            │
│                              │ REST / WebSocket                       │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                         API LAYER (Express)                          │
│                                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │/onboard  │  │/plans    │  │/log      │  │  /ai/coach       │   │
│  │  Router  │  │  Router  │  │  Router  │  │  Router          │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘   │
│       │              │              │                  │              │
│  ┌────▼──────────────▼──────────────▼──────────────────▼──────────┐ │
│  │                    MIDDLEWARE PIPELINE                           │ │
│  │  Auth → UCO Loader → Safety Gate → Rate Limiter → Logger       │ │
│  └────────────────────────────┬────────────────────────────────────┘ │
│                               │                                       │
│  ┌────────────────────────────▼────────────────────────────────────┐ │
│  │                      SERVICE LAYER                               │ │
│  │                                                                   │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │ │
│  │  │  UCO Service│  │  AI Service │  │  Plan Gen Service       │ │ │
│  │  │  (context   │  │  (prompt    │  │  (workout + nutrition)  │ │ │
│  │  │   manager)  │  │   engine)   │  │                         │ │ │
│  │  └──────┬──────┘  └──────┬──────┘  └────────────┬────────────┘ │ │
│  │         │                │                       │              │ │
│  │  ┌──────▼──────┐  ┌──────▼──────┐  ┌────────────▼────────────┐ │ │
│  │  │Safety Gate  │  │ Food DB     │  │ Exercise DB             │ │ │
│  │  │(rules engine│  │ (regional)  │  │ (equipment-aware)       │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                       │
┌───────▼────────┐   ┌─────────▼───────┐   ┌─────────▼────────┐
│   PostgreSQL   │   │     Redis        │   │  Anthropic API   │
│  (persistent   │   │  (session cache  │   │  (LLM reasoning  │
│   user data)   │   │   + rate limits) │   │   engine)        │
└────────────────┘   └─────────────────┘   └──────────────────┘
```

---

## 2. The UCO — User Context Object

This is the **single source of truth** for everything the AI knows about a user. Every service reads from it. It's version-controlled and diff-tracked.

```typescript
interface UserContextObject {
  // Identity
  meta: {
    userId: string;
    version: number;           // increments on every meaningful change
    lastUpdated: ISO8601;
    onboardingComplete: boolean;
  };

  // Physical Profile
  physical: {
    age: number;
    sex: "male" | "female" | "other";
    heightCm: number;
    weightKg: number;
    bodyFatPercent?: number;   // optional, estimated if not provided
    bmi: number;               // computed
    bmr: number;               // computed (Mifflin-St Jeor)
    tdee: number;              // computed from activityLevel
  };

  // Goals
  goals: {
    primary: "lose_fat" | "build_muscle" | "maintain" | "improve_endurance" | "flexibility" | "general_health";
    secondary?: string[];
    targetWeightKg?: number;
    targetDate?: ISO8601;
    urgency: "slow" | "moderate" | "aggressive";  // maps to caloric deficit
  };

  // Health & Safety Flags (CRITICAL — gates plan generation)
  health: {
    injuries: Injury[];           // { bodyPart, severity, isActive, notes }
    medications: string[];        // free text, AI flags known contraindications
    conditions: string[];         // e.g. "PCOS", "Type 2 diabetes"
    eatingDisorderRisk: boolean;  // set by onboarding risk screener
    safetyClearance: SafetyLevel; // "full" | "modified" | "medical_only" | "blocked"
    gpReferralSuggested: boolean;
  };

  // Lifestyle Constraints
  lifestyle: {
    schedule: DaySchedule[];      // per weekday: classes, work, commitments
    examPeriods: DateRange[];     // AI reduces intensity during these
    sleepHours: number;
    stressLevel: 1 | 2 | 3 | 4 | 5;
    commuteMins: number;
    workoutTimePref: "morning" | "afternoon" | "evening" | "flexible";
    workoutDaysPerWeek: number;   // user preference, AI may adjust
    sessionLengthMins: number;
  };

  // Environment & Equipment
  environment: {
    setting: "hostel" | "home" | "gym" | "outdoor" | "mixed";
    equipmentAvailable: Equipment[];  // from a curated enum list
    gymAccess: boolean;
    gymDaysPerWeek?: number;
    hasKitchen: boolean;
    hasMess: boolean;            // Indian hostel context
    messSchedule?: MessSchedule;
  };

  // Food & Culture
  nutrition: {
    region: FoodRegion;          // "north_india" | "south_india" | "bengali" | etc.
    dietType: "omnivore" | "vegetarian" | "vegan" | "eggetarian" | "jain" | "halal" | "kosher";
    allergies: string[];
    intolerances: string[];
    dislikedFoods: string[];
    favoriteFoods: string[];
    cookingSkill: "none" | "basic" | "intermediate";
    dailyFoodBudget: number;     // in local currency
    currency: string;
    canteenAvailable: boolean;
    canteenMenu?: CanteenItem[]; // parsed or manually entered
  };

  // Adaptive State (changes over time)
  adaptive: {
    currentPlanId: string;
    planStartDate: ISO8601;
    weekNumber: number;
    energyLevelHistory: EnergyLog[];  // last 14 days
    adherenceRate: number;            // rolling 7-day %
    lastCheckIn: ISO8601;
    moodHistory: MoodLog[];
    progressPhotos: string[];         // storage refs
    measurements: MeasurementLog[];
  };

  // Privacy Settings
  privacy: {
    dataRetentionDays: number;
    allowAITraining: boolean;
    shareWithCoach?: string;    // coach userId if connected
    exportKey?: string;         // user-held encryption key (local-first mode)
  };
}
```

---

## 3. Data Flow: Plan Generation

```
User requests new plan
        │
        ▼
┌───────────────────┐
│   UCO Loader      │  Fetch full UCO from DB + cache in Redis
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│   Safety Gate     │  Rule-based checks (NOT AI)
│                   │  → injury conflicts
│                   │  → eating disorder risk
│                   │  → extreme BMI handling
│                   │  → medication flags
└────────┬──────────┘
         │
    ┌────┴────────────────────┐
    │ BLOCKED?                │ MODIFIED?      CLEAR?
    ▼                         ▼                ▼
Show safe       Inject constraint      Continue full
messaging +     flags into context     generation
GP referral
         │
         ▼
┌───────────────────┐
│  Context Builder  │  Compress UCO → structured prompt context
│                   │  → select relevant fields only
│                   │  → attach regional food subset
│                   │  → attach available exercise subset
│                   │  → attach behavioral history summary
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Prompt Templater │  Inject context into validated template
│                   │  → WorkoutPlanTemplate or NutritionTemplate
│                   │  → NEVER raw user text in prompt
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Claude API Call  │  Structured JSON output enforced via
│                   │  response_format schema + retry logic
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Output Validator │  Schema validate the AI response
│                   │  → calorie math check
│                   │  → exercise existence check against DB
│                   │  → flag hallucinated food items
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Plan Persister   │  Save to DB, cache in Redis, push to client
└───────────────────┘
```

---

## 4. AI Architecture: Prompt Engineering Strategy

### Golden Rule
> The LLM is a **reasoning engine**, not a data source. All facts (exercises, foods, calories, safety rules) come from our DB. The LLM only decides *how to combine and sequence them*.

### Template Categories

```
templates/
├── plan-generation/
│   ├── workout-week.hbs        # Full week workout plan
│   ├── meal-day.hbs            # Daily meal plan
│   └── progressive-overload.hbs # Week N adjustments
├── adaptation/
│   ├── weekly-review.hbs       # Analyze logs, suggest changes
│   └── energy-adjust.hbs       # Low energy → deload week
├── coaching/
│   ├── motivation.hbs          # Behavioral support
│   └── habit-nudge.hbs         # Missed session follow-up
└── safety/
    ├── injury-modifier.hbs     # Adapt plan around injury
    └── medical-flag.hbs        # Recommend professional help
```

### Memory Architecture (Solving the Context Window Problem)

```
┌──────────────────────────────────────┐
│           MEMORY LAYERS              │
│                                      │
│  Layer 1: Hot Context (in-prompt)    │
│  → Current week plan                 │
│  → Last 7 days logs                  │
│  → Current week goals                │
│  → Safety flags                      │
│                                      │
│  Layer 2: Warm Summary (DB-fetched)  │
│  → Rolling stats: adherence,         │
│    avg calories, workout completion  │
│  → Progress milestones               │
│  → Key preference learnings          │
│                                      │
│  Layer 3: Cold Archive (retrieval)   │
│  → Full log history (summarized)     │
│  → Past plans (archived)             │
│  → Onboarding data snapshot          │
└──────────────────────────────────────┘
```

The AI never gets the full history. It gets a **compressed narrative** of it, plus fresh hot data.

---

## 5. Safety Gate — Rule Engine

This is deterministic code, NOT AI. It runs before every plan generation call.

```typescript
// Safety levels mapped to plan capabilities
const SAFETY_RULES: SafetyRule[] = [
  {
    condition: (uco) => uco.health.eatingDisorderRisk === true,
    action: "block_caloric_deficit",
    message: "Show eating disorder support resources",
    setFlag: "safetyClearance:modified",
  },
  {
    condition: (uco) => uco.physical.bmi < 16,
    action: "block_weight_loss_goal",
    message: "Redirect to maintenance/health plan only",
    setFlag: "gpReferralSuggested:true",
  },
  {
    condition: (uco) => uco.health.injuries.some(i => i.bodyPart === "spine" && i.isActive),
    action: "restrict_exercises",
    restrictExerciseTags: ["spinal_load", "deadlift", "squat_barbell", "overhead_press"],
    message: "Spine injury detected — high-load spinal exercises excluded",
  },
  {
    condition: (uco) => uco.health.medications.some(m => HIGH_RISK_MEDS.includes(m)),
    action: "flag_medication",
    message: "Consult doctor before starting program",
    setFlag: "gpReferralSuggested:true",
  },
  {
    condition: (uco) => uco.physical.bmi > 40,
    action: "restrict_exercises",
    restrictExerciseTags: ["high_impact", "jump", "run"],
    message: "High-impact exercises modified for joint safety",
  },
];
```

---

## 6. Database Schema (Key Tables)

```sql
-- Core user data
users (id, clerk_id, email, created_at, deleted_at)

-- The UCO stored as versioned JSONB
user_context (
  id, user_id, version, data JSONB,
  created_at, is_current BOOLEAN
)

-- Generated plans
plans (
  id, user_id, type ENUM('workout','nutrition','combined'),
  week_number, data JSONB, generated_at,
  safety_flags_applied JSONB, ai_model_version TEXT
)

-- Daily logs
workout_logs (
  id, user_id, plan_id, date,
  exercises_completed JSONB,
  energy_level INT, mood INT, notes TEXT
)

nutrition_logs (
  id, user_id, plan_id, date,
  meals_logged JSONB, total_calories INT,
  water_ml INT, notes TEXT
)

-- Food database (regional)
foods (
  id, name, name_local TEXT, region_code TEXT,
  calories_per_100g, protein_g, carbs_g, fat_g,
  fiber_g, common_serving_g, is_mess_food BOOLEAN,
  price_estimate_inr FLOAT, tags TEXT[]
)

-- Exercise database
exercises (
  id, name, muscle_groups TEXT[], equipment_required TEXT[],
  difficulty INT, tags TEXT[], video_ref TEXT,
  contraindicated_conditions TEXT[], instructions TEXT
)

-- Behavioral tracking
check_ins (
  id, user_id, date, energy_level INT,
  mood INT, sleep_hours FLOAT, stress_level INT,
  exam_week BOOLEAN, notes TEXT
)
```

---

## 7. Frontend Architecture

```
apps/web/src/
├── pages/
│   ├── Onboarding/
│   │   ├── index.tsx               # Step router
│   │   ├── steps/
│   │   │   ├── BasicsStep.tsx
│   │   │   ├── GoalsStep.tsx
│   │   │   ├── HealthStep.tsx      # Safety screener
│   │   │   ├── LifestyleStep.tsx   # Schedule + constraints
│   │   │   ├── EquipmentStep.tsx
│   │   │   └── FoodCultureStep.tsx
│   │   └── OnboardingComplete.tsx
│   ├── Dashboard/
│   │   ├── index.tsx
│   │   ├── TodayView.tsx           # Today's workout + meals
│   │   ├── WeekView.tsx
│   │   └── QuickLog.tsx            # Minimal friction logging
│   ├── Plans/
│   │   ├── WorkoutPlan.tsx
│   │   ├── NutritionPlan.tsx
│   │   └── PlanHistory.tsx
│   ├── Progress/
│   │   ├── StatsView.tsx
│   │   ├── BodyMetrics.tsx
│   │   └── AdherenceChart.tsx
│   └── Settings/
│       ├── ProfileEdit.tsx
│       ├── PrivacySettings.tsx     # Data passport + consent
│       └── RegionSettings.tsx
│
├── components/
│   ├── ui/                         # Design system primitives
│   ├── workout/
│   │   ├── ExerciseCard.tsx
│   │   ├── SetLogger.tsx
│   │   └── WorkoutTimer.tsx
│   ├── nutrition/
│   │   ├── MealCard.tsx
│   │   ├── FoodSearch.tsx          # Regional food search
│   │   └── MacroRing.tsx
│   └── coach/
│       ├── DailyCheckIn.tsx        # Mood + energy widget
│       ├── WeeklyReview.tsx        # AI-generated summary
│       └── MotivationNudge.tsx
│
├── store/
│   ├── ucoStore.ts                 # Zustand UCO slice
│   ├── planStore.ts
│   ├── logStore.ts                 # Offline-first log queue
│   └── uiStore.ts
│
├── hooks/
│   ├── useUCO.ts
│   ├── usePlanGeneration.ts
│   ├── useOfflineSync.ts           # Background sync when online
│   └── useSafetyGate.ts            # Client-side safety check
│
└── lib/
    ├── api.ts                      # Typed API client
    ├── aiPrompts.ts                # Client-visible prompt helpers
    └── regionalDefaults.ts         # UI defaults per region
```

---

## 8. Critical Architecture Decisions & Tradeoffs

### Decision 1: Monorepo with Turborepo
**Why**: `ai-engine`, `nutrition-db`, and `workout-engine` are shared between web API and potential mobile. Single TS config, single lint pass.
**Tradeoff**: Higher initial setup complexity.

### Decision 2: UCO as Versioned JSONB, Not Normalized Tables
**Why**: The user profile schema will evolve. JSONB lets us add fields without migrations for each change. We keep `version` for schema migrations.
**Tradeoff**: Can't do complex SQL queries on nested UCO fields. Solution: denormalize key fields (region, safety flags) into columns.

### Decision 3: AI Output Always Validated Against Exercise/Food DB
**Why**: LLMs hallucinate. A plan suggesting "50 burpee box jumps" to someone with a knee injury, or a meal with food items that don't exist, breaks trust permanently.
**Tradeoff**: Slower plan generation (DB lookup after AI response). Mitigation: pre-filter available exercises/foods *before* sending to AI.

### Decision 4: Safety Gate is Deterministic Rules, Not AI
**Why**: You cannot have an AI decide if something is safe for a user with a spinal injury. Rule-based systems are auditable, explainable, and won't hallucinate.
**Tradeoff**: Less nuanced than AI safety assessment. Solution: rules are conservative by default, and AI adds nuance *within* the safe envelope.

### Decision 5: Offline-First Logging
**Why**: Students log during workouts. Gyms, parks, hostel common rooms — connectivity is unreliable.
**Tradeoff**: Sync conflict resolution complexity. Solution: logs are append-only with timestamps. Last-write-wins on check-ins.

---

## 9. Security Model

```
Authentication      Clerk JWT (short-lived) + refresh tokens
Authorization       User can only read/write their own UCO
AI Prompts          Sanitized, no raw user input in prompts
Health Data         Encrypted at rest (AES-256)
Local-First Mode    User-held key, server sees only encrypted blob
Data Deletion       GDPR/DPDP compliant hard delete within 30 days
Rate Limiting       10 plan generations/day, 50 AI coach messages/day
```
