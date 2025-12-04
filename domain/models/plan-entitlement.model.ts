/**
 * Plan Entitlement Domain Model
 * Represents access rights defined at the PLAN level
 * Supports hierarchical structure: Projects → Modules
 */

/**
 * Entitlement access levels - MUST match backend Domain.Enums.EntitlementAccessLevel
 */
export enum EntitlementAccessLevel {
  /** No access */
  None = 0,
  /** Full access - all CRUD operations allowed */
  Full = 1,
  /** Read-only access - view and export only */
  ReadOnly = 2,
  /** Export-only access - can only export data */
  ExportOnly = 3,
  /** Blocked - no access whatsoever */
  Blocked = 4,
}

/**
 * Plan entitlement data structure from API
 */
export interface PlanEntitlementData {
  id: string;
  planId: string;
  planName: string;
  
  // Target
  projectId: string | null;
  projectName: string | null;
  moduleId: string | null;
  moduleName: string | null;
  
  // Hierarchy (for modules under a project)
  parentProjectId: string | null;
  parentProjectName: string | null;
  isOverride: boolean;
  
  // Computed
  targetType: 'Project' | 'Module';
  targetName: string;
  isModuleUnderProject: boolean;
  isStandaloneModule: boolean;
  isProjectEntitlement: boolean;
  
  // Access Configuration
  accessLevel: EntitlementAccessLevel;
  accessLevelDisplay: string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport: boolean;
  displayInMenu: boolean;
  features: string | null;
  
  // Computed
  hasFullAccess: boolean;
  
  // Audit
  isActive: boolean;
  createdTimestamp: string;
  createdBy: string | null;
  updatedTimestamp: string | null;
  updatedBy: string | null;
}

/**
 * Plan Entitlement domain model with business logic
 */
export class PlanEntitlement {
  constructor(
    public readonly id: string,
    public readonly planId: string,
    public readonly planName: string,
    public readonly projectId: string | null,
    public readonly projectName: string | null,
    public readonly moduleId: string | null,
    public readonly moduleName: string | null,
    public readonly parentProjectId: string | null,
    public readonly parentProjectName: string | null,
    public readonly isOverride: boolean,
    public readonly targetType: 'Project' | 'Module',
    public readonly targetName: string,
    public readonly isModuleUnderProject: boolean,
    public readonly isStandaloneModule: boolean,
    public readonly isProjectEntitlement: boolean,
    public readonly accessLevel: EntitlementAccessLevel,
    public readonly accessLevelDisplay: string,
    public readonly canCreate: boolean,
    public readonly canRead: boolean,
    public readonly canUpdate: boolean,
    public readonly canDelete: boolean,
    public readonly canExport: boolean,
    public readonly displayInMenu: boolean,
    public readonly features: string | null,
    public readonly hasFullAccess: boolean,
    public readonly isActive: boolean,
    public readonly createdTimestamp: string,
    public readonly createdBy: string | null = null,
    public readonly updatedTimestamp: string | null = null,
    public readonly updatedBy: string | null = null
  ) {}

  /**
   * Display name for the entitlement
   */
  get displayName(): string {
    return this.targetName || 'Unknown';
  }

  /**
   * Check if this is a project entitlement
   */
  get isProject(): boolean {
    return this.isProjectEntitlement;
  }

  /**
   * Check if this is a module entitlement
   */
  get isModule(): boolean {
    return !this.isProjectEntitlement;
  }

  /**
   * Get permission summary (e.g., "CRUD" or "R" or "CRU")
   */
  get permissionSummary(): string {
    const perms: string[] = [];
    if (this.canCreate) perms.push('C');
    if (this.canRead) perms.push('R');
    if (this.canUpdate) perms.push('U');
    if (this.canDelete) perms.push('D');
    if (this.canExport) perms.push('E');
    return perms.join('') || 'None';
  }

  /**
   * Check if module inherits from parent (not overridden)
   */
  get inheritsFromParent(): boolean {
    return this.isModuleUnderProject && !this.isOverride;
  }

