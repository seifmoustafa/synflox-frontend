/**
 * Dashboard Service
 *
 * Handles dashboard data fetching from SYNFLOX backend API.
 * Provides methods for all dashboard pages: Overview, Companies, Subscriptions, Revenue, Activity, Alerts.
 */

import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import {
  OverviewDashboard,
  CompaniesDashboard,
  SubscriptionsDashboard,
  RevenueDashboard,
  ActivityDashboard,
  AlertsDashboard,
  DashboardMapper,
} from "@/domain";
import { API_ENDPOINTS } from "@/config/api-endpoints";

/**
 * Dashboard Service Interface
 */
export interface IDashboardService {
  // Dashboard data fetching
  getOverview(): Promise<OverviewDashboard>;
  getCompanies(): Promise<CompaniesDashboard>;
  getSubscriptions(): Promise<SubscriptionsDashboard>;
  getRevenue(): Promise<RevenueDashboard>;
  getActivity(): Promise<ActivityDashboard>;
  getAlerts(): Promise<AlertsDashboard>;
  
  // Alert actions
  dismissAlert(alertId: string): Promise<void>;
  markAlertAsRead(alertId: string): Promise<void>;
}

/**
 * Dashboard Service Implementation
 */
export class DashboardService implements IDashboardService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  // ===========================================================================
  // Dashboard Data Fetching
  // ===========================================================================

  /**
   * Get overview dashboard data (home page)
   */
  async getOverview(): Promise<OverviewDashboard> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.DASHBOARD.OVERVIEW
      );
      return DashboardMapper.handleOverviewResponse(response);
    } catch (error) {
      console.error('Failed to fetch overview dashboard:', error);
      throw error;
    }
  }

  /**
   * Get companies dashboard data
   */
  async getCompanies(): Promise<CompaniesDashboard> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.DASHBOARD.COMPANIES
      );
      return DashboardMapper.handleCompaniesResponse(response);
    } catch (error) {
      console.error('Failed to fetch companies dashboard:', error);
      throw error;
    }
  }

  /**
   * Get subscriptions dashboard data
   */
  async getSubscriptions(): Promise<SubscriptionsDashboard> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.DASHBOARD.SUBSCRIPTIONS
      );
      return DashboardMapper.handleSubscriptionsResponse(response);
    } catch (error) {
      console.error('Failed to fetch subscriptions dashboard:', error);
      throw error;
    }
  }

  /**
   * Get revenue dashboard data (SuperAdmin only)
   */
  async getRevenue(): Promise<RevenueDashboard> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.DASHBOARD.REVENUE
      );
      return DashboardMapper.handleRevenueResponse(response);
    } catch (error) {
      console.error('Failed to fetch revenue dashboard:', error);
      throw error;
    }
  }

  /**
   * Get activity dashboard data
   */
  async getActivity(): Promise<ActivityDashboard> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.DASHBOARD.ACTIVITY
      );
      return DashboardMapper.handleActivityResponse(response);
    } catch (error) {
      console.error('Failed to fetch activity dashboard:', error);
      throw error;
    }
  }

  /**
   * Get alerts dashboard data
   */
  async getAlerts(): Promise<AlertsDashboard> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.DASHBOARD.ALERTS
      );
      return DashboardMapper.handleAlertsResponse(response);
    } catch (error) {
      console.error('Failed to fetch alerts dashboard:', error);
      throw error;
    }
  }

  // ===========================================================================
  // Alert Actions
  // ===========================================================================

  /**
   * Dismiss an alert
   */
  async dismissAlert(alertId: string): Promise<void> {
    try {
      await this.apiService.post<any>(
        API_ENDPOINTS.DASHBOARD.DISMISS_ALERT.replace('{id}', alertId),
        {}
      );
      this.notificationService.success('Alert dismissed successfully');
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
      throw error;
    }
  }

  /**
   * Mark an alert as read
   */
  async markAlertAsRead(alertId: string): Promise<void> {
    try {
      await this.apiService.post<any>(
        API_ENDPOINTS.DASHBOARD.MARK_ALERT_READ.replace('{id}', alertId),
        {}
      );
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
      throw error;
    }
  }
}
