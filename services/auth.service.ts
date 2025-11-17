import { type IApiService } from "./api.service";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { secureTokenService } from "@/lib/secure-token-service";
import {
  User,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  Verify2FARequest,
  UserMapper,
  AuthMapper,
} from "@/domain";
import { appLogger } from "@/lib/logger";

export class AuthService {
  constructor(private readonly apiService: IApiService) {}

  async login(credentials: LoginRequest): Promise<User | LoginResponse> {
    try {
      // SYNFLOX API: POST /api/admin/auth/login
      // Backend returns: { statusCode, message, data: { success, accessToken, refreshToken, expiresIn, admin, errorMessage?, requires2FA? } }
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.AUTH_LOGIN,
        AuthMapper.loginRequestToJson(credentials)
      );

      // Handle SYNFLOX response format
      const loginData = response?.data || response;
      const loginResponse = AuthMapper.loginResponseFromJson(loginData);

      // Check if 2FA is required
      if (loginResponse.needs2FA) {
        appLogger.info("2FA verification required");
        return loginResponse; // Return response with requires2FA flag
      }

      if (loginResponse.isSuccessful && loginResponse.accessToken) {
        secureTokenService.setAccessToken(loginResponse.accessToken);
        secureTokenService.setRefreshToken(loginResponse.refreshToken);
        
        // If admin data is in response, use it; otherwise fetch user
        if (loginData?.admin) {
          return UserMapper.fromJson(loginData.admin);
        }
        return this.getMe();
      }

      // Handle error message from backend
      const errorMessage = loginResponse.errorMessage || response?.message || "Login failed: No access token received.";
      throw new Error(errorMessage);
    } catch (error) {
      appLogger.error("Login failed:", error);
      throw error;
    }
  }

  async verify2FA(request: Verify2FARequest): Promise<User> {
    try {
      // SYNFLOX API: POST /api/admin/auth/verify-2fa
      // Backend returns: { statusCode, message, data: { success, accessToken, refreshToken, expiresIn, admin, errorMessage? } }
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.AUTH_LOGIN_2FA,
        AuthMapper.verify2FARequestToJson(request)
      );

      // Handle SYNFLOX response format
      const loginData = response?.data || response;
      const loginResponse = AuthMapper.loginResponseFromJson(loginData);

      if (loginResponse.isSuccessful && loginResponse.accessToken) {
        secureTokenService.setAccessToken(loginResponse.accessToken);
        secureTokenService.setRefreshToken(loginResponse.refreshToken);
        
        // If admin data is in response, use it; otherwise fetch user
        if (loginData?.admin) {
          return UserMapper.fromJson(loginData.admin);
        }
        return this.getMe();
      }

      // Handle error message from backend
      const errorMessage = loginResponse.errorMessage || response?.message || "2FA verification failed.";
      throw new Error(errorMessage);
    } catch (error) {
      appLogger.error("2FA verification failed:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // SYNFLOX API: POST /api/admin/auth/logout
      await this.apiService.post(API_ENDPOINTS.AUTH_LOGOUT);
    } catch (error) {
      appLogger.error("Logout API call failed:", error);
      // Even if logout fails on server, clear local tokens
    } finally {
      secureTokenService.clearTokens();
      // Clear navigation data from localStorage
      localStorage.removeItem("navigation_data");
      localStorage.removeItem("navigation_data_expiry");
      appLogger.debug("Navigation data cleared from localStorage on logout");
    }
  }

  async getMe(): Promise<User> {
    try {
      // SYNFLOX API: GET /api/admin/profile/me
      // Backend returns: { statusCode, message, data: AdminDto }
      const response = await this.apiService.get<any>(API_ENDPOINTS.GET_ADMIN_ME);
      const adminData = response?.data || response;
      return UserMapper.fromJson(adminData);
    } catch (error) {
      appLogger.error("Failed to fetch current user:", error);
      throw error;
    }
  }

  hasToken(): boolean {
    return secureTokenService.hasToken();
  }

  async refreshToken(): Promise<LoginResponse | null> {
    const refreshToken = secureTokenService.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const refreshRequest = new RefreshTokenRequest({ refreshToken });
      // SYNFLOX API: POST /api/admin/auth/refresh-token
      // Backend returns: { statusCode, message, data: { success, accessToken, refreshToken, expiresIn, errorMessage? } }
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.AUTH_REFRESH_TOKEN,
        AuthMapper.refreshTokenRequestToJson(refreshRequest)
      );

      const loginData = response?.data || response;
      const loginResponse = AuthMapper.loginResponseFromJson(loginData);
      if (loginResponse.isSuccessful) {
        secureTokenService.setAccessToken(loginResponse.accessToken);
        if (loginResponse.refreshToken) {
          secureTokenService.setRefreshToken(loginResponse.refreshToken);
        }
      }
      return loginResponse;
    } catch (error) {
      appLogger.error("Token refresh failed:", error);
      secureTokenService.clearTokens();
      return null;
    }
  }
}
