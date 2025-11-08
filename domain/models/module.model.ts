/**
 * Module Domain Model
 * 
 * Represents a module that can be associated with projects.
 */

export interface ModuleData {
  id: string; // Encrypted GUID
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export class Module {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string | null;
  public readonly isActive: boolean;
  public readonly createdAt: string;
  public readonly updatedAt: string | null;

  constructor(data: ModuleData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Get module's display name
   */
  get displayName(): string {
    return this.name;
  }

  /**
   * Create a copy of the module with updated data
   */
  update(updates: Partial<ModuleData>): Module {
    return new Module({
      ...this,
      ...updates,
    });
  }
}

export interface CreateModuleRequestData {
  name: string;
  description?: string;
  isActive?: boolean;
}

export class CreateModuleRequest {
  public readonly name: string;
  public readonly description?: string;
  public readonly isActive?: boolean;

  constructor(data: CreateModuleRequestData) {
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

export interface UpdateModuleRequestData {
  id: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export class UpdateModuleRequest {
  public readonly id: string;
  public readonly name?: string;
  public readonly description?: string;
  public readonly isActive?: boolean;

  constructor(data: UpdateModuleRequestData) {
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