  /**
   * Get status badge type
   */
  get statusType(): 'inherited' | 'override' | 'standalone' | 'project' {
    if (this.isProjectEntitlement) return 'project';
    if (this.isStandaloneModule) return 'standalone';
    if (this.isOverride) return 'override';
    return 'inherited';
  }

  /**
   * Get features as array
   */
  get featuresArray(): string[] {
    if (!this.features) return [];
    return this.features.split(',').map(f => f.trim()).filter(Boolean);
  }

  /**
   * Create immutable copy with updated fields
   */
  update(updates: Partial<PlanEntitlementData>): PlanEntitlement {
    return new PlanEntitlement(
      updates.id ?? this.id,
      updates.planId ?? this.planId,
      updates.planName ?? this.planName,
      updates.projectId ?? this.projectId,
      updates.projectName ?? this.projectName,
      updates.moduleId ?? this.moduleId,
      updates.moduleName ?? this.moduleName,
      updates.parentProjectId ?? this.parentProjectId,
      updates.parentProjectName ?? this.parentProjectName,
      updates.isOverride ?? this.isOverride,
      updates.targetType ?? this.targetType,
      updates.targetName ?? this.targetName,
      updates.isModuleUnderProject ?? this.isModuleUnderProject,
      updates.isStandaloneModule ?? this.isStandaloneModule,
      updates.isProjectEntitlement ?? this.isProjectEntitlement,
      updates.accessLevel ?? this.accessLevel,
      updates.accessLevelDisplay ?? this.accessLevelDisplay,
      updates.canCreate ?? this.canCreate,
      updates.canRead ?? this.canRead,
      updates.canUpdate ?? this.canUpdate,
      updates.canDelete ?? this.canDelete,
      updates.canExport ?? this.canExport,
      updates.displayInMenu ?? this.displayInMenu,
      updates.features ?? this.features,
      updates.hasFullAccess ?? this.hasFullAccess,
      updates.isActive ?? this.isActive,
      updates.createdTimestamp ?? this.createdTimestamp,
      updates.createdBy ?? this.createdBy,
      updates.updatedTimestamp ?? this.updatedTimestamp,
      updates.updatedBy ?? this.updatedBy
    );
  }
}

/**
 * Request to create a new plan entitlement
 */
export interface CreatePlanEntitlementRequestData {
  planId: string;
  projectId?: string | null;
  moduleId?: string | null;
  accessLevel?: EntitlementAccessLevel;
  canCreate?: boolean;
  canRead?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
  displayInMenu?: boolean;
  features?: string | null;
}

export class CreatePlanEntitlementRequest {
  public readonly planId: string;
  public readonly projectId: string | null;
  public readonly moduleId: string | null;
  public readonly accessLevel: EntitlementAccessLevel;
  public readonly canCreate: boolean;
  public readonly canRead: boolean;
  public readonly canUpdate: boolean;
  public readonly canDelete: boolean;
  public readonly canExport: boolean;
  public readonly displayInMenu: boolean;
  public readonly features: string | null;

  constructor(data: CreatePlanEntitlementRequestData) {
    this.planId = data.planId;
    this.projectId = data.projectId ?? null;
    this.moduleId = data.moduleId ?? null;
    this.accessLevel = data.accessLevel ?? EntitlementAccessLevel.Full;
    this.canCreate = data.canCreate ?? true;
    this.canRead = data.canRead ?? true;
    this.canUpdate = data.canUpdate ?? true;
    this.canDelete = data.canDelete ?? true;
    this.canExport = data.canExport ?? true;
    this.displayInMenu = data.displayInMenu ?? true;
    this.features = data.features ?? null;
  }

  get isValid(): boolean {
    // Must have planId and exactly one of projectId or moduleId
    if (!this.planId) return false;
    if (!this.projectId && !this.moduleId) return false;
    if (this.projectId && this.moduleId) return false;
    return true;
  }

