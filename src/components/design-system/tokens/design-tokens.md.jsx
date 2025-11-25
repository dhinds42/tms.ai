# Design Tokens
## TMS.ai Visual Foundation

Design tokens are the atomic values that define the visual language of TMS.ai. They ensure consistency across all interfaces and enable rapid theming.

---

## 1. Color System

### 1.1 Primary Palette (Broker Mode)

| Token | Value | Swatch | Usage |
|-------|-------|--------|-------|
| `color.primary.50` | `#EEF2FF` | ![](https://via.placeholder.com/24/EEF2FF/EEF2FF) | Hover backgrounds |
| `color.primary.100` | `#E0E7FF` | ![](https://via.placeholder.com/24/E0E7FF/E0E7FF) | Selected states |
| `color.primary.500` | `#6366F1` | ![](https://via.placeholder.com/24/6366F1/6366F1) | **Primary buttons, links** |
| `color.primary.600` | `#4F46E5` | ![](https://via.placeholder.com/24/4F46E5/4F46E5) | Hover states |
| `color.primary.700` | `#4338CA` | ![](https://via.placeholder.com/24/4338CA/4338CA) | Active/pressed |

### 1.2 Carrier Mode Palette

| Token | Value | Swatch | Usage |
|-------|-------|--------|-------|
| `color.carrier.500` | `#3B82F6` | ![](https://via.placeholder.com/24/3B82F6/3B82F6) | Carrier accents |
| `color.carrier.600` | `#2563EB` | ![](https://via.placeholder.com/24/2563EB/2563EB) | **Carrier primary** |
| `color.carrier.700` | `#1D4ED8` | ![](https://via.placeholder.com/24/1D4ED8/1D4ED8) | Carrier hover |

### 1.3 Neutral Palette

| Token | Value | Usage |
|-------|-------|-------|
| `color.neutral.0` | `#FFFFFF` | Card backgrounds |
| `color.neutral.50` | `#F8FAFC` | Page backgrounds (light) |
| `color.neutral.100` | `#F1F5F9` | Muted backgrounds |
| `color.neutral.200` | `#E2E8F0` | Borders, dividers |
| `color.neutral.400` | `#94A3B8` | Placeholder text |
| `color.neutral.500` | `#64748B` | Secondary text |
| `color.neutral.600` | `#475569` | Body text |
| `color.neutral.800` | `#1E293B` | Headings |
| `color.neutral.900` | `#0F172A` | Page background (dark) |

### 1.4 Semantic Colors

#### Success
```
50:  #ECFDF5  - Background
500: #10B981  - Text, icons
600: #059669  - Hover
```

#### Warning
```
50:  #FFFBEB  - Background
500: #F59E0B  - Text, icons
600: #D97706  - Hover
```

#### Danger/Error
```
50:  #FEF2F2  - Background
500: #EF4444  - Text, icons
600: #DC2626  - Hover
```

#### Info
```
50:  #EFF6FF  - Background
500: #3B82F6  - Text, icons
600: #2563EB  - Hover
```

### 1.5 Load Status Colors

| Status | Color | Token |
|--------|-------|-------|
| Available | `#10B981` | `color.status.available` |
| Tendered | `#8B5CF6` | `color.status.tendered` |
| Assigned | `#3B82F6` | `color.status.assigned` |
| Dispatched | `#0EA5E9` | `color.status.dispatched` |
| Picked Up | `#F59E0B` | `color.status.pickedUp` |
| In Transit | `#F97316` | `color.status.inTransit` |
| Delivered | `#10B981` | `color.status.delivered` |
| Invoiced | `#6366F1` | `color.status.invoiced` |
| Cancelled | `#EF4444` | `color.status.cancelled` |

---

## 2. Typography

### 2.1 Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `typography.fontFamily.sans` | `'Inter', system-ui, sans-serif` | All UI text |
| `typography.fontFamily.mono` | `'JetBrains Mono', monospace` | Code, IDs, numbers |

### 2.2 Font Sizes

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `typography.fontSize.xs` | 12px | 16px | Labels, captions, metadata |
| `typography.fontSize.sm` | 14px | 20px | Body small, table cells |
| `typography.fontSize.base` | 16px | 24px | Body text (default) |
| `typography.fontSize.lg` | 18px | 28px | Subheadings |
| `typography.fontSize.xl` | 20px | 28px | Card titles |
| `typography.fontSize.2xl` | 24px | 32px | Section headers |
| `typography.fontSize.3xl` | 30px | 36px | Page titles |
| `typography.fontSize.4xl` | 36px | 40px | Hero text, KPIs |

### 2.3 Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `typography.fontWeight.normal` | 400 | Body text |
| `typography.fontWeight.medium` | 500 | Labels, buttons |
| `typography.fontWeight.semibold` | 600 | Headings |
| `typography.fontWeight.bold` | 700 | Emphasis, page titles |

### 2.4 Type Scale Examples

```css
/* Page Title */
.page-title {
  font-size: 30px;
  font-weight: 700;
  line-height: 36px;
  color: var(--color-text-primary);
}

/* Section Header */
.section-header {
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
}

/* Body Text */
.body {
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

/* Caption */
.caption {
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: var(--color-text-muted);
}
```

---

## 3. Spacing

Base unit: **4px**

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `spacing.1` | 0.25rem | 4px | Tight gaps |
| `spacing.2` | 0.5rem | 8px | Icon-to-text, inline elements |
| `spacing.3` | 0.75rem | 12px | Form element padding |
| `spacing.4` | 1rem | 16px | Card padding, standard gaps |
| `spacing.5` | 1.25rem | 20px | Section gaps |
| `spacing.6` | 1.5rem | 24px | Large card padding |
| `spacing.8` | 2rem | 32px | Section margins |
| `spacing.10` | 2.5rem | 40px | Page sections |
| `spacing.12` | 3rem | 48px | Large gaps |
| `spacing.16` | 4rem | 64px | Page margins |

### Spacing Scale Visualization

```
spacing.1  ████
spacing.2  ████████
spacing.3  ████████████
spacing.4  ████████████████
spacing.6  ████████████████████████
spacing.8  ████████████████████████████████
```

---

## 4. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius.none` | 0 | Sharp corners |
| `radius.sm` | 2px | Subtle rounding |
| `radius.default` | 4px | Inputs, small buttons |
| `radius.md` | 6px | Buttons |
| `radius.lg` | 8px | Cards, modals |
| `radius.xl` | 12px | Large cards |
| `radius.2xl` | 16px | Feature sections |
| `radius.full` | 9999px | Pills, avatars |

---

## 5. Shadows / Elevation

| Token | Value | Usage |
|-------|-------|-------|
| `shadow.none` | none | Flat elements |
| `shadow.sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `shadow.default` | `0 1px 3px rgba(0,0,0,0.1)` | Default cards |
| `shadow.md` | `0 4px 6px rgba(0,0,0,0.1)` | Elevated cards |
| `shadow.lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, popovers |
| `shadow.xl` | `0 20px 25px rgba(0,0,0,0.15)` | Floating elements |
| `shadow.2xl` | `0 25px 50px rgba(0,0,0,0.25)` | Hero cards |

### Colored Shadows

```css
/* Primary glow for important cards */
box-shadow: 0 10px 40px -10px rgba(99, 102, 241, 0.3);

/* Success glow for delivered loads */
box-shadow: 0 10px 40px -10px rgba(16, 185, 129, 0.3);
```

---

## 6. Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `zIndex.base` | 0 | Default stacking |
| `zIndex.docked` | 10 | Sticky elements |
| `zIndex.dropdown` | 1000 | Dropdown menus |
| `zIndex.sticky` | 1100 | Sticky headers |
| `zIndex.overlay` | 1300 | Modal backdrops |
| `zIndex.modal` | 1400 | Modal dialogs |
| `zIndex.popover` | 1500 | Popovers |
| `zIndex.toast` | 1700 | Toast notifications |
| `zIndex.tooltip` | 1800 | Tooltips (top) |

---

## 7. Breakpoints

| Token | Value | Description |
|-------|-------|-------------|
| `breakpoints.xs` | 320px | Small phones |
| `breakpoints.sm` | 640px | Large phones |
| `breakpoints.md` | 768px | Tablets |
| `breakpoints.lg` | 1024px | Small laptops |
| `breakpoints.xl` | 1280px | Desktops |
| `breakpoints.2xl` | 1536px | Large screens |

### Media Query Usage

```css
/* Mobile first approach */
.component {
  padding: 16px;
}

@media (min-width: 768px) {
  .component {
    padding: 24px;
  }
}

@media (min-width: 1280px) {
  .component {
    padding: 32px;
  }
}
```

---

## 8. State Styles

### Interactive States

| State | Transformation | Usage |
|-------|----------------|-------|
| Default | — | Normal state |
| Hover | `opacity: 0.9`, `scale: 1.02` | Mouse over |
| Active | `scale: 0.98` | Click/press |
| Focus | `ring: 2px solid primary-500` | Keyboard focus |
| Disabled | `opacity: 0.5` | Unavailable |

### Focus Ring

```css
/* Standard focus ring */
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-bg-surface),
              0 0 0 4px var(--color-primary-500);
}
```

---

## 9. Theme Tokens

### Light Theme

```css
:root {
  --color-bg-page: #F8FAFC;
  --color-bg-surface: #FFFFFF;
  --color-text-primary: #1E293B;
  --color-text-secondary: #64748B;
  --color-border-default: #E2E8F0;
}
```

### Dark Theme

```css
[data-theme="dark"] {
  --color-bg-page: #0F172A;
  --color-bg-surface: #1E293B;
  --color-text-primary: #F1F5F9;
  --color-text-secondary: #94A3B8;
  --color-border-default: #334155;
}
```

---

## 10. Token Usage Examples

### Button Styling

```jsx
<Button
  style={{
    backgroundColor: tokens.color.primary[500],
    color: tokens.color.neutral[0],
    padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
    borderRadius: tokens.radius.lg,
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
  }}
>
  Create Load
</Button>
```

### Card Styling

```jsx
<Card
  style={{
    backgroundColor: tokens.color.neutral[0],
    borderRadius: tokens.radius.xl,
    padding: tokens.spacing[6],
    boxShadow: tokens.shadow.md,
  }}
>
  {children}
</Card>
```

---

*See [tokens.ts](./tokens.ts) for machine-readable definitions.*