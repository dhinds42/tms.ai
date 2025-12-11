css
/**
 * TMS.ai Design Tokens
 * Token-based design system for consistent UI/UX across all modules
 * 
 * Usage: Import this file globally and reference tokens via CSS custom properties
 * Example: background-color: var(--color-surface-primary);
 */

:root {
  /* ============================================
     SPACING SCALE
     Use these for margins, padding, gaps
     ============================================ */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;

  /* ============================================
     BORDER RADIUS
     ============================================ */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;

  /* ============================================
     SHADOWS
     ============================================ */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);

  /* ============================================
     BRAND COLORS
     Primary: Indigo/Purple (Main brand)
     Secondary: Emerald/Green (Success, active)
     ============================================ */
  --color-brand-primary-50: #eef2ff;
  --color-brand-primary-100: #e0e7ff;
  --color-brand-primary-200: #c7d2fe;
  --color-brand-primary-300: #a5b4fc;
  --color-brand-primary-400: #818cf8;
  --color-brand-primary-500: #6366f1;
  --color-brand-primary-600: #4f46e5;
  --color-brand-primary-700: #4338ca;
  --color-brand-primary-800: #3730a3;
  --color-brand-primary-900: #312e81;

  --color-brand-secondary-50: #ecfdf5;
  --color-brand-secondary-100: #d1fae5;
  --color-brand-secondary-200: #a7f3d0;
  --color-brand-secondary-300: #6ee7b7;
  --color-brand-secondary-400: #34d399;
  --color-brand-secondary-500: #10b981;
  --color-brand-secondary-600: #059669;
  --color-brand-secondary-700: #047857;
  --color-brand-secondary-800: #065f46;
  --color-brand-secondary-900: #064e3b;

  /* ============================================
     ROLE ACCENT COLORS
     Used for role-specific highlights
     ============================================ */
  --color-role-broker-accent: #4f46e5;
  --color-role-broker-accent-light: #818cf8;
  --color-role-broker-bg: #eef2ff;

  --color-role-carrier-accent: #0284c7;
  --color-role-carrier-accent-light: #38bdf8;
  --color-role-carrier-bg: #f0f9ff;

  --color-role-driver-accent: #7c3aed;
  --color-role-driver-accent-light: #a78bfa;
  --color-role-driver-bg: #f5f3ff;

  --color-role-customer-accent: #059669;
  --color-role-customer-accent-light: #34d399;
  --color-role-customer-bg: #ecfdf5;

  /* ============================================
     SEMANTIC COLORS
     ============================================ */
  --color-success-50: #ecfdf5;
  --color-success-100: #d1fae5;
  --color-success-500: #10b981;
  --color-success-600: #059669;
  --color-success-700: #047857;

  --color-warning-50: #fffbeb;
  --color-warning-100: #fef3c7;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;
  --color-warning-700: #b45309;

  --color-error-50: #fef2f2;
  --color-error-100: #fee2e2;
  --color-error-500: #ef4444;
  --color-error-600: #dc2626;
  --color-error-700: #b91c1c;

  --color-info-50: #eff6ff;
  --color-info-100: #dbeafe;
  --color-info-500: #3b82f6;
  --color-info-600: #2563eb;
  --color-info-700: #1d4ed8;

  /* ============================================
     NEUTRAL COLORS (Gray scale)
     ============================================ */
  --color-neutral-50: #f8fafc;
  --color-neutral-100: #f1f5f9;
  --color-neutral-200: #e2e8f0;
  --color-neutral-300: #cbd5e1;
  --color-neutral-400: #94a3b8;
  --color-neutral-500: #64748b;
  --color-neutral-600: #475569;
  --color-neutral-700: #334155;
  --color-neutral-800: #1e293b;
  --color-neutral-900: #0f172a;

  /* ============================================
     SURFACE COLORS
     Backgrounds, cards, panels
     ============================================ */
  --color-surface-primary: #ffffff;
  --color-surface-secondary: #f8fafc;
  --color-surface-tertiary: #f1f5f9;
  --color-surface-overlay: rgba(15, 23, 42, 0.6);
  --color-surface-elevated: #ffffff;

  /* ============================================
     BORDER COLORS
     ============================================ */
  --color-border-light: #f1f5f9;
  --color-border-default: #e2e8f0;
  --color-border-medium: #cbd5e1;
  --color-border-strong: #94a3b8;

  /* ============================================
     TEXT COLORS
     ============================================ */
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-tertiary: #64748b;
  --color-text-disabled: #cbd5e1;
  --color-text-inverse: #ffffff;
  --color-text-link: #4f46e5;
  --color-text-link-hover: #4338ca;

  /* ============================================
     TYPOGRAPHY SCALE
     ============================================ */
  --font-family-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-family-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace;

  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* ============================================
     Z-INDEX SCALE
     ============================================ */
  --z-base: 0;
  --z-dropdown: 1000;
  --z-sticky: 1100;
  --z-overlay: 1200;
  --z-modal: 1300;
  --z-popover: 1400;
  --z-tooltip: 1500;
  --z-toast: 1600;

  /* ============================================
     TRANSITIONS
     ============================================ */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);

  /* ============================================
     LAYOUT
     ============================================ */
  --layout-max-width: 1280px;
  --layout-max-width-wide: 1536px;
  --layout-sidebar-width: 280px;
  --layout-sidebar-width-collapsed: 80px;
  --layout-header-height: 64px;

  /* ============================================
     COMPONENT SPECIFIC
     ============================================ */
  --button-height-sm: 2rem;
  --button-height-md: 2.5rem;
  --button-height-lg: 3rem;

  --input-height-sm: 2rem;
  --input-height-md: 2.5rem;
  --input-height-lg: 3rem;

  --card-padding-sm: 1rem;
  --card-padding-md: 1.5rem;
  --card-padding-lg: 2rem;
}
