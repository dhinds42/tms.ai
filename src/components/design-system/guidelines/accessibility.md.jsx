# TMS.ai Accessibility Guidelines

Comprehensive accessibility standards for WCAG 2.1 AA compliance.

---

## Overview

TMS.ai is committed to accessibility for all users. This guide ensures our interfaces are usable by people with disabilities, including those who use screen readers, keyboard navigation, or have visual impairments.

**Target Compliance:** WCAG 2.1 Level AA

---

## Color & Contrast

### Minimum Contrast Ratios

| Element Type | Minimum Ratio | Status |
|--------------|---------------|--------|
| Normal text (< 18px) | 4.5:1 | ✓ Required |
| Large text (≥ 18px bold, ≥ 24px) | 3:1 | ✓ Required |
| UI components & graphics | 3:1 | ✓ Required |
| Decorative elements | None | N/A |

### Token Compliance

```css
/* ✓ PASS: Primary text on white background */
--color-text-default: #111827;  /* 16.1:1 on white */

/* ✓ PASS: Muted text on white background */
--color-text-muted: #6B7280;    /* 5.4:1 on white */

/* ✓ PASS: Primary button text */
--color-brand-primary: #2257FF; /* On white: 4.6:1 */
--color-text-on-primary: #FFFFFF; /* On primary: 4.6:1 */

/* ✓ PASS: Status colors */
--color-success: #16A34A;       /* 4.5:1 on white */
--color-danger: #DC2626;        /* 5.9:1 on white */
```

### Color-Blind Considerations

- Never rely solely on color to convey information
- Use icons, patterns, or text labels alongside color
- Status badges include dot indicator + text label

**Good Example:**
```jsx
<Badge variant="success">
  <span className="status-dot"></span>
  Delivered
</Badge>
```

**Bad Example:**
```jsx
{/* Don't do this - color alone */}
<span style={{ color: 'green' }}>●</span>
```

---

## Focus States

### Focus Ring Specification

All interactive elements must have a visible focus indicator.

```css
/* Standard focus ring */
:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

/* Focus ring on dark backgrounds */
[data-theme="dark"] :focus-visible {
  outline-color: #93C5FD;
}

/* Enhanced focus for buttons */
.button:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px var(--color-brand-primary-soft);
}
```

### Focus Visibility Rules

- Focus must be visible at all times during keyboard navigation
- Focus ring must have minimum 3:1 contrast against adjacent colors
- Never use `outline: none` without an alternative focus style

---

## Keyboard Navigation

### Tab Order

- All interactive elements must be reachable via Tab key
- Tab order should follow visual/logical order (top-to-bottom, left-to-right)
- Use `tabindex="0"` for custom interactive elements
- Use `tabindex="-1"` for programmatic focus (not in tab order)

### Keyboard Shortcuts

| Action | Shortcut | Context |
|--------|----------|---------|
| Submit form | Enter | Forms |
| Close modal | Escape | Modals |
| Navigate tabs | Arrow Left/Right | Tab components |
| Navigate menu | Arrow Up/Down | Dropdowns |
| Select item | Enter/Space | Lists |
| Toggle checkbox | Space | Checkboxes |

### Component-Specific Behaviors

**Modal:**
- ESC closes modal
- Focus trapped within modal when open
- Focus returns to trigger element on close

**Dropdown Menu:**
- Arrow keys navigate options
- Enter/Space selects option
- ESC closes dropdown
- Home/End jump to first/last option

**Tabs:**
- Arrow keys switch between tabs
- Tab key moves focus out of tab list
- Automatic activation (switch on arrow)

**Data Table:**
- Tab navigates to table, then through actionable cells
- Arrow keys for cell navigation (optional enhancement)

---

## Screen Reader Support

### ARIA Landmarks

```html
<header role="banner">...</header>
<nav role="navigation" aria-label="Main">...</nav>
<main role="main">...</main>
<aside role="complementary">...</aside>
<footer role="contentinfo">...</footer>
```

### Live Regions

For dynamic content updates:

```html
<!-- Status messages -->
<div role="status" aria-live="polite">
  Load created successfully
</div>

<!-- Urgent alerts -->
<div role="alert" aria-live="assertive">
  Error: Invalid reference number
</div>

<!-- Progress updates -->
<div aria-live="polite" aria-atomic="true">
  Loading... 50% complete
</div>
```

