/**
 * Company Domain Model
 * 
 * Represents the core company entity in the domain layer.
 * This model is independent of external concerns and focuses
 * purely on company data and business logic.
 */

export interface CompanyData {
  id: string; // Encrypted GUID from backend
  name: string;
  isActive: boolean;
  expiryDate?: string; // ISO date string
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  licenseKey?: string; // Only shown when generated
  createdTimestamp: string;
  updatedTimestamp?: string;
}

export class Company {
  public readonly id: string;
  public readonly name: string;
  public readonly isActive: boolean;
  public readonly expiryDate?: string;
  public readonly contactEmail?: string;
  public readonly contactPhone?: string;
  public readonly address?: string;
  public readonly licenseKey?: string;
  public readonly createdTimestamp: string;
  public readonly updatedTimestamp?: string;

  constructor(data: CompanyData) {
    this.id = data.id;
    this.name = data.name;
    this.isActive = data.isActive;
    this.expiryDate = data.expiryDate;
    this.contactEmail = data.contactEmail;
    this.contactPhone = data.contactPhone;
    this.address = data.address;
    this.licenseKey = data.licenseKey;
    this.createdTimestamp = data.createdTimestamp;
    this.updatedTimestamp = data.updatedTimestamp;
  }

  /**
   * Get company's display name
   */
  get displayName(): string {
    return this.name;
  }

  /**
   * Get company status (Active, Expired, or Suspended)
   */
  get status(): "Active" | "Expired" | "Suspended" {
    if (this.expiryDate) {
      const expiry = new Date(this.expiryDate);
      if (expiry < new Date()) return "Expired";
    }
    if (!this.isActive) return "Suspended";
    return "Active";
  }

  /**
   * Check if company is active
   */
  get isActiveStatus(): boolean {
    return this.status === "Active";
  }

  /**
   * Create a copy of the company with updated data
   */
  update(updates: Partial<CompanyData>): Company {
    return new Company({
      ...this,
      ...updates,
    });
  }
}

/**
 * Create Company Request Model
 */
export interface CreateCompanyRequestData {
  name: string;
  expiryDate?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
}

export class CreateCompanyRequest {
  public readonly name: string;
  public readonly expiryDate?: string;
  public readonly contactEmail?: string;
  public readonly contactPhone?: string;
  public readonly address?: string;

  constructor(data: CreateCompanyRequestData) {
    this.name = data.name;
    this.expiryDate = data.expiryDate;
    this.contactEmail = data.contactEmail;
    this.contactPhone = data.contactPhone;
    this.address = data.address;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(this.name && this.name.trim().length > 0);
  }
}

/**
 * Update Company Request Model
 */
export interface UpdateCompanyRequestData {
  id: string;
  name?: string;
  expiryDate?: string;
  isActive?: boolean;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
}

export class UpdateCompanyRequest {
  public readonly id: string;
  public readonly name?: string;
  public readonly expiryDate?: string;
  public readonly isActive?: boolean;
  public readonly contactEmail?: string;
  public readonly contactPhone?: string;
  public readonly address?: string;

  constructor(data: UpdateCompanyRequestData) {
    this.id = data.id;
    this.name = data.name;
    this.expiryDate = data.expiryDate;
    this.isActive = data.isActive;
    this.contactEmail = data.contactEmail;
    this.contactPhone = data.contactPhone;
    this.address = data.address;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(this.id && (this.name === undefined || this.name.trim().length > 0));
  }
}

