# Component Library
## TMS.ai UI Components Specification

---

## 1. Buttons

### Variants

| Variant | Background | Text | Border | Usage |
|---------|------------|------|--------|-------|
| `primary` | `primary-500` | white | none | Main CTAs |
| `secondary` | `neutral-100` | `neutral-700` | none | Secondary actions |
| `outline` | transparent | `primary-600` | `primary-300` | Tertiary |
| `ghost` | transparent | `neutral-600` | none | Subtle actions |
| `destructive` | `danger-500` | white | none | Delete, cancel |

### Sizes

| Size | Height | Padding | Font Size | Icon Size |
|------|--------|---------|-----------|-----------|
| `sm` | 32px | 12px 16px | 14px | 16px |
| `md` | 40px | 16px 20px | 14px | 18px |
| `lg` | 48px | 20px 24px | 16px | 20px |

### States

```
┌────────────────────────────────────────────────────────────┐
│  Default    Hover       Active      Focus       Disabled   │
│  ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐    │
│  │Button│   │Button│   │Button│   │Button│   │Button│    │
│  └──────┘   └──────┘   └──────┘   └──────┘   └──────┘    │
│  bg-500     bg-600     bg-700     ring-2     opacity-50   │
└────────────────────────────────────────────────────────────┘
```

### Props

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}
```

---

## 2. Inputs

### Text Input

| Property | Value |
|----------|-------|
| Height | 40px (md) |
| Padding | 12px 16px |
| Border | 1px solid `neutral-300` |
| Border Radius | 8px |
| Font Size | 14px |

### States

| State | Border | Background | Label |
|-------|--------|------------|-------|
| Default | `neutral-300` | white | `neutral-600` |
| Hover | `neutral-400` | white | — |
| Focus | `primary-500` (2px) | white | `primary-600` |
| Error | `danger-500` | `danger-50` | `danger-600` |
| Disabled | `neutral-200` | `neutral-100` | `neutral-400` |

### Input Types

- Text, Email, Password, Number, Tel
- Textarea (multi-line)
- Search (with icon)
- Date/Time pickers

### Anatomy

```
┌─────────────────────────────────────────┐
│ Label *                                 │  <- Label (14px, medium)
│ ┌─────────────────────────────────────┐ │
│ │ 🔍 Placeholder text                 │ │  <- Input field
│ └─────────────────────────────────────┘ │
│ Helper text or error message            │  <- Helper (12px, muted)
└─────────────────────────────────────────┘
```

---

## 3. Select / Dropdown

### Single Select

```
┌─────────────────────────────────────────┐
│ Equipment Type                       ▼  │
├─────────────────────────────────────────┤
│ ✓ Dry Van                               │  <- Selected
│   Reefer                                │
│   Flatbed                               │
│   Step Deck                             │
│   Tanker                                │
└─────────────────────────────────────────┘
```

### Multi-Select

```
┌─────────────────────────────────────────┐
│ Endorsements                         ▼  │
│ [Hazmat ×] [Tanker ×] [+2 more]        │
├─────────────────────────────────────────┤
│ ☑ Hazmat                               │
│ ☑ Tanker                               │
│ ☐ Doubles/Triples                      │
│ ☐ Passenger                            │
└─────────────────────────────────────────┘
```

### Props

```typescript
interface SelectProps {
  options: { value: string; label: string }[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  searchable?: boolean;
  placeholder?: string;
  disabled?: boolean;
}
```

---

## 4. Checkbox & Radio

### Checkbox

| State | Visual |
|-------|--------|
| Unchecked | `☐` Empty box, `neutral-300` border |
| Checked | `☑` Filled box, `primary-500` bg, white checkmark |
| Indeterminate | `☐` with dash, `primary-500` bg |
| Disabled | 50% opacity |

### Radio

| State | Visual |
|-------|--------|
| Unselected | `○` Empty circle, `neutral-300` border |
| Selected | `●` Filled dot, `primary-500` |
| Disabled | 50% opacity |

### Size: 20×20px, touch target 44×44px

---

## 5. Toggle / Switch

```
OFF: [○────────]  Gray track, white knob left
ON:  [────────●]  Primary track, white knob right
```

| Property | Value |
|----------|-------|
| Track Width | 44px |
| Track Height | 24px |
| Knob Size | 20px |
| Animation | 200ms ease |

---

## 6. Tables / Data Grids

### Standard Table

```
┌────┬───────────┬──────────────┬──────────────┬──────────┬─────────┐
│ ☐  │ Load #    │ Origin       │ Destination  │ Rate     │ Actions │
├────┼───────────┼──────────────┼──────────────┼──────────┼─────────┤
│ ☐  │ LD-78234  │ Chicago, IL  │ Detroit, MI  │ $1,850   │ ⋯       │
│ ☐  │ LD-78235  │ Dallas, TX   │ Houston, TX  │ $1,200   │ ⋯       │
├────┴───────────┴──────────────┴──────────────┴──────────┴─────────┤
│ Showing 1-25 of 148    ◀ 1 2 3 ... 6 ▶    Per page: 25 ▼         │
└───────────────────────────────────────────────────────────────────┘
```

### Features

- **Sorting:** Click header to sort (▲▼ indicator)
- **Selection:** Checkbox column for bulk actions
- **Pagination:** Page numbers + per-page selector
- **Sticky Header:** Fixed on scroll
- **Responsive:** Horizontal scroll or card view on mobile

### Row States

| State | Background |
|-------|------------|
| Default | white |
| Hover | `neutral-50` |
| Selected | `primary-50` |
| Expanded | `neutral-50` + border |

---

## 7. Cards

### Load Card

```
┌─────────────────────────────────────────────────────────────┐
│ 🟢 Available                            LD-78234  ⋯        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📍 Chicago, IL ────────────────▶ 📍 Detroit, MI           │
│     Dec 1, 08:00                     Dec 2, 14:00           │
│                                                              │
│  ┌──────────┬──────────┬──────────┐                        │
│  │ 🚛 Van   │ 42K lbs  │ 285 mi   │                        │
│  └──────────┴──────────┴──────────┘                        │
│                                                              │
│  Rate: $1,850    Margin: $450 (24%)                        │
│                                                              │
│  [View] [Edit] [Dispatch]                                   │
└─────────────────────────────────────────────────────────────┘
```

### Card Variants

| Variant | Border | Shadow | Usage |
|---------|--------|--------|-------|
| Default | `neutral-200` | sm | Standard cards |
| Elevated | none | lg | Featured content |
| Outlined | `neutral-300` | none | Lists |
| Interactive | hover: shadow-md | default | Clickable |

---

## 8. Forms

### Form Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Form Title                                           [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ SECTION LABEL                                               │
│ ┌─────────────────────┐ ┌─────────────────────┐            │
│ │ Field 1             │ │ Field 2             │            │
│ └─────────────────────┘ └─────────────────────┘            │
│                                                              │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Full-width field                                       │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                          [Cancel]  [Submit]                 │
└─────────────────────────────────────────────────────────────┘
```

### Form Patterns

- Group related fields in sections
- Use 2-column layout on desktop, single on mobile
- Required fields marked with asterisk (*)
- Inline validation on blur
- Form-level errors at top

---

## 9. Modals / Dialogs

### Sizes

| Size | Width | Usage |
|------|-------|-------|
| sm | 400px | Confirmations |
| md | 560px | Standard forms |
| lg | 720px | Complex forms |
| xl | 900px | Data-heavy views |
| full | 100% - 48px | Full-screen |

### Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Modal Title                                          [X]   │  <- Header
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Modal content goes here...                                 │  <- Body
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                              [Secondary]  [Primary]         │  <- Footer
└─────────────────────────────────────────────────────────────┘
```

### Behaviors

- Escape key closes
- Click overlay closes (unless `persistent`)
- Focus trapped within modal
- Scroll inside body, not page

---

## 10. Navigation

### Sidebar

```
┌────────────────────┐
│ [Logo] TMS.ai      │
│                    │
│ Dashboard          │
│ Dispatch      ●    │  <- Active indicator
│ Load Board         │
│ Tracking           │
│ ─────────────────  │
│ Carriers           │
│ Shippers           │
│ Documents          │
│ ─────────────────  │
│ Settings           │
│                    │
│ [User] John S.  ▼  │
└────────────────────┘
```

### Tabs

```
┌─ Active ──┬── Tab 2 ──┬── Tab 3 ──┐
│           │           │           │
└───────────┴───────────┴───────────┘
    ▔▔▔▔▔▔▔
    Primary underline
```

---

## 11. Tags / Badges / Chips

### Badge Variants

| Variant | Background | Text | Usage |
|---------|------------|------|-------|
| Default | `neutral-100` | `neutral-700` | Neutral info |
| Primary | `primary-100` | `primary-700` | Primary status |
| Success | `success-100` | `success-700` | Positive |
| Warning | `warning-100` | `warning-700` | Attention |
| Danger | `danger-100` | `danger-700` | Critical |

### Sizes

| Size | Height | Padding | Font |
|------|--------|---------|------|
| sm | 20px | 4px 8px | 11px |
| md | 24px | 4px 10px | 12px |
| lg | 28px | 6px 12px | 14px |

---

## 12. Alerts

### Alert Types

```
┌─────────────────────────────────────────────────────────────┐
│ ℹ️ Info: This is an informational message.            [X] │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ✅ Success: Operation completed successfully.         [X] │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Warning: Please review before proceeding.          [X] │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ❌ Error: Something went wrong. Please try again.     [X] │
└─────────────────────────────────────────────────────────────┘
```

---

## 13. Toast Notifications

### Position: Top-right, stacked

```
                              ┌─────────────────────────┐
                              │ ✅ Load created         │
                              │ LD-78234               │
                              └─────────────────────────┘
                              ┌─────────────────────────┐
                              │ ⚠️ Insurance expiring  │
                              │ ABC Trucking           │
                              └─────────────────────────┘
```

### Behaviors

- Auto-dismiss: 5 seconds (configurable)
- Manual dismiss with X button
- Progress bar for time remaining
- Stack limit: 3 visible

---

## 14. Loading States

### Spinner

```
◠ ◡  (rotating)
```

Sizes: sm (16px), md (24px), lg (32px), xl (48px)

### Skeleton

```
┌─────────────────────────────────────────┐
│ ████████████████████░░░░░░░░░░░░░░░░░ │  <- Animated shimmer
└─────────────────────────────────────────┘
```

### Button Loading

```
[◠ Loading...]  <- Spinner + text, disabled state
```

---

## 15. Empty States

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                     [Illustration]                          │
│                                                              │
│                  No loads found                             │
│          Try adjusting your filters or                      │
│              create your first load.                        │
│                                                              │
│                  [+ Create Load]                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

*See [tokens.ts](../tokens/tokens.ts) for component-specific tokens.*