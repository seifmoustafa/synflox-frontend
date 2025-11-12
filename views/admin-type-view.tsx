"use client";

import { GenericCrudView } from "@/components/ui/generic-crud-view";
import { useAdminTypeViewModel } from "@/viewmodels/admin-type-viewmodel";

export function AdminTypeView() {
  const { vm, config, handleDelete } = useAdminTypeViewModel();

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

