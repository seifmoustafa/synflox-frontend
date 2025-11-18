import { ResetPasswordFormView } from "@/views/reset-password-form-view";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

/**
 * Reset Password Page
 * 
 * Handles password reset flow with two methods:
 * 1. Magic Link: User clicks link in email, token auto-validated, email+OTP auto-filled
 * 2. Manual OTP: After OTP verification from forgot-password, redirects here with email+OTP
 * 
 * Features beautiful animated background, branding panel, and password strength indicator.
 * 
 * Route: /reset-password?token=encrypted_magic_link_token
 * Or: /reset-password?email=user@example.com&otp=123456
 */
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordFormView />
    </Suspense>
  );
}
