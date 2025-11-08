/**
 * Licensing Mappers
 * 
 * Handles conversion between licensing domain models and external data formats.
 */

import {
  ActivateCompanyRequest,
  ExtendCompanyRequest,
  CompanyStatusResponse,
  GenerateLicenseKeyResponse,
  ValidateLicenseKeyRequest,
  LicenseKeyValidationResponse,
  LicenseStatus,
  BulkOperationRequest,
  BulkOperationResponse,
  StartTrialRequest,
  ConvertTrialRequest,
  type ActivateCompanyRequestData,
  type ExtendCompanyRequestData,
  type CompanyStatusResponseData,
  type GenerateLicenseKeyResponseData,
  type ValidateLicenseKeyRequestData,
  type LicenseKeyValidationResponseData,
  type BulkOperationRequestData,
  type BulkOperationResponseData,
  type StartTrialRequestData,
  type ConvertTrialRequestData,
} from '../models/licensing.model';
import { Company } from '../models/company.model';
import { CompanyMapper } from './company.mapper';

export class LicensingMapper {
  /**
   * Convert ActivateCompanyRequest to JSON for API
   */
  static activateRequestToJson(request: ActivateCompanyRequest): any {
    return {
      expiryDate: request.expiryDate,
    };
  }

  /**
   * Convert ExtendCompanyRequest to JSON for API
   */
  static extendRequestToJson(request: ExtendCompanyRequest): any {
    return {
      newExpiryDate: request.newExpiryDate,
    };
  }

  /**
   * Convert API response to CompanyStatusResponse
   * Backend format: { statusCode, message, data: { status, expiryDate, isActive, statusMessage } }
   */
  static statusResponseFromJson(json: any): CompanyStatusResponse {
    const data = json?.data || json;
    return new CompanyStatusResponse({
      status: data.status || LicenseStatus.Expired,
      expiryDate: data.expiryDate,
      isActive: data.isActive ?? false,
      statusMessage: json?.message || data.statusMessage || "",
    });
  }

  /**
   * Convert API response to GenerateLicenseKeyResponse
   * Backend format: { statusCode, message, data: { licenseKey, message } }
   */
  static generateKeyResponseFromJson(json: any): GenerateLicenseKeyResponse {
    const data = json?.data || json;
    return new GenerateLicenseKeyResponse({
      licenseKey: data.licenseKey || "",
      message: json?.message || data.message || "License key generated successfully",
    });
  }

  /**
   * Convert ValidateLicenseKeyRequest to JSON for API
   */
  static validateKeyRequestToJson(request: ValidateLicenseKeyRequest): any {
    return {
      licenseKey: request.licenseKey,
    };
  }

  /**
   * Convert API response to LicenseKeyValidationResponse
   * Backend format: { statusCode, message, data: { isValid, status, expiryDate, isActive, message, clockTampered, companyId } }
   */
  static validateKeyResponseFromJson(json: any): LicenseKeyValidationResponse {
    const data = json?.data || json;
    return new LicenseKeyValidationResponse({
      isValid: data.isValid ?? false,
      status: data.status,
      expiryDate: data.expiryDate,
      isActive: data.isActive,
      message: json?.message || data.message || "",
      clockTampered: data.clockTampered,
      companyId: data.companyId,
    });
  }

  /**
   * Convert API response to Company (for activate/suspend/resume/extend operations)
   * Backend format: { statusCode, message, data: CompanyDto }
   */
  static companyFromResponse(json: any): Company {
    const companyData = json?.data || json;
    return CompanyMapper.fromJson(companyData);
  }

  /**
   * Convert BulkOperationRequest to JSON for API
   */
  static bulkOperationRequestToJson(request: BulkOperationRequest): any {
    const json: any = {
      companyIds: request.companyIds,
      action: request.action,
    };
    if (request.expiryDate) {
      json.expiryDate = request.expiryDate;
    }
    return json;
  }

  /**
   * Convert API response to BulkOperationResponse
   * Backend format: { statusCode, message, data: { totalCount, successCount, failedCount, results } }
   */
  static bulkOperationResponseFromJson(json: any): BulkOperationResponse {
    const data = json?.data || json;
    return new BulkOperationResponse({
      totalCount: data.totalCount || data.totalRequested || 0,
      successCount: data.successCount || data.successful || 0,
      failedCount: data.failedCount || data.failed || 0,
      results: data.results || [],
    });
  }

  /**
   * Convert StartTrialRequest to JSON for API
   */
  static startTrialRequestToJson(request: StartTrialRequest): any {
    return {
      trialDays: request.trialDays,
    };
  }

  /**
   * Convert ConvertTrialRequest to JSON for API
   */
  static convertTrialRequestToJson(request: ConvertTrialRequest): any {
    return {
      expiryDate: request.expiryDate,
    };
  }
}

