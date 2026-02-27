import { Router } from 'express';
import type { UCORequest } from '../../middleware/ucoLoader';
import {
    User, UserContext, Plan, WorkoutLog, NutritionLog,
    CheckIn, CoachMessage, Streak, Milestone,
} from '../../models/index';
import { clearUCOCache } from '../../middleware/ucoLoader';

export const privacyRouter = Router();

// GET /api/privacy/export — full data export
privacyRouter.get('/export', async (req: UCORequest & any, res) => {
    try {
        const userId = req.userId;

        const [profile, contexts, plans, workoutLogs, nutritionLogs, checkIns, messages, streaks, milestones] =
            await Promise.all([
                User.findById(userId).select('-passwordHash').lean(),
                UserContext.find({ userId }).lean(),
                Plan.find({ userId }).lean(),
                WorkoutLog.find({ userId }).lean(),
                NutritionLog.find({ userId }).lean(),
                CheckIn.find({ userId }).lean(),
                CoachMessage.find({ userId }).lean(),
                Streak.findOne({ userId }).lean(),
                Milestone.find({ userId }).lean(),
            ]);

        const exportData = {
            profile,
            ucoHistory: contexts,
            plans,
            workoutLogs,
            nutritionLogs,
            checkIns,
            coachMessages: messages,
            streaks,
            milestones,
            exportedAt: new Date().toISOString(),
            format: 'urja-export-v1',
        };

        res.json({ success: true, data: exportData });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: { code: 'EXPORT_ERROR', message: err.message },
        });
    }
});

// DELETE /api/privacy/delete — hard delete all user data
privacyRouter.delete('/delete', async (req: UCORequest & any, res) => {
    try {
        const userId = req.userId;

        await Promise.all([
            Milestone.deleteMany({ userId }),
            Streak.deleteMany({ userId }),
            CoachMessage.deleteMany({ userId }),
            CheckIn.deleteMany({ userId }),
            NutritionLog.deleteMany({ userId }),
            WorkoutLog.deleteMany({ userId }),
            Plan.deleteMany({ userId }),
            UserContext.deleteMany({ userId }),
            User.findByIdAndDelete(userId),
        ]);

        clearUCOCache(userId!);

        res.json({
            success: true,
            data: { message: 'All data permanently deleted' },
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: { code: 'DELETE_ERROR', message: err.message },
        });
    }
});

// PUT /api/privacy/consent — update consent settings
privacyRouter.put('/consent', async (req: UCORequest & any, res) => {
    try {
        if (!req.uco) {
            return res.status(400).json({
                success: false,
                error: { code: 'NO_UCO', message: 'Complete onboarding first' },
            });
        }

        const { allowAITraining, dataRetentionDays } = req.body;

        const updatedPrivacy = { ...req.uco.privacy };
        if (typeof allowAITraining === 'boolean') updatedPrivacy.allowAITraining = allowAITraining;
        if (typeof dataRetentionDays === 'number') updatedPrivacy.dataRetentionDays = dataRetentionDays;

        await UserContext.updateOne(
            { userId: req.userId, isCurrent: true },
            { $set: { 'data.privacy': updatedPrivacy } },
        );

        clearUCOCache(req.userId!);

        res.json({ success: true, data: updatedPrivacy });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: { code: 'CONSENT_ERROR', message: err.message },
        });
    }
});

// GET /api/privacy/passport — data passport (what we know about you)
privacyRouter.get('/passport', async (req: UCORequest & any, res) => {
    try {
        if (!req.uco) {
            return res.json({ success: true, data: { message: 'No data stored — onboarding not complete' } });
        }

        const passport = {
            physicalData: {
                stored: ['age', 'sex', 'height', 'weight', 'BMI'],
                purpose: 'Calculate caloric needs and exercise safety',
            },
            healthData: {
                stored: ['injuries', 'medications', 'conditions'],
                purpose: 'Safety gate — prevent harmful exercise recommendations',
            },
            lifestyleData: {
                stored: ['schedule', 'exam periods', 'sleep', 'stress'],
                purpose: 'Adapt plan difficulty and timing',
            },
            nutritionPreferences: {
                stored: ['region', 'diet type', 'allergies', 'budget'],
                purpose: 'Generate culturally appropriate meal plans',
            },
            activityLogs: {
                stored: ['workout logs', 'nutrition logs', 'check-ins'],
                purpose: 'Track progress and adapt future plans',
            },
            privacySettings: req.uco.privacy,
            dataAge: `Since ${req.uco.meta.lastUpdated}`,
        };

        res.json({ success: true, data: passport });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: { code: 'PASSPORT_ERROR', message: err.message },
        });
    }
});
