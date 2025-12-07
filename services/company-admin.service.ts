'use client';

import { API_ENDPOINTS } from '@/config/api-endpoints';
import type { IApiService } from './api.service';
import type { INotificationService } from './notification.service';
import {
  CompanyAdmin,
  CompanyAdminDetails,
  CompanyAdminSession,
  CreateCompanyAdminRequest,
  UpdateCompanyAdminRequest,
  ResetAdminPasswordRequest
} from '@/domain/models/company-admin.model';
import { CompanyAdminMapper, CompanyAdminsResponse, CompanyAdminSessionsResponse } from '@/domain/mappers/company-admin.mapper';
import type { CompanyAdminData, CompanyAdminDetailsData, CompanyAdminSessionData } from '@/domain/models/company-admin.model';

// ============================================================================
// Service Interface
// ============================================================================

export interface ICompanyAdminService {
  // CRUD Operations
  getAll(page?: number, pageSize?: number, search?: string, isActive?: boolean): Promise<{
    items: CompanyAdmin[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } | null>;
  
  getById(id: string): Promise<CompanyAdminDetails | null>;
  getByCompanyId(companyId: string): Promise<CompanyAdminDetails | null>;
  create(request: CreateCompanyAdminRequest): Promise<CompanyAdmin | null>;
  update(id: string, request: UpdateCompanyAdminRequest): Promise<CompanyAdmin | null>;
  delete(id: string): Promise<boolean>;
  
  // Admin Actions
  resetPassword(id: string, request: ResetAdminPasswordRequest): Promise<boolean>;
  unlockAccount(id: string): Promise<boolean>;
  terminateSessions(id: string, reason?: string): Promise<number | null>;
  
  // Session Management
  getSessions(id: string, limit?: number): Promise<CompanyAdminSession[]>;
  getActiveSessions(id: string): Promise<CompanyAdminSession[]>;
  
  // Validation
  checkUsername(username: string, excludeId?: string): Promise<boolean>;
  
  // Get company admin by company ID (returns admin data or null)
  getCompanyAdmin(companyId: string): Promise<CompanyAdminDetails | null>;
}

// ============================================================================
// Service Implementation
// ============================================================================

export class CompanyAdminService implements ICompanyAdminService {
  constructor(
    private readonly apiService: IApiService,
    private readonly notificationService: INotificationService
  ) {}

  async getAll(
    page: number = 1,
    pageSize: number = 20,
    search?: string,
    isActive?: boolean
  ): Promise<{
    items: CompanyAdmin[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } | null> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());
      if (search) params.append('search', search);
      if (isActive !== undefined) params.append('isActive', isActive.toString());

