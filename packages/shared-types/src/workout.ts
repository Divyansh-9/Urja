import type { Equipment, NoiseLevel, SpaceRequired, SessionType } from './enums';

export interface Exercise {
    id: string;
    name: string;
    muscleGroups: string[];
    equipmentRequired: Equipment[];
    difficulty: 1 | 2 | 3 | 4 | 5;
    noiseLevel: NoiseLevel;
    spaceRequired: SpaceRequired;
    tags: string[];
    videoRef?: string;
    contraindicatedConditions: string[];
    instructions: string;
}

export interface ExerciseConstraints {
    equipmentAvailable: Equipment[];
    excludedTags: string[];
    excludedBodyParts: string[];
    noiseLevel: NoiseLevel;
    spaceRequired: SpaceRequired;
    difficultyMin: number;
    difficultyMax: number;
    targetMuscleGroups?: string[];
}

export interface OverloadTargets {
    exerciseId: string;
    weekNumber: number;
    sets: number;
    repsMin: number;
    repsMax: number;
    weightKg?: number;
    restSeconds: number;
    progressionNote: string;
}

export interface ExerciseInPlan {
    exerciseId: string;
    sets: number;
    repsMin: number;
    repsMax: number;
    restSeconds: number;
    notes: string;
    progressionNote: string;
}

export interface WorkoutDay {
    dayName: string;
    sessionType: SessionType;
    durationMins: number;
    exercises: ExerciseInPlan[];
    warmup: string[];
    cooldown: string[];
}

export interface WorkoutPlan {
    id: string;
    userId: string;
    weekNumber: number;
    days: WorkoutDay[];
    coachNote: string;
    generatedAt: string;
}

export interface PlanSkeleton {
    daysPerWeek: number;
    sessions: Array<{
        day: string;
        sessionType: SessionType;
        targetMuscleGroups: string[];
        volumeTarget: { sets: number; repsRange: [number, number] };
        durationMins: number;
    }>;
}

export interface ExerciseHistory {
    exerciseId: string;
    logs: Array<{
        date: string;
        sets: number;
        repsAchieved: number;
        weightKg?: number;
        energyLevel: number;
    }>;
}

export interface WorkoutHistory {
    weeklyLogs: Array<{
        weekNumber: number;
        completedSessions: number;
        plannedSessions: number;
        avgEnergyLevel: number;
        totalVolume: number;
    }>;
}

export interface WorkoutProfile {
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
    daysPerWeek: number;
    sessionLengthMins: number;
    setting: 'hostel' | 'home' | 'gym' | 'outdoor' | 'mixed';
    equipment: Equipment[];
    goals: string;
}
