# TMS.ai Page Layouts

Comprehensive layout specifications and guidelines for TMS.ai application pages.

---

## Layout Shell: AppShell

The core layout wrapper used across all TMS.ai portals.

### Structure

```
┌─────────────────────────────────────────────────────────────┐
│  TOP BAR                                                    │
│  [Logo] [TMS.ai] [Role Label]         [Search] [User] [⚙️]  │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  SIDEBAR     │                                              │
│              │              MAIN CONTENT                    │
│  • Dashboard │                                              │
│  • Dispatch  │                                              │
│  • Loads     │                                              │
│  • Carriers  │                                              │
│  • ...       │                                              │
│              │                                              │
│              │                                              │
│              │                                              │
│  [Settings]  │                                              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

### Desktop (≥1024px)
- Sidebar: Fixed, 256px width
- Main content: Fluid, with padding

### Tablet (768px - 1023px)
- Sidebar: Collapsible, overlay on trigger
- Main content: Full width when collapsed

### Mobile (<768px)
- Top bar: Logo + hamburger menu
- Sidebar: Full-screen overlay
- Main content: Full width with reduced padding

### Role-Based Styling

```css
/* Broker Mode */
[data-role="broker"] .sidebar-header {
  border-left: 3px solid var(--color-role-broker-accent);
}

/* Carrier Mode */
[data-role="carrier"] .sidebar-header {
  border-left: 3px solid var(--color-role-carrier-accent);
}
```

---

## Broker Dashboard

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: "Dispatch Dashboard"               [Date] [Filter] │
├─────────────────────────────────────────────────────────────┤
│  KPI CARDS (4 columns)                                      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Active  │ │ Today's │ │ Except- │ │ Unassig-│           │
│  │ Loads   │ │ Pickups │ │ ions    │ │ ned     │           │
│  │   24    │ │   12    │ │    3    │ │    5    │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
├─────────────────────────────────────────────────────────────┤
│  LIVE DISPATCH TABLE                                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ [ ] │ Ref │ Shipper │ Route │ Times │ Status │ Actions ││
│  ├─────────────────────────────────────────────────────────┤│
│  │  ...load rows...                                        ││
│  └─────────────────────────────────────────────────────────┘│
├──────────────────────────────────┬──────────────────────────┤
│  QUICK ACTIONS                   │  ALERTS & EXCEPTIONS     │
│  • Create Load                   │  • Load #123 - Late PU   │
│  • Post to Board                 │  • Carrier COI Expiring  │
│  • Generate Quote                │  • Missing POD - #456    │
└──────────────────────────────────┴──────────────────────────┘
```

### Responsive Behavior

**Desktop (≥1280px):**
- 4-column KPI grid
- Full dispatch table with all columns
- Side-by-side quick actions and alerts

**Tablet (768px - 1279px):**
- 2x2 KPI grid
- Table scrolls horizontally
- Stacked quick actions and alerts

**Mobile (<768px):**
- Stacked KPI cards (1 column)
- Simplified table or card view
- Full-width sections

---

## Carrier Dashboard

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: "Fleet Operations"                 [Date] [Status] │
├─────────────────────────────────────────────────────────────┤
│  KPI CARDS (3 columns)                                      │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐                 │
│  │ Available │ │ In-Transit│ │ Fleet     │                 │
│  │ Loads: 15 │ │ Loads: 8  │ │ Util: 78% │                 │
│  └───────────┘ └───────────┘ └───────────┘                 │
├─────────────────────────────────────────────────────────────┤
│  ASSIGNED LOADS                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Driver │ Load │ Route │ Status │ ETA │ Actions         ││
│  ├─────────────────────────────────────────────────────────┤│
│  │ ...load assignments...                                  ││
│  └─────────────────────────────────────────────────────────┘│
├──────────────────────────────────┬──────────────────────────┤
│  FLEET STATUS                    │  COMPLIANCE NOTICES      │
│  • Truck 101: Available          │  ⚠️ 2 insurance docs exp │
│  • Truck 102: In Transit         │  ⚠️ 1 med card expiring  │
│  • Truck 103: Maintenance        │  ✓ DOT audit ready       │
└──────────────────────────────────┴──────────────────────────┘
```

### Visual Distinction from Broker
- Carrier accent color in header/borders
- "Fleet" terminology vs "Dispatch"
- Driver-centric load assignments view

---

## Customer Dashboard

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: "Welcome, [Company Name]"          [Support] [User]│
├─────────────────────────────────────────────────────────────┤
│  KPI CARDS (4 columns)                                      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Active  │ │Delivered│ │ Except- │ │ Pending │           │
│  │Shipments│ │This Mo. │ │ ions    │ │Invoices │           │
│  │    5    │ │   28    │ │    1    │ │    3    │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
├─────────────────────────────────────────────────────────────┤
│  MY SHIPMENTS                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Ref │ Origin → Dest │ Status │ ETA │ Track            ││
│  ├─────────────────────────────────────────────────────────┤│
│  │ ...shipment rows...                                     ││
│  └─────────────────────────────────────────────────────────┘│
├──────────────────────────────────┬──────────────────────────┤
│  RECENT DOCUMENTS                │  ALERTS                  │
│  • POD - Load #789              │  • Exception on #123     │
│  • Invoice - INV-2024-001       │  • Delivery rescheduled  │
└──────────────────────────────────┴──────────────────────────┘
```

