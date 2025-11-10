"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StringArrayFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  value: string[];
  onChange: (value: string[]) => void;
  required?: boolean;
  className?: string;
}

export function StringArrayField({
  name,
  label,
  placeholder = "Enter value",
  value = [],
  onChange,
  required = false,
  className,
}: StringArrayFieldProps) {
  const [items, setItems] = useState<string[]>(value.length > 0 ? value : [""]);

  const handleItemChange = (index: number, newValue: string) => {
    const newItems = [...items];
    newItems[index] = newValue;
    setItems(newItems);
    
    // Filter out empty strings for the onChange callback
    const filteredItems = newItems.filter(item => item.trim() !== "");
    onChange(filteredItems);
  };

  const addItem = () => {
    const newItems = [...items, ""];
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return; // Keep at least one field
    
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    
    // Filter out empty strings for the onChange callback
    const filteredItems = newItems.filter(item => item.trim() !== "");
    onChange(filteredItems);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={`${name}-0`} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              id={`${name}-${index}`}
              name={`${name}[${index}]`}
              type="text"
              placeholder={placeholder}
              value={item}
              onChange={(e) => handleItemChange(index, e.target.value)}
              className="flex-1"
            />
            
            {items.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeItem(index)}
                className="h-10 w-10 shrink-0"
                title="Remove item"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>
    </div>
  );
}
