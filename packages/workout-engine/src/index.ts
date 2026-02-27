import type {
    Exercise, ExerciseConstraints, PlanSkeleton, WorkoutProfile,
    OverloadTargets, ExerciseHistory, WorkoutHistory, Equipment,
} from '@fitmind/shared-types';

// ─── Bodyweight Progression Ladders ──────────────────────────────

export const BODYWEIGHT_PROGRESSION: Record<string, string[]> = {
    pushup: ['knee_pushup', 'pushup', 'archer_pushup', 'diamond_pushup', 'one_arm_pushup_negatives'],
    squat: ['squat', 'pause_squat', 'bulgarian_split_squat', 'pistol_squat_assisted', 'pistol_squat'],
    pullup: ['dead_hang', 'scapular_retraction', 'band_assisted_pullup', 'negative_pullup', 'pullup'],
    hinge: ['good_morning', 'single_leg_rdl_bw', 'nordic_curl_assisted', 'nordic_curl'],
    plank: ['knee_plank', 'plank', 'plank_shoulder_tap', 'side_plank', 'plank_leg_raise'],
};

// ─── Constraint-Based Exercise Filtering ─────────────────────────

export function getEligibleExercises(
    allExercises: Exercise[],
    constraints: ExerciseConstraints,
): Exercise[] {
    return allExercises.filter((exercise) => {
        // Equipment check: user must have ALL required equipment
        const hasEquipment = exercise.equipmentRequired.length === 0 ||
            exercise.equipmentRequired.every((eq) =>
                constraints.equipmentAvailable.includes(eq as Equipment),
            );
        if (!hasEquipment) return false;

        // Tag exclusion check (safety gate output)
        if (exercise.tags.some((tag) => constraints.excludedTags.includes(tag))) return false;

        // Body part exclusion (injury-based)
        if (exercise.muscleGroups.some((mg) => constraints.excludedBodyParts.includes(mg))) return false;

        // Difficulty range
        if (exercise.difficulty < constraints.difficultyMin || exercise.difficulty > constraints.difficultyMax) return false;

        // Noise level
        if (constraints.noiseLevel === 'silent' && exercise.noiseLevel === 'normal') return false;
        if (constraints.noiseLevel === 'low' && exercise.noiseLevel === 'normal') return false;

        // Space requirement
        if (constraints.spaceRequired === 'minimal' && exercise.spaceRequired === 'full') return false;
        if (constraints.spaceRequired === 'medium' && exercise.spaceRequired === 'full') return false;

        // Target muscle groups (optional filter)
        if (constraints.targetMuscleGroups && constraints.targetMuscleGroups.length > 0) {
            const hasTarget = exercise.muscleGroups.some((mg) =>
                constraints.targetMuscleGroups!.includes(mg),
            );
            if (!hasTarget) return false;
        }

        return true;
    });
}

// ─── Plan Skeleton Builder ───────────────────────────────────────

const SPLIT_TEMPLATES = {
    2: [
        { day: 'Day 1', sessionType: 'strength' as const, targetMuscleGroups: ['chest', 'shoulders', 'triceps', 'core'], durationMins: 45 },
        { day: 'Day 2', sessionType: 'strength' as const, targetMuscleGroups: ['back', 'biceps', 'legs', 'core'], durationMins: 45 },
    ],
    3: [
        { day: 'Day 1', sessionType: 'strength' as const, targetMuscleGroups: ['chest', 'shoulders', 'triceps'], durationMins: 45 },
        { day: 'Day 2', sessionType: 'strength' as const, targetMuscleGroups: ['back', 'biceps', 'core'], durationMins: 45 },
        { day: 'Day 3', sessionType: 'strength' as const, targetMuscleGroups: ['legs', 'glutes', 'core'], durationMins: 45 },
    ],
    4: [
        { day: 'Day 1', sessionType: 'strength' as const, targetMuscleGroups: ['chest', 'triceps'], durationMins: 50 },
        { day: 'Day 2', sessionType: 'strength' as const, targetMuscleGroups: ['back', 'biceps'], durationMins: 50 },
        { day: 'Day 3', sessionType: 'strength' as const, targetMuscleGroups: ['legs', 'glutes'], durationMins: 50 },
        { day: 'Day 4', sessionType: 'strength' as const, targetMuscleGroups: ['shoulders', 'core', 'arms'], durationMins: 45 },
    ],
    5: [
        { day: 'Day 1', sessionType: 'strength' as const, targetMuscleGroups: ['chest'], durationMins: 50 },
        { day: 'Day 2', sessionType: 'strength' as const, targetMuscleGroups: ['back'], durationMins: 50 },
        { day: 'Day 3', sessionType: 'strength' as const, targetMuscleGroups: ['legs'], durationMins: 50 },
        { day: 'Day 4', sessionType: 'strength' as const, targetMuscleGroups: ['shoulders', 'triceps'], durationMins: 45 },
        { day: 'Day 5', sessionType: 'cardio' as const, targetMuscleGroups: ['full_body', 'core'], durationMins: 40 },
    ],
    6: [
        { day: 'Day 1', sessionType: 'strength' as const, targetMuscleGroups: ['chest', 'triceps'], durationMins: 50 },
        { day: 'Day 2', sessionType: 'strength' as const, targetMuscleGroups: ['back', 'biceps'], durationMins: 50 },
        { day: 'Day 3', sessionType: 'strength' as const, targetMuscleGroups: ['legs'], durationMins: 50 },
        { day: 'Day 4', sessionType: 'strength' as const, targetMuscleGroups: ['shoulders'], durationMins: 45 },
        { day: 'Day 5', sessionType: 'strength' as const, targetMuscleGroups: ['arms', 'core'], durationMins: 40 },
        { day: 'Day 6', sessionType: 'cardio' as const, targetMuscleGroups: ['full_body'], durationMins: 35 },
    ],
};

