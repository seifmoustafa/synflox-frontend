"use client";

import { GenericCrudView } from "@/components/ui/generic-crud-view";
import { useSubscriptionPlanViewModel } from "@/viewmodels/subscription-plan-viewmodel";

/**
 * Subscription Plans Management View
 * Displays list of subscription plans with CRUD operations
 */
export function SubscriptionPlanView() {
  const { vm, config } = useSubscriptionPlanViewModel();

  return <GenericCrudView config={config} viewModel={vm} />;
}
