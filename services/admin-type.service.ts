/**
 * Admin Type Service
 *
 * Handles Admin Type CRUD operations with SYNFLOX backend API.
 */

import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import type { PaginationInfo } from "@/lib/pagination";
import {
  AdminType,
  AdminTypeMapper,
  CreateAdminTypeRequest,
  UpdateAdminTypeRequest,
  type AdminTypesResponse,
} from "@/domain";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export interface IAdminTypeService {
  getAdminTypes(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<AdminTypesResponse>;
  getAdminTypeById(id: string): Promise<AdminType>;
  createAdminType(data: CreateAdminTypeRequest): Promise<AdminType>;
  updateAdminType(id: string, data: UpdateAdminTypeRequest): Promise<AdminType>;
  deleteAdminType(id: string): Promise<void>;
}

export class AdminTypeService implements IAdminTypeService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  async getAdminTypes(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<AdminTypesResponse> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.ADMIN_TYPES_GET_ALL,
        params
      );
      return AdminTypeMapper.handleApiResponse(response);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async getAdminTypeById(id: string): Promise<AdminType> {
    try {
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.ADMIN_TYPES_GET_BY_ID}/${id}`
      );
      const adminTypeData = response?.data || response;
      return AdminTypeMapper.fromJson(adminTypeData);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async createAdminType(data: CreateAdminTypeRequest): Promise<AdminType> {
    try {
      const json = AdminTypeMapper.createRequestToJson(data);
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.ADMIN_TYPES_CREATE,
        json
      );
      const adminTypeData = response?.data || response;
      const message = response?.message || "Admin type created successfully";
      this.notificationService.success(message);
      return AdminTypeMapper.fromJson(adminTypeData);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async updateAdminType(id: string, data: UpdateAdminTypeRequest): Promise<AdminType> {
    try {
      const json = AdminTypeMapper.updateRequestToJson(data);
      const response = await this.apiService.put<any>(
        `${API_ENDPOINTS.ADMIN_TYPES_UPDATE}/${id}`,
        json
      );
      const adminTypeData = response?.data || response;
      const message = response?.message || "Admin type updated successfully";
      this.notificationService.success(message);
      return AdminTypeMapper.fromJson(adminTypeData);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async deleteAdminType(id: string): Promise<void> {
    try {
      const response = await this.apiService.delete<any>(
        `${API_ENDPOINTS.ADMIN_TYPES_DELETE}/${id}`
      );
      const message = response?.message || "Admin type deleted successfully";
      this.notificationService.success(message);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  // async toggleActive(id: string, isActive: boolean): Promise<AdminType> {
  //   try {
  //     const updateRequest = new UpdateAdminTypeRequest({ id, isActive });
  //     return await this.updateAdminType(id, updateRequest);
  //   } catch (e) {
  //     // Error message already shown by API service with backend message
  //     throw e;
  //   }
  // }
}

