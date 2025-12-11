import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn("flex items-center gap-2 text-sm", className)} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          {item.href ? (
            <a
              href={item.href}
              className="text-gray-600 hover:text-gray-900 transition-colors font-[var(--font-inter)]"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-gray-900 font-medium font-[var(--font-inter)]">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

