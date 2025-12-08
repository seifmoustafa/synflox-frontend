"use client";

import React, { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TagsInputProps {
  value?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  helperText?: string;
  maxTags?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * Tags Input Component
 * 
 * Allows adding and removing tags (strings) one by one
 * - Type a tag and press Enter to add
 * - Click X to remove a tag
 * - Duplicate tags are not allowed
 */
export function TagsInput({
  value = [],
  onChange,
  placeholder = "Type and press Enter...",
  helperText,
  maxTags,
  disabled = false,
  className,
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAddTag = () => {
    const trimmedValue = inputValue.trim();
    
    // Clear error
    setError(null);

    // Validate
    if (!trimmedValue) {
      return;
    }

    if (value.includes(trimmedValue)) {
      setError("This item already exists");
      return;
    }

    if (maxTags && value.length >= maxTags) {
      setError(`Maximum ${maxTags} items allowed`);
      return;
    }

    // Add tag
    const newTags = [...value, trimmedValue];
    onChange?.(newTags);
    setInputValue("");
  };

  const handleRemoveTag = (indexToRemove: number) => {
    const newTags = value.filter((_, index) => index !== indexToRemove);
    onChange?.(newTags);
    setError(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      // Remove last tag if input is empty and backspace is pressed
      handleRemoveTag(value.length - 1);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Input Field */}
      <div className="flex gap-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || (maxTags ? value.length >= maxTags : false)}
          className={cn(error && "border-red-500")}
        />
        <Button
          type="button"
          onClick={handleAddTag}
          disabled={!inputValue.trim() || disabled || (maxTags ? value.length >= maxTags : false)}
          variant="outline"
          size="sm"
        >
          Add
        </Button>
      </div>

      {/* Helper Text or Error */}
      {(helperText || error) && (
        <p className={cn(
          "text-sm",
          error ? "text-red-500" : "text-muted-foreground"
        )}>
          {error || helperText}
        </p>
      )}

      {/* Tags Display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-md border bg-muted/20">
          {value.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="px-3 py-1 flex items-center gap-2 text-sm"
            >
              <span>{tag}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveTag(index)}
                  className="hover:text-destructive transition-colors"
                  aria-label={`Remove ${tag}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Count Display */}
      {maxTags && (
        <p className="text-xs text-muted-foreground">
          {value.length} / {maxTags} items
        </p>
      )}
    </div>
  );
}
