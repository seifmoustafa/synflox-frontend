import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  User,
  UserX,
  Shield,
  UserPlus,
  UserCheck,
  Cog,
  FileText,
  TrendingUp,
  PieChart,
  BarChart,
  MapPin,
  Store,
  Building,
  ContrastIcon,
  HardHat,
  Move3D,
  ShieldCheck,
  ArrowRightLeft,
  Users2,
  Truck,
  ScrollText,
  FolderTree,
  Grid3X3,
  Package2,
  Package,
  Warehouse,
  Type,
  Palette,
  Map,
  Ticket,
  ShieldUser,
  Tag,
} from "lucide-react";

export interface NavigationItem {
  name: string;
  href?: string;
  icon?: any; // Make icon optional
  children?: NavigationItem[];
  badge?: string | number; // Optional badge for notifications
  disabled?: boolean; // Optional disabled state
}

/**
 * Icon mapping from string names to actual icon components
 * Used to convert backend icon names to React components
 * 
 * 📋 BACKEND ICON NAMES REFERENCE:
 * 
 * For menu items, use these icon names in your backend response:
 * 
 * - Admins: "Users2" (recommended) or "Users" or "UserShield"
 * - Admin Types: "ShieldCheck" (recommended) or "Shield" or "UserShield"
 * - Companies: "Building"
 * - Settings: "Settings" or "Cog"
 * - Dashboard: "LayoutDashboard"
 * 
 * The system supports case-insensitive matching, so "users2", "Users2", or "USERS2" all work.
 */
export const iconMap: Record<string, any> = {
  MapPin: MapPin,
  ShieldCheck: ShieldCheck,
  ArrowRightLeft: ArrowRightLeft,
  HardHat: HardHat,
  Users2: Users2,
  Shield: Shield,
  Truck: Truck,
  ScrollText: ScrollText,
  Package2: Package2,
  FolderTree: FolderTree,
  Grid3X3: Grid3X3,
  Package: Package,
  Warehouse: Warehouse,
  Store: Store,
  LayoutDashboard: LayoutDashboard,
  Users: Users,
  BarChart3: BarChart3,
  Settings: Settings,
  User: User,
  Building: Building,
  Cog: Cog,
  FileText: FileText,
  TrendingUp: TrendingUp,
  PieChart: PieChart,
  BarChart: BarChart,
  Type: Type,
  UserShield: ShieldUser,
  UserTag: Tag,
};

/**
 * ============================================================================
 * DYNAMIC NAVIGATION SYSTEM - EASY MAINTENANCE & SWITCHING
 * ============================================================================
 *
 * 🚀 SUPER EASY TO MAINTAIN:
 * - Single toggle flag to switch between static/dynamic navigation
 * - All sidebar components automatically use the same system
 * - No need to update individual components when adding new items
 * - Centralized icon mapping and configuration
 *
 * 🔄 EASY SWITCHING:
 * - Development: Set USE_DYNAMIC_NAVIGATION = false (uses static navigation)
 * - Production: Set USE_DYNAMIC_NAVIGATION = true (uses backend navigation)
 * - Automatic fallback when backend is unavailable
 *
 * 📁 CLEAN ARCHITECTURE:
 * - useDynamicNavigation() hook handles all the logic
 * - Components just call the hook and render
 * - Route protection automatically enabled in dynamic mode
 * - Translation support built-in
 *
 * ============================================================================
 */

/**
 * 🎛️ NAVIGATION MODE SWITCH
 *
 * Change this ONE flag to switch between static and dynamic navigation:
 * - false = Static navigation (hardcoded, no backend calls, no route protection)
 * - true = Dynamic navigation (from backend, with route protection)
 */
export const USE_DYNAMIC_NAVIGATION = true;

// STATIC NAVIGATION - Used when USE_DYNAMIC_NAVIGATION is false
export const navigation: NavigationItem[] = [
  {
    name: "nav.companies",
    href: "/companies",
    icon: Building,
  },
  {
    name: "nav.admins",
    href: "/admins",
    icon: Users2, // Better icon for admins (multiple users)
  },
  {
    name: "nav.adminTypes",
    href: "/admin-types",
    icon: ShieldCheck, // Better icon for admin types (shield with checkmark)
  },
];

// 🔄 Fallback navigation - used when backend is unavailable (same as static navigation)
export const fallbackNavigation: NavigationItem[] = navigation;