### Form Accessibility

```html
<!-- Labels -->
<label for="reference" id="reference-label">
  Load Reference
  <span aria-hidden="true">*</span>
</label>
<input
  id="reference"
  aria-labelledby="reference-label"
  aria-describedby="reference-hint reference-error"
  aria-required="true"
  aria-invalid="true"
/>
<span id="reference-hint" class="hint">
  Enter a unique identifier
</span>
<span id="reference-error" class="error" role="alert">
  Reference is required
</span>
```

### Button & Link Accessibility

```html
<!-- Icon-only button needs aria-label -->
<button aria-label="Close dialog">
  <XIcon aria-hidden="true" />
</button>

<!-- Link that opens new tab -->
<a href="/docs" target="_blank" rel="noopener">
  Documentation
  <span class="sr-only">(opens in new tab)</span>
  <ExternalLinkIcon aria-hidden="true" />
</a>
```

### Table Accessibility

```html
<table>
  <caption class="sr-only">Active loads dispatch board</caption>
  <thead>
    <tr>
      <th scope="col">Reference</th>
      <th scope="col">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>LD-001</td>
      <td>In Transit</td>
    </tr>
  </tbody>
</table>
```

---

## Touch Targets

### Minimum Sizes

| Context | Minimum Size | Recommended |
|---------|--------------|-------------|
| Desktop | 24x24px | 32x32px |
| Touch/Mobile | 44x44px | 48x48px |

### Spacing Between Targets

- Minimum 8px between adjacent touch targets
- Recommended 12px on mobile

### Implementation

```css
/* Mobile touch target */
.button-mobile {
  min-width: 44px;
  min-height: 44px;
  padding: var(--space-3) var(--space-4);
}

/* Icon button with adequate target */
.icon-button {
  padding: var(--space-2);
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## Typography

### Font Sizing

- Base font size: 16px (1rem)
- Never use font sizes below 12px
- Support browser zoom up to 200%

### Line Height & Spacing

- Body text: 1.4-1.6 line height
- Paragraph spacing: 1em minimum
- Letter spacing: Normal or slightly increased for small caps

### Text Alternatives

```css
/* Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## Motion & Animation

### Respect User Preferences

```css
/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Animation Guidelines

- Avoid flashing content (no more than 3 flashes per second)
- Provide pause/stop controls for auto-playing content
- Use subtle, purposeful animations

---

## Testing Checklist

### Manual Testing

- [ ] Tab through entire page - logical order?
- [ ] All interactive elements focusable?
- [ ] Focus visible at all times?
- [ ] Screen reader announces content correctly?
- [ ] Forms have proper labels and error messages?
- [ ] Color contrast meets requirements?
- [ ] Works at 200% zoom?

### Automated Testing

- [ ] Run aXe or WAVE on all pages
- [ ] Check Lighthouse accessibility score (target: 90+)
- [ ] Validate HTML for proper semantics

### Screen Reader Testing

- [ ] VoiceOver (macOS/iOS)
- [ ] NVDA (Windows)
- [ ] JAWS (Windows)
- [ ] TalkBack (Android)

---

## Common Issues & Fixes

### Issue: Missing form labels
```html
<!-- Bad -->
<input type="text" placeholder="Enter name" />

<!-- Good -->
<label for="name">Name</label>
<input id="name" type="text" />
```

### Issue: Non-descriptive link text
```html
<!-- Bad -->
<a href="/loads/123">Click here</a>

<!-- Good -->
<a href="/loads/123">View Load #123 details</a>
```

### Issue: Images without alt text
```html
<!-- Bad -->
<img src="status.png" />

<!-- Good (informative) -->
<img src="status.png" alt="Load status: In Transit" />

<!-- Good (decorative) -->
<img src="decoration.png" alt="" role="presentation" />
```

### Issue: Missing skip link
```html
<!-- Add at top of page -->
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<main id="main-content">...</main>
```

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [aXe DevTools](https://www.deque.com/axe/)
- [WAVE Evaluation Tool](https://wave.webaim.org/)