# SoloCompass Master Technical Documentation Addendum (Full Library)

This document is the authoritative technical reference for the SoloCompass platform, aggregating all API systems (SC-A01 to SC-A36) and Frontend Components (SC-C01 to SC-C36). It provides implementation-grounded details on schemas, security boundaries, and infrastructure.

---

## 🏗️ GLOBAL API STANDARDS

### Standard Response Schema
All SC-API responses adhere to the following JSON envelope:
```json
{
  "success": boolean,
  "data": object | null,
  "error": { "code": string, "message": string, "details": object } | null,
  "status": number
}
```

### Common Status Codes
- `200/201`: Success.
- `403`: Forbidden (Quota/Plan reached).
- `422`: Validation error.
- `503`: Fallback triggered (External API down).

---

## PART 1: COMPREHENSIVE API DOCUMENTATION (SC-A01 - SC-A36)

---

## SC-A01 API — Auth
### Technical implementation
- **Service Interaction:** UI -> Auth Route -> Bcrypt Helper -> Infisical (JWT Secret) -> SQLite/Postgres.
- **Contract:** `POST /login`: `{ email (req), password (req) }`.
- **Monitoring:** Alert if `FAILED_LOGIN_RATE` > 20/min per IP.

---

## SC-A02 API — AI
### Technical implementation
- **Service Interaction:** UI -> AI Route -> RBAC Middleware -> LiteLLM Proxy -> Azure OpenAI.
- **RBAC:** 
  - **Explorer:** 1 use.
  - **Navigator:** Unlimited.
- **Caching:** Itinerary (24h TTL).
- **Monitoring:** Log `AI_FALLBACK_COUNT`.

---

## SC-A03 API — Trips
### Technical implementation
- **API Contract:** `POST /api/trips`: `{ title, destination, startDate, endDate, budget? }`.
- **Security:** Strict `userId` ownership check on all CRUD operations.
- **Observability:** `TRIP_CREATE_LATENCY` monitoring.

---

## SC-A04 API — Accommodations
### Technical implementation
- **API Contract:** `POST /api/trips/:id/accommodation`.
- **Constraints:** `trip_id` UNIQUE index ensures 1 accommodation per trip.

---

## SC-A05 API — Bookings
### Technical implementation
- **API Contract:** `POST /api/trips/:id/bookings`.
- **Data Isolation:** SQL `EXISTS` checks for cross-table security.

---

## SC-A06 API — Trip Documents
### Technical implementation
- **Infrastructure:** **Supabase Storage** (Signed URLs).
- **Contract:** `POST /api/trips/:id/documents` (FormData).

---

## SC-A07 API — Trip Places
### Technical implementation
- **Infrastructure:** Google Places API sync.
- **Constraints:** TripID + PlaceID UNIQUE.

---

## SC-A08 API — Destinations
### Technical implementation
- **Infrastructure:** LiteLLM / Azure AI.
- **RBAC:** `premiumOnly` check for agent interaction.

---

## SC-A09 API — Users
### Technical implementation
- **Infrastructure:** GDPR-compliant JSON data export.
- **Security:** `requireAuth` + Self-access only.

---

## SC-A10 API — Advisories
### Technical implementation
- **Infrastructure:** FCDO RSS Feed Sync (4h interval).
- **Caching:** 1h TTL on gov alerts.

---

## SC-A11 API — Check-In
### Technical implementation
- **Orchestration:** **Node-Cron Sweeper** (Stateful recovery).
- **Service Interaction:** Sweeper -> DB Search -> Notification Service -> Twilio/Resend.
- **Monitoring:** Trigger P1 Incident if SMS failure rate > 5% in 1h.

---

## SC-A12 API — Safety
### Technical implementation
- **Performance:** Pre-rendered crime heatmaps.
- **Fallback:** Regional stats if hyper-local data fails.

---

## SC-A13 API — Emergency Contacts
### Technical implementation
- **Infrastructure:** Twilio SMS Gateway.
- **RBAC:** Verified status badge logic.

---

## SC-A14 API — Billing
### Technical implementation
- **Infrastructure:** Stripe Webhook Listener.
- **Security:** Webhook signature verification.

---

## SC-A15 API — Admin
### Technical implementation
- **Infrastructure:** Audit logging for admin actions.
- **RBAC:** `requireAdmin` middleware.

---

## SC-A16 API — Analytics

### Overview
- **Type:** System API
- **Primary purpose:** Tracking and reporting of user engagement and system performance metrics.
- **Owner:** Platform Engineering
- **Status:** Production-Ready

### Product role
- **Why this exists:** To provide data-driven insights into how solo travelers interact with safety features.
- **What product problem it solves:** Identifies under-utilized features and potential drop-off points in safety check-ins.
- **What it should never do:** Record precise GPS coordinates or plaintext PII in telemetry logs.

### User outcomes
- **Primary user value:** Improved app experience through data-driven refinements.
- **Secondary user value:** Faster troubleshooting of system-wide issues.
- **Trust / safety:** Ensures system performance is monitored for safety-critical pathways.

### Scope
- **Included:** Event tracking (clicks, page views), high-level stat aggregation for admins.
- **Out of scope:** Individual user session recording (session replay).

### Functional rules
- **Trigger:** Frontend events (telemetry hook).
- **Inputs:** `event_name`, `metadata` (JSON), `path`.
- **Outputs:** `200 OK` on success.
- **Priority:** Background task (low priority compared to safety events).

### UX touchpoints
- **Routes:** Transparently used across all routes.
- **Settings:** Users can opt-out via `CookieConsent` (Analytics category).

### Copy and content source
- **Messages:** "Opt-out available in settings."

### Technical implementation
- **Service Interaction:** Telemetry Hook -> Analytics Route -> In-Memory Queue -> Postgres.
- **Performance:** Flush every 5s to avoid DB write-locking.
- **Monitoring:** `MAU` and `Retention` dashboards.

### Security
- **Middleware:** `requireAuth` for user-tagged events; anonymized for public pages.

### Edge cases
- **Database Downtime:** Analytics should fail silently without crashing the user session.

### Acceptance criteria
- [ ] Events are recorded with active `user_id` when authenticated.
- [ ] Admin dashboard correctly aggregates event totals.

### Changelog
- Initial telemetry system established.

### Open Questions
- Should we implement automated alerts for statistically significant drops in check-in completions?

---

## SC-A17 API — Notifications

