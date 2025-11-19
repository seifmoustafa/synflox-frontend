/**
 * Account Service
 * Handles all account-related operations: profile, preferences, 2FA, security, etc.
 */

import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import {
  Profile,
  ProfileStatistics,
  UpdateProfileRequest,
  UpdatePreferencesRequest,
  UpdateNotificationPreferencesRequest,
  ChangePasswordRequest,
  TwoFactorSetup,
  Enable2FARequest,
  Disable2FARequest,
  Reset2FARequest,
  SecurityDashboard,
  AccountMapper,
} from "@/domain";

export interface IAccountService {
  // Profile Operations
  getProfile(): Promise<Profile>;
  getStatistics(): Promise<ProfileStatistics>;
  updateProfile(request: UpdateProfileRequest): Promise<Profile>;
  updatePreferences(request: UpdatePreferencesRequest): Promise<Profile>;
  updateNotifications(request: UpdateNotificationPreferencesRequest): Promise<Profile>;
  
  // Profile Picture
  uploadProfilePicture(base64Image: string): Promise<Profile>;
  deleteProfilePicture(): Promise<Profile>;
  
  // Password Management
  changePassword(request: ChangePasswordRequest): Promise<{ success: boolean; message: string }>;
  
  // Two-Factor Authentication
  enable2FA(): Promise<TwoFactorSetup>;
  verify2FASetup(request: Enable2FARequest): Promise<{ success: boolean; message: string }>;
  disable2FA(request: Disable2FARequest): Promise<{ success: boolean; message: string }>;
  reset2FA(request: Reset2FARequest): Promise<TwoFactorSetup>;
  
  // Security Dashboard
  getSecurityDashboard(): Promise<SecurityDashboard>;
  
  // Account Deletion
  deleteAccount(): Promise<{ success: boolean; message: string }>;
}

export class AccountService implements IAccountService {
  constructor(
    private readonly apiService: IApiService,
    private readonly notificationService: INotificationService
  ) {}

  // ============================================
  // PROFILE OPERATIONS
  // ============================================

  /**
   * Get current user profile
   */
  async getProfile(): Promise<Profile> {
    try {
      const response = await this.apiService.get<any>(API_ENDPOINTS.GET_ADMIN_ME);
      return AccountMapper.handleProfileResponse(response);
    } catch (error) {
      this.notificationService.error("Failed to load profile");
      throw error;
    }
  }

  /**
   * Get profile statistics
   */
  async getStatistics(): Promise<ProfileStatistics> {
    try {
      const response = await this.apiService.get<any>(API_ENDPOINTS.GET_ADMIN_STATISTICS);
      return AccountMapper.handleStatisticsResponse(response);
    } catch (error) {
      this.notificationService.error("Failed to load statistics");
      throw error;
    }
  }

  /**
   * Update profile information
   */
  async updateProfile(request: UpdateProfileRequest): Promise<Profile> {
    try {
      const response = await this.apiService.put<any>(
        API_ENDPOINTS.UPDATE_ADMIN_PROFILE,
        AccountMapper.updateProfileRequestToJson(request)
      );
      
      const profile = AccountMapper.handleProfileResponse(response);
      this.notificationService.success("Profile updated successfully");
      return profile;
    } catch (error) {
      this.notificationService.error("Failed to update profile");
      throw error;
    }
  }

