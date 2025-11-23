"use client";

import React from "react";
import { GenericCrudView } from "@/components/ui/generic-crud-view";
import { useProjectViewModel } from "@/viewmodels/project-viewmodel";

export function ProjectView() {
  const { vm, config } = useProjectViewModel();

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