### Overview
- **Type:** API Route
- **Primary purpose:** Lifecycle management of user alerts, safety reminders, and trip updates.
- **Status:** Production-Ready

### Product role
- **Why this exists:** To ensure time-sensitive safety info reaches the user immediately.
- **What it should never do:** Send spam or non-critical marketing alerts through the high-priority safety channel.

### User outcomes
- **Primary value:** Real-time awareness of trip changes and safety check-ins.
- **Trust:** Centralized, reliable log of all system communications.

### Scope
- **Included:** System alerts, Safety reminders, Advisory updates.
- **Out of scope:** Direct P2P messaging (handled via Buddy matching).

### Functional rules
- **Endpoints:** `GET /`, `GET /unread-count`, `PUT /:id/read`, `PUT /read-all`, `DELETE /:id`.
- **Inputs:** Pagination params (`page`, `limit`), `unreadOnly` toggle.

### UX touchpoints
- **Components:** `NotificationDropdown`, `Notifications` page.

### Copy and content source
- **Keys:** "You missed a check-in", "New advisory for Tokyo".

### Technical implementation
- **Infrastructure:** **Socket.io** for real-time; REST for history.
- **API Contract:** `GET /api/notifications`; `PUT /notifications/:id/read`.
- **Performance:** 30s polling fallback for socket latency.

### Security
- **Auth:** `authenticate` middleware; users can only interact with their own notification IDs.

### Edge cases
- **Socket disconnect:** App falls back to 30s HTTP polling for unread count.

### Acceptance criteria
- [ ] Unread count increments on new advisory.
- [ ] Clicking "Mark all read" zeros the count.

### Changelog
- V1: Polling-based count.
- V2: WebSocket integration for real-time delivery.

### Open Questions
- Should we add "Emergency SMS" fallback for missed safety notifications?

---

## SC-A18 API — Help

### Overview
- **Type:** API Route
- **Primary purpose:** Delivery of help articles, FAQs, and support contact channels.
- **Status:** Production-Ready

### Product role
- **Why this exists:** To reduce support burden and empower users to solve problems independently.
- **What it should never do:** Substitute for emergency services (SOS).

### User outcomes
- **Primary value:** Fast answers to common questions.
- **Safety:** Clear instructions on how to use safety features.

### Scope
- **Included:** Article retrieval, Category listing, Contact form.

### Functional rules
- **Inputs:** `category_id`, search `query`.

### UX touchpoints
- **Routes:** `/help`, `/docs`.

### Technical implementation
- **Data model:** `help_articles`, `help_categories`.

### Security
- **Auth:** Public for reading; No admin-upload endpoints in this route (handled via Admin API).

### Edge cases
- **Missing content:** Returns `404` with helpful suggestions.

### Acceptance criteria
- [ ] Article search returns relevant results.
- [ ] Contact form sends email via `Resend`.

### Changelog
- Initial release.

### Open Questions
- Add AI-powered search across the help center?

---

## SC-A19 API — Currency

### Overview
- **Type:** API Route
- **Primary purpose:** Multi-currency support for trip budgeting and expense tracking.
- **Status:** Production-Ready

### Product role
- **Why this exists:** To help users manage travel costs in local currencies.
- **What it should never do:** Store sensitive financial transaction data.

### User outcomes
- **Primary value:** Accurate budget planning.

### Scope
- **Included:** Real-time conversion, historical rate lookups.

### Functional rules
- **Trigger:** Manual conversion request or budget display.
- **Endpoints:** `GET /latest`, `GET /convert`.
- **Inputs:** `from`, `to`, `amount`.

### UX touchpoints
- **Components:** `BudgetCalculator`, `ExpenseEntry`.

### Copy and content source
- **Labels:** "Exchange rate as of [date]".

### Technical implementation
- **Integration:** External rates provider (e.g., Frankfurter API).
- **Backend:** `currency.js`.
- **Caching:** 1 hour TTL for exchange rates.

### Security
- **Auth:** Public access allowed for rate lookups.

### Edge cases
- **API Failure:** Fallback to last cached rate or display "Rate unavailable".

### Acceptance criteria
- [ ] Correct conversion between Home and Destination currencies.

### Changelog
- Initial integration with Frankfurter API.

### Open Questions
- Should we support crypto-currency conversions?

---

## SC-A20 API — Weather

### Overview
- **Type:** API Route
- **Primary purpose:** Weather forecasting for destination safety and planning.
- **Status:** Production-Ready

### Product role
- **Why this exists:** To help users prepare for environmental hazards (extreme heat, storms).
- **What it should never do:** Provide medical advice based on weather conditions.

### User outcomes
- **Primary value:** Informed packing and activity planning.

### Scope
- **Included:** Current conditions, 5-day forecast.

### Functional rules
- **Endpoints:** `GET /current`, `GET /forecast`.
- **Inputs:** `city`, `lat`, `lon`.

### UX touchpoints
- **Components:** `WeatherWidget` on trip dashboard.

### Technical implementation
- **API:** OpenWeatherMap.
- **Caching:** Lightweight caching to avoid rate limits.

### Security
- **Auth:** Requires `OWM_API_KEY` (server-side).

### Edge cases
- **Invalid Location:** Return 404 with "Location not found".

### Acceptance criteria
- [ ] Returns 5-day forecast for trip destinations.

### Changelog
- Initial integration.

### Open Questions
- Add severe weather alerts?

---

## SC-A21 API — Matching

### Overview
- **Type:** API Route
- **Primary purpose:** Travel buddy matching system.
- **Status:** Production-Ready

### Product role
- **Why this exists:** Solo travel can be isolating; matching reduces risks through group activity.
- **What it should never do:** Reveal exact current location of users to strangers.

### User outcomes
- **Primary value:** Finding compatible travel companions.

### Scope
- **Included:** Search, Request, Block.

### Functional rules
- **Endpoints:** `GET /trips`, `POST /requests`, `PUT /requests/:id`, `POST /blocks`.
- **Scoring:** Based on shared destination, dates, and interests.

### UX touchpoints
- **Components:** `BuddyFinder`, `RequestList`.

### Technical implementation
- **Data model:** `travel_buddies`, `buddy_requests`, `buddy_blocks`.

### Security
- **Blocks:** Blocked users are completely invisible in results.

### Edge cases
- **No matches:** Return empty state with "Expand your search" suggestion.

### Acceptance criteria
- [ ] Matches by overlapping dates and destinations.

