"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export function Toggle({ checked, onCheckedChange, disabled, className, label }: ToggleProps) {
  const inputId = React.useId();
  
  return (
    <label 
      htmlFor={inputId}
      className={cn("flex items-center gap-2 cursor-pointer", disabled && "cursor-not-allowed", className)}
    >
      <div className="relative inline-flex items-center">
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onCheckedChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={cn(
            "w-11 h-6 bg-gray-200 rounded-full relative transition-colors duration-200",
            checked && "bg-purple-600",
            disabled && "opacity-50 cursor-not-allowed",
            !disabled && "cursor-pointer"
          )}
          onClick={() => !disabled && onCheckedChange(!checked)}
        >
          <div
            className={cn(
              "absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform duration-200",
              checked && "translate-x-5"
            )}
          />
        </div>
      </div>
      {label && (
        <span className={cn("text-sm text-gray-700", disabled && "opacity-50")}>
          {label}
        </span>
      )}
    </label>
  );
}

