import { Router } from 'express';
import { User, ActivityFeed } from '../../models';

export const socialRouter = Router();

// POST /api/social/username — Set or update username
socialRouter.post('/username', async (req: any, res) => {
    try {
        const { username } = req.body;

        if (!username || typeof username !== 'string') {
            return res.status(400).json({ success: false, error: { code: 'INVALID_USERNAME', message: 'Username is required' } });
        }

        const clean = username.trim().toLowerCase();

        if (clean.length < 3 || clean.length > 20) {
            return res.status(400).json({ success: false, error: { code: 'INVALID_LENGTH', message: 'Username must be 3-20 characters' } });
        }

        if (!/^[a-z0-9_]+$/.test(clean)) {
            return res.status(400).json({ success: false, error: { code: 'INVALID_CHARS', message: 'Username can only contain lowercase letters, numbers, and underscores' } });
        }

        const existing = await User.findOne({ username: clean, _id: { $ne: req.userId } });
        if (existing) {
            return res.status(409).json({ success: false, error: { code: 'USERNAME_TAKEN', message: 'This username is already taken' } });
        }

        await User.findByIdAndUpdate(req.userId, { username: clean });

        res.json({ success: true, data: { username: clean } });
    } catch (err: any) {
        res.status(500).json({ success: false, error: { code: 'SET_USERNAME_ERROR', message: err.message } });
    }
});

// GET /api/social/search?q=... — Search users by username
socialRouter.get('/search', async (req: any, res) => {
    try {
        const q = (req.query.q as string || '').trim().toLowerCase();

        if (q.length < 2) {
            return res.json({ success: true, data: [] });
        }

        const users = await User.find({
            username: { $regex: `^${q}`, $options: 'i' },
            _id: { $ne: req.userId },
            deletedAt: null,
        })
            .select('_id username fullName avatarUrl')
            .limit(10)
            .lean();

        res.json({ success: true, data: users });
    } catch (err: any) {
        res.status(500).json({ success: false, error: { code: 'SEARCH_ERROR', message: err.message } });
    }
});

// POST /api/social/friends/request/:id — Send friend request
socialRouter.post('/friends/request/:id', async (req: any, res) => {
    try {
        const targetId = req.params.id;

        if (targetId === req.userId) {
            return res.status(400).json({ success: false, error: { code: 'SELF_REQUEST', message: 'Cannot send friend request to yourself' } });
        }

        const targetUser = await User.findById(targetId);
        if (!targetUser) {
            return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
        }

        // Check if already friends
        if (targetUser.friends.some((f: any) => f.toString() === req.userId)) {
            return res.status(400).json({ success: false, error: { code: 'ALREADY_FRIENDS', message: 'Already friends' } });
        }

        // Check for existing pending request
        const existingRequest = targetUser.friendRequests.find(
            (r: any) => r.fromUserId.toString() === req.userId && r.status === 'pending'
        );
        if (existingRequest) {
            return res.status(400).json({ success: false, error: { code: 'REQUEST_EXISTS', message: 'Friend request already sent' } });
        }

        targetUser.friendRequests.push({
            fromUserId: req.userId,
            status: 'pending',
            createdAt: new Date(),
        });
        await targetUser.save();

        res.json({ success: true, data: { message: 'Friend request sent!' } });
    } catch (err: any) {
        res.status(500).json({ success: false, error: { code: 'REQUEST_ERROR', message: err.message } });
    }
});

// POST /api/social/friends/accept/:requestId — Accept friend request
socialRouter.post('/friends/accept/:requestId', async (req: any, res) => {
    try {
        const me = await User.findById(req.userId);
        if (!me) return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } });

        const request = me.friendRequests.id(req.params.requestId);
        if (!request || request.status !== 'pending') {
            return res.status(404).json({ success: false, error: { code: 'REQUEST_NOT_FOUND', message: 'Friend request not found or already handled' } });
        }

        request.status = 'accepted';

        // Add each other as friends (bidirectional)
        const fromUserId = request.fromUserId;
        if (!me.friends.some((f: any) => f.toString() === fromUserId.toString())) {
            me.friends.push(fromUserId);
        }
        await me.save();

        // Add me to the other user's friends list too
        await User.findByIdAndUpdate(fromUserId, {
            $addToSet: { friends: req.userId },
        });

        res.json({ success: true, data: { message: 'Friend request accepted!' } });
    } catch (err: any) {
        res.status(500).json({ success: false, error: { code: 'ACCEPT_ERROR', message: err.message } });
    }
});

// POST /api/social/friends/reject/:requestId — Reject friend request
socialRouter.post('/friends/reject/:requestId', async (req: any, res) => {
    try {
        const me = await User.findById(req.userId);
        if (!me) return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } });

        const request = me.friendRequests.id(req.params.requestId);
        if (!request || request.status !== 'pending') {
            return res.status(404).json({ success: false, error: { code: 'REQUEST_NOT_FOUND', message: 'Friend request not found' } });
        }

        request.status = 'rejected';
        await me.save();

        res.json({ success: true, data: { message: 'Friend request rejected' } });
    } catch (err: any) {
        res.status(500).json({ success: false, error: { code: 'REJECT_ERROR', message: err.message } });
    }
});

// GET /api/social/friends — Get my friends list
socialRouter.get('/friends', async (req: any, res) => {
    try {
        const me = await User.findById(req.userId)
            .populate('friends', '_id username fullName avatarUrl')
            .lean() as any;

        if (!me) return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } });

        res.json({ success: true, data: { friends: me.friends || [], requests: me.friendRequests || [] } });
    } catch (err: any) {
        res.status(500).json({ success: false, error: { code: 'FRIENDS_ERROR', message: err.message } });
    }
});

// GET /api/social/feed — Get activity feed of friends
socialRouter.get('/feed', async (req: any, res) => {
    try {
        const me = await User.findById(req.userId).lean() as any;
        if (!me) return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } });

        const friendIds = me.friends || [];

        const feed = await ActivityFeed.find({
            userId: { $in: [...friendIds, req.userId] },
        })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('userId', '_id username fullName avatarUrl')
            .lean();

        res.json({ success: true, data: feed });
    } catch (err: any) {
        res.status(500).json({ success: false, error: { code: 'FEED_ERROR', message: err.message } });
    }
});

// GET /api/social/profile — Get my social profile
socialRouter.get('/profile', async (req: any, res) => {
    try {
        const me = await User.findById(req.userId)
            .select('_id email username fullName avatarUrl friends activeTrack createdAt')
            .lean() as any;

        if (!me) return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } });

        res.json({
            success: true,
            data: {
                ...me,
                friendCount: me.friends?.length || 0,
            },
        });
    } catch (err: any) {
        res.status(500).json({ success: false, error: { code: 'PROFILE_ERROR', message: err.message } });
    }
});

// POST /api/social/track — Change active track
socialRouter.post('/track', async (req: any, res) => {
    try {
        const { track } = req.body;
        const validTracks = ['standard', 'exam_survival', 'rehab', '90_day_bulk'];

        if (!validTracks.includes(track)) {
            return res.status(400).json({ success: false, error: { code: 'INVALID_TRACK', message: `Track must be one of: ${validTracks.join(', ')}` } });
        }

        await User.findByIdAndUpdate(req.userId, { activeTrack: track });

        // Log activity
        await ActivityFeed.create({
            userId: req.userId,
            action: 'joined_track',
            metadata: { track },
        });

        res.json({ success: true, data: { activeTrack: track } });
    } catch (err: any) {
        res.status(500).json({ success: false, error: { code: 'TRACK_ERROR', message: err.message } });
    }
});
