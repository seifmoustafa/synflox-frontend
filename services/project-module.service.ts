/**
 * Project-Module Service
 *
 * Handles Project-Module relationship operations with SYNFLOX backend API.
 */

import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import {
  ProjectModule,
  ProjectModuleMapper,
  CreateProjectModuleRequest,
  type ProjectModulesResponse,
} from "@/domain";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export interface IProjectModuleService {
  createAssociation(projectId: string, moduleId: string): Promise<ProjectModule>;
  getProjectModules(projectId: string): Promise<ProjectModulesResponse>;
  getModuleProjects(moduleId: string): Promise<ProjectModulesResponse>;
  removeAssociation(projectId: string, moduleId: string): Promise<void>;
}

export class ProjectModuleService implements IProjectModuleService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  async createAssociation(projectId: string, moduleId: string): Promise<ProjectModule> {
    try {
      const request = new CreateProjectModuleRequest({ projectId, moduleId });
      const json = ProjectModuleMapper.createRequestToJson(request);
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.PROJECT_MODULES_CREATE,
        json
      );
      const data = response?.data || response;
      const message = response?.message || "Module associated with project successfully";
      this.notificationService.success(message);
      return ProjectModuleMapper.fromJson(data);
    } catch (e) {
      throw e;
    }
  }

  async getProjectModules(projectId: string): Promise<ProjectModulesResponse> {
    try {
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.PROJECT_MODULES_GET_BY_PROJECT}/${projectId}`
      );
      return ProjectModuleMapper.handleApiResponse(response);
    } catch (e) {
      throw e;
    }
  }

  async getModuleProjects(moduleId: string): Promise<ProjectModulesResponse> {
    try {
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.PROJECT_MODULES_GET_BY_MODULE}/${moduleId}`
      );
      return ProjectModuleMapper.handleApiResponse(response);
    } catch (e) {
      throw e;
    }
  }

  async removeAssociation(projectId: string, moduleId: string): Promise<void> {
    try {
      const response = await this.apiService.delete<any>(
        `${API_ENDPOINTS.PROJECT_MODULES_DELETE}/${projectId}/module/${moduleId}`
      );
      const message = response?.message || "Association removed successfully";
      this.notificationService.success(message);
    } catch (e) {
      throw e;
    }
  }
}