/**
 * ============================================================================
 * 📖 QUICK USAGE GUIDE
 * ============================================================================
 *
 * 🔧 FOR DEVELOPERS:
 * 1. Set USE_DYNAMIC_NAVIGATION = false for development
 * 2. Edit the 'navigation' array below to add/remove items
 * 3. All sidebar components will automatically update
 *
 * 🚀 FOR PRODUCTION:
 * 1. Set USE_DYNAMIC_NAVIGATION = true
 * 2. Implement /MenuItems API endpoint
 * 3. System handles everything automatically
 *
 * 🎨 ADDING NEW STATIC ITEMS:
 * 1. Import icon from lucide-react
 * 2. Add to iconMap if using dynamic navigation
 * 3. Add item to navigation array
 *
 * Example:
 * {
 *   name: "nav.newSection",
 *   href: "/new-section",
 *   icon: NewIcon,
 *   children: [...] // Optional nested items
 * }
 *
 * ============================================================================
 */

/**
 * 🔧 UTILITY FUNCTIONS
 * These are used internally by the navigation system
 */

/**
 * Translates navigation items using the i18n system
 */
export const getNavigationItems = (
  t: (key: string, params?: Record<string, any>) => string,
  navigationItems: NavigationItem[] = fallbackNavigation
): NavigationItem[] => {
  const translateItem = (item: NavigationItem): NavigationItem => ({
    ...item,
    name: item.name.startsWith("nav.") ? t(item.name) : item.name,
    children: item.children?.map(translateItem),
  });

  return navigationItems.map(translateItem);
};

/**
 * Checks if a navigation item or its children match the current pathname
 */
export const isNavigationItemActive = (
  item: NavigationItem,
  pathname: string
): boolean => {
  // Check exact match first
  if (item.href && pathname === item.href) return true;

  // Check if pathname starts with this item's href (for dynamic routes)
  // Ensure it's a proper path segment match (next char must be '/' or end of string)
  if (item.href && item.href !== "/" && pathname.startsWith(item.href)) {
    // Ensure the next character after the href is either '/' or end of string
    // This prevents partial matches like /system/entryGate matching /system/entryGateVisitor
    const nextChar = pathname[item.href.length];
    if (nextChar === undefined || nextChar === "/") {
      return true;
    }
  }

  if (item.children) {
    return item.children.some((child) =>
      isNavigationItemActive(child, pathname)
    );
  }
  return false;
};

/**
 * Flattens nested navigation items into a single array (useful for search)
 */
export const getFlatNavigationItems = (
  items: NavigationItem[] = fallbackNavigation
): NavigationItem[] => {
  const flatItems: NavigationItem[] = [];

  const flatten = (items: NavigationItem[]) => {
    items.forEach((item) => {
      if (item.href) {
        flatItems.push(item);
      }
      if (item.children) {
        flatten(item.children);
      }
    });
  };

  flatten(items);
  return flatItems;
};

/**
 * Helper function to find icon in iconMap with case-insensitive lookup
 */
const getIconFromMap = (iconName: string | null | undefined): any => {
  if (!iconName) {
    return iconMap["Package"]; // Default fallback
  }

  // Try exact match first
  if (iconMap[iconName]) {
    return iconMap[iconName];
  }

  // Try case-insensitive lookup
  const iconKey = Object.keys(iconMap).find(
    (key) => key.toLowerCase() === iconName.toLowerCase()
  );

  if (iconKey) {
    return iconMap[iconKey];
  }

  // Log warning for missing icons (helpful for debugging)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.warn(`[Navigation] Icon "${iconName}" not found in iconMap. Available icons:`, Object.keys(iconMap));
  }

  return iconMap["Package"]; // Default fallback
};

/**
 * 🔄 Converts backend menu items to frontend navigation format
 * Used internally by the dynamic navigation system
 */
export const convertMenuItemsToNavigation = (
  menuItemsData: any
): NavigationItem[] => {
  // Handle different possible data structures
  let menuItems: any[] = [];

  if (Array.isArray(menuItemsData)) {
    menuItems = menuItemsData;
  } else if (
    menuItemsData &&
    typeof menuItemsData === "object" &&
    menuItemsData.menuItem
  ) {
    menuItems = menuItemsData.menuItem;
  } else if (
    menuItemsData &&
    typeof menuItemsData === "object" &&
    Object.keys(menuItemsData).length > 0
  ) {
    // If it's an object with properties, convert it to an array
    menuItems = [menuItemsData];
  } else {
    menuItems = [];
  }

  const convertMenuItem = (item: any): NavigationItem => {
    // Handle both domain model objects and plain objects
    const iconName = item.icon || item.iconName || null;
    const icon = getIconFromMap(iconName);

    return {
      name: item.name,
      href: item.href,
      icon: icon, // Use the mapped icon component
      children: item.children?.map(convertMenuItem) || [],
      disabled: !item.isActive, // Now using isActive since we mapped active to isActive
    };
  };

  // Filter only active items and sort by order
  const activeMenuItems = menuItems
    .filter((item) => item.isActive && !item.isDeleted)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return activeMenuItems.map(convertMenuItem);
};
