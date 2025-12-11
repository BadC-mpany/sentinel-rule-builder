"use client";

import React, { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { LangChainTool } from "@/types";
import { ToolCard } from "./ToolCard";

interface ToolSearchProps {
  onAddTool: (tool: LangChainTool) => void;
  addedToolIds: string[];
  tools: LangChainTool[];
}

export function ToolSearch({ onAddTool, addedToolIds, tools }: ToolSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) {
      return tools;
    }

    const query = searchQuery.toLowerCase();
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.displayName.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.taintClass.toLowerCase().includes(query)
    );
  }, [searchQuery, tools]);

  const availableTools = filteredTools.filter(
    (t) => !addedToolIds.includes(t.id)
  );

  return (
    <div className="h-full flex flex-col bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools..."
            className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tool List */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-500 font-medium">
            {availableTools.length} tool{availableTools.length !== 1 ? "s" : ""} available
          </p>
        </div>

        <div className="space-y-2">
          {availableTools.map((tool) => (
            <div key={tool.id} onClick={() => onAddTool(tool)} className="cursor-pointer hover:opacity-80 transition-opacity">
              <ToolCard tool={tool} />
            </div>
          ))}

          {availableTools.length === 0 && (
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                No tools found
              </h3>
              <p className="text-xs text-gray-500">
                {searchQuery
                  ? "Try a different search term"
                  : "All tools have been added"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

