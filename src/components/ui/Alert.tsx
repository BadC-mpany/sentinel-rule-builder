import React from "react";
import { AlertTriangle, Info, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "warning" | "success" | "error" | "info";
  children: React.ReactNode;
}

const alertVariants = {
  default: "bg-gray-50 border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
  warning: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/50 dark:border-amber-900 dark:text-amber-200",
  success: "bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
  error: "bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200",
  info: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200",
};

const alertIcons = {
  default: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

export function Alert({ variant = "default", className, children, ...props }: AlertProps) {
  const Icon = alertIcons[variant];

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        alertVariants[variant],
        className
      )}
      {...props}
    >
      <div className="flex gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

