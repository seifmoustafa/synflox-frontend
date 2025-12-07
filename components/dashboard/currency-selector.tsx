"use client";

import React, { useState } from "react";
import { useCurrency, SUPPORTED_CURRENCIES, type DisplayCurrency } from "@/providers/currency-provider";
import { useI18n } from "@/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Coins, Globe, Clock, Check, RotateCcw } from "lucide-react";

/**
 * Global Currency Selector Component
 * 
 * Two modes:
 * - 🌍 Global: Saved to localStorage, applies to ALL pages and future requests
 * - ⏱️ One-Time: Only for current session, resets when you refresh or navigate
 */
export function CurrencySelector() {
  const { 
    activeCurrency, 
    globalCurrency,
    currencyInfo, 
    setGlobalCurrency, 
    setTemporaryCurrency,
    resetToGlobal,
    isTemporary 
  } = useCurrency();
  const { t, language } = useI18n();
  const [mode, setMode] = useState<'global' | 'temporary'>('global');

  const handleCurrencySelect = (currency: DisplayCurrency) => {
    if (mode === 'global') {
      setGlobalCurrency(currency);
    } else {
      setTemporaryCurrency(currency);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`gap-2 min-w-[130px] ${isTemporary ? 'border-orange-500 border-2' : ''}`}
        >
          <Coins className="h-4 w-4" />
          <span>{currencyInfo.flag} {activeCurrency}</span>
          {isTemporary && (
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-orange-500/10 text-orange-500 border-orange-500">
              {t('common.currencySelector.temp')}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        {/* Mode Toggle */}
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {t('common.currencySelector.applyMode')}
        </DropdownMenuLabel>
        <div className="flex gap-1 px-2 pb-2">
          <Button
            variant={mode === 'global' ? 'default' : 'outline'}
            size="sm"
            className="flex-1 gap-1 text-xs h-8"
            onClick={() => setMode('global')}
          >
            <Globe className="h-3 w-3" />
            {t('common.currencySelector.global')}
          </Button>
          <Button
            variant={mode === 'temporary' ? 'default' : 'outline'}
            size="sm"
            className="flex-1 gap-1 text-xs h-8"
            onClick={() => setMode('temporary')}
          >
            <Clock className="h-3 w-3" />
            {t('common.currencySelector.temporary')}
          </Button>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Mode Description */}
        <div className="px-2 py-1 text-[10px] text-muted-foreground bg-muted/50 rounded mx-1 mb-2">
          {mode === 'global' 
            ? `🌍 ${t('common.currencySelector.globalDescription')}`
            : `⏱️ ${t('common.currencySelector.temporaryDescription')}`
          }
        </div>

        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {t('common.currencySelector.selectCurrency')}
        </DropdownMenuLabel>
        
        {/* Currency List */}
        {SUPPORTED_CURRENCIES.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => handleCurrencySelect(currency.code)}
            className={`flex items-center gap-2 cursor-pointer ${
              activeCurrency === currency.code ? 'bg-primary/10' : ''
            }`}
          >
            <span className="text-lg">{currency.flag}</span>
            <span className="font-medium">{currency.code}</span>
            <span className="text-muted-foreground text-xs">
              {language === 'ar' ? currency.nameAr : currency.name}
            </span>
            {activeCurrency === currency.code && (
              <Check className="h-4 w-4 ml-auto text-primary" />
            )}
            <span className="text-muted-foreground text-xs ml-auto">{currency.symbol}</span>
          </DropdownMenuItem>
        ))}

        {/* Reset Button (only show if temporary) */}
        {isTemporary && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={resetToGlobal}
              className="flex items-center gap-2 cursor-pointer text-orange-500"
            >
              <RotateCcw className="h-4 w-4" />
              <span>{t('common.currencySelector.resetToGlobal')}</span>
              <span className="ml-auto text-xs">({globalCurrency})</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
