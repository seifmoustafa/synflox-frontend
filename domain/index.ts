/**
 * Domain Layer Exports
 * 
 * Central export point for all domain models, entities, and mappers.
 * This provides a clean interface for importing domain objects
 * throughout the application.
 */

// Account domain (Profile, Security, etc.)
export * from './models/account';

// Authentication domain
export { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest,
  Verify2FARequest,
  VerifyBackupCodeRequest,
  ForgotPasswordRequest,
  ForgotPasswordWith2FARequest,
  Check2FAStatusResponse,
  VerifyResetOtpRequest,
  ValidateMagicLinkRequest,
  MagicLinkValidationResponse,
  ResetPasswordRequest,
  type LoginRequestData,
  type LoginResponseData,
  type RefreshTokenRequestData,
  type Verify2FARequestData,
  type VerifyBackupCodeRequestData,
  type ForgotPasswordRequestData,
  type ForgotPasswordWith2FARequestData,
  type Check2FAStatusResponseData,
  type VerifyResetOtpRequestData,
  type ValidateMagicLinkRequestData,
  type MagicLinkValidationResponseData,
  type ResetPasswordRequestData
} from './models/auth.model';

// Navigation domain
export {
  MenuItem,
  NavigationData,
  MenuItemsResponse,
  type MenuItemData,
  type NavigationDataData,
  type MenuItemsResponseData
} from './models/navigation.model';

// Notification domain
export {
  Notification,
  NotificationConfig,
  NotificationQueue,
  NotificationType,
  NotificationPosition,
  type NotificationData,
  type NotificationAction,
  type NotificationConfigData
} from './models/notification.model';




// Admin domain
export {
  Admin,
  CreateAdminRequest,
  UpdateAdminRequest,
  type AdminData,
  type CreateAdminRequestData,
  type UpdateAdminRequestData
} from './models/admin.model';
export type { AdminsResponse } from './mappers/admin.mapper';

// Admin Type domain
export {
  AdminType,
  CreateAdminTypeRequest,
  UpdateAdminTypeRequest,
  type AdminTypeData,
  type CreateAdminTypeRequestData,
  type UpdateAdminTypeRequestData
} from './models/admin-type.model';
export type { AdminTypesResponse } from './mappers/admin-type.mapper';

// Dashboard domain
export {
  Dashboard,
  OverviewStats,
  CompanyStats,
  SubscriptionStats,
  AdminStats,
  Alerts,
  RecentActivity,
  type DashboardData,
  type OverviewStatsData,
  type CompanyStatsData,
  type SubscriptionStatsData,
  type AdminStatsData,
  type AlertsData,
  type RecentActivityData
} from './models/dashboard.model';
export type { DashboardResponse } from './mappers/dashboard.mapper';

// Security domain
export {
  ChangePasswordRequest,
  ChangePasswordWith2FARequest,
  TwoFactorSetup,
  Enable2FARequest,
  Disable2FARequest,
  Reset2FARequest,
  GenerateBackupCodesRequest,
  GenerateBackupCodesResponse,
  BackupCodesStatus,
  ExportBackupCodesRequest,
  ExportBackupCodesResponse,
  SecurityEvent,
  SecurityRecommendation,
  SecurityDashboard,
  type ChangePasswordRequestData,
  type ChangePasswordWith2FARequestData,
  type TwoFactorSetupData,
  type Enable2FARequestData,
  type Disable2FARequestData,
  type Reset2FARequestData,
  type GenerateBackupCodesRequestData,
  type GenerateBackupCodesResponseData,
  type BackupCodesStatusData,
  type ExportBackupCodesRequestData,
  type ExportBackupCodesResponseData,
  type SecurityEventData,
  type SecurityRecommendationData,
  type SecurityDashboardData
} from './models/security.model';

// Mappers
export { AuthMapper, NavigationMapper, NotificationMapper, AccountMapper, AdminMapper, AdminTypeMapper, DashboardMapper, SecurityMapper } from './mappers';
