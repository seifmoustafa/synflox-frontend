import { Dashboard, DashboardMapper, DashboardResponse, CompanyStatsData, SubscriptionStatsData, AdminStatsData, AlertsData, RecentActivityData } from '@/domain';
import { IApiService } from './api.service';
import { INotificationService } from './notification.service';

/**
 * Dashboard Service Interface
 * Provides methods for fetching dashboard data and analytics
 */
export interface IDashboardService {
  getDashboard(): Promise<Dashboard>;
  refreshDashboard(): Promise<Dashboard>;
  getCompanyAnalytics(): Promise<CompanyStatsData>;
  getSubscriptionAnalytics(): Promise<SubscriptionStatsData>;
  getAdminAnalytics(): Promise<AdminStatsData>;
  getAlerts(): Promise<AlertsData>;
  getRecentActivity(): Promise<RecentActivityData>;
}

/**
 * Dashboard Service Implementation
 * Handles all dashboard-related API operations
 */
export class DashboardService implements IDashboardService {
  constructor(
    private readonly apiService: IApiService,
    private readonly notificationService: INotificationService
  ) {}

  /**
   * Fetches the main dashboard with all statistics
   */
  async getDashboard(): Promise<Dashboard> {
    try {
      const response = await this.apiService.get<DashboardResponse>('/dashboard');
      return DashboardMapper.handleApiResponse(response);
    } catch (error) {
      console.error('[DashboardService] Error loading dashboard:', error);
      this.notificationService.error('Failed to load dashboard data');
      throw error;
    }
  }

  /**
   * Refreshes the dashboard data
   */
  async refreshDashboard(): Promise<Dashboard> {
    try {
      const response = await this.apiService.get<DashboardResponse>('/dashboard');
      const dashboard = DashboardMapper.handleApiResponse(response);
      this.notificationService.success('Dashboard refreshed successfully');
      return dashboard;
    } catch (error) {
      this.notificationService.error('Failed to refresh dashboard');
      throw error;
    }
  }

  /**
   * Fetches detailed company analytics
   */
  async getCompanyAnalytics(): Promise<CompanyStatsData> {
    try {
      const response = await this.apiService.get<any>('/dashboard/companies');
      return response.data || response;
    } catch (error) {
      this.notificationService.error('Failed to load company analytics');
      throw error;
    }
  }

  /**
   * Fetches detailed subscription analytics
   */
  async getSubscriptionAnalytics(): Promise<SubscriptionStatsData> {
    try {
      const response = await this.apiService.get<any>('/dashboard/subscriptions');
      return response.data || response;
    } catch (error) {
      this.notificationService.error('Failed to load subscription analytics');
      throw error;
    }
  }

  /**
   * Fetches detailed admin analytics
   */
  async getAdminAnalytics(): Promise<AdminStatsData> {
    try {
      const response = await this.apiService.get<any>('/dashboard/admins');
      return response.data || response;
    } catch (error) {
      this.notificationService.error('Failed to load admin analytics');
      throw error;
    }
  }

  /**
   * Fetches system alerts
   */
  async getAlerts(): Promise<AlertsData> {
    try {
      const response = await this.apiService.get<any>('/dashboard/alerts');
      return response.data || response;
    } catch (error) {
      this.notificationService.error('Failed to load alerts');
      throw error;
    }
  }

  /**
   * Fetches recent activity
   */
  async getRecentActivity(): Promise<RecentActivityData> {
    try {
      const response = await this.apiService.get<any>('/dashboard/activity');
      return response.data || response;
    } catch (error) {
      this.notificationService.error('Failed to load recent activity');
      throw error;
    }
  }
}
