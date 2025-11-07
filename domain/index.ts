/**
 * Domain Layer Exports
 * 
 * Central export point for all domain models, entities, and mappers.
 * This provides a clean interface for importing domain objects
 * throughout the application.
 */

// User domain
export { User, type UserData } from './models/user.model';

// Authentication domain
export { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest,
  type LoginRequestData,
  type LoginResponseData,
  type RefreshTokenRequestData
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

// Company domain
export {
  Company,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  type CompanyData,
  type CreateCompanyRequestData,
  type UpdateCompanyRequestData
} from './models/company.model';
export type { CompaniesResponse } from './mappers/company.mapper';

// Licensing domain
export {
  ActivateCompanyRequest,
  ExtendCompanyRequest,
  CompanyStatusResponse,
  GenerateLicenseKeyResponse,
  ValidateLicenseKeyRequest,
  LicenseKeyValidationResponse,
  LicenseStatus,
  type ActivateCompanyRequestData,
  type ExtendCompanyRequestData,
  type CompanyStatusResponseData,
  type GenerateLicenseKeyResponseData,
  type ValidateLicenseKeyRequestData,
  type LicenseKeyValidationResponseData,
} from './models/licensing.model';

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

// Mappers
export { UserMapper, AuthMapper, NavigationMapper, NotificationMapper, CompanyMapper, LicensingMapper, AdminMapper, AdminTypeMapper } from './mappers';
