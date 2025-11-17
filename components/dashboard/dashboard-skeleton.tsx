"use client";

import { cn } from "@/lib/utils";

interface DashboardSkeletonProps {
  className?: string;
}

export function DashboardSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <div className={cn("space-y-6 animate-pulse", className)}>
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 rounded-2xl border bg-card shadow-lg">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-8 w-20 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-muted" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="p-6 rounded-2xl border bg-card shadow-lg">
            <div className="space-y-4">
              <div>
                <div className="h-5 w-32 bg-muted rounded mb-2" />
                <div className="h-3 w-48 bg-muted rounded" />
              </div>
              <div className="h-64 bg-muted rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Large Chart Skeleton */}
      <div className="p-6 rounded-2xl border bg-card shadow-lg">
        <div className="space-y-4">
          <div>
            <div className="h-5 w-40 bg-muted rounded mb-2" />
            <div className="h-3 w-56 bg-muted rounded" />
          </div>
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    </div>
  );
}

interface TabSkeletonProps {
  variant?: "overview" | "table" | "charts" | "insights";
  className?: string;
}

export function TabSkeleton({ variant = "overview", className }: TabSkeletonProps) {
  return (
    <div className={cn("space-y-6 animate-pulse", className)}>
      {variant === "overview" && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-6 rounded-2xl border bg-card shadow-lg">
                <div className="space-y-3">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-8 w-20 bg-muted rounded" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="p-6 rounded-2xl border bg-card shadow-lg">
                <div className="h-64 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        </>
      )}

      {variant === "table" && (
        <div className="p-6 rounded-2xl border bg-card shadow-lg">
          <div className="space-y-4">
            {/* Table Header */}
            <div className="flex justify-between items-center">
              <div className="h-6 w-32 bg-muted rounded" />
              <div className="h-10 w-24 bg-muted rounded" />
            </div>
            {/* Table Rows */}
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-48 bg-muted rounded" />
                </div>
                <div className="h-8 w-20 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      )}

      {variant === "charts" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 rounded-2xl border bg-card shadow-lg">
              <div className="space-y-4">
                <div className="h-5 w-32 bg-muted rounded" />
                <div className="h-64 bg-muted rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {variant === "insights" && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-6 rounded-2xl border bg-card shadow-lg">
                <div className="space-y-3">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-10 w-32 bg-muted rounded" />
                  <div className="h-3 w-40 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="p-6 rounded-2xl border bg-card shadow-lg">
                <div className="h-80 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function KPICardSkeleton() {
  return (
    <div className="p-6 rounded-2xl border bg-card shadow-lg animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-8 w-20 bg-muted rounded" />
          <div className="h-3 w-16 bg-muted rounded" />
        </div>
        <div className="w-12 h-12 rounded-xl bg-muted" />
      </div>
    </div>
  );
}

export function ChartCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl border bg-card shadow-lg animate-pulse">
      <div className="space-y-4">
        <div>
          <div className="h-5 w-32 bg-muted rounded mb-2" />
          <div className="h-3 w-48 bg-muted rounded" />
        </div>
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    </div>
  );
}
