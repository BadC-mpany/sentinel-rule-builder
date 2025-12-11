import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
  children: React.ReactNode;
}

const badgeVariants = {
  default: "bg-gray-100 text-gray-900 border border-gray-300",
  secondary: "bg-purple-50 text-purple-700 border border-purple-200",
  destructive: "bg-red-50 text-red-700 border border-red-200",
  outline: "bg-transparent text-gray-700 border border-gray-300",
};

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors",
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

