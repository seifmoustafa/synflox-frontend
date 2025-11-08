"use client";

import { GenericCrudView } from "@/components/ui/generic-crud-view";
import { useProjectViewModel } from "@/viewmodels/project-viewmodel";

export function ProjectView() {
  const { vm, config } = useProjectViewModel();

  return <GenericCrudView viewModel={vm} config={config} />;
}

