import { Router } from 'express';
import type { UCORequest } from '../../middleware/ucoLoader';
import { CheckIn, CoachMessage } from '../../models/index';
import { generateCoachMessage, answerPlanQuestion } from '@fitmind/ai-engine';
import { Plan } from '../../models/index';
import type { AdaptationTrigger } from '@fitmind/shared-types';

export const coachingRouter = Router();

// POST /api/coaching/checkin
coachingRouter.post('/checkin', async (req: UCORequest & any, res) => {
    try {
        const checkIn = await CheckIn.create({
            userId: req.userId,
            date: req.body.date || new Date(),
            energyLevel: req.body.energyLevel,
            mood: req.body.mood,
            sleepHours: req.body.sleepHours,
            stressLevel: req.body.stressLevel,
            examWeek: req.body.examWeek || false,
            notes: req.body.notes,
        });

        // Evaluate adaptation triggers
        const history = await CheckIn.find({ userId: req.userId })
            .sort({ date: -1 })
            .limit(7)
            .lean();

        const triggers = evaluateAdaptationTriggers(checkIn, history);

        let adaptationMessage;
        if (triggers.length > 0) {
            adaptationMessage = triggers.map((t) => `${t.reason}`).join('. ');

            // Save adaptation message
            await CoachMessage.create({
                userId: req.userId,
                type: 'adaptation_explain',
                message: adaptationMessage,
            });
        }

        res.json({
            success: true,
            data: {
                checkInId: checkIn._id,
                adapted: triggers.length > 0,
                triggers,
                message: adaptationMessage,
            },
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: { code: 'CHECKIN_ERROR', message: err.message },
        });
    }
});

// GET /api/coaching/messages?limit=20
coachingRouter.get('/messages', async (req: UCORequest & any, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 20;
        const messages = await CoachMessage.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        res.json({ success: true, data: messages });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: { code: 'FETCH_ERROR', message: err.message },
        });
    }
});

// POST /api/coaching/chat — constrained AI chat
coachingRouter.post('/chat', async (req: UCORequest & any, res) => {
    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({
                success: false,
                error: { code: 'MISSING_QUESTION', message: 'Question is required' },
            });
        }

        const currentPlan = await Plan.findOne({ userId: req.userId })
            .sort({ generatedAt: -1 })
            .lean();

        if (!currentPlan) {
            return res.status(400).json({
                success: false,
                error: { code: 'NO_PLAN', message: 'Generate a plan first before asking questions' },
            });
        }

        const answer = await answerPlanQuestion(
            question,
            JSON.stringify(currentPlan.data),
        );

        res.json({ success: true, data: answer });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: { code: 'CHAT_ERROR', message: err.message },
        });
    }
});

// ─── Adaptation Trigger Logic ────────────────────────────────────
function evaluateAdaptationTriggers(
    current: any,
    history: any[],
): AdaptationTrigger[] {
    const triggers: AdaptationTrigger[] = [];

    // 3 consecutive days of energy ≤ 2 → suggest deload
    const recentEnergy = history.slice(0, 3);
    if (recentEnergy.length >= 3 && recentEnergy.every((c) => c.energyLevel <= 2)) {
        triggers.push({
            type: 'deload',
            reason: 'Energy has been very low for 3 days. Suggesting a deload week to recover.',
            severity: 'moderate',
        });
    }

    // Sleep < 5hrs for 2 days → reduce intensity
    const recentSleep = history.slice(0, 2);
    if (recentSleep.length >= 2 && recentSleep.every((c) => c.sleepHours < 5)) {
        triggers.push({
            type: 'reduce_intensity',
            reason: 'Sleep has been under 5 hours for 2 days. Reducing workout intensity today.',
            severity: 'moderate',
        });
    }

    // Exam week → switch to exam mode
    if (current.examWeek) {
        triggers.push({
            type: 'exam_mode',
            reason: 'Exam week detected. Switching to a lighter 2-day plan to prioritize rest and focus.',
            severity: 'mild',
        });
    }

    // Stress ≥ 4 for 3 days → add recovery
    const recentStress = history.slice(0, 3);
    if (recentStress.length >= 3 && recentStress.every((c) => c.stressLevel >= 4)) {
        triggers.push({
            type: 'add_recovery',
            reason: 'High stress detected for 3 consecutive days. Adding yoga/walking as recovery sessions.',
            severity: 'moderate',
        });
    }

    return triggers;
}
