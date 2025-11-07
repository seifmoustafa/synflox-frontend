/**
 * Admin Service
 *
 * Handles Admin CRUD operations with SYNFLOX backend API.
 */

import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import type { PaginationInfo } from "@/lib/pagination";
import {
  Admin,
  AdminMapper,
  CreateAdminRequest,
  UpdateAdminRequest,
  type AdminsResponse,
} from "@/domain";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export interface IAdminService {
  getAdmins(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<AdminsResponse>;
  getAdminById(id: string): Promise<Admin>;
  createAdmin(data: CreateAdminRequest): Promise<Admin>;
  updateAdmin(id: string, data: UpdateAdminRequest): Promise<Admin>;
  deleteAdmin(id: string): Promise<void>;
}

export class AdminService implements IAdminService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  async getAdmins(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<AdminsResponse> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.ADMINS_GET_ALL,
        params
      );
      return AdminMapper.handleApiResponse(response);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async getAdminById(id: string): Promise<Admin> {
    try {
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.ADMINS_GET_BY_ID}/${id}`
      );
      const adminData = response?.data || response;
      return AdminMapper.fromJson(adminData);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async createAdmin(data: CreateAdminRequest): Promise<Admin> {
    try {
      const json = AdminMapper.createRequestToJson(data);
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.ADMINS_CREATE,
        json
      );
      const adminData = response?.data || response;
      const message = response?.message || "Admin created successfully";
      this.notificationService.success(message);
      return AdminMapper.fromJson(adminData);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async updateAdmin(id: string, data: UpdateAdminRequest): Promise<Admin> {
    try {
      const json = AdminMapper.updateRequestToJson(data);
      const response = await this.apiService.put<any>(
        `${API_ENDPOINTS.ADMINS_UPDATE}/${id}`,
        json
      );
      const adminData = response?.data || response;
      const message = response?.message || "Admin updated successfully";
      this.notificationService.success(message);
      return AdminMapper.fromJson(adminData);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async deleteAdmin(id: string): Promise<void> {
    try {
      const response = await this.apiService.delete<any>(
        `${API_ENDPOINTS.ADMINS_DELETE}/${id}`
      );
      const message = response?.message || "Admin deleted successfully";
      this.notificationService.success(message);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async toggleActive(id: string, isActive: boolean): Promise<Admin> {
    try {
      const updateRequest = new UpdateAdminRequest({ id, isActive });
      return await this.updateAdmin(id, updateRequest);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }
}

