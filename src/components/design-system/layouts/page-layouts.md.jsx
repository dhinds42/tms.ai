# Page Layouts
## TMS.ai Screen Templates & Responsive Guidelines

---

## 1. Layout System

### 1.1 Page Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER (64px)                                                               │
├────────────────┬────────────────────────────────────────────────────────────┤
│ SIDEBAR        │ MAIN CONTENT                                               │
│ (256px)        │                                                            │
│                │ ┌──────────────────────────────────────────────────────┐  │
│ • Dashboard    │ │ PAGE HEADER                                          │  │
│ • Dispatch     │ │ Title + Breadcrumb + Actions                         │  │
│ • Loads        │ └──────────────────────────────────────────────────────┘  │
│ • ...          │                                                            │
│                │ ┌──────────────────────────────────────────────────────┐  │
│                │ │ CONTENT AREA                                         │  │
│                │ │                                                       │  │
│                │ └──────────────────────────────────────────────────────┘  │
└────────────────┴────────────────────────────────────────────────────────────┘
```

### 1.2 Responsive Breakpoints

| Breakpoint | Sidebar | Header | Content Columns |
|------------|---------|--------|-----------------|
| ≥1280px (xl) | Expanded (256px) | Full | 12 |
| 1024-1279px (lg) | Collapsed (64px) | Full | 12 |
| 768-1023px (md) | Hidden/Drawer | Hamburger | 8 |
| <768px (sm) | Hidden | Hamburger + Bottom Nav | 4 |

---

## 2. Broker Dashboard

### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Good morning, John                                      Dec 1, 2025  🔔 👤 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ ACTIVE      │ │ REVENUE     │ │ MARGIN      │ │ PENDING     │           │
│  │ LOADS       │ │ MTD         │ │ %           │ │ APPROVAL    │           │
│  │    47       │ │ $487,250    │ │   18.4%     │ │    12       │           │
│  │ ↑ 12%       │ │ ↑ 8%        │ │ ↑ 2.1%      │ │ ↓ 3         │           │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                                              │
│  ┌────────────────────────────────────┐ ┌──────────────────────────────┐   │
│  │ LOAD STATUS BREAKDOWN              │ │ QUICK ACTIONS                │   │
│  │                                    │ │                              │   │
│  │      [Donut Chart]                 │ │ [+ Create Load]              │   │
│  │                                    │ │ [📋 Spot Quote]              │   │
│  │ ● Available: 12   ● Transit: 18   │ │ [🚛 Find Carrier]            │   │
│  │ ● Delivered: 15   ● Invoiced: 2   │ │ [📊 Reports]                 │   │
│  │                                    │ │                              │   │
│  └────────────────────────────────────┘ └──────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ ⚠️ EXCEPTION ALERTS (3)                                    View All │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │ 🔴 LD-78230 - Late pickup, check call needed           [Take Action]│  │
│  │ 🟡 LD-78228 - Missing POD document                     [Take Action]│  │
│  │ 🟡 ABC Trucking - Insurance expiring in 7 days         [Take Action]│  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ RECENT ACTIVITY                                           View All │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │ 10:32 AM  Load LD-78234 delivered                      ✅ Success   │  │
│  │ 10:15 AM  Carrier ABC accepted load LD-78240           📋 Tendered  │  │
│  │ 09:45 AM  Invoice #1234 marked as paid                 💵 Payment   │  │
│  │ 09:30 AM  New quote request from XYZ Shipping          📝 Quote     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### KPI Cards Specification

| Metric | Icon | Color | Trend |
|--------|------|-------|-------|
| Active Loads | 🚛 | Primary | vs last week |
| Revenue MTD | 💵 | Success | vs last month |
| Margin % | 📈 | Info | vs target |
| Pending | ⏳ | Warning | count change |

### Mobile (< 768px)

- KPIs: 2×2 grid
- Charts: Full width, stacked
- Alerts: Collapsible accordion
- Quick Actions: Floating action button

---

## 3. Carrier Dashboard

### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Fleet Overview                                          Dec 1, 2025  🔔 👤 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ ACTIVE      │ │ DRIVERS     │ │ REVENUE     │ │ AVG HOS     │           │
│  │ LOADS       │ │ AVAILABLE   │ │ MTD         │ │ REMAINING   │           │
│  │    23       │ │   8 / 12    │ │ $127,450    │ │   6.2 hrs   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ FLEET MAP                                                            │  │
│  │ ┌──────────────────────────────────────────────────────────────────┐│  │
│  │ │                                                                   ││  │
│  │ │   [Interactive Map]                                              ││  │
│  │ │                                                                   ││  │
│  │ │   🚛 John D. - Chicago (In Transit)                             ││  │
│  │ │   🚛 Mike S. - Dallas (Available)                               ││  │
│  │ │   🚛 Sarah K. - Phoenix (Loading)                               ││  │
│  │ │                                                                   ││  │
│  │ └──────────────────────────────────────────────────────────────────┘│  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌─────────────────────────────────┐ ┌─────────────────────────────────┐  │
│  │ COMPLIANCE ALERTS          (5) │ │ AVAILABLE LOADS            (8) │  │
│  ├─────────────────────────────────┤ ├─────────────────────────────────┤  │
│  │ 🔴 Mike S. - Medical 14d       │ │ CHI→DET $1,400 Dry Van        │  │
│  │ 🟡 Truck #105 - Insp 30d       │ │ DAL→HOU $1,200 Reefer         │  │
│  │ 🟡 John D. - CDL 45d           │ │ PHX→DEN $2,100 Flatbed        │  │
│  │                    [View All]  │ │                    [View All]  │  │
│  └─────────────────────────────────┘ └─────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Carrier-Specific Features

- Fleet map with driver locations
- HOS status for each driver
- Equipment utilization
- Compliance countdown timers

---

## 4. Dispatch Board

### Dense Tabular Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Dispatch Console                         🔄 Auto-refresh  [+ New Load]     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │ 🔍 Search...   Status: [All ▼]   Equipment: [All ▼]   Date: [Today ▼] │ │
│ │ Origin: [____]   Dest: [____]   [Apply]   [Reset]   [Save View]       │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌────┬──────────┬────────────┬────────────┬────────┬────────┬─────┬──────┐│
│ │ ☐  │ Load #   │ Origin     │ Dest       │ Pickup │ Status │ $   │ Act  ││
│ ├────┼──────────┼────────────┼────────────┼────────┼────────┼─────┼──────┤│
│ │ ☐  │ LD-78234 │ Chicago IL │ Detroit MI │ 08:00  │ 🟢 Avl │ 1.8K│  ⋯  ││
│ │ ☐  │ LD-78235 │ Dallas TX  │ Houston TX │ 09:00  │ 🟡 Trn │ 1.2K│  ⋯  ││
│ │ ☐  │ LD-78236 │ Phoenix AZ │ Denver CO  │ 10:00  │ 🔵 Dsp │ 2.1K│  ⋯  ││
│ │ ☐  │ LD-78237 │ Seattle WA │ Portland   │ 11:00  │ ✅ Dlv │ 850 │  ⋯  ││
│ │ ☐  │ LD-78238 │ Miami FL   │ Atlanta GA │ 12:00  │ 🟣 Tnd │ 1.5K│  ⋯  ││
│ │ ☐  │ LD-78239 │ NYC NY     │ Boston MA  │ 13:00  │ 🔴 Lat │ 900 │  ⋯  ││
│ └────┴──────────┴────────────┴────────────┴────────┴────────┴─────┴──────┘│
│                                                                              │
│ ☑ 2 selected   [Bulk Assign] [Bulk Status] [Export]     Page 1 of 6  25/pg│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Column Configuration

| Column | Width | Sortable | Filterable |
|--------|-------|----------|------------|
| Checkbox | 40px | No | No |
| Load # | 100px | Yes | Yes |
| Origin | 120px | Yes | Yes |
| Destination | 120px | Yes | Yes |
| Pickup | 80px | Yes | Yes |
| Status | 80px | Yes | Yes |
| Rate | 80px | Yes | Yes |
| Actions | 60px | No | No |

### Bulk Actions

- Assign to carrier/driver
- Update status
- Export selected
- Print BOL/Rate Con

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↑↓` | Navigate rows |
| `Space` | Toggle selection |
| `Enter` | Open details |
| `Ctrl+A` | Select all |
| `Esc` | Clear selection |

