/**
 * Project-Module Mappers
 * 
 * Handles conversion between project-module domain models and external data formats.
 */

import {
  ProjectModule,
  CreateProjectModuleRequest,
  type ProjectModuleData,
  type CreateProjectModuleRequestData,
} from '../models/project-module.model';
import type { PaginationInfo } from '@/lib/pagination';

export interface ProjectModulesResponse {
  data: ProjectModule[];
  pagination: PaginationInfo;
}

export class ProjectModuleMapper {
  /**
   * Convert JSON/API response to ProjectModule domain model
   */
  static fromJson(json: any): ProjectModule {
    return new ProjectModule({
      id: json.id || '',
      projectId: json.projectId || '',
      moduleId: json.moduleId || '',
      projectName: json.projectName,
      moduleName: json.moduleName,
      createdAt: json.createdAt || json.createdTimestamp || new Date().toISOString(),
    });
  }

  /**
   * Convert ProjectModule domain model to JSON for API requests
   */
  static toJson(projectModule: ProjectModule): any {
    return {
      id: projectModule.id,
      projectId: projectModule.projectId,
      moduleId: projectModule.moduleId,
      projectName: projectModule.projectName,
      moduleName: projectModule.moduleName,
      createdAt: projectModule.createdAt,
    };
  }

  /**
   * Convert CreateProjectModuleRequest domain model to JSON for API requests
   */
  static createRequestToJson(request: CreateProjectModuleRequest): any {
    return {
      projectId: request.projectId,
      moduleId: request.moduleId,
    };
  }

  /**
   * Handle different API response formats and convert to ProjectModulesResponse
   */
  static handleApiResponse(response: any): ProjectModulesResponse {
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

    // Handle SYNFLOX backend response format
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
        if ('projectModules' in data || 'modules' in data || 'projects' in data) {
          const items = data.projectModules || data.modules || data.projects || [];
          const pagination = data.pagination || {};
          return {
            data: Array.isArray(items) 
              ? items.map((item: any) => this.fromJson(item))
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

