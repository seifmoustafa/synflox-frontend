// ============================================================================
// License Service - API Communication Layer
// ============================================================================

import { API_ENDPOINTS } from '@/config/api-endpoints';
import { IApiService } from './api.service';
import { INotificationService } from './notification.service';
import {
  License,
  CompanyLicenseSummary,
  GenerateLicenseResponse,
  ValidateLicenseResponse,
  GenerateLicenseRequest,
  ValidateLicenseRequest,
  MachineFingerprint,
} from '@/domain/models/license.model';
import {
  LicenseMapper,
  LicenseApiResponse,
  CompanyLicenseSummaryApiResponse,
  GenerateLicenseApiResponse,
  ValidateLicenseApiResponse,
  BooleanApiResponse,
} from '@/domain/mappers/license.mapper';
import { appLogger } from '@/lib/logger';

// ============================================================================
// Interface
// ============================================================================

export interface ILicenseService {
  // License Info
  getLicenseBySubscription(subscriptionId: string): Promise<License | null>;
  getLicensesByCompany(companyId: string): Promise<CompanyLicenseSummary | null>;
  hasValidLicenseKey(subscriptionId: string): Promise<boolean>;

  // License Generation
  generateLicense(subscriptionId: string, request?: GenerateLicenseRequest): Promise<GenerateLicenseResponse | null>;
  regenerateLicense(subscriptionId: string, request?: GenerateLicenseRequest): Promise<GenerateLicenseResponse | null>;

  // License Validation
  validateLicense(request: ValidateLicenseRequest): Promise<ValidateLicenseResponse | null>;
  checkLicense(licenseKey: string): Promise<boolean>;

  // License Management
  revokeLicense(subscriptionId: string, reason?: string): Promise<boolean>;
  downloadLicense(subscriptionId: string): Promise<Blob | null>;

  // Machine Management
  addMachine(subscriptionId: string, fingerprint: MachineFingerprint): Promise<GenerateLicenseResponse | null>;
  computeFingerprint(fingerprint: MachineFingerprint): Promise<string | null>;
}

// ============================================================================
// Implementation
// ============================================================================

export class LicenseService implements ILicenseService {
  constructor(
    private readonly api: IApiService,
    private readonly notifications: INotificationService
  ) {}

  // --------------------------------------------------------------------------
  // License Info
  // --------------------------------------------------------------------------

  async getLicenseBySubscription(subscriptionId: string): Promise<License | null> {
    try {
      const response = await this.api.get<LicenseApiResponse>(
        API_ENDPOINTS.OFFLINE_LICENSE.GET_BY_SUBSCRIPTION(subscriptionId)
      );
      appLogger.debug('[LicenseService] GetLicense response:', response);
      appLogger.debug('[LicenseService] Response statusCode:', response?.statusCode);
      appLogger.debug('[LicenseService] Response data:', response?.data);
      const result = LicenseMapper.handleLicenseResponse(response);
      appLogger.debug('[LicenseService] Mapped result:', result);
      return result;
    } catch (error) {
      console.error('Error fetching license:', error);
      return null;
    }
  }

  async getLicensesByCompany(companyId: string): Promise<CompanyLicenseSummary | null> {
    try {
      const response = await this.api.get<CompanyLicenseSummaryApiResponse>(
        API_ENDPOINTS.OFFLINE_LICENSE.GET_BY_COMPANY(companyId)
      );
      return LicenseMapper.handleCompanyLicenseSummaryResponse(response);
    } catch (error) {
      console.error('Error fetching company licenses:', error);
      return null;
    }
  }

  async hasValidLicenseKey(subscriptionId: string): Promise<boolean> {
    try {
      const response = await this.api.get<BooleanApiResponse>(
        API_ENDPOINTS.OFFLINE_LICENSE.HAS_KEY(subscriptionId)
      );
      return LicenseMapper.handleBooleanResponse(response);
    } catch (error) {
      console.error('Error checking license key:', error);
      return false;
    }
  }

  // --------------------------------------------------------------------------
  // License Generation
  // --------------------------------------------------------------------------

  async generateLicense(
    subscriptionId: string,
    request?: GenerateLicenseRequest
  ): Promise<GenerateLicenseResponse | null> {
    try {
      const body = request ? LicenseMapper.generateRequestToJson(request) : {};
      const response = await this.api.post<GenerateLicenseApiResponse>(
        API_ENDPOINTS.OFFLINE_LICENSE.GENERATE(subscriptionId),
        body
      );

      appLogger.debug('[LicenseService] Generate response:', response);

      // Check if response has expected structure
      if (!response || typeof response !== 'object') {
        this.notifications.error('Invalid response from server');
        return null;
      }

      const result = LicenseMapper.handleGenerateLicenseResponse(response);
      if (result) {
        this.notifications.success(result.message || 'License generated successfully');
      } else {
        // If mapping failed but status was success, show generic error
        const errorMsg = response.message || response.errors?.[0] || 'Failed to process license response';
        this.notifications.error(errorMsg);
      }
      return result;
    } catch (error: any) {
      console.error('[LicenseService] Generate error:', error);
      this.notifications.error(error.message || 'Failed to generate license');
      return null;
    }
  }

