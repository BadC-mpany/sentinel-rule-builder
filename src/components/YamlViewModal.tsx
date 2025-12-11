"use client";

import React, { useState, useEffect } from "react";
import { X, Copy, Check } from "lucide-react";
import { SheetTool, TaintClass } from "@/types";
import yaml from "js-yaml";
import { loadClassesFromYaml, ClassDefinition } from "@/lib/loadClasses";
import { useBuilderStore } from "@/store/builderStore";

interface YamlViewModalProps {
  sheetTool: SheetTool;
  onClose: () => void;
}

export function YamlViewModal({ sheetTool, onClose }: YamlViewModalProps) {
  const [copied, setCopied] = useState(false);
  const [classes, setClasses] = useState<ClassDefinition[]>([]);
  const { updateToolTaintClass, sheetTools } = useBuilderStore();
  
  // Get the latest tool from the store to reflect updates
  const currentTool = sheetTools.find((t) => t.id === sheetTool.id) || sheetTool;
  const [selectedClass, setSelectedClass] = useState<TaintClass>(currentTool.tool.taintClass);

  useEffect(() => {
    loadClassesFromYaml().then(setClasses);
  }, []);

  useEffect(() => {
    setSelectedClass(currentTool.tool.taintClass);
  }, [currentTool.tool.taintClass]);

  const handleClassChange = (newClass: TaintClass) => {
    setSelectedClass(newClass);
    updateToolTaintClass(currentTool.id, newClass);
  };

  const yamlData = {
    [currentTool.tool.name]: {
      description: currentTool.tool.description,
      classes: [selectedClass],
      auto_classified: false,
      args: Object.entries(currentTool.tool.inputSchema.properties).reduce(
        (acc, [key, value]) => {
          acc[key] = {
            type: value.type,
            description: value.description,
            required: currentTool.tool.inputSchema.required.includes(key),
          };
          return acc;
        },
        {} as Record<string, any>
      ),
    },
  };

  const yamlString = yaml.dump(yamlData, { indent: 2 });

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(yamlString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl bg-card-bg rounded-2xl shadow-2xl border border-border-primary overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-border-primary">
          <div>
            <h2 className="font-display text-xl font-bold text-text-primary">
              YAML Configuration
            </h2>
            <p className="text-sm text-text-muted mt-1">
              {currentTool.tool.displayName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                copied
                  ? "bg-severity-low text-white"
                  : "bg-bg-secondary text-text-secondary hover:bg-bg-tertiary"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-bg-secondary text-text-tertiary hover:text-text-primary transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {/* Class Selection Dropdown */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Taint Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value as TaintClass)}
              className="w-full px-3 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
            >
              {classes.map((classDef) => (
                <option key={classDef.className} value={classDef.className}>
                  {classDef.className.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            {classes.find((c) => c.className === selectedClass) && (
              <p className="mt-2 text-xs text-text-muted">
                {classes.find((c) => c.className === selectedClass)?.description}
              </p>
            )}
          </div>

          {/* YAML Preview */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              YAML Configuration
            </label>
            <pre className="bg-bg-secondary rounded-xl border border-border-primary p-4 max-h-96 overflow-auto text-sm font-mono text-text-secondary">
              <code>{yamlString}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}


