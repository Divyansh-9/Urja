import { Router } from 'express';
import type { UCORequest } from '../../middleware/ucoLoader';
import { WorkoutLog, NutritionLog, CheckIn, Streak, Milestone } from '../../models/index';

export const progressRouter = Router();

// GET /api/progress/metrics — overview stats
progressRouter.get('/metrics', async (req: UCORequest & any, res) => {
    try {
        const userId = req.userId;

        // Count totals
        const [totalWorkouts, totalNutritionLogs, totalCheckIns, streak] = await Promise.all([
            WorkoutLog.countDocuments({ userId }),
            NutritionLog.countDocuments({ userId }),
            CheckIn.countDocuments({ userId }),
            Streak.findOne({ userId }).lean(),
        ]);

        // Recent 7-day adherence
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentWorkouts = await WorkoutLog.countDocuments({
            userId,
            date: { $gte: sevenDaysAgo },
        });

        const plannedDays = req.uco?.lifestyle?.workoutDaysPerWeek || 3;
        const adherenceRate = Math.round((recentWorkouts / plannedDays) * 100);

        res.json({
            success: true,
            data: {
                totalWorkouts,
                totalNutritionLogs,
                totalCheckIns,
                adherenceRate: Math.min(adherenceRate, 100),
                streaks: streak || { workoutStreak: 0, logStreak: 0 },
            },
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: { code: 'FETCH_ERROR', message: err.message },
        });
    }
});

// GET /api/progress/body — weight trend (with moving average)
progressRouter.get('/body', async (req: UCORequest & any, res) => {
    try {
        const measurements = req.uco?.adaptive?.measurements || [];

        // Compute 7-day moving average
        const trend = measurements.map((m: any, i: number) => {
            const window = measurements.slice(Math.max(0, i - 6), i + 1);
            const avg = window.reduce((sum: number, w: any) => sum + (w.weightKg || 0), 0) / window.length;
            return {
                date: m.date,
                weightKg: m.weightKg,
                movingAverage: Math.round(avg * 10) / 10,
            };
        });

        res.json({ success: true, data: trend });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: { code: 'FETCH_ERROR', message: err.message },
        });
    }
});

// GET /api/progress/adherence — weekly adherence data
progressRouter.get('/adherence', async (req: UCORequest & any, res) => {
    try {
        const weeks = parseInt(req.query.weeks as string) || 12;
        const data = [];

        for (let w = 0; w < weeks; w++) {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - (w + 1) * 7);
            const weekEnd = new Date();
            weekEnd.setDate(weekEnd.getDate() - w * 7);

            const [workoutCount, nutritionCount, checkInCount] = await Promise.all([
                WorkoutLog.countDocuments({ userId: req.userId, date: { $gte: weekStart, $lt: weekEnd } }),
                NutritionLog.countDocuments({ userId: req.userId, date: { $gte: weekStart, $lt: weekEnd } }),
                CheckIn.countDocuments({ userId: req.userId, date: { $gte: weekStart, $lt: weekEnd } }),
            ]);

            const plannedDays = req.uco?.lifestyle?.workoutDaysPerWeek || 3;

            data.unshift({
                weekNumber: weeks - w,
                workoutAdherence: Math.min(Math.round((workoutCount / plannedDays) * 100), 100),
                nutritionAdherence: Math.min(Math.round((nutritionCount / 7) * 100), 100),
                checkInAdherence: Math.min(Math.round((checkInCount / 7) * 100), 100),
            });
        }

        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: { code: 'FETCH_ERROR', message: err.message },
        });
    }
});

// GET /api/progress/heatmap — GitHub-style workout heatmap
progressRouter.get('/heatmap', async (req: UCORequest & any, res) => {
    try {
        const daysBack = parseInt(req.query.days as string) || 365;
        const since = new Date();
        since.setDate(since.getDate() - daysBack);

        const logs = await WorkoutLog.find({
            userId: req.userId,
            date: { $gte: since },
        }).select('date').lean();

        // Count workouts per day
        const heatmap: Record<string, number> = {};
        for (const log of logs) {
            const day = new Date(log.date).toISOString().slice(0, 10);
            heatmap[day] = (heatmap[day] || 0) + 1;
        }

        res.json({ success: true, data: heatmap });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: { code: 'FETCH_ERROR', message: err.message },
        });
    }
});

// GET /api/progress/milestones
progressRouter.get('/milestones', async (req: UCORequest & any, res) => {
    try {
        const milestones = await Milestone.find({ userId: req.userId })
            .sort({ achievedAt: -1 })
            .limit(50)
            .lean();

        res.json({ success: true, data: milestones });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: { code: 'FETCH_ERROR', message: err.message },
        });
    }
});
