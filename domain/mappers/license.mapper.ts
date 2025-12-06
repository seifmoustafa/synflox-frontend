// ============================================================================
// License Mapper - API <-> Domain Conversion
// ============================================================================

import {
  License,
  LicenseData,
  CompanyLicenseSummary,
  CompanyLicenseSummaryData,
  GenerateLicenseResponse,
  GenerateLicenseResponseData,
  ValidateLicenseResponse,
  ValidateLicenseResponseData,
  GenerateLicenseRequest,
  ValidateLicenseRequest,
  ActivationSummary,
  ActivationSummaryData,
} from '../models/license.model';

// ============================================================================
// API Response Interfaces (matches backend ApiResponse<T>)
// ============================================================================

export interface LicenseApiResponse {
  data: LicenseData;
  statusCode: number;
  message: string;
  errors?: string[];
}

export interface CompanyLicenseSummaryApiResponse {
  data: CompanyLicenseSummaryData;
  statusCode: number;
  message: string;
  errors?: string[];
}

export interface GenerateLicenseApiResponse {
  data: GenerateLicenseResponseData;
  statusCode: number;
  message: string;
  errors?: string[];
}

export interface ValidateLicenseApiResponse {
  data: ValidateLicenseResponseData;
  statusCode: number;
  message: string;
  errors?: string[];
}

export interface BooleanApiResponse {
  data: boolean;
  statusCode: number;
  message: string;
  errors?: string[];
}

export interface ActivationSummaryApiResponse {
  data: ActivationSummaryData;
  statusCode: number;
  message: string;
  errors?: string[];
}

// Helper to check if response is successful (handles both wrapped and unwrapped)
function isSuccessResponse(response: any): boolean {
  // If response has statusCode, check it
  if (response && typeof response.statusCode === 'number') {
    return response.statusCode >= 200 && response.statusCode < 300;
  }
  // If no statusCode, assume response is already unwrapped data (success)
  return true;
}

// Helper to get data from response (handles both wrapped and unwrapped)
function getData<T>(response: any): T | null {
  if (!response) return null;
  // If response has 'data' property, it's wrapped
  if ('data' in response && response.data !== undefined) {
    return response.data;
  }
  // Otherwise, response IS the data (already unwrapped by ApiService)
  return response;
}

// ============================================================================
// License Mapper
// ============================================================================

export class LicenseMapper {
  // License
  static fromJson(data: LicenseData): License {
    return new License(data);
  }

  static handleLicenseResponse(response: any): License | null {
    if (isSuccessResponse(response)) {
      const data = getData<LicenseData>(response);
      if (data && data.licenseId) {
        return LicenseMapper.fromJson(data);
      }
    }
    return null;
  }

  // Company License Summary
  static companyLicenseSummaryFromJson(data: CompanyLicenseSummaryData): CompanyLicenseSummary {
    return new CompanyLicenseSummary(data);
  }

  static handleCompanyLicenseSummaryResponse(response: any): CompanyLicenseSummary | null {
    if (isSuccessResponse(response)) {
      const data = getData<CompanyLicenseSummaryData>(response);
      if (data && data.companyId) {
        return LicenseMapper.companyLicenseSummaryFromJson(data);
      }
    }
    return null;
  }

  // Generate License Response
  static generateLicenseResponseFromJson(data: GenerateLicenseResponseData): GenerateLicenseResponse {
    return new GenerateLicenseResponse(data);
  }

  static handleGenerateLicenseResponse(response: any): GenerateLicenseResponse | null {
    if (isSuccessResponse(response)) {
      const data = getData<GenerateLicenseResponseData>(response);
      if (data && data.licenseKey) {
        return LicenseMapper.generateLicenseResponseFromJson(data);
      }
    }
    return null;
  }

  // Validate License Response
  static validateLicenseResponseFromJson(data: ValidateLicenseResponseData): ValidateLicenseResponse {
    return new ValidateLicenseResponse(data);
  }

  static handleValidateLicenseResponse(response: any): ValidateLicenseResponse | null {
    if (isSuccessResponse(response)) {
      const data = getData<ValidateLicenseResponseData>(response);
      if (data && 'isValid' in data) {
        return LicenseMapper.validateLicenseResponseFromJson(data);
      }
    }
    return null;
  }

  // Boolean Response
  static handleBooleanResponse(response: any): boolean {
    if (typeof response === 'boolean') return response;
    if (response && typeof response.data === 'boolean') return response.data;
    return false;
  }

  // Request to JSON
  static generateRequestToJson(request: GenerateLicenseRequest): Record<string, unknown> {
    return request.toJson();
  }

  static validateRequestToJson(request: ValidateLicenseRequest): Record<string, unknown> {
    return request.toJson();
  }

  // Activation Summary
  static activationSummaryFromJson(data: ActivationSummaryData): ActivationSummary {
    return new ActivationSummary(data);
  }

  static handleActivationSummaryResponse(response: any): ActivationSummary | null {
    if (isSuccessResponse(response)) {
      const data = getData<ActivationSummaryData>(response);
      if (data && 'activations' in data) {
        return LicenseMapper.activationSummaryFromJson(data);
      }
    }
    return null;
  }
}
