// ============================================================================
// License ViewModel - Business Logic & State Management
// ============================================================================

import { useState, useCallback, useEffect } from 'react';
import { useServices } from '@/providers/service-provider';
import { useI18n } from '@/providers/i18n-provider';
import {
  License,
  CompanyLicenseSummary,
  GenerateLicenseResponse,
  ValidateLicenseResponse,
  GenerateLicenseRequest,
  ValidateLicenseRequest,
} from '@/domain/models/license.model';

// ============================================================================
// Types
// ============================================================================

export interface LicenseViewModelState {
  // Data
  license: License | null;
  companySummary: CompanyLicenseSummary | null;
  generatedLicense: GenerateLicenseResponse | null;
  validationResult: ValidateLicenseResponse | null;

  // UI State
  isLoading: boolean;
  isGenerating: boolean;
  isValidating: boolean;
  isRevoking: boolean;
  error: string | null;

  // Dialogs
  showGenerateDialog: boolean;
  showValidateDialog: boolean;
  showRevokeDialog: boolean;
  showLicenseKeyDialog: boolean;
  selectedSubscriptionId: string | null;
}

export interface LicenseViewModel extends LicenseViewModelState {
  // Actions
  loadLicenseBySubscription: (subscriptionId: string) => Promise<void>;
  loadLicensesByCompany: (companyId: string) => Promise<void>;
  generateLicense: (subscriptionId: string, request?: GenerateLicenseRequest) => Promise<GenerateLicenseResponse | null>;
  regenerateLicense: (subscriptionId: string, request?: GenerateLicenseRequest) => Promise<GenerateLicenseResponse | null>;
  validateLicense: (request: ValidateLicenseRequest) => Promise<void>;
  revokeLicense: (subscriptionId: string, reason?: string) => Promise<boolean>;
  downloadLicense: (subscriptionId: string) => Promise<void>;
  copyLicenseKey: (licenseKey: string) => Promise<void>;

  // Dialog Controls
  openGenerateDialog: (subscriptionId: string) => void;
  closeGenerateDialog: () => void;
  openValidateDialog: () => void;
  closeValidateDialog: () => void;
  openRevokeDialog: (subscriptionId: string) => void;
  closeRevokeDialog: () => void;
  openLicenseKeyDialog: (license: GenerateLicenseResponse) => void;
  closeLicenseKeyDialog: () => void;

  // Utilities
  refresh: () => Promise<void>;
  clearError: () => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useLicenseViewModel(initialSubscriptionId?: string): LicenseViewModel {
  const { licenseService, notificationService } = useServices();
  const { t } = useI18n();

  // State
  const [license, setLicense] = useState<License | null>(null);
  const [companySummary, setCompanySummary] = useState<CompanyLicenseSummary | null>(null);
  const [generatedLicense, setGeneratedLicense] = useState<GenerateLicenseResponse | null>(null);
  const [validationResult, setValidationResult] = useState<ValidateLicenseResponse | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showValidateDialog, setShowValidateDialog] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [showLicenseKeyDialog, setShowLicenseKeyDialog] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(initialSubscriptionId || null);

