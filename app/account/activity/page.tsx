import { ActivityView } from "@/views/account/activity-view";

/**
 * Activity & Security Analytics Page
 * 
 * Shows:
 * - Security score and dashboard
 * - Recent security events timeline
 * - Failed login statistics
 * - 2FA usage analytics
 * - Security recommendations
 * 
 * Route: /account/activity
 */
export default function ActivityPage() {
  return <ActivityView />;
}
