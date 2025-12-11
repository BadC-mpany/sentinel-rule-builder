"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Copy, Check, Github } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

export default function SplashPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const RepoCard = ({ url, label }: { url: string, label: string }) => (
    <div className={cn(
      "flex items-center gap-3 p-3 pr-4 rounded-xl border transition-all duration-300 group flex-1 min-w-[340px]",
      isDark
        ? "bg-zinc-900 border-zinc-800 hover:border-purple-500/50 hover:bg-zinc-800/80"
        : "bg-white border-gray-200 hover:border-purple-500/50 hover:bg-gray-50"
    )}>
      <div className={cn(
        "p-2 rounded-lg",
        isDark ? "bg-zinc-800 group-hover:bg-zinc-700" : "bg-gray-100 group-hover:bg-gray-200"
      )}>
        <Github className={cn("w-5 h-5", isDark ? "text-white" : "text-gray-900")} />
      </div>

      <div className="flex flex-col items-start mr-4 flex-1 min-w-0">
        <span className={cn("text-xs font-medium mb-0.5", isDark ? "text-gray-500" : "text-gray-500")}>
          {label}
        </span>
        <div className={cn(
          "text-sm font-medium font-mono truncate w-full flex items-center gap-2",
          isDark ? "text-gray-300" : "text-gray-700"
        )}>
          <span className="opacity-50 select-none">git clone</span>
          <span className="hover:underline cursor-pointer" onClick={() => window.open(url, '_blank')}>
            {url.replace('https://github.com/', '')}
          </span>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.preventDefault();
          handleCopy(`git clone ${url}`, url);
        }}
        className={cn(
          "ml-auto p-2 rounded-lg transition-colors flex-shrink-0",
          isDark ? "hover:bg-zinc-700 text-gray-400" : "hover:bg-gray-200 text-gray-500"
        )}
      >
        {copied === url ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );

  return (
    <div className={cn(
      "min-h-screen flex flex-col",
      isDark ? "bg-zinc-950" : "bg-white"
    )}>
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Main Heading */}
          <div className="space-y-6">
            <h1 className={cn(
              "text-6xl md:text-8xl font-bold font-[var(--font-display)] tracking-tight",
              isDark ? "text-white" : "text-gray-900"
            )}>
              Sentinel Framework
            </h1>

            <p className={cn(
              "text-2xl md:text-3xl font-light",
              isDark ? "text-gray-300" : "text-gray-700"
            )}>
              Security for agentic systems
            </p>

            <p className={cn(
              "text-lg md:text-xl",
              isDark ? "text-gray-500" : "text-gray-500"
            )}>
              by{" "}
              <a
                href="https://badcompany.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "font-semibold hover:underline transition-colors",
                  isDark ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-700"
                )}
              >
                BadCompany
              </a>
            </p>
          </div>

          {/* Repo Links */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-4 w-full">
            <RepoCard
              label="Agent Template"
              url="https://github.com/BadC-mpany/sentinel-agent"
            />
            <RepoCard
              label="Sentinel Framework"
              url="https://github.com/BadC-mpany/sentinel"
            />
          </div>

          {/* CTA Button */}
          <div className="pt-8">
            <Link href="/home">
              <button className={cn(
                "group inline-flex items-center gap-2 px-10 py-5 text-xl font-semibold rounded-full transition-all duration-300",
                "hover:scale-105 hover:shadow-2xl",
                isDark
                  ? "bg-purple-600 hover:bg-purple-700 text-white shadow-xl shadow-purple-500/30"
                  : "bg-purple-600 hover:bg-purple-700 text-white shadow-xl shadow-purple-500/30"
              )}>
                Get Started
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

