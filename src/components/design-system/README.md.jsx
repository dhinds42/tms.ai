# TMS.ai Design System

## Overview
Token-based design system ensuring visual consistency across all TMS.ai modules: Broker, Carrier, Customer, Owner-Operator, and Driver Mobile portals.

## Directory Structure

```
components/design-system/
├── tokens.css              # CSS custom properties
├── tokens.json             # JSON format (for JS/TS)
├── ValidationRules.js      # Field validation library
├── DesignAuditReport.md    # Audit findings & roadmap
└── README.md               # This file
```

## Quick Start

### 1. Import Tokens Globally

In `globals.css`:
```css
@import './components/design-system/tokens.css';
```

### 2. Use Tokens in Components

```jsx
// Using CSS variables
<div style={{
  padding: 'var(--space-6)',
  background: 'var(--color-surface-primary)',
  borderRadius: 'var(--radius-xl)',
  boxShadow: 'var(--shadow-lg)'
}}>
  <h1 style={{
    fontSize: 'var(--font-size-3xl)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-text-primary)'
  }}>
    Title
  </h1>
</div>
```

### 3. Use Validation Library

```jsx
import { ValidationRules, validateField } from '@/components/design-system/ValidationRules';

const handleEmailChange = (value) => {
  const result = validateField(value, ValidationRules.email);
  if (!result.valid) {
    setError(result.message);
  }
};
```

## Design Tokens Reference

### Spacing
Use for margins, padding, gaps:
- `--space-1` (4px) to `--space-24` (96px)

### Colors

#### Role Accents
- Broker: `--color-role-broker-accent` (#4f46e5 - Indigo)
- Carrier: `--color-role-carrier-accent` (#0284c7 - Sky Blue)
- Driver: `--color-role-driver-accent` (#7c3aed - Violet)
- Customer: `--color-role-customer-accent` (#059669 - Emerald)

#### Semantic
- Success: `--color-success-500` to `--color-success-700`
- Warning: `--color-warning-500` to `--color-warning-700`
- Error: `--color-error-500` to `--color-error-700`
- Info: `--color-info-500` to `--color-info-700`

#### Surface & Text
- Surface: `--color-surface-primary` (white), `--color-surface-secondary` (light gray)
- Text: `--color-text-primary` (dark), `--color-text-secondary`, `--color-text-tertiary`
- Border: `--color-border-default`, `--color-border-medium`, `--color-border-strong`

### Typography
- Font size: `--font-size-xs` (12px) to `--font-size-5xl` (48px)
- Font weight: `--font-weight-normal` to `--font-weight-bold`
- Line height: `--line-height-tight`, `--line-height-normal`, `--line-height-relaxed`

### Shadows
- `--shadow-sm` to `--shadow-2xl`
- `--shadow-inner` for inset shadows

### Border Radius
- `--radius-sm` (6px) to `--radius-2xl` (24px)
- `--radius-full` (9999px) for circles

## Validation Rules

### Available Validators
- `email` - RFC 5322 compliant email validation
- `phone` - Phone number with formatting
- `mcNumber` - MC number (5-7 digits)
- `dotNumber` - DOT number (5-8 digits)
- `cdlNumber` - CDL number (8-15 alphanumeric)
- `zipCode` - 5-digit or 5+4 ZIP codes
- `stateCode` - 2-letter state codes
- `currency` - Decimal currency amounts
- `weight` - Weight in lbs (1-100,000)
- `distance` - Distance in miles (1-10,000)
- `companyName`, `contactName` - String validation
- `date`, `futureDate` - Date validation

### Usage Example
```jsx
import { validateField, ValidationRules, FormFieldConfigs } from '@/components/design-system/ValidationRules';

// Single field validation
const emailValidation = validateField(email, ValidationRules.email);
if (!emailValidation.valid) {
  setEmailError(emailValidation.message);
}

// Entire form validation
import { validateForm } from '@/components/design-system/ValidationRules';
const { isValid, errors } = validateForm(formData, FormFieldConfigs.carrier);
```

## Component Patterns

### Consistent Form Field
```jsx
<div className="space-y-2">
  <Label htmlFor="email">
    Email <span className="text-red-600">*</span>
  </Label>
  <Input
    id="email"
    type="email"
    value={formData.email}
    onChange={handleEmailChange}
    className={error ? 'border-red-500' : ''}
    aria-required="true"
    aria-invalid={!!error}
  />
  {error && (
    <p className="text-sm text-red-600">{error}</p>
  )}
</div>
```

### Role-Themed Components
```jsx
const getRoleAccent = (role) => {
  const accents = {
    broker: 'var(--color-role-broker-accent)',
    carrier: 'var(--color-role-carrier-accent)',
    driver: 'var(--color-role-driver-accent)',
    customer: 'var(--color-role-customer-accent)'
  };
  return accents[role] || accents.broker;
};

<Button style={{ background: getRoleAccent(userRole) }}>
  Action
</Button>
```

## Migration Checklist

For each component:
- [ ] Replace hardcoded colors with tokens
- [ ] Replace hardcoded spacing with `--space-*` tokens
- [ ] Replace hardcoded shadows with `--shadow-*` tokens
- [ ] Replace hardcoded border-radius with `--radius-*` tokens
- [ ] Add validation using ValidationRules
- [ ] Add error message display
- [ ] Ensure accessibility (labels, aria attributes)
- [ ] Test on mobile and desktop

## Resources

- **Audit Report:** `DesignAuditReport.md`
- **Token Reference:** `tokens.css` and `tokens.json`
- **Validation Library:** `ValidationRules.js`

---

**Maintained by:** UI/UX Architecture Team  
**Last Updated:** December 11, 2025  
**Version:** 1.0.0