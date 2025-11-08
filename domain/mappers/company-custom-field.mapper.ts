/**
 * Company Custom Field Mappers
 * 
 * Handles conversion between company custom field domain models and external data formats.
 */

import {
  CompanyCustomField,
  CustomFieldType,
  CreateCompanyCustomFieldRequest,
  UpdateCompanyCustomFieldRequest,
  type CompanyCustomFieldData,
  type CreateCompanyCustomFieldRequestData,
  type UpdateCompanyCustomFieldRequestData,
} from '../models/company-custom-field.model';
import type { PaginationInfo } from '@/lib/pagination';

export interface CompanyCustomFieldsResponse {
  data: CompanyCustomField[];
  pagination: PaginationInfo;
}

export class CompanyCustomFieldMapper {
  /**
   * Convert JSON/API response to CompanyCustomField domain model
   */
  static fromJson(json: any): CompanyCustomField {
    return new CompanyCustomField({
      id: json.id || '',
      companyId: json.companyId || '',
      fieldName: json.fieldName || '',
      fieldType: json.fieldType || CustomFieldType.String,
      fieldValue: json.fieldValue,
      createdAt: json.createdAt || json.createdTimestamp || new Date().toISOString(),
      updatedAt: json.updatedAt || json.updatedTimestamp,
    });
  }

  /**
   * Convert CompanyCustomField domain model to JSON for API requests
   */
  static toJson(field: CompanyCustomField): any {
    return {
      id: field.id,
      companyId: field.companyId,
      fieldName: field.fieldName,
      fieldType: field.fieldType,
      fieldValue: field.fieldValue,
      createdAt: field.createdAt,
      updatedAt: field.updatedAt,
    };
  }

  /**
   * Convert CreateCompanyCustomFieldRequest domain model to JSON for API requests
   */
  static createRequestToJson(request: CreateCompanyCustomFieldRequest): any {
    return {
      companyId: request.companyId,
      fieldName: request.fieldName,
      fieldType: request.fieldType,
      fieldValue: request.fieldValue,
    };
  }

  /**
   * Convert UpdateCompanyCustomFieldRequest domain model to JSON for API requests
   */
  static updateRequestToJson(request: UpdateCompanyCustomFieldRequest): any {
    const json: any = {
      companyId: request.companyId,
    };
    if (request.fieldName !== undefined) json.fieldName = request.fieldName;
    if (request.fieldType !== undefined) json.fieldType = request.fieldType;
    if (request.fieldValue !== undefined) json.fieldValue = request.fieldValue;
    return json;
  }

  /**
   * Handle different API response formats and convert to CompanyCustomFieldsResponse
   */
  static handleApiResponse(response: any): CompanyCustomFieldsResponse {
    // Handle format: { data: [...], pagination: {...} } (direct array with pagination)
    if (response && typeof response === 'object' && 'data' in response && 'pagination' in response) {
      if (Array.isArray(response.data)) {
        const pagination = response.pagination || {};
        return {
          data: response.data.map((item: any) => this.fromJson(item)),
          pagination: {
            itemsCount: pagination.itemsCount || 0,
            pageSize: pagination.pageSize || 10,
            page: pagination.currentPage || pagination.page || 1,
            pagesCount: pagination.pagesCount || 0,
          }
        };
      }
    }

    // Handle SYNFLOX backend response format
    if (response && typeof response === 'object' && 'data' in response) {
      const data = response.data;
      if (data && typeof data === 'object') {
        if (Array.isArray(data)) {
          const pagination = response.pagination || {};
          return {
            data: data.map((item: any) => this.fromJson(item)),
            pagination: {
              itemsCount: pagination.itemsCount || pagination.totalItems || data.length,
              pageSize: pagination.pageSize || 10,
              page: pagination.currentPage || pagination.page || 1,
              pagesCount: pagination.pagesCount || pagination.totalPages || 1,
            }
          };
        }
        if ('customFields' in data || 'fields' in data) {
          const fields = data.customFields || data.fields || [];
          const pagination = data.pagination || {};
          return {
            data: Array.isArray(fields) 
              ? fields.map((item: any) => this.fromJson(item))
              : [],
            pagination: {
              itemsCount: pagination.itemsCount || pagination.totalItems || 0,
              pageSize: pagination.pageSize || 10,
              page: pagination.currentPage || pagination.page || 1,
              pagesCount: pagination.pagesCount || pagination.totalPages || 0,
            }
          };
        }
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

