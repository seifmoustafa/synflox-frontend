/**
 * Company Domain Model
 * Represents a company entity in the SYNFLOX licensing system
 */

export interface CompanyData {
  id: string; // Encrypted GUID from backend
  name: string;
  isActive: boolean;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  createdTimestamp: string;
  updatedTimestamp?: string | null;
}

export class Company {
  public readonly id: string;
  public readonly name: string;
  public readonly isActive: boolean;
  public readonly contactEmail?: string | null;
  public readonly contactPhone?: string | null;
  public readonly address?: string | null;
  public readonly createdTimestamp: Date;
  public readonly updatedTimestamp?: Date | null;

  constructor(data: CompanyData) {
    this.id = data.id;
    this.name = data.name;
    this.isActive = data.isActive;
    this.contactEmail = data.contactEmail;
    this.contactPhone = data.contactPhone;
    this.address = data.address;
    this.createdTimestamp = new Date(data.createdTimestamp);
    this.updatedTimestamp = data.updatedTimestamp ? new Date(data.updatedTimestamp) : null;
  }

  /**
   * Display name for the company
   */
  get displayName(): string {
    return this.name;
  }

  /**
   * Status text
   */
  get statusText(): string {
    return this.isActive ? "Active" : "Inactive";
  }

  /**
   * Contact information summary
   */
  get contactInfo(): string {
    const parts: string[] = [];
    if (this.contactEmail) parts.push(this.contactEmail);
    if (this.contactPhone) parts.push(this.contactPhone);
    return parts.join(" • ") || "No contact info";
  }

  /**
   * Check if company is valid
   */
  get isValid(): boolean {
    return !!(this.name && this.name.trim().length > 0);
  }

  /**
   * Update company data (immutable)
   */
  update(updates: Partial<CompanyData>): Company {
    return new Company({ ...this, ...updates } as CompanyData);
  }
}

/**
 * Create Company Request Model
 */
export interface CreateCompanyRequestData {
  name: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
}

export class CreateCompanyRequest {
  public readonly name: string;
  public readonly contactEmail?: string | null;
  public readonly contactPhone?: string | null;
  public readonly address?: string | null;

  constructor(data: CreateCompanyRequestData) {
    this.name = data.name;
    this.contactEmail = data.contactEmail;
    this.contactPhone = data.contactPhone;
    this.address = data.address;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(
      this.name &&
      this.name.trim().length > 0 &&
      this.name.length <= 200
    );
  }
}

/**
 * Update Company Request Model
 */
export interface UpdateCompanyRequestData {
  id: string;
  name?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
}

export class UpdateCompanyRequest {
  public readonly id: string;
  public readonly name?: string | null;
  public readonly contactEmail?: string | null;
  public readonly contactPhone?: string | null;
  public readonly address?: string | null;

  constructor(data: UpdateCompanyRequestData) {
    this.id = data.id;
    this.name = data.name;
    this.contactEmail = data.contactEmail;
    this.contactPhone = data.contactPhone;
    this.address = data.address;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(this.id);
  }
}

/**
 * Companies Response (for pagination)
 */
export interface CompaniesResponse {
  data: Company[];
  pagination: {
    itemsCount: number;
    pageSize: number;
    page: number;
    pagesCount: number;
  };
}
