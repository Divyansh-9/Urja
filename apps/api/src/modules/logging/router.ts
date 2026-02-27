import { Router } from 'express';
import type { UCORequest } from '../../middleware/ucoLoader';
import { WorkoutLog, NutritionLog, Streak } from '../../models/index';

export const loggingRouter = Router();

// POST /api/log/workout
loggingRouter.post('/workout', async (req: UCORequest & any, res) => {
    try {
        const log = await WorkoutLog.create({
            userId: req.userId,
            planId: req.body.planId,
            date: req.body.date || new Date(),
            exercisesCompleted: req.body.exercisesCompleted || [],
            energyLevel: req.body.energyLevel,
            mood: req.body.mood,
            sessionDurationMins: req.body.sessionDurationMins,
            notes: req.body.notes,
        });

        // Update streak
        await updateStreak(req.userId!, 'workout');

        res.status(201).json({ success: true, data: { logId: log._id } });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: { code: 'LOG_ERROR', message: err.message },
        });
    }
});

// POST /api/log/nutrition
loggingRouter.post('/nutrition', async (req: UCORequest & any, res) => {
    try {
        const log = await NutritionLog.create({
            userId: req.userId,
            planId: req.body.planId,
            date: req.body.date || new Date(),
            mealsLogged: req.body.mealsLogged || [],
            totalCalories: req.body.totalCalories,
            waterMl: req.body.waterMl || 0,
            notes: req.body.notes,
        });

        await updateStreak(req.userId!, 'log');

        res.status(201).json({ success: true, data: { logId: log._id } });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: { code: 'LOG_ERROR', message: err.message },
        });
    }
});

// POST /api/log/batch — offline sync
loggingRouter.post('/batch', async (req: UCORequest & any, res) => {
    try {
        const { workoutLogs = [], nutritionLogs = [] } = req.body;

        const workoutResults = await Promise.all(
            workoutLogs.map((log: any) =>
                WorkoutLog.create({ ...log, userId: req.userId }),
            ),
        );

        const nutritionResults = await Promise.all(
            nutritionLogs.map((log: any) =>
                NutritionLog.create({ ...log, userId: req.userId }),
            ),
        );

        res.json({
            success: true,
            data: {
                workoutLogsSynced: workoutResults.length,
                nutritionLogsSynced: nutritionResults.length,
            },
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: { code: 'BATCH_ERROR', message: err.message },
        });
    }
});

// GET /api/log/workout?days=7
loggingRouter.get('/workout', async (req: UCORequest & any, res) => {
    try {
        const days = parseInt(req.query.days as string) || 7;
        const since = new Date();
        since.setDate(since.getDate() - days);

        const logs = await WorkoutLog.find({
            userId: req.userId,
            date: { $gte: since },
        }).sort({ date: -1 }).lean();

        res.json({ success: true, data: logs });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: { code: 'FETCH_ERROR', message: err.message },
        });
    }
});

// GET /api/log/nutrition?days=7
loggingRouter.get('/nutrition', async (req: UCORequest & any, res) => {
    try {
        const days = parseInt(req.query.days as string) || 7;
        const since = new Date();
        since.setDate(since.getDate() - days);

        const logs = await NutritionLog.find({
            userId: req.userId,
            date: { $gte: since },
        }).sort({ date: -1 }).lean();

        res.json({ success: true, data: logs });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: { code: 'FETCH_ERROR', message: err.message },
        });
    }
});

// ─── Streak Helper ──────────────────────────────────────────────
async function updateStreak(userId: string, type: 'workout' | 'log') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = await Streak.findOne({ userId });
    if (!streak) {
        streak = await Streak.create({ userId });
    }

    const field = type === 'workout' ? 'lastWorkoutDate' : 'lastLogDate';
    const streakField = type === 'workout' ? 'workoutStreak' : 'logStreak';
    const longestField = type === 'workout' ? 'longestWorkoutStreak' : 'longestLogStreak';

    const lastDate = streak[field];
    if (lastDate) {
        const lastDay = new Date(lastDate);
        lastDay.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            streak[streakField] += 1;
        } else if (diffDays > 1) {
            streak[streakField] = 1; // Reset streak
        }
        // diffDays === 0: same day, don't change
    } else {
        streak[streakField] = 1;
    }

    if (streak[streakField] > streak[longestField]) {
        streak[longestField] = streak[streakField];
    }

    streak[field] = today;
    streak.updatedAt = new Date();
    await streak.save();
}