  async regenerateLicense(
    subscriptionId: string,
    request?: GenerateLicenseRequest
  ): Promise<GenerateLicenseResponse | null> {
    try {
      const body = request ? LicenseMapper.generateRequestToJson(request) : {};
      const response = await this.api.post<GenerateLicenseApiResponse>(
        API_ENDPOINTS.OFFLINE_LICENSE.REGENERATE(subscriptionId),
        body
      );

      const result = LicenseMapper.handleGenerateLicenseResponse(response);
      if (result) {
        this.notifications.success(result.message || 'License regenerated successfully');
      } else if (response.message) {
        this.notifications.error(response.message);
      }
      return result;
    } catch (error: any) {
      this.notifications.error(error.message || 'Failed to regenerate license');
      return null;
    }
  }

  // --------------------------------------------------------------------------
  // License Validation
  // --------------------------------------------------------------------------

  async validateLicense(request: ValidateLicenseRequest): Promise<ValidateLicenseResponse | null> {
    try {
      const body = LicenseMapper.validateRequestToJson(request);
      const response = await this.api.post<ValidateLicenseApiResponse>(
        API_ENDPOINTS.OFFLINE_LICENSE.VALIDATE,
        body
      );
      return LicenseMapper.handleValidateLicenseResponse(response);
    } catch (error) {
      console.error('Error validating license:', error);
      return null;
    }
  }

  async checkLicense(licenseKey: string): Promise<boolean> {
    try {
      const response = await this.api.post<BooleanApiResponse>(
        API_ENDPOINTS.OFFLINE_LICENSE.CHECK,
        { licenseKey }
      );
      return LicenseMapper.handleBooleanResponse(response);
    } catch (error) {
      console.error('Error checking license:', error);
      return false;
    }
  }

  // --------------------------------------------------------------------------
  // License Management
  // --------------------------------------------------------------------------

  async revokeLicense(subscriptionId: string, reason?: string): Promise<boolean> {
    try {
      const url = reason
        ? `${API_ENDPOINTS.OFFLINE_LICENSE.REVOKE(subscriptionId)}?reason=${encodeURIComponent(reason)}`
        : API_ENDPOINTS.OFFLINE_LICENSE.REVOKE(subscriptionId);

      const response = await this.api.delete<BooleanApiResponse>(url);
      const success = LicenseMapper.handleBooleanResponse(response);

      if (success) {
        this.notifications.success('License revoked successfully');
      } else if (response.message) {
        this.notifications.error(response.message);
      }
      return success;
    } catch (error: any) {
      this.notifications.error(error.message || 'Failed to revoke license');
      return false;
    }
  }

  async downloadLicense(subscriptionId: string): Promise<Blob | null> {
    try {
      const response = await this.api.get<Blob>(
        API_ENDPOINTS.OFFLINE_LICENSE.DOWNLOAD(subscriptionId),
        { responseType: 'blob' as any }
      );
      return response;
    } catch (error: any) {
      this.notifications.error(error.message || 'Failed to download license');
      return null;
    }
  }

  // --------------------------------------------------------------------------
  // Machine Management
  // --------------------------------------------------------------------------

  async addMachine(
    subscriptionId: string,
    fingerprint: MachineFingerprint
  ): Promise<GenerateLicenseResponse | null> {
    try {
      const response = await this.api.post<GenerateLicenseApiResponse>(
        API_ENDPOINTS.OFFLINE_LICENSE.ADD_MACHINE(subscriptionId),
        fingerprint
      );

      const result = LicenseMapper.handleGenerateLicenseResponse(response);
      if (result) {
        this.notifications.success('Machine added successfully');
      } else if (response.message) {
        this.notifications.error(response.message);
      }
      return result;
    } catch (error: any) {
      this.notifications.error(error.message || 'Failed to add machine');
      return null;
    }
  }

  async computeFingerprint(fingerprint: MachineFingerprint): Promise<string | null> {
    try {
      const response = await this.api.post<{ data: string; isSuccess: boolean }>(
        API_ENDPOINTS.OFFLINE_LICENSE.COMPUTE_FINGERPRINT,
        fingerprint
      );
      return response.isSuccess ? response.data : null;
    } catch (error) {
      console.error('Error computing fingerprint:', error);
      return null;
    }
  }
}
