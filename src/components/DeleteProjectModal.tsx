"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/Button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

interface DeleteProjectModalProps {
    projectName: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function DeleteProjectModal({ projectName, onConfirm, onCancel }: DeleteProjectModalProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [inputValue, setInputValue] = useState("");

    const isValid = inputValue === projectName;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isValid) {
            onConfirm();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                className={cn(
                    "w-full max-w-md rounded-xl border shadow-2xl",
                    isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"
                )}
            >
                {/* Header */}
                <div className={cn("flex items-center justify-between p-6 border-b", isDark ? "border-zinc-800" : "border-gray-200")}>
                    <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-900")}>
                        Delete Project
                    </h2>
                    <button
                        onClick={onCancel}
                        className={cn(
                            "p-1 rounded-lg transition-colors",
                            isDark ? "hover:bg-zinc-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"
                        )}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div className={cn("p-4 rounded-lg border", isDark ? "bg-red-900/20 border-red-900/50" : "bg-red-50 border-red-200")}>
                            <p className={cn("text-sm font-medium", isDark ? "text-red-400" : "text-red-800")}>
                                Warning: This action cannot be undone.
                            </p>
                        </div>

                        <p className={cn("text-sm", isDark ? "text-gray-300" : "text-gray-700")}>
                            This will permanently delete the project and all associated data.
                        </p>

                        <div>
                            <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                                Type in your project name to confirm:
                            </label>
                            <div className="relative">
                                {/* Faint placeholder that can't be copied */}
                                {!inputValue && (
                                    <div
                                        className={cn(
                                            "absolute inset-0 pointer-events-none flex items-center px-3 font-mono text-sm select-none",
                                            isDark ? "text-zinc-700" : "text-gray-300"
                                        )}
                                        style={{ userSelect: 'none' }}
                                    >
                                        {projectName}
                                    </div>
                                )}
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    className={cn(
                                        "w-full px-3 py-2 rounded-lg border font-mono text-sm transition-colors",
                                        isDark
                                            ? "bg-zinc-800 border-zinc-700 text-white placeholder-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500",
                                        "outline-none"
                                    )}
                                    autoFocus
                                    autoComplete="off"
                                    spellCheck={false}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={cn("flex items-center justify-end gap-3 p-6 border-t", isDark ? "border-zinc-800" : "border-gray-200")}>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!isValid}
                            className={cn(
                                "bg-red-600 hover:bg-red-700 text-white",
                                !isValid && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            Delete Project
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
