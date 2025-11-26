// TMS.ai Design System - Role-Based Navigation Configuration
// Version 1.0.0

export type UserRole =
  | "broker"
  | "carrier"
  | "customer"
  | "ownerOperator"
  | "driver";

export interface NavItem {
  id: string;
  label: string;
  icon?: string;
  path: string;
  roles: UserRole[];
  children?: NavItem[];
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  // ========================================
  // SHARED / UNIVERSAL
  // ========================================
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "LayoutDashboard",
    path: "/dashboard",
    roles: ["broker", "carrier", "customer", "ownerOperator", "driver"]
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: "Bell",
    path: "/notifications",
    roles: ["broker", "carrier", "customer", "ownerOperator", "driver"]
  },

  // ========================================
  // BROKER-SPECIFIC
  // ========================================
  {
    id: "dispatch",
    label: "Dispatch Board",
    icon: "Radio",
    path: "/dispatch",
    roles: ["broker"],
    badge: "LIVE"
  },
  {
    id: "loads",
    label: "Load Management",
    icon: "Truck",
    path: "/loads",
    roles: ["broker", "carrier"]
  },
  {
    id: "carriers",
    label: "Carriers",
    icon: "Users",
    path: "/carriers",
    roles: ["broker"]
  },
  {
    id: "shippers",
    label: "Shippers (CRM)",
    icon: "Building",
    path: "/shippers",
    roles: ["broker"]
  },
  {
    id: "quotes",
    label: "Quote Management",
    icon: "FileText",
    path: "/quotes",
    roles: ["broker"]
  },
  {
    id: "accounting-broker",
    label: "Accounting",
    icon: "DollarSign",
    path: "/accounting",
    roles: ["broker"]
  },
  {
    id: "compliance-broker",
    label: "Compliance",
    icon: "Shield",
    path: "/compliance",
    roles: ["broker"]
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "BarChart3",
    path: "/analytics",
    roles: ["broker", "carrier"]
  },

  // ========================================
  // CARRIER-SPECIFIC
  // ========================================
  {
    id: "fleet",
    label: "Fleet Management",
    icon: "Truck",
    path: "/fleet",
    roles: ["carrier"]
  },
  {
    id: "drivers",
    label: "Drivers",
    icon: "Users",
    path: "/drivers",
    roles: ["carrier"]
  },
  {
    id: "owner-operators-list",
    label: "Owner Operators",
    icon: "UserCheck",
    path: "/owner-operators",
    roles: ["carrier"]
  },
  {
    id: "settlements-carrier",
    label: "Settlements",
    icon: "DollarSign",
    path: "/settlements",
    roles: ["carrier"]
  },
  {
    id: "compliance-carrier",
    label: "Compliance",
    icon: "Shield",
    path: "/compliance",
    roles: ["carrier"]
  },
  {
    id: "maintenance",
    label: "Maintenance",
    icon: "Wrench",
    path: "/maintenance",
    roles: ["carrier"]
  },

  // ========================================
  // CUSTOMER (SHIPPER)-SPECIFIC
  // ========================================
  {
    id: "my-shipments",
    label: "My Shipments",
    icon: "Package",
    path: "/shipments",
    roles: ["customer"]
  },
  {
    id: "request-quote",
    label: "Request Quote",
    icon: "FileText",
    path: "/request-quote",
    roles: ["customer"]
  },
  {
    id: "tracking",
    label: "Track Shipment",
    icon: "MapPin",
    path: "/tracking",
    roles: ["customer"]
  },
  {
    id: "billing-customer",
    label: "Billing & Invoices",
    icon: "CreditCard",
    path: "/billing",
    roles: ["customer"]
  },
  {
    id: "documents-customer",
    label: "Documents",
    icon: "FileText",
    path: "/documents",
    roles: ["customer"]
  },

  // ========================================
  // OWNER-OPERATOR-SPECIFIC
  // ========================================
  {
    id: "my-loads-oo",
    label: "My Loads",
    icon: "Truck",
    path: "/my-loads",
    roles: ["ownerOperator"]
  },
  {
    id: "available-loads-oo",
    label: "Available Loads",
    icon: "Search",
    path: "/available-loads",
    roles: ["ownerOperator"]
  },
  {
    id: "settlements-oo",
    label: "Settlements",
    icon: "DollarSign",
    path: "/settlements",
    roles: ["ownerOperator"]
  },
  {
    id: "compliance-oo",
    label: "Compliance",
    icon: "Shield",
    path: "/compliance",
    roles: ["ownerOperator"]
  },
  {
    id: "profile-oo",
    label: "Profile",
    icon: "User",
    path: "/profile",
    roles: ["ownerOperator"]
  },

  // ========================================
  // DRIVER-SPECIFIC (MOBILE)
  // ========================================
  {
    id: "driver-loads",
    label: "Loads",
    icon: "Truck",
    path: "/loads",
    roles: ["driver"]
  },
  {
    id: "driver-messages",
    label: "Messages",
    icon: "MessageSquare",
    path: "/messages",
    roles: ["driver"]
  },
  {
    id: "driver-docs",
    label: "Documents",
    icon: "FileText",
    path: "/documents",
    roles: ["driver"]
  },
  {
    id: "driver-profile",
    label: "Profile",
    icon: "User",
    path: "/profile",
    roles: ["driver"]
  },

  // ========================================
  // SETTINGS (ALL ROLES)
  // ========================================
  {
    id: "settings",
    label: "Settings",
    icon: "Settings",
    path: "/settings",
    roles: ["broker", "carrier", "customer", "ownerOperator", "driver"]
  }
];

/**
 * Get navigation items filtered by user role
 */
export function getNavForRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

/**
 * Get primary navigation items (first 6) for a role
 */
export function getPrimaryNavForRole(role: UserRole): NavItem[] {
  return getNavForRole(role).slice(0, 6);
}

/**
 * Get secondary navigation items for a role
 */
export function getSecondaryNavForRole(role: UserRole): NavItem[] {
  return getNavForRole(role).slice(6);
}

/**
 * Role display names
 */
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  broker: "Broker Portal",
  carrier: "Carrier Portal",
  customer: "Customer Portal",
  ownerOperator: "Owner-Operator Portal",
  driver: "Driver App"
};

/**
 * Role accent colors (CSS variable names)
 */
export const ROLE_ACCENT_COLORS: Record<UserRole, string> = {
  broker: "--color-role-broker-accent",
  carrier: "--color-role-carrier-accent",
  customer: "--color-role-customer-accent",
  ownerOperator: "--color-role-owner-operator-accent",
  driver: "--color-role-driver-accent"
};