export function buildPlanSkeleton(profile: WorkoutProfile): PlanSkeleton {
    const days = Math.min(Math.max(profile.daysPerWeek, 2), 6);
    const template = SPLIT_TEMPLATES[days as keyof typeof SPLIT_TEMPLATES] || SPLIT_TEMPLATES[3];

    const repsRange: [number, number] = profile.goals === 'build_muscle'
        ? [6, 12]
        : profile.goals === 'lose_fat'
            ? [12, 15]
            : [8, 12];

    const setsPerSession = profile.fitnessLevel === 'beginner' ? 12
        : profile.fitnessLevel === 'intermediate' ? 16
            : 20;

    return {
        daysPerWeek: days,
        sessions: template.map((t) => ({
            ...t,
            durationMins: Math.min(t.durationMins, profile.sessionLengthMins),
            volumeTarget: { sets: setsPerSession, repsRange },
        })),
    };
}

// ─── Progressive Overload Calculation ────────────────────────────

export function calculateOverload(
    exerciseId: string,
    weekNumber: number,
    history: ExerciseHistory,
    hasWeights: boolean,
): OverloadTargets {
    const lastTwoSessions = history.logs.slice(-2);
    const hitTopOfRange = lastTwoSessions.length >= 2 &&
        lastTwoSessions.every((log) => log.reps >= 12 && log.energyLevel >= 3);

    if (hasWeights) {
        // Weight-based linear progression
        const lastWeight = lastTwoSessions[lastTwoSessions.length - 1]?.weightKg ?? 0;
        const increment = hitTopOfRange ? 2.5 : 0;

        return {
            exerciseId,
            weekNumber,
            sets: 3 + Math.floor(weekNumber / 4),
            repsMin: hitTopOfRange ? 6 : 8,
            repsMax: hitTopOfRange ? 10 : 12,
            weightKg: lastWeight + increment,
            restSeconds: 90,
            progressionNote: hitTopOfRange
                ? `Increase weight by ${increment}kg. Drop reps to 6-10.`
                : 'Focus on hitting top of rep range before adding weight.',
        };
    }

    // Bodyweight progression
    return {
        exerciseId,
        weekNumber,
        sets: Math.min(3 + Math.floor(weekNumber / 3), 5),
        repsMin: 8 + Math.min(weekNumber, 4),
        repsMax: 12 + Math.min(weekNumber, 6),
        restSeconds: 60,
        progressionNote: hitTopOfRange
            ? 'Consider advancing to harder variation next week.'
            : 'Build volume — add 1-2 reps per set this week.',
    };
}

// ─── Deload Detection ────────────────────────────────────────────

export function shouldDeload(history: WorkoutHistory): { deload: boolean; reason?: string } {
    if (history.weeklyLogs.length < 3) return { deload: false };

    const recent3 = history.weeklyLogs.slice(-3);
    const avgEnergy = recent3.reduce((sum, w) => sum + w.avgEnergyLevel, 0) / 3;
    const avgAdherence = recent3.reduce((sum, w) => sum + (w.completedSessions / w.plannedSessions), 0) / 3;

    if (avgEnergy < 2.5) {
        return { deload: true, reason: 'Average energy below 2.5 for 3 weeks — recovery needed.' };
    }

    if (avgAdherence < 0.5) {
        return { deload: true, reason: 'Adherence below 50% for 3 weeks — plan may be too demanding.' };
    }

    // Every 4th week auto-suggest deload
    const currentWeek = history.weeklyLogs.length;
    if (currentWeek > 0 && currentWeek % 4 === 0) {
        return { deload: true, reason: 'Scheduled deload week for recovery and adaptation.' };
    }

    return { deload: false };
}

// ─── Exercise Alternatives ───────────────────────────────────────

export function getAlternatives(
    exerciseId: string,
    allExercises: Exercise[],
    constraints: ExerciseConstraints,
    limit = 5,
): Exercise[] {
    const target = allExercises.find((e) => e.id === exerciseId);
    if (!target) return [];

    const eligible = getEligibleExercises(allExercises, constraints);

    return eligible
        .filter((e) => e.id !== exerciseId)
        .map((e) => ({
            exercise: e,
            score: e.muscleGroups.filter((mg) => target.muscleGroups.includes(mg)).length,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((e) => e.exercise);
}

// ─── Hostel Constraints ──────────────────────────────────────────

export function getHostelConstraints(roomType: 'single' | 'shared' | 'dorm'): Partial<ExerciseConstraints> {
    const base: Partial<ExerciseConstraints> = {
        spaceRequired: 'minimal',
        excludedTags: ['high_impact', 'jump', 'run'],
    };

    if (roomType === 'shared' || roomType === 'dorm') {
        base.noiseLevel = 'silent';
        base.excludedTags = [...(base.excludedTags || []), 'clapping', 'stomping'];
    } else {
        base.noiseLevel = 'low';
    }

    return base;
}
