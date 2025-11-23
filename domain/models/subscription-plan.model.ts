/**
 * Subscription Plan Domain Model
 * Represents commercial offerings (Basic, Pro, Enterprise, Lifetime)
 */

import type { ProjectData } from './project.model';
import type { ModuleData } from './module.model';

/**
 * Plan duration types
 */
export enum PlanDurationType {
  Weekly = 1,
  BiWeekly = 2,
  Monthly = 3,
  Quarterly = 4,
  SemiAnnually = 5,
  Yearly = 6,
  Biennial = 7,
  Triennial = 8,
  Lifetime = 99,
}

/**
 * Upgrade policy options
 */
export enum UpgradePolicy {
  FullReplace = 0,
  Prorated = 1,
  Deferred = 2,
}

/**
 * Supported currencies
 */
export enum Currency {
  USD = 1,
  EUR = 2,
  EGP = 3,
  SAR = 4,
  AED = 5,
  GBP = 6,
  JPY = 7,
  CNY = 8,
}

/**
 * Plan price structure
 */
export interface PlanPriceData {
  currency: Currency;
  amount: number;
}

/**
 * Subscription plan data structure from API
 */
export interface SubscriptionPlanData {
  id: string;
  name: string;
  description: string | null;
  durationType: PlanDurationType;
  isLifetimePlan: boolean;
  durationDescription: string;
  allowTrial: boolean;
  trialDurationDays: number | null;
  autoRenew: boolean;
  upgradePolicy: UpgradePolicy;
  gracePeriodDays: number;
  customFeatures: string[];
  prices: PlanPriceData[];
  projects?: ProjectData[];
  modules?: ModuleData[];
  createdBy?: string | null;
  createdTimestamp?: string | null;
  lastModifiedBy?: string | null;
  lastModifiedTimestamp?: string | null;
}

/**
 * Subscription Plan domain model with business logic
 */
export class SubscriptionPlan {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly durationType: PlanDurationType,
    public readonly isLifetimePlan: boolean,
    public readonly durationDescription: string,
    public readonly allowTrial: boolean,
    public readonly trialDurationDays: number | null,
    public readonly autoRenew: boolean,
    public readonly upgradePolicy: UpgradePolicy,
    public readonly gracePeriodDays: number,
    public readonly customFeatures: string[],
    public readonly prices: PlanPriceData[],
    public readonly projects: ProjectData[] = [],
    public readonly modules: ModuleData[] = [],
    public readonly createdBy: string | null = null,
    public readonly createdTimestamp: string | null = null,
    public readonly lastModifiedBy: string | null = null,
    public readonly lastModifiedTimestamp: string | null = null
  ) {}

  /**
   * Display name for the plan
   */
  get displayName(): string {
    return this.name || "Unnamed Plan";
  }

  /**
   * Get formatted creation date
   */
  get formattedCreatedDate(): string | null {
    if (!this.createdTimestamp) return null;
    return new Date(this.createdTimestamp).toLocaleDateString();
  }

  /**
   * Get price count
   */
  get priceCount(): number {
    return this.prices.length;
  }

  /**
   * Get features count
   */
  get featuresCount(): number {
    return this.customFeatures.length;
  }

  /**
   * Get projects count
   */
  get projectsCount(): number {
    return this.projects.length;
  }

  /**
   * Get modules count
   */
  get modulesCount(): number {
    return this.modules.length;
  }

  /**
   * Get primary price (first USD price or first price)
   */
  get primaryPrice(): PlanPriceData | null {
    if (this.prices.length === 0) return null;
    return this.prices.find(p => p.currency === Currency.USD) || this.prices[0];
  }

  /**
   * Format price with currency symbol
   */
  formatPrice(price: PlanPriceData): string {
    const symbols: Record<Currency, string> = {
      [Currency.USD]: '$',
      [Currency.EUR]: '€',
      [Currency.EGP]: 'EGP ',
      [Currency.SAR]: 'SAR ',
      [Currency.AED]: 'AED ',
      [Currency.GBP]: '£',
      [Currency.JPY]: '¥',
      [Currency.CNY]: '¥',
    };
    return `${symbols[price.currency]}${price.amount.toFixed(2)}`;
  }

  /**
   * Create immutable copy with updated fields
   */
  update(updates: Partial<SubscriptionPlanData>): SubscriptionPlan {
    return new SubscriptionPlan(
      updates.id ?? this.id,
      updates.name ?? this.name,
      updates.description ?? this.description,
      updates.durationType ?? this.durationType,
      updates.isLifetimePlan ?? this.isLifetimePlan,
      updates.durationDescription ?? this.durationDescription,
      updates.allowTrial ?? this.allowTrial,
      updates.trialDurationDays ?? this.trialDurationDays,
      updates.autoRenew ?? this.autoRenew,
      updates.upgradePolicy ?? this.upgradePolicy,
      updates.gracePeriodDays ?? this.gracePeriodDays,
      updates.customFeatures ?? this.customFeatures,
      updates.prices ?? this.prices,
      updates.projects ?? this.projects,
      updates.modules ?? this.modules,
      updates.createdBy ?? this.createdBy,
      updates.createdTimestamp ?? this.createdTimestamp,
      updates.lastModifiedBy ?? this.lastModifiedBy,
      updates.lastModifiedTimestamp ?? this.lastModifiedTimestamp
    );
  }
}

