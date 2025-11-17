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
  type LoginRequestData,
  type LoginResponseData,
  type RefreshTokenRequestData,
  type Verify2FARequestData
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
}
