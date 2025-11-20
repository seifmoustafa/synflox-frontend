"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { 
  ForgotPasswordRequest, 
  VerifyResetOtpRequest, 
  ForgotPasswordWith2FARequest,
  Check2FAStatusResponse 
} from "@/domain";

export interface ForgotPasswordViewModelReturn {
  // State
  email: string;
  otpCode: string;
  twoFactorCode: string;
  backupCode: string;
  isLoading: boolean;
  isEmailSent: boolean;
  isOtpVerified: boolean;
  requires2FA: boolean;
  useBackupCode: boolean;
  error: string | null;
  successMessage: string | null;
  
  // Handlers
  handleEmailChange: (value: string) => void;
  handleOtpChange: (value: string) => void;
  handle2FACodeChange: (value: string) => void;
  handleBackupCodeChange: (value: string) => void;
  handleCheckEmail: () => Promise<void>;
  handleSendOtp: () => Promise<void>;
  handleVerifyOtp: () => Promise<void>;
  handleChangeEmail: () => void;
  switchToBackupCode: () => void;
  switchTo2FA: () => void;
  
  // Validation
  canCheckEmail: boolean;
  canSendOtp: boolean;
  canVerifyOtp: boolean;
  isValidEmail: boolean;
  is2FACodeValid: boolean;
  isBackupCodeValid: boolean;
}

