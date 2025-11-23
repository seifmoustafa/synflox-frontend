/**
 * Project Mapper
 * Handles conversion between API JSON and Project domain models
 */

import {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  type ProjectsResponse,
} from "../models/project.model";

export class ProjectMapper {
  /**
   * Convert JSON to Project domain model
   */
  static fromJson(json: any): Project {
    return new Project({
      id: json.id || "",
      name: json.name || "",
      description: json.description || null,
      features: Array.isArray(json.features) ? json.features : [],
      modules: Array.isArray(json.modules) ? json.modules : [],
      createdTimestamp: json.createdTimestamp || undefined,
      updatedTimestamp: json.updatedTimestamp || null,
    });
  }

  /**
   * Convert Project domain model to JSON
   */
  static toJson(project: Project): any {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      features: project.features,
      modules: project.modules,
      createdTimestamp: project.createdTimestamp?.toISOString(),
      updatedTimestamp: project.updatedTimestamp?.toISOString() || null,
    };
  }

  /**
   * Convert CreateProjectRequest to JSON
   */
  static createRequestToJson(request: CreateProjectRequest): any {
    return {
      name: request.name,
      description: request.description || null,
      features: request.features || [],
      moduleIds: request.moduleIds || [],
    };
  }

  /**
   * Convert UpdateProjectRequest to JSON
   */
  static updateRequestToJson(request: UpdateProjectRequest): any {
    const json: any = {};
    if (request.name !== undefined) json.name = request.name;
    if (request.description !== undefined) json.description = request.description;
    if (request.features !== undefined) json.features = request.features;
    if (request.moduleIds !== undefined) json.moduleIds = request.moduleIds;
    return json;
  }

  /**
   * Handle API response and convert to ProjectsResponse
   */
  static handleApiResponse(response: any): ProjectsResponse {
    // Handle nested response structure
    const responseData = response?.data || response;
    
    // Extract projects array
    const projectsData = responseData?.data || responseData?.projects || responseData || [];
    const projects = Array.isArray(projectsData)
      ? projectsData.map((item: any) => this.fromJson(item))
      : [];

    // Extract pagination
    const pagination = responseData?.pagination || {
      itemsCount: projects.length,
      pageSize: projects.length,
      page: 1,
      pagesCount: 1,
    };

    return {
      data: projects,
      pagination: {
        itemsCount: pagination.itemsCount || pagination.totalCount || projects.length,
        pageSize: pagination.pageSize || projects.length,
        page: pagination.page || pagination.currentPage || 1,
        pagesCount: pagination.pagesCount || pagination.totalPages || 1,
      },
    };
  }
}
