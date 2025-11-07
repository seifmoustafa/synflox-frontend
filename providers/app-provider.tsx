"use client";

import type React from "react";
import { ThemeProvider } from "@/providers/theme-provider";
import { I18nProvider } from "@/providers/i18n-provider";
import { ServiceProvider } from "@/providers/service-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { SettingsProvider } from "@/providers/settings-provider";
import { NavigationProvider } from "@/providers/navigation-provider";
import { RouteGuard } from "@/components/auth/route-guard";
import { EnhancedToaster } from "@/components/ui/enhanced-toaster";
import { ErrorBoundary } from "@/components/ui/error-boundary";

/**
 * Combined App Provider - Optimized provider composition
 * 
 * This component combines all providers into a single, optimized structure
 * to reduce nesting complexity and improve performance.
 * 
 * Provider order is important:
 * 1. ThemeProvider - Must be outermost for theme context
   * 2. ServiceProvider - Provides API services
 * 3. SettingsProvider - User preferences and settings
 * 4. I18nProvider - Internationalization (depends on settings)
 * 5. ErrorBoundary - Catches all errors (must be inside I18nProvider for localization)
 * 6. AuthProvider - Authentication state
 * 7. NavigationProvider - Navigation and permissions (depends on auth)
 * 8. RouteGuard - Route protection (depends on auth and navigation)
 * 
 * @param children - The app content to be wrapped
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
      <ServiceProvider>
        <SettingsProvider>
          <I18nProvider>
            <ErrorBoundary>
              <AuthProvider>
                <NavigationProvider>
                  <RouteGuard>
                    {children}
                  </RouteGuard>
                </NavigationProvider>
              </AuthProvider>
            </ErrorBoundary>
            <EnhancedToaster />
          </I18nProvider>
        </SettingsProvider>
      </ServiceProvider>
    </ThemeProvider>
  );
}
