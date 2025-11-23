/**
 * Admin Domain Model
 * 
 * Represents the core admin entity in the domain layer for admin management.
 * This model is independent of external concerns and focuses
 * purely on admin data and business logic.
 */

export interface AdminData {
  id: string; // Encrypted GUID from backend
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  adminTypeId: string;
  adminTypeName?: string | null; // For display purposes
  isActive?: boolean;
}

export class Admin {
  public readonly id: string;
  public readonly username: string;
  public readonly firstName?: string | null;
  public readonly lastName?: string | null;
  public readonly phoneNumber?: string | null;
  public readonly adminTypeId: string;
  public readonly adminTypeName?: string | null;
  public readonly isActive?: boolean;

  constructor(data: AdminData) {
    this.id = data.id;
    this.username = data.username;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.phoneNumber = data.phoneNumber;
    this.adminTypeId = data.adminTypeId;
    this.adminTypeName = data.adminTypeName;
    this.isActive = data.isActive ?? true; // Default to true if not provided
  }

  /**
   * Get admin's full name
   */
  get fullName(): string {
    const firstName = this.firstName || '';
    const lastName = this.lastName || '';
    return `${firstName} ${lastName}`.trim();
  }

  /**
   * Get admin's display name
   */
  get displayName(): string {
    return this.fullName || this.username;
  }

  /**
   * Create a copy of the admin with updated data
   */
  update(updates: Partial<AdminData>): Admin {
    return new Admin({
      ...this,
      ...updates,
    });
  }
}

/**
 * Create Admin Request Model
 */
export interface CreateAdminRequestData {
  username: string;
  password: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  adminTypeId: string;
}

export class CreateAdminRequest {
  public readonly username: string;
  public readonly password: string;
  public readonly firstName?: string | null;
  public readonly lastName?: string | null;
  public readonly phoneNumber?: string | null;
  public readonly adminTypeId: string;

  constructor(data: CreateAdminRequestData) {
    this.username = data.username;
    this.password = data.password;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.phoneNumber = data.phoneNumber;
    this.adminTypeId = data.adminTypeId;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(
      this.username &&
      this.password &&
      this.adminTypeId
    );
  }
}

/**
 * Update Admin Request Model
 */
export interface UpdateAdminRequestData {
  id: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  adminTypeId?: string;
}

export class UpdateAdminRequest {
  public readonly id: string;
  public readonly username?: string | null;
  public readonly firstName?: string | null;
  public readonly lastName?: string | null;
  public readonly phoneNumber?: string | null;
  public readonly adminTypeId?: string;

  constructor(data: UpdateAdminRequestData) {
    this.id = data.id;
    this.username = data.username;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.phoneNumber = data.phoneNumber;
    this.adminTypeId = data.adminTypeId;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(this.id && (
      this.username === undefined || this.username === null || this.username.trim().length > 0
    ));
  }
}

