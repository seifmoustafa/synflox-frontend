/**
 * Admin Type Mappers
 * 
 * Handles conversion between admin type domain models and external data formats.
 */

import { 
  AdminType, 
  CreateAdminTypeRequest, 
  UpdateAdminTypeRequest,
  type AdminTypeData,
  type CreateAdminTypeRequestData,
  type UpdateAdminTypeRequestData
} from '../models/admin-type.model';
import type { PaginationInfo } from '@/lib/pagination';

export interface AdminTypesResponse {
  data: AdminType[];
  pagination: PaginationInfo;
}

export class AdminTypeMapper {
  /**
   * Convert JSON/API response to AdminType domain model
   */
  static fromJson(json: any): AdminType {
    return new AdminType({
      id: json.id || '',
      adminTypeName: json.adminTypeName || '',
    });
  }

  /**
   * Convert AdminType domain model to JSON for API requests
   */
  static toJson(adminType: AdminType): any {
    return {
      id: adminType.id,
      adminTypeName: adminType.adminTypeName,
    };
  }

  /**
   * Convert CreateAdminTypeRequest domain model to JSON for API requests
   */
  static createRequestToJson(request: CreateAdminTypeRequest): any {
    return {
      adminTypeName: request.adminTypeName,
    };
  }

  /**
   * Convert UpdateAdminTypeRequest domain model to JSON for API requests
   */
  static updateRequestToJson(request: UpdateAdminTypeRequest): any {
    const json: any = {};
    if (request.adminTypeName !== undefined) json.adminTypeName = request.adminTypeName;
    return json;
  }

  /**
   * Handle different API response formats and convert to AdminTypesResponse
   * Backend format options:
   * 1. { statusCode, message, data: { adminTypes, pagination } }
   * 2. { data: [...], pagination: {...} } (after ApiService unwrap)
   * 3. Direct array: [...] (when ApiService unwraps { data: [...] })
   */
  static handleApiResponse(response: any): AdminTypesResponse {
    // Handle direct array response (most common case)
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

    // Handle format: { data: [...], pagination: {...} } (direct array with pagination)
    if (response && typeof response === 'object' && 'data' in response && 'pagination' in response) {
      if (Array.isArray(response.data)) {
        const pagination = response.pagination || {};
        return {
          data: response.data.map((item: any) => this.fromJson(item)),
          pagination: {
            itemsCount: pagination.itemsCount || 0,
            pageSize: pagination.pageSize || 10,
            page: pagination.currentPage || pagination.page || 1, // Map currentPage to page
            pagesCount: pagination.pagesCount || 0,
          }
        };
      }
    }

    // Handle SYNFLOX backend response format: { statusCode, message, data: { adminTypes, pagination } }
    if (response && typeof response === 'object' && 'data' in response) {
      const data = response.data;
      if (data && typeof data === 'object' && 'adminTypes' in data) {
        const pagination = data.pagination || {};
        return {
          data: Array.isArray(data.adminTypes) 
            ? data.adminTypes.map((item: any) => this.fromJson(item))
            : [],
          pagination: {
            itemsCount: pagination.itemsCount || 0,
            pageSize: pagination.pageSize || 10,
            page: pagination.currentPage || pagination.page || 1, // Map currentPage to page
            pagesCount: pagination.pagesCount || 0,
          }
        };
      }
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

