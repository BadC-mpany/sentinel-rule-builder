"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ToggleGroupOption<T extends string> {
  value: T;
  label: string;
  color?: "default" | "green" | "red" | "yellow" | "orange" | "amber";
}

interface ToggleGroupProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  options: ToggleGroupOption<T>[];
  className?: string;
}

const colorStyles = {
  default: {
    active: "bg-zinc-700 text-white",
    inactive: "text-zinc-500 hover:text-zinc-400",
  },
  green: {
    active: "bg-green-600 text-white",
    inactive: "text-zinc-500 hover:text-zinc-400",
  },
  red: {
    active: "bg-red-600 text-white",
    inactive: "text-zinc-500 hover:text-zinc-400",
  },
  yellow: {
    active: "bg-yellow-600 text-white",
    inactive: "text-zinc-500 hover:text-zinc-400",
  },
  orange: {
    active: "bg-orange-600 text-white",
    inactive: "text-zinc-500 hover:text-zinc-400",
  },
  amber: {
    active: "bg-amber-600 text-white",
    inactive: "text-zinc-500 hover:text-zinc-400",
  },
};

export function ToggleGroup<T extends string>({
  value,
  onValueChange,
  options,
  className,
}: ToggleGroupProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full bg-black/40 p-0.5 backdrop-blur-sm",
        className
      )}
    >
      {options.map((option) => {
        const isActive = value === option.value;
        const colors = colorStyles[option.color || "default"];
        
        return (
          <button
            key={option.value}
            onClick={() => onValueChange(option.value)}
            type="button"
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200",
              isActive ? colors.active : colors.inactive
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

