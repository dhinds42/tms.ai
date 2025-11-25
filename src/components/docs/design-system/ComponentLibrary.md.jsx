# Component Library
## TMS.ai Design System - Atoms, Molecules & Organisms

---

## 1. Atomic Components

### 1.1 Buttons

#### Variants

| Variant | Class | Usage |
|---------|-------|-------|
| Primary | `btn-primary` | Main CTAs, submit actions |
| Secondary | `btn-secondary` | Secondary actions |
| Outline | `btn-outline` | Tertiary actions |
| Ghost | `btn-ghost` | Subtle actions, navigation |
| Destructive | `btn-destructive` | Delete, cancel operations |

#### Sizes

| Size | Height | Padding | Font |
|------|--------|---------|------|
| sm | 32px | 12px 16px | 14px |
| md | 40px | 16px 24px | 14px |
| lg | 48px | 20px 32px | 16px |

#### States

```
┌──────────────────────────────────────────────────────────────┐
│ BUTTON STATES                                                 │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Default    Hover       Active      Focus       Disabled     │
│  ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐       │
│  │ Save │   │ Save │   │ Save │   │ Save │   │ Save │       │
│  └──────┘   └──────┘   └──────┘   └──────┘   └──────┘       │
│  bg-600     bg-700     bg-800     ring-2     opacity-50     │
│             scale-102  scale-98   ring-blue                  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

#### Component Spec

```jsx
// Button Component Props
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
  onClick?: () => void;
}
```

### 1.2 Inputs

#### Text Input

| Property | Value |
|----------|-------|
| Height | 40px |
| Padding | 12px 16px |
| Border | 1px solid slate-300 |
| Border Radius | 8px |
| Focus | 2px ring primary-500 |

#### States

| State | Border | Background |
|-------|--------|------------|
| Default | slate-300 | white |
| Hover | slate-400 | white |
| Focus | primary-500 | white |
| Error | error-500 | error-50 |
| Disabled | slate-200 | slate-100 |

#### Component Spec

```jsx
interface InputProps {
  type: 'text' | 'email' | 'password' | 'number' | 'tel';
  size: 'sm' | 'md' | 'lg';
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}
```

### 1.3 Select / Dropdown

```
┌─────────────────────────────────────┐
│ Equipment Type              ▼       │
├─────────────────────────────────────┤
│ ● Dry Van                          │
│ ○ Reefer                           │
│ ○ Flatbed                          │
│ ○ Step Deck                        │
│ ○ Tanker                           │
└─────────────────────────────────────┘
```

### 1.4 Checkbox & Radio

| Component | Size | States |
|-----------|------|--------|
| Checkbox | 20x20px | unchecked, checked, indeterminate, disabled |
| Radio | 20x20px | unselected, selected, disabled |

### 1.5 Toggle Switch

| State | Background | Knob Position |
|-------|------------|---------------|
| Off | slate-300 | Left |
| On | primary-500 | Right |
| Disabled | slate-200 | Current |

### 1.6 Badge

| Variant | Background | Text | Usage |
|---------|------------|------|-------|
| Default | slate-100 | slate-700 | Neutral info |
| Primary | primary-100 | primary-700 | Primary status |
| Success | success-100 | success-700 | Positive status |
| Warning | warning-100 | warning-700 | Attention needed |
| Error | error-100 | error-700 | Critical |

### 1.7 Avatar

| Size | Dimensions | Font Size |
|------|------------|-----------|
| xs | 24x24px | 10px |
| sm | 32x32px | 12px |
| md | 40x40px | 14px |
| lg | 48x48px | 16px |
| xl | 64x64px | 20px |

---

## 2. Molecules / Patterns

### 2.1 Form Patterns

#### Login Form

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                    [TMS.ai Logo]                            │
│                                                              │
│                   Welcome Back                               │
│              Sign in to your account                         │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ✉️  Email address                                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 🔒  Password                               [Show]    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ☐ Remember me                    Forgot password?          │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    Sign In                           │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ─────────────── Or continue with ───────────────           │
│                                                              │
│  [Google]  [Microsoft]  [SSO]                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Load Creation Form

```
┌─────────────────────────────────────────────────────────────┐
│ Create New Load                                    [X]      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ PICKUP INFORMATION                                          │
│ ┌─────────────────┐ ┌──────────┐ ┌────────────┐            │
│ │ City            │ │ State ▼  │ │ ZIP        │            │
│ └─────────────────┘ └──────────┘ └────────────┘            │
│                                                              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ 📍 Full Address                                      │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                              │
│ ┌─────────────────┐ ┌─────────────────────────────────┐    │
│ │ 📅 Pickup Date  │ │ 🕐 Time Window                  │    │
│ └─────────────────┘ └─────────────────────────────────┘    │
│                                                              │
│ DELIVERY INFORMATION                                        │
│ [Same pattern as above]                                     │
│                                                              │
│ LOAD DETAILS                                                │
│ ┌─────────────────┐ ┌─────────────────────────────────┐    │
│ │ Equipment    ▼  │ │ Commodity                       │    │
│ └─────────────────┘ └─────────────────────────────────┘    │
│                                                              │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ Weight   │ │ Pieces   │ │ Pallets  │ │ Linear Ft│       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│ RATES                                                       │
│ ┌─────────────────┐ ┌─────────────────┐                    │
│ │ $ Customer Rate │ │ $ Carrier Pay   │                    │
│ └─────────────────┘ └─────────────────┘                    │
│                                                              │
│ Margin: $450 (18.0%)  │  Rate/Mile: $2.85                  │
│                                                              │
│ ┌──────────────┐ ┌────────────────────────────────────┐    │
│ │   Cancel     │ │         Create Load                │    │
│ └──────────────┘ └────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Carrier Onboarding Form