---

## 5. Load Details

### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Loads    LD-78234                        [Edit] [Print] [More ▼]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ 🟢 DELIVERED                                              Dec 2, 2025 │ │
│  │                                                                        │ │
│  │  📍 Chicago, IL ═══════════════════════════════▶ 📍 Detroit, MI      │ │
│  │     ABC Warehouse                                    XYZ Distribution │ │
│  │     Dec 1, 08:00 AM                                  Dec 2, 02:15 PM  │ │
│  │                                                                        │ │
│  │  🚛 Dry Van  │  ⚖️ 42,000 lbs  │  📏 285 miles  │  ⏱️ 6h 15m         │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌─ Details ─┬─ Timeline ─┬─ Documents ─┬─ Tracking ─┬─ Charges ─┐        │
│  └───────────┴────────────┴─────────────┴────────────┴───────────┘        │
│                                                                              │
│  [DETAILS TAB CONTENT]                                                      │
│  ┌─────────────────────────────────┐ ┌─────────────────────────────────┐  │
│  │ CUSTOMER                        │ │ CARRIER                         │  │
│  │ XYZ Shipping Inc                │ │ ABC Trucking LLC                │  │
│  │ PO# 12345                       │ │ MC-123456                       │  │
│  │ Rate: $1,850                    │ │ Driver: John Doe                │  │
│  │ Contact: Jane Smith             │ │ Phone: (555) 123-4567           │  │
│  │ (555) 987-6543                  │ │ Pay: $1,400                     │  │
│  └─────────────────────────────────┘ └─────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ TRACKING MAP                                                          │ │
│  │ [Interactive map with route and current position]                    │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Tabs

