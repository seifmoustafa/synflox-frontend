"use client";

import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface DashboardErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class DashboardErrorBoundary extends React.Component<
  DashboardErrorBoundaryProps,
  DashboardErrorBoundaryState
> {
  constructor(props: DashboardErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<DashboardErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[DashboardErrorBoundary] Error caught:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-muted/20">
          <div className="max-w-2xl w-full">
            <div className="relative group">
              {/* Animated Border */}
              <div className="absolute -inset-[1px] bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-2xl opacity-75 blur-sm animate-gradient bg-[length:200%_200%]" />
              
              {/* Content Card */}
              <div className="relative p-8 rounded-2xl border bg-card shadow-2xl">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse" />
                    <div className="relative w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border-2 border-red-500/20">
                      <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-center mb-3">
                  Oops! Something went wrong
                </h1>
                
                {/* Description */}
                <p className="text-center text-muted-foreground mb-6">
                  We encountered an unexpected error while loading the dashboard. 
                  Don't worry, your data is safe.
                </p>

                {/* Error Details (Development Only) */}
                {process.env.NODE_ENV === "development" && this.state.error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-sm font-medium text-red-500 mb-2">Error Details:</p>
                    <pre className="text-xs text-muted-foreground overflow-auto max-h-40">
                      {this.state.error.toString()}
                      {this.state.errorInfo && (
                        <>
                          {"\n\n"}
                          {this.state.errorInfo.componentStack}
                        </>
                      )}
                    </pre>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={this.handleReset}
                    className={cn(
                      "flex-1 sm:flex-none gap-2 h-12 px-6",
                      "bg-gradient-to-r from-primary to-primary/90",
                      "hover:shadow-lg hover:scale-105",
                      "transition-all duration-300"
                    )}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reload Dashboard
                  </Button>
                  
                  <Button
                    onClick={this.handleGoHome}
                    variant="outline"
                    className={cn(
                      "flex-1 sm:flex-none gap-2 h-12 px-6",
                      "hover:bg-muted hover:scale-105",
                      "transition-all duration-300"
                    )}
                  >
                    <Home className="w-4 h-4" />
                    Go Home
                  </Button>
                </div>

                {/* Additional Help */}
                <div className="mt-6 pt-6 border-t">
                  <p className="text-xs text-center text-muted-foreground">
                    If this problem persists, please contact support with the error details above.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier usage
export function DashboardErrorWrapper({ children }: { children: React.ReactNode }) {
  return (
    <DashboardErrorBoundary>
      {children}
    </DashboardErrorBoundary>
  );
}
