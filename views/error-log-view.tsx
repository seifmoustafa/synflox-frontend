"use client";

import { GenericCrudView } from "@/components/ui/generic-crud-view";
import { useErrorLogViewModel } from "@/viewmodels/error-log-viewmodel";

export function ErrorLogView() {
  const { vm, config } = useErrorLogViewModel();

  return <GenericCrudView viewModel={vm} config={config} />;
}

