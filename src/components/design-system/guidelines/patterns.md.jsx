# UX Patterns & Conventions
## TMS.ai Design Guidelines

---

## 1. Visual Differentiation: Broker vs Carrier

### 1.1 Mode Indicators

| Element | Broker | Carrier |
|---------|--------|---------|
| Header gradient | Indigo → Purple | Blue → Cyan |
| Mode badge | "Broker" (indigo) | "Carrier" (blue) |
| Primary button | `#6366F1` | `#2563EB` |
| Accent color | `#8B5CF6` | `#0EA5E9` |

### 1.2 Header Treatment

```
BROKER:
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] TMS.ai                              🔔  👤 John Smith  [BROKER]     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ Indigo → Purple gradient underline                                          │
└─────────────────────────────────────────────────────────────────────────────┘

CARRIER:
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] TMS.ai                              🔔  👤 Fleet Mgr   [CARRIER]    │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ Blue → Cyan gradient underline                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Navigation Differences

| Broker Nav | Carrier Nav |
|------------|-------------|
| Shippers | Drivers |
| Carriers | Fleet |
| Find Carrier | Available Loads |
| Commission | Settlements |

### 1.4 Terminology Mapping

| Concept | Broker Term | Carrier Term |
|---------|-------------|--------------|
| Payment received | Customer pays | Rate received |
| Payment made | Carrier pay | Driver pay |
| Assignment | Book carrier | Assign driver |
| Partners | Carriers | Owner operators |

---

## 2. Form Patterns

### 2.1 Form Layout

```
SINGLE COLUMN (Mobile, Simple Forms)
┌─────────────────────────────────────────┐
│ Label                                   │
│ ┌─────────────────────────────────────┐ │
│ │ Input                               │ │
│ └─────────────────────────────────────┘ │
│ Helper text                             │
│                                         │
│ Label                                   │
│ ┌─────────────────────────────────────┐ │
│ │ Input                               │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘

TWO COLUMN (Desktop, Related Fields)
┌─────────────────────────────────────────────────────────────┐
│ First Name              │ Last Name                         │
│ ┌─────────────────────┐ │ ┌─────────────────────┐          │
│ │                     │ │ │                     │          │
│ └─────────────────────┘ │ └─────────────────────┘          │
│                         │                                   │
│ City                    │ State         │ ZIP               │
│ ┌─────────────────────┐ │ ┌───────────┐ │ ┌───────────────┐│
│ │                     │ │ │         ▼ │ │ │               ││
│ └─────────────────────┘ │ └───────────┘ │ └───────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Field Grouping

Group related fields with section headers:

```
PICKUP INFORMATION
━━━━━━━━━━━━━━━━━━
[Address fields]

DELIVERY INFORMATION
━━━━━━━━━━━━━━━━━━━━
[Address fields]

LOAD DETAILS
━━━━━━━━━━━━
[Equipment, weight, etc.]
```

### 2.3 Required vs Optional

```jsx
// Required field
<label>
  Email address <span className="text-danger-500">*</span>
</label>

// Optional field (explicit)
<label>
  Middle name <span className="text-neutral-400">(optional)</span>
</label>
```

### 2.4 Input Validation Timing

| Validation Type | When to Validate |
|-----------------|------------------|
| Format (email, phone) | On blur |
| Required | On blur + on submit |
| Complex rules | On submit |
| Real-time (username availability) | On change (debounced) |

### 2.5 Multi-Step Forms

```
┌─────────────────────────────────────────────────────────────┐
│ Carrier Onboarding                            Step 2 of 4  │
├─────────────────────────────────────────────────────────────┤
│ ●────●────○────○                                            │
│ Company  Authority  Insurance  Documents                    │
│                                                              │
│ [Step content...]                                           │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ [← Back]                                         [Next →]   │
└─────────────────────────────────────────────────────────────┘
```

**Rules:**
- Show progress indicator
- Allow going back
- Save progress automatically
- Validate current step before proceeding

---

## 3. Error Messaging

### 3.1 Error Message Hierarchy

| Level | Position | Usage |
|-------|----------|-------|
| Field-level | Below input | Specific validation errors |
| Section-level | Top of section | Related field errors |
| Form-level | Top of form | Submit failures, server errors |
| Page-level | Toast/banner | System errors |

### 3.2 Error Message Content

