"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { LangChainTool, TaintClass } from "@/types";
import { GripVertical } from "lucide-react";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

interface ToolCardProps {
  tool: LangChainTool;
  isDragging?: boolean;
  onToggle?: (checked: boolean) => void;
  checked?: boolean;
  compact?: boolean;
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

const taintClassLabels: Record<TaintClass, string> = {
  SAFE_READ: "Safe Read",
  SENSITIVE_READ: "Sensitive Read",
  SAFE_WRITE: "Safe Write",
  CONSEQUENTIAL_WRITE: "Consequential Write",
  UNSAFE_EXECUTE: "Unsafe Execute",
  HUMAN_VERIFY: "Human Verify",
  SANITIZER: "Sanitizer",
};

export function ToolCard({ tool, isDragging, onToggle, checked, compact }: ToolCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const classesToShow = tool.classes && tool.classes.length > 0 ? tool.classes : [tool.taintClass];
  
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: tool.id,
    data: { tool },
    disabled: compact || !!onToggle,
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  const badgeStyle = taintClassBadgeStyles[tool.taintClass];

  if (compact) {
    return (
      <Card
        className={cn(
          "p-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
          checked && "ring-2 ring-purple-500 ring-offset-1"
        )}
      >
        <div className="flex items-center gap-2">
          <span className={cn("font-semibold text-sm truncate flex-1", isDark ? "text-white" : "text-gray-900")}>
            {tool.displayName}
          </span>
          <div className="flex items-center gap-1 flex-wrap justify-end">
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
        {tool.description && (
          <p className={cn("text-xs mt-1.5 line-clamp-1 font-[var(--font-inter)]", isDark ? "text-zinc-400" : "text-gray-600")}>
            {tool.description}
          </p>
        )}
      </Card>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(!onToggle && { ...listeners, ...attributes })}
      className={cn(
        "cursor-grab active:cursor-grabbing"
      )}
    >
      <Card
        className={cn(
          "p-4 transition-all duration-200",
          "hover:shadow-md hover:-translate-y-0.5 hover:border-purple-300",
          isDragging && "opacity-50 shadow-lg ring-2 ring-purple-500",
          checked && "ring-2 ring-purple-500 ring-offset-1"
        )}
      >
        <div className="flex items-start gap-3">
          {!onToggle && (
            <GripVertical className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={cn("font-semibold text-sm truncate font-[var(--font-inter)]", isDark ? "text-white" : "text-gray-900")}>
                {tool.displayName}
              </h3>
              {tool.isCommon && (
                <Badge variant="secondary" className="text-xs">
                  Common
                </Badge>
              )}
            </div>

            <p className={cn("text-sm line-clamp-2 mb-3 leading-relaxed font-[var(--font-inter)]", isDark ? "text-zinc-400" : "text-gray-600")}>
              {tool.description}
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              {classesToShow.map((cls) => {
                const style = taintClassBadgeStyles[cls];
                return (
                  <Badge
                    key={cls}
                    variant="outline"
                    className={cn("border text-xs", style.text, style.border)}
                  >
                    {taintClassLabels[cls] || cls.replace(/_/g, " ")}
                  </Badge>
                );
              })}
              {tool.pricing && (
                <Badge variant="outline" className="text-xs">
                  {tool.pricing}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
