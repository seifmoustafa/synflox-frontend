/**
 * Project Service
 *
 * Handles Project CRUD operations with SYNFLOX backend API.
 */

import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import {
  Project,
  ProjectMapper,
  CreateProjectRequest,
  UpdateProjectRequest,
  type ProjectsResponse,
} from "@/domain";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export interface IProjectService {
  getProjects(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<ProjectsResponse>;
  getProjectById(id: string): Promise<Project>;
  createProject(data: CreateProjectRequest): Promise<Project>;
  updateProject(id: string, data: UpdateProjectRequest): Promise<Project>;
  deleteProject(id: string): Promise<void>;
}

export class ProjectService implements IProjectService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  async getProjects(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<ProjectsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
      if (params?.search) queryParams.append("search", params.search);

      const url = queryParams.toString() 
        ? `${API_ENDPOINTS.PROJECTS.BASE}?${queryParams.toString()}`
        : API_ENDPOINTS.PROJECTS.BASE;

      const response = await this.apiService.get<any>(url);
      return ProjectMapper.handleApiResponse(response);
    } catch (e) {
      throw e;
    }
  }

  async getProjectById(id: string): Promise<Project> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.PROJECTS.BY_ID(id)
      );
      const projectData = response?.data || response;
      return ProjectMapper.fromJson(projectData);
    } catch (e) {
      throw e;
    }
  }

  async createProject(data: CreateProjectRequest): Promise<Project> {
    try {
      const json = ProjectMapper.createRequestToJson(data);
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.PROJECTS.BASE,
        json
      );
      const projectData = response?.data || response;
      // Note: Success notification handled by generic CRUD viewmodel
      return ProjectMapper.fromJson(projectData);
    } catch (e) {
      throw e;
    }
  }

  async updateProject(id: string, data: UpdateProjectRequest): Promise<Project> {
    try {
      const json = ProjectMapper.updateRequestToJson(data);
      const response = await this.apiService.put<any>(
        API_ENDPOINTS.PROJECTS.BY_ID(id),
        json
      );
      const projectData = response?.data || response;
      // Note: Success notification handled by generic CRUD viewmodel
      return ProjectMapper.fromJson(projectData);
    } catch (e) {
      throw e;
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await this.apiService.delete<any>(
        API_ENDPOINTS.PROJECTS.BY_ID(id)
      );
      // Note: Success notification handled by generic CRUD viewmodel
    } catch (e) {
      throw e;
    }
  }
}
