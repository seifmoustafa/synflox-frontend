import { Dashboard, DashboardMapper, DashboardResponse } from '@/domain';
import { IApiService } from './api.service';
import { INotificationService } from './notification.service';

/**
 * Dashboard Service Interface
 * Provides methods for fetching dashboard data and analytics
 */
export interface IDashboardService {
  getDashboard(): Promise<Dashboard>;
  refreshDashboard(): Promise<Dashboard>;
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
}
