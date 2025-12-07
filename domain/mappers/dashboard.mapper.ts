/**
 * Dashboard Mappers
 * 
 * Handles conversion between dashboard API responses and domain models.
 */

import {
  // Overview
  OverviewDashboard,
  type OverviewDashboardData,
  // Companies
  CompaniesDashboard,
  type CompaniesDashboardData,
  // Subscriptions
  SubscriptionsDashboard,
  type SubscriptionsDashboardData,
  // Revenue
  RevenueDashboard,
  type RevenueDashboardData,
  CurrencyRates,
  type CurrencyRatesData,
  // Activity
  ActivityDashboard,
  type ActivityDashboardData,
  // Alerts
  AlertsDashboard,
  type AlertsDashboardData,
  AlertItem,
  type AlertItemData,
  DismissAlertRequest,
  MarkAlertReadRequest,
} from '../models/dashboard';

/**
 * Dashboard Mapper
 * 
 * Converts API responses to domain models for all dashboard types.
 */
export class DashboardMapper {
  // ===========================================================================
  // Overview Dashboard
  // ===========================================================================

  /**
   * Convert API response to OverviewDashboard domain model
   */
  static overviewFromJson(json: any): OverviewDashboard {
    return new OverviewDashboard(json as OverviewDashboardData);
  }

  /**
   * Handle API response for overview dashboard
   */
  static handleOverviewResponse(response: any): OverviewDashboard {
    // Handle wrapped response: { statusCode, message, data: {...} }
    if (response && typeof response === 'object' && 'data' in response && response.data) {
      return this.overviewFromJson(response.data);
    }
    // Handle direct response
    return this.overviewFromJson(response);
  }

  // ===========================================================================
  // Companies Dashboard
  // ===========================================================================

  /**
   * Convert API response to CompaniesDashboard domain model
   */
  static companiesFromJson(json: any): CompaniesDashboard {
    return new CompaniesDashboard(json as CompaniesDashboardData);
  }

  /**
   * Handle API response for companies dashboard
   */
  static handleCompaniesResponse(response: any): CompaniesDashboard {
    if (response && typeof response === 'object' && 'data' in response && response.data) {
      return this.companiesFromJson(response.data);
    }
    return this.companiesFromJson(response);
  }

  // ===========================================================================
  // Subscriptions Dashboard
  // ===========================================================================

  /**
   * Convert API response to SubscriptionsDashboard domain model
   */
  static subscriptionsFromJson(json: any): SubscriptionsDashboard {
    return new SubscriptionsDashboard(json as SubscriptionsDashboardData);
  }

  /**
   * Handle API response for subscriptions dashboard
   */
  static handleSubscriptionsResponse(response: any): SubscriptionsDashboard {
    if (response && typeof response === 'object' && 'data' in response && response.data) {
      return this.subscriptionsFromJson(response.data);
    }
    return this.subscriptionsFromJson(response);
  }

  // ===========================================================================
  // Revenue Dashboard
  // ===========================================================================

  /**
   * Convert API response to RevenueDashboard domain model
   */
  static revenueFromJson(json: any): RevenueDashboard {
    return new RevenueDashboard(json as RevenueDashboardData);
  }

  /**
   * Handle API response for revenue dashboard
   */
  static handleRevenueResponse(response: any): RevenueDashboard {
    if (response && typeof response === 'object' && 'data' in response && response.data) {
      return this.revenueFromJson(response.data);
    }
    return this.revenueFromJson(response);
  }
  
  // ===========================================================================
  // Exchange Rates
  // ===========================================================================
  
  /**
   * Convert API response to CurrencyRates domain model
   */
  static exchangeRatesFromJson(json: any): CurrencyRates {
    return new CurrencyRates(json as CurrencyRatesData);
  }
  
  /**
   * Handle API response for exchange rates
   */
  static handleExchangeRatesResponse(response: any): CurrencyRates {
    if (response && typeof response === 'object' && 'data' in response && response.data) {
      return this.exchangeRatesFromJson(response.data);
    }
    return this.exchangeRatesFromJson(response);
  }

  // ===========================================================================
  // Activity Dashboard
  // ===========================================================================

  /**
   * Convert API response to ActivityDashboard domain model
   */
  static activityFromJson(json: any): ActivityDashboard {
    return new ActivityDashboard(json as ActivityDashboardData);
  }

  /**
   * Handle API response for activity dashboard
   */
  static handleActivityResponse(response: any): ActivityDashboard {
    if (response && typeof response === 'object' && 'data' in response && response.data) {
      return this.activityFromJson(response.data);
    }
    return this.activityFromJson(response);
  }

  // ===========================================================================
  // Alerts Dashboard
  // ===========================================================================

  /**
   * Convert API response to AlertsDashboard domain model
   */
  static alertsFromJson(json: any): AlertsDashboard {
    return new AlertsDashboard(json as AlertsDashboardData);
  }

  /**
   * Handle API response for alerts dashboard
   */
  static handleAlertsResponse(response: any): AlertsDashboard {
    if (response && typeof response === 'object' && 'data' in response && response.data) {
      return this.alertsFromJson(response.data);
    }
    return this.alertsFromJson(response);
  }

  /**
   * Convert single alert from JSON
   */
  static alertFromJson(json: any): AlertItem {
    return new AlertItem(json as AlertItemData);
  }

  // ===========================================================================
  // Alert Actions
  // ===========================================================================

  /**
   * Convert DismissAlertRequest to JSON for API
   */
  static dismissAlertRequestToJson(request: DismissAlertRequest): any {
    return {
      alertId: request.alertId,
      reason: request.reason,
    };
  }

  /**
   * Convert MarkAlertReadRequest to JSON for API
   */
  static markAlertReadRequestToJson(request: MarkAlertReadRequest): any {
    return {
      alertId: request.alertId,
    };
  }

  // ===========================================================================
  // Utility Methods
  // ===========================================================================

  /**
   * Handle generic success response
   */
  static handleSuccessResponse(response: any): { success: boolean; message: string } {
    if (response && typeof response === 'object') {
      return {
        success: response.statusCode === 200 || response.success === true,
        message: response.message || 'Operation completed successfully',
      };
    }
    return { success: true, message: 'Operation completed successfully' };
  }

  /**
   * Extract error message from API error response
   */
  static extractErrorMessage(error: any): string {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }
}
