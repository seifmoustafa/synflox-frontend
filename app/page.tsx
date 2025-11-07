"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { HomeView } from "@/components/app_views/home-view";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <HomeView />
    </DashboardLayout>
  );
}
