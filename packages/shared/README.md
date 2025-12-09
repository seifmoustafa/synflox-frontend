# @synflox/shared

Shared package containing common components, hooks, providers, utilities, services, domain models, styles, assets, and configuration for all SYNFLOX frontend applications.

## Package Summary - 233 Shared Files

### Components (118 files)
- **ui/** - 72 UI components (shadcn + custom)
- **charts/** - 14 chart types (Line, Bar, Pie, Area, Radar, Gauge, etc.)
- **settings/** - 8 tabs (Appearance, Layout, Typography, Behavior, Components, Charts, etc.)
- **auth/** - 7 components (AuthContainerLayout, PasswordStrengthIndicator, NotAuthorizedView, etc.)
- **layout/** - 4 components (Footer, LanguageSwitcher, ThemeSwitcher, SearchInput)
- **dashboard/** - 1 component (CurrencySelector)
- **forms/** - 1 form (GenericForm)
- **index files** - 11 barrel exports

### Core (38 files)
- **hooks/** - 11 hooks (useToast, useLayoutStyles, useCrudViewModel, etc.)
- **lib/** - 11 utilities (cn, validation, logger, error-handler, etc.)
- **providers/** - 5 providers (theme, i18n, settings, currency, index)
- **services/** - 3 services (BaseApiService, NotificationService, index)
- **config/** - 2 files (logoConfig, index)
- **build configs/** - 6 files (tailwind, next, postcss, tsconfig base + internal)

### Domain (6 files)
- **models/** - 2 (Notification + index)
- **mappers/** - 2 (NotificationMapper + index)
- **enums/** - 2 (AdminSessionPolicy, ConcurrentAccessMode, SessionEndReason + index)

### Assets (69 files)
- **styles/** - 2 files (globals.css with full theme, fonts.css)
- **fonts/** - 62 TTF files (Cairo + Inter font families)
- **images/** - 5 placeholder images (logo, user, general)

## Key Architecture

### BaseApiService (Abstract)
Apps extend this class for auth:
- **Admin**: `Authorization: Bearer {token}` + refresh logic
- **Client**: `X-Session-Id: {sessionId}` + simple redirect

### I18nProvider (Generic)
Accepts translations as props instead of hardcoded imports.

## Package Contents

### Components

#### UI Components (`@shared/components/ui`)
- **Base shadcn**: accordion, alert, alert-dialog, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toggle, toggle-group, tooltip
- **Custom Components**: action-form-dialog, confirmation-dialog, custom-calendar, custom-status-badge, date-picker, enhanced-toast, enhanced-toaster, error-boundary, error-message, generic-chart, generic-crud-view, generic-modal, generic-select, generic-select-base, generic-table, generic-tree-view, image-uploader, loading-spinner, logo, page-breadcrumbs, responsive-tabs, rich-text-editor, tags-input, tree-view

#### Forms (`@shared/components/forms`)
- generic-form

#### Auth Components (`@shared/components/auth`)
- animated-login-background, auth-animated-form-card, auth-branding-panel
- auth-container-layout, auth-form-card, password-strength-indicator
- not-authorized-view (403 page)

#### Charts (`@shared/components/charts`)
- line-charts, area-charts, bar-charts, pie-charts
- scatter-charts, radar-charts, mixed-charts, gauge-charts
- heatmap-charts, treemap-charts, timeline-charts, funnel-charts
- generic-chart, chart-tooltip

#### Settings (`@shared/components/settings`)
- appearance-tab, layout-tab, typography-tab, behavior-tab
- components-tab, checkbox-radio-tab, charts-tab, preview-panel

#### Dashboard (`@shared/components/dashboard`)
- currency-selector

#### Layout (`@shared/components/layout`)
- footer, language-switcher, theme-switcher, search-input

### Hooks (10 files)
- use-toast, use-enhanced-toast
- use-mobile, use-dropdown-manager
- use-crud-view-model, use-generic-crud-viewmodel
- use-tree-view-model, use-enhanced-delete
- use-validation
- use-layout-styles (NEW)

### Providers (4 files)
- theme-provider - Dark/light mode
- i18n-provider - Internationalization (generic, accepts translations as props)
- settings-provider - UI settings (colors, effects, etc.)
- currency-provider - Currency formatting

### Library Utilities (10 files)
- utils - cn() and helper functions
- validation - Form validation rules
- error-handler - Error handling utilities
- logger - Application logging
- pagination - Pagination utilities
- url-helpers - URL manipulation
- image-utils - Image processing
- dropdown-positioning - Dropdown placement
- secure-token-service - Token security
- refresh-guard - Token refresh protection

### Styles (2 files)
- globals.css - Global CSS with CSS variables
- fonts.css - Font declarations (Cairo, Inter)

### Public Assets
- fonts/cairo/ - Arabic font
- fonts/inter/ - English font
- images/ - Placeholder images

## Usage

### In tsconfig.json
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@shared/*": ["../../packages/shared/*"]
    }
  }
}
```

### Import Examples
```typescript
// UI Components
import { Button, Card, Input, Dialog } from '@shared/components/ui';
import { GenericForm } from '@shared/components/forms';

// Auth Components
import { AuthContainerLayout, PasswordStrengthIndicator, NotAuthorizedView } from '@shared/components/auth';

// Charts
import { ProfessionalChart, ProfessionalLineCharts, ProfessionalBarCharts } from '@shared/components/charts';

// Settings
import { AppearanceTab, LayoutTab, BehaviorTab, PreviewPanel } from '@shared/components/settings';

// Dashboard
import { CurrencySelector } from '@shared/components/dashboard';

// Layout
import { Footer, LanguageSwitcher, ThemeSwitcher, SearchInput } from '@shared/components/layout';

// Hooks
import { useToast, useValidation, useLayoutStyles } from '@shared/hooks';

// Providers
import { ThemeProvider, I18nProvider, SettingsProvider, CurrencyProvider } from '@shared/providers';

// Services
import { BaseApiService, NotificationService } from '@shared/services';

// Domain
import { Notification, NotificationMapper } from '@shared/domain';
import { AdminSessionPolicy, ConcurrentAccessMode, SessionEndReason } from '@shared/domain/enums';

// Config
import { logoConfig, LogoConfig } from '@shared/config';

// Utilities
import { cn, validateForm, appLogger, handleError } from '@shared/lib';
```

### I18nProvider Usage (Generic)
```tsx
import { I18nProvider } from '@shared/providers';
import { ar } from '@/locales/ar';  // App-specific translations
import { en } from '@/locales/en';

function App() {
  return (
    <I18nProvider 
      translations={{ ar, en }}
      defaultLanguage="ar"
      onLanguageChange={(lang) => console.log('Language changed:', lang)}
    >
      {children}
    </I18nProvider>
  );
}
```

## What's NOT Shared (App-Specific)

Each app maintains its own:
- **locales/** - App-specific translations
- **domain/** - Domain models and mappers
- **services/** - API services
- **viewmodels/** - View models
- **views/** - View components
- **config/** - API endpoints, navigation config
- **providers/auth-provider** - App-specific authentication
- **providers/service-provider** - App-specific service registry
- **providers/navigation-provider** - App-specific navigation
- **components/layout/** - App-specific layouts
