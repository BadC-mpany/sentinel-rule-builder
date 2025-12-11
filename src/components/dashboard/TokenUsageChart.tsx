"use client";

import React from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { useTheme } from "@/contexts/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { cn } from "@/lib/utils";

interface TokenUsageDataPoint {
    time: string;
    tokens: number;
}

interface TokenUsageChartProps {
    data: TokenUsageDataPoint[];
}

export function TokenUsageChart({ data }: TokenUsageChartProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <Card className={cn("col-span-1", isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200")}>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Token Usage (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[200px] w-full">
                    {data.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                            No token usage recorded
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#eee"} vertical={false} />
                                <XAxis
                                    dataKey="time"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? "#18181b" : "#ffffff",
                                        borderColor: isDark ? "#27272a" : "#e5e7eb",
                                        borderRadius: "8px",
                                        fontSize: "12px",
                                    }}
                                    labelStyle={{ color: isDark ? "#a1a1aa" : "#6b7280" }}
                                />
                                <Bar
                                    dataKey="tokens"
                                    fill={isDark ? "#a78bfa" : "#8b5cf6"}
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
