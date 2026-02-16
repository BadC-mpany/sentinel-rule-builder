"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import StarBorder from "@/components/StarBorder";
import ShinyText from "@/components/ShinyText";

export default function SplashPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className={cn(
      "min-h-screen flex flex-col",
      isDark ? "bg-bg-primary" : "bg-white"
    )}>
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Main Heading */}
          <div className="space-y-6">
            <h1
              className="text-6xl md:text-8xl font-bold tracking-tight text-[#FF0055]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Lilith Frameworks
            </h1>

            <p
              className={cn(
                "text-2xl md:text-3xl font-light",
                isDark ? "text-gray-300" : "text-gray-700"
              )}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Runtime defence for AI agents
            </p>

            <p
              className={cn(
                "text-lg md:text-xl",
                isDark ? "text-gray-500" : "text-gray-500"
              )}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              by{" "}
              <a
                href="https://badcompany.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold hover:underline transition-colors text-[#FF0055] hover:text-[#D60047]"
              >
                Bad Company
              </a>
            </p>
          </div>

          {/* Install Commands */}
          <div className="flex flex-col items-center justify-center gap-6 py-4 w-full">
            {/* Curl Command */}
            <StarBorder as="div" color="magenta" speed="5s" thickness={2} className="w-fit max-w-full">
              <div className="flex items-center justify-between gap-6 px-4 min-w-[300px] md:min-w-[450px]">
                <code className="font-mono text-sm text-gray-300 flex-1 text-left whitespace-nowrap overflow-x-auto">
                  <span className="text-[#ff7b72] mr-2">curl</span>
                  -sSfL badcompany.xyz/lilith-zero/install.sh | sh
                </code>
                <button
                  onClick={() => handleCopy("curl -sSfL badcompany.xyz/lilith-zero/install.sh | sh", "curl")}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  {copied === "curl" ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </StarBorder>

            <div className={cn("text-sm font-medium", isDark ? "text-gray-500" : "text-gray-400")}>or</div>

            {/* Pip Command */}
            <StarBorder as="div" color="magenta" speed="5s" thickness={2} className="w-fit max-w-full">
              <div className="flex items-center justify-between gap-6 px-4 min-w-[250px]">
                <code className="font-mono text-sm text-gray-300 flex-1 text-left whitespace-nowrap overflow-x-auto">
                  <span className="text-[#ff7b72] mr-2">pip</span>
                  <span className="text-[#d2a8ff] mr-2">install</span>
                  lilith-zero
                </code>
                <button
                  onClick={() => handleCopy("pip install lilith-zero", "pip")}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  {copied === "pip" ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </StarBorder>
          </div>

          {/* CTA Button */}
          <div className="pt-8 flex justify-center w-full">
            <Link
              href="/home"
              className="px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors rounded font-bold text-sm tracking-wide flex items-center justify-center min-w-[160px]"
            >
              <ShinyText
                text="GET STARTED"
                disabled={false}
                speed={2}
                color="#4b5563"
                shineColor="#ffffff"
                className="shiny-text"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

