"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useI18n } from "@/providers/i18n-provider";
import { AlertTriangle, CheckCircle, XCircle, Pause, Play, RotateCcw, StopCircle, Loader2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

// Action types that require this dialog
export type SubscriptionActionType = 
  | "suspend" 
  | "resume" 
  | "cancel" 
  | "pause" 
  | "unpause" 
  | "reactivate" 
  | "stopTrial"
  | "renew";

interface SubscriptionActionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: SubscriptionActionDialogData) => Promise<void>;
  actionType: SubscriptionActionType;
  subscriptionName?: string;
  companyName?: string;
}

export interface SubscriptionActionDialogData {
  reason: string;
  notes?: string;
  sendEmailNotification: boolean;
  language: string;
}

// Get action-specific configuration
const getActionConfig = (actionType: SubscriptionActionType) => {
  const configs: Record<SubscriptionActionType, {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    variant: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    isDestructive: boolean;
  }> = {
    suspend: {
      icon: <Pause className="h-6 w-6" />,
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-600",
      variant: "default",
      isDestructive: true,
    },
    resume: {
      icon: <Play className="h-6 w-6" />,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600",
      variant: "default",
      isDestructive: false,
    },
    cancel: {
      icon: <XCircle className="h-6 w-6" />,
      iconBg: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-600",
      variant: "destructive",
      isDestructive: true,
    },
    pause: {
      icon: <Pause className="h-6 w-6" />,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600",
      variant: "default",
      isDestructive: false,
    },
    unpause: {
      icon: <Play className="h-6 w-6" />,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600",
      variant: "default",
      isDestructive: false,
    },
    reactivate: {
      icon: <CheckCircle className="h-6 w-6" />,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600",
      variant: "default",
      isDestructive: false,
    },
    stopTrial: {
      icon: <StopCircle className="h-6 w-6" />,
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600",
      variant: "default",
      isDestructive: false,
    },
    renew: {
      icon: <RotateCcw className="h-6 w-6" />,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      variant: "default",
      isDestructive: false,
    },
  };

  return configs[actionType];
};

export function SubscriptionActionDialog({
  open,
  onClose,
  onConfirm,
  actionType,
  subscriptionName,
  companyName,
}: SubscriptionActionDialogProps) {
  const { t, language: currentLanguage,direction } = useI18n();
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>(currentLanguage || "en");
  const [sendEmailNotification, setSendEmailNotification] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = getActionConfig(actionType);

  const handleConfirm = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await onConfirm({
        reason: reason.trim() || t(`subscription.dialog.defaultReason.${actionType}`),
        notes: notes.trim() || undefined,
        sendEmailNotification,
        language: selectedLanguage,
      });
      
      // Reset form and close dialog
      setReason("");
      setNotes("");
      setSendEmailNotification(true);
      onClose();
    } catch (err: any) {
      setError(err.message || t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason("");
      setNotes("");
      setSendEmailNotification(true);
      setSelectedLanguage(currentLanguage || "en");
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              config.iconBg,
              config.iconColor
            )}>
              {config.icon}
            </div>
            <div>
              <DialogTitle className="text-xl">
                {t(`subscription.dialog.${actionType}.title`)}
              </DialogTitle>
              {subscriptionName && (
                <p className="text-sm text-muted-foreground">
                  {subscriptionName} {companyName && `• ${companyName}`}
                </p>
              )}
            </div>
          </div>
          <DialogDescription className={cn("pt-2", actionType === "cancel" ? "text-center" : "",direction ==="rtl" && "text-right" )}>
            {t(`subscription.dialog.${actionType}.description`)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning for destructive actions */}
          {config.isDestructive && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <p className="text-sm text-destructive">
                {t(`subscription.dialog.${actionType}.warning`)}
              </p>
            </div>
          )}

          {/* Language Selector */}
          <div className="space-y-2">
            <Label htmlFor="language" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t("subscription.dialog.responseLanguage")}
            </Label>
            <select
              id="language"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              disabled={isSubmitting}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                "ring-offset-background focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              <option value="en">🇺🇸 English</option>
              <option value="ar">🇸🇦 العربية (Arabic)</option>
            </select>
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              {t("subscription.dialog.reason")}
              <span className="text-muted-foreground text-xs ms-2">
                ({t("common.optional")})
              </span>
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t(`subscription.dialog.reasonPlaceholder.${actionType}`)}
              className="min-h-[80px] resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Notes Input (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              {t("subscription.dialog.notes")}
              <span className="text-muted-foreground text-xs ms-2">
                ({t("common.optional")})
              </span>
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("subscription.dialog.notesPlaceholder")}
              className="min-h-[60px] resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Send Email Notification Checkbox */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="sendEmailNotification"
              checked={sendEmailNotification}
              onCheckedChange={(checked) => setSendEmailNotification(checked === true)}
              disabled={isSubmitting}
            />
            <Label htmlFor="sendEmailNotification" className="text-sm cursor-pointer">
              {t("subscription.dialog.sendEmailNotification")}
            </Label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant={config.variant}
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
                {t("common.processing")}
              </>
            ) : (
              t(`subscription.dialog.${actionType}.confirm`)
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
