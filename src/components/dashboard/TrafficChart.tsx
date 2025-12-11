"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/contexts/ThemeContext";

interface TrafficData {
  time: string;
  requests: number;
  errors: number;
}

interface TrafficChartProps {
  data: TrafficData[];
}

export function TrafficChart({ data }: TrafficChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke={isDark ? "#9ca3af" : "#6b7280"} 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke={isDark ? "#9ca3af" : "#6b7280"} 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              borderColor: isDark ? "#374151" : "#e5e7eb",
              borderRadius: "0.5rem",
              color: isDark ? "#f3f4f6" : "#111827"
            }}
          />
          <Area
            type="monotone"
            dataKey="requests"
            stroke="#8b5cf6"
            fillOpacity={1}
            fill="url(#colorRequests)"
            name="Requests"
          />
          <Area
            type="monotone"
            dataKey="errors"
            stroke="#ef4444"
            fillOpacity={1}
            fill="url(#colorErrors)"
            name="Errors"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
