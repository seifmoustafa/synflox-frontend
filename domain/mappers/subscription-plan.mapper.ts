/**
 * Subscription Plan Mappers
 * 
 * Handles conversion between subscription plan domain models and external data formats.
 */

import {
  SubscriptionPlan,
  BillingCycle,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
  type SubscriptionPlanData,
  type CreateSubscriptionPlanRequestData,
  type UpdateSubscriptionPlanRequestData,
} from '../models/subscription-plan.model';
import type { PaginationInfo } from '@/lib/pagination';

export interface SubscriptionPlansResponse {
  data: SubscriptionPlan[];
  pagination: PaginationInfo;
}

export class SubscriptionPlanMapper {
  /**
   * Convert JSON/API response to SubscriptionPlan domain model
   */
  static fromJson(json: any): SubscriptionPlan {
    return new SubscriptionPlan({
      id: json.id || '',
      name: json.name || '',
      description: json.description,
      price: json.price || 0,
      currency: json.currency || 'USD',
      billingCycle: json.billingCycle || BillingCycle.Monthly,
      isActive: json.isActive ?? true,
      features: json.features,
      maxCompanies: json.maxCompanies,
      createdAt: json.createdAt || json.createdTimestamp || new Date().toISOString(),
      updatedAt: json.updatedAt || json.updatedTimestamp,
    });
  }

  /**
   * Convert SubscriptionPlan domain model to JSON for API requests
   */
  static toJson(plan: SubscriptionPlan): any {
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      billingCycle: plan.billingCycle,
      isActive: plan.isActive,
      features: plan.features,
      maxCompanies: plan.maxCompanies,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }

  /**
   * Convert CreateSubscriptionPlanRequest domain model to JSON for API requests
   */
  static createRequestToJson(request: CreateSubscriptionPlanRequest): any {
    const json: any = {
      name: request.name,
      description: request.description,
      price: request.price,
      currency: request.currency,
      billingCycle: request.billingCycle,
      isActive: request.isActive,
    };
    if (request.features !== undefined) {
      json.features = JSON.stringify(request.features);
    }
    if (request.maxCompanies !== undefined) {
      json.maxCompanies = request.maxCompanies;
    }
    return json;
  }

  /**
   * Convert UpdateSubscriptionPlanRequest domain model to JSON for API requests
   */
  static updateRequestToJson(request: UpdateSubscriptionPlanRequest): any {
    const json: any = {};
    if (request.name !== undefined) json.name = request.name;
    if (request.description !== undefined) json.description = request.description;
    if (request.price !== undefined) json.price = request.price;
    if (request.currency !== undefined) json.currency = request.currency;
    if (request.billingCycle !== undefined) json.billingCycle = request.billingCycle;
    if (request.isActive !== undefined) json.isActive = request.isActive;
    if (request.features !== undefined) json.features = JSON.stringify(request.features);
    if (request.maxCompanies !== undefined) json.maxCompanies = request.maxCompanies;
    return json;
  }

  /**
   * Handle different API response formats and convert to SubscriptionPlansResponse
   */
  static handleApiResponse(response: any): SubscriptionPlansResponse {
    // Handle format: { data: [...], pagination: {...} } (direct array with pagination)
    if (response && typeof response === 'object' && 'data' in response && 'pagination' in response) {
      if (Array.isArray(response.data)) {
        const pagination = response.pagination || {};
        return {
          data: response.data.map((item: any) => this.fromJson(item)),
          pagination: {
            itemsCount: pagination.itemsCount || 0,
            pageSize: pagination.pageSize || 10,
            page: pagination.currentPage || pagination.page || 1,
            pagesCount: pagination.pagesCount || 0,
          }
        };
      }
    }

    // Handle SYNFLOX backend response format: { statusCode, message, data: { plans, pagination } }
    if (response && typeof response === 'object' && 'data' in response) {
      const data = response.data;
      if (data && typeof data === 'object') {
        if (Array.isArray(data)) {
          const pagination = response.pagination || {};
          return {
            data: data.map((item: any) => this.fromJson(item)),
            pagination: {
              itemsCount: pagination.itemsCount || pagination.totalItems || data.length,
              pageSize: pagination.pageSize || 10,
              page: pagination.currentPage || pagination.page || 1,
              pagesCount: pagination.pagesCount || pagination.totalPages || 1,
            }
          };
        }
        if ('plans' in data || 'subscriptionPlans' in data) {
          const plans = data.plans || data.subscriptionPlans || [];
          const pagination = data.pagination || {};
          return {
            data: Array.isArray(plans) 
              ? plans.map((item: any) => this.fromJson(item))
              : [],
            pagination: {
              itemsCount: pagination.itemsCount || pagination.totalItems || 0,
              pageSize: pagination.pageSize || 10,
              page: pagination.currentPage || pagination.page || 1,
              pagesCount: pagination.pagesCount || pagination.totalPages || 0,
            }
          };
        }
      }
    }

    // Handle direct array response
    if (Array.isArray(response)) {
      return {
        data: response.map((item: any) => this.fromJson(item)),
        pagination: {
          itemsCount: response.length,
          pageSize: response.length,
          page: 1,
          pagesCount: 1,
        }
      };
    }

    // Fallback for unexpected response format
    return {
      data: [],
      pagination: {
        itemsCount: 0,
        pageSize: 10,
        page: 1,
        pagesCount: 0,
      }
    };
  }
}

