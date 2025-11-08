"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/providers/service-provider";
import { useI18n } from "@/providers/i18n-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Loader2 } from "lucide-react";
import { SearchResult, SearchEntityType } from "@/domain";
import { cn } from "@/lib/utils";

interface GlobalSearchProps {
  containerClassName?: string;
  inputClassName?: string;
  iconClassName?: string;
}

export function GlobalSearch({ 
  containerClassName, 
  inputClassName,
  iconClassName 
}: GlobalSearchProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { searchService } = useServices();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showResults]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      setSuggestions([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const [searchResponse, suggestionsResponse] = await Promise.all([
          searchService.search(query, { limit: 5 }),
          searchService.getSuggestions(query, 5),
        ]);
        setResults(searchResponse.data);
        setSuggestions(suggestionsResponse.data.map(s => s.text));
        setShowResults(true);
      } catch (e) {
        // Error already shown by service
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, searchService]);

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
    setShowResults(false);
    setQuery("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  const getEntityTypeLabel = (entityType: SearchEntityType): string => {
    const labels: Record<SearchEntityType, string> = {
      [SearchEntityType.Company]: t("search.entityTypes.company"),
      [SearchEntityType.Admin]: t("search.entityTypes.admin"),
      [SearchEntityType.SubscriptionPlan]: t("search.entityTypes.subscriptionPlan"),
      [SearchEntityType.Project]: t("search.entityTypes.project"),
      [SearchEntityType.Module]: t("search.entityTypes.module"),
      [SearchEntityType.CompanyGroup]: t("search.entityTypes.companyGroup"),
      [SearchEntityType.ApiKey]: t("search.entityTypes.apiKey"),
      [SearchEntityType.Webhook]: t("search.entityTypes.webhook"),
    };
    return labels[entityType] || t("search.entityTypes.unknown");
  };

  return (
    <div ref={containerRef} className={cn("relative", containerClassName)}>
      <div className="relative">
        <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", iconClassName)} />
        <Input
          type="text"
          placeholder={t("search.placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0 || suggestions.length > 0) {
              setShowResults(true);
            }
          }}
          className={cn("pl-10 pr-10", inputClassName)}
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={() => {
              setQuery("");
              setResults([]);
              setSuggestions([]);
              setShowResults(false);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        {loading && (
          <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showResults && (results.length > 0 || suggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                {t("search.results")}
              </div>
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left px-3 py-2 hover:bg-accent rounded-md transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{result.title}</div>
                      {result.description && (
                        <div className="text-sm text-muted-foreground truncate">
                          {result.description}
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {getEntityTypeLabel(result.entityType)}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="p-2 border-t">
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                {t("search.suggestions")}
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-accent rounded-md transition-colors text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

