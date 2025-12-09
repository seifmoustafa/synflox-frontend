"use client"

import { Globe } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu"
import { useI18n } from "@shared/providers/i18n-provider"
import { cn } from "@shared/lib/utils"

interface LanguageSwitcherProps {
  buttonClassName?: string
  contentClassName?: string
}

export function LanguageSwitcher({ buttonClassName, contentClassName }: LanguageSwitcherProps) {
  const { setLanguage, t, direction } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn(buttonClassName)}>
          <Globe className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={direction === "rtl" ? "start" : "end"}
        className={cn(contentClassName)}
      >
        <DropdownMenuItem onClick={() => setLanguage("ar")}>
          🇸🇦 {t("language.arabic") || "العربية"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("en")}>
          🇺🇸 {t("language.english") || "English"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

