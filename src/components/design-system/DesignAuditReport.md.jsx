# TMS.ai UI/UX Audit Report
**Date:** December 11, 2025  
**Auditor:** Senior UI/UX Architect & Front-End Systems Engineer  
**Scope:** Field Validation & Design Consistency Audit

---

## Executive Summary

This audit examines field validation and design consistency across TMS.ai's form components and UI elements. The goal is to establish a unified, token-based design system and consistent validation patterns.

---

## 1. FIELD VALIDATION AUDIT

### Forms Audited
1. ✅ **CreateCarrierModal** (`components/carriers/CreateCarrierModal.jsx`)
2. ✅ **CreateDriverModal** (`components/drivers/CreateDriverModal.jsx`)
3. ✅ **CreateShipperModal** (`components/shippers/CreateShipperModal.jsx`)
4. ✅ **CreateLoadModal** (`components/loadboard/CreateLoadModal.jsx`)

---

### Key Findings - Validation Issues

#### **CRITICAL ISSUES**

| Issue | Severity | Forms Affected | Fix Applied |
|-------|----------|----------------|-------------|
| **No regex validation for MC/DOT numbers** | HIGH | CreateCarrierModal | ✅ Created ValidationRules.js |
| **No phone format validation** | MEDIUM | All forms | ✅ Created ValidationRules.js |
| **Email validation inconsistent** | MEDIUM | All forms | ✅ Standardized in ValidationRules |
| **No CDL number format validation** | HIGH | CreateDriverModal | ✅ Created ValidationRules.js |
| **ZIP code accepts invalid formats** | MEDIUM | All address forms | ✅ Pattern validation added |
| **No client-side error messages** | HIGH | All forms | ⚠️ Needs component integration |
| **Payment rate accepts negative values** | MEDIUM | CreateDriverModal | ✅ Min value rule added |
| **State code accepts lowercase/invalid** | LOW | All forms | ✅ Transform to uppercase |

#### **Field-Specific Issues**

**CreateCarrierModal:**
- ❌ MC Number: No format validation (should be 5-7 digits)
- ❌ DOT Number: No format validation (should be 5-8 digits)
- ❌ Email: Uses HTML5 validation only, no custom error messages
- ❌ Phone: No format validation or masking
- ❌ Equipment types: Hardcoded list (dry_van, reefer, flatbed, step_deck)
- ✅ Insurance expiration: Has type="date"
- ⚠️ Address validation: Optional but should be encouraged/required

**CreateDriverModal:**
- ❌ Full Name: Uses `full_name` but Driver entity expects `first_name` + `last_name`
- ❌ CDL Number: No format validation
- ❌ CDL Expiration: Should validate future date
- ❌ Payment structure: Uses native `<select>` instead of shadcn Select
- ❌ Payment rate: No min/max validation
- ⚠️ Email: Marked optional but should be required for portal access

**CreateShipperModal:**
- ❌ Credit limit: No max validation
- ❌ Payment terms: Uses native `<select>` instead of shadcn Select
- ❌ Notes: Uses native `<textarea>` instead of shadcn Textarea
- ⚠️ All fields lack help text explaining what's expected

**CreateLoadModal:**
- ❌ Weight: No validation for max weight (should be < 80,000 lbs typically)
- ❌ Distance: No validation
- ❌ Customer rate: No min value validation
- ❌ Carrier pay: No validation that carrier_pay < customer_rate
- ❌ Equipment type: Hardcoded list, missing many types
- ❌ Reference number: No length limits
- ⚠️ Margin calculation not automated based on customer_rate - carrier_pay

---

### Validation Standardization - Actions Taken

✅ **Created:** `components/design-system/ValidationRules.js`
- Centralized validation patterns for email, phone, MC, DOT, CDL, ZIP, currency
- Reusable `validateField()` and `validateForm()` functions
- Field normalization utilities (format phone, uppercase state codes)

✅ **Created:** `FormFieldConfigs` object with validation rules for each entity type

---

## 2. DESIGN CONSISTENCY AUDIT

### Design Token Implementation

