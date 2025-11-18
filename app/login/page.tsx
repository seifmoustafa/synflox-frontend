import { LoginFormView } from "@/views/login-form-view";

/**
 * Login Page
 * 
 * Authentication page for admin users.
 * Supports username/password login with optional 2FA verification.
 * Features beautiful animated background, branding panel, and typing indicators.
 * 
 * Route: /login
 */
export default function LoginPage() {
  return <LoginFormView />;
}