### Changelog
- V1: Basic matching logic.

### Open Questions
- Add verification badges for matched users?

---

## SC-A22 API — Reviews

### Overview
- **Type:** API Route
- **Primary purpose:** User-generated venue reviews for solo travelers.
- **Status:** Production-Ready

### Product role
- **Why this exists:** To provide social proof for safety and solo-friendliness.

### User outcomes
- **Primary value:** Confidence in venue selection.

### Functional rules
- **Auth Boundary:** Public for `GET`, Authenticated for `POST/PUT/DELETE`.
- **Validation:** Min 50 chars.
- **Ownership:** Users can only edit/delete their own reviews.
- **Verification:** `is_verified: true` if user has completed a trip to that city.

### Technical implementation
- **Ratings:** 4 dimensions (Overall, Solo-Friendly, Safety, Value).
- **Admin:** Special routes for moderation.

### Acceptance criteria
- [ ] Reviews are correctly linked to user and venue.

### Changelog
- Initial release.

### Open Questions
- Add photo uploads to reviews?

---

## SC-A23 API — Quiz

### Overview
- **Type:** API Route
- **Primary purpose:** Personality/Travel DNA quiz processing.
- **Status:** Production-Ready

### Product role
- **Why this exists:** To personalize the user experience based on travel style.

### Functional rules
- **Endpoints:** `GET /displayQuestions`, `POST /submit`, `POST /save-progress`.
- **Impact:** Updates `profiles.travel_style` and `budget_level`.

### Technical implementation
- **Calculation:** Weighted scoring of interests.
- **Backend:** `quiz.js`.

### Acceptance criteria
- [ ] Quiz completion updates user profile correctly.

### Changelog
- Initial release.

### Open Questions
- Add "Travel DNA" sharing to social media?

---

## SC-A24 API — Places

### Overview
- **Type:** API Route
- **Primary purpose:** Map venue search and detail retrieval.
- **Status:** Production-Ready

### Product role
- **Why this exists:** To provide location data for trip planning.

### Functional rules
- **Endpoints:** `GET /search`, `GET /nearby`, `GET /details`, `GET /autocomplete`.
- **API:** Google Places Proxy.

### Technical implementation
- **Security:** Requires `GOOGLE_MAPS_API_KEY`.

### Acceptance criteria
- [ ] Search returns accurate venue details.

### Changelog
- Initial integration.

### Open Questions
- Add custom venue tagging?

---

## SC-A25 API — Directions

### Overview
- **Type:** API Route
- **Primary purpose:** Transit and walking directions for solo navigation.
- **Status:** Production-Ready

### Product role
- **Why this exists:** To provide safe and efficient routing for solo travelers.

### Functional rules
- **Endpoints:** `GET /`, `GET /transit`, `POST /multi`.
- **Modes:** `transit`, `walking`.

### Technical implementation
- **Integration:** Google Maps Directions API.
- **Backend:** `directions.js`.

### Acceptance criteria
- [ ] Returns valid routes for requested modes.

### Changelog
- Initial integration.

### Open Questions
- Add offline routing support?

---

## SC-A26 API — Exchange

### Overview
- **Type:** API Route
- **Primary purpose:** Real-time currency exchange rates for user budgeting and financial tracking.
- **Status:** Production-Ready

### Product role
- **Why this exists:** To ensure accurate currency conversion for international travelers.
- **What it should never do:** Provide financial trading advice.

### User outcomes
- **Primary value:** Consistent budget tracking across different currencies.

### Functional rules
- **Auth:** `authenticate` required.
- **Trigger:** Manual conversion or budget view.

### Technical implementation
- **API:** Frankfurter.

### Acceptance criteria
- [ ] Correctly converts base currency to target exchange rate.

---

## SC-A27 API — Packing Lists

### Overview
- **Type:** API Route
- **Primary purpose:** Personalised packing list management with smart templates.
- **Status:** Production-Ready

### Product role
- **Why this exists:** To help solo travelers remember essentials and reduce pre-trip anxiety.
- **What it should never do:** Auto-purchase items for the user (unless via affiliate).

### Functional rules
- **Operations:** CRUD for items; Duplicate from source trip.
- **Default Logic:** Auto-injects 7 "Solo Essentials" if no template selected.

### Technical implementation
- **Data model:** `packing_lists`, `packing_items`, `packing_templates`.

### Acceptance criteria
- [ ] User can check/uncheck items.
- [ ] Custom items can be added with quantity and notes.

---

## SC-A28 API — Categories

### Overview
- **Type:** API Route (Admin/System)
- **Primary purpose:** Classification system for resources and safety content.
- **Status:** Production-Ready

### Functional rules
- **Auth:** Public `GET`; `requireAdmin` for `POST/PUT/DELETE`.
- **Logic:** Handles parent/child relationships if defined in schema.

### Technical implementation
- **Data model:** `categories` table with slug, name, and icon fields.

---

## SC-A29 API — Resources

### Overview
- **Type:** API Route
- **Primary purpose:** Knowledge base management for safety guides and travel documentation.
- **Status:** Production-Ready

### Functional rules
- **Endpoints:**
  - `GET /api/resources`: List all with search and category filtering.
  - `GET /api/resources/:id`: Detail view.
- **Search:** Keyword based across title and content.
- **Restoration:** Admin-only `restore` endpoint for soft-deleted items.

### Technical implementation
- **Logic:** Soft-delete via `deleted_at` timestamp.

---

## SC-A30 API — Preferences

### Overview
- **Type:** API Route
- **Primary purpose:** User profile and system settings management.
- **Status:** Production-Ready

### Functional rules
- **Endpoints:**
  - `GET /api/preferences`: Retrieve user settings.
  - `PUT /api/preferences`: Update preferences (Theme, Units, Notification triggers).
  - `POST /api/preferences/profile-photo`: Upload avatar via signed URL or direct upload.
- **Sync:** Settings persist across sessions via the backend profile.

### Technical implementation
- **Backend:** `preferences.js`.

---

## SC-A31 API — Affiliates

### Overview
- **Type:** API Route
- **Primary purpose:** Revenue generation through tracked partner links.
- **Status:** Production-Ready

### Functional rules
- **Logic:** Generates tracking URLs for Booking.com, Viator, etc., using user-specific affiliate IDs.
- **Transparency:** All links are clearly identified as partnerships in the UI.
- **Integrations:** Booking.com, Viator, SafetyWing.

---

## SC-A32 API — Flights

