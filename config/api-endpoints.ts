export const API_ENDPOINTS = {
  // Authentication
  AUTH_LOGIN: "/admin/auth/login",
  AUTH_LOGIN_2FA: "/admin/auth/verify-2fa",
  AUTH_VERIFY_BACKUP_CODE: "/admin/auth/verify-backup-code",
  AUTH_REFRESH_TOKEN: "/admin/auth/refresh-token",
  AUTH_LOGOUT: "/admin/auth/logout",
  
  // Password Reset
  AUTH_FORGOT_PASSWORD: "/admin/auth/forgot-password",
  AUTH_FORGOT_PASSWORD_WITH_2FA: "/admin/auth/forgot-password-with-2fa",
  AUTH_CHECK_2FA_STATUS: "/admin/auth/check-2fa-status",
  AUTH_VERIFY_RESET_OTP: "/admin/auth/verify-reset-otp",
  AUTH_VALIDATE_MAGIC_LINK: "/admin/auth/validate-magic-link",
  AUTH_RESET_PASSWORD: "/admin/auth/reset-password",
  
  // Admin Profile (Current User)
  GET_ADMIN_ME: "/admin/profile/me",
  GET_ADMIN_STATISTICS: "/admin/profile/me/statistics",
  UPDATE_ADMIN_PROFILE: "/admin/profile/me",
  UPDATE_ADMIN_PREFERENCES: "/admin/profile/me/preferences",
  UPDATE_ADMIN_NOTIFICATIONS: "/admin/profile/me/notifications",
  UPLOAD_PROFILE_PICTURE: "/admin/profile/me/picture",
  DELETE_PROFILE_PICTURE: "/admin/profile/me/picture",
  CHANGE_ADMIN_PASSWORD: "/admin/profile/me/password",
  DELETE_ADMIN_ACCOUNT: "/admin/profile/me",
  
  // Two-Factor Authentication
  ENABLE_2FA: "/admin/profile/me/2fa/enable",
  VERIFY_2FA_SETUP: "/admin/profile/me/2fa/verify",
  DISABLE_2FA: "/admin/profile/me/2fa/disable",
  RESET_2FA: "/admin/profile/me/2fa/reset",
  
  // Backup Codes
  GENERATE_BACKUP_CODES: "/admin/profile/me/backup-codes/generate",
  GET_BACKUP_CODES_STATUS: "/admin/profile/me/backup-codes/status",
  DELETE_BACKUP_CODES: "/admin/profile/me/backup-codes",
  EXPORT_BACKUP_CODES: "/admin/profile/me/backup-codes/export",
  
  // Security Analytics
  GET_SECURITY_DASHBOARD: "/admin/profile/me/security/dashboard",
  GET_ADVANCED_ANALYTICS: "/admin/profile/me/security/analytics",
  EXPORT_SECURITY_REPORT: "/admin/profile/me/security/report/export",
  
  // Admin Management (SuperAdmin operations)
  ADMINS_GET_ALL: "/admins",
  ADMINS_GET_BY_ID: "/admins",
  ADMINS_CREATE: "/admins",
  ADMINS_UPDATE: "/admins",
  ADMINS_DELETE: "/admins",
  
  // Admin Individual Actions
  ADMINS_ACTIVATE: "/admins",
  ADMINS_DEACTIVATE: "/admins",
  ADMINS_CHANGE_PASSWORD_BY_ID: "/admins",
  ADMINS_RESET_PASSWORD: "/admins",
  
  // Admin Bulk Actions
  ADMINS_ACTIVATE_SELECTED: "/admins/activate-selected",
  ADMINS_DEACTIVATE_SELECTED: "/admins/deactivate-selected",
  ADMINS_ACTIVATE_ALL: "/admins/activate-all",
  ADMINS_DEACTIVATE_ALL: "/admins/deactivate-all",
  ADMINS_DELETE_SELECTED: "/admins/selected",
  ADMINS_DELETE_ALL: "/admins/all",
  
  // Admin Type Management
  ADMIN_TYPES_GET_ALL: "/admin-types",
  ADMIN_TYPES_GET_ALL_NO_PAGINATION: "/admin-types/all",
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
  
  // Company Individual Actions
  COMPANIES_ACTIVATE: "/companies",
  COMPANIES_DEACTIVATE: "/companies",
  
  // Company Bulk Actions
  COMPANIES_BULK_ACTIVATE: "/companies/bulk/activate",
  COMPANIES_BULK_DEACTIVATE: "/companies/bulk/deactivate",
  COMPANIES_BULK_DELETE: "/companies/bulk/delete",
  
  // Project Management
  PROJECTS_GET_ALL: "/projects",
  PROJECTS_GET_BY_ID: "/projects",
  PROJECTS_CREATE: "/projects",
  PROJECTS_UPDATE: "/projects",
  PROJECTS_DELETE: "/projects",
  
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
