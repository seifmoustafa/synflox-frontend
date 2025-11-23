"use client";

import React from "react";
import { GenericCrudView } from "@/components/ui/generic-crud-view";
import { useCompanyViewModel } from "@/viewmodels/company-viewmodel";

export function CompanyView() {
  const { vm, config } = useCompanyViewModel();

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
