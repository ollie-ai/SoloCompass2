# SC-A31 API — Affiliates Documentation

## 1. Overview
- **Type:** Revenue / Business System
- **Primary purpose:** Generation and tracking of partner referral links for travel logistics (lodging, insurance, activities).
- **Owner:** Business Development / Growth
- **Status:** **Operational**

## 2. Product Role
- **Why this exists:** To provide users with pre-vetted travel tools (like SafetyWing) while establishing sustainable revenue streams.
- **What product problem it solves:** Simplifies the discovery of essential travel services; provides "One-Click" access to partner hubs.
- **What it should never do:** Obscure the fact that links are affiliate-based; share user PII with partners without explicit consent.

## 3. User Outcomes
- **Primary user value:** Easy access to trusted travel insurance and lodging partners specialized in solo travel.
- **Secondary user value:** Integration of partner confirmations back into the SoloCompass itinerary (planned).
- **Trust / Safety:** Partners are vetted for safety reliability (e.g., insurance coverage for solo travelers).

## 4. Scope
- **Included in scope:** Tracking Link Generation, Partner Metadata, Click Telemetry, Attribution logic.
- **Out of scope:** Direct payment processing for partners; Commission payouts (handled in Partner Portal).

## 5. Functional Rules
- **Trigger conditions:** User clicks "Get Insurance" or "Find Lodging" in trip toolkits.
- **Inputs:** `partner_id`, `destination_id`, `user_id`.
- **Outputs:** Anonymized tracking URL with affiliate markers.
- **Priority rules:** Premium-tier partners are highlighted in the UI.

## 6. UX Touchpoints
- **Routes:** `/trips/:id/toolkit`, `/safety-info`.
- **Components:** `AffiliateCard.jsx`, `PartnerBanner.jsx`.
- **Patterns:** 
    - **Active:** "Safe-Travel Partner" badge shown on vetted links.

## 7. Technical Implementation
- **Frontend:** Managed via `lib/affiliates.js`.
- **Backend:** `backend/src/routes/affiliates.js`.
- **Data Model:** `partners` table (id, name, base_url, tracking_template).
- **Logic:** Templates use string replacement (e.g., `{{AFF_ID}}`) to inject keys at runtime.

## 8. Security & RBAC
- **Privacy:** `user_id` is hashed in tracking links to prevent partners from scraping internal IDs.
- **RBAC:** All users can access affiliate links.

## 9. Performance & Caching
- **Efficiency:** Partner metadata is cached for 24 hours.
- **Latency Goal:** Redirect generation < 50ms.

## 10. Observability & Monitoring
- **Metrics:** `CLICK_THROUGH_RATE`, `PARTNER_AVAILABILITY`.
- **Alert:** Notify if a high-volume partner link returns a 404.

## 11. Edge Cases & Failure Handling
- **Failure Modes:** Malformed tracking template.
- **Recovery:** Falls back to the partner's vanilla homepage if the tracking link fails validation.

## 12. Acceptance Criteria
- [x] Links include correct affiliate markers.
- [x] Click telemetry is recorded.

## 13. Changelog
- **v1.0:** Initial implementation with Booking.com and SafetyWing.

---

# SC-A32 API — Flight Status Documentation

## 1. Overview
- **Type:** Real-time Integration
- **Primary purpose:** Real-time monitoring of flight itineraries, gate changes, and delay alerts.
- **Owner:** Core Engineering
- **Status:** **Operational**

## 2. Product Role
- **Why this exists:** Flight disruptions are a major source of solo travel stress. Live tracking provides proactive reassurance.
- **What product problem it solves:** Eliminates the need to monitor airport screens or external flight apps manually.
- **What it should never do:** Provide "Guaranteed" arrival times (must always label as "Estimated").

## 3. User Outcomes
- **Primary user value:** Instant visibility into gate assignments and delay status on the dashboard.
- **Secondary user value:** Automated updates to the trip timeline if flights are rescheduled.
- **Trust / Safety:** Essential for "Last Seen" logic; if a flight is mid-air, the safety engine knows why the traveler is offline.

