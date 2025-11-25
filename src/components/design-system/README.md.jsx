# TMS.ai Design System
## DesignOps Library v1.0

A comprehensive design system for the TMS.ai dual-mode Transportation Management System, serving both **Broker** and **Carrier** workflows.

---

## Quick Start

```bash
# Import tokens
import tokens from '@/design-system/tokens/tokens';

# Use in components
<Button variant="primary" size="md">Create Load</Button>
```

---

## System Overview

### Purpose
This design system ensures visual consistency, accessibility compliance, and rapid development across all TMS.ai interfaces including:
- Broker operations dashboard
- Carrier fleet management
- Driver mobile application
- Compliance management
- Financial modules

### Design Principles

| Principle | Description |
|-----------|-------------|
| **Clarity** | Dense data presented with clear hierarchy and scannable layouts |
| **Efficiency** | Minimize clicks for high-frequency dispatcher workflows |
| **Consistency** | Unified patterns across broker/carrier modes with contextual differentiation |
| **Accessibility** | WCAG 2.1 AA compliant, keyboard-navigable, screen-reader friendly |
| **Responsiveness** | Seamless experience from 320px mobile to 2560px ultrawide |

---

## Directory Structure

```
/design-system
├── README.md                    # This file
├── tokens/
│   ├── design-tokens.md         # Token documentation
│   └── tokens.ts                # Machine-readable tokens
├── components/
│   └── component-library.md     # Component specifications
├── layouts/
│   └── page-layouts.md          # Page templates & flows
└── guidelines/
    ├── accessibility.md         # A11y standards
    └── patterns.md              # UX patterns & conventions
```

---

## Mode Differentiation

TMS.ai operates in two primary modes with distinct visual treatments:

### Broker Mode
- **Primary Color:** Indigo (`#6366F1`)
- **Accent:** Purple (`#8B5CF6`)
- **Header Badge:** "Broker"
- **Focus:** Customer rates, carrier management, margin optimization

### Carrier Mode
- **Primary Color:** Blue (`#2563EB`)
- **Accent:** Cyan (`#0EA5E9`)
- **Header Badge:** "Carrier"
- **Focus:** Fleet management, driver dispatch, compliance tracking

---

## Theme Support

### Light Theme (Default)
- Page background: `slate-50`
- Card background: `white`
- Text: `slate-800` / `slate-600`

### Dark Theme
- Page background: `slate-900`
- Card background: `slate-800`
- Text: `slate-100` / `slate-400`

Apply via `data-theme="dark"` on root element.

---

## Getting Started

### For Designers
1. Review [Design Tokens](./tokens/design-tokens.md) for color, typography, spacing
2. Study [Component Library](./components/component-library.md) for available components
3. Reference [Page Layouts](./layouts/page-layouts.md) for screen compositions
4. Follow [Accessibility Guidelines](./guidelines/accessibility.md) for inclusive design

### For Engineers
1. Import tokens from `tokens/tokens.ts`
2. Use shadcn/ui components with TMS.ai customizations
3. Apply responsive utilities per breakpoint definitions
4. Test with accessibility checklist

---

## Versioning

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-25 | Initial release |

---

## Maintainers

- Design Team: design@tms.ai
- Engineering: engineering@tms.ai

---

*Last Updated: 2025-11-25*