
# TMS.ai UX Patterns & Guidelines

Consistent patterns and conventions for the TMS.ai user experience.

---

## Form Patterns

### Field Layout

**Single Column (Default)**
- Most forms should use single-column layout
- Easier to scan, better for mobile
- Use for: Complex forms, onboarding, settings

**Two Column**
- Related fields side by side
- Use for: Address fields, date ranges, compact forms

```
┌─────────────────────┐ ┌─────────────────────┐
│ City                │ │ State               │
└─────────────────────┘ └─────────────────────┘
┌─────────────────────────────────────────────┐
│ Zip Code                                    │
└─────────────────────────────────────────────┘
```

### Field Grouping

Group related fields with clear section headers:

```
SHIPPER INFORMATION
┌─────────────────────────────────────────────┐
│ Company Name                                │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Contact Name                                │
└─────────────────────────────────────────────┘

PICKUP DETAILS
┌─────────────────────────────────────────────┐
│ Address                                     │
└─────────────────────────────────────────────┘
```

### Label Placement

**Above field (Default)**
- Best for scanning
- Works well at all screen sizes
- Required for complex fields

**Inline (Right)**
- Use sparingly for short forms
- Only for simple inputs
- Avoid on mobile

### Required Field Indication

```html
<label>
  Load Reference
  <span class="required" aria-hidden="true">*</span>
  <span class="sr-only">(required)</span>
</label>
```

Display legend at form top:
> Fields marked with * are required

### Input Hints

```
┌─────────────────────────────────────────────┐
│ MC Number                                   │
└─────────────────────────────────────────────┘
  Enter 6-digit FMCSA motor carrier number
```

---

## Error Messaging

### Inline Validation

**When to validate:**
- On blur (leaving field)
- On submit
- Real-time for format-specific fields (phone, email)

**Error message placement:**
```
┌─────────────────────────────────────────────┐
│ Email                                    ⚠️ │
└─────────────────────────────────────────────┘
  ⚠️ Please enter a valid email address
```

### Error Message Guidelines

**Do:**
- Be specific: "Phone number must be 10 digits"
- Be helpful: "Check the format and try again"
- Be polite: Avoid accusatory language

**Don't:**
- "Invalid input" (too vague)
- "Error" (not helpful)
- "You entered it wrong" (blaming)

### Form-Level Errors

```
┌─────────────────────────────────────────────┐
│ ⚠️ Please fix the following errors:        │
│                                             │
│   • Email is required                       │
│   • Phone number must be 10 digits          │
│   • Select at least one equipment type      │
└─────────────────────────────────────────────┘
```

### Success Feedback

```
┌─────────────────────────────────────────────┐
│ ✓ Load created successfully                 │
│   Reference: LD-2025-001234                 │
│                                             │
│   [View Load]  [Create Another]             │
└─────────────────────────────────────────────┘
```

---

## Filtering & Sorting

### Filter Bar Pattern

```
┌─────────────────────────────────────────────────────────────┐
│ [🔍 Search loads...]  [Status ▼]  [Equipment ▼]  [Date ▼]  │
│                                                             │
│ Active filters: [In Transit ✕] [Dry Van ✕]    [Clear All]  │
└─────────────────────────────────────────────────────────────┘
```

### Filter Behaviors

**Instant Apply (Default)**
- Filters apply immediately on selection
- Best for small-medium datasets
- Show loading state during fetch

**Apply Button**
- For complex filter combinations
- Use for large datasets
- Include "Apply" and "Reset" buttons

### Sort Indicators

```
┌──────────────────────────────────────────┐
│ Reference  │ Shipper ↑ │ Status │ Rate  │
├──────────────────────────────────────────┤
```

- ↑ = Ascending (A-Z, Low-High, Old-New)
- ↓ = Descending (Z-A, High-Low, New-Old)
- Click to toggle, default ascending

### Empty States with Filters

```
┌─────────────────────────────────────────────┐
│                                             │
│     🔍 No loads match your filters          │
│                                             │
│     Try adjusting your search or            │
│     [Clear All Filters]                     │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Data Density Guidelines

### Dispatch Board (High Density)

- Row height: 44px
- Font size: 14px (body), 12px (secondary)
- Truncate with ellipsis + tooltip
- Minimize whitespace
- Prioritize scanability

### Dashboard Cards (Medium Density)

- Card padding: 24px
- Clear visual hierarchy
- Icons for quick recognition
- Trend indicators

### Detail Pages (Low Density)

- Section padding: 32px
- Generous line height
- Clear section separation
- Supporting information visible

### Responsive Density

```
Desktop: Full table with all columns
Tablet:  Prioritized columns, horizontal scroll
Mobile:  Card-based view, expandable details
```

---

## Broker vs Carrier Differentiation

### Visual Distinction Strategy

The same system with subtle contextual differences.

**Color Accent:**
```css
/* Broker Mode */
--accent-primary: var(--color-role-broker-accent);  /* #2257FF */
--accent-soft: #E5EDFF;