  toJSON() {
    return {
      planId: this.planId,
      projectId: this.projectId,
      moduleId: this.moduleId,
      accessLevel: this.accessLevel,
      canCreate: this.canCreate,
      canRead: this.canRead,
      canUpdate: this.canUpdate,
      canDelete: this.canDelete,
      canExport: this.canExport,
      displayInMenu: this.displayInMenu,
      features: this.features,
    };
  }
}

/**
 * Request to update an existing plan entitlement
 */
export interface UpdatePlanEntitlementRequestData {
  id: string;
  accessLevel?: EntitlementAccessLevel;
  canCreate?: boolean;
  canRead?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
  displayInMenu?: boolean;
  features?: string | null;
  isActive?: boolean;
  resetChildOverrides?: boolean; // For project entitlements - cascade to children
}

export class UpdatePlanEntitlementRequest {
  public readonly id: string;
  public readonly accessLevel?: EntitlementAccessLevel;
  public readonly canCreate?: boolean;
  public readonly canRead?: boolean;
  public readonly canUpdate?: boolean;
  public readonly canDelete?: boolean;
  public readonly canExport?: boolean;
  public readonly displayInMenu?: boolean;
  public readonly features?: string | null;
  public readonly isActive?: boolean;
  public readonly resetChildOverrides?: boolean;

  constructor(data: UpdatePlanEntitlementRequestData) {
    this.id = data.id;
    this.accessLevel = data.accessLevel;
    this.canCreate = data.canCreate;
    this.canRead = data.canRead;
    this.canUpdate = data.canUpdate;
    this.canDelete = data.canDelete;
    this.canExport = data.canExport;
    this.displayInMenu = data.displayInMenu;
    this.features = data.features;
    this.isActive = data.isActive;
    this.resetChildOverrides = data.resetChildOverrides;
  }

  get isValid(): boolean {
    return !!this.id;
  }

  toJSON() {
    const data: Record<string, unknown> = {};
    if (this.accessLevel !== undefined) data.accessLevel = this.accessLevel;
    if (this.canCreate !== undefined) data.canCreate = this.canCreate;
    if (this.canRead !== undefined) data.canRead = this.canRead;
    if (this.canUpdate !== undefined) data.canUpdate = this.canUpdate;
    if (this.canDelete !== undefined) data.canDelete = this.canDelete;
    if (this.canExport !== undefined) data.canExport = this.canExport;
    if (this.displayInMenu !== undefined) data.displayInMenu = this.displayInMenu;
    if (this.features !== undefined) data.features = this.features;
    if (this.isActive !== undefined) data.isActive = this.isActive;
    if (this.resetChildOverrides !== undefined) data.resetChildOverrides = this.resetChildOverrides;
    return data;
  }
}

/**
 * Hierarchical structure for displaying entitlements in a tree
 */
export interface EntitlementTreeNode {
  entitlement: PlanEntitlement;
  children: EntitlementTreeNode[];
}

/**
 * Helper to build tree structure from flat entitlements list
 */
export function buildEntitlementTree(entitlements: PlanEntitlement[]): EntitlementTreeNode[] {
  const tree: EntitlementTreeNode[] = [];
  const standaloneModules: EntitlementTreeNode[] = [];
  
  // Group by project
  const projectNodes = new Map<string, EntitlementTreeNode>();
  
  // First pass: create project nodes and standalone modules
  for (const ent of entitlements) {
    if (ent.isProjectEntitlement && ent.projectId) {
      projectNodes.set(ent.projectId, {
        entitlement: ent,
        children: [],
      });
    } else if (ent.isStandaloneModule) {
      standaloneModules.push({
        entitlement: ent,
        children: [],
      });
    }
  }
  
  // Second pass: add modules under their parent projects
  for (const ent of entitlements) {
    if (ent.isModuleUnderProject && ent.parentProjectId) {
      const parentNode = projectNodes.get(ent.parentProjectId);
      if (parentNode) {
        parentNode.children.push({
          entitlement: ent,
          children: [],
        });
      }
    }
  }
  
  // Build final tree: projects first, then standalone modules
  tree.push(...Array.from(projectNodes.values()));
  tree.push(...standaloneModules);
  
  return tree;
}
