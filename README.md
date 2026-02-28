<p align="center">
  <img src="https://img.shields.io/badge/Urja-%E2%9A%A1-00e5a0?style=for-the-badge&labelColor=0a0a0a" alt="Urja" />
</p>

<h1 align="center">Urja ⚡</h1>

<p align="center">
  <strong>AI-Powered Personalized Workout & Diet Planner for Indian College Students</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-8-47a248?logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini_AI-2.5_Flash-4285f4?logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel&logoColor=white" />
</p>

---

## What is Urja?

Urja is an intelligent fitness companion built **specifically for Indian college students**. It understands the constraints of hostel life — limited space, mess food, exam stress, tight budgets — and generates AI-powered workout and nutrition plans that actually fit your reality.

### Key Features

- 🧠 **AI Plan Generation** — Gemini 2.5 Flash creates personalized weekly workout + nutrition plans based on your profile
- 🏠 **Hostel-Aware Training** — Bodyweight exercises optimized for hostel rooms (noise level, space constraints)
- 🍛 **Regional Indian Diet Plans** — Culturally appropriate meals from North/South/East/West India + canteen alternatives
- 📊 **Progressive Overload Engine** — Automated difficulty scaling, deload detection, and bodyweight progression ladders
- 🛡️ **Safety Gate** — SCOFF screening, injury-aware exercise filtering, GP referral suggestions
- 📅 **Exam Survival Mode** — Auto-switches to 15-min low-intensity sessions during exam periods
- 💪 **90-Day Bulk Track** — Specialized track for mass building with 60+ min sessions, 5+ days/week
- 👥 **Social System** — Usernames, friend requests, activity feeds, user search
- 🔄 **Offline-First PWA** — Service worker caching, works without internet
- 🔐 **Privacy-First** — Data export, account deletion, consent management

---

## Architecture

```
urja/
├── apps/
│   ├── api/           → Express REST API (Vercel Serverless)
│   │   ├── modules/   → auth, onboarding, plans, logging, coaching, progress, social, privacy
│   │   ├── middleware/ → JWT auth, UCO loader, safety gate
│   │   ├── models/    → Mongoose schemas (User, Plan, Exercise, Food, Logs...)
│   │   └── scripts/   → Database seeding (28 exercises, 25 regional foods)
│   └── web/           → Vite + React SPA (PWA)
│       ├── pages/     → Auth, Onboarding, Dashboard, Plans, Log, Coach, Progress, Settings
│       ├── stores/    → Zustand state management (auth, plans, progress, UI)
│       └── lib/       → API client
├── packages/
│   ├── ai-engine/     → Gemini AI integration, prompt templates, retry logic
│   ├── workout-engine/→ Exercise filtering, plan skeletons, overload calculation
│   ├── user-context/  → UCO schema (Zod), validation, derived field computation
│   ├── shared-types/  → TypeScript types, enums, interfaces
│   └── nutrition-db/  → Regional food database utilities
├── vercel.json        → Deployment config
└── pnpm-workspace.yaml
```

### Data Flow

```mermaid
graph LR
    A[Student] -->|Onboarding| B[UCO Builder]
    B -->|User Context Object| C[Safety Gate]
    C -->|Filtered Constraints| D[Workout Engine]
    D -->|Exercise Pool + Skeleton| E[Gemini AI]
    E -->|Generated Plan| F[Plan Validator]
    F -->|Validated Plan| G[MongoDB]
    G -->|Display| A
```

---

## Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18.0.0 |
| pnpm | ≥ 8.0.0 |
| MongoDB | Local or Atlas |

### 1. Clone & Install

```bash
git clone https://github.com/Divyansh-9/Urja.git
cd Urja
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Required
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/urja
JWT_SECRET=your-secure-random-string
GEMINI_API_KEY=your-gemini-api-key

# Optional
AI_MODEL=gemini-2.5-flash
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 3. Run Development

```bash
# Both API + Web simultaneously
pnpm dev

# Or separately
pnpm dev:api    # API on http://localhost:3001
pnpm dev:web    # Web on http://localhost:5173
```

### 4. Seed Database

The database seeds automatically on first API startup with:
- **28 exercises** — bodyweight, dumbbell, yoga, cardio (hostel-optimized)
- **25 regional foods** — North/South/East/West India + global staples

---

## API Reference

All endpoints require JWT authentication via `Authorization: Bearer <token>` header unless noted.

### Auth (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Get JWT token |

### Onboarding

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/onboard/step/:n` | Submit step 1-6 data |
| `GET` | `/api/onboard/resume` | Get current step / completion status |

