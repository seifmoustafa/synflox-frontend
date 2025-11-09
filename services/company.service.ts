/**
 * Company Service
 *
 * Handles Company CRUD operations with SYNFLOX backend API.
 * Uses domain models and follows clean architecture principles.
 */

import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import type { PaginationInfo } from "@/lib/pagination";
import {
  Company,
  CompanyMapper,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  type CompaniesResponse,
} from "@/domain";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { secureTokenService } from "@/lib/secure-token-service";

export interface ICompanyService {
  getCompanies(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    subscriptionPlanId?: string;
  }): Promise<CompaniesResponse>;
  getCompanyById(id: string): Promise<Company>;
  createCompany(data: CreateCompanyRequest): Promise<Company>;
  updateCompany(id: string, data: UpdateCompanyRequest): Promise<Company>;
  deleteCompany(id: string): Promise<void>;
  exportCompanies(format: 'xlsx' | 'csv'): Promise<Blob>;
  importCompanies(file: File, format: 'xlsx' | 'csv'): Promise<{ totalRows: number; imported: number; errors: Array<{ row: number; field: string; message: string }>; errorCount: number }>;
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
    subscriptionPlanId?: string;
  }): Promise<CompaniesResponse> {
    try {
      // SYNFLOX API: GET /api/companies?page=1&pageSize=10&search=...
      // Backend returns: { statusCode, message, data: { companies, pagination } }
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.COMPANIES_GET_ALL,
        params
      );
      return CompanyMapper.handleApiResponse(response);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async getCompanyById(id: string): Promise<Company> {
    try {
      // SYNFLOX API: GET /api/companies/{id}
      // Backend returns: { statusCode, message, data: CompanyDto }
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.COMPANIES_GET_BY_ID}/${id}`
      );
      const companyData = response?.data || response;
      return CompanyMapper.fromJson(companyData);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async createCompany(data: CreateCompanyRequest): Promise<Company> {
    try {
      const json = CompanyMapper.createRequestToJson(data);
      // SYNFLOX API: POST /api/companies
      // Backend returns: { statusCode, message, data: CompanyDto }
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.COMPANIES_CREATE,
        json
      );
      const companyData = response?.data || response;
      const message = response?.message || "Company created successfully";
      this.notificationService.success(message);
      return CompanyMapper.fromJson(companyData);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async updateCompany(id: string, data: UpdateCompanyRequest): Promise<Company> {
    try {
      const json = CompanyMapper.updateRequestToJson(data);
      // SYNFLOX API: PUT /api/companies/{id}
      // Backend returns: { statusCode, message, data: CompanyDto }
      const response = await this.apiService.put<any>(
        `${API_ENDPOINTS.COMPANIES_UPDATE}/${id}`,
        json
      );
      const companyData = response?.data || response;
      const message = response?.message || "Company updated successfully";
      this.notificationService.success(message);
      return CompanyMapper.fromJson(companyData);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async deleteCompany(id: string): Promise<void> {
    try {
      // SYNFLOX API: DELETE /api/companies/{id}
      // Backend returns: { statusCode, message }
      const response = await this.apiService.delete<any>(
        `${API_ENDPOINTS.COMPANIES_DELETE}/${id}`
      );
      const message = response?.message || "Company deleted successfully";
      this.notificationService.success(message);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async toggleActive(id: string, isActive: boolean): Promise<Company> {
    try {
      const updateRequest = new UpdateCompanyRequest({ id, isActive });
      return await this.updateCompany(id, updateRequest);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async exportCompanies(format: 'xlsx' | 'csv'): Promise<Blob> {
    try {
      // SYNFLOX API: GET /api/companies/export?format=xlsx|csv
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const url = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
      const token = secureTokenService.getAccessToken();
      const language = typeof window !== 'undefined' ? localStorage.getItem('language') || 'ar' : 'ar';

      const response = await fetch(
        `${url}${API_ENDPOINTS.COMPANIES_EXPORT}?format=${format}`,
        {
          method: 'GET',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Accept-Language': language,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to export companies as ${format}`);
      }

      // Get the file from response body
      const blob = await response.blob();
      
      // Extract filename from Content-Disposition header if available
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `companies_export.${format}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      // Download the file
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      
      this.notificationService.success(`Companies exported successfully as ${format.toUpperCase()}`);
      return blob;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : `Failed to export companies as ${format}`;
      this.notificationService.error(errorMessage);
      throw e;
    }
  }

  async importCompanies(file: File, format: 'xlsx' | 'csv'): Promise<{ totalRows: number; imported: number; errors: Array<{ row: number; field: string; message: string }>; errorCount: number }> {
    try {
      // SYNFLOX API: POST /api/companies/import?format=xlsx|csv (multipart/form-data)
      const formData = new FormData();
      formData.append('file', file);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const url = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
      const token = secureTokenService.getAccessToken();
      const language = typeof window !== 'undefined' ? localStorage.getItem('language') || 'ar' : 'ar';

      const response = await fetch(
        `${url}${API_ENDPOINTS.COMPANIES_IMPORT}?format=${format}`,
        {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Accept-Language': language,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to import companies');
      }

      const result = await response.json();
      const data = result.data || result;
      
      const message = result.message || `Import completed: ${data.imported || 0} imported, ${data.errorCount || 0} errors`;
      if (data.errorCount > 0) {
        this.notificationService.warning(message);
      } else {
        this.notificationService.success(message);
      }

      return {
        totalRows: data.totalRows || 0,
        imported: data.imported || 0,
        errors: data.errors || [],
        errorCount: data.errorCount || 0,
      };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to import companies';
      this.notificationService.error(errorMessage);
      throw e;
    }
  }
}

