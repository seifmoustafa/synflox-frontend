/**
 * Plan Entitlement Mapper
 * Handles conversion between API data and domain models
 */

import {
  PlanEntitlement,
  PlanEntitlementData,
  EntitlementAccessLevel,
  CreatePlanEntitlementRequest,
  UpdatePlanEntitlementRequest,
} from '../models/plan-entitlement.model';

/**
 * API response for list of entitlements
 */
export interface PlanEntitlementsResponse {
  data: PlanEntitlementData[];
}

/**
 * Plan Entitlement Mapper
 */
export class PlanEntitlementMapper {
  /**
   * Convert API data to domain model
   */
  static fromJson(data: PlanEntitlementData): PlanEntitlement {
    return new PlanEntitlement(
      data.id,
      data.planId,
      data.planName,
      data.projectId,
      data.projectName,
      data.moduleId,
      data.moduleName,
      data.parentProjectId,
      data.parentProjectName,
      data.isOverride ?? false,
      data.targetType ?? (data.projectId ? 'Project' : 'Module'),
      data.targetName ?? data.projectName ?? data.moduleName ?? 'Unknown',
      data.isModuleUnderProject ?? (!!data.moduleId && !!data.parentProjectId),
      data.isStandaloneModule ?? (!!data.moduleId && !data.parentProjectId),
      data.isProjectEntitlement ?? !!data.projectId,
      data.accessLevel ?? EntitlementAccessLevel.Full,
      data.accessLevelDisplay ?? PlanEntitlementMapper.getAccessLevelDisplay(data.accessLevel),
      data.canCreate ?? true,
      data.canRead ?? true,
      data.canUpdate ?? true,
      data.canDelete ?? true,
      data.canExport ?? true,
      data.displayInMenu ?? true,
      data.features,
      data.hasFullAccess ?? (data.canCreate && data.canRead && data.canUpdate && data.canDelete && data.canExport),
      data.isActive ?? true,
      data.createdTimestamp,
      data.createdBy,
      data.updatedTimestamp,
      data.updatedBy
    );
  }

  /**
   * Convert domain model to API data
   */
  static toJson(entitlement: PlanEntitlement): PlanEntitlementData {
    return {
      id: entitlement.id,
      planId: entitlement.planId,
      planName: entitlement.planName,
      projectId: entitlement.projectId,
      projectName: entitlement.projectName,
      moduleId: entitlement.moduleId,
      moduleName: entitlement.moduleName,
      parentProjectId: entitlement.parentProjectId,
      parentProjectName: entitlement.parentProjectName,
      isOverride: entitlement.isOverride,
      targetType: entitlement.targetType,
      targetName: entitlement.targetName,
      isModuleUnderProject: entitlement.isModuleUnderProject,
      isStandaloneModule: entitlement.isStandaloneModule,
      isProjectEntitlement: entitlement.isProjectEntitlement,
      accessLevel: entitlement.accessLevel,
      accessLevelDisplay: entitlement.accessLevelDisplay,
      canCreate: entitlement.canCreate,
      canRead: entitlement.canRead,
      canUpdate: entitlement.canUpdate,
      canDelete: entitlement.canDelete,
      canExport: entitlement.canExport,
      displayInMenu: entitlement.displayInMenu,
      features: entitlement.features,
      hasFullAccess: entitlement.hasFullAccess,
      isActive: entitlement.isActive,
      createdTimestamp: entitlement.createdTimestamp,
      createdBy: entitlement.createdBy,
      updatedTimestamp: entitlement.updatedTimestamp,
      updatedBy: entitlement.updatedBy,
    };
  }

  /**
   * Convert create request to API format
   */
  static createRequestToJson(request: CreatePlanEntitlementRequest): Record<string, unknown> {
    return request.toJSON();
  }

  /**
   * Convert update request to API format
   */
  static updateRequestToJson(request: UpdatePlanEntitlementRequest): Record<string, unknown> {
    return request.toJSON();
  }

  /**
   * Handle API response for list of entitlements
   */
  static handleListResponse(response: unknown): PlanEntitlement[] {
    if (!response) return [];
    
    // Handle direct array response
    if (Array.isArray(response)) {
      return response.map(item => PlanEntitlementMapper.fromJson(item as PlanEntitlementData));
    }
    
    // Handle wrapped response { data: [...] }
    const wrapped = response as { data?: PlanEntitlementData[] };
    if (wrapped.data && Array.isArray(wrapped.data)) {
      return wrapped.data.map(item => PlanEntitlementMapper.fromJson(item));
    }
    
    return [];
  }

  /**
   * Handle API response for single entitlement
   */
  static handleSingleResponse(response: unknown): PlanEntitlement | null {
    if (!response) return null;
    return PlanEntitlementMapper.fromJson(response as PlanEntitlementData);
  }

  /**
   * Get access level display string
   */
  static getAccessLevelDisplay(level?: EntitlementAccessLevel): string {
    switch (level) {
      case EntitlementAccessLevel.None: return 'None';
      case EntitlementAccessLevel.ReadOnly: return 'Read Only';
      case EntitlementAccessLevel.Limited: return 'Limited';
      case EntitlementAccessLevel.Standard: return 'Standard';
      case EntitlementAccessLevel.Full: return 'Full Access';
      case EntitlementAccessLevel.Custom: return 'Custom';
      default: return 'Full Access';
    }
  }

  /**
   * Get access level options for dropdowns
   */
  static getAccessLevelOptions(): { value: EntitlementAccessLevel; label: string }[] {
    return [
      { value: EntitlementAccessLevel.None, label: 'None' },
      { value: EntitlementAccessLevel.ReadOnly, label: 'Read Only' },
      { value: EntitlementAccessLevel.Limited, label: 'Limited' },
      { value: EntitlementAccessLevel.Standard, label: 'Standard' },
      { value: EntitlementAccessLevel.Full, label: 'Full Access' },
      { value: EntitlementAccessLevel.Custom, label: 'Custom' },
    ];
  }
}
