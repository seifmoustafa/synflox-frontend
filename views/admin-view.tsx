"use client";

import React from "react";
import { GenericCrudView } from "@/components/ui/generic-crud-view";
import { useAdminViewModel } from "@/viewmodels/admin-viewmodel";

export function AdminView() {
  const { vm, config } = useAdminViewModel();

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

