# SYNFLOX Plan vs Subscription Architecture

## 📋 PLAN = Template/Product Catalog

Plans are **commercial offerings** - like products in a catalog. Configure once, use for many subscriptions.

### Plan Fields

| Field | Type | Description | Editable by User? |
|-------|------|-------------|-------------------|
| `Name` | string | Plan name (Basic, Pro, Enterprise) | ✅ Yes |
| `Description` | string | Plan description | ✅ Yes |
| `DurationType` | enum | Monthly, Yearly, Lifetime, etc. | ✅ Yes |
| `AllowTrial` | bool | Whether trial is **allowed** | ✅ Yes |
| `TrialDurationDays` | int | How long trial lasts | ✅ Yes (if AllowTrial) |
| `AutoRenew` | bool | **Default** auto-renew setting | ✅ Yes |
| `UpgradePolicy` | enum | FullReplace, Prorated, Deferred | ✅ Yes |
| `GracePeriodDays` | int | Days after expiry before access changes | ✅ Yes |
| `ExportGraceDays` | int | Days for export after blocked | ✅ Yes |
| `CustomFeatures` | string[] | Commercial features list | ✅ Yes |
| **Prices** | collection | Multi-currency pricing | ✅ Yes |
| **Projects/Modules** | collection | What's included | ✅ Yes |

### Free Tier & Fallback Fields (Plan-level)

| Field | Type | Description |
|-------|------|-------------|
| `IsFreeTier` | bool | Is this a free tier plan? |
| `FallbackAccessMode` | enum | Access mode when this plan is used as fallback |
| `DefaultFallbackPlanId` | Guid? | **Default** fallback for subscribers of this plan |
| `ShowLockedModulesInMenu` | bool | UI setting for locked modules |
| `LockedItemStyle` | string | How to display locked items |

---

## 📄 SUBSCRIPTION = Customer Instance

Subscriptions are **instances** - actual customer entitlements with their own state.

### Core Subscription Fields

| Field | Type | Description | Who Sets It? |
|-------|------|-------------|--------------|
| `CompanyId` | Guid | Who owns it | Admin (create) |
| `PlanId` | Guid | What plan they're on | Admin (create/upgrade) |
| `StartDateUtc` | DateTime | When subscription starts | System |
| `ExpiryDateUtc` | DateTime | When subscription expires | System |
| `Currency` | enum | Currency used | Admin (create) |
| `Amount` | decimal | Amount paid | System (from plan price) |

### State Tracking Fields

| Field | Type | Description | Who Sets It? |
|-------|------|-------------|--------------|
| `IsActive` | bool | Currently active? | System |
| `IsTrial` | bool | Is trial subscription? | System |
| `IsExpired` | bool | Has expired? | Background Job |
| `StatusReason` | string | Reason for status | System |

### Override Fields (Can differ from Plan)

| Field | Type | Description | Who Sets It? |
|-------|------|-------------|--------------|
| `AutoRenew` | bool | **Override** of plan's default | Admin/Customer |
| `UpgradePolicyOverride` | enum? | **Override** of plan's policy | Admin |
| `FallbackPlanId` | Guid? | **Override** of plan's default fallback | Admin |

### Upgrade/Renewal Chain Fields

| Field | Type | Description |
|-------|------|-------------|
| `NextPlanId` | Guid? | Scheduled upgrade to **PLAN** |
| `NextPlanStartDateUtc` | DateTime? | When upgrade activates |
| `ParentSubscriptionId` | Guid? | Previous subscription in chain |

### Access Control Fields (Runtime State)

| Field | Type | Description | Who Sets It? |
|-------|------|-------------|--------------|
| `AccessMode` | enum | **Current** access state | Background Job |
| `ExportDeadlineUtc` | DateTime? | When export period ends | Background Job |
| `EntitlementsVersion` | int | For cache invalidation | Background Job |
| `AccessRestrictionMessage` | string | Custom message | Admin |

### License Key Fields

| Field | Type | Description |
|-------|------|-------------|
| `OfflineLicenseKey` | string | Encrypted license key |
| `LicenseKeyGeneratedAt` | DateTime? | When key was generated |
| `LicenseKeyVersion` | int | Key format version |

---

## 🔑 KEY CLARIFICATIONS

### 1. NextPlanId vs NextSubscriptionId

**Q: Why is it `NextPlanId` and not `NextSubscriptionId`?**

**A:** When scheduling an upgrade:
1. User selects a new PLAN to upgrade to
2. `NextPlanId` stores which plan they're upgrading to
3. `NextPlanStartDateUtc` stores when it should happen
4. When the upgrade happens, a NEW subscription is created on that plan
5. The new subscription's `ParentSubscriptionId` points back to the original

**Flow:**
```
Subscription A (Plan: Basic)
    ↓ NextPlanId = Pro Plan ID
    ↓ Upgrade happens
Subscription B (Plan: Pro)
    ParentSubscriptionId = Subscription A's ID
```

### 2. FallbackPlanId in Both Places

**Plan.DefaultFallbackPlanId:**
- Sets the DEFAULT fallback for ALL subscriptions using this plan
- Example: "Pro plan subscribers fall back to Basic plan"

**Subscription.FallbackPlanId:**
- OPTIONAL override for THIS specific subscription
- If null, uses Plan.DefaultFallbackPlanId
- Example: "This VIP customer keeps Premium access on fallback"

### 3. AutoRenew in Both Places

**Plan.AutoRenew:**
- DEFAULT setting for new subscriptions
- "Pro plans auto-renew by default"

**Subscription.AutoRenew:**
- ACTUAL setting for this subscription
- Customer can toggle on/off

### 4. GracePeriodDays / ExportGraceDays

**Only in Plan** (correct):
- These are policy settings
- All subscriptions using this plan share these settings
- If you need per-subscription override, add to Subscription entity later

---

## ✅ WHAT'S CORRECT

1. **Backend Entities** - All fields are in the right place
2. **NextPlanId** - Correctly points to a PLAN, not subscription
3. **ParentSubscriptionId** - Correctly links subscription chain
4. **FallbackPlanId** - Exists in both (Plan = default, Subscription = override)

## ⚠️ WHAT'S MISSING

### Backend DTO (SubscriptionDto)
- ❌ `ParentSubscriptionId` - Missing
- ❌ `ParentSubscriptionDisplayName` - Missing
- ❌ `UpgradePolicyOverride` - Missing

### Frontend Model (Subscription)
- ❌ `parentSubscriptionId` - Missing
- ❌ `upgradePolicyOverride` - Missing

---

## 📝 REQUIRED FIXES

1. **Add to SubscriptionDto:**
   - `ParentSubscriptionId` (Guid?)
   - `UpgradePolicyOverride` (UpgradePolicy?)

2. **Add to SubscriptionMappingProfile:**
   - Map `ParentSubscriptionId` with encryption

3. **Add to Frontend SubscriptionData interface:**
   - `parentSubscriptionId?: string | null`
   - `upgradePolicyOverride?: number | null`

4. **Add to Frontend Subscription class:**
   - Properties for the above fields