/* Carrier Mode */
--accent-primary: var(--color-role-carrier-accent); /* #0BA5E9 */
--accent-soft: #E0F2FE;
```

**Applied to:**
- Header bar accent line
- Active navigation item
- Primary buttons
- Status badges (context-aware)
- Charts and data visualizations

### Mode Indicator

Always visible in header:

```
┌─────────────────────────────────────────────┐
│ [Logo] TMS.ai          [Broker Portal] 🟦   │
└─────────────────────────────────────────────┘
```

or

```
┌─────────────────────────────────────────────┐
│ [Logo] TMS.ai          [Carrier Portal] 🟦  │
└─────────────────────────────────────────────┘
```

### Terminology Mapping

| Broker Context | Carrier Context |
|----------------|-----------------|
| Carriers | Drivers |
| Tendered | Assigned |
| Carrier Pay | Driver Pay |
| Dispatch Board | Fleet Operations |
| Shipper | Customer |

### Context-Aware Components

**LoadStatusBadge:**
```jsx
// Broker context - shows carrier assignment
<LoadStatusBadge status="tendered" context="broker" />

// Carrier context - shows driver assignment  
<LoadStatusBadge status="accepted" context="carrier" />
```

---

## Loading States

### Skeleton Loading

```
┌─────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░                       │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░       │
│                                             │
│ ░░░░░░░░░░░░       ░░░░░░░░░░░░             │
└─────────────────────────────────────────────┘
```

Use skeleton loaders for:
- Initial page loads
- Table data fetching
- Card content loading

### Spinner Loading

Use spinners for:
- Button actions (inline)
- Form submissions
- Quick operations

### Progress Indicators

Use progress bars for:
- File uploads
- Multi-step processes
- Long-running operations

---

## Empty States

### Types

**No Data Yet:**
```
┌─────────────────────────────────────────────┐
│                                             │
│           📦 No loads yet                   │
│                                             │
│     Create your first load to get started   │
│                                             │
│           [Create Load]                     │
└─────────────────────────────────────────────┘
```

**No Results:**
```
┌─────────────────────────────────────────────┐
│                                             │
│           🔍 No results found               │
│                                             │
│     Try different search terms or filters   │
│                                             │
└─────────────────────────────────────────────┘
```

**Error State:**
```
┌─────────────────────────────────────────────┐
│                                             │
│           ⚠️ Something went wrong           │
│                                             │
│     We couldn't load the data.              │
│                                             │
│           [Try Again]                       │
└─────────────────────────────────────────────┘
```

---

## Confirmation Patterns

### Destructive Actions

Always confirm before:
- Deleting records
- Cancelling loads
- Removing users
- Irreversible changes

```
┌─────────────────────────────────────────────┐
│ ⚠️ Cancel Load?                             │
│                                             │
│ This will cancel load LD-2025-001234 and    │
│ notify the assigned carrier.                │
│                                             │
│ This action cannot be undone.               │
│                                             │
│        [Keep Load]  [Cancel Load]           │
└─────────────────────────────────────────────┘
```

### Non-Destructive Confirmations

Optional confirmation for:
- Sending communications
- Status changes
- Bulk actions

```
┌─────────────────────────────────────────────┐
│ Send Rate Confirmation?                     │
│                                             │
│ This will send the rate confirmation to:    │
│ dispatch@abctrucking.com                    │
│                                             │
│        [Cancel]  [Send]                     │
└─────────────────────────────────────────────┘
```

---

## Notification Patterns

### Toast Notifications

- Auto-dismiss: 5 seconds (info/success)
- Persist: Require manual dismiss (errors)
- Position: Top-right or bottom-right
- Stack: Newest on top, max 3 visible

### In-App Notifications

- Badge count on bell icon
- Grouped by type/time
- Mark as read on view
- Link to relevant page

### Alert Banners

- Page-level important messages
- Dismissible but can re-appear
- Action button when applicable

---

## Mobile-Specific Patterns

### Pull to Refresh

- Standard gesture for list refresh
- Visual indicator during refresh
- Haptic feedback on completion

### Swipe Actions

- Swipe right: Primary action (e.g., Update Status)
- Swipe left: Secondary action (e.g., More Options)
- Reveal actions, don't navigate

### Bottom Sheets

- Use instead of modals on mobile
- Drag to expand/dismiss
- Keyboard avoidance

### Offline Behavior

```
┌───────────────────────────┐
│ ⚠️ You're offline        │
│                           │
│ Some features may be      │
│ unavailable. Changes will │
│ sync when back online.    │
└───────────────────────────┘
```

Indicate:
- Cached data (✓ icon or timestamp)
- Pending uploads/changes
- Features requiring connection