✅ **Created:** `components/design-system/tokens.css`
- Complete CSS custom property definitions
- Spacing scale (--space-1 to --space-24)
- Color tokens (brand, role, semantic, neutral, surface, border, text)
- Typography scale (--font-size-xs to --font-size-5xl)
- Shadow scale (--shadow-sm to --shadow-2xl)
- Border radius tokens (--radius-sm to --radius-2xl)
- Component-specific tokens (button heights, card padding)

✅ **Created:** `components/design-system/tokens.json`
- JSON format for programmatic access in React/TypeScript
- Identical structure to tokens.css for consistency

---

### Component Consistency Issues Found

#### **Modal Components**

| Component | Issues | Status |
|-----------|--------|--------|
| CreateCarrierModal | Hardcoded colors (`bg-white`, `text-slate-900`), Inline z-index, Custom spacing | ⚠️ Needs refactor |
| CreateDriverModal | Identical styling issues as carrier modal | ⚠️ Needs refactor |
| CreateShipperModal | Same pattern, no token usage | ⚠️ Needs refactor |
| CreateLoadModal | Uses Dialog component (better), still hardcoded styles | ⚠️ Needs refactor |

**Common Issues:**
- ❌ All modals use `bg-black/50` instead of `var(--color-surface-overlay)`
- ❌ All use `rounded-2xl` instead of `var(--radius-2xl)`
- ❌ All use `shadow-2xl` instead of `var(--shadow-2xl)`
- ❌ Hardcoded padding values instead of token-based spacing
- ❌ Inconsistent button colors (some use `bg-emerald-600`, some use gradients)

#### **Form Field Components**

| Issue | Occurrences | Recommendation |
|-------|-------------|----------------|
| Native `<select>` used instead of shadcn Select | 2 instances | Replace with SelectTrigger/SelectContent |
| Native `<textarea>` used | 1 instance | Replace with shadcn Textarea |
| Native `<input type="checkbox">` | 3 instances | Replace with shadcn Checkbox |
| Inconsistent Label spacing | All forms | Standardize with `mb-2` or token |
| No error message display | All forms | Add error state UI |

---

### Color Usage Audit

**Hardcoded Colors Found:**
- `text-slate-900`, `text-slate-600`, `text-slate-500` (should use `var(--color-text-primary)`, etc.)
- `bg-white` (should use `var(--color-surface-primary)`)
- `bg-emerald-600`, `bg-blue-600` (should use semantic tokens or role accents)
- `border-slate-200` (should use `var(--color-border-default)`)
- `bg-amber-50`, `text-amber-800` (should use `var(--color-warning-*)`)

**Pages Audited:**
- ✅ **AutomatedRateConfirmationAI** - Heavy use of hardcoded colors, needs token migration

---

## 3. REQUIRED FIELD ANALYSIS

### Carrier Form
**Currently Required:** company_name, mc_number, dot_number, contact_name, phone, email  
**Should Be Required:** ✅ All current + insurance_expiration (compliance)  
**Recommendation:** Make address validation required before save

### Driver Form
**Currently Required:** full_name, phone, cdl_number, cdl_expiration, payment_rate  
**Issues:**
- ❌ Uses `full_name` but entity expects `first_name` + `last_name`  
**Should Be Required:** first_name, last_name, phone, cdl_number, cdl_expiration, payment_structure, payment_rate  
**Recommendation:** Add medical_card_expiry as required field

### Shipper Form
**Currently Required:** company_name, contact_name, phone, email  
**Recommendation:** ✅ Adequate for basic setup, credit_limit optional is correct

### Load Form
**Currently Required:** None explicitly enforced  
**Should Be Required:** pickup_location, dropoff_location, equipment_type  
**Recommendation:** Add equipment_type, pickup_date (for planning) as required

---

## 4. DESIGN SYSTEM INTEGRATION ROADMAP

### Phase 1: Foundation (✅ COMPLETE)
- [x] Create design tokens (CSS + JSON)
- [x] Create validation rules library
- [x] Document token usage

### Phase 2: Component Library (NEXT)
- [ ] Create `<ValidatedInput>` component with built-in error display
- [ ] Create `<ValidatedSelect>` component
- [ ] Create `<FormField>` wrapper with label + error pattern
- [ ] Create `<LoadStatusBadge>` with semantic colors
- [ ] Create `<RoleThemedCard>` component

