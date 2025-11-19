/**
 * Account Mapper
 * Handles conversions between API responses and Account domain models
 */

import {
  Profile,
  ProfileData,
  ProfileStatistics,
  ProfileStatisticsData,
  UpdateProfileRequest,
  UpdatePreferencesRequest,
  UpdateNotificationPreferencesRequest,
  ChangePasswordRequest,
  TwoFactorSetup,
  TwoFactorSetupData,
  Enable2FARequest,
  Disable2FARequest,
  Reset2FARequest,
  SecurityDashboard,
  SecurityDashboardData,
  TwoFactorStats,
  TwoFactorStatsData,
  BackupCodesStats,
  BackupCodesStatsData,
  SecurityEvent,
  SecurityEventData,
  FailedLoginStats,
  FailedLoginStatsData,
} from "@/domain";

// ============================================
// RESPONSE INTERFACES
// ============================================

export interface ProfileResponse {
  statusCode: number;
  message?: string;
  data: ProfileData;
}

export interface ProfileStatisticsResponse {
  statusCode: number;
  message?: string;
  data: ProfileStatisticsData;
}

export interface TwoFactorSetupResponse {
  statusCode: number;
  message?: string;
  data: TwoFactorSetupData;
}

export interface SecurityDashboardResponse {
  statusCode: number;
  message?: string;
  data: SecurityDashboardData;
}

export interface SuccessResponse {
  statusCode: number;
  message: string;
}

// ============================================
// MAPPER CLASS
// ============================================

export class AccountMapper {
  // ============================================
  // PROFILE MAPPING
  // ============================================

  static fromJson(json: any): Profile {
    return new Profile({
      id: json.id,
      username: json.username,
      email: json.email,
      firstName: json.firstName,
      lastName: json.lastName,
      phoneNumber: json.phoneNumber,
      gender: json.gender,
      dateOfBirth: json.dateOfBirth,
      bio: json.bio,
      profilePictureUrl: json.profilePictureUrl,
      jobTitle: json.jobTitle,
      department: json.department,
      location: json.location,
      preferredLanguage: json.preferredLanguage,
      timezone: json.timezone,
      themePreference: json.themePreference,
      dateFormat: json.dateFormat,
      timeFormat: json.timeFormat,
      linkedInUrl: json.linkedInUrl,
      twitterUrl: json.twitterUrl,
      backupEmail: json.backupEmail,
      lastLoginAt: json.lastLoginAt,
      lastPasswordChangeAt: json.lastPasswordChangeAt,
      loginCount: json.loginCount,
      isTwoFactorEnabled: json.isTwoFactorEnabled,
      emailNotificationsEnabled: json.emailNotificationsEnabled,
      pushNotificationsEnabled: json.pushNotificationsEnabled,
      companyExpiryNotifications: json.companyExpiryNotifications,
      subscriptionExpiryNotifications: json.subscriptionExpiryNotifications,
      systemAlertsNotifications: json.systemAlertsNotifications,
      adminTypeId: json.adminTypeId,
      adminTypeName: json.adminTypeName,
      createdTimestamp: json.createdTimestamp,
      updatedTimestamp: json.updatedTimestamp,
    });
  }

  static handleProfileResponse(response: any): Profile {
    if (!response) {
      throw new Error("Invalid profile response");
    }
    // ApiService already unwraps the response, so response IS the data
    const data = response.data || response;
    return this.fromJson(data);
  }

  // ============================================
  // PROFILE STATISTICS MAPPING
  // ============================================

  static fromStatisticsJson(json: any): ProfileStatistics {
    return new ProfileStatistics({
      totalLogins: json.totalLogins,
      lastLoginAt: json.lastLoginAt,
      daysSinceCreation: json.daysSinceCreation,
      daysSinceLastPasswordChange: json.daysSinceLastPasswordChange,
      companiesManaged: json.companiesManaged,
      subscriptionsManaged: json.subscriptionsManaged,
      adminsCreated: json.adminsCreated,
    });
  }

