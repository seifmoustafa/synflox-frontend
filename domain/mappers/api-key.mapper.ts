/**
 * API Key Mappers
 * 
 * Handles conversion between API key domain models and external data formats.
 */

import {
  ApiKey,
  CreateApiKeyRequest,
  UpdateApiKeyRequest,
  CreateApiKeyResponse,
  RegenerateApiKeyResponse,
  type ApiKeyData,
  type CreateApiKeyRequestData,
  type UpdateApiKeyRequestData,
  type CreateApiKeyResponseData,
  type RegenerateApiKeyResponseData,
} from '../models/api-key.model';
import type { PaginationInfo } from '@/lib/pagination';

export interface ApiKeysResponse {
  data: ApiKey[];
  pagination: PaginationInfo;
}

export class ApiKeyMapper {
  /**
   * Convert JSON/API response to ApiKey domain model
   */
  static fromJson(json: any): ApiKey {
    return new ApiKey({
      id: json.id || '',
      companyId: json.companyId || '',
      keyPrefix: json.keyPrefix || '',
      keyHash: json.keyHash || '',
      name: json.name || '',
      description: json.description,
      isActive: json.isActive ?? true,
      lastUsedAt: json.lastUsedAt,
      expiresAt: json.expiresAt,
      createdAt: json.createdAt || json.createdTimestamp || new Date().toISOString(),
      updatedAt: json.updatedAt || json.updatedTimestamp,
    });
  }

  /**
   * Convert ApiKey domain model to JSON for API requests
   */
  static toJson(apiKey: ApiKey): any {
    return {
      id: apiKey.id,
      companyId: apiKey.companyId,
      keyPrefix: apiKey.keyPrefix,
      name: apiKey.name,
      description: apiKey.description,
      isActive: apiKey.isActive,
      lastUsedAt: apiKey.lastUsedAt,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
      updatedAt: apiKey.updatedAt,
    };
  }

  /**
   * Convert CreateApiKeyRequest domain model to JSON for API requests
   */
  static createRequestToJson(request: CreateApiKeyRequest): any {
    const json: any = {
      companyId: request.companyId,
      name: request.name,
    };
    if (request.description !== undefined) {
      json.description = request.description;
    }
    if (request.expiresAt !== undefined) {
      json.expiresAt = request.expiresAt;
    }
    return json;
  }

  /**
   * Convert UpdateApiKeyRequest domain model to JSON for API requests
   */
  static updateRequestToJson(request: UpdateApiKeyRequest): any {
    const json: any = {};
    if (request.name !== undefined) json.name = request.name;
    if (request.description !== undefined) json.description = request.description;
    if (request.isActive !== undefined) json.isActive = request.isActive;
    if (request.expiresAt !== undefined) json.expiresAt = request.expiresAt;
    return json;
  }

  /**
   * Convert API response to CreateApiKeyResponse
   */
  static createResponseFromJson(response: any): CreateApiKeyResponse {
    // The API returns the full key in response.data.apiKey
    // We need to extract it before creating the ApiKey object (which doesn't store the full key)
    const responseData = response?.data || response;
    const fullKey = responseData?.apiKey || responseData?.fullKey || response?.fullKey || '';
    
    // For the ApiKey object, we need to use the data without the full key
    // The response.data contains id, apiKey (full), keyPrefix, signingSecret, etc.
    // We need to construct the ApiKey from the available fields
    const apiKeyData = {
      id: responseData?.id || '',
      companyId: responseData?.companyId || '',
      keyPrefix: responseData?.keyPrefix || '',
      keyHash: responseData?.keyHash || '',
      name: responseData?.name || '',
      description: responseData?.description,
      isActive: responseData?.isActive ?? true,
      lastUsedAt: responseData?.lastUsedAt,
      expiresAt: responseData?.expiresAt,
      createdAt: responseData?.createdAt || responseData?.createdTimestamp || new Date().toISOString(),
      updatedAt: responseData?.updatedAt || responseData?.updatedTimestamp,
    };
    
    return new CreateApiKeyResponse({
      apiKey: this.fromJson(apiKeyData),
      fullKey,
    });
  }