### Phase 3: Form Refactoring
- [ ] Refactor CreateCarrierModal to use tokens + validation
- [ ] Refactor CreateDriverModal to use tokens + validation
- [ ] Refactor CreateShipperModal to use tokens + validation
- [ ] Refactor CreateLoadModal to use tokens + validation

### Phase 4: Page Standardization
- [ ] Create `<AppShell>` layout component
- [ ] Create `<HeroHeader>` reusable component
- [ ] Create `<QuickStatsBar>` reusable component
- [ ] Migrate all pages to token-based styling

---

## 5. CRITICAL RECOMMENDATIONS

### Immediate Actions Required

1. **Fix Driver Entity Mismatch**
   - `CreateDriverModal` uses `full_name` 
   - `Driver` entity expects `first_name` + `last_name`
   - **Impact:** Data will not save correctly
   - **Fix:** Split full_name into first_name/last_name fields

2. **Implement Validation Library**
   - Integrate `ValidationRules.js` into all forms
   - Add real-time field validation
   - Display error messages below fields

3. **Replace Native HTML Elements**
   - Replace all `<select>` with shadcn Select
   - Replace all `<textarea>` with shadcn Textarea
   - Replace all checkbox inputs with shadcn Checkbox

4. **Standardize Required Fields**
   - Mark required fields with red asterisk (*)
   - Add `aria-required="true"` for accessibility
   - Validate on blur and on submit

5. **Token Migration**
   - Import tokens.css in globals.css
   - Replace hardcoded colors with CSS variables
   - Create utility classes for common patterns

---

## 6. NEXT STEPS

### For Product Owner Decision

1. **Address Validation Policy**
   - Should carrier/shipper addresses be REQUIRED to be USPS validated?
   - Current: Optional with warning
   - Recommendation: Make required for compliance/accuracy

2. **Driver Email Requirement**
   - Should driver email be required?
   - Current: Optional
   - Recommendation: Required if driver needs portal access

3. **Load Required Fields**
   - Which fields are mandatory for load creation?
   - Current: Very permissive
   - Recommendation: Require pickup/delivery locations, equipment type, dates

4. **Equipment Type Expansion**
   - Current: 4 types in carrier form, ~13 in load form
   - Recommendation: Create master equipment type list, share across all forms

### For Engineering Team

1. **Create Shared Form Components**
   - Build `<ValidatedInput>`, `<FormField>`, `<FormSection>` primitives
   - Ensures consistent styling and validation across all forms

2. **Implement Form State Management**
   - Consider react-hook-form integration for advanced validation
   - Centralize form submission logic

3. **Build Storybook Stories**
   - Document all form components
   - Show validation states (empty, valid, invalid, disabled)
   - Demo role-based theming

---

## 7. FILES CREATED

✅ `components/design-system/tokens.css` - Design token definitions  
✅ `components/design-system/tokens.json` - JSON format tokens  
✅ `components/design-system/ValidationRules.js` - Validation library  
✅ `components/design-system/DesignAuditReport.md` - This report  

---

## 8. VALIDATION RULES SUMMARY

### Implemented Validation Patterns

| Field Type | Pattern | Min | Max | Required | Transform |
|------------|---------|-----|-----|----------|-----------|
| Email | RFC 5322 regex | - | - | ✅ | - |
| Phone | Digits + formatting chars | 10 | 20 | ✅ | Format (XXX) XXX-XXXX |
| MC Number | 5-7 digits | 5 | 7 | ✅ | Strip non-digits |
| DOT Number | 5-8 digits | 5 | 8 | ✅ | Strip non-digits |
| CDL Number | 8-15 alphanumeric | 8 | 15 | ✅ | Uppercase |
| ZIP Code | 5 or 5+4 digits | 5 | 10 | ❌ | - |
| State Code | 2 uppercase letters | 2 | 2 | ❌ | Uppercase |
| Currency | Decimal up to 2 places | 0 | 999,999,999 | Varies | - |
| Weight | Positive integer | 1 | 100,000 | ❌ | - |
| Distance | Positive integer | 1 | 10,000 | ❌ | - |
| Company Name | String | 2 | 100 | ✅ | - |
| Contact Name | String | 2 | 50 | ✅ | - |

