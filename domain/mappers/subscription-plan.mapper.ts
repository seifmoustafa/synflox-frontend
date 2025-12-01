import {
  SubscriptionPlan,
  SubscriptionPlanData,
  CreatePlanRequest,
  UpdatePlanRequest,
} from "../models/subscription-plan.model";

/**
 * Response format for subscription plans list
 */
export interface SubscriptionPlansResponse {
  data: SubscriptionPlanData[];
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

/**
 * Subscription Plan Mapper
 * Handles conversion between API data and domain models
 */
export class SubscriptionPlanMapper {
  /**
   * Convert API data to SubscriptionPlan domain model
   */
  static fromJson(data: SubscriptionPlanData): SubscriptionPlan {
    return new SubscriptionPlan(
      data.id,
      data.name,
      data.description,
      data.durationType,
      data.isLifetimePlan,
      data.durationDescription,
      data.allowTrial,
      data.trialDurationDays,
      data.autoRenew,
      data.upgradePolicy,
      data.gracePeriodDays,
      data.customFeatures || [],
      data.prices || [],
      data.projects || [],
      data.modules || [],
      data.projectCount ?? 0,
      data.moduleCount ?? 0,
      data.createdBy ?? null,
      data.createdTimestamp ?? null,
      data.lastModifiedBy ?? null,
      data.lastModifiedTimestamp ?? null,
      // Entitlement fields
      data.isFreeTier ?? false,
      data.fallbackAccessMode ?? 3, // Default to ReadOnly
      data.exportGraceDays ?? 30,
      data.defaultFallbackPlanId ?? null,
      data.defaultFallbackPlanName ?? null,
      data.showLockedModulesInMenu ?? true,
      data.lockedItemStyle ?? 'greyed_with_lock',
      // Plan Hierarchy
      data.parentPlanId ?? null,
      data.parentPlanName ?? null,
      data.displayOrder ?? 0,
      data.childPlanCount ?? 0,
      data.inheritedProjectsCount ?? 0,
      data.inheritedModulesCount ?? 0
    );
  }

  /**
   * Convert SubscriptionPlan domain model to API data
   */
  static toJson(plan: SubscriptionPlan): SubscriptionPlanData {
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      durationType: plan.durationType,
      isLifetimePlan: plan.isLifetimePlan,
      durationDescription: plan.durationDescription,
      allowTrial: plan.allowTrial,
      trialDurationDays: plan.trialDurationDays,
      autoRenew: plan.autoRenew,
      upgradePolicy: plan.upgradePolicy,
      gracePeriodDays: plan.gracePeriodDays,
      customFeatures: plan.customFeatures,
      prices: plan.prices,
      projects: plan.projects,
      modules: plan.modules,
      createdBy: plan.createdBy,
      createdTimestamp: plan.createdTimestamp,
      lastModifiedBy: plan.lastModifiedBy,
      lastModifiedTimestamp: plan.lastModifiedTimestamp,
      // Entitlement fields
      isFreeTier: plan.isFreeTier,
      fallbackAccessMode: plan.fallbackAccessMode,
      exportGraceDays: plan.exportGraceDays,
      defaultFallbackPlanId: plan.defaultFallbackPlanId,
      defaultFallbackPlanName: plan.defaultFallbackPlanName,
      showLockedModulesInMenu: plan.showLockedModulesInMenu,
      lockedItemStyle: plan.lockedItemStyle,
      // Plan Hierarchy
      parentPlanId: plan.parentPlanId,
      parentPlanName: plan.parentPlanName,
      displayOrder: plan.displayOrder,
      childPlanCount: plan.childPlanCount,
      inheritedProjectsCount: plan.inheritedProjectsCount,
      inheritedModulesCount: plan.inheritedModulesCount,
    };
  }

  /**
   * Convert CreatePlanRequest to API request format
   */
  static createRequestToJson(request: CreatePlanRequest): Record<string, any> {
    return request.toJSON();
  }

  /**
   * Convert UpdatePlanRequest to API request format
   */
  static updateRequestToJson(request: UpdatePlanRequest): Record<string, any> {
    return request.toJSON();
  }

  /**
   * Handle API response and convert to domain models
   */
  static handleApiResponse(response: SubscriptionPlansResponse): {
    plans: SubscriptionPlan[];
    pagination?: SubscriptionPlansResponse["pagination"];
  } {
    return {
      plans: response.data.map((data) => SubscriptionPlanMapper.fromJson(data)),
      pagination: response.pagination,
    };
  }

  /**
   * Handle single plan API response
   */
  static handleSingleResponse(response: any): SubscriptionPlan {
    const data = response?.data || response;
    return SubscriptionPlanMapper.fromJson(data);
  }
}
