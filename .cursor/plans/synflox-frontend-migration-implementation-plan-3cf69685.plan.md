<!-- 3cf69685-973c-4820-8c91-065b2e475ecf 68230867-533c-4e3e-b413-6e77f92d7aea -->
# SYNFLOX Frontend Migration Implementation Plan

## Overview

This plan implements all new backend features and updates existing features for the SYNFLOX Admin Panel. All implementations must follow the strict architecture: Domain Model → Mapper → Service → ViewModel → View → Page.

## Architecture Compliance

**MANDATORY ORDER for each feature:**

1. Domain Model (`domain/models/[feature].model.ts`)
2. Mapper (`domain/mappers/[feature].mapper.ts`)
3. Service (`services/[feature].service.ts`)
4. ViewModel (`viewmodels/[feature]-viewmodel.tsx`)
5. View (`views/[feature]-view.tsx` or `components/app_views/[feature]-view.tsx`)
6. Page (`app/[feature]/page.tsx`)

**Required Updates for each feature:**

- `domain/index.ts` - Export models and mappers
- `domain/mappers/index.ts` - Export mapper
- `config/api-endpoints.ts` - Add endpoints
- `providers/service-provider.tsx` - Add service
- `locales/en.ts` and `locales/ar.ts` - Add translations

## Phase 1: Update Existing Features ✅ COMPLETED

### 1.1 Update Company Model & Features ✅

**Files to Update:**

- `domain/models/company.model.ts` - Add `isTrial`, `trialEndDate`, `subscriptionPlanId`
- `domain/mappers/company.mapper.ts` - Handle new fields
- `viewmodels/company-viewmodel.tsx` - Add trial badge, subscription plan selector
- `views/company-view.tsx` - Display trial badge
- `components/app_views/company-detail-view.tsx` - Add trial info, subscription plan, custom fields tab, history tab

**New Features:**

- Trial badge in company list (show if `isTrial: true`)
- Subscription plan selector in create/edit forms
- Custom Fields tab in company details
- Subscription History tab in company details
- Export/Import buttons in company list toolbar

### 1.2 Update Licensing Service ✅

**Files to Update:**

- `services/licensing.service.ts` - Add bulk operations, trial operations, history
- `viewmodels/licensing-viewmodel.tsx` - Add bulk and trial methods
- `viewmodels/company-viewmodel.tsx` - Add bulk actions to config

**New Methods:**

- `bulkActivate(companyIds: string[], expiryDate?: string)`
- `bulkSuspend(companyIds: string[])`
- `bulkResume(companyIds: string[])`
- `bulkExtend(companyIds: string[], expiryDate: string)`
- `startTrial(companyId: string, trialDays: number)`
- `convertTrial(companyId: string, expiryDate: string)`
- `getSubscriptionHistory(companyId: string, filters?: {...})`

**Bulk Actions Implementation:**

- Use `BulkAction` interface in `GenericCrudView` config
- Add `bulkActions` array to company viewmodel config
- Set `enableBulkActions: true` in config

## Phase 2: Core New Features (Priority 1) ✅ COMPLETED

### 2.1 Subscription History/Audit Log ✅

**Implementation:**

1. **Domain Model** (`domain/models/subscription-history.model.ts`)

   - `SubscriptionHistory` class with `id`, `companyId`, `actionType`, `oldValue`, `newValue`, `performedBy`, `timestamp`, `notes`
   - `SubscriptionHistoryActionType` enum (1=Created, 2=Activated, etc.)
   - `SubscriptionHistoryResponse` interface

2. **Mapper** (`domain/mappers/subscription-history.mapper.ts`)

   - `fromJson()`, `handleApiResponse()` for paginated responses
   - Parse `oldValue` and `newValue` JSON strings

3. **Service** (`services/subscription-history.service.ts`)

   - `getHistory(companyId: string, params?: {...})`
   - `getAllHistory(params?: {...})`

4. **ViewModel** (`viewmodels/subscription-history-viewmodel.tsx`)

   - Use `useGenericCrudViewModel` for list operations
   - Timeline view configuration

