<!-- 789ecded-0cf2-47aa-b90f-cf1d8233d7ba ee149aa4-b5e4-49ee-80cb-3672763ed16c -->
# SYNFLOX Frontend Implementation Plan

## Phase 1: Cleanup - Delete Demo Features

### Delete Files:

- `app/demo/` directory (products, tree, rich-text-editor)
- `views/product-view.tsx`
- `views/tree-node-view.tsx`
- `views/rich-text-editor-demo-view.tsx`
- `viewmodels/product-viewmodel.ts`
- `viewmodels/tree-node-viewmodel.ts`
- `viewmodels/rich-text-editor-viewmodel.ts`
- `services/product.service.ts`
- `services/tree-node.service.ts`
- `domain/models/product.model.ts`
- `domain/models/tree-node.model.ts`
- `domain/mappers/product.mapper.ts`
- `domain/mappers/tree-node.mapper.ts`

### Clean Up References:

- Remove demo exports from `domain/index.ts`
- Remove demo exports from `domain/mappers/index.ts`
- Remove demo services from `providers/service-provider.tsx`
- Remove demo endpoints from `config/api-endpoints.ts`
- Remove demo navigation items from `config/navigation.ts`
- Remove demo translations from `locales/en.ts` and `locales/ar.ts`

## Phase 2: Core Infrastructure Updates

### Update ApiService (`services/api.service.ts`):

- Add `Accept-Language` header automatically based on i18n language
- Get current language from i18n provider context or settings
- Set header format: `Accept-Language: ar` or `Accept-Language: en`

### Update Authentication (`services/auth.service.ts`):

- Replace mock login with real API call to `/api/admin/auth/login`
- Update to handle SYNFLOX response format: `{ success, accessToken, refreshToken, errorMessage?, admin }`
- Update `AuthResponse` model to include `errorMessage` field
- Update refresh token endpoint to `/api/admin/auth/refresh-token`
- Update logout endpoint to `/api/admin/auth/logout`

### Update Auth Domain Model (`domain/models/auth.model.ts`):

- Add `errorMessage?: string` to `AuthResponseData` interface
- Update `AuthResponse` class to include `errorMessage` property

### Update API Endpoints (`config/api-endpoints.ts`):

- Replace existing endpoints with SYNFLOX endpoints
- Add all Company, Licensing, Admin, and Admin Type endpoints

## Phase 3: Company Management Feature

### Create Domain Model (`domain/models/company.model.ts`):

- `CompanyData` interface with all fields (id, name, isActive, expiryDate, contactEmail, contactPhone, address, licenseKey, timestamps)
- `Company` class with readonly properties, `displayName` getter, `status` getter (Active/Expired/Suspended)
- `CreateCompanyRequest` and `UpdateCompanyRequest` classes with validation

### Create Mapper (`domain/mappers/company.mapper.ts`):

- `CompanyMapper` class with static methods
- `fromJson()` - Convert API response to Company domain model
- `createRequestToJson()` and `updateRequestToJson()`
- `handleApiResponse()` - Handle backend format: `{ statusCode, message, data: { companies, pagination } }`

### Create Service (`services/company.service.ts`):

- `ICompanyService` interface
- `CompanyService` class implementing interface
- Methods: `getCompanies()`, `getCompanyById()`, `createCompany()`, `updateCompany()`, `deleteCompany()`
- Use mappers for all conversions
- Handle backend response format: `{ statusCode, message, data }`

### Create ViewModel (`viewmodels/company-viewmodel.ts`):

- Use `useGenericCrudViewModel` hook
- Configure columns: name, status, expiryDate, contactEmail
- Configure create/edit fields with proper types (text, date, email, textarea, checkbox)
- Use `search` parameter (not `PageSearch`)

### Create View (`views/company-view.tsx`):

- Client component using `GenericCrudView`
- Use `useCompanyViewModel` hook

### Create Page (`app/companies/page.tsx`):

- Server component wrapping `CompanyView` in `DashboardLayout`

## Phase 4: Licensing Operations Feature

### Create Domain Model (`domain/models/licensing.model.ts`):