### Features
- Customer-friendly terminology
- Self-service quote request CTA
- Simplified status tracking
- Document download access

---

## Owner-Operator Dashboard

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: "My Operations"                    [Earnings] [User]│
├─────────────────────────────────────────────────────────────┤
│  KPI CARDS (4 columns)                                      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Active  │ │Completed│ │ Next    │ │ Docs    │           │
│  │ Loads   │ │This Week│ │Settlemnt│ │Expiring │           │
│  │    2    │ │    6    │ │  $4,200 │ │    1    │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
├─────────────────────────────────────────────────────────────┤
│  MY LOADS                                                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Broker │ Load │ Route │ Status │ Rate │ Actions        ││
│  ├─────────────────────────────────────────────────────────┤│
│  │ ...load rows with payout info...                        ││
│  └─────────────────────────────────────────────────────────┘│
├──────────────────────────────────┬──────────────────────────┤
│  SETTLEMENTS SUMMARY             │  COMPLIANCE              │
│  • Last: $3,850 (Paid)          │  ✓ COI: Current          │
│  • Pending: $4,200              │  ⚠️ Med Card: 30 days    │
│  • YTD: $142,500                │  ✓ W9: On File           │
└──────────────────────────────────┴──────────────────────────┘
```

### Focus Areas
- Payment/earnings visibility
- Personal compliance tracking
- Load history with rates

---

## Driver Mobile Layout

### Structure

```
┌───────────────────────────┐
│  [≡]  TMS.ai  [🟢 On Duty]│  ← Top bar
├───────────────────────────┤
│                           │
│                           │
│      MAIN CONTENT         │  ← Scrollable area
│                           │
│                           │
│                           │
├───────────────────────────┤
│  [🚛] [💬] [📄] [👤]     │  ← Bottom nav
│ Loads  Msgs  Docs Profile │
└───────────────────────────┘
```

### Current Load View

```
┌───────────────────────────┐
│  CURRENT LOAD             │
│  ┌───────────────────────┐│
│  │ Load #123456          ││
│  │ ABC Trucking Co.      ││
│  │                       ││
│  │ Chicago, IL           ││
│  │     ↓                 ││
│  │ Detroit, MI           ││
│  │                       ││
│  │ PU: 10:00 AM - 12:00  ││
│  │ DEL: 4:00 PM - 6:00   ││
│  │                       ││
│  │ [●] In Transit        ││
│  │                       ││
│  │ [Update Status]       ││
│  │ [View Stops]          ││
│  └───────────────────────┘│
└───────────────────────────┘
```

### Design Considerations
- **Large touch targets**: Minimum 44x44px
- **High contrast**: Outdoor/bright light readability
- **One-handed use**: Primary actions in thumb zone
- **Offline support**: Indicate cached data
- **Status updates**: Simple, quick tap flows

---

## Dispatch Board (Dense View)

### Data Density Guidelines

**Row Height:** 44px (comfortable tap target on touch, dense on desktop)

**Column Priorities:**
1. Checkbox (selection) - 40px
2. Reference - 100px, truncate with tooltip
3. Shipper - 140px, truncate
4. Origin/Destination - 200px, stacked
5. Pickup/Delivery - 120px, stacked times
6. Equipment - 80px
7. Status - 100px (badge)
8. Carrier - 140px
9. Rate - 80px, right-aligned
10. Actions - 120px

**Truncation Rules:**
- Show full text on hover (tooltip)
- Ellipsis after max width
- Priority: Status > Route > Carrier > Shipper

**Visual Hierarchy:**
- Bold: Reference, Status
- Normal: Shipper, Route, Equipment
- Muted: Times, Carrier

---

## Responsive Grid System

### Container Widths

| Breakpoint | Container | Columns | Gutter |
|------------|-----------|---------|--------|
| Mobile (<480px) | 100% - 32px | 1 | 16px |
| Tablet (768px) | 100% - 48px | 2-4 | 24px |
| Desktop (1024px) | 960px | 12 | 24px |
| Wide (1280px) | 1200px | 12 | 32px |
| Ultrawide (1536px) | 1440px | 12 | 32px |

### Grid Usage

```css
.kpi-grid {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: repeat(4, 1fr);
}

@media (max-width: 1279px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## Page Header Pattern

### Standard Header

```
┌─────────────────────────────────────────────────────────────┐
│  [< Back]                                                   │
│  Page Title                                    [Action Btns]│
│  Description or breadcrumb                                  │
├─────────────────────────────────────────────────────────────┤
│  [Tab 1] [Tab 2] [Tab 3]                     [Search] [Filter]
└─────────────────────────────────────────────────────────────┘
```

### Header Spacing
- Top padding: `var(--space-6)`
- Title: `font-size-2xl`, `font-weight-bold`
- Description: `font-size-sm`, `color-text-muted`
- Between title and tabs: `var(--space-4)