5. **View** (`components/app_views/subscription-history-view.tsx`)

   - Timeline component showing history entries
   - Filter by date range, action type
   - Side-by-side old/new value comparison

6. **Page** (`app/companies/[id]/history/page.tsx`)

   - Wrapped in DashboardLayout

**Endpoints:**

- `GET /api/licensing/{companyId}/history`
- `GET /api/licensing/history`

### 2.2 Notifications System ✅

**Implementation:**

1. **Domain Model** (`domain/models/notification-system.model.ts`)

   - `SystemNotification` class (different from UI Notification)
   - `NotificationType` enum (ExpiryWarning, Expired, Suspended, etc.)

2. **Mapper** (`domain/mappers/notification-system.mapper.ts`)

   - Handle notification DTOs from backend

3. **Service** (`services/notification-system.service.ts`)

   - `getNotifications(params?: {...})`
   - `getCompanyNotifications(companyId: string)`
   - `getUnreadCount(companyId: string)`
   - `markAsRead(notificationId: string)`
   - `markAllAsRead(companyId: string)`

4. **ViewModel** (`viewmodels/notification-system-viewmodel.tsx`)

   - Auto-refresh every 30 seconds
   - Unread count state

5. **Components:**

   - `components/ui/notification-bell.tsx` - Bell icon with badge
   - `components/app_views/notifications-view.tsx` - Full notifications page

6. **Page** (`app/notifications/page.tsx`)

**Endpoints:**

- `GET /api/notifications`
- `GET /api/notifications/company/{companyId}`
- `GET /api/notifications/company/{companyId}/unread-count`
- `PUT /api/notifications/{id}/read`
- `PUT /api/notifications/company/{companyId}/mark-all-read`

### 2.3 Bulk Operations (Enhanced) ✅

**Implementation:**

- Extend `company-viewmodel.tsx` to add `bulkActions` array:
  ```typescript
  bulkActions: [
    {
      label: t("licensing.bulkActivate"),
      onClick: async (ids: string[]) => {
        // Show date picker modal, then call bulkActivate
      },
      confirmTitle: t("licensing.bulkActivate"),
      confirmDescription: t("licensing.confirmBulkActivate", { count: "{count}" }),
    },
    // ... suspend, resume, extend, delete
  ],
  enableBulkActions: true,
  ```


**Endpoints:**

- `POST /api/licensing/bulk-activate`
- `POST /api/licensing/bulk-suspend`
- `POST /api/licensing/bulk-resume`
- `POST /api/licensing/bulk-extend`
- `POST /api/companies/bulk-delete`
- `POST /api/companies/bulk-update`

## Phase 3: Subscription & Plans Management ✅ COMPLETED

### 3.1 Subscription Plans ✅

**Implementation:**

1. **Domain Model** (`domain/models/subscription-plan.model.ts`)

   - `SubscriptionPlan` class
   - `BillingCycle` enum (Monthly=1, Yearly=2, etc.)
   - `CreateSubscriptionPlanRequest`, `UpdateSubscriptionPlanRequest`

2. **Mapper** (`domain/mappers/subscription-plan.mapper.ts`)

3. **Service** (`services/subscription-plan.service.ts`)

   - Full CRUD operations
   - `assignModules(planId: string, projectModules: Array<{projectModuleId: string, isEnabled: boolean}>)`

4. **ViewModel** (`viewmodels/subscription-plan-viewmodel.tsx`)

   - Use `useGenericCrudViewModel`

5. **View** (`views/subscription-plan-view.tsx`)

   - Standard CRUD view
   - Module assignment dialog

6. **Page** (`app/subscription-plans/page.tsx`)

**Endpoints:**

- `POST /api/subscription-plans`
- `GET /api/subscription-plans`
- `GET /api/subscription-plans/{id}`
- `PUT /api/subscription-plans/{id}`
- `DELETE /api/subscription-plans/{id}`
- `PUT /api/subscription-plans/{id}/project-modules`
- `GET /api/subscription-plans/{id}/project-modules`

### 3.2 Projects Management ✅

**Implementation:**

