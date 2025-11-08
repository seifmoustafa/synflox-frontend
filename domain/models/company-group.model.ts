/**
 * Company Group Domain Model
 * 
 * Represents a group/category that can contain multiple companies.
 */

export interface CompanyGroupData {
  id: string; // Encrypted GUID
  name: string;
  description: string | null;
  isActive: boolean;
  companyCount?: number; // Number of companies in this group
  createdAt: string;
  updatedAt: string | null;
}

export class CompanyGroup {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string | null;
  public readonly isActive: boolean;
  public readonly companyCount?: number;
  public readonly createdAt: string;
  public readonly updatedAt: string | null;

  constructor(data: CompanyGroupData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.isActive = data.isActive;
    this.companyCount = data.companyCount;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Get group's display name
   */
  get displayName(): string {
    return this.name;
  }

  /**
   * Create a copy of the group with updated data
   */
  update(updates: Partial<CompanyGroupData>): CompanyGroup {
    return new CompanyGroup({
      ...this,
      ...updates,
    });
  }
}

export interface CreateCompanyGroupRequestData {
  name: string;
  description?: string;
  isActive?: boolean;
}

export class CreateCompanyGroupRequest {
  public readonly name: string;
  public readonly description?: string;
  public readonly isActive?: boolean;

  constructor(data: CreateCompanyGroupRequestData) {
    this.name = data.name;
    this.description = data.description;
    this.isActive = data.isActive ?? true;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(this.name && this.name.trim().length > 0);
  }
}

export interface UpdateCompanyGroupRequestData {
  id: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export class UpdateCompanyGroupRequest {
  public readonly id: string;
  public readonly name?: string;
  public readonly description?: string;
  public readonly isActive?: boolean;

  constructor(data: UpdateCompanyGroupRequestData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.isActive = data.isActive;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(this.id && (this.name === undefined || this.name.trim().length > 0));
  }
}

