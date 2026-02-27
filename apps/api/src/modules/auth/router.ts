import { Router } from 'express';
import { registerUser, loginUser } from '../../middleware/auth';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: { code: 'MISSING_FIELDS', message: 'Email and password are required' },
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 8 characters' },
            });
        }

        const result = await registerUser(email, password, fullName);
        res.status(201).json({ success: true, data: result });
    } catch (err: any) {
        const status = err.message === 'Email already registered' ? 409 : 500;
        res.status(status).json({
            success: false,
            error: { code: 'REGISTRATION_FAILED', message: err.message },
        });
    }
});

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: { code: 'MISSING_FIELDS', message: 'Email and password are required' },
            });
        }

        const result = await loginUser(email, password);
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(401).json({
            success: false,
            error: { code: 'LOGIN_FAILED', message: err.message },
        });
    }
});
