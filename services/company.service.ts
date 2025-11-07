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
}

