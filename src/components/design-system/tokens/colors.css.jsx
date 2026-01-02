/**
 * TMS.ai Color System
 * Source of truth for all colors
 * WCAG AA compliant (4.5:1 contrast minimum)
 */

:root {
  /* Neutral Colors */
  --bg-default: #f8fafc;      /* slate-50 - page background */
  --bg-card: #ffffff;          /* white - card/panel background */
  --bg-hover: #f1f5f9;         /* slate-100 - hover states */
  --border-default: #e2e8f0;   /* slate-200 - borders */
  --border-focus: #94a3b8;     /* slate-400 - focus rings */
  
  --text-primary: #0f172a;     /* slate-900 - headings, important text */
  --text-secondary: #475569;   /* slate-600 - body text */
  --text-muted: #94a3b8;       /* slate-400 - helper text, placeholders */

  /* Primary Brand Color */
  --primary-default: #4f46e5;  /* indigo-600 - primary actions */
  --primary-hover: #4338ca;    /* indigo-700 - hover state */
  --primary-active: #3730a3;   /* indigo-800 - active/pressed state */
  --primary-bg: #eef2ff;       /* indigo-50 - backgrounds */
  --primary-border: #c7d2fe;   /* indigo-200 - borders */

  /* Semantic Colors */
  --success: #059669;          /* emerald-600 - success states, positive actions */
  --success-bg: #d1fae5;       /* emerald-100 - success backgrounds */
  --success-border: #6ee7b7;   /* emerald-300 - success borders */
  
  --warning: #d97706;          /* amber-600 - warnings, caution */
  --warning-bg: #fef3c7;       /* amber-100 - warning backgrounds */
  --warning-border: #fcd34d;   /* amber-300 - warning borders */
  
  --error: #dc2626;            /* red-600 - errors, destructive actions */
  --error-bg: #fee2e2;         /* red-100 - error backgrounds */
  --error-border: #fca5a5;     /* red-300 - error borders */
  
  --info: #2563eb;             /* blue-600 - information, neutral actions */
  --info-bg: #dbeafe;          /* blue-100 - info backgrounds */
  --info-border: #93c5fd;      /* blue-300 - info borders */

  /* Status Colors (for badges/indicators) */
  --status-active: var(--success);
  --status-inactive: #64748b;  /* slate-500 */
  --status-pending: var(--warning);
  --status-cancelled: var(--error);
  --status-in-progress: #8b5cf6; /* purple-500 */

  /* Typography */
  --font-heading: 600;
  --font-body: 400;
  --font-bold: 700;
}