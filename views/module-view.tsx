"use client";

import { GenericCrudView } from "@/components/ui/generic-crud-view";
import { useModuleViewModel } from "@/viewmodels/module-viewmodel";

export function ModuleView() {
  const { vm, config } = useModuleViewModel();

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
