/**
 * @synflox/shared
 * 
 * Shared package containing common components, hooks, providers, utilities,
 * services, domain models, styles, and assets for all SYNFLOX frontend apps.
 * 
 * Usage:
 * - UI: import { Button, Card } from '@shared/components/ui'
 * - Forms: import { GenericForm } from '@shared/components/forms'
 * - Layout: import { LanguageSwitcher, ThemeSwitcher, Footer } from '@shared/components/layout'
 * - Auth: import { AuthContainerLayout, PasswordStrengthIndicator } from '@shared/components/auth'
 * - Charts: import { ProfessionalChart, ProfessionalLineCharts } from '@shared/components/charts'
 * - Dashboard: import { CurrencySelector } from '@shared/components/dashboard'
 * - Settings: import { AppearanceTab, LayoutTab } from '@shared/components/settings'
 * - Hooks: import { useToast, useValidation, useLayoutStyles } from '@shared/hooks'
 * - Providers: import { ThemeProvider, I18nProvider } from '@shared/providers'
 * - Services: import { BaseApiService, NotificationService } from '@shared/services'
 * - Domain: import { Notification, NotificationMapper } from '@shared/domain'
 * - Config: import { logoConfig, LogoConfig } from '@shared/config'
 * - Utils: import { cn, validateForm } from '@shared/lib'
 * 
 * App-Specific (NOT shared):
 * - locales/ - Each app has its own translations
 * - services/api.service.ts - Each app extends BaseApiService with auth logic
 * - config/api-endpoints.ts - Each app has its own endpoints
 * - .env - Each app has its own environment config
 * - providers/auth-provider - Each app has its own auth strategy
 */

// Re-export main modules
export * from './lib';
export * from './hooks';
export * from './providers';
export * from './services';
export * from './domain';
export * from './config';
