/**
 * Authentication Domain Models
 * 
 * Contains all authentication-related domain models including
 * login requests, responses, and related data structures.
 */

import { validateForm, VALIDATION_SETS } from "@/lib/validation";

export interface LoginRequestData {
  username: string;
  password: string;
}

export interface LoginResponseData {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  errorMessage?: string;
  requires2FA?: boolean;
  message?: string;
}

export interface Verify2FARequestData {
  username: string;
  password: string;
  verificationCode: string;
}

export interface RefreshTokenRequestData {
  refreshToken: string;
}

export class LoginRequest {
  public readonly username: string;
  public readonly password: string;

  constructor(data: LoginRequestData) {
    this.username = data.username;
    this.password = data.password;
  }

  /**
   * Validate login request data
   */
  get isValid(): boolean {
    const validationResults = validateForm(
      { username: this.username, password: this.password },
      VALIDATION_SETS.LOGIN_FORM
    );
    return Object.values(validationResults).every(result => result.isValid);
  }

}

export class LoginResponse {
  public readonly success: boolean;
  public readonly accessToken: string;
  public readonly refreshToken: string;
  public readonly errorMessage?: string;
  public readonly requires2FA?: boolean;
  public readonly message?: string;

  constructor(data: LoginResponseData) {
    this.success = data.success;
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.errorMessage = data.errorMessage;
    this.requires2FA = data.requires2FA;
    this.message = data.message;
  }

  /**
   * Check if login was successful
   */
  get isSuccessful(): boolean {
    return this.success && !!(this.accessToken && this.refreshToken);
  }

  /**
   * Check if 2FA verification is required
   */
  get needs2FA(): boolean {
    return this.requires2FA === true;
  }

}

export class Verify2FARequest {
  public readonly username: string;
  public readonly password: string;
  public readonly verificationCode: string;

  constructor(data: Verify2FARequestData) {
    this.username = data.username;
    this.password = data.password;
    this.verificationCode = data.verificationCode;
  }

  /**
   * Validate 2FA request data
   */
  get isValid(): boolean {
    return !!(
      this.username?.trim() && 
      this.password?.trim() && 
      this.verificationCode?.trim() && 
      this.verificationCode.length === 6
    );
  }

}

// ============================================
// BACKUP CODE VERIFICATION (Login Recovery)
// ============================================

export interface VerifyBackupCodeRequestData {
  username: string;
  backupCode: string;
}

export class VerifyBackupCodeRequest {
  public readonly username: string;
  public readonly backupCode: string;

  constructor(data: VerifyBackupCodeRequestData) {
    this.username = data.username;
    this.backupCode = data.backupCode.toUpperCase().replace(/\s/g, '');
  }

  /**
   * Validate backup code request
   * Backup codes are 8 characters (e.g., ABCD1234)
   */
  get isValid(): boolean {
    return !!(
      this.username?.trim() && 
      this.backupCode?.trim() && 
      this.backupCode.length === 8
    );
  }

  /**
   * Format backup code for display (e.g., ABCD-1234)
   */
  get formattedCode(): string {
    if (this.backupCode.length === 8) {
      return `${this.backupCode.substring(0, 4)}-${this.backupCode.substring(4)}`;
    }
    return this.backupCode;
  }

}

export class RefreshTokenRequest {
  public readonly refreshToken: string;

  constructor(data: RefreshTokenRequestData) {
    this.refreshToken = data.refreshToken;
  }

  /**
   * Validate refresh token request
   */
  get isValid(): boolean {
    return !!(this.refreshToken && this.refreshToken.trim().length > 0);
  }

}

// ============================================
// PASSWORD RESET MODELS
// ============================================

export interface ForgotPasswordRequestData {
  email: string;
}

export class ForgotPasswordRequest {
  public readonly email: string;

  constructor(data: ForgotPasswordRequestData) {
    this.email = data.email;
  }

  /**
   * Validate forgot password request
   */
  get isValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !!(this.email && emailRegex.test(this.email.trim()));
  }

}

// ============================================
// FORGOT PASSWORD WITH 2FA
// ============================================

export interface Check2FAStatusResponseData {
  has2FA: boolean;
  emailExists: boolean;
}

export class Check2FAStatusResponse {
  public readonly has2FA: boolean;
  public readonly emailExists: boolean;

  constructor(data: Check2FAStatusResponseData) {
    this.has2FA = data.has2FA;
    this.emailExists = data.emailExists;
  }

