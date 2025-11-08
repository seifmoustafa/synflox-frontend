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
  COMPANIES_EXPORT: "/companies/export",
  COMPANIES_IMPORT: "/companies/import",
  COMPANIES_BULK_DELETE: "/companies/bulk-delete",
  COMPANIES_BULK_UPDATE: "/companies/bulk-update",
  
  // Licensing Operations
  LICENSING_ACTIVATE: "/licensing",
  LICENSING_SUSPEND: "/licensing",
  LICENSING_RESUME: "/licensing",
  LICENSING_EXTEND: "/licensing",
  LICENSING_STATUS: "/licensing",
  LICENSING_GENERATE_KEY: "/licensing",
  LICENSING_REGENERATE_KEY: "/licensing",
  LICENSING_VALIDATE_KEY: "/licensing/validate-key",
  LICENSING_BULK_ACTIVATE: "/licensing/bulk-activate",
  LICENSING_BULK_SUSPEND: "/licensing/bulk-suspend",
  LICENSING_BULK_RESUME: "/licensing/bulk-resume",
  LICENSING_BULK_EXTEND: "/licensing/bulk-extend",
  LICENSING_TRIAL_START: "/licensing",
  LICENSING_TRIAL_CONVERT: "/licensing",
  LICENSING_HISTORY: "/licensing",
  
  // Navigation (if still needed)
  GET_MENU_ITEMS: "/MenuItems",
  
  // Dashboard
  DASHBOARD_OVERVIEW: "/dashboard/overview",
  DASHBOARD_STATISTICS: "/dashboard/statistics",
  DASHBOARD_ENDPOINTS: "/dashboard/endpoints",
  
  // Notifications
  NOTIFICATIONS_GET_ALL: "/notifications",
  NOTIFICATIONS_GET_BY_COMPANY: "/notifications/company",
  NOTIFICATIONS_UNREAD_COUNT: "/notifications/company",
  NOTIFICATIONS_MARK_READ: "/notifications",
  NOTIFICATIONS_MARK_ALL_READ: "/notifications/company",
  
  // Subscription Plans
  SUBSCRIPTION_PLANS_GET_ALL: "/subscription-plans",
  SUBSCRIPTION_PLANS_GET_BY_ID: "/subscription-plans",
  SUBSCRIPTION_PLANS_CREATE: "/subscription-plans",
  SUBSCRIPTION_PLANS_UPDATE: "/subscription-plans",
  SUBSCRIPTION_PLANS_DELETE: "/subscription-plans",
  SUBSCRIPTION_PLANS_ASSIGN_MODULES: "/subscription-plans",
  SUBSCRIPTION_PLANS_GET_MODULES: "/subscription-plans",
  
  // Projects
  PROJECTS_GET_ALL: "/projects",
  PROJECTS_GET_BY_ID: "/projects",
  PROJECTS_CREATE: "/projects",
  PROJECTS_UPDATE: "/projects",
  PROJECTS_DELETE: "/projects",
  
  // Modules
  MODULES_GET_ALL: "/modules",
  MODULES_GET_BY_ID: "/modules",
  MODULES_CREATE: "/modules",
  MODULES_UPDATE: "/modules",
  MODULES_DELETE: "/modules",
  
  // Project-Modules
  PROJECT_MODULES_CREATE: "/project-modules",
  PROJECT_MODULES_GET_BY_PROJECT: "/project-modules/project",
  PROJECT_MODULES_GET_BY_MODULE: "/project-modules/module",
  PROJECT_MODULES_DELETE: "/project-modules",
  
  // Company Groups
  COMPANY_GROUPS_GET_ALL: "/company-groups",
  COMPANY_GROUPS_GET_BY_ID: "/company-groups",
  COMPANY_GROUPS_CREATE: "/company-groups",
  COMPANY_GROUPS_UPDATE: "/company-groups",
  COMPANY_GROUPS_DELETE: "/company-groups",
  COMPANY_GROUPS_ADD_COMPANIES: "/company-groups",
  COMPANY_GROUPS_REMOVE_COMPANIES: "/company-groups",
  COMPANY_GROUPS_GET_COMPANIES: "/company-groups",
  COMPANY_GROUPS_GET_BY_COMPANY: "/company-groups/company",
  COMPANY_GROUPS_BULK_ACTIVATE: "/company-groups",
  COMPANY_GROUPS_BULK_SUSPEND: "/company-groups",
  COMPANY_GROUPS_BULK_RESUME: "/company-groups",
  COMPANY_GROUPS_BULK_EXTEND: "/company-groups",
  
  // Company Custom Fields
  COMPANY_CUSTOM_FIELDS_GET_ALL: "/companies",
  COMPANY_CUSTOM_FIELDS_GET_BY_ID: "/companies",
  COMPANY_CUSTOM_FIELDS_CREATE: "/companies",
  COMPANY_CUSTOM_FIELDS_UPDATE: "/companies",
  COMPANY_CUSTOM_FIELDS_DELETE: "/companies",
  
  // API Keys
  API_KEYS_GET_ALL: "/api-keys",
  API_KEYS_GET_BY_ID: "/api-keys",
  API_KEYS_CREATE: "/api-keys",
  API_KEYS_UPDATE: "/api-keys",
  API_KEYS_DELETE: "/api-keys",
  API_KEYS_GET_BY_COMPANY: "/api-keys/company",
  API_KEYS_REGENERATE: "/api-keys",
  
  // Webhooks
  WEBHOOKS_GET_ALL: "/webhooks",
  WEBHOOKS_GET_BY_ID: "/webhooks",
  WEBHOOKS_CREATE: "/webhooks",
  WEBHOOKS_UPDATE: "/webhooks",
  WEBHOOKS_DELETE: "/webhooks",
  WEBHOOKS_GET_BY_COMPANY: "/webhooks/company",
  WEBHOOKS_GET_DELIVERIES: "/webhooks",
  WEBHOOKS_RETRY_FAILED: "/webhooks/retry-failed",
  
  // Analytics
  ANALYTICS_COMPANY_USAGE: "/analytics/company",
  ANALYTICS_API_USAGE: "/analytics/api-usage",
  ANALYTICS_API_USAGE_BY_ENDPOINT: "/analytics/api-usage/by-endpoint",
  ANALYTICS_API_USAGE_BY_COMPANY: "/analytics/api-usage/by-company",
  
  // Reports
  REPORTS_GET_AVAILABLE: "/reports",
  REPORTS_GET_ALL: "/reports",
  REPORTS_GET_BY_ID: "/reports",
  REPORTS_GENERATE: "/reports",
  REPORTS_DOWNLOAD: "/reports",
  
  // Metrics
  METRICS_SUMMARY: "/metrics/summary",
  METRICS_HISTORY: "/metrics/history",
  METRICS_GET_ALL: "/metrics",
  METRICS_AGGREGATE: "/metrics/aggregate",
  METRICS_CLEANUP: "/metrics/cleanup",
  
  // Error Logs
  ERROR_LOGS_GET_ALL: "/errors",
  ERROR_LOGS_GET_BY_ID: "/errors",
  ERROR_LOGS_CLEANUP: "/errors/cleanup",
  
  // Login Attempts
  LOGIN_ATTEMPTS_GET_ALL: "/login-attempts",
  LOGIN_ATTEMPTS_GET_FAILED: "/login-attempts",
  
  // Search
  SEARCH_POST: "/search",
  SEARCH_SUGGESTIONS: "/search/suggestions",
  SEARCH_ENTITY_TYPES: "/search/entity-types",
  SEARCH_STATS: "/search/stats",
  
  // Password Policy
  PASSWORD_POLICY_GET: "/password-policy",
  PASSWORD_POLICY_UPDATE: "/password-policy",
  PASSWORD_POLICY_VALIDATE: "/password-policy/validate",
  
  // File Upload/Download
  FILE_UPLOAD_INITIATE: "/uploads/initiate",
  FILE_UPLOAD_CHUNK: "/uploads/{uploadId}/chunk",
  FILE_UPLOAD_STATUS: "/uploads/{uploadId}/status",
  FILE_UPLOAD_COMPLETE: "/uploads/{uploadId}/complete",
  FILE_UPLOAD_DELETE: "/uploads/{uploadId}",
  FILE_DOWNLOAD_INITIATE: "/downloads/initiate",
  FILE_DOWNLOAD_STATUS: "/downloads/{downloadId}/status",
  FILE_DOWNLOAD_CHUNK: "/downloads/{downloadId}/chunk",
  FILE_DOWNLOAD_FILE: "/downloads/file/{fileId}",
  FILE_DOWNLOAD_INFO: "/downloads/info/{fileId}",
};
