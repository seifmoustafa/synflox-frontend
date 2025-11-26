"use client";

import { GenericCrudView } from "@/components/ui/generic-crud-view";
import { useSubscriptionViewModel } from "@/viewmodels/subscription-viewmodel";

/**
 * Subscription Management View
 * Displays subscriptions table with lifecycle operations
 */
export function SubscriptionView() {
  const { vm, config, ActionFormDialog } = useSubscriptionViewModel();

  return (
    <>
      <GenericCrudView
        viewModel={vm}
        config={config}
      />
      <ActionFormDialog />
    </>
  );
}