      const response = await this.apiService.get<{ data: CompanyAdminsResponse }>(
        `${API_ENDPOINTS.COMPANY_ADMINS.BASE}?${params.toString()}`
      );
      return CompanyAdminMapper.handleListResponse(response);
    } catch (error) {
      this.notificationService.error('Failed to load company admins');
      console.error('Error fetching company admins:', error);
      return null;
    }
  }

  async getById(id: string): Promise<CompanyAdminDetails | null> {
    try {
      // apiService.get returns unwrapped data directly
      const adminData = await this.apiService.get<CompanyAdminDetailsData | null>(
        API_ENDPOINTS.COMPANY_ADMINS.BY_ID(id)
      );
      
      if (!adminData || !adminData.id) return null;
      return CompanyAdminMapper.detailsFromJson(adminData);
    } catch (error) {
      this.notificationService.error('Failed to load company admin');
      console.error('Error fetching company admin:', error);
      return null;
    }
  }

  async getByCompanyId(companyId: string): Promise<CompanyAdminDetails | null> {
    try {
      // apiService.get returns unwrapped data directly
      const adminData = await this.apiService.get<CompanyAdminDetailsData | null>(
        API_ENDPOINTS.COMPANY_ADMINS.BY_COMPANY(companyId)
      );
      
      if (!adminData || !adminData.id) return null;
      return CompanyAdminMapper.detailsFromJson(adminData);
    } catch (error) {
      // Don't show error for not found - might be expected
      console.error('[CompanyAdminService] Error fetching company admin by company:', error);
      return null;
    }
  }

  async create(request: CreateCompanyAdminRequest): Promise<CompanyAdmin | null> {
    try {
      if (!request.isValid) {
        this.notificationService.error('Invalid request data');
        return null;
      }

      // apiService.post returns unwrapped data directly
      const adminData = await this.apiService.post<CompanyAdminData>(
        API_ENDPOINTS.COMPANY_ADMINS.BASE,
        CompanyAdminMapper.createRequestToJson(request)
      );
      
      if (!adminData) return null;
      this.notificationService.success('Company admin created successfully');
      return CompanyAdminMapper.fromJson(adminData);
    } catch (error) {
      this.notificationService.error('Failed to create company admin');
      console.error('Error creating company admin:', error);
      return null;
    }
  }

  async update(id: string, request: UpdateCompanyAdminRequest): Promise<CompanyAdmin | null> {
    try {
      if (!request.isValid) {
        this.notificationService.error('Invalid request data');
        return null;
      }

      // apiService.put returns unwrapped data directly
      const adminData = await this.apiService.put<CompanyAdminData>(
        API_ENDPOINTS.COMPANY_ADMINS.BY_ID(id),
        CompanyAdminMapper.updateRequestToJson(request)
      );
      
      if (!adminData) return null;
      this.notificationService.success('Company admin updated successfully');
      return CompanyAdminMapper.fromJson(adminData);
    } catch (error) {
      this.notificationService.error('Failed to update company admin');
      console.error('Error updating company admin:', error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.apiService.delete(API_ENDPOINTS.COMPANY_ADMINS.BY_ID(id));
      this.notificationService.success('Company admin deleted successfully');
      return true;
    } catch (error) {
      this.notificationService.error('Failed to delete company admin');
      console.error('Error deleting company admin:', error);
      return false;
    }
  }

  async resetPassword(id: string, request: ResetAdminPasswordRequest): Promise<boolean> {
    try {
      if (!request.isValid) {
        this.notificationService.error('Password must be at least 8 characters');
        return false;
      }

      await this.apiService.post(
        API_ENDPOINTS.COMPANY_ADMINS.RESET_PASSWORD(id),
        CompanyAdminMapper.resetPasswordRequestToJson(request)
      );
      this.notificationService.success('Password reset successfully');
      return true;
    } catch (error) {
      this.notificationService.error('Failed to reset password');
      console.error('Error resetting password:', error);
      return false;
    }
  }

  async unlockAccount(id: string): Promise<boolean> {
    try {
      await this.apiService.post(API_ENDPOINTS.COMPANY_ADMINS.UNLOCK(id), {});
      this.notificationService.success('Account unlocked successfully');
      return true;
    } catch (error) {
      this.notificationService.error('Failed to unlock account');
      console.error('Error unlocking account:', error);
      return false;
    }
  }

  async terminateSessions(id: string, reason?: string): Promise<number | null> {
    try {
      const url = reason
        ? `${API_ENDPOINTS.COMPANY_ADMINS.TERMINATE_SESSIONS(id)}?reason=${encodeURIComponent(reason)}`
        : API_ENDPOINTS.COMPANY_ADMINS.TERMINATE_SESSIONS(id);
      
      const response = await this.apiService.post<{ data: { data: number } }>(url, {});
      const count = response.data?.data ?? 0;
      this.notificationService.success(`Terminated ${count} session(s)`);
      return count;
    } catch (error) {
      this.notificationService.error('Failed to terminate sessions');
      console.error('Error terminating sessions:', error);
      return null;
    }
  }

  async getSessions(id: string, limit: number = 50): Promise<CompanyAdminSession[]> {
    try {
      const response = await this.apiService.get<{ data: CompanyAdminSessionsResponse }>(
        `${API_ENDPOINTS.COMPANY_ADMINS.SESSIONS(id)}?limit=${limit}`
      );
      return CompanyAdminMapper.handleSessionsResponse(response);
    } catch (error) {
      this.notificationService.error('Failed to load session history');
      console.error('Error fetching sessions:', error);
      return [];
    }
  }

  async getActiveSessions(id: string): Promise<CompanyAdminSession[]> {
    try {
      const response = await this.apiService.get<{ data: CompanyAdminSessionsResponse }>(API_ENDPOINTS.COMPANY_ADMINS.ACTIVE_SESSIONS(id));
      return CompanyAdminMapper.handleSessionsResponse(response);
    } catch (error) {
      this.notificationService.error('Failed to load active sessions');
      console.error('Error fetching active sessions:', error);
      return [];
    }
  }

  async checkUsername(username: string, excludeId?: string): Promise<boolean> {
    try {
      const params = new URLSearchParams({ username });
      if (excludeId) params.append('excludeAdminId', excludeId);
      
      const response = await this.apiService.get<{ data: { data: boolean } }>(
        `${API_ENDPOINTS.COMPANY_ADMINS.CHECK_USERNAME}?${params.toString()}`
      );
      return response.data?.data ?? false;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  }

  async getCompanyAdmin(companyId: string): Promise<CompanyAdminDetails | null> {
    try {
      // apiService.get returns unwrapped data directly (not response.data)
      const adminData = await this.apiService.get<CompanyAdminDetailsData | null>(
        API_ENDPOINTS.COMPANY_ADMINS.COMPANY_HAS_ADMIN(companyId)
      );
      
      console.log('[getCompanyAdmin] Received:', adminData);
      
      if (!adminData || !adminData.id) {
        console.log('[getCompanyAdmin] No admin found');
        return null;
      }
      
      const result = CompanyAdminMapper.detailsFromJson(adminData);
      console.log('[getCompanyAdmin] Mapped result:', result);
      return result;
    } catch (error) {
      console.error('Error getting company admin:', error);
      return null;
    }
  }
}
