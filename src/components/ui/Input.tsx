import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  rightAdornment?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, rightAdornment, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <input
          type={type}
          className={cn(
            "w-full h-10 px-3 rounded-md border border-border-primary bg-bg-primary text-text-primary outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-text-secondary/50 font-body",
            rightAdornment && "pr-10",
            className
          )}
          ref={ref}
          {...props}
        />
        {rightAdornment && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
            {rightAdornment}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
