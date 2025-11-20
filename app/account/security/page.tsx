import { SecurityView } from "@/views/account/security-view";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

/**
 * Security Settings Page
 * 
 * Comprehensive security management including:
 * - Security Overview (dashboard, score, recommendations)
 * - Password Change (with/without 2FA)
 * - Two-Factor Authentication (enable, disable, reset)
 * - Backup Codes (generate, export, manage)
 * 
 * Route: /account/security
 */
export default function SecurityPage() {
  return (
      <SecurityView />
  );
}