1. **Details** - Customer, carrier, commodity, instructions
2. **Timeline** - Status history with timestamps
3. **Documents** - BOL, POD, Rate Con, attachments
4. **Tracking** - GPS map, check calls, ETA
5. **Charges** - Line items, accessorials, totals

---

## 6. Compliance View

### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Compliance Center                                            [+ Add Item]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  COMPLIANCE SCORE                                                           │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │    ████████████████████████░░░░░░░░░░                                 │ │
│  │                    78%                                                 │ │
│  │                                                                        │ │
│  │ ✅ Current: 45    ⚠️ Expiring: 12    🔴 Expired: 3    ❓ Missing: 8  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌─ All ─┬─ Carriers ─┬─ Drivers ─┬─ Vehicles ─┬─ Expired ─┐              │
│  └───────┴────────────┴───────────┴────────────┴───────────┘              │
│                                                                              │
│  🔍 Search...              Type: [All ▼]    Status: [All ▼]    [Export]   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │ Entity          │ Type           │ Expires     │ Status   │ Action   │ │
│  ├──────────────────────────────────────────────────────────────────────┤ │
│  │ 🔴 XYZ Carrier  │ Insurance      │ EXPIRED     │ Critical │ [Alert]  │ │
│  │ ⚠️ Mike Smith   │ Medical Card   │ Dec 20      │ 19 days  │ [Remind] │ │
│  │ ⚠️ Truck #105   │ Inspection     │ Jan 5       │ 35 days  │ [View]   │ │
│  │ ✅ ABC Trucking │ MC Authority   │ Jun 2026    │ Current  │ [View]   │ │
│  │ ✅ John Doe     │ CDL            │ Aug 2026    │ Current  │ [View]   │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Alert Thresholds

| Days | Status | Color | Action |
|------|--------|-------|--------|
| Expired | Critical | Red | Block operations |
| 0-30 | Urgent | Orange | Send reminder |
| 31-60 | Warning | Yellow | Notify |
| 61-90 | Advisory | Blue | Monitor |
| 90+ | Current | Green | None |

---

## 7. Driver Mobile Views

### 7.1 Assignment List

```
┌─────────────────────────┐
│ 👤 John Doe      ≡     │
│ Good morning            │
├─────────────────────────┤
│                         │
│ TODAY'S ASSIGNMENTS     │
│                         │
│ ┌─────────────────────┐ │
│ │ 🔵 IN PROGRESS      │ │
│ │ LD-78234            │ │
│ │ Chicago → Detroit   │ │
│ │ ETA: 2:00 PM        │ │
│ │ [View Details →]    │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ ⬜ UPCOMING         │ │
│ │ LD-78240            │ │
│ │ Detroit → Cleveland │ │
│ │ Pickup: 4:00 PM     │ │
│ │ [View Details →]    │ │
│ └─────────────────────┘ │
│                         │
│ HOS STATUS              │
│ ┌─────────────────────┐ │
│ │ ████████░░░░ 6.5h   │ │
│ │ Drive: 4.2h On: 6.5h│ │
│ └─────────────────────┘ │
│                         │
├─────────────────────────┤
│ 🏠   📦   📄   👤      │
└─────────────────────────┘
```

