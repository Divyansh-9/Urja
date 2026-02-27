import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth';
import type { UserContextObject } from '@fitmind/shared-types';
import { UserContext } from '../models/index';

export interface UCORequest extends AuthRequest {
    uco?: UserContextObject;
}

// In-memory UCO cache for performance
const ucoCache = new Map<string, UserContextObject>();

/**
 * UCO Loader middleware — fetches the user's current UCO and attaches to request.
 */
export async function ucoLoaderMiddleware(req: UCORequest, res: Response, next: NextFunction) {
    if (!req.userId) return next();

    // Check in-memory cache first
    const cached = ucoCache.get(req.userId);
    if (cached) {
        req.uco = cached;
        return next();
    }

    // Fetch from MongoDB
    try {
        const doc = await UserContext.findOne({ userId: req.userId, isCurrent: true }).lean();
        if (doc) {
            req.uco = doc.data as UserContextObject;
            ucoCache.set(req.userId, req.uco);
        }
    } catch {
        // UCO not found — user hasn't onboarded yet
    }

    next();
}

/**
 * Save or update UCO in cache and MongoDB.
 */
export async function saveUCO(userId: string, uco: UserContextObject): Promise<void> {
    ucoCache.set(userId, uco);

    // Mark old versions as not current
    await UserContext.updateMany(
        { userId, isCurrent: true },
        { $set: { isCurrent: false } },
    );

    // Insert new version
    await UserContext.create({
        userId,
        version: uco.meta.version,
        data: uco,
        isCurrent: true,
    });
}

/**
 * Clear UCO from cache.
 */
export function clearUCOCache(userId: string): void {
    ucoCache.delete(userId);
}
