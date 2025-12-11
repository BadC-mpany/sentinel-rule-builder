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
            "input-base",
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
