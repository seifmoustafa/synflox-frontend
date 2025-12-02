/**
 * Plan Entitlement Service
 * Handles all plan entitlement operations
 */

import { API_ENDPOINTS } from '@/config/api-endpoints';
import type { IApiService } from './api.service';
import type { INotificationService } from './notification.service';
import {
  PlanEntitlement,
  PlanEntitlementMapper,
  CreatePlanEntitlementRequest,
  UpdatePlanEntitlementRequest,
} from '@/domain';

/**
 * Plan Entitlement Service Interface
 */
export interface IPlanEntitlementService {
  /**
   * Get all entitlements for a plan
   */
  getByPlanId(planId: string): Promise<PlanEntitlement[]>;

  /**
   * Get a single entitlement by ID
   */
  getById(id: string): Promise<PlanEntitlement | null>;

  /**
   * Create a new entitlement
   */
  create(request: CreatePlanEntitlementRequest): Promise<PlanEntitlement | null>;

  /**
   * Update an entitlement
   * @param request - Update request with optional resetChildOverrides flag
   */
  update(request: UpdatePlanEntitlementRequest): Promise<PlanEntitlement | null>;

  /**
   * Delete an entitlement
   */
  delete(id: string): Promise<boolean>;
}

/**
 * Plan Entitlement Service Implementation
 */
export class PlanEntitlementService implements IPlanEntitlementService {
  constructor(
    private readonly api: IApiService,
    private readonly notification: INotificationService
  ) {}

  async getByPlanId(planId: string): Promise<PlanEntitlement[]> {
    try {
      const response = await this.api.get(API_ENDPOINTS.PLAN_ENTITLEMENTS.BY_PLAN(planId));
      return PlanEntitlementMapper.handleListResponse(response);
    } catch (error) {
      console.error('Failed to fetch plan entitlements:', error);
      return [];
    }
  }

  async getById(id: string): Promise<PlanEntitlement | null> {
    try {
      const response = await this.api.get(API_ENDPOINTS.PLAN_ENTITLEMENTS.BY_ID(id));
      return PlanEntitlementMapper.handleSingleResponse(response);
    } catch (error) {
      console.error('Failed to fetch entitlement:', error);
      return null;
    }
  }

  async create(request: CreatePlanEntitlementRequest): Promise<PlanEntitlement | null> {
    try {
      if (!request.isValid) {
        this.notification.error('Invalid entitlement data');
        return null;
      }

      const response = await this.api.post(
        API_ENDPOINTS.PLAN_ENTITLEMENTS.CREATE,
        PlanEntitlementMapper.createRequestToJson(request)
      );

      const entitlement = PlanEntitlementMapper.handleSingleResponse(response);
      if (entitlement) {
        this.notification.success('Entitlement created successfully');
      }
      return entitlement;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create entitlement';
      this.notification.error(message);
      return null;
    }
  }

  async update(request: UpdatePlanEntitlementRequest): Promise<PlanEntitlement | null> {
    try {
      if (!request.isValid) {
        this.notification.error('Invalid entitlement data');
        return null;
      }

      const response = await this.api.put(
        API_ENDPOINTS.PLAN_ENTITLEMENTS.UPDATE(request.id),
        PlanEntitlementMapper.updateRequestToJson(request)
      );

      const entitlement = PlanEntitlementMapper.handleSingleResponse(response);
      if (entitlement) {
        this.notification.success('Entitlement updated successfully');
      }
      return entitlement;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update entitlement';
      this.notification.error(message);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.api.delete(API_ENDPOINTS.PLAN_ENTITLEMENTS.DELETE(id));
      this.notification.success('Entitlement deleted successfully');
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete entitlement';
      this.notification.error(message);
      return false;
    }
  }
}
