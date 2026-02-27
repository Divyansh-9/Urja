# 🧩 MODULES.md — Module Contracts & Interfaces

> Each module is independently testable. Each module has one job. Modules communicate via typed contracts, never via raw DB queries into another module's tables.

---

## Module Map

```
packages/
├── ai-engine          # All LLM interaction lives here
├── nutrition-db       # Food data, regional mapping, budget logic
├── workout-engine     # Exercise selection, plan structure, overload logic
├── user-context       # UCO schema, validation, version management
└── shared-types       # TypeScript types used across all packages

apps/
├── api/
│   ├── modules/
│   │   ├── onboarding/      # Step processing, UCO creation
│   │   ├── plans/           # Plan generation orchestration
│   │   ├── logging/         # Workout + nutrition logs
│   │   ├── coaching/        # AI messages, check-ins, streaks
│   │   ├── progress/        # Metrics, charts, reports
│   │   └── privacy/         # Data export, deletion, consent
│   └── middleware/
│       ├── auth.ts
│       ├── ucoLoader.ts
│       ├── safetyGate.ts
│       └── rateLimiter.ts
└── web/
    └── (see ARCHITECTURE.md for frontend structure)
```

---

## Package: `user-context`

**Responsibility**: Own the UCO schema, validate updates, manage versioning, compute derived fields.

```typescript
// Public API

// Validate and create a new UCO
createUCO(input: OnboardingInput): Promise<UserContextObject>

// Update specific fields and bump version
updateUCO(userId: string, patch: Partial<UCOPatch>): Promise<UserContextObject>

// Get current UCO (from cache or DB)
getUCO(userId: string): Promise<UserContextObject>

// Get UCO at a specific version
getUCOVersion(userId: string, version: number): Promise<UserContextObject>

// Compute derived fields (BMI, TDEE, BMR)
computeDerived(physical: PhysicalProfile, lifestyle: LifestyleProfile): DerivedMetrics

// Validate UCO against schema
validateUCO(uco: unknown): ValidationResult

// Diff two UCO versions
diffUCO(v1: UserContextObject, v2: UserContextObject): UCODiff
```

**What it does NOT do**: It does not touch the AI, it does not generate plans, it does not talk to the food DB.

---

## Package: `ai-engine`

**Responsibility**: All prompt construction, Claude API calls, response parsing and validation.

```typescript
// Public API

// Generate a full workout plan
generateWorkoutPlan(context: PlanContext): Promise<WorkoutPlan>

// Generate a nutrition plan
generateNutritionPlan(context: PlanContext): Promise<NutritionPlan>

// Analyze a week's logs and suggest adjustments
analyzeWeek(context: WeekReviewContext): Promise<WeekReview>

// Generate a coaching message
generateCoachMessage(type: CoachMessageType, context: CoachContext): Promise<CoachMessage>

// Answer a constrained user question about their plan
answerPlanQuestion(question: string, planContext: PlanContext): Promise<ConstrainedAnswer>
```

### PlanContext (what the AI sees)

```typescript
interface PlanContext {
  // Physical targets
  goals: {
    primary: string;
    caloricTarget: number;
    macroTargets: MacroTargets;
    weekNumber: number;
  };

  // Constraints (pre-filtered — AI doesn't decide safety)
  constraints: {
    allowedExerciseIds: string[];    // pre-filtered from DB
    excludedExerciseIds: string[];   // safety gate output
    allowedFoodIds: string[];        // pre-filtered for region + diet
    sessionLengthMins: number;
    daysPerWeek: number;
    equipmentList: string[];
    dailyFoodBudget: number;
  };

  // Context for personalization
  persona: {
    fitnessLevel: "beginner" | "intermediate" | "advanced";
    foodRegion: string;
    dietType: string;
    hasKitchen: boolean;
    hasMess: boolean;
    isExamWeek: boolean;
  };

  // Adaptive signal
  history: {
    adherenceRate: number;
    avgEnergyLevel: number;
    recentSkippedExerciseIds: string[];
    recentDislikedMeals: string[];
    progressVsTarget: number;    // % ahead/behind
  };
}
```

### Response Validation

