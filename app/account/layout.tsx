import { DashboardLayout } from "@/components/layout/dashboard-layout";

/**
 * Account Pages Layout
 * Wraps all account pages with the dashboard layout
 */
export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
