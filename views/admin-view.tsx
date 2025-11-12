"use client";

import { GenericCrudView } from "@/components/ui/generic-crud-view";
import { useAdminViewModel } from "@/viewmodels/admin-viewmodel";

export function AdminView() {
  const { vm, config, handleDelete } = useAdminViewModel();

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