```typescript
// Every AI response is validated against a strict schema before use
interface WorkoutPlanValidation {
  validateExercises: (plan: WorkoutPlan, db: ExerciseDB) => ValidationResult;
  validateSafety: (plan: WorkoutPlan, safetyFlags: SafetyFlags) => ValidationResult;
  validateProgressionLogic: (plan: WorkoutPlan, history: WorkoutHistory) => ValidationResult;
}

// If validation fails: retry with error context injected (max 2 retries)
// If still fails: fall back to template-based plan, log for review
```

---

## Package: `nutrition-db`

**Responsibility**: Regional food data, macro lookups, budget calculations, mess food handling.

```typescript
// Public API

// Get foods available for a user's region and diet type
getFoodsForUser(region: FoodRegion, dietType: DietType, budget: number): Promise<Food[]>

// Search foods (for logging)
searchFoods(query: string, region: FoodRegion, limit?: number): Promise<Food[]>

// Get macro data for a food item
getFoodMacros(foodId: string, servingGrams: number): MacroData

// Estimate canteen meal macros by category
estimateMessMealMacros(category: MessMealCategory, portionSize: "small" | "medium" | "large"): MacroEstimate

// Calculate daily plan cost
estimatePlanCost(mealPlan: MealPlan, region: FoodRegion): CostEstimate

// Check if a food is available in a region
isFoodAvailable(foodId: string, region: FoodRegion): boolean
```

### Regional Food Database Structure

```
nutrition-db/
├── data/
│   ├── global/             # Items available everywhere
│   │   └── packaged.json   # Branded packaged foods
│   ├── india/
│   │   ├── north/          # Punjabi, UP, Delhi, Rajasthan
│   │   ├── south/          # Tamil Nadu, Karnataka, Andhra, Kerala
│   │   ├── east/           # Bengal, Odisha, Assam
│   │   ├── west/           # Maharashtra, Gujarat, Goa
│   │   └── mess/           # Common hostel mess items
│   ├── se_asia/
│   ├── africa/
│   └── latam/
└── schema/
    └── food.schema.json
```

### Mess Food Categories

```typescript
type MessMealCategory =
  | "dal_roti"
  | "rice_dal"
  | "rice_sambhar"
  | "rajma_rice"
  | "chole_bhature"
  | "sabzi_roti"
  | "poha"
  | "upma"
  | "idli_sambar"
  | "egg_curry"
  | "chicken_curry"
  | "fried_rice"
  | "chapati_plain"
  | "salad";

// Each category has a macro range: {min, max, avg} for cal/protein/carbs/fat
// Plans use the average, displayed with ±15% uncertainty range
```

---

## Package: `workout-engine`

**Responsibility**: Exercise selection logic, plan structure, progressive overload calculation, bodyweight scaling.

```typescript
// Public API

// Get exercises matching user constraints (pre-filtering before AI)
getEligibleExercises(constraints: ExerciseConstraints): Promise<Exercise[]>

// Structure a weekly plan skeleton (days, session types, volume targets)
buildPlanSkeleton(profile: WorkoutProfile): PlanSkeleton

// Calculate progressive overload for week N
calculateOverload(exercise: Exercise, weekN: number, history: ExerciseHistory): OverloadTargets

// Suggest alternative exercises (for swaps)
getAlternatives(exerciseId: string, constraints: ExerciseConstraints, limit?: number): Promise<Exercise[]>

// Detect if a deload week is needed
shouldDeload(history: WorkoutHistory): { deload: boolean; reason?: string }

// Generate hostel-specific plan constraints
getHostelConstraints(roomType: "single" | "shared" | "dorm"): ExerciseConstraints
```

### Exercise Constraint System

```typescript
interface ExerciseConstraints {
  // Equipment filter (AND — must have all required)
  equipmentAvailable: EquipmentId[];
  
  // Tag exclusions (safety gate output)
  excludedTags: string[];
  
  // Body part exclusions (injury-based)
  excludedBodyParts: string[];
  
  // Noise/space constraints
  noiseLevel: "silent" | "low" | "normal";
  spaceRequired: "minimal" | "medium" | "full";
  
  // Difficulty range
  difficultyMin: 1;
  difficultyMax: 5;
  
  // Target muscle groups for this session
  targetMuscleGroups?: string[];
}
```

### Progressive Overload Logic

