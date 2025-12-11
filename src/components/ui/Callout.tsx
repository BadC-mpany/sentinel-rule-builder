import React from "react";
import { AlertTriangle, Info, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalloutProps {
  type?: "info" | "warning" | "success" | "error";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const calloutConfig = {
  info: {
    icon: Info,
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconColor: "text-blue-600",
    titleColor: "text-blue-900",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconColor: "text-amber-600",
    titleColor: "text-amber-900",
  },
  success: {
    icon: CheckCircle,
    bg: "bg-green-50",
    border: "border-green-200",
    iconColor: "text-green-600",
    titleColor: "text-green-900",
  },
  error: {
    icon: AlertCircle,
    bg: "bg-red-50",
    border: "border-red-200",
    iconColor: "text-red-600",
    titleColor: "text-red-900",
  },
};

export function Callout({ type = "info", title, children, className }: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-lg border p-4 my-6",
        config.bg,
        config.border,
        className
      )}
    >
      <div className="flex gap-3">
        <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", config.iconColor)} />
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={cn("font-semibold mb-2 font-[var(--font-inter)]", config.titleColor)}>
              {title}
            </h4>
          )}
          <div className={cn("text-sm leading-7", config.titleColor.replace("900", "700"))}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

