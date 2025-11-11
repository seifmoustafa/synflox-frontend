/**
 * Admin Type Domain Model
 * 
 * Represents the core admin type entity in the domain layer.
 */

export interface AdminTypeData {
  id: string; // Encrypted GUID from backend
  adminTypeName: string;
}

export class AdminType {
  public readonly id: string;
  public readonly adminTypeName: string;

  constructor(data: AdminTypeData) {
    this.id = data.id;
    this.adminTypeName = data.adminTypeName;
  }

  /**
   * Get admin type's display name
   */
  get displayName(): string {
    return this.adminTypeName;
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
  adminTypeName: string;
}

export class CreateAdminTypeRequest {
  public readonly adminTypeName: string;

  constructor(data: CreateAdminTypeRequestData) {
    this.adminTypeName = data.adminTypeName;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(this.adminTypeName && this.adminTypeName.trim().length > 0);
  }
}

/**
 * Update Admin Type Request Model
 */
export interface UpdateAdminTypeRequestData {
  id: string;
  adminTypeName?: string;
}

export class UpdateAdminTypeRequest {
  public readonly id: string;
  public readonly adminTypeName?: string;

  constructor(data: UpdateAdminTypeRequestData) {
    this.id = data.id;
    this.adminTypeName = data.adminTypeName;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(this.id && (this.adminTypeName === undefined || this.adminTypeName.trim().length > 0));
  }
}

