# Bahar Technical Architecture

> **"Expect failure. Embrace the wall. Own the court."**  
> Bahar is architected around resilience, privacy, and continuous athletic momentum. Even in zero-connectivity environments with degraded physical energy, the system adapts dynamically without friction or shame.

---

## 1. Core Architectural Principles

```
  +-------------------------------------------------------------------------+
  |                             ATHLETE DEVICE                              |
  |                                                                         |
  |   +-------------------+    +--------------------+    +--------------+   |
  |   | Next.js App Router|--->|   Day Engine       |--->| Audio Coach  |   |
  |   | (React 19 / PWA)  |    | (Envelope Rules)   |    | (Web Speech) |   |
  |   +-------------------+    +--------------------+    +--------------+   |
  |             |                         |                                 |
  |             v                         v                                 |
  |   +---------------------------------------------+                       |
  |   |        Local Dexie IndexedDB Vault          |                       |
  |   | (Profiles, Check-ins, Plans, Fallback Cache)|                       |
  |   +---------------------------------------------+                       |
  +-------------------------------------------------------------------------+
                         | Optional Sync (opt-in)
                         v
  +-------------------------------------------------------------------------+
  |                          SUPABASE CLOUD SYNC                            |
  |   +--------------------+     +-------------------+     +------------+   |
  |   | Row-Level Security |<--->| Multi-User Buddies|<--->| Spot Posts |   |
  |   +--------------------+     +-------------------+     +------------+   |
  +-------------------------------------------------------------------------+
```

### 1.1 Local-First & Zero Telemetry by Default
- **Local Persistence**: All athletic baseline configurations, session logs, soreness markers, and check-ins are stored in browser **IndexedDB via Dexie.js**.
- **Self-Contained Functionality**: Core generation, outside workout audio guidance, and progress analytics do not depend on external APIs or network pings.
- **Privacy-Guaranteed AI**: Workout generation prompts strip personal identifiers. The engine transmits only generalized envelopes (e.g. `intensity: 2, minutes: 25, mode: active_recovery`).

### 1.2 The 4:00 AM Day Boundary
Human training days do not reset at midnight. Athletes who train late or sleep past 12:00 AM must not have their streak prematurely penalized:
- **Implementation**: [`src/domain/time/day_key.ts`](file:///d:/wingigs/bahar/src/domain/time/day_key.ts) offsets the date boundary by 4 hours.
- A session logged at 1:30 AM on Tuesday counts as part of Monday's training envelope.

### 1.3 Multi-Tier AI Generation & Deterministic Fallback Bank
Workout planning is guaranteed never to crash or show an empty state:

```
[Day Engine Triggered]
         │
         ▼
[1. Hosted AI Tier] ─── (Timeout > 20s / Net Error) ───┐
         │ (Success)                                   │
         ▼                                             ▼
[2. Zod DailyPlanSchema & Validator]        [3. Fallback Plan Bank]
         │ (Invalid drills / high intensity)           │
         ├───► [Auto-Repair Engine]                    │
         │          │                                  │
         ▼          ▼                                  ▼
   [Guaranteed Valid Daily Plan Stored & Rendered Instantly]
```

1. **Primary Tier (`hostedTier`)**: Attempts structured generation using an open-weights AI model or `/api/ai`.
2. **Validator & Auto-Repair (`validatePlan`)**: Checks that drills exist in the local catalog and that prescribed intensity and duration do not violate the athlete's physical envelope. If violations occur, unsafe blocks are pruned and durations scaled down.
3. **Deterministic Fallback (`getFallbackPlan`)**: If the AI model fails, times out, or the device is offline, a rich, hand-crafted plan tailored to the athlete's exact envelope mode is immediately returned from [`src/data/fallback/bank.ts`](file:///d:/wingigs/bahar/src/data/fallback/bank.ts).

---

## 2. Directory Structure

```
bahar/
├── public/                 # Static assets, logos, PWA manifest, service worker
│   ├── logo.png            # Official Bahar runner badge master icon
│   ├── icon-192x192.png    # PWA launcher icon (192px)
│   ├── icon-512x512.png    # PWA launcher icon (512px)
│   ├── manifest.json       # Progressive Web App manifest
│   └── sw.js               # Service Worker caching shell & offline fallback
├── src/
│   ├── ai/                 # Multi-tier AI calling engine, schemas, and fallbacks
│   ├── app/                # Next.js App Router pages and route handlers
│   │   ├── (marketing)/    # High-conversion athlete landing page
│   │   ├── buddy/          # Multiplayer buddy accountability pairings
│   │   ├── login/          # Dedicated athlete authentication route
│   │   ├── onboarding/     # 2-step baseline & movement setup
│   │   ├── outside/        # Hands-free court workout mode with voice cues
│   │   ├── progress/       # Volume analytics, streak tracking & momentum
│   │   ├── retest/         # 30-day physical benchmark re-evaluator
│   │   ├── settings/       # Data vault, JSON export, self-wipe, profile edits
│   │   ├── spots/          # Public courts and sheltered wall directory
│   │   ├── today/          # Daily court envelope & prescribed session
│   │   └── week/           # Sunday weekly review & recovery reflection
│   ├── components/         # Reusable UI widgets, modals, headers, and banners
│   ├── context/            # AuthContext, ThemeContext
│   ├── data/               # Local database (Dexie), drill banks, query layer
│   ├── domain/             # Business rules, envelope calculation, schemas
│   └── features/           # Modular feature hooks (day-engine, outside-mode)
├── supabase/               # PostgreSQL migrations, schema, and RLS policies
└── tests/
    ├── e2e/                # Playwright end-to-end integration test suite
    └── unit/               # Vitest unit test suite (domain, RLS, day keys)
```

---

## 3. Storage & Schema Architecture

### 3.1 Local Dexie IndexedDB Tables (`src/data/local/db.ts`)
- `profiles`: Keyed by id. Stores sport, baseline result, session duration, and sessions/week targets.
- `dailyPlans`: Keyed by `dayKey` (e.g. `2026-10-11`). Caches generated daily plans and recovery cues.
- `checkins`: Keyed by `dayKey`. Stores recovery readings (`sleep`, `energy`, `soreness`, `time`, `place`).
- `sessions`: Stores completed court workouts with actual logged minutes and drill breakdowns.
- `aiFailures`: Tracks latency, timeouts, and repair counts to optimize prompt efficacy locally.

### 3.2 Supabase Postgres & Row-Level Security (`supabase/schema.sql`)
When cloud sync is active, Row-Level Security (RLS) guarantees data isolation:
- `profiles`: Athletes can only read/write their own profile row (`auth.uid() = id`).
- `buddy_pairs`: Accessible exclusively by the two paired athletes (`auth.uid() = user_a OR auth.uid() = user_b`).
- `spots`: Publicly readable by all athletes; insertable only by authenticated members.

---

## 4. Mobile & PWA Offline Engine

- **Service Worker (`public/sw.js`)**: Employs Cache-First strategy for static JS/CSS bundles and Network-First with Cache fallback for app routes.
- **Wake Lock API (`src/app/outside/page.tsx`)**: Keeps screen awake during active court footwork sessions so the timer never suspends.
- **Web Speech Synthesis API (`src/features/outside-mode/audio.ts`)**: Delivers hands-free audible countdowns and technique cues directly through headphones while the athlete's phone is placed beside the court.