  static handleStatisticsResponse(response: any): ProfileStatistics {
    if (!response) {
      throw new Error("Invalid statistics response");
    }
    const data = response.data || response;
    return this.fromStatisticsJson(data);
  }

  // ============================================
  // UPDATE PROFILE REQUESTS
  // ============================================

  static updateProfileRequestToJson(request: UpdateProfileRequest): any {
    return {
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      phoneNumber: request.phoneNumber,
      gender: request.gender,
      dateOfBirth: request.dateOfBirth,
      bio: request.bio,
      jobTitle: request.jobTitle,
      department: request.department,
      location: request.location,
      linkedInUrl: request.linkedInUrl,
      twitterUrl: request.twitterUrl,
      backupEmail: request.backupEmail,
    };
  }

  static updatePreferencesRequestToJson(request: UpdatePreferencesRequest): any {
    return {
      preferredLanguage: request.preferredLanguage,
      timezone: request.timezone,
      themePreference: request.themePreference,
      dateFormat: request.dateFormat,
      timeFormat: request.timeFormat,
    };
  }

  static updateNotificationPreferencesRequestToJson(
    request: UpdateNotificationPreferencesRequest
  ): any {
    return {
      emailNotificationsEnabled: request.emailNotificationsEnabled,
      pushNotificationsEnabled: request.pushNotificationsEnabled,
      companyExpiryNotifications: request.companyExpiryNotifications,
      subscriptionExpiryNotifications: request.subscriptionExpiryNotifications,
      systemAlertsNotifications: request.systemAlertsNotifications,
    };
  }

  static uploadProfilePictureRequestToJson(base64Image: string): any {
    return {
      base64Image: base64Image,
    };
  }

  static changePasswordRequestToJson(request: ChangePasswordRequest): any {
    return {
      currentPassword: request.currentPassword,
      newPassword: request.newPassword,
    };
  }

  // ============================================
  // 2FA MAPPING
  // ============================================

  static from2FASetupJson(json: any): TwoFactorSetup {
    return new TwoFactorSetup({
      secret: json.secret,
      qrCodeBase64: json.qrCodeBase64,
      manualEntryKey: json.manualEntryKey,
      accountName: json.accountName,
      issuer: json.issuer,
    });
  }

  static handle2FASetupResponse(response: any): TwoFactorSetup {
    if (!response) {
      throw new Error("Invalid 2FA setup response");
    }
    const data = response.data || response;
    return this.from2FASetupJson(data);
  }

  static enable2FARequestToJson(request: Enable2FARequest): any {
    return {
      verificationCode: request.verificationCode,
    };
  }

  static disable2FARequestToJson(request: Disable2FARequest): any {
    return {
      currentPassword: request.currentPassword,
    };
  }

  static reset2FARequestToJson(request: Reset2FARequest): any {
    return {
      currentPassword: request.currentPassword,
    };
  }

  // ============================================
  // SECURITY DASHBOARD MAPPING
  // ============================================

  static fromSecurityDashboardJson(json: any): SecurityDashboard {
    return new SecurityDashboard({
      securityScore: json.securityScore,
      securityLevel: json.securityLevel,
      twoFactorStats: json.twoFactorStats,
      backupCodesStats: json.backupCodesStats,
      recentEvents: json.recentEvents,
      failedLoginStats: json.failedLoginStats,
      recommendations: json.recommendations,
      lastAuditDate: json.lastAuditDate,
    });
  }

  static handleSecurityDashboardResponse(response: any): SecurityDashboard {
    if (!response) {
      throw new Error("Invalid security dashboard response");
    }
    const data = response.data || response;
    return this.fromSecurityDashboardJson(data);
  }

  // ============================================
  // GENERIC SUCCESS RESPONSE
  // ============================================

  static handleSuccessResponse(response: any): { success: boolean; message: string } {
    return {
      success: response.statusCode >= 200 && response.statusCode < 300,
      message: response.message || "Operation completed successfully",
    };
  }
}