```
┌─────────────────────────────────────────────────────────────┐
│ Carrier Onboarding                          Step 2 of 4    │
├─────────────────────────────────────────────────────────────┤
│ ●────●────○────○                                            │
│ Company  Authority  Insurance  Documents                    │
│                                                              │
│ AUTHORITY INFORMATION                                       │
│                                                              │
│ ┌─────────────────────────┐ ┌─────────────────────────┐    │
│ │ MC Number               │ │ DOT Number              │    │
│ │ MC-______               │ │ ________                │    │
│ └─────────────────────────┘ └─────────────────────────┘    │
│                                                              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ 🔍 Verify Authority                                  │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ ✅ Authority Status: ACTIVE                          │    │
│ │    Operating Status: AUTHORIZED FOR HIRE            │    │
│ │    Safety Rating: SATISFACTORY                      │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                              │
│ ┌──────────────┐                    ┌──────────────────┐   │
│ │   ← Back     │                    │   Next →         │   │
│ └──────────────┘                    └──────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Table / Data Grid

#### Load Board Table

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ☐ │ Load #    │ Origin       │ Destination  │ Equipment │ Rate    │ Status │
├───┼───────────┼──────────────┼──────────────┼───────────┼─────────┼────────┤
│ ☐ │ LD-78234  │ Chicago, IL  │ Detroit, MI  │ 🚛 Dry Van│ $1,850  │ 🟢 Avail│
│ ☐ │ LD-78235  │ Dallas, TX   │ Houston, TX  │ ❄️ Reefer │ $1,200  │ 🟡 Trans│
│ ☐ │ LD-78236  │ Phoenix, AZ  │ Denver, CO   │ 📦 Flatbed│ $2,100  │ 🔵 Disp │
│ ☐ │ LD-78237  │ Seattle, WA  │ Portland, OR │ 🚛 Dry Van│ $850    │ ✅ Dlvd │
└─────────────────────────────────────────────────────────────────────────────┘
│ Showing 1-25 of 148 loads     │ ◀ │ 1 │ 2 │ 3 │ ... │ 6 │ ▶ │ Per page: 25 ▼│
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Table Features

- Sortable columns (click header)
- Resizable columns (drag border)
- Sticky header on scroll
- Row selection (checkbox)
- Row hover highlight
- Quick actions on hover
- Pagination controls

### 2.3 Cards

#### Load Card

```
┌─────────────────────────────────────────────────────────────┐
│ 🟢 Available                              LD-78234  ⋯      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📍 Chicago, IL  ─────────────────────▶  📍 Detroit, MI    │
│     12/01 08:00                            12/02 14:00      │
│                                                              │
│  ┌──────────────┬──────────────┬──────────────┐            │
│  │ 🚛 Dry Van   │ ⚖️ 42,000 lbs │ 📏 285 miles │            │
│  └──────────────┴──────────────┴──────────────┘            │
│                                                              │
│  Customer Rate: $1,850        Carrier Pay: $1,400          │
│  Margin: $450 (24.3%)         Rate/Mile: $6.49             │
│                                                              │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │ 👁️ View      │  │ ✏️ Edit      │  │ 🚛 Dispatch  │   │
│  └───────────────┘  └───────────────┘  └───────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Driver Card

