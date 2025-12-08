"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useClientAuth } from "@/providers/client-auth-provider";
import { clientApiService, CLIENT_API_ENDPOINTS } from "@/services/client-api.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Building2,
  LogOut,
  Monitor,
  Wifi,
  WifiOff,
  HardDrive,
  RefreshCw,
  AlertCircle,
  Trash2,
  Server,
  Smartphone,
  Clock,
  Shield,
} from "lucide-react";

interface Device {
  id: string;
  deviceName: string;
  operatingSystem: string | null;
  activatedAtUtc: string;
  lastSeenAtUtc: string;
  lastIpAddress: string | null;
  isActive: boolean;
  // For offline devices
  machineHash?: string;
  // For online devices  
  deviceType?: string;
  apiCallCount?: number;
}

export default function ClientSubscriptionPage() {
  const { isAuthenticated, isLoading: authLoading, token, companyName, logout } = useClientAuth();
  const router = useRouter();
  const params = useParams();
  const subscriptionId = params.id as string;

  const [offlineDevices, setOfflineDevices] = useState<Device[]>([]);
  const [onlineDevices, setOnlineDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceToUnbind, setDeviceToUnbind] = useState<{ id: string; type: "offline" | "online"; name: string } | null>(null);
  const [unbindLoading, setUnbindLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/client/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch devices
  const fetchDevices = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch offline devices
      try {
        const offlineData = await clientApiService.get<Device[]>(
          CLIENT_API_ENDPOINTS.DEVICES.BY_SUBSCRIPTION(subscriptionId),
          token
        );
        setOfflineDevices(offlineData || []);
      } catch {
        // Offline devices fetch failed, continue
      }

      // Fetch online devices
      try {
        const onlineData = await clientApiService.get<Device[]>(
          CLIENT_API_ENDPOINTS.ONLINE_DEVICES.BY_SUBSCRIPTION(subscriptionId),
          token
        );
        setOnlineDevices(onlineData || []);
      } catch {
        // Online devices fetch failed, continue
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, subscriptionId]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleUnbind = async () => {
    if (!deviceToUnbind || !token) return;

    setUnbindLoading(true);
    try {
      if (deviceToUnbind.type === "offline") {
        await clientApiService.post(
          CLIENT_API_ENDPOINTS.DEVICES.UNBIND,
          token,
          { subscriptionId, activationId: deviceToUnbind.id }
        );
      } else {
        await clientApiService.delete(
          CLIENT_API_ENDPOINTS.ONLINE_DEVICES.UNBIND(deviceToUnbind.id),
          token
        );
      }

      // Refresh the list
      await fetchDevices();
      setDeviceToUnbind(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUnbindLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/client/login");
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/client/dashboard")}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="h-6 w-px bg-slate-600" />
            <div className="p-2 bg-primary/20 rounded-lg">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{companyName || "Client Portal"}</h1>
              <p className="text-sm text-slate-400">Subscription Devices</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchDevices} disabled={loading}>
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
            <Skeleton className="h-12 w-64 bg-slate-700" />
            <Skeleton className="h-96 bg-slate-700" />
          </div>
        ) : (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Manage Devices
              </CardTitle>
              <CardDescription className="text-slate-400">
                View and manage offline and online devices for this subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="offline" className="w-full">
                <TabsList className="bg-slate-700/50">
                  <TabsTrigger value="offline" className="flex items-center gap-2">
                    <WifiOff className="h-4 w-4" />
                    Offline Devices ({offlineDevices.length})
                  </TabsTrigger>
                  <TabsTrigger value="online" className="flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    Online Devices ({onlineDevices.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="offline" className="mt-4">
                  <DeviceTable
                    devices={offlineDevices}
                    type="offline"
                    onUnbind={(device) => setDeviceToUnbind({ 
                      id: device.id, 
                      type: "offline", 
                      name: device.deviceName 
                    })}
                  />
                </TabsContent>

                <TabsContent value="online" className="mt-4">
                  <DeviceTable
                    devices={onlineDevices}
                    type="online"
                    onUnbind={(device) => setDeviceToUnbind({ 
                      id: device.id, 
                      type: "online", 
                      name: device.deviceName 
                    })}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Unbind Confirmation Dialog */}
      <AlertDialog open={!!deviceToUnbind} onOpenChange={() => setDeviceToUnbind(null)}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Unbind Device</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to unbind "{deviceToUnbind?.name}"? 
              This device will need to re-register to access the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnbind}
              disabled={unbindLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {unbindLoading ? "Unbinding..." : "Unbind Device"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DeviceTable({
  devices,
  type,
  onUnbind,
}: {
  devices: Device[];
  type: "offline" | "online";
  onUnbind: (device: Device) => void;
}) {
  if (devices.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No {type} devices registered</p>
      </div>
    );
  }

  const getDeviceIcon = (device: Device) => {
    const deviceType = (device.deviceType || device.operatingSystem || "").toLowerCase();
    if (deviceType.includes("mobile") || deviceType.includes("phone") || deviceType.includes("android") || deviceType.includes("ios")) {
      return <Smartphone className="h-4 w-4" />;
    }
    if (deviceType.includes("server")) {
      return <Server className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <div className="rounded-lg border border-slate-600 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-600 hover:bg-slate-700/50">
            <TableHead className="text-slate-400">Device</TableHead>
            <TableHead className="text-slate-400">
              {type === "offline" ? "OS" : "Type"}
            </TableHead>
            <TableHead className="text-slate-400">Last Seen</TableHead>
            <TableHead className="text-slate-400">Status</TableHead>
            <TableHead className="text-slate-400 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={device.id} className="border-slate-600 hover:bg-slate-700/30">
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-700 rounded">
                    {getDeviceIcon(device)}
                  </div>
                  <div>
                    <p className="font-medium text-white">{device.deviceName || "Unknown"}</p>
                    {device.lastIpAddress && (
                      <p className="text-xs text-slate-500">{device.lastIpAddress}</p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-slate-300">
                {type === "offline" 
                  ? device.operatingSystem || "-" 
                  : device.deviceType || "-"}
              </TableCell>
              <TableCell className="text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {device.lastSeenAtUtc 
                    ? new Date(device.lastSeenAtUtc).toLocaleString()
                    : "Never"}
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={device.isActive ? "default" : "secondary"}
                  className={device.isActive ? "bg-green-600" : "bg-slate-600"}
                >
                  {device.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUnbind(device)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
