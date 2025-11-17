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
