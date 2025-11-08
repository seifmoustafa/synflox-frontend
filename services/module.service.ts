/**
 * Module Service
 *
 * Handles Module CRUD operations with SYNFLOX backend API.
 */

import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import {
  Module,
  ModuleMapper,
  CreateModuleRequest,
  UpdateModuleRequest,
  type ModulesResponse,
} from "@/domain";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export interface IModuleService {
  getModules(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<ModulesResponse>;
  getModuleById(id: string): Promise<Module>;
  createModule(data: CreateModuleRequest): Promise<Module>;
  updateModule(id: string, data: UpdateModuleRequest): Promise<Module>;
  deleteModule(id: string): Promise<void>;
}

export class ModuleService implements IModuleService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  async getModules(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<ModulesResponse> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.MODULES_GET_ALL,
        params
      );
      return ModuleMapper.handleApiResponse(response);
    } catch (e) {
      throw e;
    }
  }

  async getModuleById(id: string): Promise<Module> {
    try {
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.MODULES_GET_BY_ID}/${id}`
      );
      const moduleData = response?.data || response;
      return ModuleMapper.fromJson(moduleData);
    } catch (e) {
      throw e;
    }
  }

  async createModule(data: CreateModuleRequest): Promise<Module> {
    try {
      const json = ModuleMapper.createRequestToJson(data);
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.MODULES_CREATE,
        json
      );
      const moduleData = response?.data || response;
      const message = response?.message || "Module created successfully";
      this.notificationService.success(message);
      return ModuleMapper.fromJson(moduleData);
    } catch (e) {
      throw e;
    }
  }

  async updateModule(id: string, data: UpdateModuleRequest): Promise<Module> {
    try {
      const json = ModuleMapper.updateRequestToJson(data);
      const response = await this.apiService.put<any>(
        `${API_ENDPOINTS.MODULES_UPDATE}/${id}`,
        json
      );
      const moduleData = response?.data || response;
      const message = response?.message || "Module updated successfully";
      this.notificationService.success(message);
      return ModuleMapper.fromJson(moduleData);
    } catch (e) {
      throw e;
    }
  }

  async deleteModule(id: string): Promise<void> {
    try {
      const response = await this.apiService.delete<any>(
        `${API_ENDPOINTS.MODULES_DELETE}/${id}`
      );
      const message = response?.message || "Module deleted successfully";
      this.notificationService.success(message);
    } catch (e) {
      throw e;
    }
  }
}

