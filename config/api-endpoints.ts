export const API_ENDPOINTS = {
  // Authentication
  AUTH_LOGIN: "/admin/auth/login",
  AUTH_REFRESH_TOKEN: "/admin/auth/refresh-token",
  AUTH_LOGOUT: "/admin/auth/logout",
  
  // Admin Management
  GET_ADMIN_ME: "/admins/me",
  UPDATE_ADMIN_PROFILE: "/admins/me",
  CHANGE_ADMIN_PASSWORD: "/admins/me/password",
  ADMINS_GET_ALL: "/admins",
  ADMINS_GET_BY_ID: "/admins",
  ADMINS_CREATE: "/admins",
  ADMINS_UPDATE: "/admins",
  ADMINS_DELETE: "/admins",
  
  // Admin Type Management
  ADMIN_TYPES_GET_ALL: "/admin-types",
  ADMIN_TYPES_GET_BY_ID: "/admin-types",
  ADMIN_TYPES_CREATE: "/admin-types",
  ADMIN_TYPES_UPDATE: "/admin-types",
  ADMIN_TYPES_DELETE: "/admin-types",
  
  // Company Management
  COMPANIES_GET_ALL: "/companies",
  COMPANIES_GET_BY_ID: "/companies",
  COMPANIES_CREATE: "/companies",
  COMPANIES_UPDATE: "/companies",
  COMPANIES_DELETE: "/companies",
  
  // Licensing Operations
  LICENSING_ACTIVATE: "/licensing",
  LICENSING_SUSPEND: "/licensing",
  LICENSING_RESUME: "/licensing",
  LICENSING_EXTEND: "/licensing",
  LICENSING_STATUS: "/licensing",
  LICENSING_GENERATE_KEY: "/licensing",
  LICENSING_REGENERATE_KEY: "/licensing",
  LICENSING_VALIDATE_KEY: "/licensing/validate-key",
  
  // Navigation (if still needed)
  GET_MENU_ITEMS: "/MenuItems",
  
  // Dashboard
  DASHBOARD_OVERVIEW: "/dashboard/overview",
  DASHBOARD_STATISTICS: "/dashboard/statistics",
  DASHBOARD_ENDPOINTS: "/dashboard/endpoints",
};
