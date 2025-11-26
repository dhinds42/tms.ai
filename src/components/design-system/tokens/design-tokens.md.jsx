# TMS.ai Design Tokens

Complete reference for all design tokens used in the TMS.ai design system.

---

## Color Tokens

### Brand Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-brand-primary` | `#2257FF` | Primary actions, links, focus states |
| `--color-brand-primary-soft` | `#E5EDFF` | Soft backgrounds, hover states |
| `--color-brand-secondary` | `#0BA5E9` | Secondary accent, carrier theme |

### Role Accent Colors

| Token | Value | Role |
|-------|-------|------|
| `--color-role-broker-accent` | `#2257FF` | Broker portal |
| `--color-role-carrier-accent` | `#0BA5E9` | Carrier portal |
| `--color-role-driver-accent` | `#10B981` | Driver app |
| `--color-role-customer-accent` | `#8B5CF6` | Customer portal |
| `--color-role-owner-operator-accent` | `#F59E0B` | Owner-operator portal |

### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-success` | `#16A34A` | Success states, delivered |
| `--color-success-soft` | `#DCFCE7` | Success backgrounds |
| `--color-warning` | `#F59E0B` | Warnings, expiring items |
| `--color-warning-soft` | `#FEF3C7` | Warning backgrounds |
| `--color-danger` | `#DC2626` | Errors, exceptions, cancelled |
| `--color-danger-soft` | `#FEE2E2` | Danger backgrounds |
| `--color-info` | `#0BA5E9` | Information, in-transit |
| `--color-info-soft` | `#E0F2FE` | Info backgrounds |

### Neutral Scale

```css
--color-neutral-50:  #F9FAFB;  /* Lightest backgrounds */
--color-neutral-100: #F3F4F6;  /* Subtle backgrounds */
--color-neutral-200: #E5E7EB;  /* Borders, dividers */
--color-neutral-300: #D1D5DB;  /* Strong borders */
--color-neutral-400: #9CA3AF;  /* Placeholder text */
--color-neutral-500: #6B7280;  /* Muted text */
--color-neutral-600: #4B5563;  /* Secondary text */
--color-neutral-700: #374151;  /* Body text */
--color-neutral-800: #1F2933;  /* Headings */
--color-neutral-900: #111827;  /* Primary text */
```

### Background Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-app` | `#F9FAFB` | App background |
| `--color-bg-surface` | `#FFFFFF` | Card/panel backgrounds |
| `--color-bg-surface-subtle` | `#F3F4F6` | Subtle surface |
| `--color-bg-surface-elevated` | `#FFFFFF` | Elevated surfaces |

### Text Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-text-default` | `#111827` | Primary text |
| `--color-text-muted` | `#6B7280` | Secondary text |
| `--color-text-subtle` | `#9CA3AF` | Tertiary text |
| `--color-text-on-primary` | `#FFFFFF` | Text on primary buttons |
| `--color-text-danger` | `#DC2626` | Error messages |
| `--color-text-success` | `#16A34A` | Success messages |

### Border Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-border-subtle` | `#E5E7EB` | Default borders |
| `--color-border-strong` | `#D1D5DB` | Emphasized borders |
| `--color-border-focus` | `#2257FF` | Focus rings |

---

## Typography Tokens

### Font Families

```css
--font-family-base: 'Inter', system-ui, -apple-system, sans-serif;
--font-family-mono: 'Roboto Mono', ui-monospace, monospace;
```

### Font Sizes

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `--font-size-xs` | `0.75rem` | 12px | Captions, badges |
| `--font-size-sm` | `0.875rem` | 14px | Body small, labels |
| `--font-size-md` | `1rem` | 16px | Body default |
| `--font-size-lg` | `1.125rem` | 18px | Subheadings |
| `--font-size-xl` | `1.25rem` | 20px | Section titles |
| `--font-size-2xl` | `1.5rem` | 24px | Page titles |
| `--font-size-3xl` | `1.875rem` | 30px | Hero titles |
| `--font-size-4xl` | `2.25rem` | 36px | Display text |

### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `--font-weight-regular` | `400` | Body text |
| `--font-weight-medium` | `500` | Labels, buttons |
| `--font-weight-semibold` | `600` | Headings, emphasis |
| `--font-weight-bold` | `700` | Strong emphasis |

### Line Heights

| Token | Value | Usage |
|-------|-------|-------|
| `--line-height-tight` | `1.1` | Headings |
| `--line-height-normal` | `1.4` | Body text |
| `--line-height-relaxed` | `1.6` | Long-form content |

---

## Spacing Tokens

Based on a 4px unit system.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-0` | `0px` | No spacing |
| `--space-1` | `4px` | Tight spacing |
| `--space-2` | `8px` | Default gap |
| `--space-3` | `12px` | Small padding |
| `--space-4` | `16px` | Standard padding |
| `--space-5` | `20px` | Medium padding |
| `--space-6` | `24px` | Large padding |
| `--space-8` | `32px` | Section spacing |
| `--space-10` | `40px` | Large section spacing |
| `--space-12` | `48px` | Extra large spacing |
| `--space-16` | `64px` | Page margins |

---

## Border Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `4px` | Small elements, badges |
| `--radius-md` | `8px` | Buttons, inputs |
| `--radius-lg` | `12px` | Cards, panels |
| `--radius-xl` | `16px` | Modals, large cards |
| `--radius-2xl` | `24px` | Hero sections |
| `--radius-pill` | `9999px` | Pills, full-round |

---

## Shadow Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(15,23,42,0.04)` | Subtle elevation |
| `--shadow-md` | `0 4px 8px rgba(15,23,42,0.08)` | Cards, dropdowns |
| `--shadow-lg` | `0 10px 24px rgba(15,23,42,0.12)` | Modals, popovers |
| `--shadow-xl` | `0 20px 40px rgba(15,23,42,0.16)` | Elevated panels |

---

## Z-Index Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--z-base` | `0` | Default layer |
| `--z-dropdown` | `1000` | Dropdown menus |
| `--z-sticky` | `1050` | Sticky headers |
| `--z-overlay` | `1100` | Overlays, backdrops |
| `--z-modal` | `1200` | Modal dialogs |
| `--z-toast` | `1300` | Toast notifications |

---

## Breakpoint Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--breakpoint-mobile` | `480px` | Small phones |
| `--breakpoint-tablet` | `768px` | Tablets, large phones |
| `--breakpoint-desktop` | `1024px` | Desktop |
| `--breakpoint-wide` | `1280px` | Large desktop |
| `--breakpoint-ultrawide` | `1536px` | Dispatch boards |

---

## Transition Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--transition-fast` | `150ms ease` | Hover states |
| `--transition-normal` | `250ms ease` | Standard animations |
| `--transition-slow` | `350ms ease` | Complex transitions |

---

## Usage Examples

### Button Styling
```css
.btn-primary {
  background: var(--color-brand-primary);
  color: var(--color-text-on-primary);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  transition: var(--transition-fast);
}

.btn-primary:hover {
  box-shadow: var(--shadow-md);
}

.btn-primary:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}
```

### Card Styling
```css
.card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
}
```

### Status Badge
```css
.badge-success {
  background: var(--color-success-soft);
  color: var(--color-success);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-pill);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}
``