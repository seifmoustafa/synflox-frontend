"use client";

import React from "react";
import { GenericCrudView } from "@/components/ui/generic-crud-view";
import { useAdminTypeViewModel } from "@/viewmodels/admin-type-viewmodel";

export function AdminTypeView() {
  const { vm, config } = useAdminTypeViewModel();

  if (!vm || !config) {
    return <div>Loading...</div>;
  }

  return (
    <GenericCrudView 
      viewModel={vm} 
      config={config as any}
    />
  );
}

