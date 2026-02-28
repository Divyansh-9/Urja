import { Router } from 'express';
import type { UCORequest } from '../../middleware/ucoLoader';
import { safetyGateMiddleware } from '../../middleware/safetyGate';
import { generateWorkoutPlan, generateNutritionPlan } from '@fitmind/ai-engine';
import { getEligibleExercises, buildPlanSkeleton } from '@fitmind/workout-engine';
import { computeCaloricTarget, computeMacroTargets } from '@fitmind/user-context';
import { Plan, Exercise, Food, User, ActivityFeed } from '../../models/index';
import type { PlanContext } from '@fitmind/shared-types';

export const plansRouter = Router();

// Apply safety gate to all plan routes
plansRouter.use(safetyGateMiddleware as any);

// POST /api/plans/generate
plansRouter.post('/generate', async (req: UCORequest & any, res) => {
    try {
        const { planType = 'workout' } = req.body;
        const uco = req.uco;

        if (!uco) {
            return res.status(400).json({
                success: false,
                error: { code: 'NO_UCO', message: 'Complete onboarding first' },
            });
        }

        const safetyResult = (req as any).safetyResult;

        // ─── Track Override Logic ────────────────────────────────
        const userDoc = await User.findById(req.userId).lean() as any;
        const activeTrack = userDoc?.activeTrack || 'standard';

        // Pre-filter exercises from DB (not AI)
        const allExercises = await Exercise.find().lean();
        const excludedTags = safetyResult?.requiredModifications
            ?.filter((m: any) => m.type === 'restrict_exercises')
            ?.flatMap((m: any) => m.params?.excludeTags || []) || [];

        let sessionLengthOverride = uco.lifestyle.sessionLengthMins;
        let daysPerWeekOverride = uco.lifestyle.workoutDaysPerWeek;
        let isExamWeekOverride = false;

        if (activeTrack === 'exam_survival') {
            sessionLengthOverride = 15;
            daysPerWeekOverride = Math.min(daysPerWeekOverride, 3);
            isExamWeekOverride = true;
            excludedTags.push('high_impact', 'jump', 'advanced', 'plyometric');
        } else if (activeTrack === '90_day_bulk') {
            sessionLengthOverride = Math.max(sessionLengthOverride, 60);
            daysPerWeekOverride = Math.max(daysPerWeekOverride, 5);
        }

        const constraints = {
            equipmentAvailable: uco.environment.equipmentAvailable as any[],
            excludedTags,
            excludedBodyParts: uco.health.injuries.filter((i: any) => i.isActive).map((i: any) => i.bodyPart),
            noiseLevel: (uco.environment.setting === 'hostel' ? 'low' : 'normal') as any,
            spaceRequired: (uco.environment.setting === 'hostel' ? 'minimal' : 'medium') as any,
            difficultyMin: 1,
            difficultyMax: activeTrack === 'exam_survival' ? 2 : (uco.adaptive.weekNumber < 4 ? 3 : 5),
        };

        const eligibleExercises = getEligibleExercises(allExercises as any[], constraints);

        // Pre-filter foods from DB
        const allFoods = await Food.find({ regionCode: { $in: [uco.nutrition.region, 'global'] } }).lean();

        // Compute targets
        const caloricTarget = computeCaloricTarget(uco.physical.tdee, uco.goals.primary, uco.goals.urgency);
        const macroTargets = computeMacroTargets(caloricTarget, uco.physical.weightKg, uco.goals.primary);

        // Build plan context for AI
        const planContext: PlanContext = {
            goals: {
                primary: uco.goals.primary,
                caloricTarget,
                macroTargets,
                weekNumber: uco.adaptive.weekNumber + 1,
            },
            constraints: {
                allowedExerciseIds: eligibleExercises.map((e: any) => e.id),
                excludedExerciseIds: [],
                allowedFoodIds: allFoods.map((f: any) => f._id.toString()),
                sessionLengthMins: sessionLengthOverride,
                daysPerWeek: daysPerWeekOverride,
                equipmentList: uco.environment.equipmentAvailable,
                dailyFoodBudget: uco.nutrition.dailyFoodBudget,
            },
            persona: {
                fitnessLevel: uco.adaptive.weekNumber < 4 ? 'beginner' : 'intermediate',
                foodRegion: uco.nutrition.region,
                dietType: uco.nutrition.dietType,
                hasKitchen: uco.environment.hasKitchen,
                hasMess: uco.environment.hasMess,
                isExamWeek: isExamWeekOverride || uco.lifestyle.examPeriods.some((ep: any) => {
                    const now = new Date();
                    return new Date(ep.start) <= now && now <= new Date(ep.end);
                }),
            },
            history: {
                adherenceRate: uco.adaptive.adherenceRate,
                avgEnergyLevel: uco.adaptive.energyLevelHistory.length > 0
                    ? uco.adaptive.energyLevelHistory.slice(-7).reduce((s: any, e: any) => s + e.level, 0) / Math.min(uco.adaptive.energyLevelHistory.length, 7)
                    : 3,
                recentSkippedExerciseIds: [],
                recentDislikedMeals: [],
                progressVsTarget: 0,
            },
        };

        // Generate plan via AI
        let planData;
        if (planType === 'workout' || planType === 'combined') {
            planData = await generateWorkoutPlan(planContext);
        } else {
            planData = await generateNutritionPlan(planContext);
        }

        // Persist plan
        const plan = await Plan.create({
            userId: req.userId,
            type: planType,
            weekNumber: uco.adaptive.weekNumber + 1,
            data: planData,
            safetyFlagsApplied: safetyResult?.warnings || [],
            aiModelVersion: process.env.AI_MODEL || 'claude-sonnet-4-20250514',
        });

        res.json({
            success: true,
            data: {
                planId: plan._id,
                plan: planData,
                safetyWarnings: safetyResult?.warnings || [],
                safetyMessage: safetyResult?.displayMessage,
            },
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: { code: 'PLAN_GEN_ERROR', message: err.message },
        });
    }
});

// GET /api/plans/current
plansRouter.get('/current', async (req: UCORequest & any, res) => {
    try {
        const plan = await Plan.findOne({ userId: req.userId })
            .sort({ generatedAt: -1 })
            .lean();

        if (!plan) {
            return res.status(404).json({
                success: false,
                error: { code: 'NO_PLAN', message: 'No plan generated yet' },
            });
        }

        res.json({ success: true, data: plan });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: { code: 'FETCH_ERROR', message: err.message },
        });
    }
});

// GET /api/plans/history
plansRouter.get('/history', async (req: UCORequest & any, res) => {
    try {
        const plans = await Plan.find({ userId: req.userId })
            .sort({ generatedAt: -1 })
            .limit(20)
            .lean();

        res.json({ success: true, data: plans });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: { code: 'FETCH_ERROR', message: err.message },
        });
    }
});
