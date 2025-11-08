/**
 * Subscription Plan Service
 *
 * Handles Subscription Plan CRUD operations with SYNFLOX backend API.
 */

import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import {
  SubscriptionPlan,
  SubscriptionPlanMapper,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
  type SubscriptionPlansResponse,
} from "@/domain";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export interface ISubscriptionPlanService {
  getPlans(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<SubscriptionPlansResponse>;
  getPlanById(id: string): Promise<SubscriptionPlan>;
  createPlan(data: CreateSubscriptionPlanRequest): Promise<SubscriptionPlan>;
  updatePlan(id: string, data: UpdateSubscriptionPlanRequest): Promise<SubscriptionPlan>;
  deletePlan(id: string): Promise<void>;
  assignModules(planId: string, projectModules: Array<{projectModuleId: string, isEnabled: boolean}>): Promise<void>;
  getPlanModules(planId: string): Promise<Array<{projectModuleId: string, projectName: string, moduleName: string, isEnabled: boolean}>>;
}

export class SubscriptionPlanService implements ISubscriptionPlanService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  async getPlans(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<SubscriptionPlansResponse> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.SUBSCRIPTION_PLANS_GET_ALL,
        params
      );
      return SubscriptionPlanMapper.handleApiResponse(response);
    } catch (e) {
      throw e;
    }
  }

  async getPlanById(id: string): Promise<SubscriptionPlan> {
    try {
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.SUBSCRIPTION_PLANS_GET_BY_ID}/${id}`
      );
      const planData = response?.data || response;
      return SubscriptionPlanMapper.fromJson(planData);
    } catch (e) {
      throw e;
    }
  }

  async createPlan(data: CreateSubscriptionPlanRequest): Promise<SubscriptionPlan> {
    try {
      const json = SubscriptionPlanMapper.createRequestToJson(data);
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.SUBSCRIPTION_PLANS_CREATE,
        json
      );
      const planData = response?.data || response;
      const message = response?.message || "Subscription plan created successfully";
      this.notificationService.success(message);
      return SubscriptionPlanMapper.fromJson(planData);
    } catch (e) {
      throw e;
    }
  }

  async updatePlan(id: string, data: UpdateSubscriptionPlanRequest): Promise<SubscriptionPlan> {
    try {
      const json = SubscriptionPlanMapper.updateRequestToJson(data);
      const response = await this.apiService.put<any>(
        `${API_ENDPOINTS.SUBSCRIPTION_PLANS_UPDATE}/${id}`,
        json
      );
      const planData = response?.data || response;
      const message = response?.message || "Subscription plan updated successfully";
      this.notificationService.success(message);
      return SubscriptionPlanMapper.fromJson(planData);
    } catch (e) {
      throw e;
    }
  }

  async deletePlan(id: string): Promise<void> {
    try {
      const response = await this.apiService.delete<any>(
        `${API_ENDPOINTS.SUBSCRIPTION_PLANS_DELETE}/${id}`
      );
      const message = response?.message || "Subscription plan deleted successfully";
      this.notificationService.success(message);
    } catch (e) {
      throw e;
    }
  }

  async assignModules(planId: string, projectModules: Array<{projectModuleId: string, isEnabled: boolean}>): Promise<void> {
    try {
      const response = await this.apiService.put<any>(
        `${API_ENDPOINTS.SUBSCRIPTION_PLANS_ASSIGN_MODULES}/${planId}/project-modules`,
        { projectModules }
      );
      const message = response?.message || "Modules assigned successfully";
      this.notificationService.success(message);
    } catch (e) {
      throw e;
    }
  }

  async getPlanModules(planId: string): Promise<Array<{projectModuleId: string, projectName: string, moduleName: string, isEnabled: boolean}>> {
    try {
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.SUBSCRIPTION_PLANS_GET_MODULES}/${planId}/project-modules`
      );
      const data = response?.data || response;
      return Array.isArray(data) ? data : [];
    } catch (e) {
      throw e;
    }
  }
}