export function useForgotPasswordViewModel(): ForgotPasswordViewModelReturn {
  const router = useRouter();
  const { authService, notificationService } = useServices();
  const { t } = useI18n();

  // Form state
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Validate email format
   */
  const isValidEmail = (() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email.length > 0 && emailRegex.test(email);
  })();

  /**
   * Validate 2FA code (6 digits)
   */
  const is2FACodeValid = twoFactorCode.trim().length === 6;

  /**
   * Validate backup code (8 characters)
   */
  const isBackupCodeValid = backupCode.trim().replace(/[-\s]/g, '').length === 8;

  /**
   * Check if form can be submitted
   */
  const canCheckEmail = isValidEmail && !isLoading && !requires2FA;
  const canSendOtp = requires2FA 
    ? (useBackupCode ? isBackupCodeValid : is2FACodeValid) && !isLoading 
    : false;
  const canVerifyOtp = otpCode.trim().length === 6 && !isLoading && isEmailSent;

  /**
   * Handle email input change
   */
  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    setError(null);
  }, []);

  /**
   * Handle OTP input change
   */
  const handleOtpChange = useCallback((value: string) => {
    // Only allow digits and max 6 characters
    const sanitized = value.replace(/\D/g, '').slice(0, 6);
    setOtpCode(sanitized);
    setError(null);
  }, []);

  /**
   * Handle 2FA code input change
   */
  const handle2FACodeChange = useCallback((value: string) => {
    const sanitized = value.replace(/\D/g, '').slice(0, 6);
    setTwoFactorCode(sanitized);
    setError(null);
  }, []);

  /**
   * Handle backup code input change
   */
  const handleBackupCodeChange = useCallback((value: string) => {
    let sanitized = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    // Auto-format: ABCD-1234
    if (sanitized.length > 4) {
      sanitized = sanitized.slice(0, 4) + "-" + sanitized.slice(4, 8);
    }
    setBackupCode(sanitized);
    setError(null);
  }, []);

  /**
   * Switch to backup code mode
   */
  const switchToBackupCode = useCallback(() => {
    setUseBackupCode(true);
    setTwoFactorCode("");
    setBackupCode("");
    setError(null);
  }, []);

  /**
   * Switch back to 2FA code mode
   */
  const switchTo2FA = useCallback(() => {
    setUseBackupCode(false);
    setTwoFactorCode("");
    setBackupCode("");
    setError(null);
  }, []);

  /**
   * Handle change email (go back to email entry)
   */
  const handleChangeEmail = useCallback(() => {
    setIsEmailSent(false);
    setRequires2FA(false);
    setUseBackupCode(false);
    setOtpCode("");
    setTwoFactorCode("");
    setBackupCode("");
    setError(null);
    setSuccessMessage(null);
  }, []);

  /**
   * Check if email has 2FA enabled
   */
  const handleCheckEmail = async () => {
    if (!canCheckEmail) return;

    setIsLoading(true);
    setError(null);

    try {
      const status = await authService.check2FAStatus(email);

      if (status.has2FA) {
        // Email has 2FA - show 2FA input
        setRequires2FA(true);
        notificationService.info(
          t("auth.twoFactorRequiredForReset") || 
          "This account has 2FA enabled. Please verify your identity."
        );
      } else {
        // No 2FA - send OTP directly
        await handleSendOtp();
      }
    } catch (err: any) {
      const errorMessage = 
        err?.message || 
        t("auth.emailCheckError") || 
        "Failed to check email status";
      setError(errorMessage);
      notificationService.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle send OTP to email (with 2FA if required)
   */
  const handleSendOtp = async () => {
    if (!canSendOtp && !canCheckEmail) return;

    setIsLoading(true);
    setError(null);

    try {
      let result;

      if (requires2FA) {
        // Send with 2FA verification
        const request = new ForgotPasswordWith2FARequest({
          email,
          twoFactorCode: useBackupCode ? undefined : twoFactorCode,
          backupCode: useBackupCode ? backupCode.replace(/[-\s]/g, '') : undefined,
        });

        if (!request.isValid) {
          throw new Error(
            useBackupCode 
              ? t("auth.invalidBackupCode") 
              : t("auth.invalidCode") || "Invalid verification code"
          );
        }

        result = await authService.forgotPasswordWith2FA(request);
      } else {
        // Send without 2FA
        const request = new ForgotPasswordRequest({ email });

        if (!request.isValid) {
          throw new Error(t("auth.invalidEmail") || "Invalid email address");
        }

        result = await authService.forgotPassword(request);
      }

      if (result.success) {
        setIsEmailSent(true);
        setRequires2FA(false); // Reset 2FA state
        setSuccessMessage(result.message);
        notificationService.success(
          result.message || 
          t("auth.otpSentToEmail") || 
          "OTP code sent to your email. Check your inbox!"
        );
      }
    } catch (err: any) {
      const errorMessage = 
        err?.message || 
        t("auth.forgotPasswordError") || 
        "Failed to send OTP code";
      setError(errorMessage);
      notificationService.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle verify OTP code
   */
  const handleVerifyOtp = async () => {
    if (!canVerifyOtp) return;

    setIsLoading(true);
    setError(null);

    try {
      const request = new VerifyResetOtpRequest({ 
        email, 
        otpCode: otpCode.trim() 
      });

      if (!request.isValid) {
        throw new Error(t("auth.invalidOtpCode") || "Invalid OTP code");
      }

      const result = await authService.verifyResetOtp(request);

      if (result.success) {
        setIsOtpVerified(true);
        notificationService.success(
          result.message || 
          t("auth.otpVerifiedSuccess") || 
          "OTP verified! Redirecting to reset password..."
        );

        // Redirect to reset password page with email and OTP
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${otpCode}`);
        }, 1500);
      }
    } catch (err: any) {
      const errorMessage = 
        err?.message || 
        t("auth.invalidOtpCode") || 
        "Invalid or expired OTP code";
      setError(errorMessage);
      notificationService.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
    email,
    otpCode,
    twoFactorCode,
    backupCode,
    isLoading,
    isEmailSent,
    isOtpVerified,
    requires2FA,
    useBackupCode,
    error,
    successMessage,
    
    // Handlers
    handleEmailChange,
    handleOtpChange,
    handle2FACodeChange,
    handleBackupCodeChange,
    handleCheckEmail,
    handleSendOtp,
    handleVerifyOtp,
    handleChangeEmail,
    switchToBackupCode,
    switchTo2FA,
    
    // Validation
    canCheckEmail,
    canSendOtp,
    canVerifyOtp,
    isValidEmail,
    is2FACodeValid,
    isBackupCodeValid,
  };
}