1. **Domain Model** (`domain/models/project.model.ts`)
2. **Mapper** (`domain/mappers/project.mapper.ts`)
3. **Service** (`services/project.service.ts`)
4. **ViewModel** (`viewmodels/project-viewmodel.tsx`)
5. **View** (`views/project-view.tsx`)
6. **Page** (`app/projects/page.tsx`)

**Endpoints:**

- `POST /api/projects`
- `GET /api/projects`
- `GET /api/projects/{id}`
- `PUT /api/projects/{id}`
- `DELETE /api/projects/{id}`

### 3.3 Modules Management ✅

**Implementation:**

1. **Domain Model** (`domain/models/module.model.ts`)
2. **Mapper** (`domain/mappers/module.mapper.ts`)
3. **Service** (`services/module.service.ts`)
4. **ViewModel** (`viewmodels/module-viewmodel.tsx`)
5. **View** (`views/module-view.tsx`)
6. **Page** (`app/modules/page.tsx`)

**Endpoints:**

- `POST /api/modules`
- `GET /api/modules`
- `GET /api/modules/{id}`
- `PUT /api/modules/{id}`
- `DELETE /api/modules/{id}`

### 3.4 Project-Modules Relationships ✅

**Implementation:**

1. **Domain Model** (`domain/models/project-module.model.ts`)

   - `ProjectModule` class
   - Association management

2. **Service** (`services/project-module.service.ts`)

   - `createAssociation(projectId: string, moduleId: string)`
   - `getProjectModules(projectId: string)`
   - `getModuleProjects(moduleId: string)`
   - `removeAssociation(projectId: string, moduleId: string)`

3. **Integration:**

   - Add module list in project detail view
   - Add project list in module detail view
   - Tree view in subscription plan module assignment

**Endpoints:**

- `POST /api/project-modules`
- `GET /api/project-modules/project/{projectId}`
- `GET /api/project-modules/module/{moduleId}`
- `DELETE /api/project-modules/project/{projectId}/module/{moduleId}`

## Phase 4: Company Management Enhancements ✅ COMPLETED

### 4.1 Company Groups ✅

**Implementation:**

1. **Domain Model** (`domain/models/company-group.model.ts`)
2. **Mapper** (`domain/mappers/company-group.mapper.ts`)
3. **Service** (`services/company-group.service.ts`)

   - CRUD operations
   - `addCompanies(groupId: string, companyIds: string[])`
   - `removeCompanies(groupId: string, companyIds: string[])`
   - `getGroupCompanies(groupId: string)`
   - `bulkActivateGroup(groupId: string)`
   - `bulkSuspendGroup(groupId: string)`
   - etc.

4. **ViewModel** (`viewmodels/company-group-viewmodel.tsx`)
5. **View** (`views/company-group-view.tsx`)

   - Group details with company list
   - Add/remove companies dialog
   - Bulk actions toolbar for group

6. **Page** (`app/company-groups/page.tsx`)

**Endpoints:**

- `POST /api/company-groups`
- `GET /api/company-groups`
- `GET /api/company-groups/{id}`
- `PUT /api/company-groups/{id}`
- `DELETE /api/company-groups/{id}`
- `POST /api/company-groups/{id}/companies`
- `DELETE /api/company-groups/{id}/companies`
- `GET /api/company-groups/{id}/companies`
- `GET /api/company-groups/company/{companyId}`
- `POST /api/company-groups/{id}/bulk-activate`
- `POST /api/company-groups/{id}/bulk-suspend`
- `POST /api/company-groups/{id}/bulk-resume`
- `POST /api/company-groups/{id}/bulk-extend`

### 4.2 Company Custom Fields ✅

**Implementation:**

1. **Domain Model** (`domain/models/company-custom-field.model.ts`)

   - `CompanyCustomField` class
   - `CustomFieldType` enum (String=1, Number=2, Boolean=3, Date=4, Json=5)

2. **Mapper** (`domain/mappers/company-custom-field.mapper.ts`)

