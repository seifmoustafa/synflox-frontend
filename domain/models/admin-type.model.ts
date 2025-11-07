/**
 * Admin Type Domain Model
 * 
 * Represents the core admin type entity in the domain layer.
 */

export interface AdminTypeData {
  id: string; // Encrypted GUID from backend
  name: string;
  description?: string;
  isActive?: boolean;
  createdTimestamp?: string;
  updatedTimestamp?: string;
}

export class AdminType {
  public readonly id: string;
  public readonly name: string;
  public readonly description?: string;
  public readonly isActive?: boolean;
  public readonly createdTimestamp?: string;
  public readonly updatedTimestamp?: string;

  constructor(data: AdminTypeData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.isActive = data.isActive;
    this.createdTimestamp = data.createdTimestamp;
    this.updatedTimestamp = data.updatedTimestamp;
  }

  /**
   * Get admin type's display name
   */
  get displayName(): string {
    return this.name;
  }

  /**
   * Create a copy of the admin type with updated data
   */
  update(updates: Partial<AdminTypeData>): AdminType {
    return new AdminType({
      ...this,
      ...updates,
    });
  }
}

/**
 * Create Admin Type Request Model
 */
export interface CreateAdminTypeRequestData {
  name: string;
  description?: string;
}

export class CreateAdminTypeRequest {
  public readonly name: string;
  public readonly description?: string;

  constructor(data: CreateAdminTypeRequestData) {
    this.name = data.name;
    this.description = data.description;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(this.name && this.name.trim().length > 0);
  }
}

/**
 * Update Admin Type Request Model
 */
export interface UpdateAdminTypeRequestData {
  id: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export class UpdateAdminTypeRequest {
  public readonly id: string;
  public readonly name?: string;
  public readonly description?: string;
  public readonly isActive?: boolean;

  constructor(data: UpdateAdminTypeRequestData) {
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