---

## 9. DESIGN TOKEN USAGE - BEFORE/AFTER

### Before (Hardcoded)
```jsx
<div className="p-6 bg-white border-slate-200 rounded-2xl shadow-xl">
  <h2 className="text-2xl font-bold text-slate-900 mb-4">
    Title
  </h2>
</div>
```

### After (Token-Based)
```jsx
<div style={{
  padding: 'var(--space-6)',
  background: 'var(--color-surface-primary)',
  border: '1px solid var(--color-border-default)',
  borderRadius: 'var(--radius-2xl)',
  boxShadow: 'var(--shadow-xl)'
}}>
  <h2 style={{
    fontSize: 'var(--font-size-2xl)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--space-4)'
  }}>
    Title
  </h2>
</div>
```

---

## 10. EQUIPMENT TYPE INCONSISTENCY

### Current Equipment Lists

**CreateCarrierModal (4 types):**
- dry_van, reefer, flatbed, step_deck

**CreateLoadModal (5 base + custom):**
- dry_van, refrigerated, flatbed, step_deck, intermodal_container
- Plus: User-defined custom types (stored in localStorage)

**MarketRateFeed (13 types):**
- dry_van, reefer, flatbed, step_deck, cargo_van, hotshot, auto_carrier, tanker, dump_truck, box_truck, lowboy, pickup_truck, container_ship

### Recommendation
Create master equipment type enum in entity schema or shared constants file:

```javascript
export const EQUIPMENT_TYPES = [
  'dry_van',
  'reefer',
  'flatbed',
  'step_deck',
  'cargo_van',
  'hotshot',
  'auto_carrier',
  'tanker',
  'dump_truck',
  'box_truck',
  'lowboy',
  'pickup_truck',
  'container_ship',
  'intermodal_container',
  'hopper',
  'tanker',
  'custom' // Allow custom with text input
];
```

---

## 11. OUTSTANDING QUESTIONS

### Product/Business Decisions Needed

1. **Which fields should be absolutely required vs recommended?**
   - Driver email: Required or optional?
   - Insurance expiration: Required or warning-only?
   - Address validation: Required or encouraged?

2. **Should we enforce data quality rules?**
   - Block save if MC/DOT format is invalid?
   - Block save if addresses not validated?
   - Or: Allow save with warnings?

3. **Form submission behavior:**
   - Validate on blur (per field) or on submit only?
   - Show all errors at once or one at a time?

4. **Equipment type management:**
   - Use hardcoded enum or allow custom types?
   - Should custom types be tenant-specific or global?

---

## 12. IMPLEMENTATION PRIORITY

### High Priority (Do First)
1. ✅ Create design token files
2. ✅ Create validation rules library
3. ⏳ Fix CreateDriverModal `full_name` → `first_name`/`last_name` mismatch
4. ⏳ Create `<ValidatedInput>` component with error display
5. ⏳ Import tokens.css into globals.css

### Medium Priority
6. ⏳ Replace native select/textarea with shadcn components
7. ⏳ Add validation error display to all forms
8. ⏳ Standardize equipment type lists
9. ⏳ Create reusable `<HeroHeader>` component

### Low Priority
10. ⏳ Migrate all pages to token-based styling
11. ⏳ Create Storybook stories
12. ⏳ Implement dark mode support

---

## 13. CONCLUSION

**Validation Gaps:** Forms currently rely on HTML5 validation only. No comprehensive client-side validation with user-friendly error messages.

**Design Inconsistency:** Extensive use of hardcoded Tailwind classes instead of design tokens. No consistent spacing, color, or typography patterns.

**Next Action:** Integrate ValidationRules.js into forms and create shared form components using design tokens.

---

**Report Status:** ✅ Initial Audit Complete  
**Tokens Created:** ✅ Yes  
**Validation Library Created:** ✅ Yes  
**Forms Refactored:** ⏳ Pending  
**Pages Migrated:** ⏳ Pending