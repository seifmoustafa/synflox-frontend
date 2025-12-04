import {
  SubscriptionPlan,
  CreatePlanRequest,
  UpdatePlanRequest,
  SubscriptionPlanMapper,
} from "@/domain";
import { IApiService } from "./api.service";
import { INotificationService } from "./notification.service";
import { API_ENDPOINTS } from "@/config/api-endpoints";

/**
 * Module conflict info - a module that's already in a project
 */
export interface PlanModuleConflict {
  moduleId: string;
  moduleName: string;
  projectId: string;
  projectName: string;
}

/**
 * Validation result for plan modules
 */
export interface PlanValidationResult {
  isValid: boolean;
  hasWarnings: boolean;
  requiresConfirmation: boolean;
  moduleConflicts: PlanModuleConflict[];
  validStandaloneModuleIds: string[];
  warningMessage?: string;
  errors: string[];
}

/**
 * Request to validate plan modules
 */
export interface ValidatePlanModulesRequest {
  planId?: string;
  projectIds: string[];
  moduleIds: string[];
}

/**
 * Create plan with confirmation to remove duplicates
 */
export interface CreatePlanWithConfirmationRequest extends CreatePlanRequest {
  confirmRemoveDuplicates: boolean;
}

/**
 * Update plan with confirmation to remove duplicates
 */
export interface UpdatePlanWithConfirmationRequest extends UpdatePlanRequest {
  confirmRemoveDuplicates: boolean;
}

/**
 * Subscription Plan Service Interface
 */
export interface ISubscriptionPlanService {
  getAllPlans(
    page?: number,
    pageSize?: number,
    search?: string
  ): Promise<{ plans: SubscriptionPlan[]; pagination?: any }>;
  getPlanById(id: string): Promise<SubscriptionPlan>;
  createPlan(request: CreatePlanRequest): Promise<SubscriptionPlan>;
  updatePlan(request: UpdatePlanRequest): Promise<SubscriptionPlan>;
  deletePlan(id: string): Promise<void>;
  getFreeTierPlans(): Promise<SubscriptionPlan[]>;
  
  /**
   * Validate plan modules for conflicts before save
   * Returns warnings if any standalone modules are already in projects
   */
  validateModules(request: ValidatePlanModulesRequest): Promise<{ data: PlanValidationResult; requiresConfirmation: boolean; message?: string }>;
  
  /**
   * Create plan with confirmation to remove duplicate modules
   */
  createWithConfirmation(request: CreatePlanWithConfirmationRequest): Promise<SubscriptionPlan>;
  
  /**
   * Update plan with confirmation to remove duplicate modules
   */
  updateWithConfirmation(request: UpdatePlanWithConfirmationRequest): Promise<SubscriptionPlan>;
}

/**
 * Subscription Plan Service Implementation
 */
export class SubscriptionPlanService implements ISubscriptionPlanService {
  constructor(
    private readonly apiService: IApiService,
    private readonly notificationService: INotificationService
  ) {}

  /**
   * Get all subscription plans with pagination
   */
  async getAllPlans(
    page: number = 1,
    pageSize: number = 20,
    search?: string
  ): Promise<{ plans: SubscriptionPlan[]; pagination?: any }> {
    try {
      const params: any = { page, pageSize };
      if (search) params.search = search;

      const response = await this.apiService.get<any>(
        API_ENDPOINTS.PLANS.GET_ALL,
        params
      );

      return SubscriptionPlanMapper.handleApiResponse(response);
    } catch (error: any) {
      this.notificationService.error(
        error.message || "Failed to load subscription plans"
      );
      throw error;
    }
  }

