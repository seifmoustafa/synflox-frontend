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
  PROJECTS: {
    BASE: "/projects",
    BY_ID: (id: string) => `/projects/${id}`,
  },

  // Module Management
  MODULES: {
    BASE: "/modules",
    BY_ID: (id: string) => `/modules/${id}`,
  },
  
  // Subscription Plans Management
  PLANS: {
    GET_ALL: "/plans",
    BY_ID: (id: string) => `/plans/${id}`,
    CREATE: "/plans",
    CREATE_WITH_CONFIRMATION: "/plans/with-confirmation",
    FREE_TIER: "/plans/free-tier",
    VALIDATE_MODULES: "/plans/validate-modules",
    UPDATE_WITH_CONFIRMATION: (id: string) => `/plans/${id}/with-confirmation`,
  },
  
  // Subscriptions Management
  SUBSCRIPTIONS: {
    BASE: "/subscriptions",
    BY_ID: (id: string) => `/subscriptions/${id}`,
    CREATE: "/subscriptions",
    GET_ACTIVE_BY_COMPANY: (companyId: string) => `/subscriptions/company/${companyId}/active`,
    GET_ALL_BY_COMPANY: (companyId: string) => `/subscriptions/company/${companyId}/all`,
    GET_STATUS: (id: string) => `/subscriptions/${id}/status`,
    GET_HISTORY: (id: string) => `/subscriptions/${id}/history`,
    GET_ANALYTICS: (id: string) => `/subscriptions/${id}/analytics`,
    RENEW: (id: string) => `/subscriptions/${id}/renew`,
    UPGRADE: (id: string) => `/subscriptions/${id}/upgrade`,
    CANCEL: (id: string) => `/subscriptions/${id}/cancel`,
    SUSPEND: (id: string) => `/subscriptions/${id}/suspend`,
    RESUME: (id: string) => `/subscriptions/${id}/resume`,
    PAUSE: (id: string) => `/subscriptions/${id}/pause`,
    UNPAUSE: (id: string) => `/subscriptions/${id}/unpause`,
    STOP_TRIAL: (id: string) => `/subscriptions/${id}/stop-trial`,
    EXTEND: (id: string) => `/subscriptions/${id}/extend`,
    REACTIVATE: (id: string) => `/subscriptions/${id}/reactivate`,
  },
  
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
  DASHBOARD: {
    OVERVIEW: "/dashboard/overview",
    COMPANIES: "/dashboard/companies",
    SUBSCRIPTIONS: "/dashboard/subscriptions",
    REVENUE: "/dashboard/revenue",
    ACTIVITY: "/dashboard/activity",
    ALERTS: "/dashboard/alerts",
    DISMISS_ALERT: "/dashboard/alerts/{id}/dismiss",
    MARK_ALERT_READ: "/dashboard/alerts/{id}/read",
  },

  // Subscription Entitlements Management (Runtime)
  ENTITLEMENTS: {
    BASE: "/entitlements",
    BY_ID: (id: string) => `/entitlements/${id}`,
    BY_SUBSCRIPTION: (subscriptionId: string) => `/entitlements/subscription/${subscriptionId}`,
    MATRIX: (subscriptionId: string) => `/entitlements/subscription/${subscriptionId}/matrix`,
    ACCESS_MODE: (subscriptionId: string) => `/entitlements/subscription/${subscriptionId}/access-mode`,
    VERSION: (subscriptionId: string) => `/entitlements/subscription/${subscriptionId}/version`,
    INCREMENT_VERSION: (subscriptionId: string) => `/entitlements/subscription/${subscriptionId}/increment-version`,
    COPY_FROM_PLAN: "/entitlements/copy-from-plan",
    ADD_UPGRADE: "/entitlements/add-upgrade",
    REPLACE: "/entitlements/replace",
    DOWNGRADE_TO_FALLBACK: "/entitlements/downgrade-to-fallback",
    BULK_REVOKE: "/entitlements/bulk-revoke",
    CHECK_PROJECT_ACCESS: "/entitlements/check-project-access",
    CHECK_MODULE_ACCESS: "/entitlements/check-module-access",
  },

  // Plan Entitlements Management (Plan-Level Permissions)
  PLAN_ENTITLEMENTS: {
    BY_PLAN: (planId: string) => `/plan-entitlements/plan/${planId}`,
    BY_ID: (id: string) => `/plan-entitlements/${id}`,
    CREATE: "/plan-entitlements",
    UPDATE: (id: string) => `/plan-entitlements/${id}`,
    DELETE: (id: string) => `/plan-entitlements/${id}`,
  },

  // Offline License Management
  OFFLINE_LICENSE: {
    GENERATE: (subscriptionId: string) => `/offline-license/generate/${subscriptionId}`,
    REGENERATE: (subscriptionId: string) => `/offline-license/regenerate/${subscriptionId}`,
    VALIDATE: "/offline-license/validate",
    CHECK: "/offline-license/check",
    REVOKE: (subscriptionId: string) => `/offline-license/revoke/${subscriptionId}`,
    GET_BY_SUBSCRIPTION: (subscriptionId: string) => `/offline-license/subscription/${subscriptionId}`,
    GET_BY_COMPANY: (companyId: string) => `/offline-license/company/${companyId}`,
    HAS_KEY: (subscriptionId: string) => `/offline-license/has-key/${subscriptionId}`,
    DOWNLOAD: (subscriptionId: string) => `/offline-license/download/${subscriptionId}`,
    ADD_MACHINE: (subscriptionId: string) => `/offline-license/${subscriptionId}/machines`,
    COMPUTE_FINGERPRINT: "/offline-license/compute-fingerprint",
    // Device activations
    GET_ACTIVATIONS: (subscriptionId: string) => `/offline-license/${subscriptionId}/activations`,
    DEACTIVATE_ALL: (subscriptionId: string) => `/offline-license/${subscriptionId}/activations`,
  },

  // Client Admin Token Management (for device binding)
  CLIENT_ADMIN_TOKENS: {
    GENERATE: "/admin/offline-license-tokens/generate",
    REVOKE: (tokenId: string) => `/admin/offline-license-tokens/${tokenId}`,
    GET_BY_COMPANY: (companyId: string) => `/admin/offline-license-tokens/company/${companyId}`,
  },
};