## 4. Scope
- **Included in scope:** Flight Lookup (ICAO/IATA), Live Status (Gate, Terminal, Delay), Arrival/Departure Tracking.
- **Out of scope:** Seat selection; Check-in functionality.

## 5. Functional Rules
- **Trigger conditions:** User adds a flight to their trip; dashboard refresh.
- **Inputs:** `flight_number`, `date`.
- **Outputs:** Live status payload.
- **Priority rules:** Live flights (currently in flight) are pinned to the top of the dashboard.
- **Dependencies:** **AviationStack API**.

## 6. UX Touchpoints
- **Routes:** `/dashboard`, `/trips/:id`.
- **Components:** `FlightCard.jsx`, `LogisticsTimeline.jsx`.
- **Patterns:** 
    - **Active:** Glowing green "Live" indicator for active flights.
    - **Error:** "Check airport boards" message if live data is stale.

## 7. Technical Implementation
- **Frontend:** Managed via `useFlights` hook.
- **Backend:** `backend/src/routes/flights.js`.
- **Caching Strategy:** **5-minute TTL** for active flights; 4 hours for scheduled future flights.
- **External Integration:** AviationStack (or FlightAware/OAG).

## 8. Security & RBAC
- **Access:** Only trip owners and authorized buddies can see flight details.
- **Data Isolation:** Flight reference numbers are encrypted in transit.

## 9. Performance & Caching
- **Efficiency:** Duplicate requests for the same flight number in a 5min window are served from Redis/DB cache.
- **Latency Goal:** < 400ms (API proxy overhead).

## 10. Observability & Monitoring
- **Metrics:** `FLIGHT_API_LATENCY`, `STALE_DATA_PERCENTAGE`.
- **Alert:** Warn if AviationStack API quota is reaching 90%.

## 11. Edge Cases & Failure Handling
- **Failure Modes:** Plane has no transponder data (unscheduled); API Provider downtime.
- **Fail-Soft:** Return the last known status with a "Live Data Offline - Showing Cached" badge.

## 12. Acceptance Criteria
- [x] Status updates reflect real airport gate changes (verified via test tail numbers).
- [x] Timezones are handled correctly via UTC conversion.

## 13. Changelog
- **April 8, 2026:** Documentation hardened for V1 Release.

---

# SC-A33 API — Budget Documentation

## 1. Overview
- **Type:** Financial System
- **Primary purpose:** Multi-currency expense tracking, budget ceiling management, and burn-rate analysis.
- **Owner:** Core Engineering
- **Status:** **Operational**

## 2. Product Role
- **Why this exists:** Financial safety is a core part of solo travel. Running out of funds in a foreign country is a safety risk.
- **What product problem it solves:** Tracks scattered expenses against a hard limit; automatically handles foreign exchange math.

## 3. User Outcomes
- **Primary user value:** Constant awareness of "remaining funds" converted into their home currency.
- **Secondary user value:** Identification of overspending patterns via category breakdown.

## 4. Scope
- **Included in scope:** Expense CRUD, Budget Setting, Currency Conversion (via A26), Burn-rate forecasting.
- **Out of scope:** Direct bank sync (V2); Shared budgets (V1 is solo-only).

## 5. Functional Rules
- **Inputs:** `amount`, `currency`, `category`, `date`, `trip_id`.
- **Outputs:** Remaining Balance, Total Spent, Daily Average.
- **Logic:** Automatic conversion of local currency entries to "Home Currency" based on the rate at the time of entry.

## 6. UX Touchpoints
- **Routes:** `/trips/:id/budget`.
- **Components:** `BudgetMeter.jsx`, `ExpenseList.jsx`, `CurrencySelector.jsx`.
- **Patterns:** 
    - **Alert:** Red progress bar when spending > 90% of budget.

## 7. Technical Implementation
- **Frontend:** `BudgetStore.js` (Zustand).
- **Backend:** `backend/src/routes/budgets.js`.
- **Data Model:** `expenses` table (`amount_local`, `amount_home`, `currency_code`, `exchange_rate_used`).

## 8. Security & RBAC
- **Financial Privacy:** Expense data is hard-locked to the `userId`.
- **RBAC:** Only the primary traveler can view/edit the budget.

