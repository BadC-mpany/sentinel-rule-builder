"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ScrollArea({ className, children, ...props }: ScrollAreaProps) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <div className="h-full w-full overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:rgb(203_213_225)_transparent]">
        {children}
      </div>
    </div>
  );
}

