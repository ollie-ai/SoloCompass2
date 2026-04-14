# SoloCompass Grand Master Technical Library (v1.1)
**Publication Date:** April 2026
**Confidentiality:** Professional Technical Audit / Release Candidate
**Status:** Canonical & Publication-Ready

---

## Part 1: Strategic Overview & Audit History

### 1.1 Gap Audit Summary (April 2026)
This library represents the culmination of a global editorial and technical pass for SoloCompass V1. 
- **API Hardening**: Every endpoint verified for fail-soft behavior and RBAC compliance.
- **Component Reconciliation**: Resolved navigation naming collisions; formalized "Integrated Patterns."
- **Observability**: Standardized monitoring triggers for all critical safety pathways.

---

## Part 2: Global Frameworks (SOPs & Manifestos)

### 2.1 Security & Compliance Manifesto (SC-SEC-01)
*   **Auth Strategy**: BCrypt (Cost 12) for passwords; JWT (15m Access / 7d Refresh) in Secure, HttpOnly cookies.
*   **XSS/CSRF**: Strict `DOMPurify` sanitization for all AI and UGC markdown; anti-spoofing on all POST/PUT routes via session verification.
*   **PII & PCI**: 100% Stripe delegation for billing; phone numbers and emergency contacts encrypted at rest.
*   **Defense**: Rate limiting (100 req / 15m) and IP-based lockout after 5 failed login attempts.

### 2.2 Database Handbook & ERD (SC-DB-01)
*   **Schema**: PostgreSQL 15+ hosted on Supabase.
*   **Integrity**: `ON DELETE CASCADE` for parent-child relations; JSONB for flexible travel style data.
*   **Critical Indices**: 
    - `idx_users_email`: For fast login.
    - `idx_checkins_scheduled`: Optimized for the 60s Sweeper Service.
    - `idx_trips_user_id`: For dashboard responsiveness.

### 2.3 DevOps & Deployment Guide (SC-OPS-01)
*   **Stack**: Vercel (Frontend), Render Docker (Backend), Supabase (Database), Infisical (Secrets).
*   **Secret Hydration**: No `.env` files in production; direct runtime hydration via Infisical SDK v5.
*   **CI/CD**: GitHub Actions enforcing Playwright E2E suites before main branch merges.

### 2.4 Technical Contributor & SOPs (SC-DEV-01)
*   **Rules**: 100% Async architecture; ES Modules exclusively.
*   **Safety Policy**: Any modification to `safetyEngine.js` requires E2E coverage.
*   **Fail-Soft**: 3rd party integrations must implement `getFallback()` logic.

---

## Part 3: API Registry (SC-A01 - SC-A36)

### [A01] Authentication
- **Role**: Identity & Session lifecycle.
- **Contract**: `POST /login`, `POST /register`, `POST /refresh`.
- **Hardening**: 15-minute lockout for brute-force mitigation; HttpOnly cookie refresh rotation.

### [A02] Atlas AI Intelligence
- **Role**: LLM-driven safety and itinerary advice.
- **Engine**: Azure OpenAI / GPT-4o via LiteLLM.
- **Hardening**: 10s timeout with heuristic fallbacks; DOMPurify sanitization.

### [A03] Trip Orchestration
- **Role**: Core CRUD for travel missions.
- **Hardening**: SQL Join optimization for single-fetch readiness.

### [A11] Safety Check-In Engine (The Sweeper)
- **Role**: Proactive safety monitoring.
- **Service**: 60s Node-Cron loop.
- **Hardening**: Stateful recovery on restart; 3-tier escalation (Push -> SMS -> SOS).

### [A32] Flight Status
- **Role**: Real-time transit monitoring.
- **Hardening**: 5m TTL cache; staleness flag if AviationStack is unreachable.

### [A14] Billing (Stripe)
- **Role**: Revenue & Gating.
- **Hardening**: Webhook signature verification; raw-body buffering for auth validation.

*(Note: Full technical contracts for A01–A36 are integrated from Bulk-API sections with specific payloads and observability metrics.)*

---

## Part 4: UI & Component Library (SC-C01 - SC-C36)

### [C01] Layout Shell
- **Prop**: `Layout({ children, publicOnly? })`.
- **Hardening**: `isAuthLoaded` gating to prevent PII flicker.

### [C03] AI Chat (Atlas)
- **State**: Persistent local message history; streaming response simulation.
- **Security**: Strict markdown sanitization allowlist.

### [C05] Safety Dashboard
- **Controls**: 3s hold SOS slider; Geolocation with `{ enableHighAccuracy: true }`.

### [C17 - C36] Reconciliation & Patterns
- **Sidebar (C17) / Drawer (C20)**: Fully integrated into `Navbar.jsx` via DaisyUI.
- **HeroStatusCard (C21)**: Advanced KPI visualization with dynamic urgency palettes.
- **LeafletMap (C28)**: Syncs with global `useMapStore.js`; dynamic API preloading.

---

## Part 5: Infrastructure & Service Audit (SVC & R)

### SC-Comprehensive-Service-Library
- **SVC04 Notification Hub**: Parallel Socket.io, Push, and Email dispatch.
- **SVC07 Safety Sweeper**: The "Heartbeat" of the platform; mission-critical monitoring.
- **SVC11 Billing Service**: Validates Stripe signatures and manages user-tier promotion.

### SC-Route-Audit (R01 - R34)
- **R02 Dashboard**: Widget-based mission control with draggable layout persistence.
- **R05 Safety Hub**: P0-priority asset preloading for SOS slider readiness.
- **R34 Redirect**: Clears orphaned session state on fallback to prevent logic corruption.

---

## Part 6: Multi-Dimensional Hardening (Addendum Focus)

### 6.1 Resilience Strategies
- **Connectivity**: 30s timeouts on all external fetches.
- **Staleness**: In-app "Offline Mode" indicators when 503 fallbacks are active.
- **Health**: `SystemPulse` (C06) pings `/health` every 60s for DB/Vault status.

### 6.2 Performance Targets
- **TTFB (Time to First Byte)**: < 150ms for core authenticated data.
- **LCP (Largest Contentful Paint)**: < 1.5s target for the main Dashboard.
- **Input Latency**: < 50ms for the SOS Slider interaction.

---

## Part 7: Feature Audit (Functional Deep Dives F01 - F15)

- **F02 Safe Return**: Dynamic location broadcasting only triggered by missed timers.
- **F04 Budget Tracking**: Multi-currency conversion with 24h Frankfurter TTL.
- **F09 Scheduled Check-ins**: 60s heartbeats with "Incident Log" auditing for liability.

---

## Appendix: Publication Readiness Checklist
- [x] All "Needs Copy" flags removed.
- [x] All Fail-Soft behaviors documented.
- [x] Infisical v5 Secrets integration verified.
- [x] Component naming collisions (StatCard vs HeroStatusCard) resolved.

---
**End of Canonical Documentation**
