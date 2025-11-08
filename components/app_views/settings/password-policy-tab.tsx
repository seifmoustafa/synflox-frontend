"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { PasswordPolicy, UpdatePasswordPolicyRequest } from "@/domain";
import { Loader2, Save } from "lucide-react";

export function PasswordPolicyTab() {
  const { t } = useI18n();
  const { passwordPolicyService } = useServices();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [policy, setPolicy] = useState<PasswordPolicy | null>(null);
  const [formData, setFormData] = useState({
    minLength: 8,
    requireUppercase: false,
    requireLowercase: false,
    requireNumbers: false,
    requireSpecialCharacters: false,
    maxAgeDays: undefined as number | undefined,
    preventReuseCount: undefined as number | undefined,
    lockoutAttempts: undefined as number | undefined,
    lockoutDurationMinutes: undefined as number | undefined,
  });

  useEffect(() => {
    const loadPolicy = async () => {
      try {
        setLoading(true);
        const data = await passwordPolicyService.getPasswordPolicy();
        setPolicy(data);
        setFormData({
          minLength: data.minLength,
          requireUppercase: data.requireUppercase,
          requireLowercase: data.requireLowercase,
          requireNumbers: data.requireNumbers,
          requireSpecialCharacters: data.requireSpecialCharacters,
          maxAgeDays: data.maxAgeDays,
          preventReuseCount: data.preventReuseCount,
          lockoutAttempts: data.lockoutAttempts,
          lockoutDurationMinutes: data.lockoutDurationMinutes,
        });
      } catch (e) {
        // Error already shown by service
      } finally {
        setLoading(false);
      }
    };
    loadPolicy();
  }, [passwordPolicyService]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const request = new UpdatePasswordPolicyRequest(formData);
      const updated = await passwordPolicyService.updatePasswordPolicy(request);
      setPolicy(updated);
    } catch (e) {
      // Error already shown by service
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("passwordPolicy.title")}</CardTitle>
        <CardDescription>{t("passwordPolicy.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Password Requirements */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t("passwordPolicy.requirements")}</h3>
          
          <div className="space-y-2">
            <Label>{t("passwordPolicy.minLength")}</Label>
            <Input
              type="number"
              min="1"
              value={formData.minLength}
              onChange={(e) => setFormData({ ...formData, minLength: parseInt(e.target.value) || 8 })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("passwordPolicy.requireUppercase")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("passwordPolicy.requireUppercaseDescription")}
              </p>
            </div>
            <Switch
              checked={formData.requireUppercase}
              onCheckedChange={(checked) => setFormData({ ...formData, requireUppercase: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("passwordPolicy.requireLowercase")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("passwordPolicy.requireLowercaseDescription")}
              </p>
            </div>
            <Switch
              checked={formData.requireLowercase}
              onCheckedChange={(checked) => setFormData({ ...formData, requireLowercase: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("passwordPolicy.requireNumbers")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("passwordPolicy.requireNumbersDescription")}
              </p>
            </div>
            <Switch
              checked={formData.requireNumbers}
              onCheckedChange={(checked) => setFormData({ ...formData, requireNumbers: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("passwordPolicy.requireSpecialCharacters")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("passwordPolicy.requireSpecialCharactersDescription")}
              </p>
            </div>
            <Switch
              checked={formData.requireSpecialCharacters}
              onCheckedChange={(checked) => setFormData({ ...formData, requireSpecialCharacters: checked })}
            />
          </div>
        </div>

        <Separator />

        {/* Password Expiration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t("passwordPolicy.expiration")}</h3>
          
          <div className="space-y-2">
            <Label>{t("passwordPolicy.maxAgeDays")}</Label>
            <Input
              type="number"
              min="0"
              placeholder={t("passwordPolicy.maxAgeDaysPlaceholder")}
              value={formData.maxAgeDays || ""}
              onChange={(e) => setFormData({ ...formData, maxAgeDays: e.target.value ? parseInt(e.target.value) : undefined })}
            />
            <p className="text-sm text-muted-foreground">
              {t("passwordPolicy.maxAgeDaysDescription")}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t("passwordPolicy.preventReuseCount")}</Label>
            <Input
              type="number"
              min="0"
              placeholder={t("passwordPolicy.preventReuseCountPlaceholder")}
              value={formData.preventReuseCount || ""}
              onChange={(e) => setFormData({ ...formData, preventReuseCount: e.target.value ? parseInt(e.target.value) : undefined })}
            />
            <p className="text-sm text-muted-foreground">
              {t("passwordPolicy.preventReuseCountDescription")}
            </p>
          </div>
        </div>

        <Separator />

        {/* Account Lockout */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t("passwordPolicy.lockout")}</h3>
          
          <div className="space-y-2">
            <Label>{t("passwordPolicy.lockoutAttempts")}</Label>
            <Input
              type="number"
              min="0"
              placeholder={t("passwordPolicy.lockoutAttemptsPlaceholder")}
              value={formData.lockoutAttempts || ""}
              onChange={(e) => setFormData({ ...formData, lockoutAttempts: e.target.value ? parseInt(e.target.value) : undefined })}
            />
            <p className="text-sm text-muted-foreground">
              {t("passwordPolicy.lockoutAttemptsDescription")}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t("passwordPolicy.lockoutDurationMinutes")}</Label>
            <Input
              type="number"
              min="0"
              placeholder={t("passwordPolicy.lockoutDurationMinutesPlaceholder")}
              value={formData.lockoutDurationMinutes || ""}
              onChange={(e) => setFormData({ ...formData, lockoutDurationMinutes: e.target.value ? parseInt(e.target.value) : undefined })}
            />
            <p className="text-sm text-muted-foreground">
              {t("passwordPolicy.lockoutDurationMinutesDescription")}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("common.saving")}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t("common.save")}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

