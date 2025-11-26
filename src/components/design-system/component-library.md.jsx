# TMS.ai Component Library

Comprehensive specifications for all UI components in the TMS.ai design system.

---

## Atomic Components

### Button

**Variants:**
- `primary` - Main actions, CTAs
- `secondary` - Secondary actions
- `ghost` - Tertiary actions, inline
- `danger` - Destructive actions

**Sizes:**
- `sm` - Height: 32px, Font: 14px, Padding: 12px 8px
- `md` - Height: 36px, Font: 14px, Padding: 16px 8px
- `lg` - Height: 44px, Font: 16px, Padding: 20px 12px

**States:**
- Default, Hover, Active, Focus, Disabled, Loading

**Props:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}
```

**Usage:**
```jsx
<Button variant="primary" size="md">Create Load</Button>
<Button variant="secondary" leftIcon={<Plus />}>Add Carrier</Button>
<Button variant="danger" isLoading>Delete</Button>
```

---

### Input

**Variants:**
- `default` - Standard text input
- `error` - Validation error state
- `success` - Validation success state

**Sizes:**
- `sm` - Height: 32px
- `md` - Height: 40px
- `lg` - Height: 48px

**Props:**
```typescript
interface InputProps {
  size?: 'sm' | 'md' | 'lg';
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  label?: string;
  required?: boolean;
}
```

**Styling:**
```css
.input {
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
  transition: var(--transition-fast);
}

.input:focus {
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px var(--color-brand-primary-soft);
}

.input--error {
  border-color: var(--color-danger);
}
```

---

### Select

**Features:**
- Single select
- Multi-select (with checkboxes)
- Searchable options
- Grouped options

**Props:**
```typescript
interface SelectProps {
  options: { value: string; label: string; group?: string }[];
  value?: string | string[];
  multiple?: boolean;
  searchable?: boolean;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}
```

---

### Checkbox

**States:** Unchecked, Checked, Indeterminate, Disabled

**Props:**
```typescript
interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  label?: string;
  description?: string;
}
```

---

### Radio

**Props:**
```typescript
interface RadioProps {
  checked?: boolean;
  disabled?: boolean;
  label?: string;
  description?: string;
}

interface RadioGroupProps {
  options: { value: string; label: string; description?: string }[];
  value?: string;
  onChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
}
```

---

### Toggle / Switch

**Sizes:** `sm`, `md`, `lg`

**Props:**
```typescript
interface ToggleProps {
  checked?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
}
```

---

### Badge

**Variants:**
- `default` - Neutral
- `primary` - Primary accent
- `success` - Success/delivered
- `warning` - Warning/expiring
- `danger` - Error/exception
- `info` - Information

**Sizes:** `sm`, `md`

**Props:**
```typescript
interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  dot?: boolean;  // Show status dot
}
```

---

### Avatar

**Sizes:**
- `xs` - 24px
- `sm` - 32px
- `md` - 40px
- `lg` - 48px
- `xl` - 64px

**Props:**
```typescript
interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;  // Initials
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
}
```

---

## Molecule Components

### Form Group

Combines label, input, hint, and error message.

```jsx
<FormGroup
  label="Load Reference"
  hint="Enter unique identifier"
  error={errors.reference}
  required
>
  <Input {...register('reference')} />
</FormGroup>
```

---

### Card

**Variants:**
- `default` - Standard card
- `elevated` - With shadow
- `outlined` - Border only
- `interactive` - Clickable with hover

**Props:**
```typescript
interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  header?: ReactNode;
  footer?: ReactNode;
}
```

---

### Modal

**Sizes:**
- `sm` - Max width: 400px
- `md` - Max width: 560px
- `lg` - Max width: 720px
- `xl` - Max width: 900px
- `full` - Full screen

**Props:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  footer?: ReactNode;
  closeOnOverlay?: boolean;
  closeOnEsc?: boolean;
}
```

**Accessibility:**
- Focus trap when open
- ESC key closes
- Proper ARIA roles
- Return focus on close

---

### Table

**Features:**
- Sortable columns
- Row selection
- Pagination
- Sticky header
- Column resizing
- Row actions