3. **Service** (`services/company-custom-field.service.ts`)

   - `getCustomFields(companyId: string)`
   - `createCustomField(companyId: string, data: CreateCustomFieldRequest)`
   - `updateCustomField(companyId: string, fieldId: string, data: UpdateCustomFieldRequest)`
   - `deleteCustomField(companyId: string, fieldId: string)`

4. **Integration:**

   - Add "Custom Fields" tab in `company-detail-view.tsx`
   - Dynamic form based on field type

**Endpoints:**

- `GET /api/companies/{id}/custom-fields`
- `POST /api/companies/{id}/custom-fields`
- `GET /api/companies/{id}/custom-fields/{fieldId}`
- `PUT /api/companies/{id}/custom-fields/{fieldId}`
- `DELETE /api/companies/{id}/custom-fields/{fieldId}`

### 4.3 Company Export/Import ✅

**Implementation:**

1. **Service Methods** (add to `company.service.ts`):

   - `exportCompanies(format: 'csv' | 'excel')` - Returns blob
   - `importCompanies(file: File, format: 'csv' | 'excel')` - Uses FormData

2. **ViewModel** (add to `company-viewmodel.tsx`):

   - Export button in `customActions`
   - Import button in `customActions`
   - Import dialog with file upload and preview

3. **View** (update `company-view.tsx`):

   - Add export dropdown
   - Add import dialog

**Endpoints:**

- `GET /api/companies/export?format=csv|excel`
- `POST /api/companies/import` (multipart/form-data)

## Phase 5: API Integration Features ✅ COMPLETED

### 5.1 API Keys Management ✅

**Implementation:**

1. **Domain Model** (`domain/models/api-key.model.ts`)

   - `ApiKey` class
   - `CreateApiKeyRequest`, `UpdateApiKeyRequest`
   - `CreateApiKeyResponse` (includes full key - show only once!)

2. **Mapper** (`domain/mappers/api-key.mapper.ts`)

3. **Service** (`services/api-key.service.ts`)

   - Full CRUD
   - `regenerateKey(apiKeyId: string)` - Returns new full key

4. **ViewModel** (`viewmodels/api-key-viewmodel.tsx`)

5. **View** (`views/api-key-view.tsx`)

   - Create dialog with "Show Key Once" warning
   - Copy button for full key
   - Key prefix display in list

6. **Page** (`app/api-keys/page.tsx`)

**Endpoints:**

- `POST /api/api-keys`
- `GET /api/api-keys`
- `GET /api/api-keys/company/{companyId}`
- `GET /api/api-keys/{id}`
- `PUT /api/api-keys/{id}`
- `DELETE /api/api-keys/{id}`
- `PUT /api/api-keys/{id}/regenerate`

### 5.2 Webhooks Management ✅

**Implementation:**

1. **Domain Model** (`domain/models/webhook.model.ts`)

   - `Webhook` class
   - `WebhookEventType` enum (CompanyActivated=1, etc.)
   - `WebhookDelivery` class for delivery history

2. **Mapper** (`domain/mappers/webhook.mapper.ts`)

3. **Service** (`services/webhook.service.ts`)

   - CRUD operations
   - `getDeliveries(webhookId: string)`
   - `retryFailedDeliveries()`

4. **ViewModel** (`viewmodels/webhook-viewmodel.tsx`)

5. **View** (`views/webhook-view.tsx`)

   - Event type checkboxes
   - Delivery history modal

6. **Page** (`app/webhooks/page.tsx`)

**Endpoints:**

- `POST /api/webhooks`
- `GET /api/webhooks`
- `GET /api/webhooks/company/{companyId}`
- `GET /api/webhooks/{id}`
- `DELETE /api/webhooks/{id}`
- `GET /api/webhooks/{id}/deliveries`
- `POST /api/webhooks/retry-failed`

## Phase 6: Analytics & Reporting

### 6.1 Company Usage Analytics

**Implementation:**

1. **Domain Model** (`domain/models/analytics.model.ts`)

   - `CompanyUsageAnalytics` class
   - `ApiUsageAnalytics` class

2. **Mapper** (`domain/mappers/analytics.mapper.ts`)

