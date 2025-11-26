/**
 * Subscription Service
 * Handles all subscription-related API operations
 * - CRUD operations (Create, GetById)
 * - Query operations (GetActive, GetByCompany, GetStatus, GetHistory, GetAnalytics)
 * - Lifecycle operations (Renew, Upgrade, Cancel, Suspend, Resume, Pause, Extend, Reactivate)
 */

import { IApiService } from "./api.service";
import { INotificationService } from "./notification.service";
import {
  Subscription,
  SubscriptionStatus,
  CreateSubscriptionRequest,
  UpgradeSubscriptionRequest,
  RenewSubscriptionRequest,
  ExtendSubscriptionRequest,
  SubscriptionActionRequest,
  SubscriptionMapper,
  SubscriptionsResponse,
  CompanySubscriptionsResponse,
  UpgradeResponse,
} from "@/domain";
import { API_ENDPOINTS } from "@/config/api-endpoints";

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

export interface ISubscriptionService {
  // CRUD Operations
  createSubscription(request: CreateSubscriptionRequest): Promise<Subscription>;
  getSubscriptionById(id: string): Promise<Subscription>;
  getAllSubscriptions(page: number, pageSize: number, search?: string): Promise<{ data: Subscription[]; pagination: any }>;
  
  // Query Operations
  getActiveSubscription(companyId: string): Promise<Subscription | null>;
  getCompanySubscriptions(companyId: string): Promise<Subscription[]>;
  getSubscriptionStatus(id: string): Promise<SubscriptionStatus>;
  getSubscriptionHistory(id: string): Promise<any[]>;
  getSubscriptionAnalytics(id: string, fromDate?: Date, toDate?: Date): Promise<any>;
  
  // Lifecycle Operations
  renewSubscription(request: RenewSubscriptionRequest): Promise<Subscription>;
  upgradeSubscription(request: UpgradeSubscriptionRequest): Promise<UpgradeResponse>;
  cancelSubscription(request: SubscriptionActionRequest, lang?: string): Promise<{ message: string }>;
  suspendSubscription(request: SubscriptionActionRequest, lang?: string): Promise<{ message: string }>;
  resumeSubscription(request: SubscriptionActionRequest, lang?: string): Promise<{ message: string }>;
  pauseSubscription(request: SubscriptionActionRequest, lang?: string): Promise<{ message: string }>;
  unpauseSubscription(request: SubscriptionActionRequest, lang?: string): Promise<{ message: string }>;
  stopTrial(request: SubscriptionActionRequest, lang?: string): Promise<{ message: string }>;
  extendSubscription(request: ExtendSubscriptionRequest): Promise<Subscription>;
  reactivateSubscription(request: SubscriptionActionRequest, lang?: string): Promise<{ message: string }>;
}

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

