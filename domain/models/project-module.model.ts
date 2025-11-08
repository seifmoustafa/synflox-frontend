/**
 * Project-Module Relationship Domain Model
 * 
 * Represents the association between projects and modules.
 */

export interface ProjectModuleData {
  id: string; // Encrypted GUID
  projectId: string; // Encrypted GUID
  moduleId: string; // Encrypted GUID
  projectName?: string; // For display purposes
  moduleName?: string; // For display purposes
  createdAt: string;
}

export class ProjectModule {
  public readonly id: string;
  public readonly projectId: string;
  public readonly moduleId: string;
  public readonly projectName?: string;
  public readonly moduleName?: string;
  public readonly createdAt: string;

  constructor(data: ProjectModuleData) {
    this.id = data.id;
    this.projectId = data.projectId;
    this.moduleId = data.moduleId;
    this.projectName = data.projectName;
    this.moduleName = data.moduleName;
    this.createdAt = data.createdAt;
  }

  /**
   * Get display name for the association
   */
  get displayName(): string {
    if (this.projectName && this.moduleName) {
      return `${this.projectName} - ${this.moduleName}`;
    }
    return `${this.projectId} - ${this.moduleId}`;
  }
}

export interface CreateProjectModuleRequestData {
  projectId: string;
  moduleId: string;
}

export class CreateProjectModuleRequest {
  public readonly projectId: string;
  public readonly moduleId: string;

  constructor(data: CreateProjectModuleRequestData) {
    this.projectId = data.projectId;
    this.moduleId = data.moduleId;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(this.projectId && this.moduleId);
  }
}

