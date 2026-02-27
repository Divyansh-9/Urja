import type { ISO8601 } from './enums';

// ─── Daily Check-In ───────────────────────────────────────────────

export interface DailyCheckIn {
    userId: string;
    date: ISO8601;
    energyLevel: 1 | 2 | 3 | 4 | 5;
    mood: 1 | 2 | 3 | 4 | 5;
    sleepHours: number;
    stressLevel: 1 | 2 | 3 | 4 | 5;
    examWeek: boolean;
    notes?: string;
}

// ─── Adaptation ───────────────────────────────────────────────────

export interface AdaptationTrigger {
    type: 'deload' | 'reduce_intensity' | 'exam_mode' | 'add_rest_day' | 'add_recovery';
    reason: string;
    severity: 'mild' | 'moderate' | 'critical';
}

export interface AdaptationResult {
    adapted: boolean;
    triggers: AdaptationTrigger[];
    message?: string;
}

// ─── Workout Log ──────────────────────────────────────────────────

export interface WorkoutLogEntry {
    id: string;
    userId: string;
    planId: string;
    date: ISO8601;
    exercisesCompleted: Array<{
        exerciseId: string;
        sets: Array<{ reps: number; weightKg?: number; completed: boolean }>;
    }>;
    energyLevel: 1 | 2 | 3 | 4 | 5;
    mood: 1 | 2 | 3 | 4 | 5;
    notes?: string;
    sessionDurationMins: number;
}

// ─── Nutrition Log ────────────────────────────────────────────────

export interface NutritionLogEntry {
    id: string;
    userId: string;
    planId: string;
    date: ISO8601;
    mealsLogged: Array<{
        mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
        items: Array<{ foodId: string; servingGrams: number }>;
    }>;
    totalCalories: number;
    waterMl: number;
    notes?: string;
}

// ─── Streak ───────────────────────────────────────────────────────

export interface StreakData {
    workoutStreak: number;
    logStreak: number;
    longestWorkoutStreak: number;
    longestLogStreak: number;
    lastWorkoutDate?: ISO8601;
    lastLogDate?: ISO8601;
}

// ─── Milestone ────────────────────────────────────────────────────

export interface Milestone {
    id: string;
    type: 'streak' | 'weight' | 'strength' | 'adherence' | 'consistency';
    title: string;
    description: string;
    achievedAt: ISO8601;
    celebrated: boolean;
}

// ─── Progress Metrics ─────────────────────────────────────────────

export interface WeightTrend {
    date: ISO8601;
    weightKg: number;
    movingAverage: number;
}

export interface StrengthProgression {
    exerciseId: string;
    exerciseName: string;
    data: Array<{
        date: ISO8601;
        estimatedOneRepMax: number;
        totalVolume: number;
    }>;
}

export interface AdherenceData {
    weekNumber: number;
    workoutAdherence: number;
    nutritionAdherence: number;
    checkInAdherence: number;
}

// ─── Privacy ──────────────────────────────────────────────────────

export interface UserDataExport {
    profile: Record<string, unknown>;
    plans: Record<string, unknown>[];
    workoutLogs: Record<string, unknown>[];
    nutritionLogs: Record<string, unknown>[];
    checkIns: Record<string, unknown>[];
    coachMessages: Record<string, unknown>[];
    exportedAt: ISO8601;
    format: 'fitmind-export-v1';
}
