// ============================================================================
// SYNFLOX Company Admin Mapper
// ============================================================================

import {
  CompanyAdmin,
  CompanyAdminData,
  CompanyAdminDetails,
  CompanyAdminDetailsData,
  CompanyAdminSession,
  CompanyAdminSessionData,
  CreateCompanyAdminRequest,
  UpdateCompanyAdminRequest,
  ResetAdminPasswordRequest
} from '../models/company-admin.model';
import { AdminSessionPolicy } from '../models/enums';

// ============================================================================
// Response Interfaces
// ============================================================================

export interface CompanyAdminsResponse {
  items: CompanyAdminData[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CompanyAdminResponse {
  statusCode: number;
  message: string;
  data: CompanyAdminData;
  errors: string[];
}

export interface CompanyAdminDetailsResponse {
  statusCode: number;
  message: string;
  data: CompanyAdminDetailsData;
  errors: string[];
}

export interface CompanyAdminSessionsResponse {
  statusCode: number;
  message: string;
  data: CompanyAdminSessionData[];
  errors: string[];
}

// ============================================================================
// Mapper Class
// ============================================================================

export class CompanyAdminMapper {
  /**
   * Convert API data to CompanyAdmin domain model.
   */
  static fromJson(data: CompanyAdminData): CompanyAdmin {
    return new CompanyAdmin(
      data.id,
      data.companyId,
      data.companyName,
      data.username,
      data.displayName,
      data.email,
      data.phone,
      data.isActive,
      data.mustChangePassword,
      data.isLocked,
      new Date(data.lockedUntilUtc),
      data.sessionPolicy as AdminSessionPolicy,
      data.sessionTimeoutMinutes,
      new Date(data.lastLoginAtUtc),
      data.totalLogins,
      data.hasActiveSession,
      new Date(data.createdTimestamp)
    );
  }

  /**
   * Convert API data to CompanyAdminDetails domain model.
   */
  static detailsFromJson(data: CompanyAdminDetailsData): CompanyAdminDetails {
    return new CompanyAdminDetails(
      data.id,
      data.companyId,
      data.companyName,
      data.username,
      data.displayName,
      data.email,
      data.phone,
      data.isActive,
      data.mustChangePassword,
      data.isLocked,
      new Date(data.lockedUntilUtc),
      data.sessionPolicy as AdminSessionPolicy,
      data.sessionTimeoutMinutes,
      new Date(data.lastLoginAtUtc),
      data.totalLogins,
      data.hasActiveSession,
      new Date(data.createdTimestamp),
      // Permissions
      data.canManageDevices,
      data.canViewSubscriptions,
      data.canApproveReplacements,
      data.canGenerateLicenses,
      data.canViewUsageReports,
      data.canModifySessionSettings,
      // Session Configuration
      data.autoLogoutOnInactivity,
      data.inactivityTimeoutMinutes,
      data.maxFailedAttempts,
      data.lockoutDurationMinutes,
      data.passwordExpiryDays,
      // Current Session Info
      data.currentDeviceName,
      data.currentSessionIp,
      new Date(data.sessionStartedAtUtc),
      new Date(data.lastActivityAtUtc)
    );
  }

  /**
   * Convert API data to CompanyAdminSession domain model.
   */
  static sessionFromJson(data: CompanyAdminSessionData): CompanyAdminSession {
    return new CompanyAdminSession(
      data.id,
      data.sessionId,
      data.deviceName,
      data.operatingSystem,
      data.ipAddress,
      data.location,
      new Date(data.startedAtUtc),
      new Date(data.expiresAtUtc),
      new Date(data.endedAtUtc),
      new Date(data.lastActivityAtUtc),
      data.isActive,
      data.endReason,
      data.actionCount,
      data.durationMinutes
    );
  }

  /**
   * Convert CreateCompanyAdminRequest to API JSON.
   */
  static createRequestToJson(request: CreateCompanyAdminRequest): Record<string, unknown> {
    return {
      companyId: request.companyId,
      username: request.username,
      password: request.password,
      displayName: request.displayName,
      email: request.email,
      phone: request.phone,
      canManageDevices: request.canManageDevices,
      canViewSubscriptions: request.canViewSubscriptions,
      canApproveReplacements: request.canApproveReplacements,
      canGenerateLicenses: request.canGenerateLicenses,
      canViewUsageReports: request.canViewUsageReports
    };
  }

  /**
   * Convert UpdateCompanyAdminRequest to API JSON.
   */
  static updateRequestToJson(request: UpdateCompanyAdminRequest): Record<string, unknown> {
    return {
      displayName: request.displayName,
      email: request.email,
      phone: request.phone,
      isActive: request.isActive,
      canManageDevices: request.canManageDevices,
      canViewSubscriptions: request.canViewSubscriptions,
      canApproveReplacements: request.canApproveReplacements,
      canGenerateLicenses: request.canGenerateLicenses,
      canViewUsageReports: request.canViewUsageReports,
      canModifySessionSettings: request.canModifySessionSettings,
      sessionPolicy: request.sessionPolicy,
      sessionTimeoutMinutes: request.sessionTimeoutMinutes,
      autoLogoutOnInactivity: request.autoLogoutOnInactivity,
      inactivityTimeoutMinutes: request.inactivityTimeoutMinutes,
      maxFailedAttempts: request.maxFailedAttempts,
      lockoutDurationMinutes: request.lockoutDurationMinutes,
      passwordExpiryDays: request.passwordExpiryDays
    };
  }

  /**
   * Convert ResetAdminPasswordRequest to API JSON.
   */
  static resetPasswordRequestToJson(request: ResetAdminPasswordRequest): Record<string, unknown> {
    return {
      newPassword: request.newPassword,
      mustChangeOnFirstLogin: request.mustChangeOnFirstLogin
    };
  }

  /**
   * Handle API response for list of company admins.
   */
  static handleListResponse(response: { data: CompanyAdminsResponse }): {
    items: CompanyAdmin[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } {
    const data = response.data;
    return {
      items: data.items.map(item => this.fromJson(item)),
      totalCount: data.totalCount,
      page: data.page,
      pageSize: data.pageSize,
      totalPages: data.totalPages
    };
  }

  /**
   * Handle API response for single company admin.
   */
  static handleSingleResponse(response: { data: CompanyAdminResponse }): CompanyAdmin {
    return this.fromJson(response.data.data);
  }

  /**
   * Handle API response for single company admin (direct from axios).
   */
  static handleApiResponse(response: CompanyAdminResponse): CompanyAdmin {
    return this.fromJson(response.data);
  }

  /**
   * Handle API response for company admin details.
   */
  static handleDetailsResponse(response: { data: CompanyAdminDetailsResponse }): CompanyAdminDetails | null {
    if (!response.data?.data) return null;
    return this.detailsFromJson(response.data.data);
  }

  /**
   * Handle API response for company admin details (direct).
   */
  static handleDetailsApiResponse(response: CompanyAdminDetailsResponse): CompanyAdminDetails | null {
    if (!response?.data) return null;
    return this.detailsFromJson(response.data);
  }

  /**
   * Handle API response for sessions list.
   */
  static handleSessionsResponse(response: { data: CompanyAdminSessionsResponse }): CompanyAdminSession[] {
    if (!response.data?.data) return [];
    return response.data.data.map(session => this.sessionFromJson(session));
  }
}
