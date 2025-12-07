"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";

// Supported currencies
export type DisplayCurrency = 'USD' | 'EUR' | 'EGP' | 'SAR' | 'AED' | 'GBP' | 'JPY' | 'CNY';

// Currency change mode
export type CurrencyMode = 'global' | 'temporary';

// Currency info with display details
export interface CurrencyInfo {
  code: DisplayCurrency;
  name: string;
  nameAr: string;
  symbol: string;
  flag: string;
}

// All supported currencies
export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar', nameAr: 'دولار أمريكي', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', nameAr: 'يورو', symbol: '€', flag: '🇪🇺' },
  { code: 'EGP', name: 'Egyptian Pound', nameAr: 'جنيه مصري', symbol: 'E£', flag: '🇪🇬' },
  { code: 'SAR', name: 'Saudi Riyal', nameAr: 'ريال سعودي', symbol: '﷼', flag: '🇸🇦' },
  { code: 'AED', name: 'UAE Dirham', nameAr: 'درهم إماراتي', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'GBP', name: 'British Pound', nameAr: 'جنيه إسترليني', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', nameAr: 'ين ياباني', symbol: '¥', flag: '🇯🇵' },
  { code: 'CNY', name: 'Chinese Yuan', nameAr: 'يوان صيني', symbol: '¥', flag: '🇨🇳' },
];

// Context interface
interface CurrencyContextType {
  // Current active currency (used for API calls)
  activeCurrency: DisplayCurrency;
  // Global saved currency (persisted)
  globalCurrency: DisplayCurrency;
  // Current currency info
  currencyInfo: CurrencyInfo;
  // Set currency globally (saved to localStorage, applies everywhere)
  setGlobalCurrency: (currency: DisplayCurrency) => void;
  // Set currency temporarily (only for current session/page)
  setTemporaryCurrency: (currency: DisplayCurrency) => void;
  // Reset to global currency (clear temporary)
  resetToGlobal: () => void;
  // Check if using temporary currency
  isTemporary: boolean;
  // Format amount with currency symbol
  formatAmount: (amount: number) => string;
  // Loading state
  isLoading: boolean;
  // Version number that changes when currency changes (for triggering re-fetches)
  version: number;
}

// Create context with default values
const CurrencyContext = createContext<CurrencyContextType>({
  activeCurrency: 'USD',
  globalCurrency: 'USD',
  currencyInfo: SUPPORTED_CURRENCIES[0],
  setGlobalCurrency: () => {},
  setTemporaryCurrency: () => {},
  resetToGlobal: () => {},
  isTemporary: false,
  formatAmount: (amount) => `$${amount}`,
  isLoading: true,
  version: 0,
});

// Storage key
const STORAGE_KEY = 'synflox_display_currency';

// Provider component
export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // Global currency (persisted)
  const [globalCurrency, setGlobalCurrencyState] = useState<DisplayCurrency>('USD');
  // Temporary currency (session only, not persisted)
  const [temporaryCurrency, setTemporaryCurrencyState] = useState<DisplayCurrency | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Version counter to trigger re-fetches
  const [version, setVersion] = useState(0);

  // Active currency is temporary if set, otherwise global
  const activeCurrency = temporaryCurrency ?? globalCurrency;
  const isTemporary = temporaryCurrency !== null;

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED_CURRENCIES.some(c => c.code === stored)) {
        setGlobalCurrencyState(stored as DisplayCurrency);
        console.log('📍 Loaded global currency from storage:', stored);
      }
    } catch (e) {
      console.warn('Failed to load currency from localStorage:', e);
    }
    setIsLoading(false);
  }, []);

  // Set currency globally (persisted)
  const setGlobalCurrency = useCallback((currency: DisplayCurrency) => {
    console.log('🌍 Currency set GLOBALLY to:', currency);
    setGlobalCurrencyState(currency);
    setTemporaryCurrencyState(null); // Clear temporary when setting global
    setVersion(v => v + 1); // Trigger re-fetch
    try {
      localStorage.setItem(STORAGE_KEY, currency);
    } catch (e) {
      console.warn('Failed to save currency to localStorage:', e);
    }
  }, []);

  // Set currency temporarily (not persisted)
  const setTemporaryCurrency = useCallback((currency: DisplayCurrency) => {
    console.log('⏱️ Currency set TEMPORARILY to:', currency);
    setTemporaryCurrencyState(currency);
    setVersion(v => v + 1); // Trigger re-fetch
  }, []);

  // Reset to global currency
  const resetToGlobal = useCallback(() => {
    console.log('🔄 Reset to global currency:', globalCurrency);
    setTemporaryCurrencyState(null);
    setVersion(v => v + 1); // Trigger re-fetch
  }, [globalCurrency]);

  // Get current currency info
  const currencyInfo = useMemo(() => 
    SUPPORTED_CURRENCIES.find(c => c.code === activeCurrency) || SUPPORTED_CURRENCIES[0],
    [activeCurrency]
  );

  // Format amount with currency symbol
  const formatAmount = useCallback((amount: number) => {
    return `${currencyInfo.symbol}${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)}`;
  }, [currencyInfo.symbol]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    activeCurrency,
    globalCurrency,
    currencyInfo,
    setGlobalCurrency,
    setTemporaryCurrency,
    resetToGlobal,
    isTemporary,
    formatAmount,
    isLoading,
    version,
  }), [activeCurrency, globalCurrency, currencyInfo, setGlobalCurrency, setTemporaryCurrency, resetToGlobal, isTemporary, formatAmount, isLoading, version]);

  // Always render children - don't block on hydration!
  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
}

// Hook to use currency context
export function useCurrency() {
  return useContext(CurrencyContext);
}

// Legacy hook for backward compatibility (returns selectedCurrency as activeCurrency)
export function useSelectedCurrency() {
  const { activeCurrency, setGlobalCurrency } = useCurrency();
  return {
    selectedCurrency: activeCurrency,
    setSelectedCurrency: setGlobalCurrency,
  };
}
