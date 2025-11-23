/**
 * Company Mapper
 * Handles conversion between API JSON and Company domain models
 */

import {
  Company,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  type CompaniesResponse,
} from "../models/company.model";

export class CompanyMapper {
  /**
   * Convert JSON to Company domain model
   */
  static fromJson(json: any): Company {
    return new Company({
      id: json.id || "",
      name: json.name || "",
      isActive: json.isActive ?? true,
      contactEmail: json.contactEmail || null,
      contactPhone: json.contactPhone || null,
      address: json.address || null,
      createdTimestamp: json.createdTimestamp || new Date().toISOString(),
      updatedTimestamp: json.updatedTimestamp || null,
    });
  }

  /**
   * Convert Company domain model to JSON
   */
  static toJson(company: Company): any {
    return {
      id: company.id,
      name: company.name,
      isActive: company.isActive,
      contactEmail: company.contactEmail,
      contactPhone: company.contactPhone,
      address: company.address,
      createdTimestamp: company.createdTimestamp.toISOString(),
      updatedTimestamp: company.updatedTimestamp?.toISOString() || null,
    };
  }

  /**
   * Convert CreateCompanyRequest to JSON
   */
  static createRequestToJson(request: CreateCompanyRequest): any {
    return {
      name: request.name,
      contactEmail: request.contactEmail || null,
      contactPhone: request.contactPhone || null,
      address: request.address || null,
    };
  }

  /**
   * Convert UpdateCompanyRequest to JSON
   */
  static updateRequestToJson(request: UpdateCompanyRequest): any {
    const json: any = {};
    if (request.name !== undefined) json.name = request.name;
    if (request.contactEmail !== undefined) json.contactEmail = request.contactEmail;
    if (request.contactPhone !== undefined) json.contactPhone = request.contactPhone;
    if (request.address !== undefined) json.address = request.address;
    return json;
  }

  /**
   * Handle API response and convert to CompaniesResponse
   */
  static handleApiResponse(response: any): CompaniesResponse {
    // Handle nested response structure
    const responseData = response?.data || response;
    
    // Extract companies array
    const companiesData = responseData?.companies || responseData?.data || [];
    const companies = Array.isArray(companiesData)
      ? companiesData.map((item: any) => this.fromJson(item))
      : [];

    // Extract pagination
    const pagination = responseData?.pagination || {
      itemsCount: companies.length,
      pageSize: companies.length,
      page: 1,
      pagesCount: 1,
    };

    return {
      data: companies,
      pagination: {
        itemsCount: pagination.itemsCount || pagination.totalCount || companies.length,
        pageSize: pagination.pageSize || companies.length,
        page: pagination.page || pagination.currentPage || 1,
        pagesCount: pagination.pagesCount || pagination.totalPages || 1,
      },
    };
  }
}