export class SubscriptionService implements ISubscriptionService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  async createSubscription(request: CreateSubscriptionRequest): Promise<Subscription> {
    try {
      if (!request.isValid) {
        throw new Error("Invalid subscription request");
      }

      const response = await this.apiService.post(
        API_ENDPOINTS.SUBSCRIPTIONS.CREATE,
        request.toJson()
      );

      const subscription = SubscriptionMapper.handleApiResponse(response);

      this.notificationService.success(
        "Subscription Created",
        `Subscription created successfully for plan ${subscription.planName}`
      );

      return subscription;
    } catch (error: any) {
      this.notificationService.error(
        "Create Failed",
        error.message || "Failed to create subscription"
      );
      throw error;
    }
  }

  async getAllSubscriptions(page: number = 1, pageSize: number = 20, search?: string): Promise<{ data: Subscription[]; pagination: any }> {
    try {
      const params: any = { page, pageSize };
      if (search) params.search = search;

      console.log("🌐 Service: Making API call with params:", params);
      const response = await this.apiService.get(
        API_ENDPOINTS.SUBSCRIPTIONS.BASE,
        params
      );
      console.log("🌐 Service: Raw API response:", response);

      const result = SubscriptionMapper.handleGetAllResponse(response);
      console.log("🌐 Service: Mapped result:", result);
      
      const finalResult = {
        data: result.data,
        pagination: result.pagination || { itemsCount: 0, pageSize: pageSize, page: page, pagesCount: 1 }
      };
      console.log("🌐 Service: Final result:", finalResult);
      
      return finalResult;
    } catch (error: any) {
      console.error("🌐 Service: Error:", error);
      this.notificationService.error(
        "Load Failed",
        error.message || "Failed to load subscriptions"
      );
      throw error;
    }
  }

  async getSubscriptionById(id: string): Promise<Subscription> {
    try {
      const response = await this.apiService.get(
        API_ENDPOINTS.SUBSCRIPTIONS.BY_ID(id)
      );

      return SubscriptionMapper.handleApiResponse(response);
    } catch (error: any) {
      this.notificationService.error(
        "Fetch Failed",
        error.message || "Failed to fetch subscription"
      );
      throw error;
    }
  }

  // ============================================================================
  // QUERY OPERATIONS
  // ============================================================================

  async getActiveSubscription(companyId: string): Promise<Subscription | null> {
    try {
      const response = await this.apiService.get(
        API_ENDPOINTS.SUBSCRIPTIONS.GET_ACTIVE_BY_COMPANY(companyId)
      );

      return response ? SubscriptionMapper.handleApiResponse(response) : null;
    } catch (error: any) {
      // Don't show error notification for "not found" - it's expected
      if (error.status === 404) {
        return null;
      }

      this.notificationService.error(
        "Fetch Failed",
        error.message || "Failed to fetch active subscription"
      );
      throw error;
    }
  }

  async getCompanySubscriptions(companyId: string): Promise<Subscription[]> {
    try {
      const response = await this.apiService.get(
        API_ENDPOINTS.SUBSCRIPTIONS.GET_ALL_BY_COMPANY(companyId)
      );

      const result = SubscriptionMapper.handleGetByCompanyResponse(response);
      return result.data;
    } catch (error: any) {
      this.notificationService.error(
        "Fetch Failed",
        error.message || "Failed to fetch company subscriptions"
      );
      throw error;
    }
  }

  async getSubscriptionStatus(id: string): Promise<SubscriptionStatus> {
    try {
      const response = await this.apiService.get(
        API_ENDPOINTS.SUBSCRIPTIONS.GET_STATUS(id)
      );

      return SubscriptionMapper.handleStatusResponse(response);
    } catch (error: any) {
      this.notificationService.error(
        "Fetch Failed",
        error.message || "Failed to fetch subscription status"
      );
      throw error;
    }
  }

  async getSubscriptionHistory(id: string): Promise<any[]> {
    try {
      const response = await this.apiService.get(
        API_ENDPOINTS.SUBSCRIPTIONS.GET_HISTORY(id)
      );

      return SubscriptionMapper.handleHistoryResponse(response);
    } catch (error: any) {
      this.notificationService.error(
        "Fetch Failed",
        error.message || "Failed to fetch subscription history"
      );
      throw error;
    }
  }

  async getSubscriptionAnalytics(id: string, fromDate?: Date, toDate?: Date): Promise<any> {
    try {
      const params: any = {};
      if (fromDate) params.fromDate = fromDate.toISOString();
      if (toDate) params.toDate = toDate.toISOString();

      const response = await this.apiService.get(
        API_ENDPOINTS.SUBSCRIPTIONS.GET_ANALYTICS(id),
        params
      );

      return SubscriptionMapper.handleAnalyticsResponse(response);
    } catch (error: any) {
      this.notificationService.error(
        "Fetch Failed",
        error.message || "Failed to fetch subscription analytics"
      );
      throw error;
    }
  }

  // ============================================================================
  // LIFECYCLE OPERATIONS
  // ============================================================================

  async renewSubscription(request: RenewSubscriptionRequest): Promise<Subscription> {
    try {
      if (!request.isValid) {
        throw new Error("Invalid renew request");
      }

      const response = await this.apiService.put(
        API_ENDPOINTS.SUBSCRIPTIONS.RENEW(request.id),
        request.toJson()
      );

      const subscription = SubscriptionMapper.handleApiResponse(response);

      this.notificationService.success(
        "Subscription Renewed",
        `Subscription renewed successfully`
      );

      return subscription;
    } catch (error: any) {
      this.notificationService.error(
        "Renew Failed",
        error.message || "Failed to renew subscription"
      );
      throw error;
    }
  }

  async upgradeSubscription(request: UpgradeSubscriptionRequest): Promise<UpgradeResponse> {
    try {
      if (!request.isValid) {
        throw new Error("Invalid upgrade request");
      }

      const response = await this.apiService.put(
        API_ENDPOINTS.SUBSCRIPTIONS.UPGRADE(request.id),
        request.toJson()
      );

      const upgradeResponse = SubscriptionMapper.handleUpgradeResponse(response);

      this.notificationService.success(
        "Subscription Upgraded",
        upgradeResponse.summary.message
      );

      return upgradeResponse;
    } catch (error: any) {
      this.notificationService.error(
        "Upgrade Failed",
        error.message || "Failed to upgrade subscription"
      );
      throw error;
    }
  }

  async cancelSubscription(request: SubscriptionActionRequest, lang?: string): Promise<{ message: string }> {
    try {
      if (!request.isValid) {
        throw new Error("Invalid cancel request");
      }

      const url = lang 
        ? `${API_ENDPOINTS.SUBSCRIPTIONS.CANCEL(request.id)}?lang=${lang}` 
        : API_ENDPOINTS.SUBSCRIPTIONS.CANCEL(request.id);
      const response = await this.apiService.put(url, request.toJson());

      const result = SubscriptionMapper.handleActionResponse(response);

      this.notificationService.warning(
        "Subscription Cancelled",
        result.message
      );

      return result;
    } catch (error: any) {
      this.notificationService.error(
        "Cancel Failed",
        error.message || "Failed to cancel subscription"
      );
      throw error;
    }
  }

  async suspendSubscription(request: SubscriptionActionRequest, lang?: string): Promise<{ message: string }> {
    try {
      if (!request.isValid) {
        throw new Error("Invalid suspend request");
      }

      const url = lang 
        ? `${API_ENDPOINTS.SUBSCRIPTIONS.SUSPEND(request.id)}?lang=${lang}` 
        : API_ENDPOINTS.SUBSCRIPTIONS.SUSPEND(request.id);
      const response = await this.apiService.put(url, request.toJson());

      const result = SubscriptionMapper.handleActionResponse(response);

      this.notificationService.warning(
        "Subscription Suspended",
        result.message
      );

      return result;
    } catch (error: any) {
      this.notificationService.error(
        "Suspend Failed",
        error.message || "Failed to suspend subscription"
      );
      throw error;
    }
  }

  async resumeSubscription(request: SubscriptionActionRequest, lang?: string): Promise<{ message: string }> {
    try {
      if (!request.isValid) {
        throw new Error("Invalid resume request");
      }

      const url = lang 
        ? `${API_ENDPOINTS.SUBSCRIPTIONS.RESUME(request.id)}?lang=${lang}` 
        : API_ENDPOINTS.SUBSCRIPTIONS.RESUME(request.id);
      const response = await this.apiService.put(url, request.toJson());

      const result = SubscriptionMapper.handleActionResponse(response);

      this.notificationService.success(
        "Subscription Resumed",
        result.message
      );

      return result;
    } catch (error: any) {
      this.notificationService.error(
        "Resume Failed",
        error.message || "Failed to resume subscription"
      );
      throw error;
    }
  }

  async pauseSubscription(request: SubscriptionActionRequest, lang?: string): Promise<{ message: string }> {
    try {
      if (!request.isValid) {
        throw new Error("Invalid pause request");
      }

      const url = lang 
        ? `${API_ENDPOINTS.SUBSCRIPTIONS.PAUSE(request.id)}?lang=${lang}` 
        : API_ENDPOINTS.SUBSCRIPTIONS.PAUSE(request.id);
      const response = await this.apiService.put(url, request.toJson());

      const result = SubscriptionMapper.handleActionResponse(response);

      this.notificationService.info(
        "Subscription Paused",
        result.message
      );

      return result;
    } catch (error: any) {
      this.notificationService.error(
        "Pause Failed",
        error.message || "Failed to pause subscription"
      );
      throw error;
    }
  }

  async unpauseSubscription(request: SubscriptionActionRequest, lang?: string): Promise<{ message: string }> {
    try {
      if (!request.isValid) {
        throw new Error("Invalid unpause request");
      }

      const url = lang 
        ? `${API_ENDPOINTS.SUBSCRIPTIONS.UNPAUSE(request.id)}?lang=${lang}` 
        : API_ENDPOINTS.SUBSCRIPTIONS.UNPAUSE(request.id);
      const response = await this.apiService.put(url, request.toJson());

      const result = SubscriptionMapper.handleActionResponse(response);

      this.notificationService.success(
        "Subscription Unpaused",
        result.message
      );

      return result;
    } catch (error: any) {
      this.notificationService.error(
        "Unpause Failed",
        error.message || "Failed to unpause subscription"
      );
      throw error;
    }
  }

  async stopTrial(request: SubscriptionActionRequest, lang?: string): Promise<{ message: string }> {
    try {
      if (!request.isValid) {
        throw new Error("Invalid stop trial request");
      }

      const url = lang 
        ? `${API_ENDPOINTS.SUBSCRIPTIONS.STOP_TRIAL(request.id)}?lang=${lang}` 
        : API_ENDPOINTS.SUBSCRIPTIONS.STOP_TRIAL(request.id);
      const response = await this.apiService.put(url, request.toJson());

      const result = SubscriptionMapper.handleActionResponse(response);

      this.notificationService.success(
        "Trial Stopped",
        result.message
      );

      return result;
    } catch (error: any) {
      this.notificationService.error(
        "Stop Trial Failed",
        error.message || "Failed to stop trial"
      );
      throw error;
    }
  }

  async extendSubscription(request: ExtendSubscriptionRequest, lang?: string): Promise<Subscription> {
    try {
      if (!request.isValid) {
        throw new Error("Invalid extend request");
      }

      const url = lang 
        ? `${API_ENDPOINTS.SUBSCRIPTIONS.EXTEND(request.id)}?lang=${lang}` 
        : API_ENDPOINTS.SUBSCRIPTIONS.EXTEND(request.id);
      const response = await this.apiService.put(url, request.toJson());

      const subscription = SubscriptionMapper.handleApiResponse(response);

      this.notificationService.success(
        "Subscription Extended",
        `Subscription extended by ${request.extensionDays} days`
      );

      return subscription;
    } catch (error: any) {
      this.notificationService.error(
        "Extend Failed",
        error.message || "Failed to extend subscription"
      );
      throw error;
    }
  }

  async reactivateSubscription(request: SubscriptionActionRequest, lang?: string): Promise<{ message: string }> {
    try {
      if (!request.isValid) {
        throw new Error("Invalid reactivate request");
      }

      const url = lang 
        ? `${API_ENDPOINTS.SUBSCRIPTIONS.REACTIVATE(request.id)}?lang=${lang}` 
        : API_ENDPOINTS.SUBSCRIPTIONS.REACTIVATE(request.id);
      const response = await this.apiService.put(url, request.toJson());

      const result = SubscriptionMapper.handleActionResponse(response);

      this.notificationService.success(
        "Subscription Reactivated",
        result.message
      );

      return result;
    } catch (error: any) {
      this.notificationService.error(
        "Reactivate Failed",
        error.message || "Failed to reactivate subscription"
      );
      throw error;
    }
  }
}
