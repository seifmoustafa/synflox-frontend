"use client";

import { useRouter } from "next/navigation";
import { 
  RefreshCw, 
  TrendingUp, 
  History, 
  Key, 
  Download, 
  Mail,
  Zap,
  Plus
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/providers/i18n-provider";

interface QuickActionsProps {
  company: {
    id: string;
    name: string;
    contactEmail?: string | null;
  };
  activeSubscription?: {
    id: string;
    daysRemaining: number;
    hasLicenseKey?: boolean;
  } | null;
  onCreateSubscription: () => void;
  onExport?: () => void;
  onGenerateLicenseKey?: () => void;
  setActiveTab?: (tab: string) => void;
}

export function QuickActions({ 
  company, 
  activeSubscription, 
  onCreateSubscription,
  onExport,
  onGenerateLicenseKey,
  setActiveTab
}: QuickActionsProps) {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          {t("common.quickActions")}
        </CardTitle>
        <CardDescription>
          {t("company.quickActionsDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Create Subscription */}
          {!activeSubscription && (
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={onCreateSubscription}
            >
              <Plus className="h-4 w-4 me-2" />
              {t("subscription.create")}
            </Button>
          )}
          
          {/* Renew Subscription */}
          {activeSubscription && activeSubscription.daysRemaining <= 30 && (
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => router.push(`/subscriptions/${activeSubscription.id}`)}
            >
              <RefreshCw className="h-4 w-4 me-2" />
              {t("subscription.renew")}
            </Button>
          )}
          
          {/* Upgrade Plan */}
          {activeSubscription && (
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => router.push(`/subscriptions/${activeSubscription.id}?action=upgrade`)}
            >
              <TrendingUp className="h-4 w-4 me-2" />
              {t("subscription.upgrade")}
            </Button>
          )}
          
          {/* View History */}
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => setActiveTab?.("subscriptions")}
          >
            <History className="h-4 w-4 me-2" />
            {t("subscription.viewHistory")}
          </Button>
          
          {/* Generate License Key */}
          {activeSubscription && !activeSubscription.hasLicenseKey && onGenerateLicenseKey && (
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={onGenerateLicenseKey}
            >
              <Key className="h-4 w-4 me-2" />
              {t("license.generate")}
            </Button>
          )}
          
          {/* Export Data */}
          {onExport && (
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={onExport}
            >
              <Download className="h-4 w-4 me-2" />
              {t("common.export")}
            </Button>
          )}
          
          {/* Contact Company */}
          {company.contactEmail && (
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => window.location.href = `mailto:${company.contactEmail}`}
            >
              <Mail className="h-4 w-4 me-2" />
              {t("common.contact")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