### 7.2 Load Detail

```
┌─────────────────────────┐
│ ← LD-78234              │
├─────────────────────────┤
│                         │
│ 🔵 IN TRANSIT           │
│                         │
│ ┌─────────────────────┐ │
│ │ [MAP]               │ │
│ │ ETA: 2h 15m         │ │
│ └─────────────────────┘ │
│                         │
│ NEXT STOP               │
│ ┌─────────────────────┐ │
│ │ 📍 DELIVERY         │ │
│ │ XYZ Distribution    │ │
│ │ 456 Commerce Dr     │ │
│ │ Detroit, MI 48201   │ │
│ │                     │ │
│ │ 🕐 2:00 - 4:00 PM  │ │
│ │                     │ │
│ │ [🗺️ Navigate]      │ │
│ │ [📞 Call]          │ │
│ └─────────────────────┘ │
│                         │
│ LOAD INFO               │
│ 🚛 Dry Van              │
│ ⚖️ 42,000 lbs           │
│ 📏 285 miles            │
│                         │
├─────────────────────────┤
│ [📍 Update Status]      │
└─────────────────────────┘
```

### 7.3 Status Update

```
┌─────────────────────────┐
│ ← Update Status         │
├─────────────────────────┤
│                         │
│ LD-78234                │
│ XYZ Distribution        │
│                         │
│ SELECT STATUS           │
│                         │
│ ┌─────────────────────┐ │
│ │ ○ Arrived at        │ │
│ │   Delivery          │ │
│ ├─────────────────────┤ │
│ │ ○ Unloading         │ │
│ ├─────────────────────┤ │
│ │ ● Delivered         │ │
│ │   ✓ Selected        │ │
│ ├─────────────────────┤ │
│ │ ○ Issue / Delay     │ │
│ └─────────────────────┘ │
│                         │
│ ADD NOTES (optional)    │
│ ┌─────────────────────┐ │
│ │                     │ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ ✅ Confirm Status   │ │
│ └─────────────────────┘ │
│                         │
└─────────────────────────┘
```

### 7.4 Document Upload (POD)

```
┌─────────────────────────┐
│ ← Upload Documents      │
├─────────────────────────┤
│                         │
│ LD-78234                │
│                         │
│ REQUIRED DOCUMENTS      │
│                         │
│ ┌─────────────────────┐ │
│ │ ☑️ BOL              │ │
│ │ Uploaded 08:15 AM   │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ ☐ POD (Required)    │ │
│ │                     │ │
│ │   ┌───────────────┐ │ │
│ │   │               │ │ │
│ │   │   📷          │ │ │
│ │   │   Take Photo  │ │ │
│ │   │               │ │ │
│ │   └───────────────┘ │ │
│ │                     │ │
│ │   [📁 From Files]  │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ ☐ Lumper Receipt   │ │
│ │ (Optional)          │ │
│ └─────────────────────┘ │
│                         │
├─────────────────────────┤
│ [Submit Documents]      │
└─────────────────────────┘
```

### 7.5 Offline/Poor Connectivity

```
┌─────────────────────────┐
│ ⚠️ Offline Mode         │
├─────────────────────────┤
│                         │
│ Limited connectivity    │
│ detected.               │
│                         │
│ ✅ Available offline:   │
│ • View assignments      │
│ • Update status         │
│ • Take photos           │
│                         │
│ ⏳ Queued for sync:     │
│ • 2 status updates      │
│ • 3 photos              │
│                         │
│ Changes will sync when  │
│ connection restored.    │
│                         │
│ ┌─────────────────────┐ │
│ │ 🔄 Try to Sync Now  │ │
│ └─────────────────────┘ │
│                         │
└─────────────────────────┘
```

---

## 8. Responsive Guidelines

### Content Priority (Mobile)

1. Current assignment status
2. Next action button
3. Essential info (address, time)
4. Secondary info (details, history)

### Touch Targets

- Minimum: 44×44px
- Recommended: 48×48px
- Spacing between targets: 8px minimum

### Navigation Patterns

| Screen Size | Primary Nav | Secondary Nav |
|-------------|-------------|---------------|
| Desktop | Sidebar | Tabs, breadcrumbs |
| Tablet | Collapsed sidebar | Tabs |
| Mobile | Bottom nav (5 items max) | Back button |

---

*See [component-library.md](../components/component-library.md) for component details.*