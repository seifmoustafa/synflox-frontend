"use client";

import React, { useState, useCallback } from "react";
import { GenericModal } from "@/components/ui/generic-modal";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/providers/i18n-provider";
import { AlertCircle } from "lucide-react";

interface DatePickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (date: string) => void;
  title?: string;
  description?: string;
  required?: boolean;
  minDate?: string; // ISO date string
}

export function DatePickerModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  required = false,
  minDate,
}: DatePickerModalProps) {
  const { t } = useI18n();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = useCallback(() => {
    if (required && !selectedDate) {
      setError(t("datePickerModal.invalidDate") || "Please select a date");
      return;
    }

    if (selectedDate) {
      const date = new Date(selectedDate);
      const now = new Date();
      
      // Check if date is in the future
      if (date <= now) {
        setError(t("datePickerModal.dateMustBeFuture") || "Date must be in the future");
        return;
      }

      // Check minDate if provided
      if (minDate) {
        const min = new Date(minDate);
        if (date <= min) {
          setError(t("datePickerModal.dateMustBeFuture") || "Date must be after the minimum date");
          return;
        }
      }
    }

    setError(null);
    onConfirm(selectedDate);
    setSelectedDate("");
    onOpenChange(false);
  }, [selectedDate, required, minDate, onConfirm, onOpenChange, t]);

  const handleCancel = useCallback(() => {
    setSelectedDate("");
    setError(null);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date);
    setError(null);
  }, []);

  return (
    <GenericModal
      open={open}
      onOpenChange={onOpenChange}
      title={title || t("datePickerModal.title") || "Select Date"}
      description={description || t("datePickerModal.selectDate") || "Please select a date"}
      size="md"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date-picker-input">
            {t("datePickerModal.expiryDate") || "Expiry Date"}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <DatePicker
            id="date-picker-input"
            value={selectedDate}
            onChange={handleDateChange}
            placeholder={t("datePickerModal.selectDate") || "Select date"}
            required={required}
          />
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleCancel}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleConfirm} disabled={required && !selectedDate}>
            {t("common.confirm")}
          </Button>
        </div>
      </div>
    </GenericModal>
  );
}