```typescript
// Bodyweight progression ladder (when no weights available)
const BODYWEIGHT_PROGRESSION = {
  pushup: ["knee_pushup", "pushup", "archer_pushup", "diamond_pushup", "one_arm_pushup_negatives"],
  squat: ["squat", "pause_squat", "bulgarian_split_squat", "pistol_squat_assisted", "pistol_squat"],
  pullup: ["dead_hang", "scapular_retraction", "band_assisted_pullup", "negative_pullup", "pullup"],
  hinge: ["good_morning", "single_leg_rdl_bw", "nordic_curl_assisted", "nordic_curl"],
};

// Rule: progress to next variation only when:
// - User hits top of rep range for 2 consecutive sessions
// - User rates energy ≥ 3 for those sessions
// - No recent injury flags

// Weight progression (gym access):
// - Linear: +2.5kg per session for compound lifts (beginner)
// - Double progression: hit top of rep range for all sets first, then add weight
```

---

## Module: `api/middleware/safetyGate.ts`

**Responsibility**: Run all deterministic safety checks before plan generation. Block, modify, or flag accordingly.

```typescript
interface SafetyGateResult {
  clearance: "full" | "modified" | "blocked";
  blockedFeatures: BlockedFeature[];
  warnings: SafetyWarning[];
  requiredModifications: PlanModification[];
  gpReferralSuggested: boolean;
  gpReferralReason?: string;
  displayMessage?: string;  // User-facing message if clearance != "full"
}

// ALL rules are listed in ARCHITECTURE.md Section 5
// Key principle: if in doubt, be conservative
function runSafetyGate(uco: UserContextObject): SafetyGateResult
```

---

## Module: `api/modules/onboarding/`

### Step Processors

Each step is an independent processor:

```typescript
interface StepProcessor {
  step: OnboardingStep;
  validate(input: unknown): ValidationResult;
  process(input: unknown, partialUCO: Partial<UserContextObject>): Partial<UserContextObject>;
  computeSmartDefaults(partialUCO: Partial<UserContextObject>): Partial<UserContextObject>;
}
```

### Step 3: HealthStep — Special Handling

```typescript
// SCOFF Screener (eating disorder risk)
// 5 yes/no questions, score ≥ 2 = risk flag
const SCOFF_QUESTIONS = [
  "Do you ever make yourself vomit because you feel uncomfortably full?",
  "Do you worry you have lost control over how much you eat?",
  "Have you recently lost more than one stone (6kg) in a three-month period?",
  "Do you believe yourself to be fat when others say you are too thin?",
  "Would you say that food dominates your life?",
];

// If score >= 2:
// - Set uco.health.eatingDisorderRisk = true
// - Do NOT show target weight field ever
// - Change goal framing from "weight loss" to "health & energy"
// - Show resources at end of onboarding (not alarming, supportive)
```

---

## Module: `api/modules/plans/`

### Plan Generation Orchestrator

```typescript
async function generatePlan(userId: string, planType: PlanType): Promise<Plan> {
  // 1. Load UCO
  const uco = await getUCO(userId);
  
  // 2. Safety Gate (deterministic)
  const safety = runSafetyGate(uco);
  if (safety.clearance === "blocked") {
    return buildSafePlanResponse(safety);
  }
  
  // 3. Pre-filter exercises and foods (DB, not AI)
  const eligibleExercises = await getEligibleExercises(buildConstraints(uco, safety));
  const eligibleFoods = await getFoodsForUser(uco.nutrition.region, uco.nutrition.dietType, uco.nutrition.dailyFoodBudget);
  
  // 4. Build compressed context for AI
  const planContext = buildPlanContext(uco, safety, eligibleExercises, eligibleFoods);
  
  // 5. AI generation (with retry logic)
  const aiPlan = await generateFromAI(planContext, planType);
  
  // 6. Validate AI output
  const validation = validatePlan(aiPlan, eligibleExercises, eligibleFoods, safety);
  if (!validation.valid) {
    // Retry once with validation errors as feedback
    const retryPlan = await generateFromAI(planContext, planType, validation.errors);
    // If still invalid, fall back to template
    if (!validatePlan(retryPlan, ...).valid) {
      return buildTemplatePlan(uco, eligibleExercises, eligibleFoods);
    }
    return persistAndReturn(retryPlan, userId, uco);
  }
  
  // 7. Persist and return
  return persistAndReturn(aiPlan, userId, uco);
}
```

---

## Module: `api/modules/coaching/`

### Check-In Processing

