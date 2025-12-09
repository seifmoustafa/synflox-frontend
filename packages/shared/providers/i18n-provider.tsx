"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useMemo } from "react"

export type Language = "ar" | "en"
type Direction = "rtl" | "ltr"

// Generic translations type - apps provide their own translations
export type TranslationRecord = Record<string, any>
export interface TranslationsMap {
  ar: TranslationRecord
  en: TranslationRecord
}

interface I18nContextType {
  language: Language
  direction: Direction
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, any>) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

interface I18nProviderProps {
  children: React.ReactNode
  translations: TranslationsMap
  defaultLanguage?: Language
  onLanguageChange?: (lang: Language) => void
}

export function I18nProvider({ 
  children, 
  translations,
  defaultLanguage = "ar",
  onLanguageChange
}: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage)
  const [isHydrated, setIsHydrated] = useState(false)
  const direction: Direction = language === "ar" ? "rtl" : "ltr"

  const t = useMemo(() => (key: string, params?: Record<string, any>): string => {
    const keys = key.split('.')
    let value: any = translations[language]
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key // Return the key if path not found
      }
    }
    
    if (typeof value === 'string') {
      // Simple interpolation: replace {param} or {{param}} with actual values
      if (params) {
        // Support both {param} and {{param}} syntax
        return value
          .replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
            return params[paramKey] !== undefined ? String(params[paramKey]) : match
          })
          .replace(/\{(\w+)\}/g, (match, paramKey) => {
            return params[paramKey] !== undefined ? String(params[paramKey]) : match
          })
      }
      return value
    }
    
    return key
  }, [language, translations])

  const handleSetLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr")
    document.documentElement.setAttribute("lang", lang)

    // Update body class for font
    if (lang === "ar") {
      document.body.classList.add("font-arabic")
      document.body.classList.remove("font-english")
    } else {
      document.body.classList.add("font-english")
      document.body.classList.remove("font-arabic")
    }
    
    // Notify parent if callback provided
    onLanguageChange?.(lang)
  }

  useEffect(() => {
    setIsHydrated(true)
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ar")) {
      handleSetLanguage(savedLanguage)
    } else {
      // Set default language
      handleSetLanguage(defaultLanguage)
    }
  }, [defaultLanguage])

  return (
    <I18nContext.Provider
      value={{
        language,
        direction,
        setLanguage: handleSetLanguage,
        t,
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    // During SSR/prerendering or before hydration, provide fallback values
    if (typeof window === 'undefined') {
      return {
        language: 'ar' as const,
        direction: 'rtl' as const,
        setLanguage: () => {},
        t: (key: string, params?: Record<string, any>) => key, // Return key as fallback during SSR
      };
    }
    // Client-side fallback for hydration issues
    return {
      language: 'ar' as const,
      direction: 'rtl' as const,
      setLanguage: () => {},
      t: (key: string, params?: Record<string, any>) => key,
    };
  }
  return context;
}