```
┌─────────────────────────────────────────────────────────────┐
│  ┌────┐                                                     │
│  │ JD │  John Doe                           🟢 Available   │
│  └────┘  CDL-A • Hazmat, Tanker                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📍 Current: Chicago, IL                                    │
│  🏠 Home: Indianapolis, IN                                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ HOS: ████████████░░░░░░ 8.5 hrs remaining            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  📊 Performance                                             │
│  On-Time: 94%  •  Loads: 127  •  Rating: ⭐ 4.8            │
│                                                              │
│  ┌───────────────┐  ┌───────────────┐                      │
│  │ 📞 Contact   │  │ 🚛 Assign     │                      │
│  └───────────────┘  └───────────────┘                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.4 Modal / Dialog

#### Standard Modal

```
┌─────────────────────────────────────────────────────────────┐
│ Rate Confirmation                                    [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Load: LD-78234                                             │
│  Route: Chicago, IL → Detroit, MI                           │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Agreed Rate                                          │   │
│  │ $ 1,400.00                                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ☐ I confirm I have read and agree to the terms            │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                      ┌──────────┐  ┌──────────────────┐    │
│                      │  Cancel  │  │ Send Confirmation │    │
│                      └──────────┘  └──────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

#### Modal Sizes

| Size | Width | Usage |
|------|-------|-------|
| sm | 400px | Confirmations, alerts |
| md | 560px | Forms, details |
| lg | 720px | Complex forms |
| xl | 900px | Data-heavy content |
| full | 100% - 48px | Full-screen views |

---

## 3. Organisms / Templates

### 3.1 Broker Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] TMS.ai                    🔔  👤 John Smith ▼     [Broker Mode]     │
├────────────┬────────────────────────────────────────────────────────────────┤
│            │                                                                 │
│ Dashboard  │  Good morning, John                            Dec 1, 2025    │
│ Dispatch ● │                                                                 │
│ Load Board │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐ │
│ Tracking   │  │ Active Loads│ │ Revenue MTD │ │ Margin %    │ │ Pending  │ │
│ Carriers   │  │    47       │ │ $487,250    │ │   18.4%     │ │   12     │ │
│ Shippers   │  │ ↑ 12%       │ │ ↑ 8%        │ │ ↑ 2.1%      │ │ ↓ 3      │ │
│ Documents  │  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘ │
│ Invoicing  │                                                                 │
│ Compliance │  ┌────────────────────────────────────┐ ┌──────────────────┐  │
│ Analytics  │  │ LOAD STATUS BREAKDOWN              │ │ RECENT ACTIVITY  │  │
│ Reports    │  │ [Pie Chart]                        │ │ • Load LD-78234  │  │
│            │  │ ● Available: 12                    │ │   delivered      │  │
│ ───────    │  │ ● In Transit: 18                   │ │ • Carrier ABC    │  │
│ Settings   │  │ ● Delivered: 15                    │ │   accepted load  │  │
│            │  │ ● Invoiced: 2                      │ │ • Invoice #1234  │  │
│            │  └────────────────────────────────────┘ │   paid           │  │
│            │                                         └──────────────────┘  │
│            │  ┌─────────────────────────────────────────────────────────┐  │
│            │  │ LOADS REQUIRING ATTENTION                               │  │
│            │  ├─────────────────────────────────────────────────────────┤  │
│            │  │ ⚠️ LD-78230 - Late pickup, needs check call            │  │
│            │  │ ⚠️ LD-78228 - Document missing (POD)                   │  │
│            │  │ ⚠️ LD-78225 - Carrier insurance expiring               │  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                 │
└────────────┴────────────────────────────────────────────────────────────────┘
```

### 3.2 Carrier Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] TMS.ai                    🔔  👤 Fleet Manager ▼  [Carrier Mode]    │
├────────────┬────────────────────────────────────────────────────────────────┤
│            │                                                                 │
│ Dashboard  │  Fleet Overview                               Dec 1, 2025     │
│ Dispatch ● │                                                                 │
│ Load Board │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐ │
│ Drivers    │  │ Active Loads│ │ Drivers Avl │ │ Revenue MTD │ │ HOS Avg  │ │
│ Fleet      │  │    23       │ │    8/12     │ │ $127,450    │ │  6.2 hrs │ │
│ Documents  │  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘ │
│ Compliance │                                                                 │
│ Settlements│  ┌────────────────────────────────────────────────────────┐   │
│ Reports    │  │ FLEET MAP                                              │   │
│            │  │ [Interactive Map showing driver locations]             │   │
│            │  │                                                        │   │
│            │  │  🚛 John D. - Chicago, IL (In Transit)                │   │
│            │  │  🚛 Mike S. - Dallas, TX (Available)                  │   │
│            │  │  🚛 Sarah K. - Phoenix, AZ (Loading)                  │   │
│            │  │                                                        │   │
│            │  └────────────────────────────────────────────────────────┘   │
│            │                                                                 │
│            │  ┌─────────────────────────────────────────────────────────┐  │
│            │  │ COMPLIANCE ALERTS                           View All → │  │
│            │  ├─────────────────────────────────────────────────────────┤  │
│            │  │ 🔴 Driver Mike S. - Medical card expires in 14 days    │  │
│            │  │ 🟡 Truck #105 - Annual inspection due in 30 days       │  │
│            │  │ 🟡 Driver John D. - CDL renewal in 45 days             │  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                 │
└────────────┴────────────────────────────────────────────────────────────────┘
```

### 3.3 Driver Mobile Screen

```
┌─────────────────────────┐
│ ◀  Current Load         │
├─────────────────────────┤
│                         │
│ LD-78234                │
│ ━━━━━━━━━━━━━━━━━━━━━  │
│                         │
│ 📍 PICKUP               │
│ ABC Warehouse           │
│ 123 Industrial Blvd     │
│ Chicago, IL 60601       │
│ 🕐 08:00 AM - 10:00 AM │
│                         │
│ [Navigate] [Call]       │
│                         │
│ ━━━━━━━━━━━━━━━━━━━━━  │
│                         │
│ 📍 DELIVERY             │
│ XYZ Distribution        │
│ 456 Commerce Dr         │
│ Detroit, MI 48201       │
│ 🕐 02:00 PM - 04:00 PM │
│                         │
│ ━━━━━━━━━━━━━━━━━━━━━  │
│                         │
│ 🚛 Dry Van • 42,000 lbs│
│ 📏 285 miles • 4h 30m  │
│                         │
│ ┌─────────────────────┐ │
│ │                     │ │
│ │   📍 Arrived at     │ │
│ │      Pickup         │ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ 📷 Upload Documents │ │
│ └─────────────────────┘ │
│                         │
├─────────────────────────┤
│ 🏠    📦    📄    👤   │
│ Home  Loads  Docs  Me   │
└─────────────────────────┘
```

### 3.4 Compliance Overview Screen

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Compliance Center                                         [+ Add Item]     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  COMPLIANCE SCORE                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                                                                     │    │
│  │        ████████████████████████░░░░░░░░░░                          │    │
│  │                    78%                                              │    │
│  │                                                                     │    │
│  │   ✅ Current: 45   ⚠️ Expiring: 12   🔴 Expired: 3   ❓ Missing: 8 │    │
│  │                                                                     │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─ Current ─┬─ Expiring ─┬─ Expired ─┬─ Missing ─┐                        │
│  └───────────┴────────────┴───────────┴───────────┘                        │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ 🔍 Search...                              Filter: All ▼  Type: All ▼│  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ Entity        │ Type           │ Expiration  │ Status    │ Actions  │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │ ABC Trucking  │ Insurance      │ Dec 15, 2025│ ⚠️ 14 days│ [View]   │  │
│  │ John Doe      │ Medical Card   │ Dec 20, 2025│ ⚠️ 19 days│ [View]   │  │
│  │ Truck #105    │ Inspection     │ Jan 5, 2026 │ 🟢 35 days│ [View]   │  │
│  │ XYZ Carrier   │ MC Authority   │ Expired     │ 🔴 Expired│ [Alert]  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Dark Mode Variants

### Color Mappings

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Page BG | #F8FAFC | #0F172A |
| Card BG | #FFFFFF | #1E293B |
| Border | #E2E8F0 | #334155 |
| Text Primary | #1E293B | #F1F5F9 |
| Text Secondary | #64748B | #94A3B8 |

---

*Next: [Layout & Pages](./LayoutPages.md)*