  /**
   * Update user preferences (language, theme, etc.)
   */
  async updatePreferences(request: UpdatePreferencesRequest): Promise<Profile> {
    try {
      const response = await this.apiService.put<any>(
        API_ENDPOINTS.UPDATE_ADMIN_PREFERENCES,
        AccountMapper.updatePreferencesRequestToJson(request)
      );
      
      const profile = AccountMapper.handleProfileResponse(response);
      this.notificationService.success("Preferences updated successfully");
      return profile;
    } catch (error) {
      this.notificationService.error("Failed to update preferences");
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotifications(request: UpdateNotificationPreferencesRequest): Promise<Profile> {
    try {
      const response = await this.apiService.put<any>(
        API_ENDPOINTS.UPDATE_ADMIN_NOTIFICATIONS,
        AccountMapper.updateNotificationPreferencesRequestToJson(request)
      );
      
      const profile = AccountMapper.handleProfileResponse(response);
      this.notificationService.success("Notification settings updated");
      return profile;
    } catch (error) {
      this.notificationService.error("Failed to update notification settings");
      throw error;
    }
  }

  // ============================================
  // PROFILE PICTURE
  // ============================================

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(base64Image: string): Promise<Profile> {
    try {
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.UPLOAD_PROFILE_PICTURE,
        AccountMapper.uploadProfilePictureRequestToJson(base64Image)
      );
      
      const profile = AccountMapper.handleProfileResponse(response);
      this.notificationService.success("Profile picture uploaded successfully");
      return profile;
    } catch (error) {
      this.notificationService.error("Failed to upload profile picture");
      throw error;
    }
  }

  /**
   * Delete profile picture
   */
  async deleteProfilePicture(): Promise<Profile> {
    try {
      const response = await this.apiService.delete<any>(API_ENDPOINTS.DELETE_PROFILE_PICTURE);
      
      const profile = AccountMapper.handleProfileResponse(response);
      this.notificationService.success("Profile picture deleted");
      return profile;
    } catch (error) {
      this.notificationService.error("Failed to delete profile picture");
      throw error;
    }
  }

  // ============================================
  // PASSWORD MANAGEMENT
  // ============================================

  /**
   * Change password
   */
  async changePassword(request: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.apiService.put<any>(
        API_ENDPOINTS.CHANGE_ADMIN_PASSWORD,
        AccountMapper.changePasswordRequestToJson(request)
      );
      
      const result = AccountMapper.handleSuccessResponse(response);
      this.notificationService.success("Password changed successfully");
      return result;
    } catch (error) {
      this.notificationService.error("Failed to change password");
      throw error;
    }
  }

  // ============================================
  // TWO-FACTOR AUTHENTICATION
  // ============================================

  /**
   * Enable 2FA - Get QR code and secret
   */
  async enable2FA(): Promise<TwoFactorSetup> {
    try {
      const response = await this.apiService.post<any>(API_ENDPOINTS.ENABLE_2FA, {});
      return AccountMapper.handle2FASetupResponse(response);
    } catch (error) {
      this.notificationService.error("Failed to generate 2FA setup");
      throw error;
    }
  }

  /**
   * Verify and activate 2FA
   */
  async verify2FASetup(request: Enable2FARequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.VERIFY_2FA_SETUP,
        AccountMapper.enable2FARequestToJson(request)
      );
      
      const result = AccountMapper.handleSuccessResponse(response);
      this.notificationService.success("Two-factor authentication enabled successfully");
      return result;
    } catch (error) {
      this.notificationService.error("Failed to enable 2FA");
      throw error;
    }
  }

  /**
   * Disable 2FA
   */
  async disable2FA(request: Disable2FARequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.DISABLE_2FA,
        AccountMapper.disable2FARequestToJson(request)
      );
      
      const result = AccountMapper.handleSuccessResponse(response);
      this.notificationService.success("Two-factor authentication disabled");
      return result;
    } catch (error) {
      this.notificationService.error("Failed to disable 2FA");
      throw error;
    }
  }

  /**
   * Reset 2FA - Generate new secret and QR code
   */
  async reset2FA(request: Reset2FARequest): Promise<TwoFactorSetup> {
    try {
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.RESET_2FA,
        AccountMapper.reset2FARequestToJson(request)
      );
      
      const setup = AccountMapper.handle2FASetupResponse(response);
      this.notificationService.success("2FA reset successfully - scan the new QR code");
      return setup;
    } catch (error) {
      this.notificationService.error("Failed to reset 2FA");
      throw error;
    }
  }

  // ============================================
  // SECURITY DASHBOARD
  // ============================================

  /**
   * Get comprehensive security dashboard
   */
  async getSecurityDashboard(): Promise<SecurityDashboard> {
    try {
      const response = await this.apiService.get<any>(API_ENDPOINTS.GET_SECURITY_DASHBOARD);
      return AccountMapper.handleSecurityDashboardResponse(response);
    } catch (error) {
      this.notificationService.error("Failed to load security dashboard");
      throw error;
    }
  }

  // ============================================
  // ACCOUNT DELETION
  // ============================================

  /**
   * Delete account (soft delete)
   */
  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.apiService.delete<any>(API_ENDPOINTS.DELETE_ADMIN_ACCOUNT);
      
      const result = AccountMapper.handleSuccessResponse(response);
      this.notificationService.success("Account deleted successfully");
      return result;
    } catch (error) {
      this.notificationService.error("Failed to delete account");
      throw error;
    }
  }
}
