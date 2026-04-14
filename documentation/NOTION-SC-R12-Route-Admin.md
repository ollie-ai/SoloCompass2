# SC-R12: Route — Admin

> **Last Updated:** April 2026
> **Status:** ✅ COMPLETE
> **Version:** 1.0

---

## Overview

This document details all admin panel pages, routes, and UI components for the SoloCompass Ops Admin Command Centre.

---

## Page Structure

### Main Navigation

| Route | Tab Label | Component | Status |
|-------|-----------|-----------|--------|
| `/admin/dashboard` | Dashboard | AdminDashboard | ✅ |
| `/admin/destinations` | Destinations | DestinationsTable | ✅ |
| `/admin/users` | Travelers | UsersTable | ✅ |
| `/admin/analytics` | Intelligence | AdminStats | ✅ |
| `/admin/incidents` | Incidents | IncidentsSection | ✅ |
| `/admin/jobs` | Jobs & Webhooks | JobsSection | ✅ |
| `/admin/errors` | Errors | ErrorReportsSection | ✅ |
| `/admin/health` | Health | SystemHealthSection | ✅ |
| `/admin/sessions` | Sessions | SessionManagement | ✅ |
| `/admin/moderation` | Moderation | ModerationSection | ✅ |
| `/admin/gdpr` | GDPR | GDPRTools | ✅ |
| `/admin/notifications` | Notifications | NotificationTemplates | ✅ |
| `/admin/theme` | Theme | ThemeEditor | ✅ |
| `/admin/config` | Config | ConfigSection | ✅ |
| `/admin/audit` | Audit Logs | AuditLogsSection | ✅ |

---

## Page Details

### 1. Dashboard (`/admin/dashboard`)

**Purpose:** Executive overview of system status

**Features:**
- Stats overview (users, sessions, pending moderation)
- Active alerts count
- Recent activity feed
- System health status
- Quick action buttons

**API Calls (parallelized):**
- `/admin/analytics/overview?period=30d`
- `/admin/notifications/ops-alerts`
- `/reviews/admin/list`
- `/admin/audit-logs`
- `/admin/system-health`

---

### 2. Destinations (`/admin/destinations`)

**Purpose:** Manage travel destinations

**Features:**
- Search destinations
- Filter by status/country
- CRUD operations (Create, Read, Update, Delete)
- Bulk import CSV
- Export CSV
- Bulk actions (delete, status change)

**Components:**
- DestinationsTable.jsx
- BulkImport.jsx
- AdminDataTable.jsx

---

### 3. Travelers (`/admin/users`)

**Purpose:** Manage user accounts

**Features:**
- Search by email/name
- Filter by role
- View user details
- GDPR actions (export, anonymize)
- Session management
- Soft-delete user

**Components:**
- UsersTable.jsx
- UserActivityTimeline.jsx

---

### 4. Intelligence (`/admin/analytics`)

**Purpose:** Business analytics and reports

**Features:**
- User growth metrics
- Revenue analytics
- Trip statistics
- Custom date range picker (7d, 30d, 90d, custom)

**Components:**
- AdminStats.jsx

---

### 5. Incidents (`/admin/incidents`)

**Purpose:** Manage launch blockers and system incidents

**Features:**
- List incidents (filterable by severity/status)
- Create new incident
- Acknowledge incident
- Resolve incident with notes
- Severity levels: info, warning, degraded, major, critical

**Components:**
- IncidentsSection.jsx

**API Endpoints:**
- `GET /admin/incidents`
- `POST /admin/incidents`
- `POST /admin/incidents/:id/acknowledge`
- `POST /admin/incidents/:id/resolve`

---

### 6. Jobs & Webhooks (`/admin/jobs`)

**Purpose:** Monitor failed background jobs and webhooks

**Features:**
- List failed jobs
- Retry individual jobs
- View webhook failures
- Filter by job type

**Components:**
- JobsSection.jsx

**API Endpoints:**
- `GET /admin/jobs/failed`
- `POST /admin/jobs/:id/retry`
- `GET /admin/webhooks/failures`

---

### 7. Errors (`/admin/errors`)

**Purpose:** Monitor client-side errors

**Features:**
- List client errors (last 7/30 days)
- Filter by dismissed status
- Dismiss individual errors
- Bulk dismiss/restore
- View error details

