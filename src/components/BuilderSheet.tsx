"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SheetTool, Severity, StaticRuleAction } from "@/types";
import { SheetToolCard } from "./SheetToolCard";
import { Trash2, FileJson } from "lucide-react";
import { CardHeader, CardTitle, CardDescription, CardContent } from "./ui/Card";
import { Switch } from "./ui/Switch";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

interface BuilderSheetProps {
  sheetTools: SheetTool[];
  selectedToolId: string | null;
  onSelectTool: (id: string | null) => void;
  onRemoveTool: (id: string) => void;
  onUpdateSeverity: (id: string, severity: Severity) => void;
  onUpdateStaticRule: (id: string, action: StaticRuleAction) => void;
  onClearSheet: () => void;
  onExport: () => void;
  policyName: string;
  onPolicyNameChange: (name: string) => void;
}

const DROP_ZONE_ID = "selected-tools-dropzone";

export function BuilderSheet({
  sheetTools,
  selectedToolId,
  onSelectTool,
  onRemoveTool,
  onUpdateSeverity,
  onUpdateStaticRule,
  onClearSheet,
  policyName,
  onPolicyNameChange,
}: BuilderSheetProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const { setNodeRef, isOver } = useDroppable({
    id: DROP_ZONE_ID,
  });

  return (
    <div className="h-full flex flex-col w-full min-w-0">
      {/* Header */}
      <CardHeader className={cn("border-b", isDark ? "border-zinc-800" : "border-gray-200")}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className={cn("text-lg font-[var(--font-inter)]", isDark && "text-white")}>Selected Tools</CardTitle>
            <CardDescription className={cn("font-[var(--font-inter)]", isDark && "text-zinc-400")}>
              {sheetTools.length} tool{sheetTools.length !== 1 ? "s" : ""} configured
            </CardDescription>
          </div>
          {sheetTools.length > 0 && (
            <button
              type="button"
              onClick={onClearSheet}
              className={cn(
                "p-2 rounded-md transition-colors",
                isDark
                  ? "text-zinc-500 hover:bg-red-900/30 hover:text-red-400"
                  : "text-gray-400 hover:bg-red-50 hover:text-red-600"
              )}
              title="Clear all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Policy Name */}
        <div>
          <label className={cn("block text-xs font-medium mb-1.5 font-[var(--font-inter)]", isDark ? "text-zinc-300" : "text-gray-700")}>
            Policy Name
          </label>
          <input
            type="text"
            value={policyName}
            onChange={(e) => onPolicyNameChange(e.target.value)}
            placeholder="Enter policy name..."
            className={cn(
              "w-full px-3 py-2 rounded-lg text-sm transition-all font-[var(--font-inter)]",
              isDark
                ? "bg-zinc-800/50 border border-zinc-700 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            )}
          />
        </div>
      </CardHeader>

      {/* Selected Tools List */}
      <CardContent
        ref={setNodeRef}
        className={cn(
          "flex-1 overflow-y-auto p-4 transition-all",
          isOver && (isDark ? "bg-purple-900/20 border-2 border-dashed border-purple-500 rounded-lg" : "bg-purple-50/50 border-2 border-dashed border-purple-300 rounded-lg")
        )}
      >
        {sheetTools.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 h-full">
            <div className={cn("w-16 h-16 rounded-lg flex items-center justify-center mb-3", isDark ? "bg-zinc-800" : "bg-gray-100")}>
              <FileJson className={cn("w-8 h-8", isDark ? "text-zinc-500" : "text-gray-400")} />
            </div>
            <h3 className={cn("text-sm font-medium mb-1 font-[var(--font-inter)]", isDark ? "text-white" : "text-gray-900")}>
              {isOver ? "Drop tool here" : "No tools selected yet"}
            </h3>
            <p className={cn("text-xs max-w-xs font-[var(--font-inter)]", isDark ? "text-zinc-400" : "text-gray-500")}>
              {isOver
                ? "Release to add the tool"
                : "Check tools from the left panel or drag them here"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sheetTools.map((sheetTool) => (
              <div key={sheetTool.id} className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0">
                  <Switch
                    checked={true}
                    onCheckedChange={() => onRemoveTool(sheetTool.id)}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <SheetToolCard
                    sheetTool={sheetTool}
                    isSelected={selectedToolId === sheetTool.id}
                    onSelect={() =>
                      onSelectTool(
                        selectedToolId === sheetTool.id ? null : sheetTool.id
                      )
                    }
                    onRemove={() => onRemoveTool(sheetTool.id)}
                    onUpdateSeverity={(severity) =>
                      onUpdateSeverity(sheetTool.id, severity)
                    }
                    onUpdateStaticRule={(action) =>
                      onUpdateStaticRule(sheetTool.id, action)
                    }
                    onPositionChange={() => {}}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </div>
  );
}