```
❌ Wrong:
   "Error"
   "Invalid input"
   "Field required"

✅ Correct:
   "Please enter a valid email address (e.g., john@example.com)"
   "MC number must be in format MC-XXXXXX"
   "Customer rate is required to create a load"
```

### 3.3 Error Message Components

```jsx
// Field error
<div className="form-field error">
  <label>Email address</label>
  <Input aria-invalid="true" />
  <span className="text-sm text-danger-600 mt-1">
    Please enter a valid email address
  </span>
</div>

// Form error summary
<Alert variant="danger" className="mb-6">
  <AlertTitle>Please fix the following errors:</AlertTitle>
  <ul className="list-disc pl-4 mt-2">
    <li>Email address is required</li>
    <li>MC number format is invalid</li>
  </ul>
</Alert>
```

### 3.4 Inline Validation States

```
DEFAULT:     [________________]  Gray border
FOCUS:       [________________]  Primary border, ring
SUCCESS:     [________________] ✓  Green border (optional)
ERROR:       [________________] ✗  Red border + message below
```

---

## 4. Filtering & Sorting

### 4.1 Filter Bar Pattern

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🔍 Search...    Status: [All ▼]   Equipment: [All ▼]   [More Filters]     │
│                                                                              │
│ Active filters: [Available ×] [Dry Van ×] [Chicago ×]    [Clear All]       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Filter Placement

| Context | Placement |
|---------|-----------|
| Data table | Above table |
| Card grid | Sidebar (desktop), Drawer (mobile) |
| Search results | Left sidebar or top bar |

### 4.3 Filter Interaction

- Instant apply (no submit button)
- Show active filter count
- Persist filters in URL (shareable)
- Clear all option

### 4.4 Sort Controls

```
┌────────────────────────────────────────┐
│ Sort by: [Pickup Date ▼]   [↑ Asc]    │
└────────────────────────────────────────┘
```

**Table Column Sorting:**
- Click header to sort
- First click: ascending
- Second click: descending
- Third click: clear sort
- Show arrow indicator (▲▼)

### 4.5 Saved Views

Allow users to save filter/sort combinations:

```
┌─────────────────────────────────────────┐
│ Views: [My Active Loads ▼] [+ Save View]│
└─────────────────────────────────────────┘
```

---

## 5. Data Density (Dispatch Boards)

### 5.1 Density Levels

| Level | Row Height | Font Size | Usage |
|-------|------------|-----------|-------|
| Compact | 36px | 12px | Power users, high data volume |
| Default | 48px | 14px | Standard usage |
| Comfortable | 56px | 14px | New users, accessibility |

### 5.2 Density Toggle

```
View: [□ Compact] [■ Default] [□ Comfortable]
```

### 5.3 Information Hierarchy in Dense Views

```
PRIMARY (always visible):
  Load #, Origin, Destination, Status, Key Action

SECONDARY (hover or expand):
  Full address, Dates/times, Carrier, Contact

TERTIARY (detail view):
  All fields, History, Documents
```

### 5.4 Truncation Rules

| Field | Max Width | Truncation |
|-------|-----------|------------|
| Load # | 100px | Never truncate |
| City, State | 120px | Truncate city |
| Company name | 150px | Ellipsis |
| Rate | 80px | Never truncate |

```
Chicago, IL → "Chicago, IL"
San Francisco, CA → "San Franc..."
```

### 5.5 Row Expansion

