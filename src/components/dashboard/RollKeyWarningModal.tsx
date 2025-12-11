"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface RollKeyWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  keyType: "api" | "jwt";
  isRolling: boolean;
}

export function RollKeyWarningModal({
  isOpen,
  onClose,
  onConfirm,
  keyType,
  isRolling,
}: RollKeyWarningModalProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!isOpen) return null;

  const keyTypeLabel = keyType === "api" ? "API Key" : "JWT Secrets";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full max-w-md rounded-xl shadow-2xl border overflow-hidden animate-fade-in",
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between p-6 border-b",
            isDark ? "border-gray-700" : "border-gray-200"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                isDark ? "bg-red-900/30" : "bg-red-100"
              )}
            >
              <AlertTriangle
                className={cn("w-5 h-5", isDark ? "text-red-400" : "text-red-600")}
              />
            </div>
            <h2
              className={cn(
                "text-xl font-semibold",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              Roll {keyTypeLabel}?
            </h2>
          </div>
          <button
            onClick={onClose}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              isDark
                ? "hover:bg-gray-700 text-gray-400"
                : "hover:bg-gray-100 text-gray-600"
            )}
            disabled={isRolling}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            <p
              className={cn(
                "text-sm leading-relaxed",
                isDark ? "text-gray-300" : "text-gray-700"
              )}
            >
              Rolling the {keyTypeLabel.toLowerCase()} will:
            </p>
            <ul
              className={cn(
                "space-y-2 text-sm list-disc list-inside",
                isDark ? "text-gray-300" : "text-gray-700"
              )}
            >
              <li>Delete all instances in the database</li>
              {keyType === "api" ? (
                <>
                  <li>Require MCP side reconfiguration</li>
                  <li>Require agent-side reconfiguration</li>
                </>
              ) : (
                <li>Require MCP side reconfiguration</li>
              )}
              <li>Invalidate all existing connections using this {keyType === "api" ? "API key" : "key pair"}</li>
            </ul>
            <div
              className={cn(
                "p-4 rounded-lg mt-4",
                isDark ? "bg-yellow-900/20 border border-yellow-800" : "bg-yellow-50 border border-yellow-200"
              )}
            >
              <p
                className={cn(
                  "text-sm font-medium",
                  isDark ? "text-yellow-300" : "text-yellow-800"
                )}
              >
                This action cannot be undone. Make sure {keyType === "api" ? "all MCP servers and agents are" : "all MCP servers are"} ready to be reconfigured.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={cn(
            "flex items-center justify-end gap-3 p-6 border-t",
            isDark ? "border-gray-700" : "border-gray-200"
          )}
        >
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isRolling}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isRolling}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isRolling ? "Rolling..." : `Roll ${keyTypeLabel}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