**Components:**
- ErrorReportsSection.jsx

**API Endpoints:**
- `GET /admin/audit-logs?type=client_error`
- `POST /admin/errors/:id/dismiss`
- `POST /admin/errors/:id/restore`
- `POST /admin/errors/bulk-dismiss`
- `POST /admin/errors/bulk-restore`

---

### 8. Health (`/admin/health`)

**Purpose:** Monitor system service health

**Features:**
- Database connectivity
- AI service status
- Stripe status
- Email provider (Resend) status
- FCDO data status
- Geoapify status

**Components:**
- SystemHealthSection.jsx

---

### 9. Sessions (`/admin/sessions`)

**Purpose:** Manage active user sessions

**Features:**
- List active sessions
- Terminate individual session
- Terminate all user sessions

**API Endpoints:**
- `GET /admin/sessions`
- `POST /admin/sessions/:id/terminate`
- `POST /admin/sessions/user/:userId/terminate-all`

---

### 10. Moderation (`/admin/moderation`)

**Purpose:** Content moderation queue

**Features:**
- List pending destinations
- Approve content
- Reject content

**API Endpoints:**
- `GET /admin/moderation/destinations`
- `POST /admin/moderation/destinations/:id/approve`
- `POST /admin/moderation/destinations/:id/reject`

---

### 11. GDPR (`/admin/gdpr`)

**Purpose:** Privacy and data compliance

**Features:**
- View GDPR audit log
- Export user data (JSON)
- Anonymize user data
- Set data retention policies

**API Endpoints:**
- `GET /admin/gdpr/audit-log`
- `GET /admin/gdpr/retention`
- `POST /admin/gdpr/retention`
- `GET /admin/users/:id/export`
- `POST /admin/users/:id/anonymize`

---

### 12. Notifications (`/admin/notifications`)

**Purpose:** Manage notification systems

**Features:**
- Email template management
- Preview emails
- Send test emails

**API Endpoints:**
- `GET /admin/emails/templates`
- `GET /admin/emails/preview/:type`
- `POST /admin/emails/test`
- `GET /admin/notifications/templates`
- `PUT /admin/notifications/templates/:id`

---

### 13. Theme (`/admin/theme`)

**Purpose:** Customize application appearance

**Features:**
- Edit DaisyUI theme
- Preview changes
- Reset to defaults

**Components:**
- ThemeEditor.jsx

---

### 14. Config (`/admin/config`)

**Purpose:** Feature flags and integrations

**Features:**
- Toggle features on/off
- View integration status

**Components:**
- ConfigSection.jsx

---

### 15. Audit Logs (`/admin/audit`)

**Purpose:** System audit trail

**Features:**
- Search audit logs
- Filter by event type
- Filter by date range
- View event details

**API Endpoints:**
- `GET /admin/audit-logs`

---

## RBAC Integration

### Role-Based Page Access

| Page | support | moderator | super_admin |
|------|---------|-----------|-------------|
| Dashboard | ✅ | ✅ | ✅ |
| Destinations | ❌ | ✅ | ✅ |
| Travelers | ✅ | ✅ | ✅ |
| Intelligence | ✅ | ✅ | ✅ |
| Incidents | ✅ | ✅ | ✅ |
| Jobs | ✅ | ✅ | ✅ |
| Errors | ❌ | ✅ | ✅ |
| Health | ✅ | ✅ | ✅ |
| Sessions | ✅ | ✅ | ✅ |
| Moderation | ❌ | ✅ | ✅ |
| GDPR | ❌ | ✅ | ✅ |
| Notifications | ❌ | ✅ | ✅ |
| Theme | ❌ | ✅ | ✅ |
| Config | ❌ | ❌ | ✅ |
| Audit Logs | ✅ | ✅ | ✅ |

---

## Component Library

### Reusable Admin Components

| Component | Purpose |
|-----------|---------|
| AdminDataTable | Paginated data table with search, filter, bulk actions |
| AdminModal | Reusable modal dialog |
| AdminSidebar | Navigation sidebar |
| AdminHeader | Page header with actions |
| Button | Styled button variants |

---

## Performance Notes

- All dashboard API calls are parallelized using `Promise.all`
- Database indexes on frequently queried columns
- Pagination on all list endpoints
- Components use eager loading for faster tab switching

---

*Last updated: April 2026*