### Overview
- **Type:** API Route
- **Primary purpose:** Real-time flight tracking and status updates.
- **Status:** Production-Ready

### Technical implementation
- **Service Interaction:** UI -> Flight Route -> AviationStack -> Return.
- **Caching:** **5-minute TTL** for live status.
- **Fail-Soft:** Returns last cached data + `is_stale: true` if API is down.

---

## SC-A33 API — Budget

### Overview
- **Type:** API Route
- **Primary purpose:** Multi-currency expense tracking for solo trips.
- **Status:** Production-Ready

### Functional rules
- **Logic:** Automatic conversion of local expenses into home currency using SC-A26 logic.
- **Calculations:** Total spent vs Budget ceiling; Daily average burn rate.
- **Logic:** Aggregates all trip expenses and compares to user-defined budget.

---

## SC-A34 API — Webhooks

### Overview
- **Type:** API Route (External)
- **Primary purpose:** Handle incoming events from Stripe and other providers.
- **Status:** Production-Ready

### Security
- **Verification:** Signature validation required for all incoming webhooks.

### Functional rules
- **Verification:** Signature verification (Stripe-Signature).
- **Events:** `checkout.session.completed` triggers premium access activation.

---

## SC-A35 API — SMS Webhook

### Overview
- **Type:** API Route (External)
- **Primary purpose:** Handle incoming SMS for emergency contact verification.
- **Status:** Production-Ready

### Functional rules
- **Integration:** Twilio or similar.
- **Logic:** Identifies `START`, `STOP`, and verification codes from guardian phones.
- **Trigger:** Incoming Twilio message.

---

## SC-A36 API — Translate

### Overview
- **Type:** API Route
- **Primary purpose:** On-demand translation for signage and local communication.
- **Status:** Production-Ready

### Functional rules
- **Integration:** Azure AI Translator.
- **Capabilities:** Text to Text; language auto-detection.

### Technical implementation
- **API:** Azure AI Translator.
- **Capabilities:** Language auto-detection.

---

# PART 2: COMPONENT DOCUMENTATION (SC-C01 to SC-C36)

## SC-C01 Component — Layout Shell

### 1. Overview
- **Type:** System Component
- **Primary purpose:** Root layout wrapper handling navigation, global tools, and page transitions.
- **Owner:** Core Engineering
- **Status:** Operational

### 2. Product role
- **Why it exists:** To provide a unified shell for the application, ensuring that global features like AI and navigation are consistently available.
- **What product problem it solves:** Prevents layout fragmentation and manages the "App" vs "Public" visual distinction.
- **What it should never do:** Handle content-specific business logic.

### 3. User outcomes
- **Primary user value:** Seamless navigation between features without visual "jumps."
- **Secondary user value:** Instant access to Atlas AI from any page.
- **Trust / safety:** Provides a predictable navigation anchor.

### 4. Scope
- **Included in scope:** Navbar, Footer, AIChat, Framer Motion transitions, Auth-aware rendering.
- **Out of scope:** Individual page routing logic (handled in `App.jsx`).

### 5. Functional rules
- **Trigger conditions:** Application load and route changes.
- **Inputs:** `location.pathname`, `isAuthenticated` from `authStore`.
- **Outputs:** Wrapped page content with global UI overlays.
- **Priority rules:** AI Chat button is always on top (Z-index 50+).
- **Dependencies:** `react-router-dom`, `framer-motion`, `Navbar`, `Footer`, `AIChat`.

### 6. UX touchpoints
- **Routes that use this:** All application routes.
- **Components involved:** `Navbar`, `Footer`, `AIChat`, `Outlet`.
- **Empty / loading / error patterns:** Initial mount delay (100ms) to prevent hydration flicker.
- **Settings / controls exposed to users:** "Skip to main content" for accessibility.

### 7. Copy and content source
- **Key UI copy:** "Skip to main content".
- **Help / support text:** Not applicable.

### 8. Technical implementation
- **Prop Interface:** `Layout({ children, publicOnly? })`.
- **Accessibility:** `aria-main` landmark; `reduce-motion` check.
- **Security:** `isAuthLoaded` gating to prevent PII flicker.

### 9. Security / permissions
- **Rules:** Restricts `Footer` rendering to public-facing pages via `publicPaths` array.
- **Auth:** Uses `isAuthLoaded` to prevent flickering on protected routes.

### 10. Edge cases and failure handling
- **Failure modes:** Browser motion-preference settings blocking transitions.
- **Recovery / fallback:** CSS-based fallback for layout if JS fails to hide/show specific elements.

### 11. Acceptance criteria
- [ ] Renders Navbar on all pages.
- [ ] Renders AIChat on all authenticated pages.
- [ ] Smooth transition detected between `/trips` and `/safety`.

### 12. Changelog
- 2024-04-08: Finalized documentation audit.

### 13. Open questions
- Should we hide AIChat on smaller viewports where the keyboard might obscure it?

---

## SC-C02 Component — Bottom Navigation

### 1. Overview
- **Type:** Navigation Component (Mobile)
- **Primary purpose:** Persistent mobile navigation for core app areas.
- **Owner:** Design / Core
- **Status:** Operational

### 2. Product role
- **Why it exists:** Ergonomic access to primary features for handheld mobile users.
- **What problem it solves:** Difficulty reaching desktop-style navbars on mobile screens.
- **What it should never do:** Appear on desktop viewports (lg+).

### 3. User outcomes
- **Primary user value:** One-thumb access to Safety, Explore, and Trips.
- **Secondary user value:** Visual indication of current app location.

### 4. Scope
- **Included in scope:** Scroll-aware hiding logic, Auth filtering, Action button (New Trip).
- **Out of scope:** Profile settings dropdown (handled in desktop Navbar).

### 5. Functional rules
- **Trigger conditions:** Viewport < 1024px.
- **Inputs:** `isAuthenticated`, `scrollY`.
- **Outputs:** Fixed-bottom floating navigation bar.
- **Priority rules:** "New Trip" button persists as a primary action.
- **Dependencies:** `lucide-react`, `framer-motion`, `authStore`.

### 6. UX touchpoints
- **Routes that use this:** All authenticated app routes.
- **Components involved:** `BottomNav`.
- **Empty / loading / error patterns:** Hidden if unauthenticated.
- **Settings / controls:** Hides on scroll down, reappears on scroll up.

### 7. Copy and content source
- **Labels:** "Home", "Explore", "New Trip", "Safety", "Profile".