```
┌────┬──────────┬────────────────────────────────────────────────────────────┐
│ ▼  │ LD-78234 │ Chicago, IL → Detroit, MI │ 🟢 Available │ $1,850 │ ⋯   │
├────┴──────────┴────────────────────────────────────────────────────────────┤
│   Expanded details...                                                       │
│   Pickup: ABC Warehouse, 123 Industrial Blvd, Chicago, IL 60601            │
│   Contact: John Smith (555) 123-4567                                        │
│   Equipment: Dry Van | Weight: 42,000 lbs | Miles: 285                     │
│   [View Details] [Assign Carrier] [Print BOL]                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Loading & Empty States

### 6.1 Loading States

| Context | Pattern |
|---------|---------|
| Page load | Skeleton screens |
| Button action | Spinner in button |
| Data refresh | Subtle indicator, no block |
| Form submit | Disable form, show progress |

### 6.2 Skeleton Screens

```
┌─────────────────────────────────────────┐
│ ████████████████████░░░░░░░░░░░░░░░░░  │  <- Shimmer animation
│                                         │
│ ████████████░░░░░░  ████████░░░░░░░░░  │
│                                         │
│ ████████████████████████████░░░░░░░░░  │
└─────────────────────────────────────────┘
```

### 6.3 Empty States

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                    [Illustration]                           │
│                                                              │
│                  No loads found                             │
│                                                              │
│     Your filters returned no results.                       │
│     Try adjusting your search criteria.                     │
│                                                              │
│     [Clear Filters]   [Create Load]                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Empty state must include:**
- Relevant illustration/icon
- Clear title
- Helpful description
- Action button (if applicable)

---

## 7. Feedback & Notifications

### 7.1 Toast Notifications

| Type | Duration | Example |
|------|----------|---------|
| Success | 5s, auto-dismiss | "Load created successfully" |
| Info | 5s, auto-dismiss | "2 new loads available" |
| Warning | 10s, manual dismiss | "Insurance expires in 7 days" |
| Error | Manual dismiss | "Failed to save. Please retry." |

### 7.2 Toast Position

- Desktop: Top-right
- Mobile: Bottom-center

### 7.3 Inline Feedback

```jsx
// After action
<Button onClick={handleSave}>
  {saving ? (
    <>
      <Spinner className="w-4 h-4 mr-2" />
      Saving...
    </>
  ) : saved ? (
    <>
      <Check className="w-4 h-4 mr-2" />
      Saved!
    </>
  ) : (
    'Save'
  )}
</Button>
```

### 7.4 Confirmation Dialogs

Use for destructive or irreversible actions:

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Cancel Load?                                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Are you sure you want to cancel load LD-78234?              │
│ This action cannot be undone.                               │
│                                                              │
│ The carrier ABC Trucking will be notified.                  │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                        [Keep Load]  [Cancel Load]           │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Navigation Patterns

### 8.1 Breadcrumbs

```
Dashboard  >  Loads  >  LD-78234
```

- Max 4 levels
- Current page not clickable
- Truncate middle items if needed

### 8.2 Tabs

```
┌─ Details ──┬── Timeline ──┬── Documents ──┬── Charges ──┐
│            │              │               │             │
```

- Use for same-page content switching
- Max 6 tabs (use dropdown for more)
- Current tab underlined

### 8.3 Back Navigation

```
[← Back to Loads]  LD-78234 Details
```

- Show on detail pages
- Indicate destination
- Preserve filters/scroll position

---

## 9. Responsive Patterns

### 9.1 Table → Cards (Mobile)

Desktop table becomes card list on mobile:

```
DESKTOP:
│ Load # │ Origin │ Destination │ Status │ Rate │

MOBILE:
┌─────────────────────────┐
│ LD-78234       🟢 Avail │
│ Chicago, IL → Detroit   │
│ Rate: $1,850            │
│ [View] [Actions ▼]      │
└─────────────────────────┘
```

### 9.2 Sidebar → Drawer

```
DESKTOP: Fixed sidebar (256px)
TABLET:  Collapsed sidebar (64px, icons only)
MOBILE:  Hidden, drawer on hamburger click
```

### 9.3 Actions → Menu

```
DESKTOP: [Edit] [Delete] [Print] [Share]
MOBILE:  [...] → Dropdown menu
```

### 9.4 Form Layout Shift

```
DESKTOP: 2-column form
TABLET:  2-column form
MOBILE:  1-column form (stacked)
```

---

## 10. Theming

### 10.1 Light/Dark Mode

Apply via root attribute:

```html
<html data-theme="light">  <!-- or "dark" -->
```

### 10.2 System Preference

```js
// Detect system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Listen for changes
window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (e) => {
    setTheme(e.matches ? 'dark' : 'light');
  });
```

### 10.3 Theme Toggle

```jsx
<Toggle
  checked={theme === 'dark'}
  onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
  icon={theme === 'dark' ? <Moon /> : <Sun />}
/>
```

### 10.4 Mode Toggle (Broker/Carrier)

```jsx
<Select
  value={mode}
  onChange={setMode}
  options={[
    { value: 'broker', label: 'Broker Mode' },
    { value: 'carrier', label: 'Carrier Mode' },
  ]}
/>
```

---

*For component implementations, see [component-library.md](../components/component-library.md).*