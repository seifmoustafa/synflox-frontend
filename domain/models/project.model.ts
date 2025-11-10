/**
 * Project Domain Model
 * 
 * Represents a project that contains multiple modules.
 */

export interface ProjectData {
  id: string; // Encrypted GUID
  name: string;
  description: string | null;
  features: string[] | null; // Array of custom feature strings
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export class Project {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string | null;
  public readonly features: string[] | null;
  public readonly isActive: boolean;
  public readonly createdAt: string;
  public readonly updatedAt: string | null;

  constructor(data: ProjectData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.features = data.features;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Get project's display name
   */
  get displayName(): string {
    return this.name;
  }

  /**
   * Create a copy of the project with updated data
   */
  update(updates: Partial<ProjectData>): Project {
    return new Project({
      ...this,
      ...updates,
    });
  }
}

export interface CreateProjectRequestData {
  name: string;
  description?: string;
  features?: string[];
  isActive?: boolean;
}

export class CreateProjectRequest {
  public readonly name: string;
  public readonly description?: string;
  public readonly features?: string[];
  public readonly isActive?: boolean;

  constructor(data: CreateProjectRequestData) {
    this.name = data.name;
    this.description = data.description;
    this.features = data.features;
    this.isActive = data.isActive ?? true;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(this.name && this.name.trim().length > 0);
  }
}

export interface UpdateProjectRequestData {
  id: string;
  name?: string;
  description?: string;
  features?: string[];
  isActive?: boolean;
}

export class UpdateProjectRequest {
  public readonly id: string;
  public readonly name?: string;
  public readonly description?: string;
  public readonly features?: string[];
  public readonly isActive?: boolean;

  constructor(data: UpdateProjectRequestData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.features = data.features;
    this.isActive = data.isActive;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(this.id && (this.name === undefined || this.name.trim().length > 0));
  }
}

