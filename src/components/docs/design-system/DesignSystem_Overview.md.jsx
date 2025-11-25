# TMS.ai Design System
## UI/UX DesignOps Library v1.0

**Version:** 1.0  
**Date:** 2025-11-25  
**Status:** Active  

---

## 1. Design System Overview

### 1.1 Color Palette

#### Primary Colors (Brand)

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--primary-50` | #EEF2FF | rgb(238,242,255) | Backgrounds, hover states |
| `--primary-100` | #E0E7FF | rgb(224,231,255) | Light backgrounds |
| `--primary-200` | #C7D2FE | rgb(199,210,254) | Borders, dividers |
| `--primary-300` | #A5B4FC | rgb(165,180,252) | Icons (inactive) |
| `--primary-400` | #818CF8 | rgb(129,140,248) | Icons (active) |
| `--primary-500` | #6366F1 | rgb(99,102,241) | Primary buttons, links |
| `--primary-600` | #4F46E5 | rgb(79,70,229) | Primary button hover |
| `--primary-700` | #4338CA | rgb(67,56,202) | Active states |
| `--primary-800` | #3730A3 | rgb(55,48,163) | Text on light bg |
| `--primary-900` | #312E81 | rgb(49,46,129) | Dark accents |

#### Broker Mode Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--broker-primary` | #6366F1 | Indigo - Main brand |
| `--broker-secondary` | #8B5CF6 | Purple - Accents |
| `--broker-gradient` | linear-gradient(135deg, #6366F1, #8B5CF6) | Headers, CTAs |

#### Carrier Mode Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--carrier-primary` | #2563EB | Blue - Main brand |
| `--carrier-secondary` | #0EA5E9 | Cyan - Accents |
| `--carrier-gradient` | linear-gradient(135deg, #2563EB, #0EA5E9) | Headers, CTAs |

#### Status Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--success-500` | #10B981 | Success states, delivered |
| `--success-50` | #ECFDF5 | Success backgrounds |
| `--warning-500` | #F59E0B | Warnings, expiring |
| `--warning-50` | #FFFBEB | Warning backgrounds |
| `--error-500` | #EF4444 | Errors, critical |
| `--error-50` | #FEF2F2 | Error backgrounds |
| `--info-500` | #3B82F6 | Information |
| `--info-50` | #EFF6FF | Info backgrounds |

#### Load Status Colors

| Status | Color | Token |
|--------|-------|-------|
| Available | `#10B981` | `--status-available` |
| Tendered | `#8B5CF6` | `--status-tendered` |
| Assigned | `#3B82F6` | `--status-assigned` |
| Dispatched | `#0EA5E9` | `--status-dispatched` |
| In Transit | `#F59E0B` | `--status-in-transit` |
| Delivered | `#10B981` | `--status-delivered` |
| Invoiced | `#6366F1` | `--status-invoiced` |
| Cancelled | `#EF4444` | `--status-cancelled` |

#### Neutral Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--slate-50` | #F8FAFC | Page backgrounds |
| `--slate-100` | #F1F5F9 | Card backgrounds |
| `--slate-200` | #E2E8F0 | Borders, dividers |
| `--slate-300` | #CBD5E1 | Disabled states |
| `--slate-400` | #94A3B8 | Placeholder text |
| `--slate-500` | #64748B | Secondary text |
| `--slate-600` | #475569 | Body text |
| `--slate-700` | #334155 | Headings |
| `--slate-800` | #1E293B | Primary text |
| `--slate-900` | #0F172A | Dark backgrounds |

### 1.2 Typography

#### Font Families

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

#### Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `--text-xs` | 12px | 16px | 400 | Labels, captions |
| `--text-sm` | 14px | 20px | 400 | Body small, table cells |
| `--text-base` | 16px | 24px | 400 | Body text |
| `--text-lg` | 18px | 28px | 500 | Subheadings |
| `--text-xl` | 20px | 28px | 600 | Card titles |
| `--text-2xl` | 24px | 32px | 600 | Section headers |
| `--text-3xl` | 30px | 36px | 700 | Page titles |
| `--text-4xl` | 36px | 40px | 700 | Hero text |

#### Font Weights

| Token | Weight | Usage |
|-------|--------|-------|
| `--font-normal` | 400 | Body text |
| `--font-medium` | 500 | Labels, buttons |
| `--font-semibold` | 600 | Headings |
| `--font-bold` | 700 | Page titles, emphasis |

### 1.3 Spacing System

#### Base Unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| `--space-0` | 0px | Reset |
| `--space-1` | 4px | Tight spacing |
| `--space-2` | 8px | Icon gaps, inline |
| `--space-3` | 12px | Form element padding |
| `--space-4` | 16px | Card padding, gaps |
| `--space-5` | 20px | Section gaps |
| `--space-6` | 24px | Card padding (lg) |
| `--space-8` | 32px | Section margins |
| `--space-10` | 40px | Page sections |
| `--space-12` | 48px | Large gaps |
| `--space-16` | 64px | Page margins |

### 1.4 Grid System

#### Breakpoints

| Token | Width | Columns | Gutter |
|-------|-------|---------|--------|
| `--breakpoint-sm` | 640px | 4 | 16px |
| `--breakpoint-md` | 768px | 8 | 24px |
| `--breakpoint-lg` | 1024px | 12 | 24px |
| `--breakpoint-xl` | 1280px | 12 | 32px |
| `--breakpoint-2xl` | 1536px | 12 | 32px |

#### Container Widths

| Token | Max Width |
|-------|-----------|
| `--container-sm` | 640px |
| `--container-md` | 768px |
| `--container-lg` | 1024px |
| `--container-xl` | 1280px |
| `--container-2xl` | 1536px |
| `--container-full` | 100% |

### 1.5 Elevation / Shadow System

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | 0 1px 2px rgba(0,0,0,0.05) | Subtle elevation |
| `--shadow-md` | 0 4px 6px rgba(0,0,0,0.1) | Cards, dropdowns |
| `--shadow-lg` | 0 10px 15px rgba(0,0,0,0.1) | Modals, popovers |
| `--shadow-xl` | 0 20px 25px rgba(0,0,0,0.15) | Floating elements |
| `--shadow-2xl` | 0 25px 50px rgba(0,0,0,0.25) | Hero cards |
| `--shadow-inner` | inset 0 2px 4px rgba(0,0,0,0.05) | Pressed states |

### 1.6 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | 0px | Sharp corners |
| `--radius-sm` | 4px | Buttons, inputs |
| `--radius-md` | 8px | Cards, modals |
| `--radius-lg` | 12px | Large cards |
| `--radius-xl` | 16px | Feature cards |
| `--radius-2xl` | 24px | Hero elements |
| `--radius-full` | 9999px | Pills, avatars |

### 1.7 State Styles

#### Interactive States

| State | Opacity/Transform | Usage |
|-------|-------------------|-------|
| Default | 100% | Normal state |
| Hover | Scale 1.02, shadow increase | Mouse over |
| Active | Scale 0.98 | Click/press |
| Focus | Ring 2px primary-500 | Keyboard focus |
| Disabled | 50% opacity | Unavailable |
| Loading | Pulse animation | Processing |

#### Focus Ring

```css
--focus-ring: 0 0 0 2px var(--primary-500), 0 0 0 4px rgba(99, 102, 241, 0.3);
```

### 1.8 Iconography

#### Icon Sizes

| Token | Size | Usage |
|-------|------|-------|
| `--icon-xs` | 12px | Inline with small text |
| `--icon-sm` | 16px | Buttons, inputs |
| `--icon-md` | 20px | Navigation, cards |
| `--icon-lg` | 24px | Section headers |
| `--icon-xl` | 32px | Feature icons |
| `--icon-2xl` | 48px | Empty states |

#### Icon Library: Lucide React

```jsx
// Primary icons for TMS.ai
import { 
  Truck, Package, MapPin, FileText, DollarSign,
  Users, Shield, Radio, Navigation, BarChart3,
  Clock, CheckCircle, AlertTriangle, Search
} from 'lucide-react';
```

#### Icon Usage Guidelines

- **Stroke width:** 1.5px (default)
- **Color:** Inherit from parent or use semantic colors
- **Spacing:** 8px from adjacent text
- **Alignment:** Center vertically with text

---

## 2. Design Tokens (CSS Variables)

```css
:root {
  /* Colors */
  --color-primary: #6366F1;
  --color-primary-hover: #4F46E5;
  --color-secondary: #8B5CF6;
  
  /* Mode-specific (set via JS) */
  --mode-primary: var(--color-primary);
  --mode-gradient: linear-gradient(135deg, #6366F1, #8B5CF6);
  
  /* Semantic */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;
  
  /* Text */
  --color-text-primary: #1E293B;
  --color-text-secondary: #64748B;
  --color-text-muted: #94A3B8;
  
  /* Backgrounds */
  --color-bg-page: #F8FAFC;
  --color-bg-card: #FFFFFF;
  --color-bg-elevated: #FFFFFF;
  
  /* Borders */
  --color-border: #E2E8F0;
  --color-border-focus: #6366F1;
  
  /* Typography */
  --font-family: 'Inter', sans-serif;
  --font-size-base: 16px;
  --line-height-base: 1.5;
  
  /* Spacing */
  --spacing-unit: 4px;
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
}

/* Dark Mode */
[data-theme="dark"] {
  --color-text-primary: #F1F5F9;
  --color-text-secondary: #94A3B8;
  --color-bg-page: #0F172A;
  --color-bg-card: #1E293B;
  --color-border: #334155;
}

/* Broker Mode */
[data-mode="broker"] {
  --mode-primary: #6366F1;
  --mode-gradient: linear-gradient(135deg, #6366F1, #8B5CF6);
}

/* Carrier Mode */
[data-mode="carrier"] {
  --mode-primary: #2563EB;
  --mode-gradient: linear-gradient(135deg, #2563EB, #0EA5E9);
}
```

---

## 3. Accessibility Standards

### WCAG 2.1 AA Compliance

| Requirement | Standard | Implementation |
|-------------|----------|----------------|
| Color Contrast (Normal) | 4.5:1 minimum | All text meets ratio |
| Color Contrast (Large) | 3:1 minimum | Headings meet ratio |
| Focus Indicators | Visible | 2px ring on focus |
| Keyboard Navigation | Full support | Tab order, shortcuts |
| Screen Reader | ARIA labels | All interactive elements |
| Touch Targets | 44x44px minimum | Mobile buttons |

### Color Contrast Ratios

| Foreground | Background | Ratio | Pass |
|------------|------------|-------|------|
| slate-800 | white | 12.6:1 | ✅ AAA |
| slate-600 | white | 7.0:1 | ✅ AA |
| primary-600 | white | 4.6:1 | ✅ AA |
| white | primary-600 | 4.6:1 | ✅ AA |

---

*Next: [Component Library](./ComponentLibrary.md)*