- `ActivateCompanyRequest` with `expiryDate` field
- `ExtendCompanyRequest` with `newExpiryDate` field
- `CompanyStatusResponse` with status enum (Active=1, Expired=2, Suspended=3)
- `GenerateLicenseKeyResponse` with `licenseKey` and `message`
- `ValidateLicenseKeyRequest` and `LicenseKeyValidationResponse`
- `LicenseStatus` enum

### Create Mapper (`domain/mappers/licensing.mapper.ts`):

- Static methods for converting licensing-related requests/responses
- Handle backend response format

### Create Service (`services/licensing.service.ts`):

- `ILicensingService` interface
- `LicensingService` class with methods:
- `activateCompany(id, request)`
- `suspendCompany(id)`
- `resumeCompany(id)`
- `extendCompany(id, request)`
- `getCompanyStatus(id)` - public endpoint, no auth
- `generateLicenseKey(id)`
- `regenerateLicenseKey(id)`
- `validateLicenseKey(request)` - public endpoint, no auth

### Create ViewModel (`viewmodels/licensing-viewmodel.ts`):

- Custom hook with methods for licensing operations
- Loading state management
- Return methods: `activateCompany`, `suspendCompany`, `resumeCompany`, `extendCompany`, `generateLicenseKey`

### Integrate Licensing Actions:

- Add licensing action buttons to Company view (activate, suspend, resume, extend)
- Add license key generation button in Company view
- Show license key in modal/dialog when generated

## Phase 5: Admin Management Feature

### Create Domain Model (`domain/models/admin.model.ts`):

- `AdminData` interface with admin fields
- `Admin` class with readonly properties
- `CreateAdminRequest` and `UpdateAdminRequest` classes

### Create Mapper (`domain/mappers/admin.mapper.ts`):

- `AdminMapper` class with static methods
- Handle backend response format

### Create Service (`services/admin.service.ts`):

- `IAdminService` interface
- `AdminService` class with full CRUD operations

### Create ViewModel (`viewmodels/admin-viewmodel.ts`):

- Use `useGenericCrudViewModel` hook
- Configure columns and form fields

### Create View (`views/admin-view.tsx`):

- Client component using `GenericCrudView`

### Create Page (`app/admins/page.tsx`):

- Server component wrapping `AdminView` in `DashboardLayout`

## Phase 6: Admin Type Management Feature

### Create Domain Model (`domain/models/admin-type.model.ts`):

- `AdminTypeData` interface
- `AdminType` class with readonly properties
- `CreateAdminTypeRequest` and `UpdateAdminTypeRequest` classes

### Create Mapper (`domain/mappers/admin-type.mapper.ts`):

- `AdminTypeMapper` class with static methods

### Create Service (`services/admin-type.service.ts`):

- `IAdminTypeService` interface
- `AdminTypeService` class with full CRUD operations

### Create ViewModel (`viewmodels/admin-type-viewmodel.ts`):

- Use `useGenericCrudViewModel` hook

### Create View (`views/admin-type-view.tsx`):

- Client component using `GenericCrudView`

### Create Page (`app/admin-types/page.tsx`):

- Server component wrapping `AdminTypeView` in `DashboardLayout`

## Phase 7: Configuration & Integration

### Update Service Provider (`providers/service-provider.tsx`):

- Remove `ProductService` and `TreeNodeService`
- Add `CompanyService`, `LicensingService`, `AdminService`, `AdminTypeService`
- Update `Services` interface

### Update Domain Exports (`domain/index.ts`):

- Remove Product and TreeNode exports
- Add Company, Licensing, Admin, AdminType exports
- Export all mappers and response types

### Update Mapper Exports (`domain/mappers/index.ts`):

- Remove ProductMapper and TreeNodeMapper
- Add CompanyMapper, LicensingMapper, AdminMapper, AdminTypeMapper

### Update Navigation (`config/navigation.ts`):

- Remove demo navigation items
- Add Companies, Admins, Admin Types navigation items
- Add licensing submenu if needed

### Update Translations (`locales/en.ts` and `locales/ar.ts`):

