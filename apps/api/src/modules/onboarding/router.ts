import { Router } from 'express';
import type { UCORequest } from '../../middleware/ucoLoader';
import { saveUCO } from '../../middleware/ucoLoader';
import { createUCO } from '@fitmind/user-context';
import { SCOFF_THRESHOLD } from '@fitmind/shared-types';

export const onboardingRouter = Router();

// In-memory partial UCO during onboarding (per user)
const partialUCOs = new Map<string, Record<string, any>>();

// POST /api/onboard/step/:stepNumber
onboardingRouter.post('/step/:stepNumber', async (req: UCORequest & any, res) => {
    try {
        const step = parseInt(req.params.stepNumber);
        const userId = req.userId!;
        const data = req.body;

        if (step < 1 || step > 6) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_STEP', message: 'Step must be between 1 and 6' },
            });
        }

        // Get or create partial UCO
        const partial = partialUCOs.get(userId) || {};

        // Process each step
        switch (step) {
            case 1: // Basics
                partial.physical = {
                    age: data.age,
                    sex: data.sex,
                    heightCm: data.heightCm,
                    weightKg: data.weightKg,
                    bodyFatPercent: data.bodyFatPercent,
                };
                break;

            case 2: // Goals
                partial.goals = {
                    primary: data.primary,
                    secondary: data.secondary || [],
                    targetWeightKg: data.targetWeightKg,
                    urgency: data.urgency || 'moderate',
                };
                break;

            case 3: // Health + SCOFF
                const scoffScore = (data.scoffAnswers || []).filter(Boolean).length;
                partial.health = {
                    injuries: data.injuries || [],
                    medications: data.medications || [],
                    conditions: data.conditions || [],
                    eatingDisorderRisk: scoffScore >= SCOFF_THRESHOLD,
                    safetyClearance: 'full',
                    gpReferralSuggested: false,
                };
                break;

            case 4: // Lifestyle
                partial.lifestyle = {
                    schedule: data.schedule || [],
                    examPeriods: data.examPeriods || [],
                    sleepHours: data.sleepHours || 7,
                    stressLevel: data.stressLevel || 2,
                    commuteMins: data.commuteMins || 0,
                    workoutTimePref: data.workoutTimePref || 'flexible',
                    workoutDaysPerWeek: data.workoutDaysPerWeek || 3,
                    sessionLengthMins: data.sessionLengthMins || 45,
                };
                break;

            case 5: // Equipment
                partial.environment = {
                    setting: data.setting || 'hostel',
                    equipmentAvailable: data.equipmentAvailable || ['none'],
                    gymAccess: data.gymAccess || false,
                    gymDaysPerWeek: data.gymDaysPerWeek,
                    hasKitchen: data.hasKitchen || false,
                    hasMess: data.hasMess || true,
                };
                break;

            case 6: // Food & Culture — final step, create UCO
                partial.nutrition = {
                    region: data.region || 'north_india',
                    dietType: data.dietType || 'vegetarian',
                    allergies: data.allergies || [],
                    intolerances: data.intolerances || [],
                    dislikedFoods: data.dislikedFoods || [],
                    favoriteFoods: data.favoriteFoods || [],
                    cookingSkill: data.cookingSkill || 'none',
                    dailyFoodBudget: data.dailyFoodBudget || 150,
                    currency: data.currency || 'INR',
                    canteenAvailable: data.canteenAvailable ?? true,
                };

                partial.privacy = {
                    dataRetentionDays: 365,
                    allowAITraining: false,
                };

                // Create full UCO with derived fields
                const uco = createUCO(userId, partial as any);
                await saveUCO(userId, uco);
                partialUCOs.delete(userId);

                return res.json({
                    success: true,
                    data: {
                        step: 6,
                        complete: true,
                        uco: {
                            bmi: uco.physical.bmi,
                            bmr: uco.physical.bmr,
                            tdee: uco.physical.tdee,
                            safetyClearance: uco.health.safetyClearance,
                            eatingDisorderRisk: uco.health.eatingDisorderRisk,
                        },
                    },
                });
        }

        partialUCOs.set(userId, partial);

        res.json({
            success: true,
            data: { step, complete: false, nextStep: step + 1 },
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: { code: 'ONBOARDING_ERROR', message: err.message },
        });
    }
});

// GET /api/onboard/resume — check onboarding status
onboardingRouter.get('/resume', (req: UCORequest & any, res) => {
    const userId = req.userId!;

    if (req.uco) {
        return res.json({ success: true, data: { complete: true, step: 7 } });
    }

    const partial = partialUCOs.get(userId);
    const completedSteps = partial
        ? ['physical', 'goals', 'health', 'lifestyle', 'environment', 'nutrition']
            .filter((key) => key in partial).length
        : 0;

    res.json({
        success: true,
        data: { complete: false, step: completedSteps + 1 },
    });
});
