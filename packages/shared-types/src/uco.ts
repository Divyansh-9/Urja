import type {
    ISO8601, Sex, GoalType, Urgency, SafetyLevel,
    WorkoutTimePref, EnvironmentSetting, Equipment,
    FoodRegion, DietType, CookingSkill,
} from './enums';

// ─── Sub-interfaces ───────────────────────────────────────────────

export interface Injury {
    bodyPart: string;
    severity: 'mild' | 'moderate' | 'severe';
    isActive: boolean;
    notes?: string;
}

export interface DaySchedule {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    busySlots: Array<{ start: string; end: string; label: string }>;
}

export interface DateRange {
    start: ISO8601;
    end: ISO8601;
}

export interface MessSchedule {
    breakfast?: { start: string; end: string };
    lunch?: { start: string; end: string };
    dinner?: { start: string; end: string };
}

export interface CanteenItem {
    name: string;
    category: string;
    estimatedCalories: number;
    isVegetarian: boolean;
}

export interface EnergyLog {
    date: ISO8601;
    level: 1 | 2 | 3 | 4 | 5;
}

export interface MoodLog {
    date: ISO8601;
    mood: 1 | 2 | 3 | 4 | 5;
    notes?: string;
}

export interface MeasurementLog {
    date: ISO8601;
    weightKg?: number;
    waistCm?: number;
    chestCm?: number;
    armsCm?: number;
    hipsCm?: number;
}

// ─── The UCO ──────────────────────────────────────────────────────

export interface UserContextObject {
    meta: {
        userId: string;
        version: number;
        lastUpdated: ISO8601;
        onboardingComplete: boolean;
    };

    physical: {
        age: number;
        sex: Sex;
        heightCm: number;
        weightKg: number;
        bodyFatPercent?: number;
        bmi: number;
        bmr: number;
        tdee: number;
    };

    goals: {
        primary: GoalType;
        secondary?: string[];
        targetWeightKg?: number;
        targetDate?: ISO8601;
        urgency: Urgency;
    };

    health: {
        injuries: Injury[];
        medications: string[];
        conditions: string[];
        eatingDisorderRisk: boolean;
        safetyClearance: SafetyLevel;
        gpReferralSuggested: boolean;
    };

    lifestyle: {
        schedule: DaySchedule[];
        examPeriods: DateRange[];
        sleepHours: number;
        stressLevel: 1 | 2 | 3 | 4 | 5;
        commuteMins: number;
        workoutTimePref: WorkoutTimePref;
        workoutDaysPerWeek: number;
        sessionLengthMins: number;
    };

    environment: {
        setting: EnvironmentSetting;
        equipmentAvailable: Equipment[];
        gymAccess: boolean;
        gymDaysPerWeek?: number;
        hasKitchen: boolean;
        hasMess: boolean;
        messSchedule?: MessSchedule;
    };

    nutrition: {
        region: FoodRegion;
        dietType: DietType;
        allergies: string[];
        intolerances: string[];
        dislikedFoods: string[];
        favoriteFoods: string[];
        cookingSkill: CookingSkill;
        dailyFoodBudget: number;
        currency: string;
        canteenAvailable: boolean;
        canteenMenu?: CanteenItem[];
    };

    adaptive: {
        currentPlanId: string;
        planStartDate: ISO8601;
        weekNumber: number;
        energyLevelHistory: EnergyLog[];
        adherenceRate: number;
        lastCheckIn: ISO8601;
        moodHistory: MoodLog[];
        progressPhotos: string[];
        measurements: MeasurementLog[];
    };

    privacy: {
        dataRetentionDays: number;
        allowAITraining: boolean;
        shareWithCoach?: string;
        exportKey?: string;
    };
}

// ─── UCO Helpers ──────────────────────────────────────────────────

export type UCOPatch = Partial<
    Pick<UserContextObject, 'physical' | 'goals' | 'health' | 'lifestyle' | 'environment' | 'nutrition' | 'adaptive' | 'privacy'>
>;

export interface UCODiff {
    version: { from: number; to: number };
    changes: Array<{
        path: string;
        oldValue: unknown;
        newValue: unknown;
    }>;
}

export interface DerivedMetrics {
    bmi: number;
    bmr: number;
    tdee: number;
}
