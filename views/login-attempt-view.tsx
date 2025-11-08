"use client";

import { GenericCrudView } from "@/components/ui/generic-crud-view";
import { useLoginAttemptViewModel } from "@/viewmodels/login-attempt-viewmodel";

export function LoginAttemptView() {
  const { vm, config } = useLoginAttemptViewModel();

  return <GenericCrudView viewModel={vm} config={config} />;
}

