/**
 * Module Mappers
 * 
 * Handles conversion between module domain models and external data formats.
 */

import {
  Module,
  CreateModuleRequest,
  UpdateModuleRequest,
  type ModuleData,
  type CreateModuleRequestData,
  type UpdateModuleRequestData,
} from '../models/module.model';
import type { PaginationInfo } from '@/lib/pagination';

export interface ModulesResponse {
  data: Module[];
  pagination: PaginationInfo;
}

export class ModuleMapper {
  /**
   * Convert JSON/API response to Module domain model
   */
  static fromJson(json: any): Module {
    return new Module({
      id: json.id || '',
      name: json.name || '',
      description: json.description,
      isActive: json.isActive ?? true,
      createdAt: json.createdAt || json.createdTimestamp || new Date().toISOString(),
      updatedAt: json.updatedAt || json.updatedTimestamp,
    });
  }

  /**
   * Convert Module domain model to JSON for API requests
   */
  static toJson(module: Module): any {
    return {
      id: module.id,
      name: module.name,
      description: module.description,
      isActive: module.isActive,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
    };
  }

  /**
   * Convert CreateModuleRequest domain model to JSON for API requests
   */
  static createRequestToJson(request: CreateModuleRequest): any {
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
   * Convert UpdateModuleRequest domain model to JSON for API requests
   */
  static updateRequestToJson(request: UpdateModuleRequest): any {
    const json: any = {};
    if (request.name !== undefined) json.name = request.name;
    if (request.description !== undefined) json.description = request.description;
    if (request.isActive !== undefined) json.isActive = request.isActive;
    return json;
  }

  /**
   * Handle different API response formats and convert to ModulesResponse
   */
  static handleApiResponse(response: any): ModulesResponse {
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

    // Handle SYNFLOX backend response format: { statusCode, message, data: { modules, pagination } }
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
        if ('modules' in data) {
          const pagination = data.pagination || {};
          return {
            data: Array.isArray(data.modules) 
              ? data.modules.map((item: any) => this.fromJson(item))
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