  /**
   * Check if 2FA verification is required for password reset
   */
  get requires2FAForReset(): boolean {
    return this.has2FA && this.emailExists;
  }

}

export interface ForgotPasswordWith2FARequestData {
  email: string;
  twoFactorCode?: string;
  backupCode?: string;
}

export class ForgotPasswordWith2FARequest {
  public readonly email: string;
  public readonly twoFactorCode?: string;
  public readonly backupCode?: string;

  constructor(data: ForgotPasswordWith2FARequestData) {
    this.email = data.email;
    this.twoFactorCode = data.twoFactorCode;
    this.backupCode = data.backupCode?.toUpperCase().replace(/\s/g, '');
  }

  /**
   * Validate forgot password with 2FA request
   * Must have email and either 2FA code OR backup code
   */
  get isValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailValid = !!(this.email && emailRegex.test(this.email.trim()));
    
    const has2FACode = !!(this.twoFactorCode?.trim() && this.twoFactorCode.length === 6);
    const hasBackupCode = !!(this.backupCode?.trim() && this.backupCode.length === 8);
    
    return emailValid && (has2FACode || hasBackupCode);
  }

  /**
   * Check which verification method is being used
   */
  get verificationType(): '2fa' | 'backup' | 'none' {
    if (this.twoFactorCode?.trim()) return '2fa';
    if (this.backupCode?.trim()) return 'backup';
    return 'none';
  }

}

export interface ValidateMagicLinkRequestData {
  token: string;
}

export class ValidateMagicLinkRequest {
  public readonly token: string;

  constructor(data: ValidateMagicLinkRequestData) {
    this.token = data.token;
  }

  /**
   * Validate magic link request
   */
  get isValid(): boolean {
    return !!(this.token && this.token.trim().length > 0);
  }

}

export interface MagicLinkValidationResponseData {
  email: string;
  otpCode: string;
  isValid: boolean;
  expiryMinutes: number;
}

export class MagicLinkValidationResponse {
  public readonly email: string;
  public readonly otpCode: string;
  public readonly isValid: boolean;
  public readonly expiryMinutes: number;

  constructor(data: MagicLinkValidationResponseData) {
    this.email = data.email;
    this.otpCode = data.otpCode;
    this.isValid = data.isValid;
    this.expiryMinutes = data.expiryMinutes;
  }

  /**
   * Check if magic link is still valid
   */
  get isExpired(): boolean {
    return !this.isValid;
  }

  /**
   * Get expiry time in minutes
   */
  get timeRemaining(): number {
    return this.expiryMinutes;
  }

}

export interface ResetPasswordRequestData {
  email: string;
  otpCode: string;
  newPassword: string;
}

export class ResetPasswordRequest {
  public readonly email: string;
  public readonly otpCode: string;
  public readonly newPassword: string;

  constructor(data: ResetPasswordRequestData) {
    this.email = data.email;
    this.otpCode = data.otpCode;
    this.newPassword = data.newPassword;
  }

  /**
   * Validate reset password request
   */
  get isValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const otpRegex = /^\d{6}$/;
    const passwordValid = this.newPassword && this.newPassword.length >= 8;
    
    return !!(
      this.email && emailRegex.test(this.email.trim()) &&
      this.otpCode && otpRegex.test(this.otpCode) &&
      passwordValid
    );
  }

  /**
   * Check password strength
   */
  get passwordStrength(): 'weak' | 'medium' | 'strong' {
    if (!this.newPassword) return 'weak';
    
    const hasUpperCase = /[A-Z]/.test(this.newPassword);
    const hasLowerCase = /[a-z]/.test(this.newPassword);
    const hasNumbers = /\d/.test(this.newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(this.newPassword);
    const isLongEnough = this.newPassword.length >= 12;
    
    const criteriaCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar, isLongEnough]
      .filter(Boolean).length;
    
    if (criteriaCount >= 4) return 'strong';
    if (criteriaCount >= 2) return 'medium';
    return 'weak';
  }

}

// ============================================================================
// Verify Reset OTP Request
// ============================================================================

export interface VerifyResetOtpRequestData {
  email: string;
  otpCode: string;
}

export class VerifyResetOtpRequest {
  readonly email: string;
  readonly otpCode: string;

  constructor(data: VerifyResetOtpRequestData) {
    this.email = data.email;
    this.otpCode = data.otpCode;
  }

  get isValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      emailRegex.test(this.email) &&
      this.otpCode.trim().length === 6 &&
      /^\d{6}$/.test(this.otpCode.trim())
    );
  }
}
