import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDB } from './lib/db';
import { authMiddleware } from './middleware/auth';
import { ucoLoaderMiddleware } from './middleware/ucoLoader';
import { authRouter } from './modules/auth/router';
import { onboardingRouter } from './modules/onboarding/router';
import { plansRouter } from './modules/plans/router';
import { loggingRouter } from './modules/logging/router';
import { coachingRouter } from './modules/coaching/router';
import { progressRouter } from './modules/progress/router';
import { privacyRouter } from './modules/privacy/router';

dotenv.config();

const app: any = express();
app.set('trust proxy', 1); // Trust Vercel's reverse proxy for rate limiting

// ─── DB Connection (cached for serverless) ──────────────────────
let dbConnected = false;
async function ensureDB() {
    if (!dbConnected) {
        await connectDB();
        dbConnected = true;
    }
}

// ─── Global Middleware ───────────────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: (process.env.FRONTEND_URL || 'http://localhost:5173').trim().replace(/[\r\n]/g, ''),
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
});
app.use(globalLimiter);

// ─── DB Connection Middleware (MUST be before routes) ────────────
app.use(async (_req: any, _res: any, next: any) => {
    try { await ensureDB(); next(); }
    catch (err) { next(err); }
});

// ─── Health Check ────────────────────────────────────────────────
app.get('/health', (_req: any, res: any) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ─── Public Routes (no auth) ─────────────────────────────────────
app.use('/api/auth', authRouter);

// ─── Auth + UCO Pipeline (all routes below require auth) ─────────
app.use('/api', authMiddleware as any);
app.use('/api', ucoLoaderMiddleware as any);

// ─── Protected Route Modules ────────────────────────────────────
app.use('/api/onboard', onboardingRouter);
app.use('/api/plans', plansRouter);
app.use('/api/log', loggingRouter);
app.use('/api/coaching', coachingRouter);
app.use('/api/progress', progressRouter);
app.use('/api/privacy', privacyRouter);

// ─── 404 Handler ─────────────────────────────────────────────────
app.use((_req: any, res: any) => {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// ─── Error Handler ──────────────────────────────────────────────
app.use((err: Error, _req: any, res: any, _next: any) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' },
    });
});

// ─── Start (local dev only, skipped on Vercel) ──────────────────
if (process.env.VERCEL !== '1') {
    const PORT = process.env.PORT || 3001;
    ensureDB().then(() => {
        app.listen(PORT, () => {
            console.log(`\n⚡ Urja API running at http://localhost:${PORT}`);
            console.log(`   Health: http://localhost:${PORT}/health`);
            console.log(`   Mode: ${process.env.NODE_ENV || 'development'}\n`);
        });
    }).catch(console.error);
}

export default app;
