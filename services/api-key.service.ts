/**
 * API Key Service
 *
 * Handles API Key CRUD operations and regeneration with SYNFLOX backend API.
 */

import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import {
  ApiKey,
  ApiKeyMapper,
  CreateApiKeyRequest,
  UpdateApiKeyRequest,
  CreateApiKeyResponse,
  RegenerateApiKeyResponse,
  type ApiKeysResponse,
} from "@/domain";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export interface IApiKeyService {
  getApiKeys(params?: {
    page?: number;
    pageSize?: number;
    companyId?: string;
    isActive?: boolean;
  }): Promise<ApiKeysResponse>;
  getApiKeyById(id: string): Promise<ApiKey>;
  getCompanyApiKeys(companyId: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<ApiKeysResponse>;
  createApiKey(data: CreateApiKeyRequest): Promise<CreateApiKeyResponse>;
  updateApiKey(id: string, data: UpdateApiKeyRequest): Promise<ApiKey>;
  deleteApiKey(id: string): Promise<void>;
  regenerateApiKey(id: string): Promise<RegenerateApiKeyResponse>;
}

export class ApiKeyService implements IApiKeyService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  async getApiKeys(params?: {
    page?: number;
    pageSize?: number;
    companyId?: string;
    isActive?: boolean;
  }): Promise<ApiKeysResponse> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.API_KEYS_GET_ALL,
        params
      );
      return ApiKeyMapper.handleApiResponse(response);
    } catch (e) {
      throw e;
    }
  }

  async getApiKeyById(id: string): Promise<ApiKey> {
    try {
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.API_KEYS_GET_BY_ID}/${id}`
      );
      const keyData = response?.data || response;
      return ApiKeyMapper.fromJson(keyData);
    } catch (e) {
      throw e;
    }
  }

  async getCompanyApiKeys(companyId: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<ApiKeysResponse> {
    try {
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.API_KEYS_GET_BY_COMPANY}/${companyId}`,
        params
      );
      return ApiKeyMapper.handleApiResponse(response);
    } catch (e) {
      throw e;
    }
  }

  async createApiKey(data: CreateApiKeyRequest): Promise<CreateApiKeyResponse> {
    try {
      const json = ApiKeyMapper.createRequestToJson(data);
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.API_KEYS_CREATE,
        json
      );
      const result = ApiKeyMapper.createResponseFromJson(response);
      const message = response?.message || "API key created successfully";
      this.notificationService.success(message);
      return result;
    } catch (e) {
      throw e;
    }
  }

  async updateApiKey(id: string, data: UpdateApiKeyRequest): Promise<ApiKey> {
    try {
      const json = ApiKeyMapper.updateRequestToJson(data);
      const response = await this.apiService.put<any>(
        `${API_ENDPOINTS.API_KEYS_UPDATE}/${id}`,
        json
      );
      const keyData = response?.data || response;
      const message = response?.message || "API key updated successfully";
      this.notificationService.success(message);
      return ApiKeyMapper.fromJson(keyData);
    } catch (e) {
      throw e;
    }
  }

  async deleteApiKey(id: string): Promise<void> {
    try {
      const response = await this.apiService.delete<any>(
        `${API_ENDPOINTS.API_KEYS_DELETE}/${id}`
      );
      const message = response?.message || "API key deleted successfully";
      this.notificationService.success(message);
    } catch (e) {
      throw e;
    }
  }

  async regenerateApiKey(id: string): Promise<RegenerateApiKeyResponse> {
    try {
      const response = await this.apiService.put<any>(
        `${API_ENDPOINTS.API_KEYS_REGENERATE}/${id}/regenerate`,
        {}
      );
      const result = ApiKeyMapper.regenerateResponseFromJson(response);
      const message = response?.message || "API key regenerated successfully";
      this.notificationService.success(message);
      return result;
    } catch (e) {
      throw e;
    }
  }
}

