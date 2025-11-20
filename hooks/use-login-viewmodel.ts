"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useServices } from "@/providers/service-provider";
import { handleError, getUserFriendlyErrorMessage } from "@/lib/error-handler";
import { appLogger } from "@/lib/logger";
import { AuthMapper, LoginResponse, Verify2FARequest, VerifyBackupCodeRequest } from "@/domain";
import { validateForm, VALIDATION_SETS, isFormValid } from "@/lib/validation";

export interface LoginFormData {
  username: string;
  password: string;
  verificationCode?: string;
  backupCode?: string;
}

export function useLoginViewModel() {
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
    verificationCode: "",
    backupCode: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [requires2FA, setRequires2FA] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState({ username: "", password: "" });

  const { login, isAuthenticated } = useAuth();
  const { authService } = useServices();
  const { t } = useI18n();
  const router = useRouter();

  // Form field handlers
  const updateField = useCallback((field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError("");
  }, [error]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Login submission handler
  const handleLogin = useCallback(async () => {
    // Validate form data
    const validationResults = validateForm(formData, VALIDATION_SETS.LOGIN_FORM);
    
    if (!isFormValid(validationResults)) {
      // Get the first validation error
      const firstError = Object.values(validationResults).find(result => !result.isValid);
      setError(firstError?.message || t("auth.validationError"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Attempt login
      const result = await login(formData.username, formData.password);
      
      // Check if 2FA is required
      if (result instanceof LoginResponse && result.needs2FA) {
        appLogger.info("2FA required - showing verification UI");
        setRequires2FA(true);
        setSavedCredentials({ username: formData.username, password: formData.password });
        setError(""); // Clear any previous errors
        return; // Stay on login page but show 2FA input
      }
      
      // Login successful without 2FA
      appLogger.info("Login successful without 2FA");
      
      // Small delay to ensure auth state is properly updated
      setTimeout(() => {
        router.replace("/");
      }, 100);
    } catch (error) {
      const appError = handleError(error as Error, 'Login');
      appLogger.error("Login failed:", { error, appError });
      const errorMessage = getUserFriendlyErrorMessage(appError);
      setError(errorMessage);
      // Error is displayed inline above the form fields, no page reload
    } finally {
      setIsLoading(false);
    }
  }, [formData.username, formData.password, login, router, t]);

  // 2FA verification handler
  const handle2FAVerification = useCallback(async () => {
    // Validate verification code
    if (!formData.verificationCode || formData.verificationCode.trim().length !== 6) {
      setError(t("auth.invalidCode"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Create 2FA verification request
      const verify2FARequest = new Verify2FARequest({
        username: savedCredentials.username,
        password: savedCredentials.password,
        verificationCode: formData.verificationCode.trim(),
      });
      
      appLogger.info("Verifying 2FA code");
      const user = await authService.verify2FA(verify2FARequest);
      
      // Verification successful
      appLogger.info("2FA verification successful", { userId: user.id });
      
      // Force full page reload to trigger AuthProvider.checkAuth
      // This ensures auth state is properly initialized with new tokens
      window.location.href = "/";
    } catch (error) {
      const appError = handleError(error as Error, '2FA Verification');
      appLogger.error("2FA verification failed:", { error, appError });
      const errorMessage = getUserFriendlyErrorMessage(appError);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [formData.verificationCode, savedCredentials, authService, router, t]);

  // Switch to backup code mode
  const switchToBackupCode = useCallback(() => {
    setUseBackupCode(true);
    setFormData(prev => ({ ...prev, verificationCode: "", backupCode: "" }));
    setError("");
  }, []);

  // Switch back to 2FA code mode
  const switchTo2FA = useCallback(() => {
    setUseBackupCode(false);
    setFormData(prev => ({ ...prev, verificationCode: "", backupCode: "" }));
    setError("");
  }, []);

  // Backup code verification handler
  const handleBackupCodeVerification = useCallback(async () => {
    // Validate backup code (8 characters: ABCD1234)
    if (!formData.backupCode || formData.backupCode.trim().replace(/[-\s]/g, '').length !== 8) {
      setError(t("auth.invalidBackupCode"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Create backup code verification request
      const verifyBackupCodeRequest = new VerifyBackupCodeRequest({
        username: savedCredentials.username,
        backupCode: formData.backupCode.trim().replace(/[-\s]/g, ''), // Remove dashes/spaces
      });
      
      appLogger.info("Verifying backup code for login recovery");
      const user = await authService.verifyBackupCode(verifyBackupCodeRequest);
      
      // Verification successful
      appLogger.info("Backup code verification successful", { userId: user.id });
      
      // Force full page reload to trigger AuthProvider.checkAuth
      window.location.href = "/";
    } catch (error) {
      const appError = handleError(error as Error, 'Backup Code Verification');
      appLogger.error("Backup code verification failed:", { error, appError });
      const errorMessage = getUserFriendlyErrorMessage(appError);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [formData.backupCode, savedCredentials, authService, router, t]);

  // Back to login (cancel 2FA)
  const backToLogin = useCallback(() => {
    setRequires2FA(false);
    setUseBackupCode(false);
    setFormData(prev => ({ ...prev, verificationCode: "", backupCode: "" }));
    setSavedCredentials({ username: "", password: "" });
    setError("");
  }, []);

  // Navigation handler for authenticated users
  const redirectIfAuthenticated = useCallback(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({ username: "", password: "" });
    setShowPassword(false);
    setError("");
  }, []);

  return {
    // State
    formData,
    showPassword,
    isLoading,
    error,
    isAuthenticated,
    requires2FA,
    useBackupCode,

    // Actions
    updateField,
    togglePasswordVisibility,
    handleLogin,
    handle2FAVerification,
    handleBackupCodeVerification,
    switchToBackupCode,
    switchTo2FA,
    backToLogin,
    redirectIfAuthenticated,
    resetForm,

    // Computed
    isFormValid: isFormValid(validateForm(formData, VALIDATION_SETS.LOGIN_FORM)),
    is2FACodeValid: formData.verificationCode?.trim().length === 6,
    isBackupCodeValid: formData.backupCode?.trim().replace(/[-\s]/g, '').length === 8,
  };
}
