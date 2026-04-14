# SoloCompass Design & UI Audit Prompt

## Objective
Scan the SoloCompass frontend codebase (React components, Tailwind CSS, styling) and identify design issues, CSS inconsistencies, layout problems, and poor coding practices that affect the user experience and visual quality.

## Context
This is a solo travel safety and planning application with a modern React + Tailwind CSS interface. The design should be:
- Consistent across all pages
- Professional and polished
- Accessible and responsive
- Following best practices

## Instructions for Claude

### Step 1: Analyze CSS Architecture
Examine how styles are organized:
- Tailwind configuration (`tailwind.config.js`)
- Global styles and CSS files
- Component-level styling approach
- Design system/token usage

### Step 2: Scan for Design Inconsistencies
Look across ALL frontend components for:
- **Color inconsistencies** - Different shades of same color, mismatched brand colors, hardcoded hex values instead of design tokens
- **Typography inconsistencies** - Inconsistent font sizes, weights, line-heights across pages
- **Spacing inconsistencies** - Random margins/padding that don't follow a grid system
- **Component style inconsistencies** - Buttons that look different, cards with different borders/shadows
- **Icon inconsistencies** - Mixed icon libraries (Lucide, Phosphor, etc.) without clear rationale

### Step 3: Identify Layout Issues
Check for:
- **Responsive problems** - Not mobile-friendly, broken at different screen sizes
- **Alignment issues** - Elements not properly aligned, inconsistent centering
- **Overflow problems** - Text overflow, horizontal scroll, content breaking layout
- **Z-index issues** - Modals/overlays not working properly, layered incorrectly
- **Container issues** - Inconsistent max-widths, padding that varies across pages

### Step 4: Find CSS Anti-Patterns
Look for:
- **Inline styles** - Using `style={{}}` in React components
- **Hardcoded values** - Magic numbers, pixel values that should be variables
- **Overly complex selectors** - Deep nesting, unnecessary specificity
- **Duplicate code** - Same styles repeated in multiple components
- **Unused CSS** - Classes defined but never used
- **!important abuse** - Overusing !important flags

### Step 5: Accessibility Issues
Check for:
- **Color contrast** - Text hard to read on backgrounds
- **Focus states** - No visible focus indicators for keyboard navigation
- **Missing labels** - Form inputs without labels
- **Aria issues** - Missing ARIA attributes for screen readers
- **Touch targets** - Buttons/links too small on mobile

### Step 6: UI/UX Problems
Identify:
- **Confusing layouts** - Hard to understand navigation
- **Missing visual hierarchy** - No clear primary/secondary actions
- **Inconsistent interactions** - Hover states, transitions that differ
- **Empty states** - Missing loading/empty/error states
- **Poor feedback** - No confirmation for actions, unclear success/failure

### Step 7: Code Quality Issues
Look for:
- **Prop drilling** - Passing same props through multiple layers
- **Large components** - Components doing too much, should be split
- **Duplicated markup** - Same JSX repeated in multiple places
- **Missing TypeScript** - Untyped props, any types
- **Missing error boundaries** - Components that crash whole app

## Key Files to Examine

### Styling:
- `frontend/tailwind.config.js` - Design system configuration
- `frontend/src/index.css` - Global styles
- `frontend/postcss.config.js` - CSS processing
- Any `.css` files in the project

### Components (Examine ALL):
- `frontend/src/pages/*.jsx` - All page components
- `frontend/src/components/**/*.jsx` - All UI components
- Look for: buttons, cards, forms, modals, navigation, widgets

### Layout Files:
- `frontend/src/App.jsx` - Main layout structure
- `frontend/src/layouts/` - Layout components
- `frontend/src/components/layout/*` - Header, sidebar, etc.

## Output Format

```
# DESIGN & UI AUDIT RESULTS

## CRITICAL ISSUES (Broken/missing functionality)
| Issue | Location | Description | Fix Priority |
|-------|----------|--------------|--------------|
| [Name] | [File/Component] | [Description] | HIGH |

## HIGH PRIORITY (Major visual problems)
| Issue | Location | Description | Fix Priority |
|-------|----------|--------------|--------------|
| [Name] | [File/Component] | [Description] | HIGH |

## MEDIUM PRIORITY (Inconsistencies)
| Issue | Location | Description | Fix Priority |
|-------|----------|--------------|--------------|
| [Name] | [File/Component] | [Description] | MEDIUM |

## LOW PRIORITY (Minor polish items)
| Issue | Location | Description | Fix Priority |
|-------|----------|--------------|--------------|
| [Name] | [File/Component] | [Description] | LOW |

## DESIGN SYSTEM ISSUES
- [List problems with colors, typography, spacing not following system]

## ACCESSIBILITY ISSUES
- [List accessibility problems found]

## CODE QUALITY ISSUES
- [List CSS/React anti-patterns, duplicated code, etc]

## QUICK WINS (Easy fixes with high impact)
1. [First easy fix]
2. [Second easy fix]
3. etc.

## RECOMMENDED IMPROVEMENTS (Larger effort)
1. [First improvement]
2. [Second improvement]
3. etc.
```

## Important Notes
- Be specific - cite actual file names and line numbers
- Provide concrete examples of what's wrong
- Suggest fixes where possible
- Prioritize issues that affect user experience most
- Don't just note problems - explain WHY they are problems

## Output
Create a comprehensive audit report that the development team can use to prioritize design improvements and polish the UI to a professional level.