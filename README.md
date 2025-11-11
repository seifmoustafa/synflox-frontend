# SYNFLOX Frontend - Admin Dashboard

A comprehensive admin dashboard for the SYNFLOX Central Licensing System, built with Next.js 14 and Clean Architecture principles. This frontend provides a complete management interface for software license administration, company management, and subscription control.

## Business Overview

The SYNFLOX Frontend serves as the **administrative control center** for software vendors managing enterprise product licenses. It provides a unified interface for:

### Core Business Functions

#### **1. License Management Dashboard**
- **Real-time Status Monitoring**: View subscription states across all companies
- **Bulk Operations**: Manage multiple licenses simultaneously
- **Analytics & Reporting**: Comprehensive insights into license usage
- **Audit Trail Visualization**: Track all licensing activities

#### **2. Company (Tenant) Administration**
- **Customer Onboarding**: Streamlined company registration process
- **Subscription Lifecycle**: Complete control over activation, suspension, extension
- **Contact Management**: Maintain customer communication details
- **License Key Distribution**: Secure key generation and delivery

#### **3. Administrative Operations**
- **User Management**: Admin and SuperAdmin role management
- **System Configuration**: Global settings and preferences
- **Multi-language Support**: Arabic/English interface adaptation
- **Security Controls**: Authentication, authorization, and audit logs

#### **4. Integration Management**
- **API Monitoring**: Track external product integrations
- **License Validation**: Real-time validation status dashboard
- **Offline Key Management**: Secure key generation for air-gapped systems
- **System Health**: Monitor licensing system performance

## 🏗️ Technical Architecture

SYNFLOX Frontend implements **Clean Architecture** with strict layer separation and domain-driven design:

```
┌─────────────────────────────────────────────────────────┐
│                     Pages Layer                          │
│  Next.js App Router • Server Components • Layouts       │
│  Route Handling • Metadata • SEO                        │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                     Views Layer                          │
│  UI Components • User Interactions • Presentation       │
│  Generic CRUD Views • Forms • Tables • Modals          │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  ViewModels Layer                        │
│  Business Logic • State Management • User Actions       │
│  Generic CRUD ViewModels • Custom Business Logic        │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   Services Layer                         │
│  API Communication • Error Handling • Notifications     │
│  Authentication • Data Fetching • External Services     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   Domain Layer                           │
│  Business Entities • Domain Models • Mappers            │
│  Validation Logic • Business Rules • Data Transformation│
└─────────────────────────────────────────────────────────┘
```

### Architecture Principles

#### **1. Domain-Driven Design**
- **Never Raw JSON**: All components work exclusively with domain models
- **Business Logic in Models**: Entities contain validation and business rules
- **Immutable Entities**: Domain models are readonly with update methods
- **Type Safety**: Full TypeScript coverage with proper domain modeling

#### **2. Clean Architecture Layers**
- **Pages**: Next.js App Router entry points (server components)
- **Views**: UI presentation components (client components)
- **ViewModels**: Business logic and state management (custom hooks)
- **Services**: API communication and external service integration
- **Domain**: Core business entities and data transformation

#### **3. MVVM Pattern Implementation**
```typescript
// ViewModel handles all business logic
export function useCompanyViewModel() {
  const { companyService } = useServices();
  const vm = useGenericCrudViewModel<Company, CreateCompanyRequest, UpdateCompanyRequest>({
    getData: companyService.getCompanies.bind(companyService),
    create: companyService.createCompany.bind(companyService),
    update: companyService.updateCompany.bind(companyService),
    delete: companyService.deleteCompany.bind(companyService),
  });
  return { vm, config };
}

// View uses ViewModel for all logic
export function CompanyView() {
  const { vm, config } = useCompanyViewModel();
  return <GenericCrudView viewModel={vm} config={config} />;
}
```

## 🚀 Key Features

### **Multi-Language Support (Arabic/English)**
- **Complete RTL/LTR Support**: Full interface adaptation for Arabic and English
- **Dynamic Font Loading**: Cairo font for Arabic, Inter for English
- **Cultural Adaptation**: Date formats, number formatting, text direction
- **Seamless Switching**: Real-time language switching without page reload