## 9. Performance & Caching
- **Optimization:** Daily sums are pre-aggregated in the DB views to ensure instant chart rendering.

## 10. Observability & Monitoring
- **Metrics:** `AVG_TRIP_SPEND`, `CURRENCY_CONVERSION_LATENCY`.

## 11. Edge Cases & Failure Handling
- **Failure Modes:** Missing exchange rate for obscure currencies.
- **Recovery:** Defaults to a `1.0` rate and adds a "Manual Rate Required" flag to the entry.

## 12. Acceptance Criteria
- [x] Totals match the sum of individual converted expenses.
- [x] Adding an accommodation (A04) automatically updates the trip budget.

## 13. Changelog
- **v1.1:** Accommodation and Booking cost auto-sync added.

---

# SC-A34 API — Webhooks Documentation

## 1. Overview
- **Type:** External System Bridge
- **Primary purpose:** Processing asynchronous events from external service providers (Stripe, Twilio, Firebase).
- **Owner:** DevOps / Infrastructure
- **Status:** **Operational**

## 2. Product Role
- **Why this exists:** To ensure the system stays in sync with external actions (like payments or SMS replies) without polling.
- **What product problem it solves:** Long-wait times for subscription updates; ensures "Real-time" state across distributed services.

## 3. User Outcomes
- **Primary user value:** Instant activation of premium features after purchase.
- **Secondary user value:** Real-time confirmation of emergency contact verification.

## 4. Scope
- **Included in scope:** Stripe (Payments/Subs), Twilio (SMS Status), SendGrid/Resend (Email Bounce).
- **Out of scope:** Outbound webhook notifications (planned for B2B partners).

## 5. Functional Rules
- **Trigger:** Incoming HTTP POST from authorized provider.
- **Processing Logic:** 
    1. Validate Signature.
    2. Route to specific handler (e.g., `handleStripeEvent`).
    3. Update internal DB state.
    4. Trigger Notification (SC-A17) if required.

## 6. UX Touchpoints
- **Indirect:** Users see the result (e.g., "Subscription Active!") via subsequent UI refreshes or push alerts.

## 7. Technical Implementation
- **Endpoints:** `/api/webhooks/stripe`, `/api/webhooks/sms`.
- **Infrastructure:** Signature verification using provider SDKs (e.g., `stripe.webhooks.constructEvent`).
- **Idempotency:** Unique `event_id` tracking in `webhook_logs` to prevent double-processing.

## 8. Security & RBAC
- **Hardening:** **Raw Body Buffering** required for signature verification; IP Whitelisting for platform IPs.
- **RBAC:** Internal system-only access (public endpoints protected by cryptographic signatures).

## 9. Performance & Caching
- **Concurrency:** Uses a 200 OK "Fast Response" pattern—acknowledge receipt first, then process asynchronously via queuing.

## 10. Observability & Monitoring
- **Metrics:** `WEBHOOK_VERIFICATION_FAILURE_RATE`, `EVENT_PROCESSING_LATENCY`.
- **Alert:** Critical alert for P1 if Stripe signature validation fails consistently (Potential attack).

## 11. Edge Cases & Failure Handling
- **Failure Modes:** Signature mismatch; Invalid payload.
- **Recovery:** Logging of raw payloads for 7 days allows for manual re-processing of failed events.

## 12. Acceptance Criteria
- [x] Test webhooks successfully update the `users.subscription_tier`.
- [x] Replayed events are ignored via idempotency check.

---

# SC-A35 API — SMS Webhook Documentation

## 1. Overview
- **Type:** Safety / Interaction Bridge
- **Primary purpose:** handling inbound SMS interactions from emergency contacts and verification loops.
- **Owner:** Core Safety Team
- **Status:** **Operational**

## 2. Product Role
- **Why this exists:** emergency contacts (Guardians) need a way to confirm they are "Active" without downloading the app.
- **What product problem it solves:** Removes friction from the safety network setup.

## 3. User Outcomes
- **Primary value:** Effortless verification of the "Safe Network."
- **Secondary value:** Stopping alerts via SMS keyword (`STOP`).

