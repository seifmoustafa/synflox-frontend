import { ForgotPasswordFormView } from "@/views/forgot-password-form-view";

/**
 * Forgot Password Page
 * 
 * Two-step password reset flow:
 * 1. Email submission - Sends OTP code and magic link
 * 2. OTP verification - Validates code and redirects to reset password
 * Features beautiful animated background, branding panel, and typing indicators.
 * 
 * Route: /forgot-password
 */
export default function ForgotPasswordPage() {
  return <ForgotPasswordFormView />;
}
