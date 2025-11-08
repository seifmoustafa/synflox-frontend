/**
 * Company Custom Field Service
 *
 * Handles Company Custom Field operations with SYNFLOX backend API.
 */

import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import {
  CompanyCustomField,
  CompanyCustomFieldMapper,
  CreateCompanyCustomFieldRequest,
  UpdateCompanyCustomFieldRequest,
  type CompanyCustomFieldsResponse,
} from "@/domain";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export interface ICompanyCustomFieldService {
  getCustomFields(companyId: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<CompanyCustomFieldsResponse>;
  getCustomFieldById(companyId: string, fieldId: string): Promise<CompanyCustomField>;
  createCustomField(companyId: string, data: CreateCompanyCustomFieldRequest): Promise<CompanyCustomField>;
  updateCustomField(companyId: string, fieldId: string, data: UpdateCompanyCustomFieldRequest): Promise<CompanyCustomField>;
  deleteCustomField(companyId: string, fieldId: string): Promise<void>;
}

export class CompanyCustomFieldService implements ICompanyCustomFieldService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  async getCustomFields(companyId: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<CompanyCustomFieldsResponse> {
    try {
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.COMPANY_CUSTOM_FIELDS_GET_ALL}/${companyId}/custom-fields`,
        params
      );
      return CompanyCustomFieldMapper.handleApiResponse(response);
    } catch (e) {
      throw e;
    }
  }

  async getCustomFieldById(companyId: string, fieldId: string): Promise<CompanyCustomField> {
    try {
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.COMPANY_CUSTOM_FIELDS_GET_BY_ID}/${companyId}/custom-fields/${fieldId}`
      );
      const fieldData = response?.data || response;
      return CompanyCustomFieldMapper.fromJson(fieldData);
    } catch (e) {
      throw e;
    }
  }

  async createCustomField(companyId: string, data: CreateCompanyCustomFieldRequest): Promise<CompanyCustomField> {
    try {
      const json = CompanyCustomFieldMapper.createRequestToJson(data);
      const response = await this.apiService.post<any>(
        `${API_ENDPOINTS.COMPANY_CUSTOM_FIELDS_CREATE}/${companyId}/custom-fields`,
        json
      );
      const fieldData = response?.data || response;
      const message = response?.message || "Custom field created successfully";
      this.notificationService.success(message);
      return CompanyCustomFieldMapper.fromJson(fieldData);
    } catch (e) {
      throw e;
    }
  }

  async updateCustomField(companyId: string, fieldId: string, data: UpdateCompanyCustomFieldRequest): Promise<CompanyCustomField> {
    try {
      const json = CompanyCustomFieldMapper.updateRequestToJson(data);
      const response = await this.apiService.put<any>(
        `${API_ENDPOINTS.COMPANY_CUSTOM_FIELDS_UPDATE}/${companyId}/custom-fields/${fieldId}`,
        json
      );
      const fieldData = response?.data || response;
      const message = response?.message || "Custom field updated successfully";
      this.notificationService.success(message);
      return CompanyCustomFieldMapper.fromJson(fieldData);
    } catch (e) {
      throw e;
    }
  }

  async deleteCustomField(companyId: string, fieldId: string): Promise<void> {
    try {
      const response = await this.apiService.delete<any>(
        `${API_ENDPOINTS.COMPANY_CUSTOM_FIELDS_DELETE}/${companyId}/custom-fields/${fieldId}`
      );
      const message = response?.message || "Custom field deleted successfully";
      this.notificationService.success(message);
    } catch (e) {
      throw e;
    }
  }
}

