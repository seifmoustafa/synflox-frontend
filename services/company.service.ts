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
  exportCompanies(format: 'xlsx' | 'csv'): Promise<void>;
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

  async exportCompanies(format: 'xlsx' | 'csv'): Promise<void> {
    try {
      // SYNFLOX API: POST /api/companies/export?format=excel|csv
      // Step 1: Create export file and get download URL
      // Note: Backend expects "excel" not "xlsx"
      const apiFormat = format === 'xlsx' ? 'excel' : format;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const url = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
      const token = secureTokenService.getAccessToken();
      const language = typeof window !== 'undefined' ? localStorage.getItem('language') || 'ar' : 'ar';

      const createResponse = await fetch(
        `${url}${API_ENDPOINTS.COMPANIES_EXPORT}?format=${apiFormat}`,
        {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Accept-Language': language,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!createResponse.ok) {
        let errorMessage = `Failed to create export file as ${format}`;
        try {
          const errorData = await createResponse.json();
          errorMessage = errorData.message || errorData.data?.message || errorMessage;
        } catch {
          const errorText = await createResponse.text().catch(() => '');
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Parse the response to get download URL and filename
      const result = await createResponse.json();
      const exportData = result?.data || result;
      
      if (!exportData?.downloadUrl) {
        throw new Error('Export file created but no download URL received');
      }

      const downloadUrl = exportData.downloadUrl;
      const fileName = exportData.fileName || `companies_export_${new Date().toISOString().replace(/[:.]/g, '-')}.${format}`;
      const fileSize = exportData.fileSize;

      // Ensure we're in browser environment
      if (typeof window === 'undefined') {
        throw new Error('File download is only available in browser environment');
      }

      // Step 2: Download the file (auto-deletes after download)
      // Using fetch + blob method for better UX (doesn't navigate away from page)
      const downloadResponse = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept-Language': language,
        },
      });

      if (!downloadResponse.ok) {
        let errorMessage = 'Failed to download export file';
        try {
          const errorData = await downloadResponse.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          const errorText = await downloadResponse.text().catch(() => '');
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Get the file blob from response
      const blob = await downloadResponse.blob();
      
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      // Create download link and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      a.style.display = 'none';
      document.body.appendChild(a);
      
      // Trigger download
      a.click();
      
      // Cleanup after download starts
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
      }, 1000);
      
      // Success notification with file details
      const fileSizeText = fileSize ? ` (${(fileSize / 1024).toFixed(2)} KB)` : '';
      this.notificationService.success(
        `Export file created successfully. Downloading ${fileName}${fileSizeText}...`
      );
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

