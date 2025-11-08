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

export interface SubscriptionPlanData {
  id: string; // Encrypted GUID
  name: string;
  description: string | null;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  isActive: boolean;
  features: string | null; // JSON array of strings
  maxCompanies: number | null;
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
  public readonly features: string | null;
  public readonly maxCompanies: number | null;
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
   * Parse features JSON
   */
  get parsedFeatures(): string[] {
    if (!this.features) return [];
    try {
      return JSON.parse(this.features);
    } catch {
      return [];
    }
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
  public readonly isActive?: boolean;

  constructor(data: CreateSubscriptionPlanRequestData) {
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.currency = data.currency;
    this.billingCycle = data.billingCycle;
    this.features = data.features;
    this.maxCompanies = data.maxCompanies;
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
    this.isActive = data.isActive;
  }

  get isValid(): boolean {
    return !!(this.id && (this.name === undefined || this.name.trim().length > 0) && (this.price === undefined || this.price >= 0));
  }
}

