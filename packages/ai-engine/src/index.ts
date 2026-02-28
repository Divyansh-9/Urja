import { GoogleGenAI } from '@google/genai';
import type {
    PlanContext, WorkoutPlan, NutritionPlan,
    WeekReviewContext, WeekReview,
    CoachMessageType, CoachContext, CoachMessage,
    ConstrainedAnswer, ValidationResult,
} from '@fitmind/shared-types';
import {
    buildWorkoutPlanPrompt,
    buildNutritionPlanPrompt,
    buildWeeklyReviewPrompt,
    buildCoachChatPrompt,
    sanitizeForPrompt,
} from './prompts';

export { sanitizeForPrompt } from './prompts';
export {
    buildWorkoutPlanPrompt,
    buildNutritionPlanPrompt,
    buildWeeklyReviewPrompt,
    buildCoachChatPrompt,
} from './prompts';

// ─── Token Budget Management ─────────────────────────────────────

const TOKEN_BUDGETS = {
    workout_plan_generation: { input: 2500, output: 2000 },
    nutrition_plan_generation: { input: 2000, output: 2500 },
    weekly_review: { input: 1500, output: 800 },
    coach_message: { input: 800, output: 300 },
    constrained_chat: { input: 1200, output: 150 },
};

// ─── Gemini Client ───────────────────────────────────────────────

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
    if (!client) {
        client = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });
    }
    return client;
}

// ─── Core API call with retry ────────────────────────────────────

async function callGemini(
    system: string,
    userMessage: string,
    maxTokens: number,
    retryContext?: string,
): Promise<string> {
    const ai = getClient();
    const model = process.env.AI_MODEL || 'gemini-2.5-flash';

    let content = userMessage;

    if (retryContext) {
        content = `${userMessage}\n\nPREVIOUS ATTEMPT HAD ERRORS:\n${retryContext}\nFix these errors in your response.`;
    }

    const response = await ai.models.generateContent({
        model,
        contents: content,
        config: {
            systemInstruction: system,
            maxOutputTokens: maxTokens,
        },
    });

    return response.text ?? '';
}

function parseJSON<T>(text: string): T {
    // Extract JSON from response (may be wrapped in markdown code blocks)
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in AI response');

    const jsonStr = jsonMatch[1] || jsonMatch[0];
    return JSON.parse(jsonStr);
}

async function callWithRetry<T>(
    system: string,
    user: string,
    maxTokens: number,
    validate: (result: T) => ValidationResult,
    maxRetries = 2,
): Promise<T> {
    let lastError: string | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await callGemini(system, user, maxTokens, lastError ?? undefined);
            const parsed = parseJSON<T>(response);
            const validation = validate(parsed);

            if (validation.valid) return parsed;

            lastError = validation.errors.map((e) => `${e.field}: ${e.message}`).join('\n');
        } catch (err) {
            lastError = err instanceof Error ? err.message : 'Unknown error';
        }
    }

    throw new Error(`AI generation failed after ${maxRetries + 1} attempts. Last error: ${lastError}`);
}

// ─── Validators ──────────────────────────────────────────────────

function validateWorkoutPlan(
    plan: Record<string, unknown>,
    allowedExerciseIds: string[],
    maxSessionMins?: number,
): ValidationResult {
    const errors: ValidationResult['errors'] = [];

    if (!plan.days || !Array.isArray(plan.days)) {
        errors.push({ field: 'days', message: 'Missing or invalid days array', code: 'MISSING_FIELD' });
        return { valid: false, errors };
    }

    const days = plan.days as Array<Record<string, unknown>>;
    for (const day of days) {
        // Validate duration constraint
        if (maxSessionMins && typeof day.durationMins === 'number' && day.durationMins > maxSessionMins) {
            errors.push({
                field: `day.${day.dayName}.durationMins`,
                message: `Session duration ${day.durationMins} exceeds max of ${maxSessionMins} minutes. Reduce exercises or rest times.`,
                code: 'DURATION_EXCEEDED',
            });
        }

        const exercises = day.exercises as Array<Record<string, unknown>> | undefined;
        if (!exercises) continue;

        for (const ex of exercises) {
            if (typeof ex.exerciseId === 'string' && !allowedExerciseIds.includes(ex.exerciseId)) {
                errors.push({
                    field: `exercises.${ex.exerciseId}`,
                    message: `Exercise ID "${ex.exerciseId}" not in allowed list`,
                    code: 'INVALID_EXERCISE',
                });
            }
        }
    }

    return { valid: errors.length === 0, errors };
}

