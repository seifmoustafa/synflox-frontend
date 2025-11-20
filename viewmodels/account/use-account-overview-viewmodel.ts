/**
 * Account Overview ViewModel
 * Manages state and business logic for the account overview page
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { Profile, SecurityDashboard } from "@/domain";

export interface AccountOverviewViewModelReturn {
  // State
  profile: Profile | null;
  securityDashboard: SecurityDashboard | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  reload: () => Promise<void>;
  navigateToSecurity: () => void;
  navigateToProfile: () => void;
  navigateToEmails: () => void;
  navigateToActivity: () => void;
}

export function useAccountOverviewViewModel(): AccountOverviewViewModelReturn {
  const { accountService } = useServices();
  const { t } = useI18n();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [securityDashboard, setSecurityDashboard] = useState<SecurityDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all account overview data
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load profile and security dashboard in parallel
      const [profileData, securityData] = await Promise.all([
        accountService.getProfile(),
        accountService.getSecurityDashboard(),
      ]);

      setProfile(profileData);
      setSecurityDashboard(securityData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("account.errors.loadProfile");
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [accountService, t]);

  /**
   * Reload data
   */
  const reload = useCallback(async () => {
    await loadData();
  }, [loadData]);

  /**
   * Navigation methods
   */
  const navigateToSecurity = useCallback(() => {
    router.push("/account/security");
  }, [router]);

  const navigateToProfile = useCallback(() => {
    router.push("/account/profile");
  }, [router]);

  const navigateToEmails = useCallback(() => {
    router.push("/account/emails");
  }, [router]);

  const navigateToActivity = useCallback(() => {
    router.push("/account/activity");
  }, [router]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    profile,
    securityDashboard,
    isLoading,
    error,
    reload,
    navigateToSecurity,
    navigateToProfile,
    navigateToEmails,
    navigateToActivity,
  };
}
