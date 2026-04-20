# SoloCompass - Solo Travel Safety Platform

## Architecture
- **Monorepo** using npm workspaces (`frontend/`, `backend/`)
- **Frontend**: React 18 + Vite, runs on port 5000 (host 0.0.0.0)
- **Backend**: Express.js, runs on port 3005 (localhost)
- **Database**: PostgreSQL (via `DATABASE_URL` env var with SSL)
- **Concurrently** runs both servers via `npm run dev` from root

## Running the App
```
npm run dev          # starts both frontend and backend
npm run dev:frontend # frontend only
npm run dev:backend  # backend only
```

## Key Configuration
- **Vite config** (`frontend/vite.config.js`): port 5000, host `0.0.0.0`, `allowedHosts: true`, CSP allows ws/wss
- **Backend** (`backend/src/index.js`): listens on PORT env var or 3005
- **Replit workflow**: `npm run dev`, waitForPort 5000

## Optional External Services (gracefully degraded in dev)
- **Infisical**: secret management (skipped if env vars missing)
- **Stripe**: payments (disabled if `STRIPE_SECRET_KEY` missing)
- **Supabase**: file storage (disabled if `SUPABASE_URL`/`SUPABASE_SERVICE_KEY` missing)
- **Azure OpenAI / Anthropic**: AI features (disabled if API keys missing)
- **Google / GitHub OAuth**: disabled if credentials missing

## Known Dev-Mode Warnings (non-fatal)
- Migrations v007-v015: FAILED — require additional DB schema setup
- `relation "users"/"destinations"/"notification_templates" does not exist` — DB not fully migrated
- `AUTOINCREMENT` syntax error — SQLite DDL mixed with PostgreSQL in support tables
- Service Worker registration failed — expected in iframe/proxy context

## Code Fixes Applied During Setup
- `backend/src/services/aiService.js`: Added named exports `callAnthropic`, `callAI`, `getAIUsageStats`
- `backend/src/services/featureFlagService.js`: Added named export `getAllFlags`
- `backend/src/services/emergencyNumbersService.js`: Fixed `emergencyNumbersData = readEmergencyNumbers()`
- `backend/src/middleware/paywall.js`: Exported `getUserPlan`
- `backend/src/middleware/rateLimiters.js`: Fixed IPv6 keyGenerator using `ipKeyGenerator`
- `backend/src/routes/users.js`: Removed duplicate import, added `authenticate` and `apiLimiter` imports
- `backend/src/routes/checkin.js`: Removed duplicate import
- `backend/src/routes/billing.js`: Fixed `invoicesLimiter` → `billingWriteLimiter`
- `backend/src/routes/emergencyNumbers.js`: Added missing `logger` import, removed orphaned code
- `backend/src/routes/preferences.js`: Added missing `preferencesLimiter` definition
- `backend/src/routes/buddyConnections.js`: Fixed IPv6 keyGenerator
- `backend/src/data/helpArticles.json`: Created stub data file
- `backend/src/data/emergencyNumbers.json`: Created stub data file
- `backend/src/data/emergencyNumbers.js`: Created JS module wrapper