### **Generic CRUD System**
```typescript
// One generic view handles all CRUD operations
<GenericCrudView 
  viewModel={vm} 
  config={{
    titleKey: "company.title",
    columns: [
      { key: "name", label: t("company.name"), sortable: true },
      { key: "status", label: t("company.status"), render: StatusBadge }
    ],
    createFields: [
      { name: "name", type: "text", required: true },
      { name: "expiryDate", type: "date" }
    ],
    actions: [
      { label: "Edit", onClick: vm.openEditModal },
      { label: "Delete", onClick: handleDelete, confirmRequired: true }
    ]
  }} 
/>
```

### **Domain-Driven Development**
```typescript
// Domain models with business logic
export class Company {
  get status(): "Active" | "Expired" | "Suspended" {
    if (this.expiryDate && new Date(this.expiryDate) < new Date()) return "Expired";
    if (!this.isActive) return "Suspended";
    return "Active";
  }
  
  get isActiveStatus(): boolean {
    return this.status === "Active";
  }
  
  update(updates: Partial<CompanyData>): Company {
    return new Company({ ...this, ...updates });
  }
}
```

### **Service Layer Architecture**
```typescript
// Services handle all API communication
export class CompanyService implements ICompanyService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  async createCompany(data: CreateCompanyRequest): Promise<Company> {
    try {
      const json = CompanyMapper.createRequestToJson(data);
      const response = await this.apiService.post<any>(API_ENDPOINTS.COMPANIES_CREATE, json);
      this.notificationService.success("Company created successfully");
      return CompanyMapper.fromJson(response.data);
    } catch (e) {
      throw e; // Error already handled by API service
    }
  }
}
```

## 📁 Project Structure

```
synflox-frontend/
├── app/                          # Next.js App Router pages
│   ├── companies/               # Company management pages
│   ├── admins/                  # Admin management pages
│   ├── admin-types/             # Admin type management pages
│   ├── login/                   # Authentication pages
│   ├── profile/                 # User profile pages
│   └── settings/                # System settings pages
│
├── components/                   # React components
│   ├── ui/                      # Generic UI components
│   │   ├── generic-crud-view.tsx    # Universal CRUD interface
│   │   ├── generic-table.tsx        # Reusable data table
│   │   ├── generic-form.tsx         # Dynamic form generator
│   │   └── generic-modal.tsx        # Modal dialogs
│   ├── layout/                  # Layout components
│   │   ├── dashboard-layout.tsx     # Main dashboard layout
│   │   ├── sidebar.tsx              # Navigation sidebar
│   │   └── header.tsx               # Top navigation
│   ├── forms/                   # Form components
│   ├── charts/                  # Data visualization
│   └── auth/                    # Authentication components
│
├── views/                       # Feature-specific view components
│   ├── company-view.tsx         # Company management interface
│   ├── admin-view.tsx           # Admin management interface
│   └── admin-type-view.tsx      # Admin type management interface
│
├── viewmodels/                  # Business logic layer
│   ├── company-viewmodel.tsx    # Company business logic
│   ├── admin-viewmodel.tsx      # Admin business logic
│   ├── licensing-viewmodel.tsx  # Licensing operations logic
│   └── dashboard-viewmodel.tsx  # Dashboard analytics logic
│
├── services/                    # API communication layer
│   ├── api.service.ts           # Base HTTP client
│   ├── company.service.ts       # Company API operations
│   ├── licensing.service.ts     # Licensing API operations
│   ├── admin.service.ts         # Admin API operations
│   ├── auth.service.ts          # Authentication service
│   └── notification.service.ts  # User notifications
│
├── domain/                      # Domain layer
│   ├── models/                  # Business entities
│   │   ├── company.model.ts         # Company domain model
│   │   ├── admin.model.ts           # Admin domain model
│   │   ├── licensing.model.ts       # Licensing domain model
│   │   └── auth.model.ts            # Authentication model
│   ├── mappers/                 # Data transformation
│   │   ├── company.mapper.ts        # Company data mapping
│   │   ├── admin.mapper.ts          # Admin data mapping
│   │   └── index.ts                 # Mapper exports
│   └── index.ts                 # Domain exports
│
├── providers/                   # React context providers
│   ├── service-provider.tsx     # Dependency injection
│   ├── auth-provider.tsx        # Authentication context
│   ├── i18n-provider.tsx        # Internationalization
│   ├── settings-provider.tsx    # User preferences
│   └── navigation-provider.tsx  # Navigation state
│
├── hooks/                       # Custom React hooks
│   ├── use-generic-crud-viewmodel.ts  # Generic CRUD logic
│   ├── use-auth.ts                    # Authentication hooks
│   └── use-navigation.ts              # Navigation hooks
│
├── config/                      # Configuration files
│   ├── api-endpoints.ts         # API endpoint definitions
│   ├── navigation.ts            # Navigation configuration
│   └── logo.ts                  # Branding configuration
│
├── locales/                     # Internationalization
│   ├── en.ts                    # English translations
│   └── ar.ts                    # Arabic translations
│
└── lib/                         # Utility libraries
    ├── utils.ts                 # General utilities
    ├── validation.ts            # Form validation
    ├── pagination.ts            # Pagination helpers
    └── error-handler.ts         # Error handling
```

