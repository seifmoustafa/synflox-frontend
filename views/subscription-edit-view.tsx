"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Calendar, DollarSign, Building, Package, Settings, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GenericSelect } from "@/components/ui/generic-select";
import { useI18n } from "@/providers/i18n-provider";
import { formatDate } from "@/lib/utils";
import { Currency } from "@/domain/models/subscription-plan.model";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { useSubscriptionEditViewModel } from "@/viewmodels/subscription-edit-viewmodel";

interface SubscriptionEditViewProps {
  subscriptionId: string;
}

export function SubscriptionEditView({ subscriptionId }: SubscriptionEditViewProps) {
  const { t } = useI18n();
  const router = useRouter();
  const {
    subscription,
    loading,
    error,
    formData,
    setFormData,
    companyOptions,
    planOptions,
    saving,
    handleSave,
    hasChanges,
  } = useSubscriptionEditViewModel(subscriptionId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ErrorMessage 
          message={error || t("subscription.loadError")} 
        />
      </div>
    );
  }

  const currencyOptions = [
    { value: "1", label: t("plan.currencies.usd") },
    { value: "2", label: t("plan.currencies.eur") },
    { value: "3", label: t("plan.currencies.egp") },
    { value: "4", label: t("plan.currencies.sar") },
    { value: "5", label: t("plan.currencies.aed") },
    { value: "6", label: t("plan.currencies.gbp") },
    { value: "7", label: t("plan.currencies.jpy") },
    { value: "8", label: t("plan.currencies.cny") },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t("common.back")}</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("subscription.editSubscription")}
            </h1>
            <p className="text-muted-foreground">
              {subscription.companyName} • {subscription.planName}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>{t("common.cancel")}</span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex items-center space-x-2"
          >
            {saving ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saving ? t("common.saving") : t("common.save")}</span>
          </Button>
        </div>
      </div>

      {/* Warning Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {t("subscription.editWarning")}
        </AlertDescription>
      </Alert>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>{t("subscription.currentStatus")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Badge variant={subscription.status === "Active" ? "success" : "secondary"}>
                {t(`subscription.statuses.${subscription.status.toLowerCase()}`)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("subscription.daysRemaining")}</p>
              <p className="font-medium">
                {subscription.isLifetime ? "∞" : subscription.daysRemaining}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("subscription.expiryDate")}</p>
              <p className="font-medium">
                {subscription.isLifetime ? t("subscription.lifetime") : formatDate(subscription.expiryDateUtc)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("subscription.amount")}</p>
              <p className="font-medium">
                {subscription.amount} {Currency[subscription.currency] || "USD"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>{t("subscription.basicInformation")}</span>
            </CardTitle>
            <CardDescription>
              {t("subscription.basicInformationDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyId">{t("subscription.company")}</Label>
              <GenericSelect
                value={formData.companyId}
                onValueChange={(value: string) => setFormData({ ...formData, companyId: value })}
                options={companyOptions}
                placeholder={t("subscription.selectCompany")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="planId">{t("subscription.plan")}</Label>
              <GenericSelect
                value={formData.planId}
                onValueChange={(value: string) => setFormData({ ...formData, planId: value })}
                options={planOptions}
                placeholder={t("subscription.selectPlan")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">{t("subscription.currency")}</Label>
              <GenericSelect
                value={formData.currency.toString()}
                onValueChange={(value: string) => setFormData({ ...formData, currency: parseInt(value) as Currency })}
                options={currencyOptions}
                placeholder={t("subscription.selectCurrency")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">{t("subscription.amount")}</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder={t("subscription.enterAmount")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Subscription Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>{t("subscription.subscriptionSettings")}</span>
            </CardTitle>
            <CardDescription>
              {t("subscription.subscriptionSettingsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("subscription.autoRenew")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("subscription.autoRenewDescription")}
                </p>
              </div>
              <Switch
                checked={formData.autoRenew}
                onCheckedChange={(checked) => setFormData({ ...formData, autoRenew: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("subscription.isActive")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("subscription.isActiveDescription")}
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("subscription.isTrial")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("subscription.isTrialDescription")}
                </p>
              </div>
              <Switch
                checked={formData.isTrial}
                onCheckedChange={(checked) => setFormData({ ...formData, isTrial: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("subscription.isLifetime")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("subscription.isLifetimeDescription")}
                </p>
              </div>
              <Switch
                checked={formData.isLifetime}
                onCheckedChange={(checked) => setFormData({ ...formData, isLifetime: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>{t("subscription.dateSettings")}</span>
          </CardTitle>
          <CardDescription>
            {t("subscription.dateSettingsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t("subscription.startDate")}</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDateUtc}
                onChange={(e) => setFormData({ ...formData, startDateUtc: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">{t("subscription.expiryDate")}</Label>
              <Input
                id="expiryDate"
                type="datetime-local"
                value={formData.expiryDateUtc}
                onChange={(e) => setFormData({ ...formData, expiryDateUtc: e.target.value })}
                disabled={formData.isLifetime}
              />
              {formData.isLifetime && (
                <p className="text-xs text-muted-foreground">
                  {t("subscription.lifetimeNoExpiry")}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Reason */}
      <Card>
        <CardHeader>
          <CardTitle>{t("subscription.statusReason")}</CardTitle>
          <CardDescription>
            {t("subscription.statusReasonDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="statusReason">{t("subscription.statusReason")}</Label>
            <Input
              id="statusReason"
              value={formData.statusReason || ""}
              onChange={(e) => setFormData({ ...formData, statusReason: e.target.value })}
              placeholder={t("subscription.enterStatusReason")}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