/**
 * Request to create a new subscription plan
 */
export interface CreatePlanRequestData {
  name: string;
  description?: string | null;
  durationType: PlanDurationType;
  prices: PlanPriceData[];
  allowTrial?: boolean;
  trialDurationDays?: number | null;
  autoRenew?: boolean;
  upgradePolicy?: UpgradePolicy;
  gracePeriodDays?: number;
  customFeatures?: string[];
  projectIds?: string[];
  moduleIds?: string[];
}

export class CreatePlanRequest {
  public readonly name: string;
  public readonly description?: string | null;
  public readonly durationType: PlanDurationType;
  public readonly prices: PlanPriceData[];
  public readonly allowTrial: boolean;
  public readonly trialDurationDays: number | null;
  public readonly autoRenew: boolean;
  public readonly upgradePolicy: UpgradePolicy;
  public readonly gracePeriodDays: number;
  public readonly customFeatures: string[];
  public readonly projectIds: string[];
  public readonly moduleIds: string[];

  constructor(data: CreatePlanRequestData) {
    this.name = data.name;
    this.description = data.description;
    this.durationType = data.durationType;
    this.prices = data.prices || [];
    this.allowTrial = data.allowTrial ?? false;
    this.trialDurationDays = data.trialDurationDays ?? null;
    this.autoRenew = data.autoRenew ?? false;
    this.upgradePolicy = data.upgradePolicy ?? UpgradePolicy.FullReplace;
    this.gracePeriodDays = data.gracePeriodDays ?? 0;
    this.customFeatures = data.customFeatures || [];
    this.projectIds = data.projectIds || [];
    this.moduleIds = data.moduleIds || [];
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(
      this.name &&
      this.name.trim().length >= 2 &&
      this.name.length <= 150 &&
      this.prices.length > 0
    );
  }

  /**
   * Convert to JSON for API
   */
  toJSON() {
    return {
      name: this.name.trim(),
      description: this.description?.trim() || null,
      durationType: this.durationType,
      prices: this.prices,
      allowTrial: this.allowTrial,
      trialDurationDays: this.trialDurationDays,
      autoRenew: this.autoRenew,
      upgradePolicy: this.upgradePolicy,
      gracePeriodDays: this.gracePeriodDays,
      customFeatures: this.customFeatures,
      projectIds: this.projectIds,
      moduleIds: this.moduleIds,
    };
  }
}

/**
 * Request to update an existing subscription plan
 */
export interface UpdatePlanRequestData {
  id: string;
  name?: string | null;
  description?: string | null;
  durationType?: PlanDurationType;
  prices?: PlanPriceData[];
  allowTrial?: boolean;
  trialDurationDays?: number | null;
  autoRenew?: boolean;
  upgradePolicy?: UpgradePolicy;
  gracePeriodDays?: number;
  customFeatures?: string[];
  projectIds?: string[];
  moduleIds?: string[];
}

export class UpdatePlanRequest {
  public readonly id: string;
  public readonly name?: string | null;
  public readonly description?: string | null;
  public readonly durationType?: PlanDurationType;
  public readonly prices?: PlanPriceData[];
  public readonly allowTrial?: boolean;
  public readonly trialDurationDays?: number | null;
  public readonly autoRenew?: boolean;
  public readonly upgradePolicy?: UpgradePolicy;
  public readonly gracePeriodDays?: number;
  public readonly customFeatures?: string[];
  public readonly projectIds?: string[];
  public readonly moduleIds?: string[];

  constructor(data: UpdatePlanRequestData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.durationType = data.durationType;
    this.prices = data.prices;
    this.allowTrial = data.allowTrial;
    this.trialDurationDays = data.trialDurationDays;
    this.autoRenew = data.autoRenew;
    this.upgradePolicy = data.upgradePolicy;
    this.gracePeriodDays = data.gracePeriodDays;
    this.customFeatures = data.customFeatures;
    this.projectIds = data.projectIds;
    this.moduleIds = data.moduleIds;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    if (this.name !== undefined && this.name !== null) {
      return this.name.trim().length >= 2 && this.name.length <= 150;
    }
    return true;
  }

  /**
   * Convert to JSON for API
   */
  toJSON() {
    const data: any = {};
    if (this.name !== undefined) data.name = this.name?.trim() || null;
    if (this.description !== undefined) data.description = this.description?.trim() || null;
    if (this.durationType !== undefined) data.durationType = this.durationType;
    if (this.prices !== undefined) data.prices = this.prices;
    if (this.allowTrial !== undefined) data.allowTrial = this.allowTrial;
    if (this.trialDurationDays !== undefined) data.trialDurationDays = this.trialDurationDays;
    if (this.autoRenew !== undefined) data.autoRenew = this.autoRenew;
    if (this.upgradePolicy !== undefined) data.upgradePolicy = this.upgradePolicy;
    if (this.gracePeriodDays !== undefined) data.gracePeriodDays = this.gracePeriodDays;
    if (this.customFeatures !== undefined) data.customFeatures = this.customFeatures;
    if (this.projectIds !== undefined) data.projectIds = this.projectIds;
    if (this.moduleIds !== undefined) data.moduleIds = this.moduleIds;
    return data;
  }
}
