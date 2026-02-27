import type { DerivedMetrics } from '@fitmind/shared-types';

/**
 * Compute BMI from height (cm) and weight (kg).
 * BMI = weight / (height_m)^2
 */
export function computeBMI(heightCm: number, weightKg: number): number {
    const heightM = heightCm / 100;
    return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/**
 * Compute BMR using Mifflin-St Jeor equation.
 * Male:   10 × weight(kg) + 6.25 × height(cm) − 5 × age − 161 + 5 = ... + 5
 * Female: 10 × weight(kg) + 6.25 × height(cm) − 5 × age − 161
 * Other:  average of male and female
 */
export function computeBMR(
    weightKg: number,
    heightCm: number,
    age: number,
    sex: 'male' | 'female' | 'other',
): number {
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;

    switch (sex) {
        case 'male':
            return Math.round(base + 5);
        case 'female':
            return Math.round(base - 161);
        case 'other':
            return Math.round(base + (5 - 161) / 2);
    }
}

/**
 * Compute TDEE from BMR and activity multiplier.
 * Activity is approximated from workout days/week + commute + setting.
 */
export function computeTDEE(
    bmr: number,
    workoutDaysPerWeek: number,
    commuteMins: number,
    setting: string,
): number {
    let multiplier: number;

    if (workoutDaysPerWeek <= 1) {
        multiplier = 1.2; // Sedentary
    } else if (workoutDaysPerWeek <= 3) {
        multiplier = 1.375; // Lightly active
    } else if (workoutDaysPerWeek <= 5) {
        multiplier = 1.55; // Moderately active
    } else {
        multiplier = 1.725; // Very active
    }

    // Commute bonus (walking/cycling)
    if (commuteMins > 30) multiplier += 0.05;
    if (commuteMins > 60) multiplier += 0.05;

    // Setting adjustment
    if (setting === 'hostel') multiplier -= 0.05; // Less incidental movement
    if (setting === 'outdoor') multiplier += 0.05;

    return Math.round(bmr * multiplier);
}

/**
 * Compute all derived metrics from physical + lifestyle data.
 */
export function computeDerived(
    physical: { weightKg: number; heightCm: number; age: number; sex: 'male' | 'female' | 'other' },
    lifestyle: { workoutDaysPerWeek: number; commuteMins: number },
    setting: string,
): DerivedMetrics {
    const bmi = computeBMI(physical.heightCm, physical.weightKg);
    const bmr = computeBMR(physical.weightKg, physical.heightCm, physical.age, physical.sex);
    const tdee = computeTDEE(bmr, lifestyle.workoutDaysPerWeek, lifestyle.commuteMins, setting);

    return { bmi, bmr, tdee };
}
