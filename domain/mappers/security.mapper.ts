/**
 * SYNFLOX Security Mapper
 * Handles conversions between domain models and API DTOs for security features
 */

import {
  ChangePasswordRequest,
  ChangePasswordRequestData,
  ChangePasswordWith2FARequest,
  ChangePasswordWith2FARequestData,
  TwoFactorSetup,
  TwoFactorSetupData,
  Enable2FARequest,
  Enable2FARequestData,
  Disable2FARequest,
  Disable2FARequestData,
  Reset2FARequest,
  Reset2FARequestData,
  GenerateBackupCodesRequest,
  GenerateBackupCodesRequestData,
  GenerateBackupCodesResponse,
  GenerateBackupCodesResponseData,
  BackupCodesStatus,
  BackupCodesStatusData,
  ExportBackupCodesRequest,
  ExportBackupCodesRequestData,
  ExportBackupCodesResponse,
  ExportBackupCodesResponseData,
  SecurityDashboard,
  SecurityDashboardData,
} from '../models/security.model';

export class SecurityMapper {
  // ==================== PASSWORD MANAGEMENT ====================

  static changePasswordRequestToJson(request: ChangePasswordRequest): any {
    return {
      currentPassword: request.currentPassword,
      newPassword: request.newPassword,
    };
  }

  static changePasswordWith2FARequestToJson(request: ChangePasswordWith2FARequest): any {
    return {
      currentPassword: request.currentPassword,
      newPassword: request.newPassword,
      twoFactorCode: request.twoFactorCode || null,
      backupCode: request.backupCode || null,
    };
  }

  // ==================== TWO-FACTOR AUTHENTICATION ====================

  static twoFactorSetupFromJson(json: any): TwoFactorSetup {
    const data: TwoFactorSetupData = {
      secret: json.secret || json.Secret || '',
      qrCodeBase64: json.qrCodeBase64 || json.QRCodeBase64 || json.qRCodeBase64 || '',
      manualEntryKey: json.manualEntryKey || json.ManualEntryKey || '',
      accountName: json.accountName || json.AccountName || '',
      issuer: json.issuer || json.Issuer || 'SYNFLOX',
    };
    return new TwoFactorSetup(data);
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

  // ==================== BACKUP CODES ====================

  static generateBackupCodesRequestToJson(request: GenerateBackupCodesRequest): any {
    return {
      currentPassword: request.currentPassword,
    };
  }

  static generateBackupCodesResponseFromJson(json: any): GenerateBackupCodesResponse {
    const data: GenerateBackupCodesResponseData = {
      codes: json.codes || [],
      message: json.message || 'Backup codes generated successfully',
    };
    return new GenerateBackupCodesResponse(data);
  }

  static backupCodesStatusFromJson(json: any): BackupCodesStatus {
    const data: BackupCodesStatusData = {
      remainingCodes: json.remainingCodes || 0,
      totalCodes: json.totalCodes || 0,
      expiredCodes: json.expiredCodes || 0,
      nextExpiryDate: json.nextExpiryDate || null,
      daysUntilExpiry: json.daysUntilExpiry || null,
      hasBackupCodes: json.hasBackupCodes || false,
      lowCodesWarning: json.lowCodesWarning || false,
      expiryWarning: json.expiryWarning || false,
      needsRegeneration: json.needsRegeneration || false,
    };
    return new BackupCodesStatus(data);
  }

  static exportBackupCodesRequestToJson(request: ExportBackupCodesRequest): any {
    return {
      codes: request.codes,
      format: request.format,
    };
  }

  static exportBackupCodesResponseFromJson(json: any): ExportBackupCodesResponse {
    const data: ExportBackupCodesResponseData = {
      fileContent: json.fileContent || '',
      contentType: json.contentType || 'application/octet-stream',
      fileName: json.fileName || 'backup-codes.txt',
      unusedCodesCount: json.unusedCodesCount || 0,
      format: json.format || 'txt',
      exportedAt: json.exportedAt || new Date().toISOString(),
      message: json.message,
    };
    return new ExportBackupCodesResponse(data);
  }

  // ==================== SECURITY DASHBOARD ====================

  static securityDashboardFromJson(json: any): SecurityDashboard {
    const data: SecurityDashboardData = {
      securityScore: json.securityScore || 0,
      is2FAEnabled: json.is2FAEnabled || json.isTwoFactorEnabled || false,
      hasBackupCodes: json.hasBackupCodes || false,
      backupCodesRemaining: json.backupCodesRemaining || 0,
      lastPasswordChange: json.lastPasswordChange || null,
      daysSincePasswordChange: json.daysSincePasswordChange || 0,
      recentEvents: json.recentEvents || [],
      failedLoginAttempts: json.failedLoginAttempts || 0,
      recommendations: json.recommendations || [],
      trustedDevicesCount: json.trustedDevicesCount || 0,
      activeSessionsCount: json.activeSessionsCount || 0,
    };
    return new SecurityDashboard(data);
  }

  // ==================== API RESPONSE HANDLERS ====================

  static handlePasswordChangeResponse(response: any): { success: boolean; message: string } {
    return {
      success: true,
      message: response.message || 'Password changed successfully',
    };
  }

  static handle2FAEnableResponse(response: any): TwoFactorSetup {
    return SecurityMapper.twoFactorSetupFromJson(response);
  }

  static handle2FAVerifyResponse(response: any): { success: boolean; message: string } {
    return {
      success: true,
      message: response.message || '2FA enabled successfully',
    };
  }

  static handle2FADisableResponse(response: any): { success: boolean; message: string } {
    return {
      success: true,
      message: response.message || '2FA disabled successfully',
    };
  }

  static handle2FAResetResponse(response: any): TwoFactorSetup {
    return SecurityMapper.twoFactorSetupFromJson(response);
  }

  static handleGenerateBackupCodesResponse(response: any): GenerateBackupCodesResponse {
    return SecurityMapper.generateBackupCodesResponseFromJson(response);
  }

  static handleBackupCodesStatusResponse(response: any): BackupCodesStatus {
    return SecurityMapper.backupCodesStatusFromJson(response);
  }

  static handleExportBackupCodesResponse(response: any): ExportBackupCodesResponse {
    return SecurityMapper.exportBackupCodesResponseFromJson(response);
  }

  static handleSecurityDashboardResponse(response: any): SecurityDashboard {
    return SecurityMapper.securityDashboardFromJson(response);
  }

  static handleDeleteBackupCodesResponse(response: any): { success: boolean; message: string } {
    return {
      success: true,
      message: response.message || 'All backup codes deleted successfully',
    };
  }
}
