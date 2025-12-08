"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useClientAuth } from "@/providers/client-auth-provider";
import { clientApiService, CLIENT_API_ENDPOINTS } from "@/services/client-api.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  LogOut,
  Monitor,
  Wifi,
  WifiOff,
  HardDrive,
  Shield,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface SubscriptionSummary {
  subscriptionId: string;
  planName: string;
  maxDevices: number;
  boundDevices: number;
  remainingSlots: number;
  requiresMachineBinding: boolean;
  expiresAtUtc: string | null;
  isActive: boolean;
  admissionMode: string;
  hasOverride: boolean;
  isUnlimited: boolean;
}

interface CompanySummary {
  companyId: string;
  companyName: string;
  totalSubscriptions: number;
  subscriptionsWithDeviceLimit: number;
  totalBoundDevices: number;
  totalMaxDevices: number;
  subscriptions: SubscriptionSummary[];
}

export default function ClientDashboardPage() {
  const { isAuthenticated, isLoading: authLoading, token, companyName, logout } = useClientAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<CompanySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/client/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch company summary
  useEffect(() => {
    if (!token) return;

    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await clientApiService.get<CompanySummary>(
          CLIENT_API_ENDPOINTS.DEVICES.SUMMARY,
          token
        );
        setSummary(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [token]);

  const handleLogout = () => {
    logout();
    router.push("/client/login");
  };

  const handleRefresh = async () => {
    if (token) {
      setLoading(true);
      try {
        const data = await clientApiService.get<CompanySummary>(
          CLIENT_API_ENDPOINTS.DEVICES.SUMMARY,
          token
        );
        setSummary(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{companyName || "Client Portal"}</h1>
              <p className="text-sm text-slate-400">Device Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 bg-slate-700" />
              ))}
            </div>
            <Skeleton className="h-96 bg-slate-700" />
          </div>
        ) : summary ? (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-400">Active Subscriptions</CardDescription>
                  <CardTitle className="text-3xl text-white">{summary.totalSubscriptions}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Shield className="h-4 w-4" />
                    <span>{summary.subscriptionsWithDeviceLimit} with device limits</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-400">Offline Devices</CardDescription>
                  <CardTitle className="text-3xl text-white">{summary.totalBoundDevices}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <WifiOff className="h-4 w-4" />
                    <span>
                      {summary.totalMaxDevices > 0
                        ? `of ${summary.totalMaxDevices} max`
                        : "Unlimited"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-400">Available Slots</CardDescription>
                  <CardTitle className="text-3xl text-white">
                    {summary.totalMaxDevices > 0
                      ? summary.totalMaxDevices - summary.totalBoundDevices
                      : "∞"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <HardDrive className="h-4 w-4" />
                    <span>Ready to bind</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-400">Status</CardDescription>
                  <CardTitle className="text-3xl text-green-400 flex items-center gap-2">
                    <CheckCircle2 className="h-8 w-8" />
                    Active
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span>All systems operational</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subscriptions List */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Your Subscriptions
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Manage devices for each subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="bg-slate-700/50">
                    <TabsTrigger value="all">All Subscriptions</TabsTrigger>
                    <TabsTrigger value="limited">With Limits</TabsTrigger>
                    <TabsTrigger value="unlimited">Unlimited</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-4">
                    <SubscriptionList
                      subscriptions={summary.subscriptions}
                      token={token}
                    />
                  </TabsContent>

                  <TabsContent value="limited" className="mt-4">
                    <SubscriptionList
                      subscriptions={summary.subscriptions.filter((s) => !s.isUnlimited)}
                      token={token}
                    />
                  </TabsContent>

                  <TabsContent value="unlimited" className="mt-4">
                    <SubscriptionList
                      subscriptions={summary.subscriptions.filter((s) => s.isUnlimited)}
                      token={token}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            No data available
          </div>
        )}
      </main>
    </div>
  );
}

function SubscriptionList({
  subscriptions,
  token,
}: {
  subscriptions: SubscriptionSummary[];
  token: string | null;
}) {
  const router = useRouter();

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No subscriptions found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {subscriptions.map((sub) => (
        <div
          key={sub.subscriptionId}
          className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-white">{sub.planName}</h3>
                <Badge
                  variant={sub.isActive ? "default" : "destructive"}
                  className={sub.isActive ? "bg-green-600" : ""}
                >
                  {sub.isActive ? "Active" : "Inactive"}
                </Badge>
                {sub.hasOverride && (
                  <Badge variant="outline" className="border-yellow-600 text-yellow-500">
                    Custom Limit
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  {sub.boundDevices} / {sub.isUnlimited ? "∞" : sub.maxDevices} devices
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {sub.admissionMode === "AdminOnly"
                    ? "Admin approval required"
                    : sub.admissionMode === "Open"
                    ? "Open registration"
                    : sub.admissionMode}
                </span>
                {sub.expiresAtUtc && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Expires: {new Date(sub.expiresAtUtc).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/client/subscription/${sub.subscriptionId}`)}
              className="border-slate-600 text-slate-300 hover:text-white hover:border-slate-500"
            >
              Manage Devices
            </Button>
          </div>

          {/* Progress bar for device usage */}
          {!sub.isUnlimited && sub.maxDevices > 0 && (
            <div className="mt-3">
              <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    sub.boundDevices >= sub.maxDevices
                      ? "bg-red-500"
                      : sub.boundDevices >= sub.maxDevices * 0.8
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min((sub.boundDevices / sub.maxDevices) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-slate-500">
                <span>{sub.remainingSlots} slots remaining</span>
                <span>{Math.round((sub.boundDevices / sub.maxDevices) * 100)}% used</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