### 8. Technical implementation
- **Frontend components:** `BottomNav.jsx`.
- **UX Logic:** `framer-motion` height animation triggered by `window.scrollY.delta > 50px`.
- **Data model:** `BOTTOM_NAV_ITEMS` config.

### 9. Security / permissions
- **Auth:** Items filtered by `authRequired` property in config.

### 10. Edge cases and failure handling
- **Failure modes:** Path mismatch leads to no active icon highlight.
- **Recovery / fallback:** Defaults to "Home" highlight if current path is dashboard-related.

### 11. Acceptance criteria
- [ ] Hides automatically on scroll-down.
- [ ] Active state matches `react-router` location.

### 12. Changelog
- 2024-04-08: Added scroll-aware hiding logic.

### 13. Open questions
- Should we add unread notification badges to the "Safety" icon?

---

## SC-C03 Component — AI Chat Widget (Atlas)

### 1. Overview
- **Type:** Intelligent Assistant
- **Primary purpose:** Conversation interface with Atlas AI.
- **Owner:** AI Engineering
- **Status:** Operational

### 2. Product role
- **Why it exists:** To provide instant, natural-language safety and travel advice.
- **Problem solved:** Search fatigue for destination-specific rules and safety.
- **What it should never do:** Give medical advice without disclaimers.

### 3. User outcomes
- **Primary user value:** Immediate answers to "How do I get home safely?".
- **Secondary user value:** Discovery of trip tips via Quick Prompts.

### 4. Scope
- **Included in scope:** Message history, Quick Prompts, Markdown rendering, FAB toggle.
- **Out of scope:** Voice input (planned).

### 5. Functional rules
- **Trigger conditions:** FAB click or programmatic launch.
- **Inputs:** User text input, `destinationId` (context).
- **Outputs:** AI response (streaming simulated).
- **Dependencies:** `api.js`, `dompurify`, `framer-motion`.

### 6. UX touchpoints
- **Components:** `AIChat`, `MessageList`, `QuickPrompts`.
- **States:** Typing (loading), Success, Error.
- **Controls:** Toggle FAB, quick prompt chips, send button.

### 7. Copy and content source
- **Key UI copy:** "Ask Atlas anything...", "Online".
- **Errors:** "I'm having trouble connecting to the network."

### 8. Technical implementation
- **Frontend components:** `AIChat.jsx`.
- **Backend routes:** `POST /api/ai/chat`, `GET /api/ai/quick-prompts`.
- **External integrations:** LiteLLM / Azure AI.

### 9. Security / permissions
- **Data Protection:** Sanitizes all AI output via `DOMPurify` to prevent XSS.

### 10. Edge cases and failure handling
- **Failure mode:** API Timeout.
- **Recovery:** In-chat error bubble with a "Try Again" option.

### 11. Acceptance criteria
- [ ] Markdown links render correctly as clickable safe links.
- [ ] Quick Prompts refresh based on current trip context.

### 12. Changelog
- 2024-04-08: Implemented context-aware quick prompt fetching.

### 13. Open questions
- Should chat history be saved to local storage for guest sessions?

---

## SC-C04 Component — Dashboard Hero

### 1. Overview
- **Type:** Visual Landing Feature
- **Primary purpose:** Visual summary of the user's nearest upcoming trip.
- **Owner:** Product
- **Status:** Operational

### 2. Product role
- **Why it exists:** To provide immediate reassurance and focus for the traveler.
- **Problem solved:** Trip prep procrastination by showing "Readiness" scores.
- **What it should never do:** Display data for archived or past trips unless in "Memory" mode.

### 3. User outcomes
- **Primary user value:** Knowing exactly how many days are left and what to do next.
- **Secondary user value:** Feeling a sense of accomplishment as the readiness score rises.

### 4. Scope
- **Included in scope:** Countdown, Readiness Score, Essentials Checklist summary, Freshness stamps.
- **Out of scope:** Full trip details (links to Trip view).

### 5. Functional rules
- **Inputs:** `useReadinessStore` data.
- **Priority:** `CRITICAL_BLOCKER` label overrides all other statuses with red theme.
- **Dependencies:** `readinessStore.js`, `lucide-react`.

### 6. UX touchpoints
- **Routes:** `/dashboard`.
- **State patterns:** Skeleton loader during data fetch; "No Trip" empty state.

### 7. Copy and content source
- **Copy:** "Readiness", "Essentials", "Next action:".

### 8. Technical implementation
- **Frontend components:** `DashboardHero.jsx`.
- **Readiness Logic:** `(completed_essentials / total_essentials) * 100`.
- **Data logic:** `formatCountdown` and `getReadinessSummary` helpers in `utils/date.js`.

### 9. Security / permissions
- **Rule:** Uses authenticated store; data is local to the active user session.

### 10. Edge cases and failure handling
- **Failure mode:** `currentTrip` is null.
- **Fallback:** Displays "No upcoming trip found" with a "Plan a Trip" button.

### 11. Acceptance criteria
- [ ] Readiness percentage matches the completed essentials count.
- [ ] Countdown displays "Today!" exactly on the start date.

### 12. Changelog
- 2024-04-08: Added "Last Updated" freshness tracking.

### 13. Open questions
- None.

---

## SC-C05 Component — Safety Check-In

### 1. Overview
- **Type:** Core Safety Feature
- **Primary purpose:** Interactive hub for user-driven and automated safety events.
- **Owner:** Safety
- **Status:** Operational

### 2. Product role
- **Why it exists:** The cornerstone of SoloCompass's safety guarantee.
- **Problem solved:** Provides a literal "Panic Button" and scheduled check-ins for solo travelers.
- **What it should never do:** Fire an SOS without the "Slide" confirmation (to avoid pocket-firing).

### 3. User outcomes
- **Primary user value:** Immediate communication of safety status to emergency contacts.
- **Secondary user value:** Deterrence of threats via "Fake Call" simulation.

### 4. Scope
- **Included in scope:** SOS Slider, I'm Safe button, Fake Call, Scheduled Check-ins, Contact CRUD.
- **Out of scope:** Direct 911 integration (proxied through emergency contacts in V1).

### 5. Functional rules
- **Inputs:** `tripId`, Lat/Lon from `navigator.geolocation`.
- **Outputs:** SMS/Email notifications to contacts (via backend).
- **Triggers:** Button tap, Slider reach 100%, Scheduled time reached.

