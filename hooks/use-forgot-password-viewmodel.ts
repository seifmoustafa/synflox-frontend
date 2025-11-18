"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { ForgotPasswordRequest, VerifyResetOtpRequest } from "@/domain";

export interface ForgotPasswordViewModelReturn {
  // State
  email: string;
  otpCode: string;
  isLoading: boolean;
  isEmailSent: boolean;
  isOtpVerified: boolean;
  error: string | null;
  successMessage: string | null;
  
  // Handlers
  handleEmailChange: (value: string) => void;
  handleOtpChange: (value: string) => void;
  handleSendOtp: () => Promise<void>;
  handleVerifyOtp: () => Promise<void>;
  handleChangeEmail: () => void;
  
  // Validation
  canSendEmail: boolean;
  canVerifyOtp: boolean;
  isValidEmail: boolean;
}

export function useForgotPasswordViewModel(): ForgotPasswordViewModelReturn {
  const router = useRouter();
  const { authService, notificationService } = useServices();
  const { t } = useI18n();

  // Form state
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
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
   * Check if form can be submitted
   */
  const canSendEmail = isValidEmail && !isLoading && !isEmailSent;
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
   * Handle change email (go back to email entry)
   */
  const handleChangeEmail = useCallback(() => {
    setIsEmailSent(false);
    setOtpCode("");
    setError(null);
    setSuccessMessage(null);
  }, []);

  /**
   * Handle send OTP to email
   */
  const handleSendOtp = async () => {
    if (!canSendEmail) return;

    setIsLoading(true);
    setError(null);

    try {
      const request = new ForgotPasswordRequest({ email });

      if (!request.isValid) {
        throw new Error(t("auth.invalidEmail") || "Invalid email address");
      }

      const result = await authService.forgotPassword(request);

      if (result.success) {
        setIsEmailSent(true);
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
    isLoading,
    isEmailSent,
    isOtpVerified,
    error,
    successMessage,
    
    // Handlers
    handleEmailChange,
    handleOtpChange,
    handleSendOtp,
    handleVerifyOtp,
    handleChangeEmail,
    
    // Validation
    canSendEmail,
    canVerifyOtp,
    isValidEmail,
  };
}
