/**
 * TMS.ai Design Tokens
 * Machine-readable token definitions for styling consistency
 * 
 * Usage:
 * import tokens from '@/design-system/tokens/tokens';
 * style={{ color: tokens.color.text.primary }}
 */

export const tokens = {
  // ============================================
  // COLOR TOKENS
  // ============================================
  color: {
    // Brand - Primary (Indigo for Broker)
    primary: {
      50: '#EEF2FF',
      100: '#E0E7FF',
      200: '#C7D2FE',
      300: '#A5B4FC',
      400: '#818CF8',
      500: '#6366F1',
      600: '#4F46E5',
      700: '#4338CA',
      800: '#3730A3',
      900: '#312E81',
    },
    
    // Secondary (Purple)
    secondary: {
      50: '#FAF5FF',
      100: '#F3E8FF',
      200: '#E9D5FF',
      300: '#D8B4FE',
      400: '#C084FC',
      500: '#A855F7',
      600: '#9333EA',
      700: '#7E22CE',
      800: '#6B21A8',
      900: '#581C87',
    },

    // Carrier Mode Primary (Blue)
    carrier: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
    },

    // Neutral (Slate)
    neutral: {
      0: '#FFFFFF',
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
      950: '#020617',
    },

    // Semantic - Success
    success: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
      800: '#065F46',
      900: '#064E3B',
    },

    // Semantic - Warning
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
    },

    // Semantic - Danger/Error
    danger: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D',
    },

    // Semantic - Info
    info: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
    },

    // Background tokens
    background: {
      page: 'var(--color-bg-page)',
      surface: 'var(--color-bg-surface)',
      elevated: 'var(--color-bg-elevated)',
      muted: 'var(--color-bg-muted)',
      overlay: 'var(--color-bg-overlay)',
    },

    // Text tokens
    text: {
      primary: 'var(--color-text-primary)',
      secondary: 'var(--color-text-secondary)',
      muted: 'var(--color-text-muted)',
      inverse: 'var(--color-text-inverse)',
      link: 'var(--color-text-link)',
    },

    // Border tokens
    border: {
      default: 'var(--color-border-default)',
      muted: 'var(--color-border-muted)',
      focus: 'var(--color-border-focus)',
    },

    // Load Status Colors
    status: {
      available: '#10B981',
      tendered: '#8B5CF6',
      assigned: '#3B82F6',
      dispatched: '#0EA5E9',
      pickedUp: '#F59E0B',
      inTransit: '#F97316',
      delivered: '#10B981',
      invoiced: '#6366F1',
      cancelled: '#EF4444',
      closed: '#64748B',
    },
  },

  // ============================================
  // TYPOGRAPHY TOKENS
  // ============================================
  typography: {
    fontFamily: {
      sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
    },

    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },

    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },

    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },

    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  // ============================================
  // SPACING TOKENS
  // ============================================
  spacing: {
    0: '0',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    11: '2.75rem',    // 44px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
  },

  // ============================================
  // BORDER RADIUS TOKENS
  // ============================================
  radius: {
    none: '0',
    sm: '0.125rem',   // 2px
    default: '0.25rem', // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // ============================================
  // SHADOW TOKENS
  // ============================================
  shadow: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    // Colored shadows for cards
    primary: '0 10px 40px -10px rgba(99, 102, 241, 0.3)',
    success: '0 10px 40px -10px rgba(16, 185, 129, 0.3)',
    warning: '0 10px 40px -10px rgba(245, 158, 11, 0.3)',
    danger: '0 10px 40px -10px rgba(239, 68, 68, 0.3)',
  },

  // ============================================
  // Z-INDEX TOKENS
  // ============================================
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // ============================================
  // BREAKPOINTS
  // ============================================
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // ============================================
  // TRANSITIONS
  // ============================================
  transition: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    timing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      linear: 'linear',
    },
  },

  // ============================================
  // COMPONENT-SPECIFIC TOKENS
  // ============================================
  components: {
    button: {
      height: {
        sm: '32px',
        md: '40px',
        lg: '48px',
      },
      padding: {
        sm: '0 12px',
        md: '0 16px',
        lg: '0 24px',
      },
    },
    input: {
      height: {
        sm: '32px',
        md: '40px',
        lg: '48px',
      },
    },
    card: {
      padding: {
        sm: '12px',
        md: '16px',
        lg: '24px',
      },
    },
    sidebar: {
      width: {
        collapsed: '64px',
        expanded: '256px',
      },
    },
    header: {
      height: '64px',
    },
    mobileNav: {
      height: '56px',
    },
  },
} as const;

// ============================================
// CSS VARIABLE DEFINITIONS
// ============================================
export const cssVariables = {
  light: {
    '--color-bg-page': tokens.color.neutral[50],
    '--color-bg-surface': tokens.color.neutral[0],
    '--color-bg-elevated': tokens.color.neutral[0],
    '--color-bg-muted': tokens.color.neutral[100],
    '--color-bg-overlay': 'rgba(0, 0, 0, 0.5)',
    '--color-text-primary': tokens.color.neutral[800],
    '--color-text-secondary': tokens.color.neutral[600],
    '--color-text-muted': tokens.color.neutral[400],
    '--color-text-inverse': tokens.color.neutral[0],
    '--color-text-link': tokens.color.primary[600],
    '--color-border-default': tokens.color.neutral[200],
    '--color-border-muted': tokens.color.neutral[100],
    '--color-border-focus': tokens.color.primary[500],
  },
  dark: {
    '--color-bg-page': tokens.color.neutral[900],
    '--color-bg-surface': tokens.color.neutral[800],
    '--color-bg-elevated': tokens.color.neutral[700],
    '--color-bg-muted': tokens.color.neutral[800],
    '--color-bg-overlay': 'rgba(0, 0, 0, 0.7)',
    '--color-text-primary': tokens.color.neutral[100],
    '--color-text-secondary': tokens.color.neutral[400],
    '--color-text-muted': tokens.color.neutral[500],
    '--color-text-inverse': tokens.color.neutral[900],
    '--color-text-link': tokens.color.primary[400],
    '--color-border-default': tokens.color.neutral[700],
    '--color-border-muted': tokens.color.neutral[800],
    '--color-border-focus': tokens.color.primary[500],
  },
};

// ============================================
// MODE-SPECIFIC TOKENS
// ============================================
export const modeTokens = {
  broker: {
    '--mode-primary': tokens.color.primary[500],
    '--mode-primary-hover': tokens.color.primary[600],
    '--mode-secondary': tokens.color.secondary[500],
    '--mode-gradient': `linear-gradient(135deg, ${tokens.color.primary[500]}, ${tokens.color.secondary[500]})`,
    '--mode-accent': tokens.color.primary[400],
  },
  carrier: {
    '--mode-primary': tokens.color.carrier[600],
    '--mode-primary-hover': tokens.color.carrier[700],
    '--mode-secondary': '#0EA5E9',
    '--mode-gradient': `linear-gradient(135deg, ${tokens.color.carrier[600]}, #0EA5E9)`,
    '--mode-accent': tokens.color.carrier[500],
  },
};

export default tokens;