**Props:**
```typescript
interface TableColumn<T> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  pagination?: { page: number; pageSize: number; total: number };
  onPageChange?: (page: number) => void;
  stickyHeader?: boolean;
  emptyState?: ReactNode;
}
```

---

### Toast / Notification

**Variants:**
- `info` - Information
- `success` - Success message
- `warning` - Warning
- `error` - Error message

**Props:**
```typescript
interface ToastProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description?: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}
```

---

### Alert

In-page alert banners.

**Variants:** `info`, `success`, `warning`, `error`

**Props:**
```typescript
interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  description: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: { label: string; onClick: () => void };
}
```

---

## TMS-Specific Components

### LoadStatusBadge

**Statuses:**
- `draft` - Gray
- `posted` - Blue soft
- `tendered` - Broker accent
- `accepted` - Carrier accent
- `in_transit` - Info blue
- `delivered` - Success green
- `cancelled` - Gray
- `exception` - Danger red

**Props:**
```typescript
interface LoadStatusBadgeProps {
  status: LoadStatus;
  context?: 'broker' | 'carrier';
  showDot?: boolean;
}
```

---

### DispatchBoardTable

Dense, information-rich table for dispatch operations.

**Columns:**
- Checkbox (selection)
- Reference ID
- Shipper Name
- Origin → Destination
- Pickup / Delivery Times
- Equipment Type
- Status
- Assigned Carrier
- Rate
- Actions

**Features:**
- Row hover highlighting
- Quick actions (Details, Tender)
- Bulk selection
- Column sorting
- Status filtering

---

### KPICard

Dashboard metric card.

**Props:**
```typescript
interface KPICardProps {
  title: string;
  value: string | number;
  change?: { value: number; direction: 'up' | 'down' };
  icon?: ReactNode;
  color?: 'default' | 'success' | 'warning' | 'danger';
  trend?: { data: number[]; color?: string };
}
```

---

### ComplianceStatusIndicator

**Statuses:**
- `ok` - Green, current
- `expiring` - Amber, expiring soon
- `expired` - Red, expired

**Props:**
```typescript
interface ComplianceStatusIndicatorProps {
  label: string;
  status: 'ok' | 'expiring' | 'expired';
  dueDate?: string;
  onClick?: () => void;
}
```

---

### SettlementRow

Row component for owner-operator settlements.

**Props:**
```typescript
interface SettlementRowProps {
  period: string;
  loadsCount: number;
  gross: string;
  deductions: string;
  net: string;
  status: 'pending' | 'paid';
  onViewDetails?: () => void;
}
```

---

### DriverCurrentLoadCard

Mobile-optimized card for driver's current load.

**Props:**
```typescript
interface DriverCurrentLoadCardProps {
  loadRef: string;
  brokerName: string;
  origin: string;
  destination: string;
  pickupWindow: string;
  deliveryWindow: string;
  status: LoadStatus;
  onUpdateStatus?: () => void;
  onViewStops?: () => void;
}
```

---

## Navigation Components

### Tabs

**Variants:**
- `line` - Underline indicator
- `pill` - Pill background
- `boxed` - Boxed segments

**Props:**
```typescript
interface TabsProps {
  variant?: 'line' | 'pill' | 'boxed';
  tabs: { id: string; label: string; icon?: ReactNode; badge?: string }[];
  activeTab: string;
  onChange: (tabId: string) => void;
}
```

---

### Breadcrumb

**Props:**
```typescript
interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
}
```

---

### Sidebar

**Features:**
- Collapsible
- Nested navigation
- Active state indication
- Role-based filtering

---

### BottomNav (Mobile)

**Props:**
```typescript
interface BottomNavProps {
  items: { id: string; label: string; icon: ReactNode; badge?: number }[];
  activeItem: string;
  onChange: (itemId: string) => void;
}
```

---

## Best Practices

### Composition
- Compose complex components from atomic parts
- Keep components single-responsibility
- Use consistent prop naming

### Accessibility
- Include proper ARIA attributes
- Support keyboard navigation
- Maintain focus management

### Performance
- Virtualize long lists
- Lazy load heavy components
- Memoize expensive renders

### Responsiveness
- Design mobile-first
- Test at all breakpoints
- Use flexible layouts