## 4. Scope
- **Included in scope:** Keyword parsing (`START`, `STOP`, `YES`), OTP validation, Contact status updates.

## 5. Functional Rules
- **Trigger:** Inbound SMS to the SoloCompass Twilio number.
- **Keywords:** 
    - `YES`: Confirms Guardian status.
    - `STOP`: Opts out of all future safety alerts.
    - `HELP`: Returns automated help instructions.

## 6. UX Touchpoints
- **Indirect:** Travelers see a "Verified" badge on their emergency contact list once the guardian replies.

## 7. Technical Implementation
- **Provider:** Twilio (Messaging Webhook).
- **Backend:** `backend/src/routes/smsWebhook.js`.
- **Logic:** `TwiML` response generation for automated replies.

## 8. Security & RBAC
- **Verification:** Uses `X-Twilio-Signature` to ensure requests only originate from Twilio.
- **Isolation:** SMS origin phone numbers are matched against the `emergency_contacts` table.

## 9. Performance & Caching
- **Efficiency:** Stateless processing; updates DB and sends socket update to the traveler's UI.

## 10. Observability & Monitoring
- **Metrics:** `SMS_REPLY_RATE`, `OTP_VERIFICATION_SUCCESS_RATE`.

## 11. Edge Cases & Failure Handling
- **Failure Modes:** Guardian replies from an unlisted number.
- **Recovery:** Auto-reply asking them to register via the traveler's invite link.

## 12. Acceptance Criteria
- [x] `YES` reply updates contact status to `active` in sub-2 seconds.

---

# SC-A36 API — Translate Documentation

## 1. Overview
- **Type:** Utility System
- **Primary purpose:** On-demand AI translation for signage, local interactions, and safety warnings.
- **Owner:** Platform Engineering
- **Status:** **Operational**

## 2. Product Role
- **Why this exists:** Language barriers are a significant safety risk during emergencies or when navigating local advice.
- **What it should never do:** provide legal/contractual translations without extreme caution disclaimers.

## 3. User Outcomes
- **Primary user value:** Instant understanding of local signage and basic communication.
- **Secondary user value:** Real-time safety translation of FCDO alerts (A10) into the traveler's native language.

## 4. Scope
- **Included in scope:** Text-to-Text translation, Language Auto-detection, 50+ language support.
- **Out of scope:** OCR (Image-to-Text) - Planned V2.

## 5. Functional Rules
- **Inputs:** `text`, `target_language`.
- **Outputs:** Translated text, `detected_source_language`.
- **Priority:** High accuracy over speed (verified via multi-model consensus for safety terms).

## 6. UX Touchpoints
- **Routes:** `/safety`, `/destination/:id`.
- **Components:** `TranslateTab.jsx`, `AdvisoryCard.jsx`.
- **Patterns:** 
    - **Interactions:** "Copy to Clipboard", "Reverse Translate" (Verify accuracy).

## 7. Technical Implementation
- **Provider:** Azure AI Translator (or Google Cloud Translate).
- **Backend:** `backend/src/services/translateService.js`.
- **Data Model:** Usage tracking in `user_usage_stats` to manage quotas.

## 8. Security & RBAC
- **Privacy:** Input text is not stored on disk after translation (Transient processing).
- **RBAC:** 
    - **Explorer:** 5,000 characters/day.
    - **Navigator:** Unlimited.

## 9. Performance & Caching
- **Efficiency:** Common safety phrases (e.g., "Where is the embassy?") are cached globally.
- **Latency Goal:** < 300ms for < 1000 characters.

## 10. Observability & Monitoring
- **Metrics:** `TRANSLATE_QUEUE_DEPTH`, `CHARACTER_QUOTA_USAGE`.

## 11. Edge Cases & Failure Handling
- **Failure Modes:** Unsupported language; API Timeout.
- **Recovery:** Falls back to "Unable to translate - please use English safe-phrases" mock.

## 12. Acceptance Criteria
- [x] Language auto-detection works for major European and Asian languages.
- [x] Translation preserves Markdown formatting for itineraries.

## 13. Changelog
- **April 8, 2026:** Documentation standardized for Final Gap Audit.
