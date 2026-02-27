import type { FitnessLevel, CoachMessageType, ISO8601 } from './enums';
import type { MacroTargets } from './nutrition';

// ─── Plan Context (What the AI sees) ─────────────────────────────

export interface PlanContext {
    goals: {
        primary: string;
        caloricTarget: number;
        macroTargets: MacroTargets;
        weekNumber: number;
    };
    constraints: {
        allowedExerciseIds: string[];
        excludedExerciseIds: string[];
        allowedFoodIds: string[];
        sessionLengthMins: number;
        daysPerWeek: number;
        equipmentList: string[];
        dailyFoodBudget: number;
    };
    persona: {
        fitnessLevel: FitnessLevel;
        foodRegion: string;
        dietType: string;
        hasKitchen: boolean;
        hasMess: boolean;
        isExamWeek: boolean;
    };
    history: {
        adherenceRate: number;
        avgEnergyLevel: number;
        recentSkippedExerciseIds: string[];
        recentDislikedMeals: string[];
        progressVsTarget: number;
    };
}

// ─── Week Review Context ──────────────────────────────────────────

export interface WeekReviewContext {
    weekNumber: number;
    plannedWorkouts: number;
    completedWorkouts: number;
    adherenceRate: number;
    avgEnergyLevel: number;
    avgMood: number;
    avgSleepHours: number;
    wasExamWeek: boolean;
    weightChangeDeltaKg: number;
    nutritionAdherence: number;
    notableEvents: string[];
    skippedExerciseIds: string[];
    userNotes: string[];
}

export interface WeekReview {
    weekSummary: string;
    wins: string[];
    challenges: string[];
    insights: string[];
    nextWeekAdjustments: Array<{
        type: 'increase_volume' | 'decrease_volume' | 'swap_exercise' | 'add_rest_day' | 'change_session_length' | 'nutrition_tweak';
        reason: string;
        change: string;
    }>;
    shouldDeload: boolean;
    motivationMessage: string;
}

// ─── Coach Context ────────────────────────────────────────────────

export interface CoachContext {
    userName: string;
    currentPlanSummary: string;
    todaysPlan?: string;
    recentLogs?: string;
    streakDays: number;
    milestones: string[];
    adaptations?: string;
}

export interface CoachMessage {
    type: CoachMessageType;
    message: string;
    timestamp: ISO8601;
}

export interface ConstrainedAnswer {
    answer: string;
    confidence: 'high' | 'medium' | 'low';
    disclaimer?: string;
}

// ─── Validation ───────────────────────────────────────────────────

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}

export interface ValidationError {
    field: string;
    message: string;
    code: string;
}
