import type { Request } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/index';

const JWT_SECRET = process.env.JWT_SECRET || 'urja-dev-secret-change-in-production';
const JWT_EXPIRY = '7d';

export interface AuthRequest {
    userId?: string;
    userEmail?: string;
    headers: Record<string, string | string[] | undefined>;
    body: any;
    [key: string]: any;
}

/**
 * Auth middleware: verify JWT and attach user to request.
 * Falls back to dev user when in development mode.
 */
export async function authMiddleware(req: AuthRequest, res: any, next: any) {
    // Dev mode fallback
    if (process.env.NODE_ENV === 'development' && !req.headers.authorization) {
        req.userId = 'dev-user-001';
        req.userEmail = 'dev@urja.local';
        return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization header' },
        });
    }

    const token = authHeader.slice(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        next();
    } catch {
        return res.status(401).json({
            success: false,
            error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' },
        });
    }
}

/**
 * Generate JWT token for a user.
 */
export function generateToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Hash a password.
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

/**
 * Compare password against hash.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Register a new user.
 */
export async function registerUser(email: string, password: string, fullName?: string) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new Error('Email already registered');

    const passwordHash = await hashPassword(password);
    const user = await User.create({ email: email.toLowerCase(), passwordHash, fullName });
    const token = generateToken(user._id.toString(), user.email);

    return { user: { id: user._id, email: user.email, fullName: user.fullName }, token };
}

/**
 * Login with email and password.
 */
export async function loginUser(email: string, password: string) {
    const user = await User.findOne({ email: email.toLowerCase(), deletedAt: null });
    if (!user) throw new Error('Invalid email or password');

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) throw new Error('Invalid email or password');

    const token = generateToken(user._id.toString(), user.email);
    return { user: { id: user._id, email: user.email, fullName: user.fullName }, token };
}
