/**
 * Two-Factor Authentication Management ViewModel
 * Handles enable, disable, reset, and verify 2FA operations
 */

import { useState, useCallback, useEffect } from 'react';
import { useServices } from '@/providers/service-provider';
import { useI18n } from '@/providers/i18n-provider';
import {
  TwoFactorSetup,
  Enable2FARequest,
  Disable2FARequest,
  Reset2FARequest,
} from '@/domain';

export interface TwoFactorManagementViewModelReturn {
  // State
  is2FAEnabled: boolean;
  qrCodeSetup: TwoFactorSetup | null;
  verificationCode: string;
  currentPassword: string;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  showQRCode: boolean;
  
  // Handlers
  handleEnable2FA: () => Promise<void>;
  handleVerify2FA: () => Promise<void>;
  handleDisable2FA: () => Promise<void>;
  handleReset2FA: () => Promise<void>;
  handleVerificationCodeChange: (value: string) => void;
  handlePasswordChange: (value: string) => void;
  closeQRCode: () => void;
  
  // Validation
  canVerify: boolean;
  canDisable: boolean;
  canReset: boolean;
}

export function use2FAManagementViewModel(
  initialIs2FAEnabled: boolean = false
): TwoFactorManagementViewModelReturn {
  const { profileService } = useServices();
  const { t } = useI18n();

  // State
  const [is2FAEnabled, setIs2FAEnabled] = useState(initialIs2FAEnabled);
  const [qrCodeSetup, setQrCodeSetup] = useState<TwoFactorSetup | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  // Update is2FAEnabled when prop changes
  useEffect(() => {
    setIs2FAEnabled(initialIs2FAEnabled);
  }, [initialIs2FAEnabled]);

  // Validation
  const canVerify = /^\d{6}$/.test(verificationCode);
  const canDisable = currentPassword.length > 0;
  const canReset = currentPassword.length > 0;

  // Handlers
  const handleVerificationCodeChange = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, '');
    setVerificationCode(cleaned.slice(0, 6));
    setError(null);
  }, []);

  const handlePasswordChange = useCallback((value: string) => {
    setCurrentPassword(value);
    setError(null);
  }, []);

  const closeQRCode = useCallback(() => {
    setShowQRCode(false);
    setQrCodeSetup(null);
    setVerificationCode('');
  }, []);

  const handleEnable2FA = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const setup = await profileService.enable2FA();
      setQrCodeSetup(setup);
      setShowQRCode(true);
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        t('security.enable2FAError') ||
        'Failed to enable 2FA';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [profileService, t]);

  const handleVerify2FA = useCallback(async () => {
    if (!canVerify) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const request = new Enable2FARequest({
        verificationCode,
      });

      if (!request.isValid) {
        throw new Error(
          t('security.invalid2FACode') || 'Invalid 2FA code'
        );
      }

      const result = await profileService.verify2FA(request);
      setSuccessMessage(result.message);
      setIs2FAEnabled(true);
      setShowQRCode(false);
      setQrCodeSetup(null);
      setVerificationCode('');
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        t('security.verify2FAError') ||
        'Failed to verify 2FA code';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [canVerify, verificationCode, profileService, t]);

  const handleDisable2FA = useCallback(async () => {
    if (!canDisable) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const request = new Disable2FARequest({
        currentPassword,
      });

      if (!request.isValid) {
        throw new Error(
          t('security.invalidPassword') || 'Password is required'
        );
      }

      const result = await profileService.disable2FA(request);
      setSuccessMessage(result.message);
      setIs2FAEnabled(false);
      setCurrentPassword('');
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        t('security.disable2FAError') ||
        'Failed to disable 2FA';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [canDisable, currentPassword, profileService, t]);

  const handleReset2FA = useCallback(async () => {
    if (!canReset) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const request = new Reset2FARequest({
        currentPassword,
      });

      if (!request.isValid) {
        throw new Error(
          t('security.invalidPassword') || 'Password is required'
        );
      }

      const setup = await profileService.reset2FA(request);
      setQrCodeSetup(setup);
      setShowQRCode(true);
      setCurrentPassword('');
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        t('security.reset2FAError') ||
        'Failed to reset 2FA';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [canReset, currentPassword, profileService, t]);

  return {
    // State
    is2FAEnabled,
    qrCodeSetup,
    verificationCode,
    currentPassword,
    isLoading,
    error,
    successMessage,
    showQRCode,
    
    // Handlers
    handleEnable2FA,
    handleVerify2FA,
    handleDisable2FA,
    handleReset2FA,
    handleVerificationCodeChange,
    handlePasswordChange,
    closeQRCode,
    
    // Validation
    canVerify,
    canDisable,
    canReset,
  };
}
