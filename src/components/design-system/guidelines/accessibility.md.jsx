# Accessibility Guidelines
## TMS.ai WCAG 2.1 AA Compliance

---

## 1. Overview

TMS.ai is committed to WCAG 2.1 Level AA compliance. This document outlines accessibility requirements and implementation patterns.

### Compliance Summary

| Principle | Status | Notes |
|-----------|--------|-------|
| Perceivable | ✅ | Color contrast, text alternatives |
| Operable | ✅ | Keyboard nav, focus management |
| Understandable | ✅ | Consistent UI, error handling |
| Robust | ✅ | Semantic HTML, ARIA |

---

## 2. Color & Contrast

### 2.1 Contrast Requirements

| Content Type | Minimum Ratio | Our Standard |
|--------------|---------------|--------------|
| Normal text (< 18px) | 4.5:1 | 7:1 |
| Large text (≥ 18px bold, ≥ 24px) | 3:1 | 4.5:1 |
| UI components | 3:1 | 3:1 |
| Non-text content | 3:1 | 3:1 |

### 2.2 Color Contrast Matrix

| Foreground | Background | Ratio | Pass |
|------------|------------|-------|------|
| `slate-800` (#1E293B) | white | 12.6:1 | ✅ AAA |
| `slate-600` (#475569) | white | 7.0:1 | ✅ AAA |
| `slate-500` (#64748B) | white | 4.6:1 | ✅ AA |
| `primary-600` (#4F46E5) | white | 5.4:1 | ✅ AA |
| white | `primary-600` | 5.4:1 | ✅ AA |
| `slate-100` (#F1F5F9) | `slate-900` | 15.4:1 | ✅ AAA |

### 2.3 Never Rely on Color Alone

```
❌ Wrong: Red = Error, Green = Success (color only)

✅ Correct:
   🔴 Error + "Error" text + icon
   ✅ Success + "Success" text + icon
```

### 2.4 Status Indicators

Always combine color with:
- Text label
- Icon
- Pattern or shape

```jsx
// Good: Color + icon + text
<Badge variant="danger">
  <AlertCircle className="w-3 h-3 mr-1" />
  Expired
</Badge>
```

---

## 3. Focus Management

### 3.1 Focus Indicators

All interactive elements must have visible focus states.

```css
/* Standard focus ring */
:focus-visible {
  outline: none;
  box-shadow: 
    0 0 0 2px var(--color-bg-surface),
    0 0 0 4px var(--color-primary-500);
}

/* High contrast focus for dark backgrounds */
[data-theme="dark"] :focus-visible {
  box-shadow: 
    0 0 0 2px var(--color-bg-surface),
    0 0 0 4px var(--color-primary-400);
}
```

### 3.2 Focus Order

Logical tab order following visual layout:

```
1. Skip link (hidden until focused)
2. Header navigation
3. Main content (top to bottom, left to right)
4. Sidebar (if present)
5. Footer
```

### 3.3 Skip Links

```html
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<main id="main-content" tabindex="-1">
  ...
</main>
```

```css
.skip-link {
  position: absolute;
  left: -9999px;
  z-index: 9999;
}

.skip-link:focus {
  left: 16px;
  top: 16px;
  padding: 8px 16px;
  background: var(--color-primary-600);
  color: white;
  border-radius: 4px;
}
```

### 3.4 Focus Trapping (Modals)

```jsx
// Focus trap for modals
useEffect(() => {
  const modal = modalRef.current;
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  modal.addEventListener('keydown', handleKeyDown);
  firstElement?.focus();

  return () => modal.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

## 4. Keyboard Navigation

### 4.1 Required Keyboard Support

| Element | Keys | Action |
|---------|------|--------|
| Button | `Enter`, `Space` | Activate |
| Link | `Enter` | Navigate |
| Checkbox | `Space` | Toggle |
| Radio | `↑↓←→` | Select option |
| Select | `↑↓`, `Enter` | Navigate, select |
| Tab | `←→` | Switch tabs |
| Modal | `Escape` | Close |
| Menu | `↑↓`, `Enter`, `Escape` | Navigate, select, close |

### 4.2 Custom Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Ctrl+K` | Global search | Anywhere |
| `Ctrl+N` | New load | Load board |
| `Escape` | Close modal/dropdown | Any overlay |
| `?` | Show keyboard shortcuts | Global |

### 4.3 Table Navigation

```
Tab      → Move to next interactive element
↑↓       → Navigate rows (when focused on table)
←→       → Navigate columns (in editable tables)
Space    → Toggle row selection
Enter    → Open row details
Ctrl+A   → Select all rows
```

---

## 5. Screen Reader Support

### 5.1 Semantic HTML

Always use semantic elements:

```html
<!-- Structure -->
<header>, <nav>, <main>, <aside>, <footer>

<!-- Content -->
<h1> to <h6> (proper hierarchy)
<ul>, <ol>, <li>
<table>, <thead>, <tbody>, <th>, <td>

<!-- Interactive -->
<button> (not <div onclick>)
<a href="..."> (not <span onclick>)
```

### 5.2 ARIA Attributes

#### Landmarks

```html
<nav aria-label="Main navigation">
<nav aria-label="Breadcrumb">
<main aria-label="Load details">
<aside aria-label="Filters">
```

#### Live Regions

```html
<!-- Polite: Announces when idle -->
<div role="status" aria-live="polite">
  Load created successfully
</div>

<!-- Assertive: Interrupts immediately -->
<div role="alert" aria-live="assertive">
  Error: Invalid input
</div>
```

#### Form Labels

```html
<!-- Visible label -->
<label for="email">Email address</label>
<input id="email" type="email" />

<!-- Hidden label (icon-only buttons) -->
<button aria-label="Close modal">
  <X className="w-4 h-4" />
</button>

<!-- Described by helper text -->
<input 
  id="password" 
  type="password"
  aria-describedby="password-hint"
/>
<span id="password-hint">Must be at least 8 characters</span>
```

#### States

```html
<!-- Expanded/collapsed -->
<button aria-expanded="true" aria-controls="menu">
  Options
</button>
<div id="menu" role="menu">...</div>

<!-- Selected -->
<div role="tab" aria-selected="true">Active Tab</div>

<!-- Disabled -->
<button aria-disabled="true">Submit</button>

<!-- Loading -->
<button aria-busy="true">
  <Spinner /> Loading...
</button>

<!-- Invalid -->
<input aria-invalid="true" aria-errormessage="email-error" />
<span id="email-error" role="alert">Invalid email format</span>
```

### 5.3 Hiding Decorative Content

```html
<!-- Hide from screen readers -->
<img src="decorative.svg" alt="" aria-hidden="true" />
<span aria-hidden="true">•</span>

<!-- Icons with text -->
<button>
  <Truck aria-hidden="true" />
  <span>View Fleet</span>
</button>

<!-- Icon-only (needs label) -->
<button aria-label="View fleet">
  <Truck aria-hidden="true" />
</button>
```

---

## 6. Forms

### 6.1 Labels

Every input must have an associated label:

```html
<!-- Explicit association -->
<label for="firstName">First Name *</label>
<input id="firstName" required />

<!-- Implicit association -->
<label>
  <span>First Name *</span>
  <input required />
</label>
```

### 6.2 Required Fields

```html
<label for="email">
  Email address
  <span aria-hidden="true">*</span>
</label>
<input 
  id="email" 
  type="email" 
  required
  aria-required="true"
/>
```

### 6.3 Error Messages

```html
<div class="form-field" data-invalid="true">
  <label for="email">Email address</label>
  <input 
    id="email" 
    type="email"
    aria-invalid="true"
    aria-describedby="email-error"
  />
  <span id="email-error" class="error" role="alert">
    Please enter a valid email address
  </span>
</div>
```

### 6.4 Form Validation

- Validate on blur for immediate feedback
- Show inline errors below fields
- Summarize errors at form top on submit
- Focus first invalid field

---

## 7. Images & Media

### 7.1 Alt Text

| Image Type | Alt Text |
|------------|----------|
| Informative | Describe content/purpose |
| Decorative | `alt=""` (empty) |
| Functional | Describe action |
| Complex | Short alt + long description |

```html
<!-- Informative -->
<img src="driver.jpg" alt="Driver John Doe, CDL-A" />

<!-- Decorative -->
<img src="pattern.svg" alt="" />

<!-- Functional -->
<img src="search.svg" alt="Search loads" />

<!-- Complex (chart) -->
<img 
  src="revenue-chart.png" 
  alt="Revenue chart showing 15% growth"
  aria-describedby="chart-description"
/>
<p id="chart-description" class="sr-only">
  Monthly revenue from January to December 2025...
</p>
```

### 7.2 Icons

```jsx
// Decorative icon (has text)
<Button>
  <Plus className="w-4 h-4" aria-hidden="true" />
  Create Load
</Button>

// Meaningful icon (no text)
<IconButton aria-label="Delete load">
  <Trash className="w-4 h-4" aria-hidden="true" />
</IconButton>
```

---

## 8. Touch & Pointer

### 8.1 Touch Targets

| Size | Usage |
|------|-------|
| 44×44px | Minimum for touch |
| 48×48px | Recommended |
| 24×24px | Only with generous spacing |

### 8.2 Pointer Cancellation

Allow users to cancel actions:

```jsx
// Use onClick (up event), not onMouseDown
<button onClick={handleAction}>Action</button>

// For drag: confirm on drop, not on drag start
```

### 8.3 Spacing

Minimum 8px between touch targets to prevent mis-taps.

---

## 9. Motion & Animation

### 9.1 Reduced Motion

Respect user preferences:

```css
/* Default animations */
.animated {
  transition: transform 200ms ease;
}

/* Reduce or remove for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .animated {
    transition: none;
  }
  
  .spinner {
    animation: none;
  }
}
```

### 9.2 Auto-Playing Content

- No auto-playing video with sound
- Provide pause/stop controls
- Auto-advancing carousels must be pausable

---

## 10. Testing Checklist

### Automated Testing

- [ ] Run axe DevTools
- [ ] Run Lighthouse accessibility audit
- [ ] Validate HTML (no duplicate IDs)
- [ ] Check color contrast (WebAIM)

### Manual Testing

- [ ] Navigate entire page with Tab key
- [ ] Operate all controls with keyboard
- [ ] Test with screen reader (NVDA/VoiceOver)
- [ ] Zoom to 200% — content readable
- [ ] Test at 320px viewport width
- [ ] Disable CSS — content order logical

### Screen Reader Testing

- [ ] All content announced
- [ ] Headings hierarchy correct
- [ ] Links/buttons have accessible names
- [ ] Form labels announced
- [ ] Errors announced immediately
- [ ] Dynamic content announced (live regions)

---

## 11. Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/)

---

*All components in TMS.ai must pass accessibility review before release.*