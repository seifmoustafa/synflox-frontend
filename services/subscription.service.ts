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
  getSubscriptionById(id: string, currency?: string): Promise<Subscription>;
  getAllSubscriptions(page: number, pageSize: number, search?: string): Promise<{ data: Subscription[]; pagination: any }>;
  
  // Query Operations
  getActiveSubscription(companyId: string): Promise<Subscription | null>;
  getCompanySubscriptions(companyId: string, currency?: string): Promise<Subscription[]>;
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
      // Note: Success notification handled by generic CRUD viewmodel
      return subscription;
    } catch (error: any) {
      // Note: Error notification handled by generic CRUD viewmodel
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
      throw error;
    }
  }

  async getSubscriptionById(id: string, currency?: string): Promise<Subscription> {
    try {
      const params = currency ? { currency } : undefined;
      const response = await this.apiService.get(
        API_ENDPOINTS.SUBSCRIPTIONS.BY_ID(id),
        params
      );

      return SubscriptionMapper.handleApiResponse(response);
    } catch (error: any) {
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

      throw error;
    }
  }

  async getCompanySubscriptions(companyId: string, currency?: string): Promise<Subscription[]> {
    try {
      const params = currency ? { currency } : undefined;
      const response = await this.apiService.get(
        API_ENDPOINTS.SUBSCRIPTIONS.GET_ALL_BY_COMPANY(companyId),
        params
      );

      const result = SubscriptionMapper.handleGetByCompanyResponse(response);
      return result.data;
    } catch (error: any) {
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
      // Note: Success notification handled by caller
      return subscription;
    } catch (error: any) {
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
      // Note: Success notification handled by caller
      return upgradeResponse;
    } catch (error: any) {
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
      // Note: Notification handled by caller
      return result;
    } catch (error: any) {
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
      // Note: Notification handled by caller
      return result;
    } catch (error: any) {
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
      // Note: Notification handled by caller
      return result;
    } catch (error: any) {
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
      // Note: Notification handled by caller
      return result;
    } catch (error: any) {
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
      // Note: Notification handled by caller
      return result;
    } catch (error: any) {
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
      // Note: Notification handled by caller
      return result;
    } catch (error: any) {
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
      // Note: Notification handled by caller
      return subscription;
    } catch (error: any) {
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
      // Note: Notification handled by caller
      return result;
    } catch (error: any) {
      throw error;
    }
  }
}
