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
  
  // Individual Actions
  activateAdmin(id: string): Promise<void>;
  deactivateAdmin(id: string): Promise<void>;
  changePasswordById(id: string, currentPassword: string, newPassword: string): Promise<void>;
  resetPassword(id: string): Promise<{ message: string; temporaryPassword: string }>;
  
  // Bulk Actions
  activateSelected(adminIds: string[]): Promise<{ count: number; message: string }>;
  deactivateSelected(adminIds: string[]): Promise<{ count: number; message: string }>;
  activateAll(): Promise<{ count: number; message: string }>;
  deactivateAll(): Promise<{ count: number; message: string }>;
  deleteSelected(adminIds: string[]): Promise<{ count: number; message: string }>;
  deleteAll(confirmationText: string): Promise<{ count: number; message: string }>;
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

  // ===== Individual Actions =====

  async activateAdmin(id: string): Promise<void> {
    try {
      await this.apiService.put<any>(
        `${API_ENDPOINTS.ADMINS_ACTIVATE}/${id}/activate`
      );
      this.notificationService.success("Admin activated successfully");
    } catch (e) {
      throw e;
    }
  }

  async deactivateAdmin(id: string): Promise<void> {
    try {
      await this.apiService.put<any>(
        `${API_ENDPOINTS.ADMINS_DEACTIVATE}/${id}/deactivate`
      );
      this.notificationService.success("Admin deactivated successfully");
    } catch (e) {
      throw e;
    }
  }

  async changePasswordById(id: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      await this.apiService.put<any>(
        `${API_ENDPOINTS.ADMINS_CHANGE_PASSWORD_BY_ID}/${id}/password`,
        { currentPassword, newPassword }
      );
      this.notificationService.success("Password changed successfully");
    } catch (e) {
      throw e;
    }
  }

  async resetPassword(id: string): Promise<{ message: string; temporaryPassword: string }> {
    try {
      const response = await this.apiService.post<any>(
        `${API_ENDPOINTS.ADMINS_RESET_PASSWORD}/${id}/reset-password`
      );
      const message = response?.message || "Password reset successfully";
      const temporaryPassword = response?.temporaryPassword || "";
      this.notificationService.success(message);
      return { message, temporaryPassword };
    } catch (e) {
      throw e;
    }
  }

  // ===== Bulk Actions =====

  async activateSelected(adminIds: string[]): Promise<{ count: number; message: string }> {
    try {
      const response = await this.apiService.put<any>(
        API_ENDPOINTS.ADMINS_ACTIVATE_SELECTED,
        { adminIds }
      );
      const count = response?.count || adminIds.length;
      const message = response?.message || `Activated ${count} admin(s)`;
      this.notificationService.success(message);
      return { count, message };
    } catch (e) {
      throw e;
    }
  }

  async deactivateSelected(adminIds: string[]): Promise<{ count: number; message: string }> {
    try {
      const response = await this.apiService.put<any>(
        API_ENDPOINTS.ADMINS_DEACTIVATE_SELECTED,
        { adminIds }
      );
      const count = response?.count || adminIds.length;
      const message = response?.message || `Deactivated ${count} admin(s)`;
      this.notificationService.success(message);
      return { count, message };
    } catch (e) {
      throw e;
    }
  }

  async activateAll(): Promise<{ count: number; message: string }> {
    try {
      const response = await this.apiService.put<any>(
        API_ENDPOINTS.ADMINS_ACTIVATE_ALL
      );
      const count = response?.count || 0;
      const message = response?.message || `Activated ${count} admin(s)`;
      this.notificationService.success(message);
      return { count, message };
    } catch (e) {
      throw e;
    }
  }

  async deactivateAll(): Promise<{ count: number; message: string }> {
    try {
      const response = await this.apiService.put<any>(
        API_ENDPOINTS.ADMINS_DEACTIVATE_ALL
      );
      const count = response?.count || 0;
      const message = response?.message || `Deactivated ${count} admin(s)`;
      this.notificationService.success(message);
      return { count, message };
    } catch (e) {
      throw e;
    }
  }

  async deleteSelected(adminIds: string[]): Promise<{ count: number; message: string }> {
    try {
      const response = await this.apiService.deleteWithBody<any>(
        API_ENDPOINTS.ADMINS_DELETE_SELECTED,
        { adminIds }
      );
      const count = response?.count || adminIds.length;
      const message = response?.message || `Deleted ${count} admin(s)`;
      this.notificationService.success(message);
      return { count, message };
    } catch (e) {
      throw e;
    }
  }

  async deleteAll(confirmationText: string): Promise<{ count: number; message: string }> {
    try {
      const response = await this.apiService.deleteWithBody<any>(
        API_ENDPOINTS.ADMINS_DELETE_ALL,
        { confirmationText }
      );
      const count = response?.count || 0;
      const message = response?.message || `Deleted ${count} admin(s)`;
      this.notificationService.success(message);
      return { count, message };
    } catch (e) {
      throw e;
    }
  }
}

