# 📋 FEATURES_SCOPE.md — Complete Feature Bible

> Every feature passed through two filters:
> **Brain 1**: "Would a student in a hostel actually use this?"
> **Brain 2**: "What breaks when they do?"

---

## Priority Legend

| Symbol | Meaning |
|--------|---------|
| 🔴 | P0 — MVP blocker. Ship nothing without this. |
| 🟡 | P1 — Core value. Ship in v1.0. |
| 🟢 | P2 — Enhancement. v1.1+ |
| ⚪ | P3 — Future / experimental. |

---

## MODULE 1: Onboarding & Profile

### 1.1 Onboarding Wizard
- 🔴 Multi-step wizard with progress indicator (6 steps, ~4 min completion)
- 🔴 Smart defaults based on detected region/locale (fewer questions)
- 🔴 Skip logic (e.g., skip gym questions if "no gym access" selected)
- 🟡 Resume onboarding if user drops off mid-flow
- 🟡 Inline explanations ("Why do we ask this?") for sensitive questions
- 🟢 Voice input option for faster data entry
- 🟢 Quick-start path: answer only 10 critical questions, rest inferred

**Brain 2 flags:**
- Drop-off happens hardest at the health step — make it feel safe, not clinical
- "How many days can you workout?" — users lie optimistically, AI should sanity-check
- Gender field: non-binary affects BMR calculation — use "biological sex" for calculations, "gender" for UX

### 1.2 Profile Edit & UCO Updates
- 🔴 Edit any profile field post-onboarding
- 🔴 Weight update flow (weekly weigh-in prompt)
- 🟡 Injury add/remove with active status toggle
- 🟡 Schedule update (new semester timetable)
- 🟢 Bulk import from CSV / Google Sheets (for timetable)
- 🟢 Profile photo for motivation anchoring

### 1.3 Eating Disorder Risk Screener
- 🔴 5-question SCOFF screener embedded in goals step
- 🔴 If risk detected: no caloric deficit allowed, no weight-loss framing, show NEDA/helpline
- 🔴 Override requires explicit safety acknowledgment + not showing "target weight" field

**Brain 2 flags:**
- Do NOT make this feel like an interrogation. Weave questions naturally.
- False positives are OK. False negatives are dangerous.
- This is NOT a diagnosis. It's a gating mechanism for plan safety.

---

## MODULE 2: Plan Generation

### 2.1 Workout Plan Generation
- 🔴 Full week workout plan (N days/week based on preference)
- 🔴 Equipment-aware exercise selection (bodyweight if no gym)
- 🔴 Injury-aware exercise exclusion (deterministic, not AI)
- 🔴 Progressive overload across weeks (volume/intensity increments)
- 🟡 Hostel-mode plans (sub-30 min, zero equipment, minimal noise)
- 🟡 Outdoor-mode plans (park, track, open space)
- 🟡 Gym-mode plans (full equipment, periodization)
- 🟢 Hybrid weekly plans (2 gym days + 3 bodyweight days)
- 🟢 Deload week detection + auto-generation (after 3-4 weeks)
- 🟢 Exam week mode: auto-switch to 2-day low-intensity plan

**Brain 2 flags:**
- "Progressive overload" with bodyweight is non-trivial — use reps/sets/tempo/rest as levers
- Hostel mode MUST account for thin walls (no jumping jacks at 6am)
- AI must not invent exercises. Suggest only from DB. Pre-filter to user's available equipment BEFORE AI call.

### 2.2 Nutrition Plan Generation
- 🔴 Daily meal plan within caloric targets (TDEE-based)
- 🔴 Regional cuisine meals only (no tofu stir fry for Rajasthan student)
- 🔴 Mess-compatible mode: plan works WITH available mess food
- 🔴 Budget adherence (daily food budget respected, not just "healthy")
- 🟡 Macro breakdown (protein/carbs/fats) with adjustable ratios
- 🟡 Vegetarian / vegan / jain / halal / kosher dietary modes
- 🟡 Allergy and intolerance exclusions
- 🟢 Canteen menu input: user photos/lists mess menu → plan around it
- 🟢 Grocery list generation for home-cook meals
- 🟢 Weekly variety: avoid repeating same meals >2x

