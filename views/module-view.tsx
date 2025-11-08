"use client";

import { GenericCrudView } from "@/components/ui/generic-crud-view";
import { useModuleViewModel } from "@/viewmodels/module-viewmodel";

export function ModuleView() {
  const { vm, config } = useModuleViewModel();

  return <GenericCrudView viewModel={vm} config={config} />;
}

