/**
 * SYNFLOX Profile Service
 * Handles all profile and security-related API operations
 */

import { IApiService } from './api.service';
import { INotificationService } from './notification.service';
import { SecurityMapper } from '@/domain/mappers/security.mapper';
import {
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
  SecurityDashboard,
} from '@/domain';

export interface IProfileService {
  // Password Management
  changePassword(request: ChangePasswordRequest): Promise<{ success: boolean; message: string }>;
  changePasswordWith2FA(request: ChangePasswordWith2FARequest): Promise<{ success: boolean; message: string }>;

  // Two-Factor Authentication
  enable2FA(): Promise<TwoFactorSetup>;
  verify2FA(request: Enable2FARequest): Promise<{ success: boolean; message: string }>;
  disable2FA(request: Disable2FARequest): Promise<{ success: boolean; message: string }>;
  reset2FA(request: Reset2FARequest): Promise<TwoFactorSetup>;

  // Backup Codes
  generateBackupCodes(request: GenerateBackupCodesRequest): Promise<GenerateBackupCodesResponse>;
  getBackupCodesStatus(): Promise<BackupCodesStatus>;
  deleteBackupCodes(): Promise<{ success: boolean; message: string }>;
  exportBackupCodes(request: ExportBackupCodesRequest): Promise<ExportBackupCodesResponse>;

  // Security Dashboard
  getSecurityDashboard(): Promise<SecurityDashboard>;
}

export class ProfileService implements IProfileService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  // ==================== PASSWORD MANAGEMENT ====================

  async changePassword(request: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    try {
      const requestData = SecurityMapper.changePasswordRequestToJson(request);
      const response = await this.apiService.put('/admin/profile/me/password', requestData);
      
      const result = SecurityMapper.handlePasswordChangeResponse(response);
      this.notificationService.success(result.message);
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to change password';
      this.notificationService.error(errorMessage);
      throw error;
    }
  }

  async changePasswordWith2FA(request: ChangePasswordWith2FARequest): Promise<{ success: boolean; message: string }> {
    try {
      const requestData = SecurityMapper.changePasswordWith2FARequestToJson(request);
      const response = await this.apiService.put('/admin/profile/me/password/change-with-2fa', requestData);
      
      const result = SecurityMapper.handlePasswordChangeResponse(response);
      this.notificationService.success(result.message);
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to change password with 2FA';
      this.notificationService.error(errorMessage);
      throw error;
    }
  }

  // ==================== TWO-FACTOR AUTHENTICATION ====================

  async enable2FA(): Promise<TwoFactorSetup> {
    try {
      const response = await this.apiService.post('/admin/profile/me/2fa/enable', {});
      
      const setup = SecurityMapper.handle2FAEnableResponse(response);
      this.notificationService.success('2FA setup initiated. Please scan the QR code.');
      return setup;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to enable 2FA';
      this.notificationService.error(errorMessage);
      throw error;
    }
  }

  async verify2FA(request: Enable2FARequest): Promise<{ success: boolean; message: string }> {
    try {
      const requestData = SecurityMapper.enable2FARequestToJson(request);
      const response = await this.apiService.post('/admin/profile/me/2fa/verify', requestData);
      
      const result = SecurityMapper.handle2FAVerifyResponse(response);
      this.notificationService.success(result.message);
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to verify 2FA code';
      this.notificationService.error(errorMessage);
      throw error;
    }
  }

  async disable2FA(request: Disable2FARequest): Promise<{ success: boolean; message: string }> {
    try {
      const requestData = SecurityMapper.disable2FARequestToJson(request);
      const response = await this.apiService.post('/admin/profile/me/2fa/disable', requestData);
      
      const result = SecurityMapper.handle2FADisableResponse(response);
      this.notificationService.success(result.message);
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to disable 2FA';
      this.notificationService.error(errorMessage);
      throw error;
    }
  }

  async reset2FA(request: Reset2FARequest): Promise<TwoFactorSetup> {
    try {
      const requestData = SecurityMapper.reset2FARequestToJson(request);
      const response = await this.apiService.post('/admin/profile/me/2fa/reset', requestData);
      
      const setup = SecurityMapper.handle2FAResetResponse(response);
      this.notificationService.success('2FA reset successfully. Please scan the new QR code.');
      return setup;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to reset 2FA';
      this.notificationService.error(errorMessage);
      throw error;
    }
  }

  // ==================== BACKUP CODES ====================

  async generateBackupCodes(request: GenerateBackupCodesRequest): Promise<GenerateBackupCodesResponse> {
    try {
      const requestData = SecurityMapper.generateBackupCodesRequestToJson(request);
      const response = await this.apiService.post('/admin/profile/me/backup-codes/generate', requestData);
      
      const result = SecurityMapper.handleGenerateBackupCodesResponse(response);
      this.notificationService.success(result.message);
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to generate backup codes';
      this.notificationService.error(errorMessage);
      throw error;
    }
  }

  async getBackupCodesStatus(): Promise<BackupCodesStatus> {
    try {
      const response = await this.apiService.get('/admin/profile/me/backup-codes/status');
      
      return SecurityMapper.handleBackupCodesStatusResponse(response);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to get backup codes status';
      this.notificationService.error(errorMessage);
      throw error;
    }
  }

  async deleteBackupCodes(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.apiService.delete('/admin/profile/me/backup-codes');
      
      const result = SecurityMapper.handleDeleteBackupCodesResponse(response);
      this.notificationService.success(result.message);
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to delete backup codes';
      this.notificationService.error(errorMessage);
      throw error;
    }
  }

  async exportBackupCodes(request: ExportBackupCodesRequest): Promise<ExportBackupCodesResponse> {
    try {
      const requestData = SecurityMapper.exportBackupCodesRequestToJson(request);
      const response = await this.apiService.post('/admin/profile/me/backup-codes/export', requestData);
      
      const result = SecurityMapper.handleExportBackupCodesResponse(response);
      this.notificationService.success('Backup codes exported successfully');
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to export backup codes';
      this.notificationService.error(errorMessage);
      throw error;
    }
  }

  // ==================== SECURITY DASHBOARD ====================

  async getSecurityDashboard(): Promise<SecurityDashboard> {
    try {
      const response = await this.apiService.get('/admin/profile/me/security/dashboard');
      
      return SecurityMapper.handleSecurityDashboardResponse(response);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to load security dashboard';
      this.notificationService.error(errorMessage);
      throw error;
    }
  }
}
