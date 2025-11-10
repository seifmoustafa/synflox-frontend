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
  getPlansByModuleId(moduleId: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<SubscriptionPlansResponse>;
  getPlanFeaturesWithInheritance(planId: string): Promise<{
    ownFeatures: string[];
    allFeatures: string[];
    projectModules: Array<{projectModuleId: string, projectName: string, moduleName: string, isEnabled: boolean}>;
    inheritedProjectModules: Array<{projectModuleId: string, projectName: string, moduleName: string, isEnabled: boolean}>;
    parentPlan?: SubscriptionPlan;
    childPlans: SubscriptionPlan[];
  }>;
  getUpgradePath(planId: string): Promise<SubscriptionPlan[]>;
  setPlanParent(planId: string, parentPlanId?: string): Promise<SubscriptionPlan>;
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

  async getPlansByModuleId(moduleId: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<SubscriptionPlansResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      
      const url = `/subscription-plans/by-module/${moduleId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await this.apiService.get(url);
      return SubscriptionPlanMapper.handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async getPlanFeaturesWithInheritance(planId: string): Promise<{
    ownFeatures: string[];
    allFeatures: string[];
    projectModules: Array<{projectModuleId: string, projectName: string, moduleName: string, isEnabled: boolean}>;
    inheritedProjectModules: Array<{projectModuleId: string, projectName: string, moduleName: string, isEnabled: boolean}>;
    parentPlan?: SubscriptionPlan;
    childPlans: SubscriptionPlan[];
  }> {
    try {
      const response = await this.apiService.get<any>(`/subscription-plans/${planId}/features-with-inheritance`);
      return {
        ownFeatures: response.ownFeatures || [],
        allFeatures: response.allFeatures || [],
        projectModules: response.projectModules || [],
        inheritedProjectModules: response.inheritedProjectModules || [],
        parentPlan: response.parentPlan ? SubscriptionPlanMapper.fromJson(response.parentPlan) : undefined,
        childPlans: (response.childPlans || []).map((plan: any) => SubscriptionPlanMapper.fromJson(plan))
      };
    } catch (error) {
      throw error;
    }
  }

  async getUpgradePath(planId: string): Promise<SubscriptionPlan[]> {
    try {
      const response = await this.apiService.get<any[]>(`/subscription-plans/${planId}/upgrade-path`);
      return (response || []).map((plan: any) => SubscriptionPlanMapper.fromJson(plan));
    } catch (error) {
      throw error;
    }
  }

  async setPlanParent(planId: string, parentPlanId?: string): Promise<SubscriptionPlan> {
    try {
      const response = await this.apiService.put<any>(`/subscription-plans/${planId}/parent`, {
        parentPlanId: parentPlanId || null
      });
      return SubscriptionPlanMapper.fromJson(response);
    } catch (error) {
      throw error;
    }
  }
}