3. **Service** (`services/analytics.service.ts`)

   - `getCompanyUsage(companyId: string)`
   - `getApiUsage()`
   - `getApiUsageByEndpoint()`
   - `getApiUsageByCompany()`

4. **ViewModel** (`viewmodels/analytics-viewmodel.tsx`)

5. **View** (`components/app_views/analytics-view.tsx`)

   - Charts using existing chart components
   - Date range filters

6. **Page** (`app/analytics/page.tsx`)

**Endpoints:**

- `GET /api/analytics/company/{companyId}/usage`
- `GET /api/analytics/api-usage`
- `GET /api/analytics/api-usage/by-endpoint`
- `GET /api/analytics/api-usage/by-company`

### 6.2 Reports

**Implementation:**

1. **Domain Model** (`domain/models/report.model.ts`)

   - `ReportType` enum
   - `GenerateReportRequest`
   - `ReportResponse`

2. **Mapper** (`domain/mappers/report.mapper.ts`)

3. **Service** (`services/report.service.ts`)

   - `getAvailableReports()`
   - `generateReport(reportType: number, params: GenerateReportRequest)`
   - `downloadReport(reportType: number, format: 'csv' | 'excel' | 'pdf')`

4. **ViewModel** (`viewmodels/report-viewmodel.tsx`)

5. **View** (`views/report-view.tsx`)

   - List of available reports
   - Generate dialog with parameters
   - Download buttons

6. **Page** (`app/reports/page.tsx`)

**Endpoints:**

- `GET /api/reports`
- `POST /api/reports/{reportType}/generate`
- `GET /api/reports/{reportType}/download?format=csv|excel|pdf`

## Phase 7: System Management

### 7.1 Metrics & Monitoring

**Implementation:**

1. **Domain Model** (`domain/models/metric.model.ts`)
2. **Mapper** (`domain/mappers/metric.mapper.ts`)
3. **Service** (`services/metric.service.ts`)
4. **ViewModel** (`viewmodels/metric-viewmodel.tsx`)
5. **View** (`components/app_views/metrics-view.tsx`)
6. **Page** (`app/metrics/page.tsx`)

**Endpoints:**

- `GET /api/metrics/summary`
- `GET /api/metrics/history`
- `POST /api/metrics/aggregate`
- `POST /api/metrics/cleanup`

### 7.2 Error Logs

**Implementation:**

1. **Domain Model** (`domain/models/error-log.model.ts`)
2. **Mapper** (`domain/mappers/error-log.mapper.ts`)
3. **Service** (`services/error-log.service.ts`)
4. **ViewModel** (`viewmodels/error-log-viewmodel.tsx`)
5. **View** (`views/error-log-view.tsx`)
6. **Page** (`app/error-logs/page.tsx`)

**Endpoints:**

- `GET /api/errors`
- `GET /api/errors/{errorId}`
- `POST /api/errors/cleanup`

### 7.3 Password Policy

**Implementation:**

1. **Domain Model** (`domain/models/password-policy.model.ts`)
2. **Mapper** (`domain/mappers/password-policy.mapper.ts`)
3. **Service** (`services/password-policy.service.ts`)
4. **ViewModel** (`viewmodels/password-policy-viewmodel.tsx`)
5. **View** (`components/app_views/settings/password-policy-view.tsx`)
6. **Integration:** Add to settings page

**Endpoints:**

- `GET /api/password-policy`
- `PUT /api/password-policy`
- `POST /api/password-policy/validate`

### 7.4 Login Attempts Tracking

**Implementation:**

1. **Domain Model** (`domain/models/login-attempt.model.ts`)
2. **Mapper** (`domain/mappers/login-attempt.mapper.ts`)
3. **Service** (`services/login-attempt.service.ts`)
4. **ViewModel** (`viewmodels/login-attempt-viewmodel.tsx`)
5. **View** (`views/login-attempt-view.tsx`)
6. **Page** (`app/login-attempts/page.tsx`)

**Endpoints:**

- `GET /api/login-attempts`
- `GET /api/login-attempts/username/{username}/failed`

### 7.5 Health Check

**Implementation:**

