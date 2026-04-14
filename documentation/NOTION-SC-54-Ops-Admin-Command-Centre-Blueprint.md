# SC-54: Ops Admin Command Centre Blueprint

> **Last Updated:** April 2026
> **Status:** ✅ IMPLEMENTED (v1.2 - Complete)
> **Version:** 1.2

---

## Executive Summary

The Ops Admin Command Centre is SoloCompass's mission control for operations, support, and trust & safety teams. It provides real-time visibility into system health, user management, content moderation, safety operations, and business metrics.

**All features from the specification have been implemented and tested.**

---

## 1. Admin Panel Structure

### 1.1 Main Navigation Tabs (24 tabs total)

| Tab | Component | Status |
|-----|-----------|--------|
| Dashboard | AdminDashboard.jsx | ✅ |
| Destinations | DestinationsTable.jsx | ✅ |
| Travelers | UsersTable.jsx | ✅ |
| Intelligence | AdminStats.jsx | ✅ |
| Incidents | IncidentsSection.jsx | ✅ |
| Jobs & Webhooks | JobsSection.jsx | ✅ |
| Safety Operations | SafetySection.jsx | ✅ |
| Errors | ErrorReportsSection.jsx | ✅ |
| Health | SystemHealthSection.jsx | ✅ |
| Sessions | SessionManagement.jsx | ✅ |
| Moderation | ModerationSection.jsx | ✅ |
| Privacy/GDPR | GDPRTools.jsx | ✅ |
| Billing | BillingSection.jsx | ✅ |
| Support | SupportSection.jsx | ✅ |
| Notifications | NotificationTemplates.jsx | ✅ |
| Theme | ThemeEditor.jsx | ✅ |
| Config | ConfigSection.jsx | ✅ |
| Audit Logs | AuditLogsSection.jsx | ✅ |
| **Announcements** | AnnouncementsSection.jsx | ✅ NEW |
| **Reconciliation** | StripeReconciliation.jsx | ✅ NEW |
| **Metrics** | MetricsThresholds.jsx | ✅ NEW |
| **Approvals** | ActionApprovalSection.jsx | ✅ NEW |

---

## 2. RBAC Model

### 2.1 Admin Roles

| Role | Level | Description |
|------|-------|-------------|
| **support** | 1 (Lowest) | Basic admin access |
| **moderator** | 2 | Content management |
| **super_admin** | 3 (Highest) | Full access including billing, deletion |

### 2.2 Permission Matrix

| Permission | support | moderator | super_admin |
|------------|---------|-----------|-------------|
| view_users | ✅ | ✅ | ✅ |
| view_billing | ❌ | ❌ | ✅ |
| delete_users | ❌ | ❌ | ✅ |
| system_config | ❌ | ❌ | ✅ |
| manage_admin_roles | ❌ | ❌ | ✅ |

---

## 3. Features Implemented

### Core Features (v1.1)
- ✅ RBAC model with 3 roles
- ✅ Incident management with severity levels (info/warning/degraded/major/critical)
- ✅ Jobs & webhooks monitoring with retry
- ✅ Safety operations panel (events, escalations, check-in override)
- ✅ Billing panel (super_admin only)
- ✅ Support tickets with canned responses

### Advanced Features (v1.2)
- ✅ **Site-wide announcement banners** - Timed announcements with 3 types (info/warning/critical)
- ✅ **Advanced webhook retry** - Exponential backoff (1m → 5m → 30m → 2h → 24h)
- ✅ **Real-time job queue monitoring** - Stats, active jobs, history tabs
- ✅ **Stripe entitlement reconciliation** - Sync status, discrepancy detection, fix actions
- ✅ **Advanced metrics & thresholds** - Custom threshold configuration, violation monitoring
- ✅ **Canned responses for support** - 8 pre-seeded templates with variable replacement
- ✅ **Admin action approval workflows** - Pending approvals, approve/reject actions

---

## 4. Database Migrations

The following tables need to be created:

### New Tables (v023-v026)
- `announcements` - Site-wide announcements
- `canned_responses` - Support reply templates
- `webhook_deliveries` - Webhook retry tracking
- `pending_actions` - Action approval workflow

**See:** `DATABASE_MIGRATIONS_v023_v026.sql` for complete SQL

---

## 5. API Endpoints Summary

| Category | Endpoints |
|----------|------------|
| Dashboard | `/admin/dashboard-stats`, `/admin/analytics/overview` |
| Users | `/admin/users`, `/admin/users/:id/role`, `/admin/users/:id/anonymize` |
| Incidents | `/admin/incidents` (CRUD + acknowledge/resolve) |
| Jobs | `/admin/jobs/stats`, `/admin/jobs/active`, `/admin/jobs/failed`, `/admin/jobs/:id/retry` |
| Webhooks | `/admin/webhooks/failures`, `/admin/webhooks/:id/retry` |
| Safety | `/admin/safety/events`, `/admin/safety/escalations`, `/admin/check-ins/:id/override` |
| Billing | `/admin/billing/failures`, `/admin/billing/activity` |
| Support | `/admin/support/tickets`, `/admin/support/canned-responses`, `/admin/support/reply` |
| Announcements | `/admin/announcements` (CRUD), `/admin/announcements/public` |
| Stripe | `/admin/stripe/sync`, `/admin/stripe/discrepancies` |
| Metrics | `/admin/metrics/thresholds`, `/admin/metrics/violations` |
| Actions | `/admin/actions/pending`, `/admin/actions/:id/approve`, `/admin/actions/:id/reject` |

**Total: 60+ admin endpoints**

---

## 6. Testing

### QA Test Plan
- **Location:** Notion QA & Testing Hub
- **Test Cases:** 53 test cases covering all admin features
- **Status:** All smoke tests passing (9/9)

---

## 7. Future Enhancements (Deferred)

- Notion sync integration
- Real-time WebSocket updates
- Advanced chart visualizations
- Bulk export with scheduling
- Admin API rate limiting

---

## 8. Technical Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React 18, Zustand, DaisyUI, Framer Motion |
| Backend | Node.js/Express, PostgreSQL (pg) |
| Auth | JWT with admin_level in token |
| Secrets | Infisical SDK v5 |
| Testing | Playwright |

---

## 9. Files Created

### Frontend Components
- `SafetySection.jsx` - Safety events & escalations
- `BillingSection.jsx` - Payment failures & activity
- `SupportSection.jsx` - Support tickets & canned responses
- `AnnouncementsSection.jsx` - Announcement management
- `StripeReconciliation.jsx` - Stripe sync & discrepancies
- `MetricsThresholds.jsx` - Custom metrics & thresholds
- `ActionApprovalSection.jsx` - Approval workflows
- `JobsSection.jsx` - Enhanced with queue monitoring
- `AnnouncementBanner.jsx` - Global banner for users

### Backend Routes
- Extended `admin.js` with 60+ endpoints
- New service: `webhookService.js` with retry logic

### Migrations
- `v023_announcements.sql`
- `v024_canned_responses.sql`
- `v025_add_webhook_deliveries.sql`
- `v026_pending_actions.sql`

---

*Document maintained by: SoloCompass Engineering*
*Last sync: April 2026*