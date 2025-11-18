"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import {
  ValidateMagicLinkRequest,
  ResetPasswordRequest,
  MagicLinkValidationResponse,
} from "@/domain";

export interface ResetPasswordFormData {
  email: string;
  otpCode: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordViewModelReturn {
  // State
  formData: ResetPasswordFormData;
  isLoading: boolean;
  isValidating: boolean;
  isSuccess: boolean;
  error: string | null;
  validationError: string | null;
  passwordStrength: 'weak' | 'medium' | 'strong';
  isMagicLink: boolean;
  isOtpPreFilled: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  
  // Handlers
  handleFieldChange: (field: keyof ResetPasswordFormData, value: string) => void;
  handleSubmit: () => Promise<void>;
  handleBackToLogin: () => void;
  togglePasswordVisibility: (field: 'new' | 'confirm') => void;
  
  // Validation
  canSubmit: boolean;
  passwordsMatch: boolean;
}

export function useResetPasswordViewModel(): ResetPasswordViewModelReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authService, notificationService } = useServices();
  const { t } = useI18n();

  // Form state
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    email: "",
    otpCode: "",
    newPassword: "",
    confirmPassword: "",
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [isOtpPreFilled, setIsOtpPreFilled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /**
   * Handle magic link token OR email+otp params on component mount
   */
  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    const otp = searchParams.get("otp");
    
    if (token) {
      // Scenario 2: Magic link from email
      validateMagicLinkToken(token);
    } else if (email && otp) {
      // Scenario 1: After OTP verification from forgot password
      setFormData((prev) => ({
        ...prev,
        email: decodeURIComponent(email),
        otpCode: otp,
      }));
      setIsOtpPreFilled(true);
      notificationService.success(
        t("auth.otpVerifiedProceed") || "OTP verified! Please set your new password."
      );
    }
  }, [searchParams]);

  /**
   * Validate magic link and auto-fill email + OTP
   */
  const validateMagicLinkToken = async (token: string) => {
    setIsValidating(true);
    setIsMagicLink(true);

    try {
      const request = new ValidateMagicLinkRequest({ token });
      const validation = await authService.validateMagicLink(request);

      if (validation.isValid) {
        // Auto-fill email and OTP from magic link
        setFormData((prev) => ({
          ...prev,
          email: validation.email,
          otpCode: validation.otpCode,
        }));
        
        notificationService.success(
          t("auth.magicLinkValid") || "Magic link validated successfully"
        );
      } else {
        setValidationError(
          t("auth.magicLinkExpired") || "Magic link is invalid or expired"
        );
      }
    } catch (err: any) {
      const errorMessage = err?.message || t("auth.magicLinkError") || "Failed to validate magic link";
      setValidationError(errorMessage);
      notificationService.error(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * Handle form field changes
   */
  const handleFieldChange = useCallback(
    (field: keyof ResetPasswordFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setError(null);
    },
    []
  );

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = useCallback((field: 'new' | 'confirm') => {
    if (field === 'new') {
      setShowPassword(prev => !prev);
    } else {
      setShowConfirmPassword(prev => !prev);
    }
  }, []);

  /**
   * Calculate password strength
   */
  const passwordStrength: 'weak' | 'medium' | 'strong' = (() => {
    const password = formData.newPassword;
    if (!password) return 'weak';
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 12;
    
    const criteriaCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar, isLongEnough]
      .filter(Boolean).length;
    
    if (criteriaCount >= 4) return 'strong';
    if (criteriaCount >= 3) return 'medium';
    return 'weak';
  })();

  /**
   * Check if passwords match
   */
  const passwordsMatch = formData.newPassword === formData.confirmPassword && formData.newPassword.length > 0;

  /**
   * Check if form can be submitted
   */
  const canSubmit = 
    formData.email.length > 0 &&
    formData.otpCode.length === 6 &&
    formData.newPassword.length >= 8 &&
    passwordsMatch &&
    !isLoading;

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsLoading(true);
    setError(null);

    try {
      const request = new ResetPasswordRequest({
        email: formData.email,
        otpCode: formData.otpCode,
        newPassword: formData.newPassword,
      });

      if (!request.isValid) {
        throw new Error(t("auth.invalidPasswordReset") || "Invalid password reset request");
      }

      const result = await authService.resetPassword(request);

      if (result.success) {
        setIsSuccess(true);
        notificationService.success(
          result.message || t("auth.passwordResetSuccess") || "Password reset successfully"
        );

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err: any) {
      const errorMessage = err?.message || t("auth.passwordResetError") || "Failed to reset password";
      setError(errorMessage);
      notificationService.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Navigate back to login page
   */
  const handleBackToLogin = useCallback(() => {
    router.push("/login");
  }, [router]);

  return {
    // State
    formData,
    isLoading,
    isValidating,
    isSuccess,
    error,
    validationError,
    passwordStrength,
    isMagicLink,
    isOtpPreFilled,
    showPassword,
    showConfirmPassword,
    
    // Handlers
    handleFieldChange,
    handleSubmit,
    handleBackToLogin,
    togglePasswordVisibility,
    
    // Validation
    canSubmit,
    passwordsMatch,
  };
}
