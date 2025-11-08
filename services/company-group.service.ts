/**
 * Company Group Service
 *
 * Handles Company Group CRUD operations and bulk actions with SYNFLOX backend API.
 */

import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import {
  CompanyGroup,
  CompanyGroupMapper,
  CreateCompanyGroupRequest,
  UpdateCompanyGroupRequest,
  Company,
  BulkOperationResponse,
  type CompanyGroupsResponse,
} from "@/domain";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export interface ICompanyGroupService {
  getGroups(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<CompanyGroupsResponse>;
  getGroupById(id: string): Promise<CompanyGroup>;
  createGroup(data: CreateCompanyGroupRequest): Promise<CompanyGroup>;
  updateGroup(id: string, data: UpdateCompanyGroupRequest): Promise<CompanyGroup>;
  deleteGroup(id: string): Promise<void>;
  addCompanies(groupId: string, companyIds: string[]): Promise<void>;
  removeCompanies(groupId: string, companyIds: string[]): Promise<void>;
  getGroupCompanies(groupId: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<{ data: Company[]; pagination: any }>;
  getCompanyGroups(companyId: string): Promise<CompanyGroupsResponse>;
  bulkActivateGroup(groupId: string, expiryDate?: string): Promise<BulkOperationResponse>;
  bulkSuspendGroup(groupId: string): Promise<BulkOperationResponse>;
  bulkResumeGroup(groupId: string): Promise<BulkOperationResponse>;
  bulkExtendGroup(groupId: string, expiryDate: string): Promise<BulkOperationResponse>;
}

export class CompanyGroupService implements ICompanyGroupService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  async getGroups(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<CompanyGroupsResponse> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.COMPANY_GROUPS_GET_ALL,
        params
      );
      return CompanyGroupMapper.handleApiResponse(response);
    } catch (e) {
      throw e;
    }
  }

  async getGroupById(id: string): Promise<CompanyGroup> {
    try {
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.COMPANY_GROUPS_GET_BY_ID}/${id}`
      );
      const groupData = response?.data || response;
      return CompanyGroupMapper.fromJson(groupData);
    } catch (e) {
      throw e;
    }
  }

  async createGroup(data: CreateCompanyGroupRequest): Promise<CompanyGroup> {
    try {
      const json = CompanyGroupMapper.createRequestToJson(data);
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.COMPANY_GROUPS_CREATE,
        json
      );
      const groupData = response?.data || response;
      const message = response?.message || "Company group created successfully";
      this.notificationService.success(message);
      return CompanyGroupMapper.fromJson(groupData);
    } catch (e) {
      throw e;
    }
  }

  async updateGroup(id: string, data: UpdateCompanyGroupRequest): Promise<CompanyGroup> {
    try {
      const json = CompanyGroupMapper.updateRequestToJson(data);
      const response = await this.apiService.put<any>(
        `${API_ENDPOINTS.COMPANY_GROUPS_UPDATE}/${id}`,
        json
      );
      const groupData = response?.data || response;
      const message = response?.message || "Company group updated successfully";
      this.notificationService.success(message);
      return CompanyGroupMapper.fromJson(groupData);
    } catch (e) {
      throw e;
    }
  }

  async deleteGroup(id: string): Promise<void> {
    try {
      const response = await this.apiService.delete<any>(
        `${API_ENDPOINTS.COMPANY_GROUPS_DELETE}/${id}`
      );
      const message = response?.message || "Company group deleted successfully";
      this.notificationService.success(message);
    } catch (e) {
      throw e;
    }
  }

  async addCompanies(groupId: string, companyIds: string[]): Promise<void> {
    try {
      const response = await this.apiService.post<any>(
        `${API_ENDPOINTS.COMPANY_GROUPS_ADD_COMPANIES}/${groupId}/companies`,
        { companyIds }
      );
      const message = response?.message || "Companies added to group successfully";
      this.notificationService.success(message);
    } catch (e) {
      throw e;
    }
  }

  async removeCompanies(groupId: string, companyIds: string[]): Promise<void> {
    try {
      const response = await this.apiService.post<any>(
        `${API_ENDPOINTS.COMPANY_GROUPS_REMOVE_COMPANIES}/${groupId}/companies/remove`,
        { companyIds }
      );
      const message = response?.message || "Companies removed from group successfully";
      this.notificationService.success(message);
    } catch (e) {
      throw e;
    }
  }

  async getGroupCompanies(groupId: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<{ data: Company[]; pagination: any }> {
    try {
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.COMPANY_GROUPS_GET_COMPANIES}/${groupId}/companies`,
        params
      );
      // Use CompanyMapper to handle the response
      const { CompanyMapper } = await import("@/domain");
      return CompanyMapper.handleApiResponse(response);
    } catch (e) {
      throw e;
    }
  }

  async getCompanyGroups(companyId: string): Promise<CompanyGroupsResponse> {
    try {
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.COMPANY_GROUPS_GET_BY_COMPANY}/${companyId}`
      );
      return CompanyGroupMapper.handleApiResponse(response);
    } catch (e) {
      throw e;
    }
  }

  async bulkActivateGroup(groupId: string, expiryDate?: string): Promise<BulkOperationResponse> {
    try {
      const { BulkOperationRequest, LicensingMapper } = await import("@/domain");
      const request = new BulkOperationRequest({ 
        companyIds: [], // Will be populated from group companies
        action: 1, 
        expiryDate 
      });
      const json = LicensingMapper.bulkOperationRequestToJson(request);
      const response = await this.apiService.post<any>(
        `${API_ENDPOINTS.COMPANY_GROUPS_BULK_ACTIVATE}/${groupId}/bulk-activate`,
        json
      );
      const result = LicensingMapper.bulkOperationResponseFromJson(response);
      const message = response?.message || `Bulk activation completed: ${result.successCount} succeeded, ${result.failedCount} failed`;
      this.notificationService.success(message);
      return result;
    } catch (e) {
      throw e;
    }
  }

  async bulkSuspendGroup(groupId: string): Promise<BulkOperationResponse> {
    try {
      const { BulkOperationRequest, LicensingMapper } = await import("@/domain");
      const request = new BulkOperationRequest({ 
        companyIds: [],
        action: 2 
      });
      const json = LicensingMapper.bulkOperationRequestToJson(request);
      const response = await this.apiService.post<any>(
        `${API_ENDPOINTS.COMPANY_GROUPS_BULK_SUSPEND}/${groupId}/bulk-suspend`,
        json
      );
      const result = LicensingMapper.bulkOperationResponseFromJson(response);
      const message = response?.message || `Bulk suspension completed: ${result.successCount} succeeded, ${result.failedCount} failed`;
      this.notificationService.success(message);
      return result;
    } catch (e) {
      throw e;
    }
  }

  async bulkResumeGroup(groupId: string): Promise<BulkOperationResponse> {
    try {
      const { BulkOperationRequest, LicensingMapper } = await import("@/domain");
      const request = new BulkOperationRequest({ 
        companyIds: [],
        action: 3 
      });
      const json = LicensingMapper.bulkOperationRequestToJson(request);
      const response = await this.apiService.post<any>(
        `${API_ENDPOINTS.COMPANY_GROUPS_BULK_RESUME}/${groupId}/bulk-resume`,
        json
      );
      const result = LicensingMapper.bulkOperationResponseFromJson(response);
      const message = response?.message || `Bulk resume completed: ${result.successCount} succeeded, ${result.failedCount} failed`;
      this.notificationService.success(message);
      return result;
    } catch (e) {
      throw e;
    }
  }

  async bulkExtendGroup(groupId: string, expiryDate: string): Promise<BulkOperationResponse> {
    try {
      const { BulkOperationRequest, LicensingMapper } = await import("@/domain");
      const request = new BulkOperationRequest({ 
        companyIds: [],
        action: 4, 
        expiryDate 
      });
      const json = LicensingMapper.bulkOperationRequestToJson(request);
      const response = await this.apiService.post<any>(
        `${API_ENDPOINTS.COMPANY_GROUPS_BULK_EXTEND}/${groupId}/bulk-extend`,
        json
      );
      const result = LicensingMapper.bulkOperationResponseFromJson(response);
      const message = response?.message || `Bulk extension completed: ${result.successCount} succeeded, ${result.failedCount} failed`;
      this.notificationService.success(message);
      return result;
    } catch (e) {
      throw e;
    }
  }
}