1. **Domain Model** (`domain/models/health.model.ts`)
2. **Mapper** (`domain/mappers/health.mapper.ts`)
3. **Service** (`services/health.service.ts`)
4. **Component:** `components/ui/health-indicator.tsx` - Status badge in header
5. **Integration:** Add to dashboard layout header

**Endpoints:**

- `GET /api/health` (AllowAnonymous)

## Phase 8: Search & Navigation

### 8.1 Global Search

**Implementation:**

1. **Domain Model** (`domain/models/search.model.ts`)
2. **Mapper** (`domain/mappers/search.mapper.ts`)
3. **Service** (`services/search.service.ts`)
4. **Component:** `components/ui/global-search.tsx` - Search bar in header
5. **Integration:** Add to dashboard layout

**Endpoints:**

- `POST /api/search`
- `GET /api/search`
- `GET /api/search/entity-types`
- `GET /api/search/suggestions`
- `GET /api/search/stats`

### 8.2 Menu Items Management (Dynamic Navigation)

**Implementation:**

1. **Domain Model** - Already exists (`navigation.model.ts`)
2. **Mapper** - Already exists (`navigation.mapper.ts`)
3. **Service** - Already exists (`navigation.service.ts`)
4. **ViewModel** (`viewmodels/menu-item-viewmodel.tsx`)
5. **View** (`views/menu-item-view.tsx`)

   - Tree view with drag-and-drop

6. **Page** (`app/menu-items/page.tsx`) - SuperAdmin only

**Endpoints:**

- `GET /api/menuitems`
- `GET /api/menuitems/{id}`
- `POST /api/menuitems` (SuperAdminOnly)
- `PUT /api/menuitems/{id}` (SuperAdminOnly)
- `DELETE /api/menuitems/{id}` (SuperAdminOnly)

## Phase 9: File Management

### 9.1 File Upload/Download

**Implementation:**

1. **Domain Model** (`domain/models/file-upload.model.ts`)

   - `UploadSession`, `DownloadSession` classes

2. **Mapper** (`domain/mappers/file-upload.mapper.ts`)

3. **Service** (`services/file-upload.service.ts`)

   - Chunked upload/download methods

4. **Components:**

   - `components/ui/file-upload.tsx` - Chunked upload with progress
   - `components/ui/file-download.tsx` - Chunked download with progress

**Endpoints:**

- `POST /api/uploads/initiate`
- `PUT /api/uploads/{uploadId}/chunk`
- `GET /api/uploads/{uploadId}/status`
- `POST /api/uploads/{uploadId}/complete`
- `DELETE /api/uploads/{uploadId}`
- `POST /api/downloads/initiate`
- `GET /api/downloads/{downloadId}/status`
- `GET /api/downloads/{downloadId}/chunk`
- `GET /api/downloads/file`
- `GET /api/downloads/info`

## Phase 10: Dashboard Updates

### 10.1 Enhanced Dashboard

**Updates:**

- Add trial companies count
- Add module usage statistics
- Add API usage charts
- Add error rate indicator
- Quick action links to new features

**Files:**

- `viewmodels/dashboard-viewmodel.tsx` - Add new metrics
- `components/app_views/dashboard-view.tsx` - Add new cards/charts

## Implementation Notes

### Bulk Operations Pattern

For all bulk operations, use the existing `BulkAction` interface:

```typescript
bulkActions: [
  {
    label: t("action.label"),
    onClick: async (selectedIds: string[]) => {
      // Show confirmation/date picker if needed
      await service.bulkAction(selectedIds, params);
      await vm.refreshItems();
    },
    confirmTitle: t("action.confirmTitle"),
    confirmDescription: t("action.confirmDescription", { count: "{count}" }),
    variant: "default",
  },
],
enableBulkActions: true,
```

### API Response Handling

All API responses follow SYNFLOX format:

```typescript
{
  statusCode: number,
  message: string,
  data: T | null,
  errors: string[],
  pagination?: PaginationDto
}
```

Mappers must handle:

- Direct `data` property
- Nested `data.companies` or `data.items` arrays
- Pagination mapping (`currentPage` → `page`)