function validateNutritionPlan(
    plan: Record<string, unknown>,
    allowedFoodIds: string[],
    caloricTarget: number,
): ValidationResult {
    const errors: ValidationResult['errors'] = [];

    if (!plan.days || !Array.isArray(plan.days)) {
        errors.push({ field: 'days', message: 'Missing or invalid days array', code: 'MISSING_FIELD' });
        return { valid: false, errors };
    }

    const days = plan.days as Array<Record<string, unknown>>;
    for (const day of days) {
        const totals = day.dailyTotals as Record<string, number> | undefined;
        if (totals) {
            const calDiff = Math.abs(totals.calories - caloricTarget);
            if (calDiff > 100) {
                errors.push({
                    field: `day${day.day}.calories`,
                    message: `Calories ${totals.calories} differ from target ${caloricTarget} by ${calDiff}`,
                    code: 'CALORIE_MISMATCH',
                });
            }
        }
    }

    return { valid: errors.length === 0, errors };
}

// ─── Public API ──────────────────────────────────────────────────

export async function generateWorkoutPlan(context: PlanContext): Promise<WorkoutPlan> {
    const { system, user } = buildWorkoutPlanPrompt(context);

    const result = await callWithRetry<Record<string, unknown>>(
        system,
        user,
        TOKEN_BUDGETS.workout_plan_generation.output,
        (plan) => validateWorkoutPlan(plan, context.constraints.allowedExerciseIds, context.constraints.sessionLengthMins),
    );

    return {
        id: '',
        userId: '',
        weekNumber: context.goals.weekNumber,
        days: result.days as WorkoutPlan['days'],
        coachNote: (result.coachNote as string) || '',
        generatedAt: new Date().toISOString(),
    };
}

export async function generateNutritionPlan(context: PlanContext): Promise<NutritionPlan> {
    const { system, user } = buildNutritionPlanPrompt(context);

    const result = await callWithRetry<Record<string, unknown>>(
        system,
        user,
        TOKEN_BUDGETS.nutrition_plan_generation.output,
        (plan) => validateNutritionPlan(plan, context.constraints.allowedFoodIds, context.goals.caloricTarget),
    );

    return {
        id: '',
        userId: '',
        weekNumber: context.goals.weekNumber,
        days: result.days as NutritionPlan['days'],
        weeklyGroceryList: (result.weeklyGroceryList as NutritionPlan['weeklyGroceryList']) || [],
        dietitianNote: (result.dietitianNote as string) || '',
        generatedAt: new Date().toISOString(),
    };
}

export async function analyzeWeek(context: WeekReviewContext): Promise<WeekReview> {
    const { system, user } = buildWeeklyReviewPrompt(context);

    return callWithRetry<WeekReview>(
        system,
        user,
        TOKEN_BUDGETS.weekly_review.output,
        (review) => ({
            valid: Boolean(review.weekSummary && review.wins && review.motivationMessage),
            errors: !review.weekSummary
                ? [{ field: 'weekSummary', message: 'Missing week summary', code: 'MISSING_FIELD' }]
                : [],
        }),
    );
}

export async function generateCoachMessage(
    type: CoachMessageType,
    context: CoachContext,
): Promise<CoachMessage> {
    const system = `You are a supportive fitness coach. Generate a ${type} message.
Keep it personal, concise (max 100 words), and reference the user's actual data.
Name: ${context.userName}. Streak: ${context.streakDays} days.
${context.adaptations ? `Recent plan changes: ${context.adaptations}` : ''}
Output just the message text, no JSON.`;

    const user = `Plan: ${context.currentPlanSummary}
${context.todaysPlan ? `Today: ${context.todaysPlan}` : ''}
${context.recentLogs ? `Recent: ${context.recentLogs}` : ''}
Milestones: ${context.milestones.join(', ') || 'None yet'}`;

    const response = await callGemini(system, user, TOKEN_BUDGETS.coach_message.output);

    return {
        type,
        message: response.trim(),
        timestamp: new Date().toISOString(),
    };
}

export async function answerPlanQuestion(
    question: string,
    planContext: string,
): Promise<ConstrainedAnswer> {
    const { system, user } = buildCoachChatPrompt(planContext, question);
    const response = await callGemini(system, user, TOKEN_BUDGETS.constrained_chat.output);

    return {
        answer: response.trim(),
        confidence: 'medium',
    };
}
