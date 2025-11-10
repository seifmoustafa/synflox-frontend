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
      price: typeof json.price === 'string' ? parseFloat(json.price) : (json.price || 0),
      currency: json.currency || 'USD',
      billingCycle: typeof json.billingCycle === 'string' ? parseInt(json.billingCycle) as BillingCycle : (json.billingCycle || BillingCycle.Monthly),
      isActive: json.isActive ?? true,
      features: json.features,
      maxCompanies: json.maxCompanies !== undefined && json.maxCompanies !== null ? (typeof json.maxCompanies === 'string' ? parseInt(json.maxCompanies) : json.maxCompanies) : null,
      planTier: typeof json.planTier === 'string' ? parseInt(json.planTier) : (json.planTier || 0),
      parentPlanId: json.parentPlanId,
      parentPlanName: json.parentPlanName,
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
      planTier: plan.planTier,
      parentPlanId: plan.parentPlanId,
      parentPlanName: plan.parentPlanName,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }

  /**
   * Convert form data (which may contain strings) to CreateSubscriptionPlanRequest
   * Handles type conversion from form values (strings) to proper types
   */
  static formDataToCreateRequest(formData: any): CreateSubscriptionPlanRequest {
    return new CreateSubscriptionPlanRequest({
      name: formData.name,
      description: formData.description,
      price: typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price,
      currency: formData.currency,
      billingCycle: typeof formData.billingCycle === 'string' ? parseInt(formData.billingCycle) as BillingCycle : formData.billingCycle,
      maxCompanies: formData.maxCompanies && formData.maxCompanies !== '' 
        ? (typeof formData.maxCompanies === 'string' ? parseInt(formData.maxCompanies) : formData.maxCompanies)
        : undefined,
      planTier: formData.planTier !== undefined && formData.planTier !== ''
        ? (typeof formData.planTier === 'string' ? parseInt(formData.planTier) : formData.planTier)
        : undefined,
      parentPlanId: formData.parentPlanId || undefined,
      isActive: formData.isActive,
    });
  }

  /**
   * Convert form data (which may contain strings) to UpdateSubscriptionPlanRequest
   * Handles type conversion from form values (strings) to proper types
   */
  static formDataToUpdateRequest(id: string, formData: any): UpdateSubscriptionPlanRequest {
    return new UpdateSubscriptionPlanRequest({
      id,
      name: formData.name,
      description: formData.description,
      price: formData.price !== undefined 
        ? (typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price)
        : undefined,
      currency: formData.currency,
      billingCycle: formData.billingCycle !== undefined
        ? (typeof formData.billingCycle === 'string' ? parseInt(formData.billingCycle) as BillingCycle : formData.billingCycle)
        : undefined,
      maxCompanies: formData.maxCompanies !== undefined && formData.maxCompanies !== ''
        ? (typeof formData.maxCompanies === 'string' ? parseInt(formData.maxCompanies) : formData.maxCompanies)
        : undefined,
      planTier: formData.planTier !== undefined && formData.planTier !== ''
        ? (typeof formData.planTier === 'string' ? parseInt(formData.planTier) : formData.planTier)
        : undefined,
      parentPlanId: formData.parentPlanId !== undefined ? formData.parentPlanId : undefined,
      isActive: formData.isActive,
    });
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
      json.features = request.features;
    }
    if (request.maxCompanies !== undefined && request.maxCompanies !== null) {
      json.maxCompanies = request.maxCompanies;
    }
    if (request.planTier !== undefined) {
      json.planTier = request.planTier;
    }
    if (request.parentPlanId !== undefined) {
      json.parentPlanId = request.parentPlanId;
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
    if (request.features !== undefined) json.features = request.features;
    if (request.maxCompanies !== undefined && request.maxCompanies !== null) {
      json.maxCompanies = request.maxCompanies;
    }
    if (request.planTier !== undefined) json.planTier = request.planTier;
    if (request.parentPlanId !== undefined) json.parentPlanId = request.parentPlanId;
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

