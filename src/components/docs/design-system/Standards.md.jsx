# Design Standards & Documentation
## TMS.ai Design System - Guidelines & Handoff

---

## 1. Naming Conventions

### 1.1 Component Naming

| Type | Pattern | Example |
|------|---------|---------|
| Atoms | `{Element}` | `Button`, `Input`, `Badge` |
| Molecules | `{Element}{Modifier}` | `LoadCard`, `DriverCard` |
| Organisms | `{Module}{Component}` | `DispatchConsole`, `LoadBoard` |
| Pages | `{Feature}Page` | `DashboardPage`, `LoadBoardPage` |

### 1.2 File Naming

```
components/
├── ui/                    # Atomic components
│   ├── button.jsx
│   ├── input.jsx
│   └── badge.jsx
├── loadboard/             # Feature components
│   ├── LoadCard.jsx
│   ├── LoadFilters.jsx
│   └── CreateLoadModal.jsx
└── layout/
    ├── Sidebar.jsx
    └── Header.jsx

pages/
├── Dashboard.jsx
├── LoadBoard.jsx
└── Drivers.jsx
```

### 1.3 CSS/Token Naming

| Category | Pattern | Example |
|----------|---------|---------|
| Colors | `--color-{semantic}` | `--color-primary`, `--color-error` |
| Spacing | `--space-{scale}` | `--space-4`, `--space-8` |
| Typography | `--text-{size}` | `--text-sm`, `--text-xl` |
| Shadows | `--shadow-{size}` | `--shadow-md`, `--shadow-lg` |

---

## 2. Usage Guidelines

### 2.1 Button Usage

| Variant | When to Use |
|---------|-------------|
| Primary | Main CTA, submit forms, key actions |
| Secondary | Alternative actions, secondary CTAs |
| Outline | Tertiary actions, less emphasis |
| Ghost | Navigation, subtle actions |
| Destructive | Delete, cancel, dangerous operations |

**Do:**
- Use one primary button per screen/modal
- Include icons for clarity
- Maintain consistent sizing in groups

**Don't:**
- Use multiple primary buttons
- Use destructive for non-dangerous actions
- Mix sizes in button groups

### 2.2 Form Patterns

**Input States:**
```
Default  → User sees empty/filled field
Focus    → User clicks/tabs into field
Error    → Validation fails
Success  → Validation passes (optional)
Disabled → Cannot interact
```

**Validation Timing:**
- Real-time for format validation (email, phone)
- On blur for complex validation
- On submit for form-level validation

### 2.3 Modal Usage

| Size | Use Case |
|------|----------|
| sm (400px) | Confirmations, simple alerts |
| md (560px) | Standard forms, details |
| lg (720px) | Complex forms, multi-step |
| xl (900px) | Data-heavy views |
| full | Full-screen workflows |

**Behavior Rules:**
- Escape key closes modal
- Click outside closes (unless critical)
- Focus trapped within modal
- Scroll within modal, not page

### 2.4 Table Best Practices