### 6. UX touchpoints
- **Routes:** `/safety`.
- **Controls:** `sosSliderValue` range input, Tabbed interface (Check-in/Contacts/History).

### 7. Copy and content source
- **Labels:** "I'm Safe", "Slide to SOS", "Trigger Fake Call".
- **Audio:** `phone_ringing.ogg` for simulated calls.

### 8. Technical implementation
- **Frontend components:** `SafetyCheckIn.jsx`.
- **Geolocation Options:** `{ enableHighAccuracy: true, timeout: 5000 }`.
- **Backend routes:** `/checkin`, `/checkin/scheduled`, `/emergency-contacts`.

### 9. Security / permissions
- **Permissions:** Explicitly requests Geolocation access with permission-denied fallback logic.

### 10. Edge cases and failure handling
- **Failure mode:** No internet during SOS.
- **Fallback:** Component displays "Offline" state, advises user to use primary phone carrier.

### 11. Acceptance criteria
- [ ] Emergency contacts receive SMS within 15 seconds of SOS slider activation.
- [ ] Fake call speech synthesis matches the assistant's voice style.

### 12. Changelog
- 2024-04-08: Added recurring check-in scheduling logic.

### 13. Open questions
- Should we allow "Silent SOS" where the UI doesn't visually alert anyone nearby?

---

## SC-C06 Component — SystemPulse

### 1. Overview
- **Type:** System Component (Global Monitor)
- **Primary purpose:** Real-time health monitoring of the SoloCompass infrastructure.
- **Owner:** DevOps / Core Infrastructure
- **Status:** Production-Ready

### 2. Product role
- **Why this exists:** To provide users with confidence that the platform's safety-critical systems (database, secrets vault, API) are operational.
- **What product problem it solves:** Reduces anxiety during check-ins by confirming "Mission Control" is active.
- **What it should never do:** Block primary UI interactions or leak specific infrastructure IP/details.

### 3. User outcomes
- **Primary user value:** Immediate visual confirmation of system reliability.
- **Secondary user value:** Real-time feedback if a connection issue is on the user's side or the platform's side.
- **Trust / safety:** Critical for high-stakes safety features; ensures the "SOS" pipeline is live.

### 4. Scope
- **Included:** Health checks for Database, Secrets Vault (Infisical), and API Gateway.
- **Out of scope:** Third-party API health (e.g., Google Maps, Weather) is not directly shown here.

### 5. Functional rules
- **Trigger:** Mounts on authenticated layout; polls every 60 seconds.
- **Inputs:** `GET /health` API response.
- **Outputs:** Visual pulse (Emerald/Amber/Red) and expanded status tooltip.
- **State Matrix:**
  - `loading`: Gray pulse (Syncing...)
  - `healthy`: Emerald pulse (Mission Control: Operational)
  - `degraded`: Amber pulse (System Latency Detected)
  - `offline`: Red pulse (Mission Control Offline)

### 6. UX touchpoints
- **Routes:** All authenticated routes (Fixed position).
- **Components:** `motion.button`, `lucide-react` (Activity, ShieldCheck, Database, Zap).
- **Empty / loading:** Uses `loading` state during first poll.
- **Controls:** Hover for detailed subsystem status.

### 7. Copy and content source
- **Key UI copy:** "Mission Control: Operational", "System Status".
- **Tooltips:** "Database: Primary", "Security Vault: Sealed".

### 8. Technical implementation
- **Frontend:** React functional component using `framer-motion` for pulse/ping animations.
- **Infrastructure:** Direct ping to `/health` endpoint every 60s.
- **Security:** Endpoint returns non-privileged payload: `{ status: 'ok', subsystems: { db: true, vault: true } }`.
- **Dependencies:** `authStore`, `api` wrapper.

### 9. Security
- **Middleware:** None (client-side display), but `/health` endpoint is usually public or lightweight.

### 10. Edge cases and failure handling
- **Failure mode:** Network loss transition to `offline` state immediately.
- **Degraded DB:** API returns `status: 'degraded'` if DB connection is intermittent.

### 11. Acceptance criteria
- [ ] Pulse is emerald and pinging when system is nominal.
- [ ] Hover displays specific status for DB, Secrets, and API.
- [ ] Component hidden for unauthenticated users.

---

## SC-C07 Component — SubscriptionBanner

### 1. Overview
- **Type:** Dashboard Component (Retention/Notification)
- **Primary purpose:** Alert users to expiring premium trials or subscriptions.
- **Owner:** Growth / Revenue
- **Status:** Production-Ready

### 2. Product role
- **Why this exists:** To prevent service interruption for premium features (AI Atlas, Safety Check-ins).
- **What product problem it solves:** Lack of visibility into billing cycles.
- **What it should never do:** Nag users whose subscriptions are healthy (>7 days left).

### 3. User outcomes
- **Primary user value:** Clear warning to prevent losing access to travel data.
- **Business considerations:** Key driver for subscription renewals.

### 4. Scope
- **Included:** Threshold check (7 days), diff calculation, CTA to settings.

### 5. Functional rules
- **Trigger:** Only shows if `user.is_premium` and `premium_expires_at` is <= 7 days away.
- **Logic:** `Math.ceil((expiry - now) / 86400000)`.

### 6. UX touchpoints
- **Routes:** Dashboard.
- **Animations:** Framer motion `height` expansion on mount.
- **Components:** `Zap`, `AlertTriangle`.

### 7. Copy and content source
- **Key UI copy:** "Your Premium access is ending soon", "Only X days left".

### 8. Technical implementation
- **Frontend:** Pure UI component consuming `authStore`.
- **Logic:** `Math.ceil((expiry - now) / 86400000) <= 7`.
- **Prop Interface:** Consumes `authStore.user`.

### 9. Security
- **Data Source:** Sensitive expiry date came from JWT/Auth context.

---

## SC-C08 Component — CookieConsent

### 1. Overview
- **Type:** Global System Component (Compliance)
- **Primary purpose:** Manage user privacy choices and GDPR/CCPA compliance.
- **Owner:** Legal / Core Platform
- **Status:** Production-Ready

### 2. Product role
- **Why this exists:** Legislative requirement and user trust builder.
- **What product problem it solves:** Informed consent for non-essential tracking.
- **What it should never do:** Block critical safety features or re-appear after consent.

### 3. User outcomes
- **Primary user value:** Control over their "digital footprint".
- **Trust / safety:** Highlights that SoloCompass "never sells location history".

