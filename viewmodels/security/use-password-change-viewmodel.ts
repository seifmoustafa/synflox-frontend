/**
 * Password Change ViewModel
 * Handles password change with optional 2FA verification
 */

import { useState, useCallback } from 'react';
import { useServices } from '@/providers/service-provider';
import { useI18n } from '@/providers/i18n-provider';
import {
  ChangePasswordRequest,
  ChangePasswordWith2FARequest,
} from '@/domain';

export interface PasswordChangeViewModelReturn {
  // State
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorCode: string;
  backupCode: string;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  requires2FA: boolean;
  useBackupCode: boolean;
  
  // Handlers
  handleCurrentPasswordChange: (value: string) => void;
  handleNewPasswordChange: (value: string) => void;
  handleConfirmPasswordChange: (value: string) => void;
  handle2FACodeChange: (value: string) => void;
  handleBackupCodeChange: (value: string) => void;
  handleChangePassword: () => Promise<void>;
  switchToBackupCode: () => void;
  switchTo2FA: () => void;
  
  // Validation
  canChangePassword: boolean;
  passwordsMatch: boolean;
  passwordStrength: 'weak' | 'medium' | 'strong';
  is2FACodeValid: boolean;
  isBackupCodeValid: boolean;
}

export function usePasswordChangeViewModel(
  userHas2FA: boolean = false
): PasswordChangeViewModelReturn {
  const { profileService } = useServices();
  const { t } = useI18n();

  // State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const requires2FA = userHas2FA;

  // Validation
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;
  
  const passwordStrength: 'weak' | 'medium' | 'strong' = (() => {
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (newPassword.length >= 12) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[a-z]/.test(newPassword)) score++;
    if (/\d/.test(newPassword)) score++;
    if (/[@$!%*?&#]/.test(newPassword)) score++;

    if (score <= 3) return 'weak';
    if (score <= 5) return 'medium';
    return 'strong';
  })();

  const is2FACodeValid = /^\d{6}$/.test(twoFactorCode);
  const isBackupCodeValid = /^[A-Z0-9]{8}$/.test(backupCode.replace(/[-\s]/g, ''));

  const canChangePassword = (() => {
    const basicValid = 
      currentPassword.length > 0 &&
      newPassword.length >= 8 &&
      passwordsMatch;

    if (!requires2FA) {
      return basicValid;
    }

    const verificationValid = useBackupCode ? isBackupCodeValid : is2FACodeValid;
    return basicValid && verificationValid;
  })();

  // Handlers
  const handleCurrentPasswordChange = useCallback((value: string) => {
    setCurrentPassword(value);
    setError(null);
  }, []);

  const handleNewPasswordChange = useCallback((value: string) => {
    setNewPassword(value);
    setError(null);
  }, []);

  const handleConfirmPasswordChange = useCallback((value: string) => {
    setConfirmPassword(value);
    setError(null);
  }, []);

  const handle2FACodeChange = useCallback((value: string) => {
    // Only allow digits
    const cleaned = value.replace(/\D/g, '');
    setTwoFactorCode(cleaned.slice(0, 6));
    setError(null);
  }, []);

  const handleBackupCodeChange = useCallback((value: string) => {
    setBackupCode(value);
    setError(null);
  }, []);

  const switchToBackupCode = useCallback(() => {
    setUseBackupCode(true);
    setTwoFactorCode('');
    setError(null);
  }, []);

  const switchTo2FA = useCallback(() => {
    setUseBackupCode(false);
    setBackupCode('');
    setError(null);
  }, []);

  const handleChangePassword = useCallback(async () => {
    if (!canChangePassword) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (requires2FA) {
        // Change password with 2FA
        const request = new ChangePasswordWith2FARequest({
          currentPassword,
          newPassword,
          twoFactorCode: useBackupCode ? undefined : twoFactorCode,
          backupCode: useBackupCode ? backupCode.replace(/[-\s]/g, '') : undefined,
        });

        if (!request.isValid) {
          throw new Error(
            useBackupCode
              ? t('security.invalidBackupCode') || 'Invalid backup code'
              : t('security.invalid2FACode') || 'Invalid 2FA code'
          );
        }

        const result = await profileService.changePasswordWith2FA(request);
        setSuccessMessage(result.message);
        
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTwoFactorCode('');
        setBackupCode('');
      } else {
        // Simple password change (no 2FA)
        const request = new ChangePasswordRequest({
          currentPassword,
          newPassword,
        });

        if (!request.isValid) {
          throw new Error(
            t('security.invalidPassword') || 'Password does not meet requirements'
          );
        }

        const result = await profileService.changePassword(request);
        setSuccessMessage(result.message);
        
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        t('security.passwordChangeError') ||
        'Failed to change password';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    canChangePassword,
    requires2FA,
    currentPassword,
    newPassword,
    twoFactorCode,
    backupCode,
    useBackupCode,
    profileService,
    t,
  ]);

  return {
    // State
    currentPassword,
    newPassword,
    confirmPassword,
    twoFactorCode,
    backupCode,
    isLoading,
    error,
    successMessage,
    requires2FA,
    useBackupCode,
    
    // Handlers
    handleCurrentPasswordChange,
    handleNewPasswordChange,
    handleConfirmPasswordChange,
    handle2FACodeChange,
    handleBackupCodeChange,
    handleChangePassword,
    switchToBackupCode,
    switchTo2FA,
    
    // Validation
    canChangePassword,
    passwordsMatch,
    passwordStrength,
    is2FACodeValid,
    isBackupCodeValid,
  };
}
