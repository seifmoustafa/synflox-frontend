/**
 * Company Mappers
 * 
 * Handles conversion between company domain models and external data formats.
 * Follows Single Responsibility Principle by separating serialization concerns
 * from domain logic.
 */

import { 
  Company, 
  CreateCompanyRequest, 
  UpdateCompanyRequest,
  type CompanyData,
  type CreateCompanyRequestData,
  type UpdateCompanyRequestData
} from '../models/company.model';
import type { PaginationInfo } from '@/lib/pagination';

export interface CompaniesResponse {
  data: Company[];
  pagination: PaginationInfo;
}

export class CompanyMapper {
  /**
   * Convert JSON/API response to Company domain model
   */
  static fromJson(json: any): Company {
    return new Company({
      id: json.id || '',
      name: json.name || '',
      isActive: json.isActive ?? false,
      expiryDate: json.expiryDate,
      contactEmail: json.contactEmail,
      contactPhone: json.contactPhone,
      address: json.address,
      licenseKey: json.licenseKey,
      createdTimestamp: json.createdTimestamp || new Date().toISOString(),
      updatedTimestamp: json.updatedTimestamp,
    });
  }

  /**
   * Convert Company domain model to JSON for API requests
   */
  static toJson(company: Company): any {
    return {
      id: company.id,
      name: company.name,
      isActive: company.isActive,
      expiryDate: company.expiryDate,
      contactEmail: company.contactEmail,
      contactPhone: company.contactPhone,
      address: company.address,
      licenseKey: company.licenseKey,
      createdTimestamp: company.createdTimestamp,
      updatedTimestamp: company.updatedTimestamp,
    };
  }

  /**
   * Convert CreateCompanyRequest domain model to JSON for API requests
   */
  static createRequestToJson(request: CreateCompanyRequest): any {
    return {
      name: request.name,
      expiryDate: request.expiryDate,
      contactEmail: request.contactEmail,
      contactPhone: request.contactPhone,
      address: request.address,
    };
  }

  /**
   * Convert UpdateCompanyRequest domain model to JSON for API requests
   */
  static updateRequestToJson(request: UpdateCompanyRequest): any {
    const json: any = {};
    if (request.name !== undefined) json.name = request.name;
    if (request.expiryDate !== undefined) json.expiryDate = request.expiryDate;
    if (request.isActive !== undefined) json.isActive = request.isActive;
    if (request.contactEmail !== undefined) json.contactEmail = request.contactEmail;
    if (request.contactPhone !== undefined) json.contactPhone = request.contactPhone;
    if (request.address !== undefined) json.address = request.address;
    return json;
  }

  /**
   * Handle different API response formats and convert to CompaniesResponse
   * Backend format options:
   * 1. { statusCode, message, data: { companies, pagination } }
   * 2. { data: [...], pagination: {...} } (after ApiService unwrap)
   */
  static handleApiResponse(response: any): CompaniesResponse {
    // Handle format: { data: [...], pagination: {...} } (direct array with pagination)
    if (response && typeof response === 'object' && 'data' in response && 'pagination' in response) {
      if (Array.isArray(response.data)) {
        const pagination = response.pagination || {};
        return {
          data: response.data.map((item: any) => this.fromJson(item)),
          pagination: {
            itemsCount: pagination.itemsCount || 0,
            pageSize: pagination.pageSize || 10,
            page: pagination.currentPage || pagination.page || 1, // Map currentPage to page
            pagesCount: pagination.pagesCount || 0,
          }
        };
      }
    }

    // Handle SYNFLOX backend response format: { statusCode, message, data: { companies, pagination } }
    if (response && typeof response === 'object' && 'data' in response) {
      const data = response.data;
      if (data && typeof data === 'object' && 'companies' in data) {
        const pagination = data.pagination || {};
        return {
          data: Array.isArray(data.companies) 
            ? data.companies.map((item: any) => this.fromJson(item))
            : [],
          pagination: {
            itemsCount: pagination.itemsCount || 0,
            pageSize: pagination.pageSize || 10,
            page: pagination.currentPage || pagination.page || 1, // Map currentPage to page
            pagesCount: pagination.pagesCount || 0,
          }
        };
      }
    }

    // Handle direct array response
    if (Array.isArray(response)) {
      return {
        data: response.map((item: any) => this.fromJson(item)),
        pagination: {
          itemsCount: response.length,
          pageSize: response.length,
          page: 1,
          pagesCount: 1,
        }
      };
    }

    // Fallback for unexpected response format
    return {
      data: [],
      pagination: {
        itemsCount: 0,
        pageSize: 10,
        page: 1,
        pagesCount: 0,
      }
    };
  }
}

