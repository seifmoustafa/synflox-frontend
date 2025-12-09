"use client";

import React from "react";
import { useI18n } from "@shared/providers/i18n-provider";

interface PasswordStrengthIndicatorProps {
  password: string;
  strength: 'weak' | 'medium' | 'strong';
}

export function PasswordStrengthIndicator({ password, strength }: PasswordStrengthIndicatorProps) {
  const { t } = useI18n();

  if (!password) return null;

  const strengthConfig = {
    weak: {
      label: t("auth.passwordWeak") || "Weak",
      color: "bg-red-500",
      textColor: "text-red-600",
      width: "w-1/3",
    },
    medium: {
      label: t("auth.passwordMedium") || "Medium",
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      width: "w-2/3",
    },
    strong: {
      label: t("auth.passwordStrong") || "Strong",
      color: "bg-green-500",
      textColor: "text-green-600",
      width: "w-full",
    },
  };

  const config = strengthConfig[strength];

  // Password criteria
  const criteria = [
    {
      label: t("auth.passwordMinLength") || "At least 8 characters",
      met: password.length >= 8,
    },
    {
      label: t("auth.passwordUppercase") || "Contains uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      label: t("auth.passwordLowercase") || "Contains lowercase letter",
      met: /[a-z]/.test(password),
    },
    {
      label: t("auth.passwordNumber") || "Contains number",
      met: /\d/.test(password),
    },
    {
      label: t("auth.passwordSpecialChar") || "Contains special character",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ];

  return (
    <div className="space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${config.color} transition-all duration-300 ${config.width}`}
          />
        </div>
        <span className={`text-sm font-medium ${config.textColor}`}>
          {config.label}
        </span>
      </div>

      {/* Criteria checklist */}
      <div className="space-y-1">
        {criteria.map((criterion, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <svg
              className={`w-4 h-4 ${
                criterion.met ? "text-green-500" : "text-gray-300"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className={criterion.met ? "text-gray-700" : "text-gray-400"}>
              {criterion.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