- Remove product, tree-node, rich-text-editor translations
- Add Company translations (title, description, fields, status, actions)
- Add Licensing translations (activate, suspend, resume, extend, generateKey, etc.)
- Add Admin translations
- Add Admin Type translations

## Phase 8: Testing & Validation

### Verify:

- All demo features removed
- All new features follow architecture patterns
- API endpoints correctly configured
- Accept-Language header added to all requests
- Authentication works with SYNFLOX API
- All CRUD operations work
- Licensing operations work
- Translations exist for EN and AR
- Navigation updated
- No broken imports or references

### To-dos

- [x] Delete all demo feature files (products, tree-node, rich-text-editor) from app/, views/, viewmodels/, services/, domain/models/, domain/mappers/
- [x] Remove demo references from domain/index.ts, domain/mappers/index.ts, service-provider.tsx, api-endpoints.ts, navigation.ts, and locale files
- [x] Add Accept-Language header to ApiService automatically based on i18n language
- [x] Update AuthResponse model to include errorMessage field matching SYNFLOX API format
- [x] Replace mock auth with real SYNFLOX API calls (login, refresh, logout) using correct endpoints and response format
- [x] Replace all API endpoints with SYNFLOX endpoints (auth, companies, licensing, admins, admin-types)
- [x] Create domain/models/company.model.ts with Company, CreateCompanyRequest, UpdateCompanyRequest classes
- [x] Create domain/mappers/company.mapper.ts with CompanyMapper handling backend response format
- [x] Create services/company.service.ts with full CRUD operations using CompanyMapper
- [x] Create viewmodels/company-viewmodel.ts using useGenericCrudViewModel with proper columns and form fields
- [x] Create views/company-view.tsx using GenericCrudView component
- [x] Create app/companies/page.tsx wrapping CompanyView in DashboardLayout
- [x] Create domain/models/licensing.model.ts with ActivateCompanyRequest, ExtendCompanyRequest, CompanyStatusResponse, GenerateLicenseKeyResponse, ValidateLicenseKeyRequest, LicenseStatus enum
- [x] Create domain/mappers/licensing.mapper.ts with LicensingMapper for all licensing operations
- [x] Create services/licensing.service.ts with activate, suspend, resume, extend, generateKey, regenerateKey, validateKey, getStatus methods
- [x] Create viewmodels/licensing-viewmodel.ts with methods for all licensing operations
- [x] Add licensing action buttons (activate, suspend, resume, extend, generate key) to Company view
- [x] Create domain/models/admin.model.ts with Admin, CreateAdminRequest, UpdateAdminRequest classes
- [x] Create domain/mappers/admin.mapper.ts with AdminMapper handling backend response format
- [x] Create services/admin.service.ts with full CRUD operations
- [x] Create viewmodels/admin-viewmodel.ts using useGenericCrudViewModel
- [x] Create views/admin-view.tsx using GenericCrudView
- [x] Create app/admins/page.tsx wrapping AdminView in DashboardLayout
- [x] Create domain/models/admin-type.model.ts with AdminType, CreateAdminTypeRequest, UpdateAdminTypeRequest classes
- [x] Create domain/mappers/admin-type.mapper.ts with AdminTypeMapper
- [x] Create services/admin-type.service.ts with full CRUD operations
- [x] Create viewmodels/admin-type-viewmodel.ts using useGenericCrudViewModel
- [x] Create views/admin-type-view.tsx using GenericCrudView
- [x] Create app/admin-types/page.tsx wrapping AdminTypeView in DashboardLayout
- [x] Update providers/service-provider.tsx: remove ProductService/TreeNodeService, add CompanyService/LicensingService/AdminService/AdminTypeService
- [x] Update domain/index.ts: remove Product/TreeNode exports, add Company/Licensing/Admin/AdminType exports
- [x] Update domain/mappers/index.ts: remove ProductMapper/TreeNodeMapper, add CompanyMapper/LicensingMapper/AdminMapper/AdminTypeMapper
- [x] Update config/navigation.ts: remove demo items, add Companies/Admins/Admin Types navigation items
- [x] Update locales/en.ts and locales/ar.ts: remove demo translations, add Company/Licensing/Admin/AdminType translations