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
  RecentActivityData
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
      data.active,
      data.suspended,
      data.expired,
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
      data.suspendedCompanies,
      data.expiredCompanies,
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
   * Handles API response and maps to Dashboard domain model
   */
  static handleApiResponse(response: DashboardResponse): Dashboard {
    if (!response.succeeded || !response.data) {
      throw new Error(response.message || 'Failed to load dashboard data');
    }

    return this.fromJson(response.data);
  }
}
