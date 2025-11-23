/**
 * Project Domain Model
 * Represents a product/application in the SYNFLOX licensing system
 */

export interface ModuleData {
  id: string;
  name: string;
  description?: string | null;
  key?: string | null;
  isActive: boolean;
}

export interface ProjectData {
  id: string;
  name: string;
  description?: string | null;
  features: string[];
  modules: ModuleData[];
  createdTimestamp?: string;
  updatedTimestamp?: string | null;
}

export class Project {
  public readonly id: string;
  public readonly name: string;
  public readonly description?: string | null;
  public readonly features: string[];
  public readonly modules: ModuleData[];
  public readonly createdTimestamp?: Date;
  public readonly updatedTimestamp?: Date | null;

  constructor(data: ProjectData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.features = data.features || [];
    this.modules = data.modules || [];
    this.createdTimestamp = data.createdTimestamp ? new Date(data.createdTimestamp) : undefined;
    this.updatedTimestamp = data.updatedTimestamp ? new Date(data.updatedTimestamp) : null;
  }

  /**
   * Display name for the project
   */
  get displayName(): string {
    return this.name;
  }

  /**
   * Module count
   */
  get moduleCount(): number {
    return this.modules.length;
  }

  /**
   * Feature count
   */
  get featureCount(): number {
    return this.features.length;
  }

  /**
   * Check if project is valid
   */
  get isValid(): boolean {
    return !!(this.name && this.name.trim().length >= 2 && this.name.length <= 200);
  }

  /**
   * Update project data (immutable)
   */
  update(updates: Partial<ProjectData>): Project {
    return new Project({ ...this, ...updates } as ProjectData);
  }
}

/**
 * Create Project Request Model
 */
export interface CreateProjectRequestData {
  name: string;
  description?: string | null;
  features?: string[];
  moduleIds?: string[];
}

export class CreateProjectRequest {
  public readonly name: string;
  public readonly description?: string | null;
  public readonly features: string[];
  public readonly moduleIds: string[];

  constructor(data: CreateProjectRequestData) {
    this.name = data.name;
    this.description = data.description;
    this.features = data.features || [];
    this.moduleIds = data.moduleIds || [];
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(
      this.name &&
      this.name.trim().length >= 2 &&
      this.name.length <= 200
    );
  }
}

/**
 * Update Project Request Model
 */
export interface UpdateProjectRequestData {
  id: string;
  name?: string | null;
  description?: string | null;
  features?: string[];
  moduleIds?: string[];
}

export class UpdateProjectRequest {
  public readonly id: string;
  public readonly name?: string | null;
  public readonly description?: string | null;
  public readonly features?: string[];
  public readonly moduleIds?: string[];

  constructor(data: UpdateProjectRequestData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.features = data.features;
    this.moduleIds = data.moduleIds;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(this.id);
  }
}

/**
 * Projects Response (for pagination)
 */
export interface ProjectsResponse {
  data: Project[];
  pagination: {
    itemsCount: number;
    pageSize: number;
    page: number;
    pagesCount: number;
  };
}
