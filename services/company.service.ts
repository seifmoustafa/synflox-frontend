/**
 * Company Service
 *
 * Handles Company CRUD operations and bulk actions with SYNFLOX backend API.
 */

import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import {
  Company,
  CompanyMapper,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  type CompaniesResponse,
} from "@/domain";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export interface ICompanyService {
  getCompanies(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<CompaniesResponse>;
  getCompanyById(id: string): Promise<Company>;
  createCompany(data: CreateCompanyRequest): Promise<Company>;
  updateCompany(id: string, data: UpdateCompanyRequest): Promise<Company>;
  deleteCompany(id: string): Promise<void>;
  
  // Individual Actions
  activateCompany(id: string): Promise<void>;
  deactivateCompany(id: string): Promise<void>;
  
  // Bulk Actions
  bulkActivate(companyIds: string[]): Promise<{ count: number; message: string }>;
  bulkDeactivate(companyIds: string[]): Promise<{ count: number; message: string }>;
  bulkDelete(companyIds: string[]): Promise<{ count: number; message: string }>;
}

export class CompanyService implements ICompanyService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  async getCompanies(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<CompaniesResponse> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.COMPANIES_GET_ALL,
        params
      );
      return CompanyMapper.handleApiResponse(response);
    } catch (e) {
      throw e;
    }
  }

  async getCompanyById(id: string): Promise<Company> {
    try {
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.COMPANIES_GET_BY_ID}/${id}`
      );
      const companyData = response?.data || response;
      return CompanyMapper.fromJson(companyData);
    } catch (e) {
      throw e;
    }
  }

  async createCompany(data: CreateCompanyRequest): Promise<Company> {
    try {
      const json = CompanyMapper.createRequestToJson(data);
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.COMPANIES_CREATE,
        json
      );
      const companyData = response?.data || response;
      const message = response?.message || "Company created successfully";
      this.notificationService.success(message);
      return CompanyMapper.fromJson(companyData);
    } catch (e) {
      throw e;
    }
  }

  async updateCompany(id: string, data: UpdateCompanyRequest): Promise<Company> {
    try {
      const json = CompanyMapper.updateRequestToJson(data);
      const response = await this.apiService.put<any>(
        `${API_ENDPOINTS.COMPANIES_UPDATE}/${id}`,
        json
      );
      const companyData = response?.data || response;
      const message = response?.message || "Company updated successfully";
      this.notificationService.success(message);
      return CompanyMapper.fromJson(companyData);
    } catch (e) {
      throw e;
    }
  }

  async deleteCompany(id: string): Promise<void> {
    try {
      const response = await this.apiService.delete<any>(
        `${API_ENDPOINTS.COMPANIES_DELETE}/${id}`
      );
      const message = response?.message || "Company deleted successfully";
      this.notificationService.success(message);
    } catch (e) {
      throw e;
    }
  }

  async activateCompany(id: string): Promise<void> {
    try {
      const response = await this.apiService.post<any>(
        `${API_ENDPOINTS.COMPANIES_ACTIVATE}/${id}`,
        {} // Empty body required
      );
      const message = response?.message || "Company activated successfully";
      this.notificationService.success(message);
    } catch (e) {
      throw e;
    }
  }

  async deactivateCompany(id: string): Promise<void> {
    try {
      const response = await this.apiService.post<any>(
        `${API_ENDPOINTS.COMPANIES_DEACTIVATE}/${id}`,
        {} // Empty body required
      );
      const message = response?.message || "Company deactivated successfully";
      this.notificationService.success(message);
    } catch (e) {
      throw e;
    }
  }

  async bulkActivate(companyIds: string[]): Promise<{ count: number; message: string }> {
    try {
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.COMPANIES_BULK_ACTIVATE,
        { companyIds }
      );
      const result = response?.data || response;
      const count = result?.successCount || companyIds.length;
      const message = result?.summary || `Activated ${count} company(ies)`;
      this.notificationService.success(message);
      return { count, message };
    } catch (e) {
      throw e;
    }
  }

  async bulkDeactivate(companyIds: string[]): Promise<{ count: number; message: string }> {
    try {
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.COMPANIES_BULK_DEACTIVATE,
        { companyIds }
      );
      const result = response?.data || response;
      const count = result?.successCount || companyIds.length;
      const message = result?.summary || `Deactivated ${count} company(ies)`;
      this.notificationService.success(message);
      return { count, message };
    } catch (e) {
      throw e;
    }
  }

  async bulkDelete(companyIds: string[]): Promise<{ count: number; message: string }> {
    try {
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.COMPANIES_BULK_DELETE,
        { companyIds }
      );
      const result = response?.data || response;
      const count = result?.successCount || companyIds.length;
      const message = result?.summary || `Deleted ${count} company(ies)`;
      this.notificationService.success(message);
      return { count, message };
    } catch (e) {
      throw e;
    }
  }
}
