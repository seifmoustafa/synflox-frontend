/**
 * Authentication Mappers
 * 
 * Handles conversion between authentication domain models and external data formats.
 * Follows Single Responsibility Principle by separating serialization concerns
 * from domain logic.
 */

import { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest,
  Verify2FARequest,
  VerifyBackupCodeRequest,
  ForgotPasswordRequest,
  ForgotPasswordWith2FARequest,
  Check2FAStatusResponse,
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
  type ValidateMagicLinkRequestData,
  type MagicLinkValidationResponseData,
  type ResetPasswordRequestData
} from '../models/auth.model';

export class AuthMapper {
  /**
   * Convert JSON/API response to LoginRequest domain model
   */
  static loginRequestFromJson(json: any): LoginRequest {
    return new LoginRequest({
      username: json.username || '',
      password: json.password || '',
    });
  }

  /**
   * Convert LoginRequest domain model to JSON for API requests
   */
  static loginRequestToJson(request: LoginRequest): any {
    return {
      username: request.username,
      password: request.password,
    };
  }

  /**
   * Convert JSON/API response to LoginResponse domain model
   */
  static loginResponseFromJson(json: any): LoginResponse {
    return new LoginResponse({
      success: json.success || false,
      accessToken: json.accessToken || '',
      refreshToken: json.refreshToken || '',
      errorMessage: json.errorMessage,
      requires2FA: json.requires2FA || json.requiresTwoFactor || false,
      message: json.message,
    });
  }

  /**
   * Convert LoginResponse domain model to JSON
   */
  static loginResponseToJson(response: LoginResponse): any {
    return {
      success: response.success,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      errorMessage: response.errorMessage,
      requires2FA: response.requires2FA,
      message: response.message,
    };
  }

  /**
   * Convert JSON to Verify2FARequest domain model
   */
  static verify2FARequestFromJson(json: any): Verify2FARequest {
    return new Verify2FARequest({
      username: json.username || '',
      password: json.password || '',
      verificationCode: json.twoFactorCode || json.verificationCode || json.code || '',
    });
  }

  /**
   * Convert Verify2FARequest domain model to JSON for API requests
   */
  static verify2FARequestToJson(request: Verify2FARequest): any {
    return {
      username: request.username,
      password: request.password,
      twoFactorCode: request.verificationCode, // Backend expects twoFactorCode
    };
  }

  // ============================================
  // BACKUP CODE VERIFICATION MAPPERS
  // ============================================

  /**
   * Convert VerifyBackupCodeRequest domain model to JSON for API requests
   */
  static verifyBackupCodeRequestToJson(request: VerifyBackupCodeRequest): any {
    return {
      username: request.username,
      backupCode: request.backupCode, // Already formatted as uppercase, no spaces
    };
  }

  /**
   * Convert JSON/API response to RefreshTokenRequest domain model
   */
  static refreshTokenRequestFromJson(json: any): RefreshTokenRequest {
    return new RefreshTokenRequest({
      refreshToken: json.refreshToken || '',
    });
  }

  /**
   * Convert RefreshTokenRequest domain model to JSON for API requests
   */
  static refreshTokenRequestToJson(request: RefreshTokenRequest): any {
    return {
      refreshToken: request.refreshToken,
    };
  }

  // ============================================
  // PASSWORD RESET MAPPERS
  // ============================================

  /**
   * Convert ForgotPasswordRequest domain model to JSON for API requests
   */
  static forgotPasswordRequestToJson(request: ForgotPasswordRequest): any {
    return {
      email: request.email,
    };
  }

  /**
   * Convert ForgotPasswordWith2FARequest domain model to JSON for API requests
   */
  static forgotPasswordWith2FARequestToJson(request: ForgotPasswordWith2FARequest): any {
    return {
      email: request.email,
      twoFactorCode: request.twoFactorCode || null,
      backupCode: request.backupCode || null,
    };
  }

  /**
   * Convert JSON/API response to Check2FAStatusResponse domain model
   */
  static check2FAStatusResponseFromJson(json: any): Check2FAStatusResponse {
    return new Check2FAStatusResponse({
      has2FA: json.has2FA || json.data?.has2FA || false,
      emailExists: json.emailExists || json.data?.emailExists || true,
    });
  }

  /**
   * Convert ValidateMagicLinkRequest domain model to JSON for API requests
   */
  static validateMagicLinkRequestToJson(request: ValidateMagicLinkRequest): any {
    return {
      token: request.token,
    };
  }

  /**
   * Convert JSON/API response to MagicLinkValidationResponse domain model
   */
  static magicLinkValidationResponseFromJson(json: any): MagicLinkValidationResponse {
    return new MagicLinkValidationResponse({
      email: json.email || '',
      otpCode: json.otpCode || '',
      isValid: json.isValid || false,
      expiryMinutes: json.expiryMinutes || 0,
    });
  }

  /**
   * Convert ResetPasswordRequest domain model to JSON for API requests
   */
  static resetPasswordRequestToJson(request: ResetPasswordRequest): any {
    return {
      email: request.email,
      otpCode: request.otpCode,
      newPassword: request.newPassword,
    };
  }

  /**
   * Handle API response for password reset operations
   * Extracts the message from the response
   */
  static handlePasswordResetResponse(json: any): { success: boolean; message: string } {
    return {
      success: json.statusCode === 200 || json.success === true,
      message: json.message || json.data || 'Operation completed',
    };
  }
}