  /**
   * Convert API response to RegenerateApiKeyResponse
   */
  static regenerateResponseFromJson(response: any): RegenerateApiKeyResponse {
    // The API returns the full key in response.data.apiKey
    // We need to extract it before creating the ApiKey object (which doesn't store the full key)
    const responseData = response?.data || response;
    const fullKey = responseData?.apiKey || responseData?.fullKey || response?.fullKey || '';
    
    // For the ApiKey object, we need to use the data without the full key
    // The response.data contains id, apiKey (full), keyPrefix, signingSecret, etc.
    // We need to construct the ApiKey from the available fields
    const apiKeyData = {
      id: responseData?.id || '',
      companyId: responseData?.companyId || '',
      keyPrefix: responseData?.keyPrefix || '',
      keyHash: responseData?.keyHash || '',
      name: responseData?.name || '',
      description: responseData?.description,
      isActive: responseData?.isActive ?? true,
      lastUsedAt: responseData?.lastUsedAt,
      expiresAt: responseData?.expiresAt,
      createdAt: responseData?.createdAt || responseData?.createdTimestamp || new Date().toISOString(),
      updatedAt: responseData?.updatedAt || responseData?.updatedTimestamp,
    };
    
    return new RegenerateApiKeyResponse({
      apiKey: this.fromJson(apiKeyData),
      fullKey,
    });
  }

  /**
   * Handle different API response formats and convert to ApiKeysResponse
   */
  static handleApiResponse(response: any): ApiKeysResponse {
    // Handle format: { data: [...], pagination: {...} } (direct array with pagination)
    if (response && typeof response === 'object' && 'data' in response && 'pagination' in response) {
      if (Array.isArray(response.data)) {
        const pagination = response.pagination || {};
        return {
          data: response.data.map((item: any) => this.fromJson(item)),
          pagination: {
            itemsCount: pagination.itemsCount || 0,
            pageSize: pagination.pageSize || 10,
            page: pagination.currentPage || pagination.page || 1,
            pagesCount: pagination.pagesCount || 0,
          }
        };
      }
    }

    // Handle SYNFLOX backend response format: { statusCode, message, data: { apiKeys, pagination } }
    if (response && typeof response === 'object' && 'data' in response) {
      const data = response.data;
      if (data && typeof data === 'object') {
        if (Array.isArray(data)) {
          const pagination = response.pagination || {};
          return {
            data: data.map((item: any) => this.fromJson(item)),
            pagination: {
              itemsCount: pagination.itemsCount || pagination.totalItems || data.length,
              pageSize: pagination.pageSize || 10,
              page: pagination.currentPage || pagination.page || 1,
              pagesCount: pagination.pagesCount || pagination.totalPages || 1,
            }
          };
        }
        if ('apiKeys' in data || 'keys' in data) {
          const keys = data.apiKeys || data.keys || [];
          const pagination = data.pagination || {};
          return {
            data: Array.isArray(keys) 
              ? keys.map((item: any) => this.fromJson(item))
              : [],
            pagination: {
              itemsCount: pagination.itemsCount || pagination.totalItems || 0,
              pageSize: pagination.pageSize || 10,
              page: pagination.currentPage || pagination.page || 1,
              pagesCount: pagination.pagesCount || pagination.totalPages || 0,
            }
          };
        }
      }
    }

    // Handle direct array response
    if (Array.isArray(response)) {
      return {
        data: response.map((item: any) => this.fromJson(item)),
        pagination: {
          itemsCount: response.length,
          pageSize: response.length,
          page: 1,
          pagesCount: 1,
        }
      };
    }

    // Fallback for unexpected response format
    return {
      data: [],
      pagination: {
        itemsCount: 0,
        pageSize: 10,
        page: 1,
        pagesCount: 0,
      }
    };
  }
}