### ID Encryption

- All IDs are encrypted GUIDs (strings)
- Never decrypt in frontend
- Use encrypted IDs as-is in all API calls

### Localization

- All user-facing text must use `t()` function
- Add translations to `locales/en.ts` and `locales/ar.ts`
- Use structured keys: `feature.section.key`

### Error Handling

- Services use `NotificationService` for user feedback
- Always show backend `message` to users
- Log `errors` array for debugging

## Testing Checklist

For each feature:

- [ ] Domain model with business logic
- [ ] Mapper handles all response formats
- [ ] Service methods with error handling
- [ ] ViewModel uses generic hooks where possible
- [ ] View follows GenericCrudView pattern
- [ ] Page wraps in DashboardLayout
- [ ] Translations added (en + ar)
- [ ] Endpoints added to config
- [ ] Service registered in provider
- [ ] Exports updated in domain/index.ts

## Priority Order

1. **Phase 1** - Update existing (Company, Licensing)
2. **Phase 2** - Core features (History, Notifications, Bulk Ops)
3. **Phase 3** - Plans & Modules
4. **Phase 4** - Company enhancements
5. **Phase 5** - API features
6. **Phase 6** - Analytics & Reports
7. **Phase 7** - System management
8. **Phase 8** - Search & Navigation
9. **Phase 9** - File management
10. **Phase 10** - Dashboard updates

#### Phase 1: Update Existing Features ✅ COMPLETED

- [x] Update Company domain model to add isTrial, trialEndDate, subscriptionPlanId fields
- [x] Update Company mapper to handle new fields in fromJson and handleApiResponse
- [x] Update Company service to handle new fields and add export/import methods
- [x] Add bulk operations (bulkActivate, bulkSuspend, bulkResume, bulkExtend) and trial operations (startTrial, convertTrial) to Licensing service
- [x] Add bulk actions toolbar to company view using BulkAction interface in GenericCrudView config

#### Phase 2: Core New Features ✅ COMPLETED

- [x] Implement Subscription History feature: Domain Model → Mapper → Service → ViewModel → View → Page
- [x] Implement Notifications System: Domain Model → Mapper → Service → ViewModel → Notification Bell Component → Notifications Page

#### Phase 3: Subscription & Plans Management ✅ COMPLETED

- [x] Implement Subscription Plans CRUD: Domain Model → Mapper → Service → ViewModel → View → Page
- [x] Implement Projects CRUD: Domain Model → Mapper → Service → ViewModel → View → Page
- [x] Implement Modules CRUD: Domain Model → Mapper → Service → ViewModel → View → Page
- [x] Implement Project-Module relationships: Domain Model → Service → Integration in Project/Module views

#### Phase 4: Company Management Enhancements ✅ COMPLETED

- [x] Implement Company Groups: Domain Model → Mapper → Service → ViewModel → View → Page with bulk operations
- [x] Implement Company Custom Fields: Domain Model → Mapper → Service → Integration in company detail view as tab
- [x] Implement Company Export/Import: Export method added, Import method added

#### Phase 5: API Integration Features ✅ COMPLETED

- [x] Implement API Keys Management: Domain Model → Mapper → Service → ViewModel → View → Page with show-once key display
- [x] Implement Webhooks Management: Domain Model → Mapper → Service → ViewModel → View → Page with delivery history

#### Phase 6: Analytics & Reporting ✅ COMPLETED

- [x] Implement Analytics: Domain Model → Mapper → Service → ViewModel → View with charts → Page
- [x] Implement Reports: Domain Model → Mapper → Service → ViewModel → View → Page with generate/download

#### Phase 7: System Management ✅ COMPLETED

- [x] Implement Metrics & Monitoring: Domain Model → Mapper → Service → ViewModel → View → Page
- [x] Implement Error Logs: Domain Model → Mapper → Service → ViewModel → View → Page
- [x] Implement Password Policy: Domain Model → Mapper → Service → ViewModel → Integration in Settings page
- [x] Implement Login Attempts Tracking: Domain Model → Mapper → Service → ViewModel → View → Page
- [x] Implement Health Check: Domain Model → Mapper → Service → Component (status indicator) → Integration in header

