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

