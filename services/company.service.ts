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
  createCompany(data: CreateCompanyRequest, lang?: string): Promise<Company>;
  updateCompany(id: string, data: UpdateCompanyRequest, lang?: string): Promise<Company>;
  deleteCompany(id: string, lang?: string): Promise<void>;
  
  // Individual Actions
  activateCompany(id: string, reason?: string, lang?: string): Promise<void>;
  deactivateCompany(id: string, reason?: string, notes?: string, lang?: string): Promise<void>;
  
  // Bulk Actions
  bulkActivate(companyIds: string[], reason?: string, sendEmailNotifications?: boolean, lang?: string): Promise<{ count: number; message: string }>;
  bulkDeactivate(companyIds: string[], reason?: string, notes?: string, sendEmailNotifications?: boolean, lang?: string): Promise<{ count: number; message: string }>;
  bulkDelete(companyIds: string[], reason?: string, sendEmailNotifications?: boolean, lang?: string): Promise<{ count: number; message: string }>;
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

  async createCompany(data: CreateCompanyRequest, lang?: string): Promise<Company> {
    try {
      const json = CompanyMapper.createRequestToJson(data);
      const url = lang 
        ? `${API_ENDPOINTS.COMPANIES_CREATE}?lang=${lang}` 
        : API_ENDPOINTS.COMPANIES_CREATE;
      const response = await this.apiService.post<any>(url, json);
      const companyData = response?.data || response;
      // Note: Success notification handled by generic CRUD viewmodel
      return CompanyMapper.fromJson(companyData);
    } catch (e) {
      throw e;
    }
  }

  async updateCompany(id: string, data: UpdateCompanyRequest, lang?: string): Promise<Company> {
    try {
      const json = CompanyMapper.updateRequestToJson(data);
      const baseUrl = `${API_ENDPOINTS.COMPANIES_UPDATE}/${id}`;
      const url = lang ? `${baseUrl}?lang=${lang}` : baseUrl;
      const response = await this.apiService.put<any>(url, json);
      const companyData = response?.data || response;
      // Note: Success notification handled by generic CRUD viewmodel
      return CompanyMapper.fromJson(companyData);
    } catch (e) {
      throw e;
    }
  }

  async deleteCompany(id: string, lang?: string): Promise<void> {
    try {
      const baseUrl = `${API_ENDPOINTS.COMPANIES_DELETE}/${id}`;
      const url = lang ? `${baseUrl}?lang=${lang}` : baseUrl;
      await this.apiService.delete<any>(url);
      // Note: Success notification handled by generic CRUD viewmodel
    } catch (e) {
      throw e;
    }
  }

  async activateCompany(id: string, reason?: string, lang?: string): Promise<void> {
    try {
      const baseUrl = `${API_ENDPOINTS.COMPANIES_ACTIVATE}/${id}`;
      const url = lang ? `${baseUrl}?lang=${lang}` : baseUrl;
      const response = await this.apiService.post<any>(url, {
        companyId: id,
        reason: reason || "Company activated by administrator",
        sendEmailNotification: true
      });
      const message = response?.message || "Company activated successfully";
      this.notificationService.success(message);
    } catch (e) {
      throw e;
    }
  }

  async deactivateCompany(id: string, reason?: string, notes?: string, lang?: string): Promise<void> {
    try {
      const baseUrl = `${API_ENDPOINTS.COMPANIES_DEACTIVATE}/${id}`;
      const url = lang ? `${baseUrl}?lang=${lang}` : baseUrl;
      const response = await this.apiService.post<any>(url, {
        companyId: id,
        reason: reason || "Company deactivated by administrator",
        notes,
        sendEmailNotification: true
      });
      const message = response?.message || "Company deactivated successfully";
      this.notificationService.success(message);
    } catch (e) {
      throw e;
    }
  }

  async bulkActivate(companyIds: string[], reason?: string, sendEmailNotifications: boolean = true, lang?: string): Promise<{ count: number; message: string }> {
    try {
      const url = lang 
        ? `${API_ENDPOINTS.COMPANIES_BULK_ACTIVATE}?lang=${lang}` 
        : API_ENDPOINTS.COMPANIES_BULK_ACTIVATE;
      const response = await this.apiService.post<any>(
        url,
        { 
          companyIds, 
          reason: reason || "Bulk activation by administrator",
          sendEmailNotifications 
        }
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

  async bulkDeactivate(companyIds: string[], reason?: string, notes?: string, sendEmailNotifications: boolean = true, lang?: string): Promise<{ count: number; message: string }> {
    try {
      const url = lang 
        ? `${API_ENDPOINTS.COMPANIES_BULK_DEACTIVATE}?lang=${lang}` 
        : API_ENDPOINTS.COMPANIES_BULK_DEACTIVATE;
      const response = await this.apiService.post<any>(
        url,
        { 
          companyIds, 
          reason: reason || "Bulk deactivation by administrator",
          notes,
          sendEmailNotifications 
        }
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

  async bulkDelete(companyIds: string[], reason?: string, sendEmailNotifications: boolean = true, lang?: string): Promise<{ count: number; message: string }> {
    try {
      const url = lang 
        ? `${API_ENDPOINTS.COMPANIES_BULK_DELETE}?lang=${lang}` 
        : API_ENDPOINTS.COMPANIES_BULK_DELETE;
      const response = await this.apiService.post<any>(
        url,
        { 
          companyIds, 
          reason: reason || "Bulk deletion by administrator",
          sendEmailNotifications 
        }
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