  // Load license by subscription
  const loadLicenseBySubscription = useCallback(async (subscriptionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await licenseService.getLicenseBySubscription(subscriptionId);
      setLicense(result);
      setSelectedSubscriptionId(subscriptionId);
    } catch (err: any) {
      setError(err.message || 'Failed to load license');
    } finally {
      setIsLoading(false);
    }
  }, [licenseService]);

  // Load licenses by company
  const loadLicensesByCompany = useCallback(async (companyId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await licenseService.getLicensesByCompany(companyId);
      setCompanySummary(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load company licenses');
    } finally {
      setIsLoading(false);
    }
  }, [licenseService]);

  // Generate license
  const generateLicense = useCallback(async (
    subscriptionId: string,
    request?: GenerateLicenseRequest
  ): Promise<GenerateLicenseResponse | null> => {
    setIsGenerating(true);
    try {
      const result = await licenseService.generateLicense(subscriptionId, request);
      if (result) {
        setGeneratedLicense(result);
        setShowGenerateDialog(false);
        setShowLicenseKeyDialog(true);
        // Reload license info
        await loadLicenseBySubscription(subscriptionId);
      }
      return result;
    } finally {
      setIsGenerating(false);
    }
  }, [licenseService, loadLicenseBySubscription]);

  // Regenerate license
  const regenerateLicense = useCallback(async (
    subscriptionId: string,
    request?: GenerateLicenseRequest
  ): Promise<GenerateLicenseResponse | null> => {
    setIsGenerating(true);
    try {
      const result = await licenseService.regenerateLicense(subscriptionId, request);
      if (result) {
        setGeneratedLicense(result);
        setShowLicenseKeyDialog(true);
        // Reload license info
        await loadLicenseBySubscription(subscriptionId);
      }
      return result;
    } finally {
      setIsGenerating(false);
    }
  }, [licenseService, loadLicenseBySubscription]);

  // Validate license
  const validateLicense = useCallback(async (request: ValidateLicenseRequest) => {
    setIsValidating(true);
    setValidationResult(null);
    try {
      const result = await licenseService.validateLicense(request);
      setValidationResult(result);
    } finally {
      setIsValidating(false);
    }
  }, [licenseService]);

  // Revoke license
  const revokeLicense = useCallback(async (subscriptionId: string, reason?: string): Promise<boolean> => {
    setIsRevoking(true);
    try {
      const success = await licenseService.revokeLicense(subscriptionId, reason);
      if (success) {
        setShowRevokeDialog(false);
        // Reload license info
        await loadLicenseBySubscription(subscriptionId);
      }
      return success;
    } finally {
      setIsRevoking(false);
    }
  }, [licenseService, loadLicenseBySubscription]);

  // Download license
  const downloadLicense = useCallback(async (subscriptionId: string) => {
    const blob = await licenseService.downloadLicense(subscriptionId);
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `license_${subscriptionId}.lic`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      notificationService.success(t('license.downloadSuccess'));
    }
  }, [licenseService, notificationService, t]);

  // Copy license key
  const copyLicenseKey = useCallback(async (licenseKey: string) => {
    try {
      await navigator.clipboard.writeText(licenseKey);
      notificationService.success(t('license.copiedToClipboard'));
    } catch {
      notificationService.error(t('license.copyFailed'));
    }
  }, [notificationService, t]);

  // Dialog controls
  const openGenerateDialog = useCallback((subscriptionId: string) => {
    setSelectedSubscriptionId(subscriptionId);
    setShowGenerateDialog(true);
  }, []);

  const closeGenerateDialog = useCallback(() => {
    setShowGenerateDialog(false);
  }, []);

  const openValidateDialog = useCallback(() => {
    setValidationResult(null);
    setShowValidateDialog(true);
  }, []);

  const closeValidateDialog = useCallback(() => {
    setShowValidateDialog(false);
    setValidationResult(null);
  }, []);

  const openRevokeDialog = useCallback((subscriptionId: string) => {
    setSelectedSubscriptionId(subscriptionId);
    setShowRevokeDialog(true);
  }, []);

  const closeRevokeDialog = useCallback(() => {
    setShowRevokeDialog(false);
  }, []);

  const openLicenseKeyDialog = useCallback((license: GenerateLicenseResponse) => {
    setGeneratedLicense(license);
    setShowLicenseKeyDialog(true);
  }, []);

  const closeLicenseKeyDialog = useCallback(() => {
    setShowLicenseKeyDialog(false);
  }, []);

  // Refresh
  const refresh = useCallback(async () => {
    if (selectedSubscriptionId) {
      await loadLicenseBySubscription(selectedSubscriptionId);
    }
  }, [selectedSubscriptionId, loadLicenseBySubscription]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial load
  useEffect(() => {
    if (initialSubscriptionId) {
      loadLicenseBySubscription(initialSubscriptionId);
    }
  }, [initialSubscriptionId, loadLicenseBySubscription]);

  return {
    // Data
    license,
    companySummary,
    generatedLicense,
    validationResult,

    // UI State
    isLoading,
    isGenerating,
    isValidating,
    isRevoking,
    error,

    // Dialogs
    showGenerateDialog,
    showValidateDialog,
    showRevokeDialog,
    showLicenseKeyDialog,
    selectedSubscriptionId,

    // Actions
    loadLicenseBySubscription,
    loadLicensesByCompany,
    generateLicense,
    regenerateLicense,
    validateLicense,
    revokeLicense,
    downloadLicense,
    copyLicenseKey,

    // Dialog Controls
    openGenerateDialog,
    closeGenerateDialog,
    openValidateDialog,
    closeValidateDialog,
    openRevokeDialog,
    closeRevokeDialog,
    openLicenseKeyDialog,
    closeLicenseKeyDialog,

    // Utilities
    refresh,
    clearError,
  };
}