  /**
   * Get subscription plan by ID
   */
  async getPlanById(id: string): Promise<SubscriptionPlan> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.PLANS.BY_ID(id)
      );
      return SubscriptionPlanMapper.handleSingleResponse(response);
    } catch (error: any) {
      this.notificationService.error(
        error.message || "Failed to load subscription plan"
      );
      throw error;
    }
  }

  /**
   * Create a new subscription plan
   */
  async createPlan(request: CreatePlanRequest): Promise<SubscriptionPlan> {
    try {
      if (!request.isValid) {
        throw new Error("Plan name must be between 2 and 150 characters and must have at least one price");
      }

      const payload = SubscriptionPlanMapper.createRequestToJson(request);
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.PLANS.CREATE,
        payload
      );

      const plan = SubscriptionPlanMapper.handleSingleResponse(response);
      // Note: Success notification handled by generic CRUD viewmodel
      return plan;
    } catch (error: any) {
      // Note: Error notification handled by generic CRUD viewmodel
      throw error;
    }
  }

  /**
   * Update an existing subscription plan
   */
  async updatePlan(request: UpdatePlanRequest): Promise<SubscriptionPlan> {
    try {
      if (!request.isValid) {
        throw new Error("Plan name must be between 2 and 150 characters");
      }

      const payload = SubscriptionPlanMapper.updateRequestToJson(request);
      const response = await this.apiService.put<any>(
        API_ENDPOINTS.PLANS.BY_ID(request.id),
        payload
      );

      const plan = SubscriptionPlanMapper.handleSingleResponse(response);
      // Note: Success notification handled by generic CRUD viewmodel
      return plan;
    } catch (error: any) {
      // Note: Error notification handled by generic CRUD viewmodel
      throw error;
    }
  }

  /**
   * Delete a subscription plan
   */
  async deletePlan(id: string): Promise<void> {
    try {
      await this.apiService.delete(API_ENDPOINTS.PLANS.BY_ID(id));
      // Note: Success notification handled by generic CRUD viewmodel
    } catch (error: any) {
      // Note: Error notification handled by generic CRUD viewmodel
      throw error;
    }
  }

  /**
   * Get all free tier plans (for fallback plan dropdown)
   */
  async getFreeTierPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.PLANS.FREE_TIER
      );
      const result = SubscriptionPlanMapper.handleApiResponse(response);
      return result.plans;
    } catch (error: any) {
      // Return empty array on error - fallback dropdown will just be empty
      return [];
    }
  }

  /**
   * Validate plan modules for conflicts before save
   * Checks if any standalone modules are already in selected projects
   */
  async validateModules(request: ValidatePlanModulesRequest): Promise<{ data: PlanValidationResult; requiresConfirmation: boolean; message?: string }> {
    try {
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.PLANS.VALIDATE_MODULES,
        request
      );
      return {
        data: response.data,
        requiresConfirmation: response.requiresConfirmation || false,
        message: response.message
      };
    } catch (error: any) {
      this.notificationService.error(
        error.message || "Failed to validate plan modules"
      );
      throw error;
    }
  }

  /**
   * Create plan with confirmation to remove duplicate modules
   */
  async createWithConfirmation(request: CreatePlanWithConfirmationRequest): Promise<SubscriptionPlan> {
    try {
      if (!request.isValid) {
        throw new Error("Plan name must be between 2 and 150 characters");
      }

      // Build payload directly (don't use mapper since request is plain object)
      const payload = {
        name: request.name,
        description: request.description,
        durationType: request.durationType,
        prices: request.prices,
        allowTrial: request.allowTrial,
        trialDurationDays: request.trialDurationDays,
        autoRenew: request.autoRenew,
        upgradePolicy: request.upgradePolicy,
        gracePeriodDays: request.gracePeriodDays,
        exportGraceDays: request.exportGraceDays,
        isFreeTier: request.isFreeTier,
        fallbackAccessMode: request.fallbackAccessMode,
        showLockedModulesInMenu: request.showLockedModulesInMenu,
        customFeatures: request.customFeatures,
        projectIds: request.projectIds,
        moduleIds: request.moduleIds,
        parentPlanId: request.parentPlanId,
        displayOrder: request.displayOrder,
        confirmRemoveDuplicates: request.confirmRemoveDuplicates
      };
      
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.PLANS.CREATE_WITH_CONFIRMATION,
        payload
      );

      const plan = SubscriptionPlanMapper.handleSingleResponse(response);
      this.notificationService.success("Plan created successfully");
      return plan;
    } catch (error: any) {
      // Re-throw to let caller handle
      throw error;
    }
  }

  /**
   * Update plan with confirmation to remove duplicate modules
   */
  async updateWithConfirmation(request: UpdatePlanWithConfirmationRequest): Promise<SubscriptionPlan> {
    try {
      if (!request.isValid) {
        throw new Error("Plan name must be between 2 and 150 characters");
      }

      // Build payload directly (don't use mapper since request is plain object)
      const payload = {
        id: request.id,
        name: request.name,
        description: request.description,
        durationType: request.durationType,
        prices: request.prices,
        allowTrial: request.allowTrial,
        trialDurationDays: request.trialDurationDays,
        autoRenew: request.autoRenew,
        upgradePolicy: request.upgradePolicy,
        gracePeriodDays: request.gracePeriodDays,
        exportGraceDays: request.exportGraceDays,
        isFreeTier: request.isFreeTier,
        fallbackAccessMode: request.fallbackAccessMode,
        showLockedModulesInMenu: request.showLockedModulesInMenu,
        customFeatures: request.customFeatures,
        projectIds: request.projectIds,
        moduleIds: request.moduleIds,
        parentPlanId: request.parentPlanId,
        displayOrder: request.displayOrder,
        confirmRemoveDuplicates: request.confirmRemoveDuplicates
      };
      
      const response = await this.apiService.put<any>(
        API_ENDPOINTS.PLANS.UPDATE_WITH_CONFIRMATION(request.id),
        payload
      );

      const plan = SubscriptionPlanMapper.handleSingleResponse(response);
      this.notificationService.success("Plan updated successfully");
      return plan;
    } catch (error: any) {
      this.notificationService.error(error.message || "Failed to update plan");
      throw error;
    }
  }
}