## 🛠️ Getting Started

### Prerequisites
- **Node.js 18+** (LTS recommended)
- **npm**, **yarn**, or **pnpm**
- **SYNFLOX Backend API** running on `http://localhost:5000`

### Quick Start

#### **1. Installation**
```bash
# Clone the repository
git clone <repository-url>
cd synflox-frontend

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

#### **2. Environment Configuration**
Create `.env.local` file:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Optional: Analytics, monitoring, etc.
NEXT_PUBLIC_APP_ENV=development
```

#### **3. Development Server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

#### **4. Access the Application**
- **Frontend**: `http://localhost:3000`
- **Login Credentials**:
  - Username: `superadmin`
  - Password: `password`

### Production Build

#### **Build for Production**
```bash
npm run build
npm start
```

#### **Docker Deployment**
```dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runtime
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

## 💼 Business Features

### **Company Management**
Complete lifecycle management for customer companies:

#### **Company Registration & Onboarding**
```typescript
// Streamlined company creation with validation
const createCompanyRequest = new CreateCompanyRequest({
  name: "Acme Corporation",
  expiryDate: "2025-12-31T23:59:59Z",
  contactEmail: "admin@acme.com",
  contactPhone: "+1234567890",
  address: "123 Main St, City, Country"
});

// Business logic validation
if (createCompanyRequest.isValid) {
  await companyService.createCompany(createCompanyRequest);
}
```

#### **Subscription Status Management**
- **Real-time Status Display**: Active, Expired, Suspended badges
- **Status-based Actions**: Context-sensitive operations
- **Bulk Operations**: Manage multiple companies simultaneously
- **Audit Trail**: Complete history of all changes

#### **License Key Operations**
```typescript
// Secure license key generation for offline systems
const licenseKey = await licensingService.generateLicenseKey(companyId);

// Key features:
// - AES-256 encryption
// - HMAC SHA256 signatures
// - Clock tampering detection
// - Secure distribution
```

### **Administrative Operations**

#### **Role-Based Access Control**
- **SuperAdmin**: Full system access, company management, user administration
- **Admin**: Limited access based on permissions
- **Dynamic Navigation**: Menu items based on user roles
- **Secure Authentication**: JWT-based with automatic token refresh

#### **Multi-Language Administration**
```typescript
// Seamless language switching
const { t, language, setLanguage } = useI18n();