**Brain 2 flags:**
- Mess food is highly variable and often unknown in advance — design around *categories* (dal-roti, rice-curry) not specific dishes
- Budget calculations: use local market prices, not Swiggy prices
- "Protein target" for muscle gain is hard with Indian vegetarian diet — acknowledge this, don't paper over it
- AI CANNOT calculate exact calories for "hostel mess food." Be honest about estimation range.

### 2.3 Plan Customization
- 🟡 Swap individual exercises (from allowed alternatives)
- 🟡 Swap individual meals (from regional alternatives at same calories)
- 🟡 Adjust plan duration (4, 8, 12 weeks)
- 🟢 User-defined workout templates (save and reuse)
- 🟢 "Surprise me" mode (AI generates variety without user input)

---

## MODULE 3: Logging & Tracking

### 3.1 Workout Logging
- 🔴 Log sets/reps/weight per exercise
- 🔴 One-tap "completed" or "skipped" for each session
- 🔴 Rest timer with notification
- 🟡 Energy level check-in before workout (1–5 scale)
- 🟡 Post-workout mood/notes
- 🟡 Offline logging with background sync
- 🟢 Plate calculator (weight selection helper)
- 🟢 Video demo for each exercise (embedded or linked)
- 🟢 Voice logging ("3 sets, 10 reps, 60kg")

### 3.2 Nutrition Logging
- 🔴 Log meals: tap from plan or search food DB
- 🔴 Regional food search (in local language optional)
- 🟡 Portion size adjustment per meal
- 🟡 Water intake tracking
- 🟢 Barcode scan for packaged foods
- 🟢 Photo logging → AI estimates food + calories (requires vision API)
- 🟢 "Mess meal" quick-log by meal type + estimated portion

**Brain 2 flags:**
- Photo calorie estimation via vision AI is error-prone, especially for mixed dishes (biryani, sabzi). Always show confidence range.
- Don't make logging feel like homework. Max 3 taps for a meal log.

### 3.3 Daily Check-In
- 🟡 Daily 30-second check-in: energy, mood, sleep, stress
- 🟡 Exam week toggle (auto-adjusts plan intensity)
- 🟢 Period tracker integration (affects energy/plan adjustments for female users)
- 🟢 Wearable data pull (Google Fit / Apple Health)

---

## MODULE 4: Adaptive Intelligence

### 4.1 Weekly AI Review
- 🟡 Every Sunday: AI analyzes the week's logs
- 🟡 Generate plain-English summary: what worked, what didn't
- 🟡 Suggest plan adjustments for next week
- 🟡 Flag if adherence drops below 50% (offer plan simplification)
- 🟢 Detect plateau and suggest intensity change
- 🟢 Predict next-week energy based on exam/event calendar

### 4.2 Dynamic Plan Adjustment
- 🟡 Auto-reduce workout intensity when stress ≥ 4 or sleep < 5hrs
- 🟡 Auto-substitute exercises when injury is newly reported
- 🟡 Extend program if user is progressing slower than expected
- 🟢 Suggest rest day when consecutive low-energy logs detected

**Brain 2 flags:**
- "Auto-adjust" must be transparent. Show user WHY the plan changed. "Your plan was lightened because you logged 4hrs sleep for 3 days."
- Adaptations must stay within safe range. Never auto-increase to levels beyond original assessment.

### 4.3 Learning from Preferences
- 🟢 Remember frequently skipped meals → replace them
- 🟢 Remember preferred exercise variations → prioritize them
- 🟢 Build a "never suggest" list from explicit dislikes
- 🟢 Learn optimal workout time from log patterns

---

## MODULE 5: AI Coach

