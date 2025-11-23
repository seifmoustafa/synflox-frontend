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
      data.createdBy ?? null,
      data.createdTimestamp ?? null,
      data.lastModifiedBy ?? null,
      data.lastModifiedTimestamp ?? null
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
