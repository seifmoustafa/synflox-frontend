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
  BulkOperationRequest,
  BulkOperationResponse,
  BulkOperationResult,
  StartTrialRequest,
  ConvertTrialRequest,
  type ActivateCompanyRequestData,
  type ExtendCompanyRequestData,
  type CompanyStatusResponseData,
  type GenerateLicenseKeyResponseData,
  type ValidateLicenseKeyRequestData,
  type LicenseKeyValidationResponseData,
  type BulkOperationRequestData,
  type BulkOperationResponseData,
  type BulkOperationResultData,
  type StartTrialRequestData,
  type ConvertTrialRequestData,
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

// Dashboard domain
export {
  DashboardOverview,
  SystemStatistics,
  DashboardEndpoints,
  LicenseStatusStats,
  EndpointInfo,
  ParameterInfo,
  type DashboardOverviewData,
  type SystemStatisticsData,
  type DashboardEndpointsData,
  type LicenseStatusStatsData,
  type EndpointInfoData,
  type ParameterInfoData,
} from './models/dashboard.model';
export type { DashboardOverviewResponse } from './mappers/dashboard.mapper';

// Subscription History domain
export {
  SubscriptionHistory,
  SubscriptionHistoryActionType,
  type SubscriptionHistoryData,
} from './models/subscription-history.model';
export type { SubscriptionHistoryResponse } from './mappers/subscription-history.mapper';

// Notification System domain
export {
  SystemNotification,
  SystemNotificationType,
  UnreadCountResponse,
  type SystemNotificationData,
  type UnreadCountResponseData,
} from './models/notification-system.model';
export type { SystemNotificationsResponse } from './mappers/notification-system.mapper';

// Subscription Plan domain
export {
  SubscriptionPlan,
  BillingCycle,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
  type SubscriptionPlanData,
  type CreateSubscriptionPlanRequestData,
  type UpdateSubscriptionPlanRequestData,
} from './models/subscription-plan.model';
export type { SubscriptionPlansResponse } from './mappers/subscription-plan.mapper';

// Project domain
export {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  type ProjectData,
  type CreateProjectRequestData,
  type UpdateProjectRequestData,
} from './models/project.model';
export type { ProjectsResponse } from './mappers/project.mapper';

// Module domain
export {
  Module,
  CreateModuleRequest,
  UpdateModuleRequest,
  type ModuleData,
  type CreateModuleRequestData,
  type UpdateModuleRequestData,
} from './models/module.model';
export type { ModulesResponse } from './mappers/module.mapper';

// Project-Module domain
export {
  ProjectModule,
  CreateProjectModuleRequest,
  type ProjectModuleData,
  type CreateProjectModuleRequestData,
} from './models/project-module.model';
export type { ProjectModulesResponse } from './mappers/project-module.mapper';

// Company Group domain
export {
  CompanyGroup,
  CreateCompanyGroupRequest,
  UpdateCompanyGroupRequest,
  type CompanyGroupData,
  type CreateCompanyGroupRequestData,
  type UpdateCompanyGroupRequestData,
} from './models/company-group.model';
export type { CompanyGroupsResponse } from './mappers/company-group.mapper';

// Company Custom Field domain
export {
  CompanyCustomField,
  CustomFieldType,
  CreateCompanyCustomFieldRequest,
  UpdateCompanyCustomFieldRequest,
  type CompanyCustomFieldData,
  type CreateCompanyCustomFieldRequestData,
  type UpdateCompanyCustomFieldRequestData,
} from './models/company-custom-field.model';
export type { CompanyCustomFieldsResponse } from './mappers/company-custom-field.mapper';

// API Key domain
export {
  ApiKey,
  CreateApiKeyRequest,
  UpdateApiKeyRequest,
  CreateApiKeyResponse,
  RegenerateApiKeyResponse,
  type ApiKeyData,
  type CreateApiKeyRequestData,
  type UpdateApiKeyRequestData,
  type CreateApiKeyResponseData,
  type RegenerateApiKeyResponseData,
} from './models/api-key.model';
export type { ApiKeysResponse } from './mappers/api-key.mapper';

// Webhook domain
export {
  Webhook,
  WebhookDelivery,
  WebhookEventType,
  WebhookDeliveryStatus,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  type WebhookData,
  type WebhookDeliveryData,
  type CreateWebhookRequestData,
  type UpdateWebhookRequestData,
} from './models/webhook.model';
export type { WebhooksResponse, WebhookDeliveriesResponse } from './mappers/webhook.mapper';

// Analytics domain
export {
  CompanyUsageAnalytics,
  ApiUsageAnalytics,
  type CompanyUsageAnalyticsData,
  type ApiUsageAnalyticsData,
} from './models/analytics.model';

// Report domain
export {
  Report,
  ReportType,
  ReportStatus,
  GenerateReportRequest,
  AvailableReport,
  type ReportData,
  type GenerateReportRequestData,
  type AvailableReportData,
} from './models/report.model';
export type { ReportsResponse, AvailableReportsResponse } from './mappers/report.mapper';

// Metric domain
export {
  Metric,
  MetricsSummary,
  MetricHistory,
  type MetricData,
  type MetricsSummaryData,
  type MetricHistoryData,
} from './models/metric.model';
export type { MetricsResponse } from './mappers/metric.mapper';

// Error Log domain
export {
  ErrorLog,
  ErrorLogLevel,
  type ErrorLogData,
} from './models/error-log.model';
export type { ErrorLogsResponse } from './mappers/error-log.mapper';

// Password Policy domain
export {
  PasswordPolicy,
  UpdatePasswordPolicyRequest,
  type PasswordPolicyData,
  type UpdatePasswordPolicyRequestData,
} from './models/password-policy.model';

// Login Attempt domain
export {
  LoginAttempt,
  LoginAttemptStatus,
  type LoginAttemptData,
} from './models/login-attempt.model';
export type { LoginAttemptsResponse } from './mappers/login-attempt.mapper';

// Health domain
export {
  Health,
  HealthStatus,
  type HealthData,
} from './models/health.model';

// File Upload/Download domain
export {
  UploadSession,
  DownloadSession,
  FileInfo,
  UploadStatus,
  DownloadStatus,
  InitiateUploadRequest,
  InitiateDownloadRequest,
  type UploadSessionData,
  type DownloadSessionData,
  type FileInfoData,
  type InitiateUploadRequestData,
  type InitiateDownloadRequestData,
} from './models/file-upload.model';
export type { UploadSessionResponse, DownloadSessionResponse, FileInfoResponse } from './mappers/file-upload.mapper';

// Search domain
export {
  SearchResult,
  SearchRequest,
  SearchSuggestion,
  SearchEntityType,
  type SearchResultData,
  type SearchRequestData,
  type SearchSuggestionData,
} from './models/search.model';
export type { SearchResponse, SearchSuggestionsResponse } from './mappers/search.mapper';

// Mappers
export { UserMapper, AuthMapper, NavigationMapper, NotificationMapper, CompanyMapper, LicensingMapper, AdminMapper, AdminTypeMapper, DashboardMapper, SubscriptionHistoryMapper, NotificationSystemMapper, SubscriptionPlanMapper, ProjectMapper, ModuleMapper, ProjectModuleMapper, CompanyGroupMapper, CompanyCustomFieldMapper, ApiKeyMapper, WebhookMapper, AnalyticsMapper, ReportMapper, MetricMapper, ErrorLogMapper, PasswordPolicyMapper, LoginAttemptMapper, HealthMapper, SearchMapper, FileUploadMapper } from './mappers';
