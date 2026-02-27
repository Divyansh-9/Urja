import type { UserContextObject } from './uco';

// ─── Onboarding ───────────────────────────────────────────────────

export type OnboardingStep =
    | 'basics'
    | 'goals'
    | 'health'
    | 'lifestyle'
    | 'equipment'
    | 'food_culture';

export interface StepProcessor {
    step: OnboardingStep;
    validate(input: unknown): { valid: boolean; errors: string[] };
    process(input: unknown, partialUCO: Partial<UserContextObject>): Partial<UserContextObject>;
    computeSmartDefaults(partialUCO: Partial<UserContextObject>): Partial<UserContextObject>;
}

// ─── Step Inputs ──────────────────────────────────────────────────

export interface BasicsStepInput {
    age: number;
    sex: 'male' | 'female' | 'other';
    heightCm: number;
    weightKg: number;
    bodyFatPercent?: number;
}

export interface GoalsStepInput {
    primary: string;
    secondary?: string[];
    targetWeightKg?: number;
    urgency: 'slow' | 'moderate' | 'aggressive';
}

export interface HealthStepInput {
    injuries: Array<{ bodyPart: string; severity: string; isActive: boolean; notes?: string }>;
    medications: string[];
    conditions: string[];
    scoffAnswers: boolean[];
}

export interface LifestyleStepInput {
    schedule: Array<{ day: string; busySlots: Array<{ start: string; end: string; label: string }> }>;
    examPeriods: Array<{ start: string; end: string }>;
    sleepHours: number;
    stressLevel: number;
    commuteMins: number;
    workoutTimePref: string;
    workoutDaysPerWeek: number;
    sessionLengthMins: number;
}

export interface EquipmentStepInput {
    setting: string;
    equipmentAvailable: string[];
    gymAccess: boolean;
    gymDaysPerWeek?: number;
    hasKitchen: boolean;
    hasMess: boolean;
}

export interface FoodCultureStepInput {
    region: string;
    dietType: string;
    allergies: string[];
    intolerances: string[];
    dislikedFoods: string[];
    favoriteFoods: string[];
    cookingSkill: string;
    dailyFoodBudget: number;
    currency: string;
    canteenAvailable: boolean;
}

// ─── SCOFF Screener ───────────────────────────────────────────────

export const SCOFF_QUESTIONS = [
    'Do you ever make yourself vomit because you feel uncomfortably full?',
    'Do you worry you have lost control over how much you eat?',
    'Have you recently lost more than one stone (6kg) in a three-month period?',
    'Do you believe yourself to be fat when others say you are too thin?',
    'Would you say that food dominates your life?',
] as const;

export const SCOFF_THRESHOLD = 2;