**Column Priority (for responsive):**
1. Primary identifier (Load #, Name)
2. Status
3. Key data points
4. Actions

**Sorting:**
- Click header to sort
- Arrow indicates direction
- Default sort by most relevant column

**Selection:**
- Checkbox in first column
- Bulk actions appear when selected
- "Select all" selects current page

---

## 3. Accessibility Standards

### 3.1 WCAG 2.1 AA Requirements

| Requirement | Standard | How We Comply |
|-------------|----------|---------------|
| Color Contrast | 4.5:1 (normal), 3:1 (large) | All text meets ratios |
| Focus Visible | Visible indicator | 2px ring on focus |
| Target Size | 44x44px minimum | Touch targets sized |
| Labels | All inputs labeled | Label + aria-label |
| Alt Text | All images | Descriptive alt attributes |

### 3.2 Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move to next focusable |
| Shift+Tab | Move to previous focusable |
| Enter | Activate button/link |
| Space | Toggle checkbox/button |
| Escape | Close modal/dropdown |
| Arrow Keys | Navigate within component |

### 3.3 Screen Reader Support

```jsx
// Good: Descriptive labels
<button aria-label="Create new load">
  <Plus className="w-4 h-4" />
  Create Load
</button>

// Good: Status announcements
<div role="status" aria-live="polite">
  Load created successfully
</div>

// Good: Form errors
<input 
  aria-invalid="true"
  aria-describedby="email-error"
/>
<span id="email-error">Please enter a valid email</span>
```

### 3.4 Color Accessibility

**Never rely on color alone:**
```
❌ Red = Error, Green = Success (color only)
✅ 🔴 Error + "Error" text + icon
✅ ✅ Success + "Success" text + icon
```

---

## 4. Theming Mechanism

### 4.1 Light/Dark Mode

```css
/* Light Mode (default) */
:root {
  --bg-page: #F8FAFC;
  --bg-card: #FFFFFF;
  --text-primary: #1E293B;
  --text-secondary: #64748B;
  --border: #E2E8F0;
}

/* Dark Mode */
[data-theme="dark"] {
  --bg-page: #0F172A;
  --bg-card: #1E293B;
  --text-primary: #F1F5F9;
  --text-secondary: #94A3B8;
  --border: #334155;
}
```

### 4.2 Mode-Specific Theming

```css
/* Broker Mode */
[data-mode="broker"] {
  --mode-primary: #6366F1;      /* Indigo */
  --mode-secondary: #8B5CF6;    /* Purple */
  --mode-gradient: linear-gradient(135deg, #6366F1, #8B5CF6);
  --mode-accent: #818CF8;
}

/* Carrier Mode */
[data-mode="carrier"] {
  --mode-primary: #2563EB;      /* Blue */
  --mode-secondary: #0EA5E9;    /* Cyan */
  --mode-gradient: linear-gradient(135deg, #2563EB, #0EA5E9);
  --mode-accent: #3B82F6;
}
```

### 4.3 Theme Toggle Implementation

```jsx
// Theme Provider
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [mode, setMode] = useState('broker');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-mode', mode);
  }, [theme, mode]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

---

## 5. Versioning & Documentation Strategy

### 5.1 Version Scheme

```
MAJOR.MINOR.PATCH
  │     │     └── Bug fixes, small tweaks
  │     └──────── New components, features
  └────────────── Breaking changes
```

**Current Version:** 1.0.0

### 5.2 Change Log Format

```markdown
## [1.1.0] - 2026-01-15
### Added
- Dark mode support
- New LoadCard variant for mobile
- Driver mobile interface components

### Changed
- Button hover states updated
- Card shadow values adjusted

### Fixed
- Focus ring visibility on dark backgrounds
- Modal scroll behavior on mobile
```

### 5.3 Documentation Updates

| Change Type | Documentation Required |
|-------------|------------------------|
| New Component | Component spec, usage, states |
| API Change | Migration guide |
| Visual Change | Screenshot update |
| Breaking Change | Deprecation notice + migration |

---

## 6. Asset Export & Handoff

### 6.1 Folder Structure

```
/design-system
├── /docs
│   ├── DesignSystem_Overview.md
│   ├── ComponentLibrary.md
│   ├── LayoutPages.md
│   └── Standards.md
├── /tokens
│   ├── colors.json
│   ├── typography.json
│   ├── spacing.json
│   └── shadows.json
├── /components
│   ├── buttons.css
│   ├── inputs.css
│   ├── cards.css
│   └── modals.css
└── /assets
    ├── /icons (SVG)
    ├── /images
    └── /logos
```

### 6.2 Design Tokens (JSON)

```json
// tokens/colors.json
{
  "color": {
    "primary": {
      "50": { "value": "#EEF2FF" },
      "500": { "value": "#6366F1" },
      "600": { "value": "#4F46E5" }
    },
    "semantic": {
      "success": { "value": "#10B981" },
      "warning": { "value": "#F59E0B" },
      "error": { "value": "#EF4444" }
    }
  }
}

// tokens/typography.json
{
  "font": {
    "family": {
      "sans": { "value": "'Inter', sans-serif" },
      "mono": { "value": "'JetBrains Mono', monospace" }
    },
    "size": {
      "xs": { "value": "12px" },
      "sm": { "value": "14px" },
      "base": { "value": "16px" },
      "lg": { "value": "18px" },
      "xl": { "value": "20px" }
    }
  }
}
```

### 6.3 Component Specifications

```jsx
// Component Spec: Button

/**
 * @component Button
 * @version 1.0.0
 * 
 * @props
 * - variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
 * - size: 'sm' | 'md' | 'lg'
 * - disabled: boolean
 * - loading: boolean
 * - leftIcon: ReactNode
 * - rightIcon: ReactNode
 * - fullWidth: boolean
 * - onClick: () => void
 * - children: ReactNode
 * 
 * @states
 * - Default: Normal appearance
 * - Hover: bg-primary-600, scale-102
 * - Active: bg-primary-700, scale-98
 * - Focus: ring-2 ring-primary-500
 * - Disabled: opacity-50, pointer-events-none
 * - Loading: spinner + disabled
 * 
 * @accessibility
 * - role="button"
 * - aria-disabled when disabled
 * - aria-busy when loading
 * - Focus visible ring
 */
```

### 6.4 Handoff Checklist

```
□ Design tokens exported (JSON)
□ Component specs documented
□ Responsive variants provided
□ Interaction states defined
□ Accessibility notes included
□ Asset exports complete (SVG, PNG)
□ Style guide updated
□ Change log current
```

---

## 7. Quality Assurance

### 7.1 Design Review Checklist

```
VISUAL
□ Consistent spacing (4px grid)
□ Typography hierarchy correct
□ Color usage follows system
□ Icons sized appropriately
□ Shadows applied consistently

INTERACTION
□ Hover states defined
□ Focus states visible
□ Loading states present
□ Error states handled
□ Empty states designed

RESPONSIVE
□ Desktop layout (≥1280px)
□ Tablet layout (768-1279px)
□ Mobile layout (<768px)
□ Touch targets 44px+

ACCESSIBILITY
□ Color contrast verified
□ Screen reader friendly
□ Keyboard navigable
□ Focus order logical
```

### 7.2 Cross-Browser Testing

| Browser | Versions | Priority |
|---------|----------|----------|
| Chrome | Latest 2 | High |
| Firefox | Latest 2 | High |
| Safari | Latest 2 | High |
| Edge | Latest 2 | Medium |
| Mobile Safari | Latest | High |
| Chrome Android | Latest | High |

---

*End of Design System Documentation*

**Maintainer:** TMS.ai Design Team  
**Last Updated:** 2025-11-25  
**Next Review:** 2026-02-25