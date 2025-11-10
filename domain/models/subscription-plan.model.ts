/**
 * Subscription Plan Domain Model
 * 
 * Represents subscription plans/tiers that companies can subscribe to.
 */

export enum BillingCycle {
  Monthly = 1,
  Yearly = 2,
  Quarterly = 3,
  OneTime = 4,
}

export enum PlanTier {
  Free = 0,
  Basic = 1,
  Pro = 2,
  Enterprise = 3,
  Ultimate = 4,
}

export interface SubscriptionPlanData {
  id: string; // Encrypted GUID
  name: string;
  description: string | null;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  isActive: boolean;
  features: string[] | null; // Array of feature strings
  maxCompanies: number | null;
  planTier: number;
  parentPlanId: string | null; // Encrypted GUID
  parentPlanName: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export class SubscriptionPlan {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string | null;
  public readonly price: number;
  public readonly currency: string;
  public readonly billingCycle: BillingCycle;
  public readonly isActive: boolean;
  public readonly features: string[] | null;
  public readonly maxCompanies: number | null;
  public readonly planTier: number;
  public readonly parentPlanId: string | null;
  public readonly parentPlanName: string | null;
  public readonly createdAt: string;
  public readonly updatedAt: string | null;

  constructor(data: SubscriptionPlanData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.currency = data.currency;
    this.billingCycle = data.billingCycle;
    this.isActive = data.isActive;
    this.features = data.features;
    this.maxCompanies = data.maxCompanies;
    this.planTier = data.planTier;
    this.parentPlanId = data.parentPlanId;
    this.parentPlanName = data.parentPlanName;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Get plan's display name
   */
  get displayName(): string {
    return this.name;
  }

  /**
   * Get formatted price
   */
  get formattedPrice(): string {
    return `${this.price} ${this.currency}`;
  }

  /**
   * Get billing cycle name
   */
  get billingCycleName(): string {
    const names: Record<BillingCycle, string> = {
      [BillingCycle.Monthly]: "Monthly",
      [BillingCycle.Yearly]: "Yearly",
      [BillingCycle.Quarterly]: "Quarterly",
      [BillingCycle.OneTime]: "One Time",
    };
    return names[this.billingCycle] || "Unknown";
  }

  /**
   * Get features array
   */
  get parsedFeatures(): string[] {
    return this.features || [];
  }

  /**
   * Check if this plan has a parent plan (inherits features)
   */
  get hasParentPlan(): boolean {
    return !!this.parentPlanId;
  }

  /**
   * Get plan tier display name
   */
  get planTierName(): string {
    const tierNames: Record<PlanTier, string> = {
      [PlanTier.Free]: "Free",
      [PlanTier.Basic]: "Basic", 
      [PlanTier.Pro]: "Pro",
      [PlanTier.Enterprise]: "Enterprise",
      [PlanTier.Ultimate]: "Ultimate"
    };
    return tierNames[this.planTier as PlanTier] || `Tier ${this.planTier}`;
  }
}

export interface CreateSubscriptionPlanRequestData {
  name: string;
  description?: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  features?: string[];
  maxCompanies?: number;
  planTier?: number;
  parentPlanId?: string;
  isActive?: boolean;
}

export class CreateSubscriptionPlanRequest {
  public readonly name: string;
  public readonly description?: string;
  public readonly price: number;
  public readonly currency: string;
  public readonly billingCycle: BillingCycle;
  public readonly features?: string[];
  public readonly maxCompanies?: number;
  public readonly planTier?: number;
  public readonly parentPlanId?: string;
  public readonly isActive?: boolean;

  constructor(data: CreateSubscriptionPlanRequestData) {
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.currency = data.currency;
    this.billingCycle = data.billingCycle;
    this.features = data.features;
    this.maxCompanies = data.maxCompanies;
    this.planTier = data.planTier;
    this.parentPlanId = data.parentPlanId;
    this.isActive = data.isActive ?? true;
  }

  get isValid(): boolean {
    return !!(this.name && this.name.trim().length > 0 && this.price >= 0);
  }
}

export interface UpdateSubscriptionPlanRequestData {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  billingCycle?: BillingCycle;
  features?: string[];
  maxCompanies?: number;
  planTier?: number;
  parentPlanId?: string;
  isActive?: boolean;
}

export class UpdateSubscriptionPlanRequest {
  public readonly id: string;
  public readonly name?: string;
  public readonly description?: string;
  public readonly price?: number;
  public readonly currency?: string;
  public readonly billingCycle?: BillingCycle;
  public readonly features?: string[];
  public readonly maxCompanies?: number;
  public readonly planTier?: number;
  public readonly parentPlanId?: string;
  public readonly isActive?: boolean;

  constructor(data: UpdateSubscriptionPlanRequestData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.currency = data.currency;
    this.billingCycle = data.billingCycle;
    this.features = data.features;
    this.maxCompanies = data.maxCompanies;
    this.planTier = data.planTier;
    this.parentPlanId = data.parentPlanId;
    this.isActive = data.isActive;
  }

  get isValid(): boolean {
    return !!(this.id && (this.name === undefined || this.name.trim().length > 0) && (this.price === undefined || this.price >= 0));
  }
}

