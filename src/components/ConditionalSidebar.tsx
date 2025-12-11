"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export function ConditionalSidebar() {
    const pathname = usePathname();

    // Hide sidebar on splash page (root "/")
    if (pathname === "/") {
        return null;
    }

    return <Sidebar />;
}
