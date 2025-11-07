# Application Architecture Guide

This document provides a comprehensive guide to the application's architecture, structure, and patterns. Use this as a reference when building new features.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Directory Structure](#directory-structure)
3. [Feature Architecture](#feature-architecture)
4. [Layer-by-Layer Breakdown](#layer-by-layer-breakdown)
5. [Patterns and Conventions](#patterns-and-conventions)
6. [Complete Feature Example](#complete-feature-example)
7. [Provider System](#provider-system)
8. [Hooks System](#hooks-system)
9. [Component System](#component-system)

---

## Architecture Overview

This application follows a **Clean Architecture** pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  (Pages, Views, Components)                              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    ViewModel Layer                       │
│  (Business Logic, State Management)                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    Service Layer                         │
│  (API Communication, External Services)                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    Domain Layer                          │
│  (Models, Mappers, Business Entities)                   │
└─────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Dependency Inversion**: Higher layers depend on abstractions
3. **Single Responsibility**: Each file/class has one clear purpose
4. **Type Safety**: Full TypeScript support throughout
5. **Reusability**: Generic components and hooks for common patterns

---

## Directory Structure

```
synflox-frontend/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Home page
│   ├── layout.tsx                # Root layout
│   ├── login/
│   │   └── page.tsx              # Login page
│   ├── profile/
│   │   └── page.tsx              # Profile page
│   └── demo/
│       └── products/
│           └── page.tsx          # Product demo page
│
├── components/                    # React components
│   ├── app_views/                # Feature-specific views
│   │   ├── home-view.tsx
│   │   ├── login-view.tsx
│   │   ├── profile-view.tsx
│   │   └── settings-view.tsx
│   ├── auth/                     # Authentication components
│   ├── charts/                    # Chart components
│   ├── forms/                     # Form components
│   ├── layout/                    # Layout components
│   ├── navigation/                # Navigation components
│   └── ui/                        # Reusable UI components
│
├── views/                        # Standalone view components
│   ├── product-view.tsx
│   └── tree-node-view.tsx
│
├── viewmodels/                   # ViewModel layer
│   ├── product-viewmodel.ts
│   └── tree-node-viewmodel.ts
│
├── hooks/                        # Custom React hooks
│   ├── use-generic-crud-viewmodel.ts
│   ├── use-profile-viewmodel.ts
│   └── use-crud-view-model.ts
│
├── services/                     # Service layer
│   ├── api.service.ts            # Base API service
│   ├── auth.service.ts
│   ├── product.service.ts
│   └── user.service.ts
│
├── domain/                       # Domain layer
│   ├── models/                   # Domain models
│   │   ├── product.model.ts
│   │   ├── user.model.ts
│   │   └── auth.model.ts
│   └── mappers/                  # Data mappers
│       ├── product.mapper.ts
│       ├── user.mapper.ts
│       └── index.ts
│
├── providers/                    # React context providers
│   ├── app-provider.tsx
│   ├── auth-provider.tsx
│   ├── service-provider.tsx
│   └── i18n-provider.tsx
│
├── config/                       # Configuration files
│   ├── api-endpoints.ts
│   └── navigation.ts
│
├── lib/                          # Utility libraries
│   ├── utils.ts
│   ├── validation.ts
│   └── error-handler.ts
│
└── locales/                      # Internationalization
    ├── en.ts
    └── ar.ts
```

---

## Feature Architecture

When building a new feature, follow this structure:

### Feature Components

1. **Page** (`app/[feature]/page.tsx`) - Next.js route entry point
2. **View** (`components/app_views/[feature]-view.tsx` or `views/[feature]-view.tsx`) - UI component
3. **ViewModel** (`viewmodels/[feature]-viewmodel.ts`) - Business logic and state
4. **Service** (`services/[feature].service.ts`) - API communication
5. **Model** (`domain/models/[feature].model.ts`) - Domain entities
6. **Mapper** (`domain/mappers/[feature].mapper.ts`) - Data transformation

### Data Flow

```
User Interaction
    ↓
Page Component
    ↓
View Component
    ↓
ViewModel Hook
    ↓
Service Layer
    ↓
API Service
    ↓
Backend API
```

---

## Layer-by-Layer Breakdown

### 1. Page Layer (`app/[feature]/page.tsx`)

**Purpose**: Next.js route entry point. Minimal logic, mainly composition.

**Pattern**:
```typescript
import { FeatureView } from "@/views/feature-view";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function FeaturePage() {
  return (
    <DashboardLayout>
      <FeatureView />
    </DashboardLayout>
  );
}
```

**Characteristics**:
- Server or client component (usually server)
- Wraps view in layout
- Minimal logic
- Can handle route-level concerns (metadata, params)

**Example**: `app/demo/products/page.tsx`

---

### 2. View Layer (`views/[feature]-view.tsx` or `components/app_views/[feature]-view.tsx`)

**Purpose**: UI presentation. Handles rendering, user interactions, and delegates logic to ViewModel.

**Pattern**:
```typescript
"use client";

import { useFeatureViewModel } from "@/viewmodels/feature-viewmodel";
import { GenericCrudView } from "@/components/ui/generic-crud-view";
import { useI18n } from "@/providers/i18n-provider";

export function FeatureView() {
  const { t } = useI18n();
  const { vm, config } = useFeatureViewModel();

  return <GenericCrudView viewModel={vm} config={config} />;
}
```

**Characteristics**:
- Client component (`"use client"`)
- Uses ViewModel for business logic
- Composes UI components
- Handles user interactions
- Minimal state (only UI state like modals)

**Example**: `views/product-view.tsx`

---

### 3. ViewModel Layer (`viewmodels/[feature]-viewmodel.ts`)

**Purpose**: Business logic, state management, and orchestration between View and Service.

**Pattern**:
```typescript
"use client";

import { useState, useCallback, useMemo } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useGenericCrudViewModel } from "@/hooks/use-generic-crud-viewmodel";
import type { Feature, CreateFeatureRequest, UpdateFeatureRequest } from "@/domain";

export function useFeatureViewModel() {
  const { featureService } = useServices();
  const { t } = useI18n();

  // Use generic CRUD view model for standard operations
  const vm = useGenericCrudViewModel<Feature, CreateFeatureRequest, UpdateFeatureRequest, { data: Feature[]; pagination: any }>(
    {
      getData: featureService.getFeatures.bind(featureService),
      create: featureService.createFeature.bind(featureService),
      update: featureService.updateFeature.bind(featureService),
      delete: featureService.deleteFeature.bind(featureService),
    },
    {
      itemTypeName: t("feature.item"),
      itemTypeNamePlural: t("feature.items"),
      getItemDisplayName: (feature: Feature) => feature.displayName,
      searchParamName: "PageSearch",
    }
  );

  // Custom configuration for the view
  const config = useMemo(() => ({
    titleKey: "feature.title",
    columns: [
      // Column definitions
    ],
    createFields: [
      // Form field definitions
    ],
    editFields: [
      // Form field definitions
    ],
  }), [t]);

  return { vm, config };
}
```

**Characteristics**:
- Client-side hook
- Manages state and business logic
- Uses services for data operations
- Returns configuration for views
- Can use generic hooks (`useGenericCrudViewModel`) or custom logic

**Example**: `viewmodels/product-viewmodel.ts`

---

### 4. Service Layer (`services/[feature].service.ts`)

**Purpose**: API communication, data fetching, and external service integration.

**Pattern**:
```typescript
import type { INotificationService } from "./notification.service";
import type { PaginationInfo } from "@/lib/pagination";
import {
  Feature,
  FeatureMapper,
  CreateFeatureRequest,
  UpdateFeatureRequest,
  type FeaturesResponse,
} from "@/domain";

export interface IFeatureService {
  getFeatures(params?: {
    page?: number;
    pageSize?: number;
    PageSearch?: string;
  }): Promise<FeaturesResponse>;
  getFeatureById(id: string): Promise<Feature>;
  createFeature(data: CreateFeatureRequest): Promise<Feature>;
  updateFeature(id: string, data: UpdateFeatureRequest): Promise<Feature>;
  deleteFeature(id: string): Promise<void>;
}

export class FeatureService implements IFeatureService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  async getFeatures(params?: {
    page?: number;
    pageSize?: number;
    PageSearch?: string;
  }): Promise<FeaturesResponse> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.FEATURES_GET_ALL,
        params
      );
      return FeatureMapper.handleApiResponse(response);
    } catch (e) {
      this.notificationService.error("Failed to fetch features");
      throw e;
    }
  }

  async createFeature(data: CreateFeatureRequest): Promise<Feature> {
    try {
      const json = FeatureMapper.createRequestToJson(data);
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.FEATURES_CREATE,
        json
      );
      this.notificationService.success("Feature created successfully");
      return FeatureMapper.fromJson(response);
    } catch (e) {
      this.notificationService.error("Failed to create feature");
      throw e;
    }
  }

  // ... other methods
}
```

**Characteristics**:
- Uses `ApiService` for HTTP requests
- Uses `NotificationService` for user feedback
- Converts between domain models and API JSON
- Handles errors and notifications
- Returns domain models (not raw JSON)

**Example**: `services/product.service.ts`

---

### 5. Domain Model Layer (`domain/models/[feature].model.ts`)

**Purpose**: Core business entities with business logic and validation.

**Pattern**:
```typescript
/**
 * Feature Domain Model
 * 
 * Represents the core feature entity in the domain layer.
 * This model is independent of external concerns and focuses
 * purely on feature data and business logic.
 */

export interface FeatureData {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
  createdAt: string;
  lastUpdated: string;
}

export class Feature {
  public readonly id: string;
  public readonly name: string;
  public readonly description?: string;
  public readonly status: "active" | "inactive";
  public readonly createdAt: string;
  public readonly lastUpdated: string;

  constructor(data: FeatureData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.lastUpdated = data.lastUpdated;
  }

  /**
   * Get feature's display name
   */
  get displayName(): string {
    return this.name;
  }

  /**
   * Check if feature is active
   */
  get isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * Create a copy of the feature with updated data
   */
  update(updates: Partial<FeatureData>): Feature {
    return new Feature({
      ...this,
      ...updates,
    });
  }
}

/**
 * Create Feature Request Model
 */
export interface CreateFeatureRequestData {
  name: string;
  description?: string;
  status: "active" | "inactive";
}

export class CreateFeatureRequest {
  public readonly name: string;
  public readonly description?: string;
  public readonly status: "active" | "inactive";

  constructor(data: CreateFeatureRequestData) {
    this.name = data.name;
    this.description = data.description;
    this.status = data.status || "active";
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(this.name && this.name.trim().length > 0);
  }
}

/**
 * Update Feature Request Model
 */
export interface UpdateFeatureRequestData {
  id: string;
  name?: string;
  description?: string;
  status?: "active" | "inactive";
}

export class UpdateFeatureRequest {
  public readonly id: string;
  public readonly name?: string;
  public readonly description?: string;
  public readonly status?: "active" | "inactive";

  constructor(data: UpdateFeatureRequestData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.status = data.status;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(this.id && (this.name === undefined || this.name.trim().length > 0));
  }
}
```

**Characteristics**:
- Immutable domain entities (readonly properties)
- Business logic in getters and methods
- Validation logic
- Separate request models for create/update
- No dependencies on external libraries

**Example**: `domain/models/product.model.ts`

---

### 6. Mapper Layer (`domain/mappers/[feature].mapper.ts`)

**Purpose**: Converts between domain models and API JSON format.

**Pattern**:
```typescript
/**
 * Feature Mappers
 * 
 * Handles conversion between feature domain models and external data formats.
 * Follows Single Responsibility Principle by separating serialization concerns
 * from domain logic.
 */

import { 
  Feature, 
  CreateFeatureRequest, 
  UpdateFeatureRequest,
  type FeatureData,
  type CreateFeatureRequestData,
  type UpdateFeatureRequestData
} from '../models/feature.model';
import type { PaginationInfo } from '@/lib/pagination';

export interface FeaturesResponse {
  data: Feature[];
  pagination: PaginationInfo;
}

export class FeatureMapper {
  /**
   * Convert JSON/API response to Feature domain model
   */
  static fromJson(json: any): Feature {
    return new Feature({
      id: json.id || '',
      name: json.name || '',
      description: json.description,
      status: json.status || 'inactive',
      createdAt: json.createdAt || new Date().toISOString(),
      lastUpdated: json.lastUpdated || new Date().toISOString(),
    });
  }

  /**
   * Convert Feature domain model to JSON for API requests
   */
  static toJson(feature: Feature): any {
    return {
      id: feature.id,
      name: feature.name,
      description: feature.description,
      status: feature.status,
      createdAt: feature.createdAt,
      lastUpdated: feature.lastUpdated,
    };
  }

  /**
   * Convert CreateFeatureRequest domain model to JSON for API requests
   */
  static createRequestToJson(request: CreateFeatureRequest): any {
    return {
      name: request.name,
      description: request.description,
      status: request.status,
    };
  }

  /**
   * Convert UpdateFeatureRequest domain model to JSON for API requests
   */
  static updateRequestToJson(request: UpdateFeatureRequest): any {
    const json: any = { id: request.id };
    
    if (request.name !== undefined) json.name = request.name;
    if (request.description !== undefined) json.description = request.description;
    if (request.status !== undefined) json.status = request.status;
    
    return json;
  }

  /**
   * Handle different API response formats and convert to FeaturesResponse
   */
  static handleApiResponse(response: any): FeaturesResponse {
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

    // Handle paginated response with data property
    if (response && typeof response === 'object' && 'data' in response) {
      return {
        data: Array.isArray(response.data) 
          ? response.data.map((item: any) => this.fromJson(item))
          : [],
        pagination: response.pagination || {
          itemsCount: 0,
          pageSize: 10,
          page: 1,
          pagesCount: 0,
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
```

**Characteristics**:
- Static methods for conversion
- Handles various API response formats
- Converts domain models to/from JSON
- No business logic, only transformation

**Example**: `domain/mappers/product.mapper.ts`

---

## Patterns and Conventions

### Naming Conventions

- **Pages**: `[feature]/page.tsx` (Next.js convention)
- **Views**: `[feature]-view.tsx` or `[Feature]View`
- **ViewModels**: `use[Feature]ViewModel` hook
- **Services**: `[Feature]Service` class
- **Models**: `[Feature]` class, `[Feature]Data` interface
- **Mappers**: `[Feature]Mapper` class
- **Hooks**: `use-[feature].ts` or `use[Feature]`

### File Organization

1. **One feature per directory** (when applicable)
2. **Barrel exports** (`index.ts`) for clean imports
3. **Type definitions** at the top of files
4. **JSDoc comments** for public APIs

### Import Order

```typescript
// 1. React and Next.js
import { useState } from "react";
import { useRouter } from "next/navigation";

// 2. Third-party libraries
import { toast } from "sonner";

// 3. Internal providers
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";

// 4. Internal hooks
import { useGenericCrudViewModel } from "@/hooks/use-generic-crud-viewmodel";

// 5. Internal components
import { GenericCrudView } from "@/components/ui/generic-crud-view";

// 6. Domain models
import type { Feature } from "@/domain";

// 7. Utilities
import { appLogger } from "@/lib/logger";
```

### Error Handling

- Use `handleError` from `@/lib/error-handler`
- Show user-friendly messages via `NotificationService`
- Log errors with `appLogger`
- Never expose technical errors to users

### State Management

- **UI State**: Local `useState` in components
- **Business State**: ViewModels or custom hooks
- **Global State**: Context providers (Auth, Settings, etc.)
- **Server State**: Services with caching when needed

---

## Complete Feature Example

Let's build a complete "Category" feature following all patterns:

### 1. Domain Model (`domain/models/category.model.ts`)

```typescript
export interface CategoryData {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  lastUpdated: string;
}

export class Category {
  public readonly id: string;
  public readonly name: string;
  public readonly description?: string;
  public readonly createdAt: string;
  public readonly lastUpdated: string;

  constructor(data: CategoryData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.createdAt = data.createdAt;
    this.lastUpdated = data.lastUpdated;
  }

  get displayName(): string {
    return this.name;
  }

  update(updates: Partial<CategoryData>): Category {
    return new Category({ ...this, ...updates });
  }
}

export interface CreateCategoryRequestData {
  name: string;
  description?: string;
}

export class CreateCategoryRequest {
  public readonly name: string;
  public readonly description?: string;

  constructor(data: CreateCategoryRequestData) {
    this.name = data.name;
    this.description = data.description;
  }

  get isValid(): boolean {
    return !!(this.name && this.name.trim().length > 0);
  }
}

export interface UpdateCategoryRequestData {
  id: string;
  name?: string;
  description?: string;
}

export class UpdateCategoryRequest {
  public readonly id: string;
  public readonly name?: string;
  public readonly description?: string;

  constructor(data: UpdateCategoryRequestData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
  }

  get isValid(): boolean {
    return !!(this.id && (this.name === undefined || this.name.trim().length > 0));
  }
}
```

### 2. Mapper (`domain/mappers/category.mapper.ts`)

```typescript
import { 
  Category, 
  CreateCategoryRequest, 
  UpdateCategoryRequest
} from '../models/category.model';
import type { PaginationInfo } from '@/lib/pagination';

export interface CategoriesResponse {
  data: Category[];
  pagination: PaginationInfo;
}

export class CategoryMapper {
  static fromJson(json: any): Category {
    return new Category({
      id: json.id || '',
      name: json.name || '',
      description: json.description,
      createdAt: json.createdAt || new Date().toISOString(),
      lastUpdated: json.lastUpdated || new Date().toISOString(),
    });
  }

  static toJson(category: Category): any {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      createdAt: category.createdAt,
      lastUpdated: category.lastUpdated,
    };
  }

  static createRequestToJson(request: CreateCategoryRequest): any {
    return {
      name: request.name,
      description: request.description,
    };
  }

  static updateRequestToJson(request: UpdateCategoryRequest): any {
    const json: any = { id: request.id };
    if (request.name !== undefined) json.name = request.name;
    if (request.description !== undefined) json.description = request.description;
    return json;
  }

  static handleApiResponse(response: any): CategoriesResponse {
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

    if (response && typeof response === 'object' && 'data' in response) {
      return {
        data: Array.isArray(response.data) 
          ? response.data.map((item: any) => this.fromJson(item))
          : [],
        pagination: response.pagination || {
          itemsCount: 0,
          pageSize: 10,
          page: 1,
          pagesCount: 0,
        }
      };
    }

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
```

### 3. Service (`services/category.service.ts`)

```typescript
import type { IApiService } from "./api.service";
import type { INotificationService } from "./notification.service";
import type { PaginationInfo } from "@/lib/pagination";
import {
  Category,
  CategoryMapper,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  type CategoriesResponse,
} from "@/domain";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export interface ICategoryService {
  getCategories(params?: {
    page?: number;
    pageSize?: number;
    PageSearch?: string;
  }): Promise<CategoriesResponse>;
  getCategoryById(id: string): Promise<Category>;
  createCategory(data: CreateCategoryRequest): Promise<Category>;
  updateCategory(id: string, data: UpdateCategoryRequest): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
}

export class CategoryService implements ICategoryService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  async getCategories(params?: {
    page?: number;
    pageSize?: number;
    PageSearch?: string;
  }): Promise<CategoriesResponse> {
    try {
      const response = await this.apiService.get<any>(
        API_ENDPOINTS.CATEGORIES_GET_ALL,
        params
      );
      return CategoryMapper.handleApiResponse(response);
    } catch (e) {
      this.notificationService.error("Failed to fetch categories");
      throw e;
    }
  }

  async getCategoryById(id: string): Promise<Category> {
    try {
      const response = await this.apiService.get<any>(
        `${API_ENDPOINTS.CATEGORIES_GET_BY_ID}/${id}`
      );
      return CategoryMapper.fromJson(response);
    } catch (e) {
      this.notificationService.error("Failed to fetch category");
      throw e;
    }
  }

  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    try {
      const json = CategoryMapper.createRequestToJson(data);
      const response = await this.apiService.post<any>(
        API_ENDPOINTS.CATEGORIES_CREATE,
        json
      );
      this.notificationService.success("Category created successfully");
      return CategoryMapper.fromJson(response);
    } catch (e) {
      this.notificationService.error("Failed to create category");
      throw e;
    }
  }

  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<Category> {
    try {
      const json = CategoryMapper.updateRequestToJson(data);
      const response = await this.apiService.put<any>(
        `${API_ENDPOINTS.CATEGORIES_UPDATE}/${id}`,
        json
      );
      this.notificationService.success("Category updated successfully");
      return CategoryMapper.fromJson(response);
    } catch (e) {
      this.notificationService.error("Failed to update category");
      throw e;
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      await this.apiService.delete(`${API_ENDPOINTS.CATEGORIES_DELETE}/${id}`);
      this.notificationService.success("Category deleted successfully");
    } catch (e) {
      this.notificationService.error("Failed to delete category");
      throw e;
    }
  }
}
```

### 4. ViewModel (`viewmodels/category-viewmodel.ts`)

```typescript
"use client";

import { useCallback, useMemo } from "react";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useGenericCrudViewModel } from "@/hooks/use-generic-crud-viewmodel";
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/domain";
import type { CrudConfig } from "@/components/ui/generic-crud-view";

export function useCategoryViewModel() {
  const { categoryService } = useServices();
  const { t } = useI18n();

  const vm = useGenericCrudViewModel<
    Category,
    CreateCategoryRequest,
    UpdateCategoryRequest,
    { data: Category[]; pagination: any }
  >(
    {
      getData: categoryService.getCategories.bind(categoryService),
      create: categoryService.createCategory.bind(categoryService),
      update: categoryService.updateCategory.bind(categoryService),
      delete: categoryService.deleteCategory.bind(categoryService),
    },
    {
      itemTypeName: t("category.item"),
      itemTypeNamePlural: t("category.items"),
      getItemDisplayName: (category: Category) => category.displayName,
      searchParamName: "PageSearch",
    }
  );

  const config: CrudConfig<Category> = useMemo(
    () => ({
      titleKey: "category.title",
      subtitleKey: "category.description",
      columns: [
        {
          key: "name",
          label: t("category.name"),
          render: (_val: unknown, category: Category) => (
            <div className="font-medium">{category.name}</div>
          ),
        },
        {
          key: "description",
          label: t("category.description"),
          render: (_val: unknown, category: Category) => (
            <span className="text-sm text-muted-foreground">
              {category.description || "-"}
            </span>
          ),
        },
      ],
      createFields: [
        {
          name: "name",
          label: t("category.name"),
          type: "text" as const,
          placeholder: t("category.namePlaceholder"),
          required: true,
        },
        {
          name: "description",
          label: t("category.description"),
          type: "textarea" as const,
          placeholder: t("category.descriptionPlaceholder"),
        },
      ],
      editFields: [
        {
          name: "name",
          label: t("category.name"),
          type: "text" as const,
          placeholder: t("category.namePlaceholder"),
          required: true,
        },
        {
          name: "description",
          label: t("category.description"),
          type: "textarea" as const,
          placeholder: t("category.descriptionPlaceholder"),
        },
        { name: "id", type: "hidden" as const, required: true },
      ],
      createInitialValues: {},
      editInitialValues: (category: Category) => ({
        name: category.name,
        description: category.description || "",
        id: category.id,
      }),
      getActions: (vm: any, t: any, handleDelete) => [
        {
          label: t("common.view"),
          onClick: (item: Category) => vm.openViewModal(item),
          variant: "ghost" as const,
        },
        {
          label: t("common.edit"),
          onClick: (item: Category) => vm.openEditModal(item),
          variant: "ghost" as const,
        },
        {
          label: t("common.delete"),
          onClick: (item: Category) => handleDelete?.(item),
          variant: "ghost" as const,
          className: "text-red-600 hover:text-red-700",
        },
      ],
    }),
    [t, vm]
  );

  const handleDelete = useCallback(async (category: Category) => {
    await categoryService.deleteCategory(category.id);
    await vm.refreshItems();
  }, [categoryService, vm]);

  return { vm, config, handleDelete };
}
```

### 5. View (`views/category-view.tsx`)

```typescript
"use client";

import { GenericCrudView } from "@/components/ui/generic-crud-view";
import { useCategoryViewModel } from "@/viewmodels/category-viewmodel";

export function CategoryView() {
  const { vm, config, handleDelete } = useCategoryViewModel();

  return (
    <GenericCrudView 
      viewModel={vm} 
      config={{
        ...config,
        getActions: (vm: any, t: any) => config.getActions(vm, t, handleDelete),
      }} 
    />
  );
}
```

### 6. Page (`app/categories/page.tsx`)

```typescript
import { CategoryView } from "@/views/category-view";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function CategoriesPage() {
  return (
    <DashboardLayout>
      <CategoryView />
    </DashboardLayout>
  );
}
```

### 7. Update Exports

**`domain/index.ts`**:
```typescript
export {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  type CategoryData,
  type CreateCategoryRequestData,
  type UpdateCategoryRequestData
} from './models/category.model';
export { CategoryMapper } from './mappers/category.mapper';
export type { CategoriesResponse } from './mappers/category.mapper';
```

**`domain/mappers/index.ts`**:
```typescript
export { CategoryMapper } from './category.mapper';
```

**`config/api-endpoints.ts`**:
```typescript
export const API_ENDPOINTS = {
  // ... existing endpoints
  CATEGORIES_GET_ALL: "/categories",
  CATEGORIES_GET_BY_ID: "/categories",
  CATEGORIES_CREATE: "/categories",
  CATEGORIES_UPDATE: "/categories",
  CATEGORIES_DELETE: "/categories",
};
```

**`providers/service-provider.tsx`**:
```typescript
import { CategoryService } from "@/services/category.service";

// In ServiceProvider component:
const categoryService = new CategoryService(apiService, notificationService);

return {
  // ... existing services
  categoryService,
};
```

---

## Provider System

The application uses a provider-based architecture for dependency injection and global state:

### Provider Hierarchy

```
ThemeProvider
  └── ServiceProvider
      └── SettingsProvider
          └── I18nProvider
              └── ErrorBoundary
                  └── AuthProvider
                      └── NavigationProvider
                          └── RouteGuard
                              └── App Content
```

### Key Providers

1. **ServiceProvider**: Provides all service instances
2. **AuthProvider**: Manages authentication state
3. **I18nProvider**: Handles internationalization
4. **SettingsProvider**: User preferences and settings
5. **ThemeProvider**: Theme management
6. **NavigationProvider**: Navigation and permissions

### Using Providers

```typescript
// In components/hooks
import { useServices } from "@/providers/service-provider";
import { useAuth } from "@/providers/auth-provider";
import { useI18n } from "@/providers/i18n-provider";

function MyComponent() {
  const { productService } = useServices();
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useI18n();
  // ...
}
```

---

## Hooks System

### Generic Hooks

1. **`useGenericCrudViewModel`**: Complete CRUD operations with pagination, search, modals
2. **`useCrudViewModel`**: Basic CRUD operations
3. **`useEnhancedDelete`**: Delete with confirmation
4. **`useEnhancedToast`**: Toast notifications
5. **`useValidation`**: Form validation

### Custom Feature Hooks

Create feature-specific hooks when you need custom logic beyond generic hooks:

```typescript
export function useCategoryViewModel() {
  // Custom logic here
  // Can use generic hooks internally
  // Returns view model interface
}
```

---

## Component System

### UI Components (`components/ui/`)

Reusable, generic components:
- `GenericCrudView`: Complete CRUD interface
- `GenericTable`: Data table with sorting, pagination
- `GenericForm`: Dynamic form builder
- `GenericModal`: Modal dialogs
- `Button`, `Input`, `Card`, etc.: Base UI components

### Feature Components (`components/app_views/` or `views/`)

Feature-specific views that compose UI components.

### Layout Components (`components/layout/`)

Layout wrappers, headers, sidebars, footers.

---

## Best Practices

1. **Always use domain models** - Never use raw JSON/API responses in components
2. **Use mappers** - Always convert through mappers
3. **Handle errors** - Use error handler and show user-friendly messages
4. **Type everything** - Use TypeScript types throughout
5. **Use generic hooks** - Prefer `useGenericCrudViewModel` for CRUD features
6. **Follow naming conventions** - Consistent naming across the codebase
7. **Document complex logic** - Add JSDoc comments for public APIs
8. **Test error cases** - Handle edge cases and errors gracefully
9. **Use i18n** - All user-facing text should be translatable
10. **Keep components small** - Single responsibility principle

---

## Summary

This architecture provides:

- ✅ **Clear separation of concerns**
- ✅ **Type safety throughout**
- ✅ **Reusable components and hooks**
- ✅ **Easy to test and maintain**
- ✅ **Scalable structure**
- ✅ **Consistent patterns**

When building a new feature, follow the layer structure:
1. Create domain model
2. Create mapper
3. Create service
4. Create viewmodel
5. Create view
6. Create page
7. Update exports and providers

This ensures consistency and maintainability across the entire application.

