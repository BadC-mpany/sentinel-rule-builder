import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

const buttonVariants = {
  default: "bg-primary text-white hover:bg-primary-hover dark:bg-primary dark:hover:bg-primary-hover",
  ghost: "hover:bg-bg-secondary text-text-secondary hover:text-text-primary dark:hover:bg-bg-secondary dark:text-text-secondary dark:hover:text-text-primary",
  outline: "border border-border-primary bg-bg-primary hover:bg-bg-secondary text-text-primary dark:border-border-primary dark:bg-bg-primary dark:hover:bg-bg-secondary dark:text-text-primary",
  secondary: "border border-border-primary bg-bg-primary hover:bg-bg-secondary text-text-primary hover:border-primary transition-colors",
  destructive: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700",
};

const buttonSizes = {
  default: "h-10 px-4",
  sm: "h-8 px-3 text-sm",
  lg: "h-12 px-6 text-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          buttonVariants[variant],
          buttonSizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

