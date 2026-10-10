# Bahar

Bahar is a resilient, offline-first training app designed to expect failure and build momentum.

## Data Practices & Privacy
We believe health and training data is deeply personal.
- **Local By Default**: Your baseline settings, daily plans, training history, and check-ins are saved exclusively on your device using IndexedDB (Dexie). They never leave your phone unless you explicitly choose to.
- **Account is Optional**: You do not need to create an account to use the core application.
- **Multiplayer/Buddies**: If you choose to sign in to pair with an accountability buddy or publish public training spots, only the minimally required data is synchronized to our server (Supabase).
- **Data Export & Deletion**: A JSON export of your local database is available in the settings. You can delete all your data at any time with a single tap.
- **AI Privacy**: We do not send your personal details to the AI model. The AI is only provided with your generalized intensity envelope (e.g., "medium intensity, 45 minutes").

## Stack
- Next.js (App Router) + TypeScript
- Dexie for Local-first Data
- Supabase (Postgres + Auth + RLS)
- Zod for Validation
- Hosted Open-Weight AI fallback
- Playwright & Vitest for Testing

## Features
- Dynamic daily plans generated based on your streak and limits.
- Background-resilient timers designed for mobile lock-screens.
- Audio cues utilizing the native Browser Speech API.
- Buddy pairing with strict Row Level Security.
