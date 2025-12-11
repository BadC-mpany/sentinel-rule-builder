import React from "react";
import { AlertOctagon, Ban, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface SecurityEvent {
    id: string;
    type: "breach" | "denied_rule";
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    timestamp: string;
}

interface SecurityEventsTableProps {
    events: SecurityEvent[];
    isDark: boolean;
}

export function SecurityEventsTable({ events, isDark }: SecurityEventsTableProps) {
    if (events.length === 0) {
        return (
            <div className={cn(
                "text-center py-8 text-sm",
                isDark ? "text-gray-500" : "text-gray-400"
            )}>
                No security events recorded recently.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className={cn(
                    "border-b",
                    isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
                )}>
                    <tr>
                        <th className="pb-3 font-medium">Event Type</th>
                        <th className="pb-3 font-medium">Description</th>
                        <th className="pb-3 font-medium">Severity</th>
                        <th className="pb-3 font-medium text-right">Time</th>
                    </tr>
                </thead>
                <tbody className={cn(isDark ? "divide-gray-700" : "divide-gray-200")}>
                    {events.map((event) => (
                        <tr key={event.id} className={cn("group", isDark ? "hover:bg-gray-700/30" : "hover:bg-gray-50")}>
                            <td className="py-3 pr-4">
                                <div className="flex items-center gap-2">
                                    {event.type === "breach" ? (
                                        <AlertOctagon className="w-4 h-4 text-red-500" />
                                    ) : (
                                        <Ban className="w-4 h-4 text-orange-500" />
                                    )}
                                    <span className={cn(
                                        "font-medium",
                                        isDark ? "text-gray-200" : "text-gray-900"
                                    )}>
                                        {event.type === "breach" ? "Security Breach" : "Rule Denied"}
                                    </span>
                                </div>
                            </td>
                            <td className={cn("py-3 pr-4", isDark ? "text-gray-300" : "text-gray-600")}>
                                {event.description}
                            </td>
                            <td className="py-3 pr-4">
                                <span className={cn(
                                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                    event.severity === "critical"
                                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                        : event.severity === "high"
                                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                )}>
                                    {event.severity}
                                </span>
                            </td>
                            <td className={cn("py-3 text-right", isDark ? "text-gray-500" : "text-gray-400")}>
                                {new Date(event.timestamp).toLocaleTimeString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
