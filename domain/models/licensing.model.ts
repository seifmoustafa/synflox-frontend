/**
 * Licensing Domain Models
 * 
 * Contains all licensing-related domain models including
 * activation, suspension, extension, and license key operations.
 */

export interface ActivateCompanyRequestData {
  expiryDate: string; // ISO date string
}

export class ActivateCompanyRequest {
  public readonly expiryDate: string;

  constructor(data: ActivateCompanyRequestData) {
    this.expiryDate = data.expiryDate;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    const date = new Date(this.expiryDate);
    return date > new Date();
  }
}

export interface ExtendCompanyRequestData {
  newExpiryDate: string; // ISO date string
}

export class ExtendCompanyRequest {
  public readonly newExpiryDate: string;

  constructor(data: ExtendCompanyRequestData) {
    this.newExpiryDate = data.newExpiryDate;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    const date = new Date(this.newExpiryDate);
    return date > new Date();
  }
}

export enum LicenseStatus {
  Active = 1,
  Expired = 2,
  Suspended = 3
}

export interface CompanyStatusResponseData {
  status: LicenseStatus;
  expiryDate?: string;
  isActive: boolean;
  statusMessage: string;
}

export class CompanyStatusResponse {
  public readonly status: LicenseStatus;
  public readonly expiryDate?: string;
  public readonly isActive: boolean;
  public readonly statusMessage: string;

  constructor(data: CompanyStatusResponseData) {
    this.status = data.status;
    this.expiryDate = data.expiryDate;
    this.isActive = data.isActive;
    this.statusMessage = data.statusMessage;
  }
}

export interface GenerateLicenseKeyResponseData {
  licenseKey: string;
  message: string;
}

export class GenerateLicenseKeyResponse {
  public readonly licenseKey: string;
  public readonly message: string;

  constructor(data: GenerateLicenseKeyResponseData) {
    this.licenseKey = data.licenseKey;
    this.message = data.message;
  }
}

export interface ValidateLicenseKeyRequestData {
  licenseKey: string;
}

export class ValidateLicenseKeyRequest {
  public readonly licenseKey: string;

  constructor(data: ValidateLicenseKeyRequestData) {
    this.licenseKey = data.licenseKey;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(this.licenseKey && this.licenseKey.trim().length > 0);
  }
}

export interface LicenseKeyValidationResponseData {
  isValid: boolean;
  status?: LicenseStatus;
  expiryDate?: string;
  isActive?: boolean;
  message: string;
  clockTampered?: boolean;
  companyId?: string;
}

export class LicenseKeyValidationResponse {
  public readonly isValid: boolean;
  public readonly status?: LicenseStatus;
  public readonly expiryDate?: string;
  public readonly isActive?: boolean;
  public readonly message: string;
  public readonly clockTampered?: boolean;
  public readonly companyId?: string;

  constructor(data: LicenseKeyValidationResponseData) {
    this.isValid = data.isValid;
    this.status = data.status;
    this.expiryDate = data.expiryDate;
    this.isActive = data.isActive;
    this.message = data.message;
    this.clockTampered = data.clockTampered;
    this.companyId = data.companyId;
  }
}

// Bulk Operations
export interface BulkOperationRequestData {
  companyIds: string[]; // Array of encrypted GUIDs
  action: number; // 1=Activate, 2=Suspend, 3=Resume, 4=Extend, 5=Delete
  expiryDate?: string; // Required for Extend action (ISO 8601)
}

export class BulkOperationRequest {
  public readonly companyIds: string[];
  public readonly action: number;
  public readonly expiryDate?: string;

  constructor(data: BulkOperationRequestData) {
    this.companyIds = data.companyIds;
    this.action = data.action;
    this.expiryDate = data.expiryDate;
  }

  get isValid(): boolean {
    return this.companyIds.length > 0 && (this.action !== 4 || !!this.expiryDate);
  }
}

export interface BulkOperationResultData {
  companyId: string;
  companyName?: string;
  success: boolean;
  message: string;
  errorMessage?: string;
}

export class BulkOperationResult {
  public readonly companyId: string;
  public readonly companyName?: string;
  public readonly success: boolean;
  public readonly message: string;
  public readonly errorMessage?: string;

  constructor(data: BulkOperationResultData) {
    this.companyId = data.companyId;
    this.companyName = data.companyName;
    this.success = data.success;
    this.message = data.message;
    this.errorMessage = data.errorMessage;
  }
}

export interface BulkOperationResponseData {
  totalCount: number;
  successCount: number;
  failedCount: number;
  results: BulkOperationResultData[];
}

export class BulkOperationResponse {
  public readonly totalCount: number;
  public readonly successCount: number;
  public readonly failedCount: number;
  public readonly results: BulkOperationResult[];

  constructor(data: BulkOperationResponseData) {
    this.totalCount = data.totalCount;
    this.successCount = data.successCount;
    this.failedCount = data.failedCount;
    this.results = data.results.map(r => new BulkOperationResult(r));
  }
}

// Trial Operations
export interface StartTrialRequestData {
  trialDays: number; // 1-365
}

export class StartTrialRequest {
  public readonly trialDays: number;

  constructor(data: StartTrialRequestData) {
    this.trialDays = data.trialDays;
  }

  get isValid(): boolean {
    return this.trialDays >= 1 && this.trialDays <= 365;
  }
}

export interface ConvertTrialRequestData {
  expiryDate: string; // ISO 8601 date
}

export class ConvertTrialRequest {
  public readonly expiryDate: string;

  constructor(data: ConvertTrialRequestData) {
    this.expiryDate = data.expiryDate;
  }

  get isValid(): boolean {
    const date = new Date(this.expiryDate);
    return date > new Date();
  }
}

