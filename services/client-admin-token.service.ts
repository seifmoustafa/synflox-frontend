import { API_ENDPOINTS } from '@/config/api-endpoints';
import { IApiService } from './api.service';
import { INotificationService } from './notification.service';
import {
  AdminToken,
  GenerateAdminTokenRequest,
  GenerateAdminTokenResponse,
} from '@/domain/models/client-admin-token.model';
import { ClientAdminTokenMapper } from '@/domain/mappers/client-admin-token.mapper';

/**
 * Client Admin Token Service Interface
 */
export interface IClientAdminTokenService {
  /**
   * Generate a new admin token for a company
   */
  generateToken(request: GenerateAdminTokenRequest): Promise<GenerateAdminTokenResponse>;

  /**
   * Revoke an admin token
   */
  revokeToken(tokenId: string): Promise<boolean>;

  /**
   * Get all tokens for a company
   */
  getTokensByCompany(companyId: string): Promise<AdminToken[]>;
}

/**
 * Client Admin Token Service Implementation
 */
export class ClientAdminTokenService implements IClientAdminTokenService {
  constructor(
    private readonly apiService: IApiService,
    private readonly notificationService: INotificationService
  ) {}

  async generateToken(request: GenerateAdminTokenRequest): Promise<GenerateAdminTokenResponse> {
    try {
      const response = await this.apiService.post(
        API_ENDPOINTS.CLIENT_ADMIN_TOKENS.GENERATE,
        ClientAdminTokenMapper.generateRequestToJson(request)
      );
      
      const result = ClientAdminTokenMapper.handleGenerateResponse(response);
      
      if (result.success) {
        this.notificationService.success(result.message || 'Token generated successfully');
      } else {
        this.notificationService.error(result.message || 'Failed to generate token');
      }
      
      return result;
    } catch (error: any) {
      const message = error?.message || 'Failed to generate token';
      this.notificationService.error(message);
      throw error;
    }
  }

  async revokeToken(tokenId: string): Promise<boolean> {
    try {
      await this.apiService.delete(
        API_ENDPOINTS.CLIENT_ADMIN_TOKENS.REVOKE(tokenId)
      );
      
      this.notificationService.success('Token revoked successfully');
      return true;
    } catch (error: any) {
      const message = error?.message || 'Failed to revoke token';
      this.notificationService.error(message);
      throw error;
    }
  }

  async getTokensByCompany(companyId: string): Promise<AdminToken[]> {
    try {
      const response = await this.apiService.get(
        API_ENDPOINTS.CLIENT_ADMIN_TOKENS.GET_BY_COMPANY(companyId)
      );
      
      // Handle the API response format
      const data = (response as any)?.data || response;
      if (Array.isArray(data)) {
        return data.map((item: any) => ClientAdminTokenMapper.fromJson(item));
      }
      return ClientAdminTokenMapper.handleApiResponse({ data: data || [] });
    } catch (error: any) {
      const message = error?.message || 'Failed to load tokens';
      this.notificationService.error(message);
      throw error;
    }
  }
}
