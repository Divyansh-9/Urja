import { z } from 'zod';

const InjurySchema = z.object({
    bodyPart: z.string().min(1),
    severity: z.enum(['mild', 'moderate', 'severe']),
    isActive: z.boolean(),
    notes: z.string().optional(),
});

const DayScheduleSchema = z.object({
    day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    busySlots: z.array(z.object({
        start: z.string(),
        end: z.string(),
        label: z.string(),
    })),
});

const DateRangeSchema = z.object({
    start: z.string(),
    end: z.string(),
});

const EnergyLogSchema = z.object({
    date: z.string(),
    level: z.number().int().min(1).max(5),
});

const MoodLogSchema = z.object({
    date: z.string(),
    mood: z.number().int().min(1).max(5),
    notes: z.string().optional(),
});

const MeasurementLogSchema = z.object({
    date: z.string(),
    weightKg: z.number().positive().optional(),
    waistCm: z.number().positive().optional(),
    chestCm: z.number().positive().optional(),
    armsCm: z.number().positive().optional(),
    hipsCm: z.number().positive().optional(),
});

export const UCOSchema = z.object({
    meta: z.object({
        userId: z.string().uuid(),
        version: z.number().int().positive(),
        lastUpdated: z.string(),
        onboardingComplete: z.boolean(),
    }),

    physical: z.object({
        age: z.number().int().min(13).max(100),
        sex: z.enum(['male', 'female', 'other']),
        heightCm: z.number().min(100).max(250),
        weightKg: z.number().min(25).max(300),
        bodyFatPercent: z.number().min(3).max(70).optional(),
        bmi: z.number().min(10).max(80),
        bmr: z.number().positive(),
        tdee: z.number().positive(),
    }),

    goals: z.object({
        primary: z.enum([
            'lose_fat', 'build_muscle', 'maintain',
            'improve_endurance', 'flexibility', 'general_health',
        ]),
        secondary: z.array(z.string()).optional(),
        targetWeightKg: z.number().positive().optional(),
        targetDate: z.string().optional(),
        urgency: z.enum(['slow', 'moderate', 'aggressive']),
    }),

    health: z.object({
        injuries: z.array(InjurySchema),
        medications: z.array(z.string()),
        conditions: z.array(z.string()),
        eatingDisorderRisk: z.boolean(),
        safetyClearance: z.enum(['full', 'modified', 'medical_only', 'blocked']),
        gpReferralSuggested: z.boolean(),
    }),

    lifestyle: z.object({
        schedule: z.array(DayScheduleSchema),
        examPeriods: z.array(DateRangeSchema),
        sleepHours: z.number().min(0).max(24),
        stressLevel: z.number().int().min(1).max(5),
        commuteMins: z.number().min(0),
        workoutTimePref: z.enum(['morning', 'afternoon', 'evening', 'flexible']),
        workoutDaysPerWeek: z.number().int().min(0).max(7),
        sessionLengthMins: z.number().int().min(10).max(180),
    }),

    environment: z.object({
        setting: z.enum(['hostel', 'home', 'gym', 'outdoor', 'mixed']),
        equipmentAvailable: z.array(z.string()),
        gymAccess: z.boolean(),
        gymDaysPerWeek: z.number().int().min(0).max(7).optional(),
        hasKitchen: z.boolean(),
        hasMess: z.boolean(),
        messSchedule: z.object({
            breakfast: z.object({ start: z.string(), end: z.string() }).optional(),
            lunch: z.object({ start: z.string(), end: z.string() }).optional(),
            dinner: z.object({ start: z.string(), end: z.string() }).optional(),
        }).optional(),
    }),

    nutrition: z.object({
        region: z.enum(['north_india', 'south_india', 'east_india', 'west_india', 'global']),
        dietType: z.enum(['omnivore', 'vegetarian', 'vegan', 'eggetarian', 'jain', 'halal', 'kosher']),
        allergies: z.array(z.string()),
        intolerances: z.array(z.string()),
        dislikedFoods: z.array(z.string()),
        favoriteFoods: z.array(z.string()),
        cookingSkill: z.enum(['none', 'basic', 'intermediate']),
        dailyFoodBudget: z.number().positive(),
        currency: z.string().min(1),
        canteenAvailable: z.boolean(),
        canteenMenu: z.array(z.object({
            name: z.string(),
            category: z.string(),
            estimatedCalories: z.number(),
            isVegetarian: z.boolean(),
        })).optional(),
    }),

    adaptive: z.object({
        currentPlanId: z.string(),
        planStartDate: z.string(),
        weekNumber: z.number().int().min(0),
        energyLevelHistory: z.array(EnergyLogSchema),
        adherenceRate: z.number().min(0).max(100),
        lastCheckIn: z.string(),
        moodHistory: z.array(MoodLogSchema),
        progressPhotos: z.array(z.string()),
        measurements: z.array(MeasurementLogSchema),
        activeTrack: z.enum(['standard', 'exam_survival', 'rehab', '90_day_bulk']).default('standard'),
    }),

    privacy: z.object({
        dataRetentionDays: z.number().int().positive(),
        allowAITraining: z.boolean(),
        shareWithCoach: z.string().optional(),
        exportKey: z.string().optional(),
    }),
});

export type UCOValidationResult = {
    valid: boolean;
    errors: Array<{ path: string; message: string }>;
};

export function validateUCO(data: unknown): UCOValidationResult {
    const result = UCOSchema.safeParse(data);
    if (result.success) {
        return { valid: true, errors: [] };
    }

    return {
        valid: false,
        errors: result.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
        })),
    };
}
