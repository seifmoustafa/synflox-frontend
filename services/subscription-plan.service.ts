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
}
