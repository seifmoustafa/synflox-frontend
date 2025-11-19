import { AccountOverviewView } from "@/views/account/account-overview-view";

/**
 * Account Overview Page
 * 
 * Main account page showing:
 * - Welcome message with profile
 * - Security score
 * - Quick stats
 * - Navigation cards to sub-pages
 * - Recent security events
 * 
 * Route: /account
 */
export default function AccountPage() {
  return <AccountOverviewView />;
}
