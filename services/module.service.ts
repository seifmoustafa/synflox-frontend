import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import {
  Module,
  CreateModuleRequest,
  UpdateModuleRequest,
} from "@/domain/models/module.model";
import { ModuleMapper, ModulesResponse } from "@/domain/mappers/module.mapper";
import { API_ENDPOINTS } from "@/config/api-endpoints";

/**
 * Module Service Interface
 */
export interface IModuleService {
  getAllModules(
    page?: number,
    pageSize?: number,
    search?: string
  ): Promise<{ modules: Module[]; pagination?: any }>;
  getModuleById(id: string): Promise<Module>;
  createModule(request: CreateModuleRequest): Promise<Module>;
  updateModule(request: UpdateModuleRequest): Promise<Module>;
  deleteModule(id: string): Promise<void>;
}

/**
 * Module Service Implementation
 * Handles all module-related API operations
 */
export class ModuleService implements IModuleService {
  constructor(
    private readonly apiService: IApiService,
    private readonly notificationService: INotificationService
  ) {}

  /**
   * Get all modules with pagination
   */
  async getAllModules(
    page: number = 1,
    pageSize: number = 20,
    search?: string
  ): Promise<{ modules: Module[]; pagination?: any }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (search) {
        params.append("search", search);
      }

      const response = await this.apiService.get<ModulesResponse>(
        `${API_ENDPOINTS.MODULES.BASE}?${params.toString()}`
      );

      return ModuleMapper.handleApiResponse(response);
    } catch (error: any) {
      this.notificationService.error(
        error.message || "Failed to fetch modules"
      );
      throw error;
    }
  }

  /**
   * Get module by ID
   */
  async getModuleById(id: string): Promise<Module> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.MODULES.BY_ID(id)
      );

      return ModuleMapper.handleSingleResponse(response);
    } catch (error: any) {
      this.notificationService.error(
        error.message || "Failed to fetch module"
      );
      throw error;
    }
  }

  /**
   * Create a new module
   */
  async createModule(data: CreateModuleRequest | any): Promise<Module> {
    try {
      // If data is plain object, create request instance
      const request = data instanceof CreateModuleRequest 
        ? data 
        : new CreateModuleRequest(
            data.name,
            data.description || null,
            data.features || []
          );

      if (!request.isValid) {
        throw new Error("Module name must be between 2 and 200 characters");
      }

      const response = await this.apiService.post<any>(
        API_ENDPOINTS.MODULES.BASE,
        ModuleMapper.createRequestToJson(request)
      );

      const module = ModuleMapper.handleSingleResponse(response);
      // Note: Success notification handled by generic CRUD viewmodel
      return module;
    } catch (error: any) {
      // Note: Error notification handled by generic CRUD viewmodel
      throw error;
    }
  }

  /**
   * Update an existing module
   */
  async updateModule(data: UpdateModuleRequest | any): Promise<Module> {
    try {
      // If data is plain object, create request instance
      const request = data instanceof UpdateModuleRequest 
        ? data 
        : new UpdateModuleRequest(
            data.id,
            data.name,
            data.description,
            data.features
          );

      if (!request.isValid) {
        throw new Error("Module name must be between 2 and 200 characters");
      }

      const payload = ModuleMapper.updateRequestToJson(request);

      const response = await this.apiService.put<any>(
        API_ENDPOINTS.MODULES.BY_ID(request.id),
        payload
      );

      const module = ModuleMapper.handleSingleResponse(response);
      // Note: Success notification handled by generic CRUD viewmodel
      return module;
    } catch (error: any) {
      // Note: Error notification handled by generic CRUD viewmodel
      throw error;
    }
  }

  /**
   * Delete a module
   */
  async deleteModule(id: string): Promise<void> {
    try {
      await this.apiService.delete(API_ENDPOINTS.MODULES.BY_ID(id));
      // Note: Success notification handled by generic CRUD viewmodel
    } catch (error: any) {
      // Note: Error notification handled by generic CRUD viewmodel
      throw error;
    }
  }

  /**
   * Activate a module
   */
  async activateModule(id: string): Promise<void> {
    try {
      await this.apiService.put(`${API_ENDPOINTS.MODULES.BY_ID(id)}/activate`, {});
      this.notificationService.success("Module activated successfully");
    } catch (error: any) {
      this.notificationService.error(
        error.message || "Failed to activate module"
      );
      throw error;
    }
  }

  /**
   * Deactivate a module
   */
  async deactivateModule(id: string): Promise<void> {
    try {
      await this.apiService.put(`${API_ENDPOINTS.MODULES.BY_ID(id)}/deactivate`, {});
      this.notificationService.success("Module deactivated successfully");
    } catch (error: any) {
      this.notificationService.error(
        error.message || "Failed to deactivate module"
      );
      throw error;
    }
  }
}
