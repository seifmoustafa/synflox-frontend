"use client";

import { useState } from 'react';
import { Shield, Key, Lock, BarChart3, AlertCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/providers/i18n-provider';
import { cn } from '@/lib/utils';
import { SecurityOverviewTab } from './security-tabs/security-overview-tab';
import { PasswordChangeTab } from './security-tabs/password-change-tab';
import { TwoFactorAuthTab } from './security-tabs/two-factor-auth-tab';
import { BackupCodesTab } from './security-tabs/backup-codes-tab';
import { DeleteAccountTab } from './security-tabs/delete-account-tab';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

type SecurityTab = 'overview' | 'password' | '2fa' | 'backup-codes' | 'delete-account';

export function SecurityView() {
  const { t, direction } = useI18n();
  const [activeTab, setActiveTab] = useState<SecurityTab>('overview');
  const isRTL = direction === 'rtl';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <SecurityOverviewTab />;
      case '2fa':
        return <TwoFactorAuthTab />;
      case 'backup-codes':
        return <BackupCodesTab />;
      case 'password':
        return <PasswordChangeTab />;
      case 'delete-account':
        return <DeleteAccountTab />;
      default:
        return <SecurityOverviewTab />;
    }
  };

  const menuItems = [
    {
      id: 'overview' as SecurityTab,
      icon: BarChart3,
      label: t('security.overview') || 'Security Overview',
      isEnabled: true,
      needsAction: false,
      isDanger: false,
    },
    {
      id: '2fa' as SecurityTab,
      icon: Shield,
      label: t('security.twoFactor') || 'Two-Factor Auth',
      isEnabled: false,
      needsAction: true,
      isDanger: false,
    },
    {
      id: 'backup-codes' as SecurityTab,
      icon: Key,
      label: t('security.backupCodes') || 'Backup Codes',
      isEnabled: true,
      needsAction: false,
      isDanger: false,
    },
    {
      id: 'password' as SecurityTab,
      icon: Lock,
      label: t('security.password') || 'Change Password',
      isEnabled: true,
      needsAction: true,
      isDanger: false,
    },
    {
      id: 'delete-account' as SecurityTab,
      icon: Trash2,
      label: t('security.deleteAccount') || 'Delete Account',
      isEnabled: true,
      needsAction: false,
      isDanger: true,
    },
  ];

  return (
    <div className="flex h-screen bg-muted/20 dark:bg-background overflow-hidden">
      {/* Sidebar Navigation */}
      <div className={cn(
        "w-72 border-r flex flex-col bg-background dark:bg-card/50 backdrop-blur-sm",
        isRTL && "border-l border-r-0"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-border/50">
          <div className={cn(
            "flex items-center gap-3.5",
           
          )}>
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 dark:bg-primary/20 blur-xl rounded-full" />
              <div className="relative p-2.5 rounded-xl bg-primary/10 dark:bg-primary/20 ring-1 ring-primary/30 dark:ring-primary/20 shadow-lg dark:shadow-primary/10">
                <Shield className="w-5 h-5 text-primary dark:text-primary/90" />
              </div>
            </div>
            <div className={cn("flex-1", isRTL && "text-right")}>
              <h1 className="font-bold text-lg text-foreground">
                {t('security.title') || 'Security'}
              </h1>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1.5">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <div key={item.id}>
                  {item.isDanger && index > 0 && (
                    <div className="my-3 border-t border-border/50" />
                  )}
                  <button
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "group w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    item.isDanger
                      ? isActive
                        ? "bg-destructive dark:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/25 dark:shadow-destructive/15"
                        : "text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 hover:text-destructive"
                      : isActive
                        ? "bg-primary dark:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 dark:shadow-primary/15"
                        : "text-muted-foreground hover:bg-muted/80 dark:hover:bg-muted/40 hover:text-foreground dark:hover:text-foreground"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 p-1.5 rounded-lg transition-colors",
                    item.isDanger
                      ? isActive
                        ? "bg-destructive-foreground/20 dark:bg-destructive-foreground/30"
                        : "bg-destructive/10 dark:bg-destructive/20 group-hover:bg-destructive/20 dark:group-hover:bg-destructive/30"
                      : isActive
                        ? "bg-primary-foreground/20 dark:bg-primary-foreground/30"
                        : "bg-muted-foreground/10 dark:bg-muted-foreground/20 group-hover:bg-muted-foreground/20 dark:group-hover:bg-muted-foreground/30"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <span className={cn(
                    "flex-1 truncate",
                    isRTL && "text-right"
                  )}>
                    {item.label}
                  </span>
                  
                </button>
                </div>
              );
            })}
          </div>

          {/* Help Section */}
          {menuItems.some(item => item.needsAction) && (
            <div className={cn(
              "mt-6 p-4 rounded-xl border",
              "bg-amber-50/50 dark:bg-amber-950/20",
              "border-amber-200 dark:border-amber-900/40"
            )}>
              <div className={cn(
                "flex items-start gap-3",
               
              )}>
                <div className="flex-shrink-0 p-2 rounded-lg bg-amber-500/10 dark:bg-amber-500/20">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                </div>
                <div className={cn("flex-1 space-y-1", isRTL && "text-right")}>
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                    {t('security.recommendedTitle') || 'Action Required'}
                  </h4>
                  <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-400">
                    {t('security.recommendedDesc') || 'Complete security setup'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-muted/30 dark:bg-muted/10">
        <div className="max-w-5xl mx-auto p-6 md:p-10">
          <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
            {/* Breadcrumbs */}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/account">
                      {t('nav.account') || 'Account'}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold">
                    {t('nav.security') || 'Security'}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
