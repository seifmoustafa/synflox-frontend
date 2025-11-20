/**
 * Backup Codes Management ViewModel
 * Handles generate, export, and manage backup codes
 */

import { useState, useCallback, useEffect } from 'react';
import { useServices } from '@/providers/service-provider';
import { useI18n } from '@/providers/i18n-provider';
import {
  GenerateBackupCodesRequest,
  GenerateBackupCodesResponse,
  BackupCodesStatus,
  ExportBackupCodesRequest,
} from '@/domain';

export interface BackupCodesViewModelReturn {
  // State
  backupCodesStatus: BackupCodesStatus | null;
  generatedCodes: GenerateBackupCodesResponse | null;
  currentPassword: string;
  exportFormat: 'json' | 'txt' | 'pdf';
  isLoading: boolean;
  isGenerating: boolean;
  isExporting: boolean;
  error: string | null;
  successMessage: string | null;
  showCodes: boolean;
  
  // Handlers
  handleLoadStatus: () => Promise<void>;
  handleGenerateCodes: () => Promise<void>;
  handleExportCodes: (format?: 'json' | 'txt' | 'pdf') => Promise<void>;
  handleDeleteCodes: () => Promise<void>;
  handlePasswordChange: (value: string) => void;
  handleFormatChange: (format: 'json' | 'txt' | 'pdf') => void;
  handleCloseCodes: () => void;
  handleCopyCode: (code: string) => void;
  handleCopyAllCodes: () => void;
  
  // Validation
  canGenerate: boolean;
  canExport: boolean;
}

export function useBackupCodesViewModel(): BackupCodesViewModelReturn {
  const { profileService } = useServices();
  const { t } = useI18n();

  // State
  const [backupCodesStatus, setBackupCodesStatus] = useState<BackupCodesStatus | null>(null);
  const [generatedCodes, setGeneratedCodes] = useState<GenerateBackupCodesResponse | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [exportFormat, setExportFormat] = useState<'json' | 'txt' | 'pdf'>('txt');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCodes, setShowCodes] = useState(false);

  // Load status on mount
  useEffect(() => {
    handleLoadStatus();
  }, []);

  // Validation
  const canGenerate = currentPassword.length > 0;
  const canExport = generatedCodes !== null && generatedCodes.codes.length > 0;

  // Handlers
  const handlePasswordChange = useCallback((value: string) => {
    setCurrentPassword(value);
    setError(null);
  }, []);

  const handleFormatChange = useCallback((format: 'json' | 'txt' | 'pdf') => {
    setExportFormat(format);
  }, []);

  const handleCloseCodes = useCallback(() => {
    setShowCodes(false);
    setGeneratedCodes(null);
    setCurrentPassword('');
  }, []);

  const handleLoadStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const status = await profileService.getBackupCodesStatus();
      setBackupCodesStatus(status);
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        t('security.loadStatusError') ||
        'Failed to load backup codes status';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [profileService, t]);

  const handleGenerateCodes = useCallback(async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const request = new GenerateBackupCodesRequest({
        currentPassword,
      });

      if (!request.isValid) {
        throw new Error(
          t('security.invalidPassword') || 'Password is required'
        );
      }

      const response = await profileService.generateBackupCodes(request);
      setGeneratedCodes(response);
      setShowCodes(true);
      setSuccessMessage(response.message);
      setCurrentPassword('');
      
      // Reload status
      await handleLoadStatus();
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        t('security.generateCodesError') ||
        'Failed to generate backup codes';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [canGenerate, currentPassword, profileService, t, handleLoadStatus]);

  const handleExportCodes = useCallback(async (format?: 'json' | 'txt' | 'pdf') => {
    if (!canExport || !generatedCodes) return;

    setIsExporting(true);
    setError(null);

    // Use provided format or current state format
    const formatToUse = format || exportFormat;

    try {
      const request = new ExportBackupCodesRequest({
        codes: generatedCodes.codes,
        format: formatToUse,
      });

      if (!request.isValid) {
        throw new Error(
          t('security.invalidExportFormat') || 'Invalid export format'
        );
      }

      const response = await profileService.exportBackupCodes(request);
      
      // Direct download/open without fetch (avoids CORS issues)
      if (response.downloadUrl.startsWith('http://') || response.downloadUrl.startsWith('https://')) {
        // For backend URLs - open in new tab (browser will download if content-disposition is set)
        window.open(response.downloadUrl, '_blank');
      } else {
        // For data URIs (base64), use direct download
        const link = document.createElement('a');
        link.href = response.downloadUrl;
        link.download = response.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setSuccessMessage(
        t('security.codesExported') || 'Backup codes exported successfully'
      );
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        t('security.exportCodesError') ||
        'Failed to export backup codes';
      setError(errorMessage);
    } finally {
      setIsExporting(false);
    }
  }, [canExport, generatedCodes, exportFormat, profileService, t]);

  const handleDeleteCodes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await profileService.deleteBackupCodes();
      setSuccessMessage(result.message);
      
      // Reload status
      await handleLoadStatus();
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        t('security.deleteCodesError') ||
        'Failed to delete backup codes';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [profileService, t, handleLoadStatus]);

  const handleCopyCode = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setSuccessMessage(t('security.codeCopied') || 'Code copied to clipboard');
      
      // Clear message after 2 seconds
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      setError(t('security.copyError') || 'Failed to copy code');
    }
  }, [t]);

  const handleCopyAllCodes = useCallback(async () => {
    if (!generatedCodes) return;

    try {
      const codesText = generatedCodes.codesAsText;
      await navigator.clipboard.writeText(codesText);
      setSuccessMessage(
        t('security.allCodesCopied') || 'All codes copied to clipboard'
      );
      
      // Clear message after 2 seconds
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      setError(t('security.copyError') || 'Failed to copy codes');
    }
  }, [generatedCodes, t]);

  return {
    // State
    backupCodesStatus,
    generatedCodes,
    currentPassword,
    exportFormat,
    isLoading,
    isGenerating,
    isExporting,
    error,
    successMessage,
    showCodes,
    
    // Handlers
    handleLoadStatus,
    handleGenerateCodes,
    handleExportCodes,
    handleDeleteCodes,
    handlePasswordChange,
    handleFormatChange,
    handleCloseCodes,
    handleCopyCode,
    handleCopyAllCodes,
    
    // Validation
    canGenerate,
    canExport,
  };
}