// Automatic UI adaptation
if (language === 'ar') {
  // RTL layout, Arabic fonts, cultural formatting
} else {
  // LTR layout, English fonts, standard formatting
}
```

### **Integration Management**

#### **API Monitoring Dashboard**
- **Real-time Status**: Monitor external product integrations
- **License Validation Tracking**: Track validation requests
- **Performance Metrics**: API response times and success rates
- **Error Monitoring**: Comprehensive error tracking and alerting

#### **Offline System Support**
- **License Key Generation**: Secure keys for air-gapped systems
- **Key Management**: Regeneration, revocation, and distribution
- **Validation Monitoring**: Track offline system health
- **Security Compliance**: Tamper-proof validation mechanisms

## 🔧 Development Workflow

### **Adding New Features**

#### **1. Domain-First Approach**
```typescript
// 1. Create domain model
export class NewFeature {
  constructor(private data: NewFeatureData) {}
  
  get isValid(): boolean {
    return this.data.name?.length > 0;
  }
  
  update(updates: Partial<NewFeatureData>): NewFeature {
    return new NewFeature({ ...this.data, ...updates });
  }
}

// 2. Create mapper
export class NewFeatureMapper {
  static fromJson(json: any): NewFeature {
    return new NewFeature({
      id: json.id,
      name: json.name,
      // ... other properties
    });
  }
}
```

#### **2. Service Implementation**
```typescript
// 3. Create service
export class NewFeatureService implements INewFeatureService {
  constructor(
    private apiService: IApiService,
    private notificationService: INotificationService
  ) {}

  async createFeature(data: CreateFeatureRequest): Promise<NewFeature> {
    const json = NewFeatureMapper.createRequestToJson(data);
    const response = await this.apiService.post(API_ENDPOINTS.FEATURES_CREATE, json);
    this.notificationService.success("Feature created successfully");
    return NewFeatureMapper.fromJson(response.data);
  }
}
```

#### **3. ViewModel & View**
```typescript
// 4. Create ViewModel
export function useNewFeatureViewModel() {
  const { newFeatureService } = useServices();
  const vm = useGenericCrudViewModel<NewFeature, CreateFeatureRequest, UpdateFeatureRequest>({
    getData: newFeatureService.getFeatures.bind(newFeatureService),
    create: newFeatureService.createFeature.bind(newFeatureService),
    // ... other operations
  });
  return { vm, config };
}

// 5. Create View
export function NewFeatureView() {
  const { vm, config } = useNewFeatureViewModel();
  return <GenericCrudView viewModel={vm} config={config} />;
}
```

### **Configuration Management**

#### **API Endpoints**
```typescript
// config/api-endpoints.ts
export const API_ENDPOINTS = {
  COMPANIES_GET_ALL: "/companies",
  COMPANIES_CREATE: "/companies",
  LICENSING_ACTIVATE: "/licensing",
  // ... other endpoints
};
```

#### **Navigation Configuration**
```typescript
// config/navigation.ts
export const navigationConfig = {
  items: [
    {
      name: "nav.Companies",
      href: "/companies",
      icon: "building",
      allowedRoles: ["SuperAdmin", "Admin"]
    }
  ]
};
```

#### **Internationalization**
```typescript
// locales/en.ts
export const en = {
  company: {
    title: "Companies",
    name: "Company Name",
    status: {
      active: "Active",
      expired: "Expired",
      suspended: "Suspended"
    }
  }
};

