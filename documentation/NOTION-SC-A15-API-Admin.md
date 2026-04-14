# SC-A15: API — Admin

> **Last Updated:** April 2026
> **Status:** ✅ COMPLETE
> **Version:** 1.0

---

## Overview

This document defines the complete API surface for the Ops Admin Command Centre. All endpoints require admin authentication unless otherwise noted.

---

## Authentication

All admin endpoints require:
- Valid JWT token with `role: 'admin'`
- Admin level in token: `admin_level` (support, moderator, super_admin)

### Middleware

```javascript
// Basic admin - all admins can access
requireAdmin

// Super admin only - sensitive operations
requireSuperAdmin

// Moderator + super admin - content management
requireModerator
```

---

## API Endpoints Summary

| Category | Count | Status |
|---------|-------|--------|
| Analytics | 1 | ✅ |
| Users | 5 | ✅ |
| Sessions | 3 | ✅ |
| Destinations | 4 | ✅ |
| Audit/Errors | 6 | ✅ |
| Incidents | 4 | ✅ |
| Jobs/Webhooks | 3 | ✅ |
| Safety | 2 | ✅ |
| Billing | 2 | ✅ |
| Support | 1 | ✅ |
| GDPR | 4 | ✅ |
| Notifications | 10 | ✅ |
| Bulk Actions | 1 | ✅ |
| **TOTAL** | **46** | ✅ |

---

## Detailed API Reference

### Analytics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/analytics/overview` | Get overview stats | requireAdmin |

**Query Parameters:**
- `period`: Time range (7d, 30d, 90d, custom)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "activeUsers": 89,
    "totalTrips": 234,
    "totalDestinations": 45
  }
}
```

---

### Users Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/users` | List users (paginated) | requireAdmin |
| GET | `/admin/users/:id/export` | Export user data (JSON) | requireAdmin |
| POST | `/admin/users/:id/anonymize` | Anonymize user data | requireSuperAdmin |
| POST | `/admin/users/:id/override` | Override user state | requireAdmin |
| PATCH | `/admin/users/:id/role` | Update admin role | requireSuperAdmin |

**GET /admin/users Query Parameters:**
- `search`: Search email/name
- `role`: Filter by role
- `limit`: Page size (default 50)
- `offset`: Pagination offset
- `include_deleted`: Include soft-deleted users

---

### Sessions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/sessions` | List active sessions | requireAdmin |
| POST | `/admin/sessions/:id/terminate` | Terminate single session | requireAdmin |
| POST | `/admin/sessions/user/:userId/terminate-all` | Terminate all user sessions | requireAdmin |

---

### Destinations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/moderation/destinations` | List destinations for moderation | requireModerator |
| POST | `/admin/moderation/destinations/:id/approve` | Approve destination | requireModerator |
| POST | `/admin/moderation/destinations/:id/reject` | Reject destination | requireModerator |
| GET | `/admin/destinations/export` | Export destinations (CSV) | requireAdmin |

---

### Audit & Errors

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/audit-logs` | Get audit logs | requireAdmin |
| POST | `/admin/errors/:id/dismiss` | Dismiss error | requireAdmin |
| POST | `/admin/errors/:id/restore` | Restore error | requireAdmin |
| POST | `/admin/errors/bulk-dismiss` | Bulk dismiss errors | requireAdmin |
| POST | `/admin/errors/bulk-restore` | Bulk restore errors | requireAdmin |
| GET | `/admin/user-activity/:userId` | Get user activity timeline | requireAdmin |

**GET /admin/audit-logs Query Parameters:**
- `type`: Event type filter
- `days`: Date range (default 30)
- `dismissed`: Filter by dismissed status (true/false)
- `limit`: Page size
- `offset`: Pagination offset

---

### Incidents

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/incidents` | List incidents | requireAdmin |
| POST | `/admin/incidents` | Create incident | requireAdmin |
| POST | `/admin/incidents/:id/acknowledge` | Acknowledge incident | requireAdmin |
| POST | `/admin/incidents/:id/resolve` | Resolve incident | requireAdmin |

