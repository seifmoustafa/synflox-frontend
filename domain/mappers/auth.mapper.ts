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
  type LoginRequestData,
  type LoginResponseData,
  type RefreshTokenRequestData
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
   * Backend expects PascalCase: { Username, Password }
   */
  static loginRequestToJson(request: LoginRequest): any {
    return {
      Username: request.username,  // Backend expects PascalCase
      Password: request.password,  // Backend expects PascalCase
    };
  }

  /**
   * Convert JSON/API response to LoginResponse domain model
   * Backend returns PascalCase: { Success, AccessToken, RefreshToken, ErrorMessage }
   */
  static loginResponseFromJson(json: any): LoginResponse {
    return new LoginResponse({
      // Handle both PascalCase (backend) and camelCase (legacy)
      success: json.Success ?? json.success ?? false,
      accessToken: json.AccessToken ?? json.accessToken ?? '',
      refreshToken: json.RefreshToken ?? json.refreshToken ?? '',
      errorMessage: json.ErrorMessage ?? json.errorMessage,
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
   * Backend expects PascalCase: { RefreshToken }
   */
  static refreshTokenRequestToJson(request: RefreshTokenRequest): any {
    return {
      RefreshToken: request.refreshToken,  // Backend expects PascalCase
    };
  }
}
