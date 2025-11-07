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
  firstName: string;
  lastName: string;
  phoneNumber: string;
  adminTypeId?: string; // Reference to AdminType (may not be in response)
  adminTypeName?: string; // For display purposes
  isActive?: boolean;
  createdTimestamp?: string;
  updatedTimestamp?: string;
}

export class Admin {
  public readonly id: string;
  public readonly username: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly phoneNumber: string;
  public readonly adminTypeId: string;
  public readonly adminTypeName?: string;
  public readonly isActive?: boolean;
  public readonly createdTimestamp?: string;
  public readonly updatedTimestamp?: string;

  constructor(data: AdminData) {
    this.id = data.id;
    this.username = data.username;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.phoneNumber = data.phoneNumber;
    this.adminTypeId = data.adminTypeId || '';
    this.adminTypeName = data.adminTypeName;
    this.isActive = data.isActive;
    this.createdTimestamp = data.createdTimestamp;
    this.updatedTimestamp = data.updatedTimestamp;
  }

  /**
   * Get admin's full name
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
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
  firstName: string;
  lastName: string;
  phoneNumber: string;
  adminTypeId: string;
}

export class CreateAdminRequest {
  public readonly username: string;
  public readonly password: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly phoneNumber: string;
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
      this.firstName &&
      this.lastName &&
      this.phoneNumber &&
      this.adminTypeId
    );
  }
}

/**
 * Update Admin Request Model
 */
export interface UpdateAdminRequestData {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  adminTypeId?: string;
  isActive?: boolean;
}

export class UpdateAdminRequest {
  public readonly id: string;
  public readonly username?: string;
  public readonly firstName?: string;
  public readonly lastName?: string;
  public readonly phoneNumber?: string;
  public readonly adminTypeId?: string;
  public readonly isActive?: boolean;

  constructor(data: UpdateAdminRequestData) {
    this.id = data.id;
    this.username = data.username;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.phoneNumber = data.phoneNumber;
    this.adminTypeId = data.adminTypeId;
    this.isActive = data.isActive;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(this.id && (
      this.username === undefined || this.username.trim().length > 0
    ));
  }
}

