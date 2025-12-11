import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string | number;
    change?: {
        value: string;
        trend: "up" | "down" | "neutral";
    };
    icon: React.ReactNode;
    isDark: boolean;
}

export function StatCard({ title, value, change, icon, isDark }: StatCardProps) {
    return (
        <div className={cn(
            "p-6 rounded-xl border",
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        )}>
            <div className="flex items-center justify-between mb-4">
                <h3 className={cn("text-sm font-medium", isDark ? "text-gray-400" : "text-gray-500")}>
                    {title}
                </h3>
                <div className={cn(
                    "p-2 rounded-lg",
                    isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                )}>
                    {icon}
                </div>
            </div>
            <div className="flex items-end justify-between">
                <div className={cn("text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                    {value}
                </div>
                {change && (
                    <div className={cn(
                        "flex items-center text-xs font-medium px-2 py-1 rounded-full",
                        change.trend === "up"
                            ? "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                            : change.trend === "down"
                                ? "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                                : "text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400"
                    )}>
                        {change.trend === "up" && <ArrowUp className="w-3 h-3 mr-1" />}
                        {change.trend === "down" && <ArrowDown className="w-3 h-3 mr-1" />}
                        {change.value}
                    </div>
                )}
            </div>
        </div>
    );
}
