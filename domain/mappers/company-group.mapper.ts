/**
 * Company Group Mappers
 * 
 * Handles conversion between company group domain models and external data formats.
 */

import {
  CompanyGroup,
  CreateCompanyGroupRequest,
  UpdateCompanyGroupRequest,
  type CompanyGroupData,
  type CreateCompanyGroupRequestData,
  type UpdateCompanyGroupRequestData,
} from '../models/company-group.model';
import type { PaginationInfo } from '@/lib/pagination';

export interface CompanyGroupsResponse {
  data: CompanyGroup[];
  pagination: PaginationInfo;
}

export class CompanyGroupMapper {
  /**
   * Convert JSON/API response to CompanyGroup domain model
   */
  static fromJson(json: any): CompanyGroup {
    return new CompanyGroup({
      id: json.id || '',
      name: json.name || '',
      description: json.description,
      isActive: json.isActive ?? true,
      companyCount: json.companyCount || json.companiesCount,
      createdAt: json.createdAt || json.createdTimestamp || new Date().toISOString(),
      updatedAt: json.updatedAt || json.updatedTimestamp,
    });
  }

  /**
   * Convert CompanyGroup domain model to JSON for API requests
   */
  static toJson(group: CompanyGroup): any {
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      isActive: group.isActive,
      companyCount: group.companyCount,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
  }

  /**
   * Convert CreateCompanyGroupRequest domain model to JSON for API requests
   */
  static createRequestToJson(request: CreateCompanyGroupRequest): any {
    const json: any = {
      name: request.name,
      isActive: request.isActive,
    };
    if (request.description !== undefined) {
      json.description = request.description;
    }
    return json;
  }

  /**
   * Convert UpdateCompanyGroupRequest domain model to JSON for API requests
   */
  static updateRequestToJson(request: UpdateCompanyGroupRequest): any {
    const json: any = {};
    if (request.name !== undefined) json.name = request.name;
    if (request.description !== undefined) json.description = request.description;
    if (request.isActive !== undefined) json.isActive = request.isActive;
    return json;
  }

  /**
   * Handle different API response formats and convert to CompanyGroupsResponse
   */
  static handleApiResponse(response: any): CompanyGroupsResponse {
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

    // Handle SYNFLOX backend response format: { statusCode, message, data: { groups, pagination } }
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
        if ('groups' in data || 'companyGroups' in data) {
          const groups = data.groups || data.companyGroups || [];
          const pagination = data.pagination || {};
          const itemsCount = pagination.itemsCount || pagination.totalItems || 0;
          const pageSize = pagination.pageSize || 10;
          return {
            data: Array.isArray(groups) 
              ? groups.map((item: any) => this.fromJson(item))
              : [],
            pagination: {
              itemsCount,
              pageSize,
              page: pagination.currentPage || pagination.page || 1,
              pagesCount: pagination.pagesCount || pagination.totalPages || Math.ceil(itemsCount / pageSize) || 0,
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