### 4. Scope
- **Included:** Categorized consent (Essential, Analytics, Marketing), custom preferences modal.

### 5. Functional rules
- **Persistence:** `localStorage` keys `cookie-consent` and `cookie-preferences`.
- **Logic:** `Essential` is hard-coded to `true`.

### 6. UX touchpoints
- **Routes:** Global (all pages until dismissed).
- **Empty / loading:** Hidden if consent exists.
- **Controls:** "Customize", "Essential Only", "Accept All".

### 7. Copy and content source
- **Key UI copy:** "Privacy & Intel Shield", "We never sell your location history."
- **Policy Link:** `/cookies`.

### 8. Technical implementation
- **Frontend:** React with local state for modal; `Link` from `react-router-dom`.
- **Data model:** `{ essential: bool, analytics: bool, marketing: bool }`.

---

## SC-C09 Component — FeatureGate

### 1. Overview
- **Type:** Utility Component (Release Management)
- **Primary purpose:** Control visibility of WIP features and manage beta rollouts.
- **Owner:** Product Management
- **Status:** Internal Tooling

### 2. Product role
- **Why this exists:** To allow shipping code for testing without exposing a broken UX to users.
- **What product problem it solves:** Versioning "noise" and premature feature complaints.
- **What it should never do:** Leak sensitive logic or data within the hidden children.

### 3. Functional rules
- **Trigger:** Configuration lookup in `config/features.js`.
- **Override:** `adminPreview` prop bypasses gates.
- **Visual:** Blurs and overlays "Coming Soon" if disabled.

### 4. Technical implementation
- **Frontend:** Wrapper component (HOC-like).
- **Config:** Uses `FEATURES` and `FEATURE_LABELS` constants.

---

## SC-C10 Component — DestinationChat

### 1. Overview
- **Type:** Feature Component (AI/Interactive)
- **Primary purpose:** Context-aware AI assistant for specific destinations.
- **Owner:** AI / Content
- **Status:** Production-Ready

### 2. Product role
- **Why this exists:** To provide instant, hyper-local safety and travel advice.
- **What product problem it solves:** The "lonely solo traveler" needing quick neighborhood validation.
- **What it should never do:** Give life-threateningly wrong medical/safety advice (disclaimer implied).

### 3. User outcomes
- **Primary user value:** 24/7 expert advice on safe areas and local scams.

### 4. Functional rules
- **Trigger:** Mounts in destination detail pages.
- **Inputs:** Destination identity, user query.
- **Outputs:** Sanitized HTML response from AI.
- **Sanitization:** Strict allowlist (`p`, `strong`, `ul`, `li`, etc.) via `DOMPurify`.

### 5. UX touchpoints
- **Components:** `Bot`, `Sparkles`, `Send`, `Loader2`.
- **Interactions:** Auto-scroll to bottom, suggested question chips.

### 6. Technical implementation
- **Backend:** `POST /destinations/:id/query`.
- **State:** Message history array (local to session).

---

## SC-C11 Component — NotificationDropdown

### 1. Overview
- **Type:** Navigation Component (Messaging)
- **Primary purpose:** Quick view of recent system and safety alerts.
- **Owner:** Core Platform
- **Status:** Production-Ready

### 2. Product role
- **Why this exists:** To ensure users don't miss time-sensitive safety check-ins or advisories.
- **What it should never do:** Fail to show urgent SOS alerts from buddies.

### 3. Functional rules
- **Polling:** Checks unread count every 30 seconds.
- **Logic:** Types mapping (e.g., `advisory` -> Warning icon).
- **Socket:** Shows emerald dot if WebSocket is connected.

### 4. UX touchpoints
- **Controls:** Individual "Mark Read", "Mark All Read", "Delete".
- **Limit:** Shows 99+ on badge.

### 5. Technical implementation
- **Hooks:** `useWebSocket`, `useEffect` (polling).
- **API:** `GET /notifications`, `PUT /notifications/:id/read`.

---

## SC-C12 Notifications (Page)

### 1. Overview
- **Type:** Feature Page
- **Primary purpose:** Comprehensive management of all user communication and alerts.
- **Status:** Production-Ready

### 2. Product role
- **What product problem it solves:** Overflowing dropdowns; need for archival view.
- **What it should never do:** Lost alerts due to pagination errors.

### 3. Functional rules
- **Filters:** "All Activity" vs "Unread".
- **Density:** 100 items per fetch.

### 4. Technical implementation
- **Route:** `/notifications`.
- **Transitions:** Framer motion `layoutId` for tab switching.

---

## SC-C13 RadarChart

### 1. Overview
- **Type:** Visual Component (Data Viz)
- **Primary purpose:** Visualise a user's "Travel DNA" / Personality scores.
- **Owner:** Product Design
- **Status:** Production-Ready

### 2. Functional rules
- **Math:** Polar coordinate calculation `x: center + r * Math.cos(angle)`.
- **Normalization:** Values scaled relative to the highest score in the set.

### 3. Technical implementation
- **Frontend:** Pure SVG rendering.
- **Math:** Polar coordinate calculation `x: center + r * Math.cos(angle)`.
- **Axes:** Cultural, Relax, Adventure, Foodie, History, Nature.

---

## SC-C14 UpcomingDashboard

### 1. Overview
- **Type:** Page/State Component (Core Dashboard)
- **Primary purpose:** The "Pre-deployment" mission control for a confirmed upcoming trip.
- **Owner:** Core Experience
- **Status:** Production-Ready

### 2. Product role
- **Why this exists:** Consolidation of prep work (packing, docs, safety) in one view.
- **What it should never do:** Clutter with live-trip tools (SOS) while still at home.

### 3. Functional rules
- **Readiness:** Computes score based on checklist, contacts, and docs.
- **Logic:** Urgency levels (High/Medium/Low) trigger different banner colors.
- **Widgets:** Draggable and hideable via `useWidgetState`.

### 4. UX touchpoints
- **Banner:** Large countdown ring with readiness percentage.
- **Prep List:** Weather, Time, Insurance, eSIM statuses.

### 5. Technical implementation
- **Sub-components:** `ChecklistCard`, `AdvisorySummaryWidget`, `SafetyStatusCard`.

---

## SC-C15 TripBuddies

### 1. Overview
- **Type:** Feature Component (Social Matching)
- **Primary purpose:** Display list of potential travel matches.
- **Status:** Beta

