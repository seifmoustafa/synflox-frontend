"use client";

import { GenericCrudView } from "@/components/ui/generic-crud-view";
import { useCompanyViewModel } from "@/viewmodels/company-viewmodel";

export function CompanyView() {
  const { vm, config, handleDelete } = useCompanyViewModel();

  return (
    <GenericCrudView 
      viewModel={vm} 
      config={{
        ...config,
        getActions: (vm: any, t: any) => config.getActions?.(vm, t, handleDelete) || [],
      }} 
    />
  );
}

