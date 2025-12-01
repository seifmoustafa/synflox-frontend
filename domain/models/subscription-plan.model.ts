/**
 * Subscription Plan Domain Model
 * Represents commercial offerings (Basic, Pro, Enterprise, Lifetime)
 */

import type { ProjectData } from './project.model';
import type { ModuleData } from './module.model';
import { SubscriptionAccessMode } from './subscription.model';

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
  Free = 0,  // Free plan (no price)
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
  projectCount?: number;
  moduleCount?: number;
  createdBy?: string | null;
  createdTimestamp?: string | null;
  lastModifiedBy?: string | null;
  lastModifiedTimestamp?: string | null;
  // Enterprise Entitlement System fields
  isFreeTier?: boolean;
  fallbackAccessMode?: SubscriptionAccessMode;
  exportGraceDays?: number;
  defaultFallbackPlanId?: string | null;
  defaultFallbackPlanName?: string | null;
  showLockedModulesInMenu?: boolean;
  lockedItemStyle?: string;
  // Plan Hierarchy (Inheritance)
  parentPlanId?: string | null;
  parentPlanName?: string | null;
  displayOrder?: number;
  childPlanCount?: number;
  inheritedProjectsCount?: number;
  inheritedModulesCount?: number;
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
    private readonly _projectCount: number = 0,
    private readonly _moduleCount: number = 0,
    public readonly createdBy: string | null = null,
    public readonly createdTimestamp: string | null = null,
    public readonly lastModifiedBy: string | null = null,
    public readonly lastModifiedTimestamp: string | null = null,
    // Enterprise Entitlement System fields
    public readonly isFreeTier: boolean = false,
    public readonly fallbackAccessMode: SubscriptionAccessMode = SubscriptionAccessMode.ReadOnly,
    public readonly exportGraceDays: number = 30,
    public readonly defaultFallbackPlanId: string | null = null,
    public readonly defaultFallbackPlanName: string | null = null,
    public readonly showLockedModulesInMenu: boolean = true,
    public readonly lockedItemStyle: string = 'greyed_with_lock',
    // Plan Hierarchy (Inheritance)
    public readonly parentPlanId: string | null = null,
    public readonly parentPlanName: string | null = null,
    public readonly displayOrder: number = 0,
    public readonly childPlanCount: number = 0,
    public readonly inheritedProjectsCount: number = 0,
    public readonly inheritedModulesCount: number = 0
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
   * Get projects count (from API count field, fallback to array length)
   */
  get projectsCount(): number {
    return this._projectCount > 0 ? this._projectCount : this.projects.length;
  }

  /**
   * Get modules count (from API count field, fallback to array length)
   */
  get modulesCount(): number {
    return this._moduleCount > 0 ? this._moduleCount : this.modules.length;
  }

  /**
   * Get primary price (first USD price or first price)
   */
  get primaryPrice(): PlanPriceData | null {
    if (this.prices.length === 0) return null;
    // For free tier, return the Free currency price (check both enum and raw value)
    const freePrice = this.prices.find(p => (p.currency as number) === 0);
    if (freePrice) return freePrice;
    // Otherwise prefer USD or first available
    return this.prices.find(p => p.currency === Currency.USD) || this.prices[0];
  }

  /**
   * Check if this plan has a parent (inherits from another plan)
   */
  get hasParentPlan(): boolean {
    return !!this.parentPlanId;
  }

  /**
   * Check if this plan has child plans (is a parent)
   */
  get hasChildPlans(): boolean {
    return this.childPlanCount > 0;
  }

  /**
   * Get total features including inherited
   */
  get totalProjectsCount(): number {
    return this.projectsCount + this.inheritedProjectsCount;
  }

  /**
   * Get total modules including inherited
   */
  get totalModulesCount(): number {
    return this.modulesCount + this.inheritedModulesCount;
  }

  /**
   * Format price with currency symbol
   */
  formatPrice(price: PlanPriceData): string {
    // Free tier plans show "Free" instead of price (check raw value for API compatibility)
    if ((price.currency as number) === 0) {
      return 'Free';
    }
    
    const symbols: Record<Currency, string> = {
      [Currency.Free]: '',
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
      updates.projectCount ?? this._projectCount,
      updates.moduleCount ?? this._moduleCount,
      updates.createdBy ?? this.createdBy,
      updates.createdTimestamp ?? this.createdTimestamp,
      updates.lastModifiedBy ?? this.lastModifiedBy,
      updates.lastModifiedTimestamp ?? this.lastModifiedTimestamp,
      // Entitlement fields
      updates.isFreeTier ?? this.isFreeTier,
      updates.fallbackAccessMode ?? this.fallbackAccessMode,
      updates.exportGraceDays ?? this.exportGraceDays,
      updates.defaultFallbackPlanId ?? this.defaultFallbackPlanId,
      updates.defaultFallbackPlanName ?? this.defaultFallbackPlanName,
      updates.showLockedModulesInMenu ?? this.showLockedModulesInMenu,
      updates.lockedItemStyle ?? this.lockedItemStyle,
      // Hierarchy fields
      updates.parentPlanId ?? this.parentPlanId,
      updates.parentPlanName ?? this.parentPlanName,
      updates.displayOrder ?? this.displayOrder,
      updates.childPlanCount ?? this.childPlanCount,
      updates.inheritedProjectsCount ?? this.inheritedProjectsCount,
      updates.inheritedModulesCount ?? this.inheritedModulesCount
    );
  }

  /**
   * Check if plan has a fallback plan configured
   */
  get hasFallbackPlan(): boolean {
    return !!this.defaultFallbackPlanId;
  }

  /**
   * Check if this is a premium plan (not free tier)
   */
  get isPremium(): boolean {
    return !this.isFreeTier;
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
  // Enterprise Entitlement System fields
  isFreeTier?: boolean;
  fallbackAccessMode?: SubscriptionAccessMode;
  exportGraceDays?: number;
  defaultFallbackPlanId?: string | null;
  showLockedModulesInMenu?: boolean;
  lockedItemStyle?: string;
  // Plan Hierarchy
  parentPlanId?: string | null;
  displayOrder?: number;
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
  // Enterprise Entitlement System fields
  public readonly isFreeTier: boolean;
  public readonly fallbackAccessMode: SubscriptionAccessMode;
  public readonly exportGraceDays: number;
  public readonly defaultFallbackPlanId: string | null;
  public readonly showLockedModulesInMenu: boolean;
  public readonly lockedItemStyle: string;
  // Plan Hierarchy
  public readonly parentPlanId: string | null;
  public readonly displayOrder: number;

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
    // Entitlement fields
    this.isFreeTier = data.isFreeTier ?? false;
    this.fallbackAccessMode = data.fallbackAccessMode ?? SubscriptionAccessMode.ReadOnly;
    this.exportGraceDays = data.exportGraceDays ?? 30;
    this.defaultFallbackPlanId = data.defaultFallbackPlanId ?? null;
    this.showLockedModulesInMenu = data.showLockedModulesInMenu ?? true;
    this.lockedItemStyle = data.lockedItemStyle ?? 'greyed_with_lock';
    // Hierarchy fields
    this.parentPlanId = data.parentPlanId ?? null;
    this.displayOrder = data.displayOrder ?? 0;
  }

  /**
   * Validate the request data
   * Note: Free Tier plans don't need prices (backend auto-sets Free currency)
   */
  get isValid(): boolean {
    const hasValidName = !!(
      this.name &&
      this.name.trim().length >= 2 &&
      this.name.length <= 150
    );
    
    // Free Tier plans don't need prices
    if (this.isFreeTier) {
      return hasValidName;
    }
    
    return hasValidName && this.prices.length > 0;
  }

  /**
   * Convert to JSON for API
   * Note: Free Tier plans don't send prices (backend auto-sets)
   */
  toJSON() {
    const json: any = {
      name: this.name.trim(),
      description: this.description?.trim() || null,
      durationType: this.durationType,
      allowTrial: this.allowTrial,
      trialDurationDays: this.trialDurationDays,
      autoRenew: this.autoRenew,
      upgradePolicy: this.upgradePolicy,
      gracePeriodDays: this.gracePeriodDays,
      customFeatures: this.customFeatures,
      projectIds: this.projectIds,
      moduleIds: this.moduleIds,
      // Entitlement fields
      isFreeTier: this.isFreeTier,
      fallbackAccessMode: this.fallbackAccessMode,
      exportGraceDays: this.exportGraceDays,
      defaultFallbackPlanId: this.defaultFallbackPlanId,
      showLockedModulesInMenu: this.showLockedModulesInMenu,
      lockedItemStyle: this.lockedItemStyle,
      // Hierarchy fields
      parentPlanId: this.parentPlanId,
      displayOrder: this.displayOrder,
    };
    
    // Only include prices for non-free plans
    if (!this.isFreeTier) {
      json.prices = this.prices;
    }
    
    return json;
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
  // Enterprise Entitlement System fields
  isFreeTier?: boolean;
  fallbackAccessMode?: SubscriptionAccessMode;
  exportGraceDays?: number;
  defaultFallbackPlanId?: string | null;
  showLockedModulesInMenu?: boolean;
  lockedItemStyle?: string;
  // Plan Hierarchy
  parentPlanId?: string | null;
  displayOrder?: number;
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
  // Enterprise Entitlement System fields
  public readonly isFreeTier?: boolean;
  public readonly fallbackAccessMode?: SubscriptionAccessMode;
  public readonly exportGraceDays?: number;
  public readonly defaultFallbackPlanId?: string | null;
  public readonly showLockedModulesInMenu?: boolean;
  public readonly lockedItemStyle?: string;
  // Plan Hierarchy
  public readonly parentPlanId?: string | null;
  public readonly displayOrder?: number;

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
    // Entitlement fields
    this.isFreeTier = data.isFreeTier;
    this.fallbackAccessMode = data.fallbackAccessMode;
    this.exportGraceDays = data.exportGraceDays;
    this.defaultFallbackPlanId = data.defaultFallbackPlanId;
    this.showLockedModulesInMenu = data.showLockedModulesInMenu;
    this.lockedItemStyle = data.lockedItemStyle;
    // Hierarchy fields
    this.parentPlanId = data.parentPlanId;
    this.displayOrder = data.displayOrder;
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
   * Note: Free Tier plans don't send prices (backend auto-sets)
   */
  toJSON() {
    const data: any = {};
    if (this.name !== undefined) data.name = this.name?.trim() || null;
    if (this.description !== undefined) data.description = this.description?.trim() || null;
    if (this.durationType !== undefined) data.durationType = this.durationType;
    // Only include prices for non-free plans
    if (this.prices !== undefined && !this.isFreeTier) data.prices = this.prices;
    if (this.allowTrial !== undefined) data.allowTrial = this.allowTrial;
    if (this.trialDurationDays !== undefined) data.trialDurationDays = this.trialDurationDays;
    if (this.autoRenew !== undefined) data.autoRenew = this.autoRenew;
    if (this.upgradePolicy !== undefined) data.upgradePolicy = this.upgradePolicy;
    if (this.gracePeriodDays !== undefined) data.gracePeriodDays = this.gracePeriodDays;
    if (this.customFeatures !== undefined) data.customFeatures = this.customFeatures;
    if (this.projectIds !== undefined) data.projectIds = this.projectIds;
    if (this.moduleIds !== undefined) data.moduleIds = this.moduleIds;
    // Entitlement fields
    if (this.isFreeTier !== undefined) data.isFreeTier = this.isFreeTier;
    if (this.fallbackAccessMode !== undefined) data.fallbackAccessMode = this.fallbackAccessMode;
    if (this.exportGraceDays !== undefined) data.exportGraceDays = this.exportGraceDays;
    if (this.defaultFallbackPlanId !== undefined) data.defaultFallbackPlanId = this.defaultFallbackPlanId;
    if (this.showLockedModulesInMenu !== undefined) data.showLockedModulesInMenu = this.showLockedModulesInMenu;
    if (this.lockedItemStyle !== undefined) data.lockedItemStyle = this.lockedItemStyle;
    // Hierarchy fields
    if (this.parentPlanId !== undefined) data.parentPlanId = this.parentPlanId;
    if (this.displayOrder !== undefined) data.displayOrder = this.displayOrder;
    return data;
  }
}
