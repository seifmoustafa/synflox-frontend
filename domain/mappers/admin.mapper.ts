/**
 * Admin Mappers
 * 
 * Handles conversion between admin domain models and external data formats.
 */

import { 
  Admin, 
  CreateAdminRequest, 
  UpdateAdminRequest,
  type AdminData,
  type CreateAdminRequestData,
  type UpdateAdminRequestData
} from '../models/admin.model';
import type { PaginationInfo } from '@/lib/pagination';

export interface AdminsResponse {
  data: Admin[];
  pagination: PaginationInfo;
}

export class AdminMapper {
  /**
   * Convert JSON/API response to Admin domain model
   */
  static fromJson(json: any): Admin {
    return new Admin({
      id: json.id || '',
      username: json.username || '',
      firstName: json.firstName || '',
      lastName: json.lastName || '',
      phoneNumber: json.phoneNumber || '',
      adminTypeId: json.adminTypeId, // May not be in response
      adminTypeName: json.adminTypeName,
      isActive: json.isActive ?? true, // Default to true if not provided
      createdTimestamp: json.createdTimestamp || new Date().toISOString(),
      updatedTimestamp: json.updatedTimestamp,
    });
  }

  /**
   * Convert Admin domain model to JSON for API requests
   */
  static toJson(admin: Admin): any {
    return {
      id: admin.id,
      username: admin.username,
      firstName: admin.firstName,
      lastName: admin.lastName,
      phoneNumber: admin.phoneNumber,
      adminTypeId: admin.adminTypeId,
      adminTypeName: admin.adminTypeName,
      isActive: admin.isActive,
      createdTimestamp: admin.createdTimestamp,
      updatedTimestamp: admin.updatedTimestamp,
    };
  }

  /**
   * Convert CreateAdminRequest domain model to JSON for API requests
   */
  static createRequestToJson(request: CreateAdminRequest): any {
    return {
      username: request.username,
      password: request.password,
      firstName: request.firstName,
      lastName: request.lastName,
      phoneNumber: request.phoneNumber,
      adminTypeId: request.adminTypeId,
    };
  }

  /**
   * Convert UpdateAdminRequest domain model to JSON for API requests
   */
  static updateRequestToJson(request: UpdateAdminRequest): any {
    const json: any = {};
    if (request.username !== undefined) json.username = request.username;
    if (request.firstName !== undefined) json.firstName = request.firstName;
    if (request.lastName !== undefined) json.lastName = request.lastName;
    if (request.phoneNumber !== undefined) json.phoneNumber = request.phoneNumber;
    if (request.adminTypeId !== undefined) json.adminTypeId = request.adminTypeId;
    if (request.isActive !== undefined) json.isActive = request.isActive;
    return json;
  }

  /**
   * Handle different API response formats and convert to AdminsResponse
   * Backend format options:
   * 1. { statusCode, message, data: { admins, pagination } }
   * 2. { data: [...], pagination: {...} } (after ApiService unwrap)
   */
  static handleApiResponse(response: any): AdminsResponse {
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

    // Handle SYNFLOX backend response format: { statusCode, message, data: { admins, pagination } }
    if (response && typeof response === 'object' && 'data' in response) {
      const data = response.data;
      if (data && typeof data === 'object' && 'admins' in data) {
        const pagination = data.pagination || {};
        return {
          data: Array.isArray(data.admins) 
            ? data.admins.map((item: any) => this.fromJson(item))
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