### Plans

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/plans/generate` | Generate AI workout + nutrition plan |
| `GET` | `/api/plans/current` | Get active plan |
| `GET` | `/api/plans/history` | Get past plans |

### Logging

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/log/workout` | Log completed workout |
| `POST` | `/api/log/nutrition` | Log meals |
| `GET` | `/api/log/workout?days=7` | Get recent workout logs |
| `GET` | `/api/log/nutrition?days=7` | Get recent nutrition logs |

### Coaching

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/coaching/checkin` | Submit weekly check-in |
| `POST` | `/api/coaching/chat` | Ask AI coach a question |
| `GET` | `/api/coaching/messages` | Get coach message history |

### Progress

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/progress/metrics` | Current metrics summary |
| `GET` | `/api/progress/body` | Body measurement trend |
| `GET` | `/api/progress/adherence` | Weekly adherence rate |
| `GET` | `/api/progress/heatmap` | Activity heatmap data |
| `GET` | `/api/progress/milestones` | Achievement milestones |

### Social

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/social/username` | Set/update username |
| `GET` | `/api/social/search?q=` | Search users |
| `POST` | `/api/social/friends/request/:id` | Send friend request |
| `POST` | `/api/social/friends/accept/:id` | Accept friend request |
| `GET` | `/api/social/friends` | List friends + pending |
| `GET` | `/api/social/feed` | Activity feed |
| `POST` | `/api/social/track` | Switch specialized track |

### Privacy

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/privacy/export` | Export all user data |
| `DELETE` | `/api/privacy/delete` | Delete account |
| `PUT` | `/api/privacy/consent` | Update consent |

---

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/fitmind` |
| `JWT_SECRET` | Secret for JWT signing | `urja-dev-secret...` |
| `GEMINI_API_KEY` | Google Gemini API key | — |
| `AI_MODEL` | Gemini model ID | `gemini-2.5-flash` |
| `PORT` | API server port | `3001` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |
| `ENABLE_CANTEEN_PARSER` | Parse canteen menus | `true` |
| `RATE_LIMIT_PLAN_GEN` | Max plans per 15 min | `10` |
| `RATE_LIMIT_COACH_MSG` | Max coach messages per 15 min | `50` |

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 19 + Vite | Fast dev, modern React features |
| **Styling** | Vanilla CSS | Full control, glassmorphism, dark UI |
| **State** | Zustand | Lightweight, no boilerplate |
| **Backend** | Express.js | Simple, well-established |
| **Database** | MongoDB (Mongoose) | Flexible schema for UCO documents |
| **AI** | Google Gemini 2.5 Flash | Fast, cost-effective, large context |
| **Auth** | JWT (7-day expiry) | Stateless, serverless-friendly |
| **Validation** | Zod | Runtime type safety for UCO |
| **Deploy** | Vercel (Serverless) | Zero-config, edge network |
| **PWA** | vite-plugin-pwa | Offline support, installable |
| **Monorepo** | pnpm workspaces | Shared packages, fast installs |

---

## Specialized Tracks

| Track | Session | Days/Week | Focus |
|-------|---------|-----------|-------|
| **Standard** | User-defined | User-defined | Balanced training |
| **Exam Survival** | 15 min max | ≤ 3 | Bodyweight + mobility, stress relief |
| **90-Day Bulk** | 60+ min | 5+ | Mass building, high volume |
| **Rehab** | Custom | Custom | Post-injury recovery |

---

## Project Scripts

```bash
pnpm dev          # Run API + Web in parallel
pnpm dev:api      # API only
pnpm dev:web      # Web only
pnpm build        # Build all packages
pnpm test         # Run all tests
pnpm lint         # Lint all packages
pnpm typecheck    # TypeScript check
```

---

## Deployment

The app deploys to Vercel as a monorepo:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

The `vercel.json` config handles:
- API routes → Serverless function (`/api/*`)
- Web routes → Static SPA (`/*` → `index.html`)
- 30s max function duration for AI generation

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/awesome-feature`)
3. Commit changes (`git commit -m 'feat: add awesome feature'`)
4. Push to branch (`git push origin feat/awesome-feature`)
5. Open a Pull Request

---

## Team

Built by **Divyansh** and team as part of the IDE Project.

---

## License

MIT © 2025 Urja
