# SoloCompass Codebase Feature Audit Prompt

## Objective
Scan the SoloCompass codebase (backend API routes + frontend React components) and identify features, endpoints, and functionality that exist in the backend but are either:
1. Not exposed in the frontend UI
2. Missing from navigation/menus
3. Not accessible to users even though the backend supports them

## Context
This is a solo travel safety and planning application with features including:
- Trip planning and itineraries
- Safety tools (check-ins, SOS, advisories)
- Travel buddy matching
- AI-powered features
- Reviews and destinations
- Packing lists
- Emergency contacts
- Budget tracking
- And more

## Instructions for Claude

### Step 1: Analyze Backend API Routes
Scan ALL files in `backend/src/routes/` and `backend/src/services/` to catalog every API endpoint, service function, and feature. Create a comprehensive list of:
- All HTTP endpoints (GET, POST, PUT, DELETE)
- Each endpoint's purpose and what data it returns
- Any middleware requirements (auth, features, limits)

### Step 2: Analyze Frontend Components & Pages
Scan `frontend/src/pages/`, `frontend/src/components/`, and `frontend/src/stores/` to identify:
- What pages/routes exist in the UI
- What API calls are being made
- What features are exposed in the interface
- Navigation structure and menus

### Step 3: Cross-Reference & Identify Gaps
For each backend endpoint, determine:
- Is there a corresponding frontend component/page?
- Is it accessible from navigation?
- Is it reachable through user flows?
- Or is it hidden/unreachable despite being functional?

### Step 4: Categorize Findings

For each gap found, categorize it as:
- **A (Fully Missing)** - Backend exists, no frontend at all
- **B (Partially Implemented)** - Some UI exists but incomplete
- **C (Hard to Find)** - UI exists but not in navigation or confusing
- **D (Behind Feature Flag)** - Implementation complete but disabled

### Step 5: Output Format

Provide a detailed report in this structure:

```
# FEATURE AUDIT RESULTS

## CRITICAL GAPS (User can't access core features)
| Feature | Backend Status | Frontend Status | Location |
|---------|---------------|-----------------|----------|
| [Name] | ✅ /api/feature works | ❌ Not in UI | - |

## HIGH PRIORITY (Important but hidden)
| Feature | Backend Status | Frontend Status | Location |
|---------|---------------|-----------------|----------|
| [Name] | ✅ /api/feature works | ⚠️ UI exists but hard to find | [Where] |

## MEDIUM PRIORITY (Nice to have but missing)
| Feature | Backend Status | Frontend Status | Location |
|---------|---------------|-----------------|----------|
| [Name] | ✅ /api/feature works | ⚠️ Partial UI | [Where] |

## LOW PRIORITY (Edge cases)
[Same format]

## RECOMMENDATIONS
Priority list of what to build/connect in the UI:
1. [Most important gap]
2. [Second most important]
3. etc.
```

## Key Files to Examine

### Backend Routes (Look at ALL of these):
- `backend/src/routes/auth.js` - Auth endpoints
- `backend/src/routes/trips.js` - Trip management
- `backend/src/routes/checkin.js` - Check-in system
- `backend/src/routes/safety.js` - Safety features
- `backend/src/routes/matching.js` - Buddy matching
- `backend/src/routes/ai.js` - AI features
- `backend/src/routes/destinations.js` - Destinations
- `backend/src/routes/reviews.js` - Reviews
- `backend/src/routes/packingLists.js` - Packing lists
- `backend/src/routes/admin.js` - Admin features
- And ALL other route files

### Frontend Pages (Look at ALL of these):
- `frontend/src/pages/*.jsx` - All page components
- `frontend/src/components/**/*` - All UI components
- `frontend/src/stores/*.js` - State management
- `frontend/src/lib/api.js` - API calls being made
- `frontend/src/App.jsx` - Route configuration

## Important Notes
- Focus on FEATURES, not just endpoints - look for the user's perspective
- Consider: "If a user wanted to do X, could they find it in the UI?"
- Note any admin-only features that regular users can't access
- Include features that might be behind incomplete UI flows

## Output
Create a comprehensive report that the development team can use to prioritize UI work and ensure all backend capabilities are accessible to users.