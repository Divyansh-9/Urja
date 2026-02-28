# Plan: Gamification & Specialized Tracks

## Overview
Expand Urja v1.0 to include Social Accountability (usernames, friends, activity feeds) and Specialized Tracks (Exam Survival Mode, 90-Day Bulk). These features drive retention and provide immediate, tailored value to college students.

## Project Type
WEB / BACKEND

## Success Criteria
- Users can set a unique `username`.
- Users can send, accept, and reject friend requests.
- Users can view a live activity feed of their friends' logged workouts.
- Users can toggle an "Exam Survival Mode" track that dynamically overrides their workout settings.

## Tech Stack
- Frontend: Zustand, React Router, TailwindCSS
- Backend: Express, Mongoose
- Database: MongoDB

## File Structure & Schema Changes

### Schema Updates
1. **User Schema (`apps/api/src/models/User.ts`)**
   - Add `username` (unique, sparse, lowercase, required for social).
   - Add `friends` (Array of ObjectId referencing `User`).
   - Add `friendRequests` (Array of subdocs: `userId`, `status: 'pending'`).

2. **UserContext (UCO) Schema (`packages/user-context/src/schema.ts`)**
   - Add `activeTrack: 'standard' | 'exam_survival' | 'rehab' | '90_day_bulk'` to `/adaptive` or a new top-level `/track` property.

3. **ActivityFeed Model (`apps/api/src/models/ActivityFeed.ts`)**
   - New collection linking `userId`, `action` ("logged_workout", "achieved_streak"), `timestamp`, and `metadata`.

### API Routes
- `POST /api/social/username` (Set username)
- `GET /api/social/search?q=...` (Search users by username)
- `POST /api/social/friends/request/:id` (Send request)
- `POST /api/social/friends/accept/:id` (Accept request)
- `GET /api/social/feed` (Get activity feed of friends)
- `POST /api/uco/track` (Change active specialized track)

### Frontend Components
- `SocialPage.tsx`: Search users, manage requests, view feed.
- `TrackSelector.tsx`: Modal/card to activate "Exam Survival Mode".

## Task Breakdown

### Task 1: Database Schema Expansion
- **Agent**: `database-architect`
- **Skill**: `database-design`
- **Priority**: P0
- **INPUT**: Update User models and UCO schema for usernames, friends, and tracks. Create the ActivityFeed model.
- **OUTPUT**: Updated and exported Mongoose models and TS interfaces.
- **VERIFY**: `npm run lint` passes, no type errors.

### Task 2: Social API Module
- **Agent**: `backend-specialist`
- **Skill**: `api-patterns`
- **Priority**: P1
- **INPUT**: Create `apps/api/src/modules/social/router.ts`. Implement username, friend request logic, and feed aggregation. Connect to main router.
- **OUTPUT**: Working REST routes for the social engine.
- **VERIFY**: Able to connect two users via API logic.

### Task 3: Specialized Tracks Logic
- **Agent**: `backend-specialist`
- **Skill**: `prompt-engineering`
- **Priority**: P1
- **INPUT**: Update `plansRouter` to inject the active track. If `exam_survival`, hardcode constraints (15 min, bodyweight/mobility only, stress relief focus) regardless of original UCO.
- **OUTPUT**: Dynamic AI override logic.
- **VERIFY**: Exam mode generates 15-min plans.

### Task 4: Social Frontend Integration
- **Agent**: `frontend-specialist`
- **Skill**: `frontend-design`
- **Priority**: P2
- **INPUT**: Build the Social view, user search autocomplete, friend request UI, and Activity Feed timeline.
- **OUTPUT**: React UI components integrated with Zustand `useSocialStore`.
- **VERIFY**: User can navigate to Social, search a friend, and see their updates.

### Task 5: Tracks Frontend Integration
- **Agent**: `frontend-specialist`
- **Skill**: `frontend-design`
- **Priority**: P2
- **INPUT**: Build a sleek UI toggle/card for "Exam Survival Mode" in the Dashboard or Settings.
- **OUTPUT**: Button that calls `POST /api/uco/track` and regenerates the plan.
- **VERIFY**: Toggling the track clearly updates the UI and plan.

## Phase X: Verification
- [ ] Lint & Types: `npm run lint && npx tsc --noEmit`
- [ ] API Tests logic check.
- [ ] End-to-end Social Flow (Search -> Add -> Accept -> View Feed).
- [ ] Track Override Test.
