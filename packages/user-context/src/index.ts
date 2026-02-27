import type { UserContextObject, UCOPatch, UCODiff } from '@fitmind/shared-types';
import { computeDerived } from './derived';
import { validateUCO } from './schema';

export { computeDerived, computeBMI, computeBMR, computeTDEE } from './derived';
export { validateUCO, UCOSchema } from './schema';

/**
 * Create a new UCO from onboarding data.
 * Computes derived fields (BMI, BMR, TDEE) and sets initial adaptive state.
 */
export function createUCO(
    userId: string,
    onboardingData: Omit<UserContextObject, 'meta' | 'adaptive'> & {
        physical: Omit<UserContextObject['physical'], 'bmi' | 'bmr' | 'tdee'>;
    },
): UserContextObject {
    const derived = computeDerived(
        onboardingData.physical,
        onboardingData.lifestyle,
        onboardingData.environment.setting,
    );

    const uco: UserContextObject = {
        meta: {
            userId,
            version: 1,
            lastUpdated: new Date().toISOString(),
            onboardingComplete: true,
        },
        physical: {
            ...onboardingData.physical,
            ...derived,
        },
        goals: onboardingData.goals,
        health: onboardingData.health,
        lifestyle: onboardingData.lifestyle,
        environment: onboardingData.environment,
        nutrition: onboardingData.nutrition,
        adaptive: {
            currentPlanId: '',
            planStartDate: new Date().toISOString(),
            weekNumber: 0,
            energyLevelHistory: [],
            adherenceRate: 0,
            lastCheckIn: new Date().toISOString(),
            moodHistory: [],
            progressPhotos: [],
            measurements: [{
                date: new Date().toISOString(),
                weightKg: onboardingData.physical.weightKg,
            }],
        },
        privacy: onboardingData.privacy,
    };

    return uco;
}

/**
 * Apply a partial patch to a UCO, bumping version and recomputing derived fields.
 */
export function patchUCO(current: UserContextObject, patch: UCOPatch): UserContextObject {
    const updated: UserContextObject = {
        ...current,
        ...patch,
        meta: {
            ...current.meta,
            version: current.meta.version + 1,
            lastUpdated: new Date().toISOString(),
        },
    };

    // Recompute derived fields if physical or lifestyle changed
    if (patch.physical || patch.lifestyle) {
        const derived = computeDerived(
            updated.physical,
            updated.lifestyle,
            updated.environment.setting,
        );
        updated.physical = { ...updated.physical, ...derived };
    }

    return updated;
}

/**
 * Diff two UCO versions to track what changed.
 */
export function diffUCO(v1: UserContextObject, v2: UserContextObject): UCODiff {
    const changes: UCODiff['changes'] = [];

    function compareObjects(obj1: Record<string, unknown>, obj2: Record<string, unknown>, prefix: string) {
        const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
        for (const key of allKeys) {
            const path = prefix ? `${prefix}.${key}` : key;
            const val1 = obj1[key];
            const val2 = obj2[key];

            if (typeof val1 === 'object' && typeof val2 === 'object' && val1 !== null && val2 !== null && !Array.isArray(val1)) {
                compareObjects(val1 as Record<string, unknown>, val2 as Record<string, unknown>, path);
            } else if (JSON.stringify(val1) !== JSON.stringify(val2)) {
                changes.push({ path, oldValue: val1, newValue: val2 });
            }
        }
    }

    compareObjects(v1 as unknown as Record<string, unknown>, v2 as unknown as Record<string, unknown>, '');

    return {
        version: { from: v1.meta.version, to: v2.meta.version },
        changes,
    };
}

/**
 * Compute caloric target based on goal and TDEE.
 */
export function computeCaloricTarget(tdee: number, goal: string, urgency: string): number {
    const deficits: Record<string, Record<string, number>> = {
        lose_fat: { slow: -250, moderate: -400, aggressive: -500 },
        build_muscle: { slow: 200, moderate: 300, aggressive: 400 },
        maintain: { slow: 0, moderate: 0, aggressive: 0 },
        improve_endurance: { slow: 100, moderate: 200, aggressive: 200 },
        flexibility: { slow: 0, moderate: 0, aggressive: 0 },
        general_health: { slow: 0, moderate: -100, aggressive: -200 },
    };

    const adjustment = deficits[goal]?.[urgency] ?? 0;
    return Math.round(tdee + adjustment);
}

/**
 * Compute macro targets from caloric target and goal.
 */
export function computeMacroTargets(
    caloricTarget: number,
    weightKg: number,
    goal: string,
): { proteinG: number; carbsG: number; fatG: number } {
    let proteinMultiplier: number;
    let fatPercent: number;

    switch (goal) {
        case 'build_muscle':
            proteinMultiplier = 2.0; // g per kg
            fatPercent = 0.25;
            break;
        case 'lose_fat':
            proteinMultiplier = 2.2; // higher protein preserves muscle
            fatPercent = 0.25;
            break;
        default:
            proteinMultiplier = 1.6;
            fatPercent = 0.3;
    }

    const proteinG = Math.round(weightKg * proteinMultiplier);
    const fatG = Math.round((caloricTarget * fatPercent) / 9);
    const proteinCal = proteinG * 4;
    const fatCal = fatG * 9;
    const carbsG = Math.round((caloricTarget - proteinCal - fatCal) / 4);

    return { proteinG, carbsG: Math.max(carbsG, 50), fatG };
}
