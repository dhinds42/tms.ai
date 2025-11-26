# TMS.ai Design System

**Version:** 1.0.0  
**Last Updated:** November 2025

A comprehensive UI/UX DesignOps library for the TMS.ai dual-system (Broker + Carrier) transportation management platform.

---

## 📁 Structure

```
design-system/
├── tokens/
│   ├── tokens.json          # Machine-readable design tokens
│   ├── tokens.css           # CSS custom properties
│   └── design-tokens.md     # Token documentation
├── components/
│   └── component-library.md # Component specifications
├── layouts/
│   └── page-layouts.md      # Page templates & layout guidelines
├── guidelines/
│   ├── accessibility.md     # WCAG AA+ guidance
│   └── patterns.md          # UX patterns & conventions
├── config/
│   └── navigation.ts        # Role-based navigation config
└── README.md                # This file
```

---

## 🎨 Design Principles

### 1. Modern Logistics Aesthetic
- Clean, highly legible interfaces for heavy daily use
- Low-friction interactions for dispatchers and operations staff
- Professional enterprise SaaS visual language

### 2. Role-Based Context
- **Broker Mode**: Indigo/purple accent (#2257FF)
- **Carrier Mode**: Blue/cyan accent (#0BA5E9)
- **Customer Mode**: Purple accent (#8B5CF6)
- **Owner-Operator Mode**: Amber accent (#F59E0B)
- **Driver Mode**: Green accent (#10B981)

### 3. Accessibility First
- WCAG 2.1 AA compliance minimum
- High contrast ratios (4.5:1 for text)
- Keyboard navigable interfaces
- Screen reader compatible

### 4. Responsive Design
- Mobile-first approach for driver interfaces
- Desktop-optimized dispatch boards
- Tablet-friendly dashboards

---

## 🔧 Quick Start

### Using CSS Variables

```css
.my-component {
  background: var(--color-bg-surface);
  color: var(--color-text-default);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}
```

### Using JSON Tokens (for build tools)

```javascript
import tokens from './tokens/tokens.json';

const primaryColor = tokens.color.brand.primary.value; // #2257FF
```

### Role-Based Navigation

```typescript
import { getNavForRole } from './config/navigation';

const brokerNav = getNavForRole('broker');
const carrierNav = getNavForRole('carrier');
```

---

## 📐 Token Categories

| Category | Description |
|----------|-------------|
| **Colors** | Brand, semantic, neutral, role-specific |
| **Typography** | Font families, sizes, weights, line-heights |
| **Spacing** | 4px-based scale (0-64px) |
| **Radius** | Border radius scale (sm to pill) |
| **Shadows** | Elevation system (sm, md, lg, xl) |
| **Z-Index** | Layer management (dropdowns, modals, toasts) |
| **Breakpoints** | Responsive design targets |

---

## 🎯 Key Components

### Core UI
- Button (primary, secondary, ghost, danger)
- Input, Select, Textarea
- Checkbox, Radio, Toggle
- Badge, Tag, Chip
- Modal, Dialog
- Toast, Alert

### TMS-Specific
- LoadStatusBadge
- DispatchBoardTable
- DriverCurrentLoadCard
- ComplianceStatusIndicator
- SettlementRow

### Layouts
- AppShell (role-aware)
- BrokerDashboard
- CarrierDashboard
- CustomerDashboard
- OwnerOperatorDashboard
- DriverMobileLayout

---

## 🌓 Theming

### Light Mode (Default)
Standard light backgrounds with dark text.

### Dark Mode
Apply `data-theme="dark"` to root element:

```html
<html data-theme="dark">
```

### Role Themes
Apply role context for accent colors:

```html
<div data-role="broker">   <!-- Indigo accent -->
<div data-role="carrier">  <!-- Blue accent -->
<div data-role="customer"> <!-- Purple accent -->
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Width | Use Case |
|------------|-------|----------|
| Mobile | 480px | Driver app, basic mobile |
| Tablet | 768px | iPad, small laptops |
| Desktop | 1024px | Standard desktop |
| Wide | 1280px | Large monitors |
| Ultrawide | 1536px | Dispatch boards |

---

## ♿ Accessibility Requirements

- **Color Contrast**: Minimum 4.5:1 for normal text
- **Focus States**: Visible 2px focus rings
- **Touch Targets**: Minimum 44x44px on mobile
- **Keyboard Navigation**: All interactive elements accessible
- **Screen Readers**: Proper ARIA labels and landmarks

---

## 📚 Documentation

- [Design Tokens](./tokens/design-tokens.md)
- [Component Library](./components/component-library.md)
- [Page Layouts](./layouts/page-layouts.md)
- [Accessibility](./guidelines/accessibility.md)
- [UX Patterns](./guidelines/patterns.md)

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Nov 2025 | Initial release |

---

## 📞 Contact

For questions or contributions to the design system, contact the TMS.ai Design Team.