### 5.1 Structured Coaching Messages
- 🟡 Personalized daily tip (not generic motivational garbage)
- 🟡 Pre-workout briefing (what today's session involves)
- 🟡 Post-workout feedback (based on log)
- 🟡 Weekly progress narrative
- 🟢 Exam week special messaging ("Protect sleep this week. Here's your 20-min session.")
- 🟢 Cultural celebration adaptations (Eid, Diwali, exam results day)

### 5.2 AI Chat (Constrained)
- 🟢 Q&A about the user's current plan only
- 🟢 "Why am I doing this exercise?" — AI explains rationale from plan context
- 🟢 "Can I replace X with Y?" — AI checks and approves/rejects swaps
- ⚪ Free-form fitness question answering (high hallucination risk — needs guardrails)

**Brain 2 flags:**
- Constrained chat is better than open chat. Define the scope clearly.
- Never allow AI chat to contradict the main plan. All AI outputs must be consistent.
- Rate-limit aggressively. 50 messages/day max. Prevents misuse.

### 5.3 Motivation & Behavior Change
- 🟡 Streak tracking (workout streak, log streak)
- 🟡 Milestone celebrations (first week complete, 1kg lost, etc.)
- 🟢 Accountability nudges (missed session → gentle check-in, not guilt)
- 🟢 "Why did you skip?" survey → informs plan adaptation
- 🟢 Weekly reflection prompts (journaling for adherence)
- ⚪ Peer accountability groups (privacy-first, anonymous optional)

---

## MODULE 6: Progress & Insights

### 6.1 Body Metrics Tracking
- 🟡 Weight trend chart (with moving average, not raw fluctuations)
- 🟡 Body measurements log (waist, chest, arms, etc.)
- 🟢 Progress photo comparison view
- 🟢 Estimated body fat% trend (formula-based, labeled as estimate)

### 6.2 Performance Metrics
- 🟡 Strength progression per exercise (volume/1RM estimate)
- 🟡 Workout consistency heatmap (GitHub-style)
- 🟡 Calorie and macro trend charts
- 🟢 Energy level vs. adherence correlation view
- 🟢 Sleep vs. performance analysis

### 6.3 Reports & Export
- 🟢 Weekly PDF report (shareable with trainer/doctor)
- 🟢 Full data export (JSON / CSV) — user owns their data
- 🟢 "Takeaway summary" — what changed in 4/8/12 weeks

---

## MODULE 7: Privacy & Trust

### 7.1 Consent & Transparency
- 🔴 Plain-English data usage explanation at onboarding
- 🔴 Explicit opt-in for AI training data usage (default: OFF)
- 🔴 Granular privacy settings (what's stored, how long)
- 🟡 "Data passport" — one page showing exactly what we know about you
- 🟡 Hard delete: purge all data within 24 hours on request

### 7.2 Local-First Mode
- 🟢 All data stored locally by default, sync optional
- 🟢 User-held encryption key for cloud backup
- 🟢 No account required for basic features (anonymous mode)

---

## MODULE 8: Onboarding Edge Cases

These aren't bugs — they're first-class scenarios that must be handled gracefully.

| Scenario | How We Handle It |
|----------|-----------------|
| BMI < 16 (severely underweight) | Block weight loss goal, show GP referral, suggest health program |
| BMI > 40 (severe obesity) | Restrict high-impact exercises, suggest walking/low-impact first |
| Active injury + wants to start gym | Injury-specific plan with cleared exercises only |
| On SSRIs/beta-blockers | Flag for GP consult, avoid intensity-based heart rate targets |
| Zero equipment + no outdoor access | Pure bodyweight hostel plan, chair/bed as props |
| ₹50/day food budget | Daal-rice-based plans, no supplements, realistic protein targets |
| Jain diet | No root vegetables (onion, garlic, potato), night eating restrictions |
| No cooking, only canteen | Plan exclusively around commonly available canteen items |
| Exam in 2 days | Auto-switch to maintenance mode, prioritize sleep recovery |
| Reported significant stress (5/5) | Suggest deload week, add stress-reduction exercises (yoga/walk) |
| Zero workout history ("complete beginner") | Start with 2 days/week, movement patterns over intensity |
| International student in India | Map home cuisine habits to available Indian alternatives |

---

## ANTI-FEATURES (What We Explicitly Will NOT Build)

1. **Calorie counting for users who screened positive for eating disorder risk** — no exceptions.
2. **Supplement recommendations** — affiliate bait and health risk.
3. **"Transformation challenges"** — toxic culture, promotes unhealthy urgency.
4. **Body shaming in any form** — no "get rid of that belly" language anywhere in the codebase, ever.
5. **Before/after photo sharing socially** — eating disorder risk.
6. **Comparing users to each other** — rankings, leaderboards of body metrics.
7. **Crash diet plans** — no deficit beyond 500 kcal/day from TDEE.
8. **Unmoderated AI chat** — must always be plan-scoped and constrained.
9. **Push notifications during exam weeks without user opt-in** — don't add stress.
10. **Data sale or sharing with third parties** — ever.
