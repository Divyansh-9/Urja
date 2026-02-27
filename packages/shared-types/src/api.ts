// ─── API Request/Response Types ───────────────────────────────────

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
    };
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

// ─── Auth ─────────────────────────────────────────────────────────

export interface AuthUser {
    id: string;
    email: string;
    createdAt: string;
}

export interface AuthSession {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    user: AuthUser;
}

// ─── Plan Generation Request ──────────────────────────────────────

export interface GeneratePlanRequest {
    planType: 'workout' | 'nutrition' | 'combined';
    forceRegenerate?: boolean;
}

export interface SwapExerciseRequest {
    planId: string;
    dayIndex: number;
    exerciseIndex: number;
    newExerciseId: string;
}

export interface SwapMealRequest {
    planId: string;
    dayIndex: number;
    mealIndex: number;
    newFoodIds: Array<{ foodId: string; servingGrams: number }>;
}

// ─── Coaching ─────────────────────────────────────────────────────

export interface CoachChatRequest {
    question: string;
}

export interface ConsentUpdate {
    allowAITraining?: boolean;
    dataRetentionDays?: number;
}
