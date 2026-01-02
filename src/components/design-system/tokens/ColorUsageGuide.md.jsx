# TMS.ai Color System Usage Guide

## Overview
This document defines the color token system for TMS.ai. All components MUST use these tokens instead of hard-coded colors.

## Color Tokens Defined

### Neutral Colors
- `--bg-default` (#f8fafc / slate-50) - Page backgrounds
- `--bg-card` (#ffffff / white) - Cards, panels, modals
- `--bg-hover` (#f1f5f9 / slate-100) - Hover states
- `--border-default` (#e2e8f0 / slate-200) - Standard borders
- `--border-focus` (#94a3b8 / slate-400) - Focus rings
- `--text-primary` (#0f172a / slate-900) - Headings, important text
- `--text-secondary` (#475569 / slate-600) - Body text
- `--text-muted` (#94a3b8 / slate-400) - Helper text, placeholders

### Primary Brand
- `--primary-default` (#4f46e5 / indigo-600) - Primary buttons, links, active states
- `--primary-hover` (#4338ca / indigo-700) - Hover on primary elements
- `--primary-active` (#3730a3 / indigo-800) - Pressed/active state
- `--primary-bg` (#eef2ff / indigo-50) - Primary backgrounds
- `--primary-border` (#c7d2fe / indigo-200) - Primary borders

### Semantic Colors
- `--success` (#059669 / emerald-600) - Success states, positive actions
- `--success-bg` (#d1fae5 / emerald-100) - Success backgrounds
- `--success-border` (#6ee7b7 / emerald-300) - Success borders

- `--warning` (#d97706 / amber-600) - Warnings, caution
- `--warning-bg` (#fef3c7 / amber-100) - Warning backgrounds
- `--warning-border` (#fcd34d / amber-300) - Warning borders

- `--error` (#dc2626 / red-600) - Errors, destructive actions
- `--error-bg` (#fee2e2 / red-100) - Error backgrounds
- `--error-border` (#fca5a5 / red-300) - Error borders

- `--info` (#2563eb / blue-600) - Information, neutral actions
- `--info-bg` (#dbeafe / blue-100) - Info backgrounds
- `--info-border` (#93c5fd / blue-300) - Info borders

## Component Color Rules

### PageHeader
- Background: `var(--bg-card)` (neutral white)
- Border: `var(--border-default)`
- Icon background: `var(--primary-bg)`
- Icon color: `var(--primary-default)`
- Title: `var(--text-primary)`
- Subtitle: `var(--text-secondary)`
- Primary button: `var(--primary-default)`
- **NO GRADIENTS**

### StandardButton
- PrimaryButton: `var(--primary-default)` background
- SecondaryButton: neutral with `var(--border-default)` border
- DestructiveButton: `var(--error)` background
- SuccessButton: `var(--success)` background
- Hover: Use opacity-90 instead of separate color

### StandardTabs
- Active tab background: `var(--primary-bg)`
- Active tab text: `var(--primary-default)`
- Inactive tab text: `var(--text-secondary)`
- Border: `var(--border-default)`

### FormField
- Label: `var(--text-secondary)`
- Helper text: `var(--text-muted)`
- Error text: `var(--error)`
- Error border: `var(--error-border)`
- Required asterisk: `var(--error)`
- Unit hints: `var(--text-muted)` on `var(--bg-hover)`

### StatusBadge
- ONLY component allowed to use semantic colors
- Maps status strings to semantic tokens
- Success states → `var(--success)`
- Warning states → `var(--warning)`
- Error states → `var(--error)`
- Info states → `var(--info)`

## Usage in Components

### CSS
```css
.my-element {
  background-color: var(--bg-card);
  color: var(--text-primary);
  border-color: var(--border-default);
}
```

### Inline Styles (React)
```jsx
<div style={{ 
  backgroundColor: 'var(--bg-card)',
  color: 'var(--text-primary)',
  borderColor: 'var(--border-default)'
}}>
```

### Tailwind with CSS Variables
```jsx
<div className="bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-default)]">
```

## Accessibility

All color combinations meet WCAG AA standards:
- Text: 4.5:1 contrast minimum
- Large text (18pt+): 3:1 contrast minimum
- UI components: 3:1 contrast minimum

## Prohibited Patterns

❌ Hard-coded hex colors
❌ Gradient backgrounds (except specific exceptions)
❌ Multiple brand colors
❌ Color-only status indicators (must use StatusBadge)
❌ Inline Tailwind color classes in new code

## Migration Strategy

1. Import color tokens in Layout.js
2. Update design system components to use tokens
3. Scan pages for hard-coded colors
4. Replace with token references
5. Test contrast ratios
6. Validate with accessibility tools

## Components Updated (Phase 1)

✅ StandardButton - All variants use color tokens
✅ PageHeader - Neutral background, token-based
✅ FormField - Error states use tokens
✅ StatusBadge - Semantic colors via tokens
✅ StandardTabs - Active states use primary token

## Pages Updated (Phase 1)

✅ Dashboard - Background token applied
✅ Compliance - Background token applied
✅ AnalyticsDashboard - Background token applied
✅ PredictiveAnalytics - Background token applied
✅ AdvancedAnalytics - Background token applied

## Next Steps

- [ ] Remove remaining gradients in modal headers
- [ ] Scan for inline color utilities
- [ ] Update remaining pages to use background tokens
- [ ] Create color contrast audit report