### 2. Functional rules
- **Matching:** Filters by destination.
- **Safety:** One-click block feature; verified avatar display logic.

### 3. Technical implementation
- **API:** `GET /matching/trips`.
- **Match Scoring:** Weighted Algorithm: Destination overlap (50%), Interest overlap (30%), Date overlap (20%).
- **State:** `showRequestModal` for connection flow.

---

## SC-C16 ReviewForm

### 1. Overview
- **Type:** Interaction Component (UGC)
- **Primary purpose:** Multi-dimensional review submission for venues.
- **Status:** Production-Ready

### 2. Functional rules
- **Validation:** Min 50 chars for content; overall rating required.
- **Tags:** Selectable preset tags + custom tag injection.

### 3. Technical implementation
- **Ratings:** 4 dimensions (Overall, Solo-Friendly, Safety, Value) stored as INT(1-5).
- **API:** `POST /reviews`.
- **Security:** Sanitizes comment body using `DOMPurify` before submission.

---

## SC-C17 Sidebar
- **Status:** Not clearly evidenced as a standalone component in supplied code. Navigation is primarily handled via `Navbar` (Desktop) and `BottomNav` (Mobile).

---

## SC-C18 BottomNav

### Overview
- **Type:** Navigation Component (Mobile)
- **Primary purpose:** Primary navigation for users on mobile devices.
- **Status:** Production-Ready

### Functional rules
- **Visibility:** Automatically hides on scroll down; reveals on scroll up (`isVisible` state).
- **Auth Boundary:** Filters items based on `isAuthenticated`. Primary CTA ("New Trip") requires login.
- **Items:** Home, Explore, New Trip (Hero), Safety, Profile.

### Technical implementation
- **Frontend:** `BottomNav.jsx` using `framer-motion` for spring transitions.
- **Styling:** `backdrop-blur-xl` and `bg-base-100/95`.

---

## SC-C19 BottomSheet
- **Status:** Not clearly evidenced as a standalone high-level component. Bottom-aligned modals like `CookieConsent` or `NotificationDropdown` fulfill related UX roles.

---

## SC-C20 Drawer
- **Status:** Not clearly evidenced. Sidebar-like functionality is handled via overlaid menus in `Navbar`.

---

## SC-C21 StatCard

### Overview
- **Type:** Information Component (Dashboard)
- **Primary purpose:** Reusable card for displaying key performance indicators (KPIs) or trip metrics.
- **Status:** Production-Ready (documented as `HeroStatusCard`)

### Functional rules
- **Input:** Accepts `metric`, `label`, `progress`, and `metadata` list.
- **Visuals:** Uses the `labelColor` palette (emerald, amber, violet, blue, slate) to indicate status urgency.

### Technical implementation
- **Frontend:** `HeroStatusCard.jsx`.
- **Prop Interface:** `{ metric, label, icon: LucideIcon, progress: number, metadata: string[] }`.
- **Logic:** Color palette picked from a hash map based on `label` category.

---

## SC-C22 EmptyState

### Overview
- **Type:** UX Utility
- **Primary purpose:** Visual representation when no data is available (e.g., no trips, no notifications).
- **Status:** Production-Ready

### Technical implementation
- **Frontend:** `EmptyState.jsx`.
- **Prop Interface:** `{ icon, title, description, actionText, onAction }`.
- **Logic:** Displays icon with subtle pulse animation.
- **Logic:** Displays a primary icon, title, description, and an optional "Action" button.

---

## SC-C23 Skeleton

### Overview
- **Type:** UX Utility (Loading)
- **Primary purpose:** Placeholder content to reduce perceived latency during API fetches.
- **Status:** Production-Ready

### Technical implementation
- **Frontend:** `Skeleton.jsx`.
- **Implementation:** USes `animate-pulse` utility with a linear-gradient shimmer.
- **Styles:** Shimmering background (`animate-pulse`) with rounded geometry.

---

## SC-C24 MultiSelect
- **Status:** Not clearly evidenced. Multi-selection logic is often handled via custom tag lists (e.g., in `ReviewForm`).

---

## SC-C25 DatePicker
- **Status:** Generally uses standard HTML `<input type="date">` with project-specific styling in forms like `NewTrip`.

---

## SC-C26 ImageGallery
- **Status:** Not clearly evidenced as a standalone component. Image display is integrated into `ReviewForm` and `DestinationDetail`.

---

## SC-C27 FileUpload
- **Status:** Evidenced in `Settings` and `TripDetail` (TripDocuments) but often uses direct API calls via `api.post` with `FormData`.

---

## SC-C28 MapView
### Technical implementation
- **Frontend:** `LeafletMap.jsx` / `GoogleMap.jsx`.
- **State:** Viewport `center` sync with Trip Store.
- **Performance:** Dynamic API script loading on mount.
- **Dependencies:** `react-leaflet`.

---

## SC-C29 MapMarker
- **Status:** Integrated directly into `MapView` logic via `createCustomIcon` in `LeafletMap.jsx`.

---

## SC-C30 FloatingActionButton
- **Status:** Partially evidenced in `AIChat` (Atlas trigger) and `BottomNav` central primary button.

---

## SC-C31 ScrollToTop
- **Status:** Managed globally via `Layout.jsx` or specialized hooks in long pages like `Destinations`.

---

## SC-C32 InfiniteScroll
- **Status:** Not clearly evidenced. Standard pagination is used for `Notifications` and `Reviews`.

---

## SC-C33 PullToRefresh
- **Status:** Not clearly evidenced in standard web views; behavior is native to mobile browsers.

---

## SC-C34 SearchBar

### Overview
- **Type:** Interactive Component (Search)
- **Primary purpose:** Full-featured place search with type filters and detail previews.
- **Status:** Production-Ready

### Functional rules
- **Inputs:** Keyword query and category dropdown (Restaurant, Hotel, etc.).
- **Views:** Supports `compact` mode (for sidebars/small cards) or Full mode (with photo previews and detail links).

### Technical implementation
- **Frontend:** `PlacesSearch.jsx`.
- **Debounce:** 300ms on keystrokes.
- **Storage:** Persists last 5 successful searches in `localStorage`.

---

## SC-C35 Filters
- **Status:** Evidenced within `PlacesSearch` (Type dropdown) and `Notifications` (Unread toggle).

---

## SC-C36 SortBy
- **Status:** Evidenced in backend logic (`ORDER BY`) but not as a stand-alone reusable UI component globally.