#### Phase 8: Search & Navigation ✅ COMPLETED

- [x] Implement Global Search: Domain Model → Mapper → Service → Component (search bar) → Integration in header
- [x] Implement Menu Items Management page: ViewModel → View with tree/drag-drop → Page (SuperAdmin only)

#### Phase 9: File Management ✅ COMPLETED

- [x] Implement File Upload/Download: Domain Model → Mapper → Service
- [x] Implement File Upload/Download: Components (chunked upload/download)

#### Phase 10: Dashboard Updates ✅ COMPLETED

- [x] Update Dashboard to include new metrics: trial count, module usage, API usage charts, error rate

#### Infrastructure Tasks ✅ COMPLETED

- [x] Update domain/index.ts, domain/mappers/index.ts, config/api-endpoints.ts, providers/service-provider.tsx for completed features
- [x] Add translation keys to locales/en.ts for completed features

### To-dos

- [x] Update Company domain model to add isTrial, trialEndDate, subscriptionPlanId fields
- [x] Update Company mapper to handle new fields in fromJson and handleApiResponse
- [x] Update Company service to handle new fields and add export/import methods
- [x] Add bulk operations (bulkActivate, bulkSuspend, bulkResume, bulkExtend) and trial operations (startTrial, convertTrial) to Licensing service
- [x] Implement Subscription History feature: Domain Model → Mapper → Service → ViewModel → View → Page
- [x] Implement Notifications System: Domain Model → Mapper → Service → ViewModel → Notification Bell Component → Notifications Page
- [x] Add bulk actions toolbar to company view using BulkAction interface in GenericCrudView config
- [x] Add bulk actions toolbar to admin view using BulkAction interface in GenericCrudView config
- [x] Add bulk actions toolbar to admin-type view using BulkAction interface in GenericCrudView config
- [x] Implement Subscription Plans CRUD: Domain Model → Mapper → Service → ViewModel → View → Page
- [x] Implement Projects CRUD: Domain Model → Mapper → Service → ViewModel → View → Page
- [x] Implement Modules CRUD: Domain Model → Mapper → Service → ViewModel → View → Page
- [x] Implement Project-Module relationships: Domain Model → Service → Integration in Project/Module views
- [x] Implement Company Groups: Domain Model → Mapper → Service → ViewModel → View → Page with bulk operations
- [x] Implement Company Custom Fields: Domain Model → Mapper → Service → Integration in company detail view as tab
- [x] Implement API Keys Management: Domain Model → Mapper → Service → ViewModel → View → Page with show-once key display
- [x] Implement Webhooks Management: Domain Model → Mapper → Service → ViewModel → View → Page with delivery history
- [x] Implement Analytics: Domain Model → Mapper → Service → ViewModel → View with charts → Page
- [x] Implement Reports: Domain Model → Mapper → Service → ViewModel → View → Page with generate/download
- [x] Implement Metrics & Monitoring: Domain Model → Mapper → Service → ViewModel → View → Page
- [x] Implement Error Logs: Domain Model → Mapper → Service → ViewModel → View → Page
- [x] Implement Password Policy: Domain Model → Mapper → Service → ViewModel → Integration in Settings page
- [x] Implement Login Attempts Tracking: Domain Model → Mapper → Service → ViewModel → View → Page
- [x] Implement Health Check: Domain Model → Mapper → Service → Component (status indicator) → Integration in header
- [x] Implement Global Search: Domain Model → Mapper → Service → Component (search bar) → Integration in header
- [x] Implement Menu Items Management page: ViewModel → View with tree/drag-drop → Page (SuperAdmin only)
- [x] Implement File Upload/Download: Domain Model → Mapper → Service → Components (chunked upload/download)
- [x] Update Dashboard to include new metrics: trial count, module usage, API usage charts, error rate
- [x] Update domain/index.ts, domain/mappers/index.ts, config/api-endpoints.ts, providers/service-provider.tsx for all new features
- [x] Add all translation keys to locales/en.ts and locales/ar.ts for all new features