import {
  Dashboard,
  DashboardData,
  OverviewStats,
  OverviewStatsData,
  CompanyStats,
  CompanyStatsData,
  SubscriptionStats,
  SubscriptionStatsData,
  AdminStats,
  AdminStatsData,
  Alerts,
  AlertsData,
  RecentActivity,
  RecentActivityData,
  TimeSeries,
  TimeSeriesData,
  Revenue,
  RevenueData,
  Lifecycle,
  LifecycleData,
  Trends,
  TrendsData,
  EntityTrend,
  EntityTrendData
} from '../models/dashboard.model';

// Response interface from API
export interface DashboardResponse {
  statusCode: number;
  message: string;
  data: DashboardData;
  succeeded: boolean;
  errors: string[] | null;
}

export class DashboardMapper {
  /**
   * Maps API response to Dashboard domain model
   */
  static fromJson(data: DashboardData): Dashboard {
    return new Dashboard(
      this.mapOverviewStats(data.overview),
      this.mapCompanyStats(data.companies),
      this.mapSubscriptionStats(data.subscriptions),
      this.mapAdminStats(data.admins),
      this.mapAlerts(data.alerts),
      this.mapRecentActivity(data.recentActivity),
      this.mapTimeSeries(data.timeSeries),
      this.mapRevenue(data.revenue),
      this.mapLifecycle(data.lifecycle),
      this.mapTrends(data.trends),
      new Date(data.generatedAtUtc)
    );
  }

  /**
   * Maps overview stats data to domain model
   */
  private static mapOverviewStats(data: OverviewStatsData): OverviewStats {
    return new OverviewStats(
      data.totalCompanies,
      data.activeCompanies,
      data.totalSubscriptions,
      data.activeSubscriptions,
      data.totalAdmins,
      data.activeAdmins
    );
  }

  /**
   * Maps company stats data to domain model
   */
  private static mapCompanyStats(data: CompanyStatsData): CompanyStats {
    return new CompanyStats(
      data.total,
      data.activeLicense,
      data.suspendedLicense,
      data.expiredLicense,
      data.createdToday,
      data.createdThisWeek,
      data.createdThisMonth
    );
  }

  /**
   * Maps subscription stats data to domain model
   */
  private static mapSubscriptionStats(data: SubscriptionStatsData): SubscriptionStats {
    return new SubscriptionStats(
      data.total,
      data.active,
      data.trial,
      data.expired,
      data.suspended,
      data.expiringWithin7Days,
      data.expiringWithin30Days,
      data.createdToday,
      data.createdThisWeek,
      data.createdThisMonth,
      data.byPlan
    );
  }

  /**
   * Maps admin stats data to domain model
   */
  private static mapAdminStats(data: AdminStatsData): AdminStats {
    return new AdminStats(
      data.total,
      data.active,
      data.inactive,
      data.createdToday,
      data.createdThisWeek,
      data.createdThisMonth,
      data.byType
    );
  }

  /**
   * Maps alerts data to domain model
   */
  private static mapAlerts(data: AlertsData): Alerts {
    return new Alerts(
      data.subscriptionsExpiringToday,
      data.subscriptionsExpiringThisWeek,
      data.companiesWithSuspendedLicense,
      data.companiesWithExpiredLicense,
      data.inactiveAdmins,
      data.messages
    );
  }

  /**
   * Maps recent activity data to domain model
   */
  private static mapRecentActivity(data: RecentActivityData): RecentActivity {
    return new RecentActivity(
      data.companiesLast24Hours,
      data.subscriptionsLast24Hours,
      data.adminsLast24Hours
    );
  }

  /**
   * Maps time-series data to domain model
   */
  private static mapTimeSeries(data: TimeSeriesData): TimeSeries {
    return new TimeSeries(data.last30Days);
  }

  /**
   * Maps revenue data to domain model
   */
  private static mapRevenue(data: RevenueData): Revenue {
    return new Revenue(
      data.mrr,
      data.arr,
      data.totalRevenue,
      data.arpc,
      data.revenueByPlan,
      data.revenueByCurrency,
      data.monthlyRevenue,
      data.monthOverMonthGrowth,
      data.payingCustomers,
      data.trialSubscriptions
    );
  }

  /**
   * Maps lifecycle data to domain model
   */
  private static mapLifecycle(data: LifecycleData): Lifecycle {
    return new Lifecycle(
      data.stages,
      data.churn,
      data.healthDistribution,
      data.transitions
    );
  }

  /**
   * Maps trends data to domain model
   */
  private static mapTrends(data: TrendsData): Trends {
    return new Trends(
      this.mapEntityTrend(data.companies),
      this.mapEntityTrend(data.subscriptions),
      this.mapEntityTrend(data.admins),
      data.systemHealthTrend,
      data.growthVelocity
    );
  }

  /**
   * Maps entity trend data to domain model
   */
  private static mapEntityTrend(data: EntityTrendData): EntityTrend {
    return new EntityTrend(
      data.current,
      data.previous,
      data.changePercent,
      data.direction,
      data.weekOverWeekChange,
      data.monthOverMonthChange,
      data.forecast30Days,
      data.dailyGrowthRate
    );
  }

  /**
   * Handles API response and maps to Dashboard domain model
   * Supports multiple response formats from backend
   */
  static handleApiResponse(response: any): Dashboard {
    // Log the response for debugging
    console.log('[DashboardMapper] Raw API Response:', JSON.stringify(response, null, 2));
    
    // Handle null/undefined
    if (!response) {
      throw new Error('Dashboard response is null or undefined');
    }
    
    // Format 1: Has 'data' property (nested response)
    if (response.data) {
      console.log('[DashboardMapper] Detected nested format with data property');
      // Check if it's successful (if succeeded field exists)
      if (response.succeeded !== undefined && !response.succeeded) {
        throw new Error(response.message || 'Failed to load dashboard data');
      }
      // Use the nested data
      return this.fromJson(response.data);
    }
    
    // Format 2: Direct DashboardDto response (unwrapped)
    if (response.overview || response.companies || response.subscriptions) {
      console.log('[DashboardMapper] Detected direct DashboardDto format');
      return this.fromJson(response as DashboardData);
    }
    
    // Log the structure we received
    console.error('[DashboardMapper] Unexpected response structure:', {
      keys: Object.keys(response),
      hasSucceeded: 'succeeded' in response,
      hasData: 'data' in response,
      hasOverview: 'overview' in response,
      hasCompanies: 'companies' in response,
      hasSubscriptions: 'subscriptions' in response,
    });
    
    throw new Error('Invalid dashboard response format - see console for details');
  }
}
