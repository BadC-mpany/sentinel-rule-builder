"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Home,
  Hammer,
  Key,
  BookOpen,
  Mail,
  Sun,
  Moon,
  Shield,
  LogIn,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { name: "Home", href: "/home", icon: <Home className="w-4 h-4" /> },
  { name: "Builder", href: "/builder", icon: <Hammer className="w-4 h-4" /> },
  { name: "API / JWT", href: "/api-settings", icon: <Key className="w-4 h-4" /> },
  { name: "Docs", href: "/docs", icon: <BookOpen className="w-4 h-4" /> },
  { name: "Contact", href: "/contact", icon: <Mail className="w-4 h-4" /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="h-screen w-64 flex flex-col flex-shrink-0 z-50 bg-sidebar-bg border-r border-sidebar-border text-sidebar-text font-[var(--font-inter)] transition-all duration-300">
      {/* Logo Area */}
      <div className="h-16 px-6 flex items-center border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3 group w-full">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-200">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-white">Sentinel</span>
            <span className="text-[10px] uppercase tracking-wider text-sidebar-text-muted font-medium">Rule Builder</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-xs font-semibold text-sidebar-text-muted uppercase tracking-wider">
          Menu
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-active text-white shadow-md shadow-primary/10"
                  : "text-sidebar-text-muted hover:bg-sidebar-hover hover:text-white"
              )}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User & Settings */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar-bg">
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-sidebar-hover/50 border border-sidebar-border">
          {/* Auth Status */}
          <div className="flex-1">
            <SignedIn>
              <div className="flex items-center gap-3">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 rounded-lg ring-2 ring-sidebar-border",
                      userButtonPopoverCard: "bg-bg-primary border border-border-primary shadow-xl",
                      userButtonPopoverActions: "text-text-primary",
                      userButtonPopoverActionButton: "hover:bg-bg-secondary text-text-primary",
                      userButtonPopoverFooter: "hidden"
                    }
                  }}
                />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-white">Account</span>
                  <span className="text-[10px] text-green-400">Active</span>
                </div>
              </div>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-sidebar-active text-white text-xs font-medium hover:bg-primary-hover transition-colors">
                  <LogIn className="w-3 h-3" />
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>

          {/* Theme Toggle - Minimalist */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-sidebar-bg hover:bg-sidebar-hover text-sidebar-text-muted hover:text-white transition-colors border border-sidebar-border"
            title="Toggle Theme"
          >
            {theme === "light" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="mt-4 px-2 text-center">
          <p className="text-[10px] text-sidebar-text-muted/50 font-mono">vSAML v1.0.2</p>
        </div>
      </div>
    </aside>
  );
}