// locales/ar.ts
export const ar = {
  company: {
    title: "الشركات",
    name: "اسم الشركة",
    status: {
      active: "نشط",
      expired: "منتهي الصلاحية",
      suspended: "معلق"
    }
  }
};
```

## 🎨 UI/UX Features

### **Responsive Design**
- **Mobile-First Approach**: Optimized for all screen sizes
- **Adaptive Layouts**: Sidebar transforms to drawer on mobile
- **Touch-Friendly**: Optimized for touch interactions
- **Progressive Enhancement**: Works without JavaScript

### **Accessibility**
- **WCAG 2.1 Compliance**: Level AA accessibility standards
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels and roles
- **High Contrast**: Accessible color combinations

### **Performance Optimization**
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component with lazy loading
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Caching Strategy**: Optimized caching for static assets

## 🔒 Security Implementation

### **Authentication & Authorization**
```typescript
// JWT-based authentication with automatic refresh
export class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.apiService.post<any>(API_ENDPOINTS.AUTH_LOGIN, 
      AuthMapper.loginRequestToJson(credentials)
    );
    
    // Store tokens securely
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    
    return AuthMapper.fromJson(response.data);
  }
}
```

### **Role-Based Access Control**
```typescript
// Dynamic navigation based on user roles
const navigationItems = menuItems.filter(item => 
  item.allowedUserTypes?.includes(currentUser.adminType) ?? true
);
```

### **Input Validation & Sanitization**
```typescript
// Domain model validation
export class CreateCompanyRequest {
  get isValid(): boolean {
    return !!(this.name && this.name.trim().length > 0);
  }
}

// Form validation with Zod schemas
const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  contactEmail: z.string().email("Invalid email format").optional(),
});
```

## 🌐 Internationalization (i18n)

### **Complete RTL/LTR Support**
```typescript
// Automatic layout adaptation
export function useI18n() {
  const { language, direction, t } = useContext(I18nContext);
  
  useEffect(() => {
    document.documentElement.setAttribute("dir", direction);
    document.documentElement.setAttribute("lang", language);
    
    // Update font classes
    if (language === "ar") {
      document.body.classList.add("font-arabic");
      document.body.classList.remove("font-english");
    } else {
      document.body.classList.add("font-english");
      document.body.classList.remove("font-arabic");
    }
  }, [language, direction]);
  
  return { language, direction, t };
}
```

### **Cultural Adaptation**
- **Date Formatting**: Locale-specific date formats
- **Number Formatting**: Currency and number formatting
- **Typography**: Font selection based on language
- **Layout Direction**: Automatic RTL/LTR switching

## 🚀 Production Deployment

### **Environment Configuration**
```env
# Production Environment Variables
NEXT_PUBLIC_API_URL=https://api.synflox.com/api
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### **Performance Monitoring**
```typescript
// Performance tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics service
  gtag('event', metric.name, {
    value: Math.round(metric.value),
    event_label: metric.id,
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### **Error Monitoring**
```typescript
// Global error boundary with Sentry integration
export class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }
}
```

## 🧪 Testing Strategy

### **Unit Testing**
```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### **Integration Testing**
```typescript
// Component integration tests
import { render, screen, fireEvent } from '@testing-library/react';
import { CompanyView } from '@/views/company-view';

test('creates new company successfully', async () => {
  render(<CompanyView />);
  
  fireEvent.click(screen.getByText('Add Company'));
  fireEvent.change(screen.getByLabelText('Company Name'), {
    target: { value: 'Test Company' }
  });
  fireEvent.click(screen.getByText('Save'));
  
  expect(await screen.findByText('Company created successfully')).toBeInTheDocument();
});
```

### **E2E Testing**
```typescript
// Playwright E2E tests
import { test, expect } from '@playwright/test';

test('complete company management workflow', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="username"]', 'superadmin');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  await page.goto('/companies');
  await page.click('text=Add Company');
  await page.fill('[name="name"]', 'E2E Test Company');
  await page.click('text=Save');
  
  await expect(page.locator('text=Company created successfully')).toBeVisible();
});
```

## 🤝 Contributing

### **Development Guidelines**
1. **Follow Clean Architecture**: Maintain strict layer separation
2. **Domain-First Development**: Always start with domain models
3. **Type Safety**: Use TypeScript throughout, avoid `any`
4. **Testing**: Write tests for all business logic
5. **Documentation**: Update README for new features

### **Code Quality Tools**
```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Code formatting
npm run format

# Pre-commit hooks
npm run pre-commit
```

---

**SYNFLOX Frontend** - Enterprise-grade admin dashboard for central licensing management  
**Built with**: Next.js 14, TypeScript, Tailwind CSS, Clean Architecture  
**Version**: 1.0  
**Last Updated**: 2025
