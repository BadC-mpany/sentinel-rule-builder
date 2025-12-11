"use client";

import React from "react";
import { SheetTool, StaticRuleAction, TaintClass } from "@/types";
import { Trash2, Settings } from "lucide-react";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { ToggleGroup } from "./ui/ToggleGroup";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

interface SheetToolCardProps {
  sheetTool: SheetTool;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onUpdateSeverity: (severity: any) => void;
  onUpdateStaticRule: (action: StaticRuleAction) => void;
  onPositionChange: (x: number, y: number) => void;
}

const taintClassBadgeStyles: Record<TaintClass, { bg: string; text: string; border: string }> = {
  SAFE_READ: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  SENSITIVE_READ: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
  SAFE_WRITE: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  CONSEQUENTIAL_WRITE: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  UNSAFE_EXECUTE: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  HUMAN_VERIFY: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  SANITIZER: {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
  },
};

export function SheetToolCard({
  sheetTool,
  isSelected,
  onSelect,
  onRemove,
  onUpdateSeverity,
  onUpdateStaticRule,
  onPositionChange,
}: SheetToolCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const taintStyle = taintClassBadgeStyles[sheetTool.tool.taintClass];
  const classesToShow =
    sheetTool.tool.classes && sheetTool.tool.classes.length > 0
      ? sheetTool.tool.classes
      : [sheetTool.tool.taintClass];

  return (
    <Card
      className={cn(
        "p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
        isSelected && (isDark ? "ring-2 ring-purple-500 ring-offset-1 ring-offset-zinc-900 border-purple-500" : "ring-2 ring-purple-500 ring-offset-1 border-purple-300")
      )}
    >
      <div className="flex items-start gap-3">
        {/* Tool Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                "w-2 h-2 rounded-full flex-shrink-0",
                isDark 
                  ? taintStyle.text.replace("700", "500")
                  : taintStyle.bg.replace("50", "400")
              )}
            />
            <h3 className={cn("font-semibold text-sm truncate font-[var(--font-inter)]", isDark ? "text-white" : "text-gray-900")}>
              {sheetTool.tool.displayName}
            </h3>
            <div className="flex items-center gap-1 flex-wrap">
              {classesToShow.map((cls) => {
                const style = taintClassBadgeStyles[cls];
                return (
                  <Badge
                    key={cls}
                    variant="outline"
                    className={cn("border text-[11px]", style.text, style.border)}
                  >
                    {cls.replace(/_/g, " ")}
                  </Badge>
                );
              })}
            </div>
          </div>
          <p className={cn("text-sm line-clamp-1 mb-3 leading-relaxed font-[var(--font-inter)]", isDark ? "text-zinc-400" : "text-gray-600")}>
            {sheetTool.tool.description}
          </p>

          {/* Controls Row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Static Rule Toggle - Segmented Control */}
            <ToggleGroup
              value={sheetTool.staticRule}
              onValueChange={onUpdateStaticRule}
              options={[
                { value: "ALLOW" as StaticRuleAction, label: "Allow", color: "green" },
                { value: "DENY" as StaticRuleAction, label: "Deny", color: "red" },
              ]}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onSelect}
            type="button"
            className={cn(
              "p-2 rounded-md transition-all",
              isSelected
                ? "bg-purple-600 text-white"
                : isDark 
                  ? "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                  : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            )}
            title="View YAML"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={onRemove}
            type="button"
            className={cn(
              "p-2 rounded-md transition-all",
              isDark
                ? "text-zinc-500 hover:bg-red-900/30 hover:text-red-400"
                : "text-gray-400 hover:bg-red-50 hover:text-red-600"
            )}
            title="Remove tool"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
