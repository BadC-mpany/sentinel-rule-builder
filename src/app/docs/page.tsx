"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Zap,
  Code2,
  AlertTriangle,
  Check,
  ChevronRight,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";

const docSections = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: <Zap className="w-5 h-5" />,
    content: `
## Introduction to vSAML

vSAML (Virtual Security Assertion Markup Language) is an architectural solution designed to address the security flaws inherent in RAG systems.

### The Problem

Modern AI agents can:
- Read sensitive files and immediately send them to external services
- Execute arbitrary code without verification
- Access databases and leak confidential information

### The Solution

vSAML introduces an **interceptor layer** between your AI agent and its tools. This interceptor:

1. **Tracks data flow** using taint analysis
2. **Enforces static rules** (ALLOW/DENY per tool)
3. **Applies dynamic rules** based on tool sequences
    `
  },
  {
    id: "api-reference",
    title: "API Reference",
    icon: <Code2 className="w-5 h-5" />,
    content: `
## Export Format

The Rule Builder exports configurations in JSON format:

\`\`\`json
{
  "tools": [
    {
      "name": "read_file",
      "taintClass": "SENSITIVE_READ",
      "severity": "high"
    }
  ],
  "policies": [
    {
      "name": "default_policy",
      "staticRules": { "read_file": "ALLOW" }
    }
  ]
}
\`\`\`
    `
  }
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState(docSections[0].id);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-full overflow-hidden bg-bg-primary flex relative">
      {/* Docs Sidebar */}
      <aside className={cn(
        "absolute inset-y-0 left-0 w-64 bg-bg-secondary border-r border-border-primary z-40 transform transition-transform duration-300 md:relative md:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6">
          <h3 className="font-bold text-sm uppercase tracking-wider text-text-tertiary mb-4">Documentation</h3>
          <nav className="space-y-1">
            {docSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-left",
                  activeSection === section.id
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:bg-bg-primary hover:text-text-primary"
                )}
              >
                {section.icon}
                {section.title}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-8 h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {docSections.map((section) => (
            <div
              key={section.id}
              className={cn(
                "animate-fade-in",
                activeSection === section.id ? "block" : "hidden"
              )}
            >
              <div className="flex items-center gap-2 text-sm text-text-tertiary mb-6">
                <span>Docs</span>
                <ChevronRight className="w-4 h-4" />
                <span className="font-medium text-text-primary">{section.title}</span>
              </div>

              <div className="prose prose-slate dark:prose-invert max-w-none">
                {/* Simplified rendering for demo - ideally use a markdown parser */}
                <h1 className="text-4xl font-bold font-[var(--font-display)] mb-8 text-text-primary">{section.title}</h1>
                <div className="whitespace-pre-wrap font-[var(--font-inter)] text-text-secondary leading-7">
                  {section.content.split('\n').map((line, i) => {
                    // Very basic pseudo-markdown rendering
                    if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mt-8 mb-4 text-text-primary">{line.replace('## ', '')}</h2>;
                    if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold mt-6 mb-3 text-text-primary">{line.replace('### ', '')}</h3>;
                    if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc">{line.replace('- ', '')}</li>;
                    if (line.trim().startsWith('```')) return null; // Skip code fences for simple view
                    return <p key={i} className="mb-4">{line}</p>;
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden fixed bottom-6 right-6 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg z-50"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <Menu className="w-6 h-6" />
      </button>
    </div>
  );
}
