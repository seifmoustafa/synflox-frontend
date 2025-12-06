import {
  AdminToken,
  AdminTokenData,
  GenerateAdminTokenRequest,
  GenerateAdminTokenResponse,
  GenerateAdminTokenResponseData,
} from '../models/client-admin-token.model';

/**
 * Response format for admin tokens list
 */
export interface AdminTokensResponse {
  data: AdminTokenData[];
}

/**
 * Client Admin Token Mapper
 */
export class ClientAdminTokenMapper {
  /**
   * Convert API data to AdminToken domain model
   */
  static fromJson(data: AdminTokenData): AdminToken {
    return new AdminToken(
      data.id,
      data.companyId,
      data.companyName,
      data.name,
      new Date(data.issuedAtUtc),
      new Date(data.expiresAtUtc),
      data.daysUntilExpiry,
      data.status,
      data.isValid,
      data.isExpired,
      data.lastUsedAtUtc ? new Date(data.lastUsedAtUtc) : null,
      data.usageCount,
      data.lastUsedFromIp,
      data.canBindDevices,
      data.canUnbindDevices,
      data.canViewDevices,
      data.canApproveReplacements,
      data.dailyApiLimit,
      data.todayApiCalls,
      data.notes
    );
  }

  /**
   * Convert AdminToken to API data
   */
  static toJson(token: AdminToken): AdminTokenData {
    return {
      id: token.id,
      companyId: token.companyId,
      companyName: token.companyName,
      name: token.name,
      issuedAtUtc: token.issuedAtUtc.toISOString(),
      expiresAtUtc: token.expiresAtUtc.toISOString(),
      daysUntilExpiry: token.daysUntilExpiry,
      status: token.status,
      isValid: token.isValid,
      isExpired: token.isExpired,
      lastUsedAtUtc: token.lastUsedAtUtc?.toISOString() ?? null,
      usageCount: token.usageCount,
      lastUsedFromIp: token.lastUsedFromIp,
      canBindDevices: token.canBindDevices,
      canUnbindDevices: token.canUnbindDevices,
      canViewDevices: token.canViewDevices,
      canApproveReplacements: token.canApproveReplacements,
      dailyApiLimit: token.dailyApiLimit,
      todayApiCalls: token.todayApiCalls,
      notes: token.notes,
    };
  }

  /**
   * Convert GenerateAdminTokenRequest to API request format
   */
  static generateRequestToJson(request: GenerateAdminTokenRequest): Record<string, any> {
    return request.toJSON();
  }

  /**
   * Handle generate token response
   */
  static handleGenerateResponse(response: any): GenerateAdminTokenResponse {
    const data = response?.data || response;
    return new GenerateAdminTokenResponse(
      data.success,
      data.message,
      data.token,
      data.tokenInfo ? ClientAdminTokenMapper.fromJson(data.tokenInfo) : null
    );
  }

  /**
   * Handle API response for tokens list
   */
  static handleApiResponse(response: AdminTokensResponse): AdminToken[] {
    return response.data.map((data) => ClientAdminTokenMapper.fromJson(data));
  }

  /**
   * Handle single token response
   */
  static handleSingleResponse(response: any): AdminToken {
    const data = response?.data || response;
    return ClientAdminTokenMapper.fromJson(data);
  }
}
