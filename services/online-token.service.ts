/**
 * Online Token Service
 * Handles API communication for online client tokens
 */

import { API_ENDPOINTS } from '@/config/api-endpoints';
import { IApiService } from './api.service';
import { INotificationService } from './notification.service';
import {
  OnlineToken,
  OnlineDevice,
  DeviceLimit,
  GenerateOnlineTokenRequest,
  GenerateOnlineTokenResponse,
  GenerateOnlineTokenResponseData,
  PendingChanges,
} from '@/domain/models/online-token.model';
import { OnlineTokenMapper } from '@/domain/mappers/online-token.mapper';

export interface IOnlineTokenService {
  // Token Operations
  getTokensBySubscription(subscriptionId: string, includeRevoked?: boolean): Promise<OnlineToken[]>;
  getTokensByCompany(companyId: string, includeRevoked?: boolean): Promise<OnlineToken[]>;
  generateToken(request: GenerateOnlineTokenRequest): Promise<GenerateOnlineTokenResponse>;
  revokeToken(tokenId: string, reason: string): Promise<boolean>;
  regenerateToken(tokenId: string): Promise<GenerateOnlineTokenResponse>;
  
  // Device Operations
  getDevices(subscriptionId: string): Promise<OnlineDevice[]>;
  getDeviceLimit(subscriptionId: string): Promise<DeviceLimit>;
  unbindDevice(deviceId: string): Promise<boolean>;
  
  // Pending Changes
  getPendingChanges(subscriptionId: string): Promise<PendingChanges>;
}

export class OnlineTokenService implements IOnlineTokenService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  // ========== Token Operations ==========

  async getTokensBySubscription(subscriptionId: string, includeRevoked = false): Promise<OnlineToken[]> {
    try {
      const url = `${API_ENDPOINTS.ONLINE_TOKENS.BY_SUBSCRIPTION(subscriptionId)}?includeRevoked=${includeRevoked}`;
      const response = await this.apiService.get<any>(url);
      return OnlineTokenMapper.tokensFromResponse(response);
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
      return [];
    }
  }

  async getTokensByCompany(companyId: string, includeRevoked = false): Promise<OnlineToken[]> {
    try {
      const url = `${API_ENDPOINTS.ONLINE_TOKENS.BY_COMPANY(companyId)}?includeRevoked=${includeRevoked}`;
      const response = await this.apiService.get<any>(url);
      return OnlineTokenMapper.tokensFromResponse(response);
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
      return [];
    }
  }

  async generateToken(request: GenerateOnlineTokenRequest): Promise<GenerateOnlineTokenResponse> {
    try {
      const response = await this.apiService.post<GenerateOnlineTokenResponseData>(
        API_ENDPOINTS.ONLINE_TOKENS.GENERATE,
        OnlineTokenMapper.generateRequestToJson(request)
      );
      
      const result = OnlineTokenMapper.generateResponseFromJson(response);
      
      if (result.success) {
        this.notificationService.success('Token generated successfully');
      } else {
        this.notificationService.error(result.message || 'Failed to generate token');
      }
      
      return result;
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to generate token';
      this.notificationService.error(message);
      return new GenerateOnlineTokenResponse(false, message, null, null);
    }
  }

  async revokeToken(tokenId: string, reason: string): Promise<boolean> {
    try {
      await this.apiService.post(
        API_ENDPOINTS.ONLINE_TOKENS.REVOKE(tokenId),
        { reason }
      );
      this.notificationService.success('Token revoked successfully');
      return true;
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to revoke token';
      this.notificationService.error(message);
      return false;
    }
  }

  async regenerateToken(tokenId: string): Promise<GenerateOnlineTokenResponse> {
    try {
      const response = await this.apiService.post<GenerateOnlineTokenResponseData>(
        API_ENDPOINTS.ONLINE_TOKENS.REGENERATE(tokenId),
        {}
      );
      
      const result = OnlineTokenMapper.generateResponseFromJson(response);
      
      if (result.success) {
        this.notificationService.success('Token regenerated successfully');
      } else {
        this.notificationService.error(result.message || 'Failed to regenerate token');
      }
      
      return result;
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to regenerate token';
      this.notificationService.error(message);
      return new GenerateOnlineTokenResponse(false, message, null, null);
    }
  }

  // ========== Device Operations ==========

  async getDevices(subscriptionId: string): Promise<OnlineDevice[]> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.ONLINE_TOKENS.DEVICES(subscriptionId)
      );
      return OnlineTokenMapper.devicesFromResponse(response);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      return [];
    }
  }

  async getDeviceLimit(subscriptionId: string): Promise<DeviceLimit> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.ONLINE_TOKENS.DEVICE_LIMIT(subscriptionId)
      );
      return OnlineTokenMapper.deviceLimitFromJson(response);
    } catch (error) {
      console.error('Failed to fetch device limit:', error);
      return new DeviceLimit(0, null, true, true, null);
    }
  }

  async unbindDevice(deviceId: string): Promise<boolean> {
    try {
      await this.apiService.delete(
        API_ENDPOINTS.ONLINE_TOKENS.UNBIND_DEVICE(deviceId)
      );
      this.notificationService.success('Device unbound successfully');
      return true;
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to unbind device';
      this.notificationService.error(message);
      return false;
    }
  }

  // ========== Pending Changes ==========

  async getPendingChanges(subscriptionId: string): Promise<PendingChanges> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.ONLINE_TOKENS.PENDING_CHANGES(subscriptionId)
      );
      return OnlineTokenMapper.pendingChangesFromJson(response);
    } catch (error) {
      console.error('Failed to fetch pending changes:', error);
      return new PendingChanges(subscriptionId, 0, null, []);
    }
  }
}
