/**
 * Project Mappers
 * 
 * Handles conversion between project domain models and external data formats.
 */

import {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  type ProjectData,
  type CreateProjectRequestData,
  type UpdateProjectRequestData,
} from '../models/project.model';
import type { PaginationInfo } from '@/lib/pagination';

export interface ProjectsResponse {
  data: Project[];
  pagination: PaginationInfo;
}

export class ProjectMapper {
  /**
   * Convert JSON/API response to Project domain model
   */
  static fromJson(json: any): Project {
    return new Project({
      id: json.id || '',
      name: json.name || '',
      description: json.description,
      features: json.features || null,
      isActive: json.isActive ?? true,
      createdAt: json.createdAt || json.createdTimestamp || new Date().toISOString(),
      updatedAt: json.updatedAt || json.updatedTimestamp,
    });
  }

  /**
   * Convert Project domain model to JSON for API requests
   */
  static toJson(project: Project): any {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      features: project.features,
      isActive: project.isActive,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  /**
   * Convert CreateProjectRequest domain model to JSON for API requests
   */
  static createRequestToJson(request: CreateProjectRequest): any {
    const json: any = {
      name: request.name,
      isActive: request.isActive,
    };
    if (request.description !== undefined) {
      json.description = request.description;
    }
    if (request.features !== undefined) {
      json.features = request.features;
    }
    return json;
  }

  /**
   * Convert UpdateProjectRequest domain model to JSON for API requests
   */
  static updateRequestToJson(request: UpdateProjectRequest): any {
    const json: any = {};
    if (request.name !== undefined) json.name = request.name;
    if (request.description !== undefined) json.description = request.description;
    if (request.features !== undefined) json.features = request.features;
    if (request.isActive !== undefined) json.isActive = request.isActive;
    return json;
  }


  /**
   * Handle different API response formats and convert to ProjectsResponse
   */
  static handleApiResponse(response: any): ProjectsResponse {
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

    // Handle SYNFLOX backend response format: { statusCode, message, data: { projects, pagination } }
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
        if ('projects' in data) {
          const pagination = data.pagination || {};
          return {
            data: Array.isArray(data.projects) 
              ? data.projects.map((item: any) => this.fromJson(item))
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

