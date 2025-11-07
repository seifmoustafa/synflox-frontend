/**
 * Licensing Service
 *
 * Handles licensing operations with SYNFLOX backend API.
 * Includes activation, suspension, extension, and license key management.
 */

import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import {
  Company,
  ActivateCompanyRequest,
  ExtendCompanyRequest,
  CompanyStatusResponse,
  GenerateLicenseKeyResponse,
  ValidateLicenseKeyRequest,
  LicenseKeyValidationResponse,
  LicensingMapper,
} from "@/domain";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export interface ILicensingService {
  activateCompany(id: string, request: ActivateCompanyRequest): Promise<Company>;
  suspendCompany(id: string): Promise<Company>;
  resumeCompany(id: string): Promise<Company>;
  extendCompany(id: string, request: ExtendCompanyRequest): Promise<Company>;
  getCompanyStatus(id: string): Promise<CompanyStatusResponse>;
  generateLicenseKey(id: string): Promise<GenerateLicenseKeyResponse>;
  regenerateLicenseKey(id: string): Promise<GenerateLicenseKeyResponse>;
  validateLicenseKey(request: ValidateLicenseKeyRequest): Promise<LicenseKeyValidationResponse>;
}

export class LicensingService implements ILicensingService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  async activateCompany(id: string, request: ActivateCompanyRequest): Promise<Company> {
    try {
      // SYNFLOX API: PUT /api/licensing/{id}/activate
      // Backend returns: { statusCode, message, data: CompanyDto }
      const json = LicensingMapper.activateRequestToJson(request);
      const response = await this.apiService.put<any>(
        `${API_ENDPOINTS.LICENSING_ACTIVATE}/${id}/activate`,
        json
      );
      const message = response?.message || "Company activated successfully";
      this.notificationService.success(message);
      return LicensingMapper.companyFromResponse(response);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async suspendCompany(id: string): Promise<Company> {
    try {
      // SYNFLOX API: PUT /api/licensing/{id}/suspend
      // Backend returns: { statusCode, message, data: CompanyDto }
      const response = await this.apiService.put<any>(
        `${API_ENDPOINTS.LICENSING_SUSPEND}/${id}/suspend`,
        {}
      );
      const message = response?.message || "Company suspended successfully";
      this.notificationService.success(message);
      return LicensingMapper.companyFromResponse(response);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async resumeCompany(id: string): Promise<Company> {
    try {
      // SYNFLOX API: PUT /api/licensing/{id}/resume
      // Backend returns: { statusCode, message, data: CompanyDto }
      const response = await this.apiService.put<any>(
        `${API_ENDPOINTS.LICENSING_RESUME}/${id}/resume`,
        {}
      );
      const message = response?.message || "Company resumed successfully";
      this.notificationService.success(message);
      return LicensingMapper.companyFromResponse(response);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async extendCompany(id: string, request: ExtendCompanyRequest): Promise<Company> {
    try {
      // SYNFLOX API: PUT /api/licensing/{id}/extend
      // Backend returns: { statusCode, message, data: CompanyDto }
      const json = LicensingMapper.extendRequestToJson(request);
      const response = await this.apiService.put<any>(
        `${API_ENDPOINTS.LICENSING_EXTEND}/${id}/extend`,
        json
      );
      const message = response?.message || "Subscription extended successfully";
      this.notificationService.success(message);
      return LicensingMapper.companyFromResponse(response);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async getCompanyStatus(id: string): Promise<CompanyStatusResponse> {
    try {
      // SYNFLOX API: GET /api/licensing/{id}/status (public, no auth)
      // Backend returns: { statusCode, message, data: { status, expiryDate, isActive, statusMessage } }
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.LICENSING_STATUS}/${id}/status`
      );
      return LicensingMapper.statusResponseFromJson(response);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async generateLicenseKey(id: string): Promise<GenerateLicenseKeyResponse> {
    try {
      // SYNFLOX API: POST /api/licensing/{id}/license-key/generate
      // Backend returns: { statusCode, message, data: { licenseKey, message } }
      const response = await this.apiService.post<any>(
        `${API_ENDPOINTS.LICENSING_GENERATE_KEY}/${id}/license-key/generate`,
        {}
      );
      const message = response?.message || "License key generated successfully";
      this.notificationService.success(message);
      return LicensingMapper.generateKeyResponseFromJson(response);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async regenerateLicenseKey(id: string): Promise<GenerateLicenseKeyResponse> {
    try {
      // SYNFLOX API: POST /api/licensing/{id}/license-key/regenerate
      // Backend returns: { statusCode, message, data: { licenseKey, message } }
      const response = await this.apiService.post<any>(
        `${API_ENDPOINTS.LICENSING_REGENERATE_KEY}/${id}/license-key/regenerate`,
        {}
      );
      const message = response?.message || "License key regenerated successfully";
      this.notificationService.success(message);
      return LicensingMapper.generateKeyResponseFromJson(response);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }

  async validateLicenseKey(request: ValidateLicenseKeyRequest): Promise<LicenseKeyValidationResponse> {
    try {
      // SYNFLOX API: POST /api/licensing/validate-key (public, no auth)
      // Backend returns: { statusCode, message, data: { isValid, status, expiryDate, isActive, message, clockTampered, companyId } }
      const json = LicensingMapper.validateKeyRequestToJson(request);
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.LICENSING_VALIDATE_KEY,
        json
      );
      return LicensingMapper.validateKeyResponseFromJson(response);
    } catch (e) {
      // Error message already shown by API service with backend message
      throw e;
    }
  }
}

