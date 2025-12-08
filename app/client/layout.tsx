"use client";

import { ClientAuthProvider } from "@/providers/client-auth-provider";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientAuthProvider>
      {children}
    </ClientAuthProvider>
  );
}