**Incident Severity Levels:**
- `info` - Informational
- `warning` - Minor issue
- `degraded` - Partial service impact
- `major` - Significant disruption
- `critical` - Complete outage

**Incident Status:**
- `active` - Newly created
- `acknowledged` - Being worked on
- `resolved` - Fixed

---

### Jobs & Webhooks

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/jobs/failed` | List failed jobs | requireAdmin |
| POST | `/admin/jobs/:id/retry` | Retry failed job | requireAdmin |
| GET | `/admin/webhooks/failures` | List webhook failures | requireAdmin |

---

### Safety Operations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/safety/events` | List safety events | requireAdmin |
| GET | `/admin/safety/escalations` | List check-in escalations | requireAdmin |
| POST | `/admin/check-ins/:id/override` | Override check-in status | requireAdmin |

**Check-in Override Actions:**
- `completed` - Mark as completed
- `missed` - Mark as missed
- `skipped` - Skip this check-in

---

### Billing

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/billing/failures` | List payment failures | requireSuperAdmin |
| GET | `/admin/billing/activity` | List billing events | requireSuperAdmin |

---

### Support

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/support/tickets` | List support events/tickets | requireAdmin |

---

### GDPR & Privacy

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/gdpr/audit-log` | View GDPR audit log | requireAdmin |
| GET | `/admin/gdpr/retention` | Get retention policies | requireAdmin |
| POST | `/admin/gdpr/retention` | Update retention policies | requireSuperAdmin |
| POST | `/admin/users/:id/anonymize` | Anonymize user data | requireSuperAdmin |

---

### Notifications

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/emails/templates` | List email templates | requireAdmin |
| GET | `/admin/emails/preview/:type` | Preview email | requireAdmin |
| POST | `/admin/emails/test` | Send test email | requireAdmin |
| GET | `/admin/notifications/templates` | List notification templates | requireAdmin |
| GET | `/admin/notifications/templates/:id` | Get template | requireAdmin |
| PUT | `/admin/notifications/templates/:id` | Update template | requireAdmin |
| POST | `/admin/notifications/templates/test` | Test template | requireAdmin |
| GET | `/admin/notifications/types` | List notification types | requireAdmin |
| GET | `/admin/notifications/delivery-logs` | View delivery logs | requireAdmin |
| POST | `/admin/notifications/test` | Send test notification | requireAdmin |

---

### Bulk Operations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/admin/bulk-action` | Execute bulk operation | requireModerator |

**Request Body:**
```json
{
  "ids": ["uuid1", "uuid2"],
  "action": "delete_users|delete_dests|update_role|approve_dests",
  "data": { "role": "user" }
}
```

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| FORBIDDEN | 403 | Admin access required |
| INSUFFICIENT_PERMISSIONS | 403 | Higher role required |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid request data |
| INTERNAL_ERROR | 500 | Server error |

---

## Rate Limiting

Currently no rate limiting on admin endpoints (internal use only).

---

## Audit Logging

All admin actions are logged to the `events` table:
- `event_name`: Action type (e.g., `admin_role_changed`, `incident_created`)
- `event_data`: JSON with details
- `user_id`: Admin who performed action

---

## Permissions Matrix

| Action | support | moderator | super_admin |
|--------|---------|-----------|-------------|
| View data | ✅ | ✅ | ✅ |
| Create incidents | ✅ | ✅ | ✅ |
| Acknowledge/resolve | ✅ | ✅ | ✅ |
| Manage destinations | ❌ | ✅ | ✅ |
| Dismiss errors | ✅ | ✅ | ✅ |
| User soft-delete | ❌ | ❌ | ✅ |
| Anonymize users | ❌ | ❌ | ✅ |
| Modify roles | ❌ | ❌ | ✅ |
| Billing access | ❌ | ❌ | ✅ |

---

## Future Endpoints (Not Implemented)

| Endpoint | Description | Priority |
|----------|-------------|----------|
| POST /admin/communications/banner | Create site-wide banner | P3 |
| POST /admin/webhooks/:id/retry | Retry webhook delivery | P2 |
| GET /admin/entitlements | View user entitlements | P2 |
| POST /admin/entitlements/sync | Sync entitlements | P2 |

---

*Last updated: April 2026*