```typescript
interface DailyCheckIn {
  userId: string;
  date: ISO8601;
  energyLevel: 1 | 2 | 3 | 4 | 5;
  mood: 1 | 2 | 3 | 4 | 5;
  sleepHours: number;
  stressLevel: 1 | 2 | 3 | 4 | 5;
  examWeek: boolean;
  notes?: string;
}

// After each check-in, run adaptation triggers:
async function processCheckIn(checkIn: DailyCheckIn): Promise<AdaptationResult> {
  const history = await getCheckInHistory(checkIn.userId, 7); // last 7 days
  const triggers = evaluateAdaptationTriggers(checkIn, history);
  
  // Example triggers:
  // - 3 consecutive days of energy ≤ 2 → suggest deload
  // - sleep < 5hrs for 2 days → reduce workout intensity today
  // - examWeek = true → switch to exam-week plan
  // - stressLevel ≥ 4 for 3 days → add rest day, add walk/yoga
  
  if (triggers.length > 0) {
    await applyAdaptations(checkIn.userId, triggers);
    return { adapted: true, triggers, message: buildAdaptationMessage(triggers) };
  }
  
  return { adapted: false, triggers: [] };
}
```

### Coach Message Types

```typescript
type CoachMessageType =
  | "daily_tip"           // Morning: what to focus on today
  | "pre_workout"         // Before session starts
  | "post_workout"        // After session logged
  | "missed_session"      // Gentle check-in (not guilt)
  | "weekly_review"       // Sunday summary
  | "milestone"           // Achievement unlocked
  | "adaptation_explain"  // "I changed your plan because..."
  | "exam_week_support"   // Special messaging during exams
  | "low_adherence"       // Plan too hard? Let's talk.
```

---

## Module: `api/modules/privacy/`

```typescript
// Full data export (DPDP / GDPR compliant)
async function exportUserData(userId: string): Promise<UserDataExport> {
  return {
    profile: await getUCO(userId),
    plans: await getAllPlans(userId),
    workoutLogs: await getAllWorkoutLogs(userId),
    nutritionLogs: await getAllNutritionLogs(userId),
    checkIns: await getAllCheckIns(userId),
    coachMessages: await getAllCoachMessages(userId),
    exportedAt: new Date().toISOString(),
    format: "fitmind-export-v1",
  };
}

// Hard delete — no soft delete, actual purge
async function deleteAllUserData(userId: string): Promise<void> {
  await db.transaction(async (trx) => {
    await trx("check_ins").where({ user_id: userId }).delete();
    await trx("nutrition_logs").where({ user_id: userId }).delete();
    await trx("workout_logs").where({ user_id: userId }).delete();
    await trx("plans").where({ user_id: userId }).delete();
    await trx("user_context").where({ user_id: userId }).delete();
    await trx("users").where({ id: userId }).delete();
  });
  await redis.del(`uco:${userId}`);
  // Supabase storage deletion
  await storage.deleteFolder(`users/${userId}`);
}
```

---

## Cross-Module Communication Rules

1. **Modules never query another module's DB tables directly.** Use the module's exported service functions.

2. **AI engine never reads the DB directly.** It receives a `PlanContext` object built by the orchestrator.

3. **Safety Gate is always middleware, never skipped.** Even plan regeneration and manual edits pass through it.

4. **UCO is the shared language.** Any module that needs user data asks for the UCO. No one maintains their own user profile copy.

5. **All AI outputs are treated as untrusted until validated.** Schema check, DB existence check, safety re-check.

---

## Testing Strategy Per Module

| Module | Test Type | Key Scenarios |
|--------|-----------|---------------|
| user-context | Unit | UCO validation, derived field computation, edge BMI values |
| safety-gate | Unit | All 12 safety rules, boundary conditions, combinations |
| ai-engine | Integration | Mocked Claude responses, retry logic, validation failures |
| nutrition-db | Unit | Regional filtering, budget calculations, macro accuracy |
| workout-engine | Unit | Constraint filtering, progression logic, deload detection |
| onboarding | E2E | Full wizard flow, skip logic, SCOFF screener, resume |
| plans | Integration | Full plan generation pipeline, safety gates, fallbacks |
| coaching | Unit | Check-in trigger logic, adaptation rules |
| privacy | E2E | Full export, hard delete, verification of purge |
