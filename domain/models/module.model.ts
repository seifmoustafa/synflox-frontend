/**
 * Module Domain Model
 * Represents a feature module that can be part of projects and subscription plans
 * Note: Projects own the relationship with modules, not vice versa
 */

/**
 * Module data structure from API
 */
export interface ModuleData {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  features?: string[];  // Module features list
  // Removed projects - modules don't own the relationship!
  createdBy?: string | null;
  createdTimestamp?: string | null;
  lastModifiedBy?: string | null;
  lastModifiedTimestamp?: string | null;
}

/**
 * Module domain model with business logic
 */
export class Module {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly isActive: boolean,
    public readonly features: string[] = [],
    // Removed projects - modules don't own the relationship!
    public readonly createdBy: string | null = null,
    public readonly createdTimestamp: string | null = null,
    public readonly lastModifiedBy: string | null = null,
    public readonly lastModifiedTimestamp: string | null = null
  ) {}

  /**
   * Display name for the module
   */
  get displayName(): string {
    return this.name;
  }

  /**
   * Status display text
   */
  get statusText(): string {
    return this.isActive ? "Active" : "Inactive";
  }

  /**
   * Check if module is valid
   */
  get isValid(): boolean {
    return this.name.trim().length > 0;
  }

  /**
   * Get formatted creation date
   */
  get formattedCreatedDate(): string | null {
    if (!this.createdTimestamp) return null;
    return new Date(this.createdTimestamp).toLocaleDateString();
  }

  /**
   * Get features count
   */
  get featuresCount(): number {
    return this.features.length;
  }

  /**
   * Create immutable copy with updated fields
   */
  update(updates: Partial<ModuleData>): Module {
    return new Module(
      updates.id ?? this.id,
      updates.name ?? this.name,
      updates.description ?? this.description,
      updates.isActive ?? this.isActive,
      updates.features ?? this.features,
      updates.createdBy ?? this.createdBy,
      updates.createdTimestamp ?? this.createdTimestamp,
      updates.lastModifiedBy ?? this.lastModifiedBy,
      updates.lastModifiedTimestamp ?? this.lastModifiedTimestamp
    );
  }
}

/**
 * Request to create a new module
 */
export class CreateModuleRequest {
  constructor(
    public readonly name: string,
    public readonly description: string | null,
    public readonly features: string[] = []
  ) {}

  /**
   * Validate the create request
   */
  get isValid(): boolean {
    return this.name.trim().length >= 2 && this.name.trim().length <= 200;
  }

  /**
   * Convert to API request format
   */
  toJSON() {
    return {
      name: this.name.trim(),
      description: this.description?.trim() || null,
      features: this.features,
    };
  }
}

/**
 * Request to update an existing module
 */
export class UpdateModuleRequest {
  constructor(
    public readonly id: string,
    public readonly name?: string,
    public readonly description?: string | null,
    public readonly features?: string[]
  ) {}

  /**
   * Validate the update request
   */
  get isValid(): boolean {
    if (this.name !== undefined) {
      return this.name.trim().length >= 2 && this.name.trim().length <= 200;
    }
    return true;
  }

  /**
   * Convert to API request format
   */
  toJSON() {
    const data: any = {};
    if (this.name !== undefined) data.name = this.name.trim();
    if (this.description !== undefined) data.description = this.description?.trim() || null;
    // Always include features if defined (even if empty array)
    if (this.features !== undefined) {
      data.features = Array.isArray(this.features) ? this.features : [];
    }
    return data;
  }
}
