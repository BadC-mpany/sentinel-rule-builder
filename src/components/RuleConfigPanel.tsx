"use client";

import React, { useState } from "react";
import { SheetTool, TaintRule, TaintClass, TaintAction } from "@/types";
import { taintClassDefinitions } from "@/data/langchainTools";
import {
  X,
  Plus,
  Trash2,
  Info,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface RuleConfigPanelProps {
  sheetTool: SheetTool;
  onUpdateTaintRules: (rules: TaintRule[]) => void;
  onClose: () => void;
}

const taintActions: { value: TaintAction; label: string; description: string }[] = [
  {
    value: "ADD_TAINT",
    label: "Add Taint",
    description: "Marks data as tainted when this tool is used",
  },
  {
    value: "CHECK_TAINT",
    label: "Check Taint",
    description: "Blocks if session has forbidden taint tags",
  },
  {
    value: "BLOCK_SECOND",
    label: "Block Second",
    description: "Blocks the second step in a sequence pattern",
  },
  {
    value: "BLOCK_CURRENT",
    label: "Block Current",
    description: "Blocks the current tool execution",
  },
];

const taintClasses: TaintClass[] = [
  "SAFE_READ",
  "SENSITIVE_READ",
  "SAFE_WRITE",
  "CONSEQUENTIAL_WRITE",
  "UNSAFE_EXECUTE",
  "HUMAN_VERIFY",
  "SANITIZER",
];

export function RuleConfigPanel({
  sheetTool,
  onUpdateTaintRules,
  onClose,
}: RuleConfigPanelProps) {
  const [rules, setRules] = useState<TaintRule[]>(sheetTool.taintRules);
  const [expandedRuleIndex, setExpandedRuleIndex] = useState<number | null>(
    rules.length > 0 ? 0 : null
  );

  const taintDef = taintClassDefinitions.find(
    (d) => d.className === sheetTool.tool.taintClass
  );

  const addNewRule = () => {
    const newRule: TaintRule = {
      type: "simple",
      tool: sheetTool.tool.name,
      action: "ADD_TAINT",
      tag: "sensitive_data",
    };
    const newRules = [...rules, newRule];
    setRules(newRules);
    setExpandedRuleIndex(newRules.length - 1);
  };

  const updateRule = (index: number, updates: Partial<TaintRule>) => {
    const newRules = rules.map((rule, i) =>
      i === index ? { ...rule, ...updates } : rule
    ) as TaintRule[];
    setRules(newRules);
  };

  const removeRule = (index: number) => {
    const newRules = rules.filter((_, i) => i !== index);
    setRules(newRules);
    if (expandedRuleIndex === index) {
      setExpandedRuleIndex(null);
    } else if (expandedRuleIndex !== null && expandedRuleIndex > index) {
      setExpandedRuleIndex(expandedRuleIndex - 1);
    }
  };

  const saveAndClose = () => {
    onUpdateTaintRules(rules);
    onClose();
  };

  return (
    <div className="h-full flex flex-col bg-card-bg rounded-2xl border border-border-primary overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border-primary bg-bg-secondary">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-bold text-text-primary">
            Configure Rules
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-tertiary text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-3 p-3 bg-card-bg rounded-xl border border-border-primary">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: taintDef?.color }}
          />
          <div className="flex-1">
            <p className="font-semibold text-text-primary">
              {sheetTool.tool.displayName}
            </p>
            <p className="text-xs text-text-tertiary">
              {sheetTool.tool.taintClass.replace(/_/g, " ")}
            </p>
          </div>
        </div>
      </div>

      {/* Taint Class Info */}
      {taintDef && (
        <div className="p-4 border-b border-border-primary bg-accent-tertiary/20">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-accent-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-text-primary mb-1">
                {taintDef.className.replace(/_/g, " ")}
              </p>
              <p className="text-xs text-text-tertiary">{taintDef.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-primary">Taint Rules</h3>
          <button
            onClick={addNewRule}
            className="flex items-center gap-2 px-3 py-1.5 bg-accent-primary text-text-inverse rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        </div>

        {rules.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-text-muted" />
            <p className="text-text-secondary font-medium mb-1">
              No rules configured
            </p>
            <p className="text-sm text-text-muted">
              Add taint rules to define security behavior
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule, index) => (
              <div
                key={index}
                className="border border-border-primary rounded-xl overflow-hidden bg-bg-secondary"
              >
                {/* Rule Header */}
                <div
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-bg-tertiary transition-colors"
                  onClick={() =>
                    setExpandedRuleIndex(
                      expandedRuleIndex === index ? null : index
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-text-primary text-sm">
                        {rule.action.replace(/_/g, " ")}
                      </p>
                      {rule.type === "simple" && rule.tag && (
                        <p className="text-xs text-text-muted">
                          Tag: {rule.tag}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRule(index);
                      }}
                      className="p-1.5 rounded-lg hover:bg-severity-high/10 text-text-muted hover:text-severity-high transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {expandedRuleIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-text-muted" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-text-muted" />
                    )}
                  </div>
                </div>

                {/* Rule Config (Expanded) */}
                {expandedRuleIndex === index && (
                  <div className="p-4 border-t border-border-primary bg-card-bg animate-fade-in">
                    {/* Action Select */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Action
                      </label>
                      <select
                        value={rule.action}
                        onChange={(e) =>
                          updateRule(index, {
                            action: e.target.value as TaintAction,
                          })
                        }
                        className="w-full px-3 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
                      >
                        {taintActions.map((action) => (
                          <option key={action.value} value={action.value}>
                            {action.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-text-muted">
                        {taintActions.find((a) => a.value === rule.action)
                          ?.description}
                      </p>
                    </div>

                    {/* Tag Input (for ADD_TAINT) */}
                    {rule.action === "ADD_TAINT" && rule.type === "simple" && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Taint Tag
                        </label>
                        <input
                          type="text"
                          value={rule.tag || ""}
                          onChange={(e) =>
                            updateRule(index, { tag: e.target.value })
                          }
                          placeholder="e.g., sensitive_data"
                          className="w-full px-3 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary"
                        />
                      </div>
                    )}

                    {/* Tool Class Select (for class-based rules) */}
                    {(rule.action === "CHECK_TAINT" ||
                      rule.action === "BLOCK_CURRENT") &&
                      rule.type === "simple" && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            Target Tool Class
                          </label>
                          <select
                            value={rule.toolClass || ""}
                            onChange={(e) =>
                              updateRule(index, {
                                toolClass: e.target.value as TaintClass,
                              })
                            }
                            className="w-full px-3 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
                          >
                            <option value="">Select class...</option>
                            {taintClasses.map((tc) => (
                              <option key={tc} value={tc}>
                                {tc.replace(/_/g, " ")}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                    {/* Forbidden Tags (for CHECK_TAINT) */}
                    {rule.action === "CHECK_TAINT" && rule.type === "simple" && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Forbidden Tags (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={rule.forbiddenTags?.join(", ") || ""}
                          onChange={(e) =>
                            updateRule(index, {
                              forbiddenTags: e.target.value
                                .split(",")
                                .map((t) => t.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="sensitive_data, pii"
                          className="w-full px-3 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary"
                        />
                      </div>
                    )}

                    {/* Error Message */}
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Error Message (optional)
                      </label>
                      <textarea
                        value={rule.error || ""}
                        onChange={(e) =>
                          updateRule(index, { error: e.target.value })
                        }
                        placeholder="Custom error message when rule is triggered..."
                        rows={2}
                        className="w-full px-3 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border-primary bg-bg-secondary">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-border-primary rounded-xl text-text-secondary font-medium hover:bg-bg-tertiary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={saveAndClose}
            className="flex-1 px-4 py-2.5 bg-accent-primary text-text-inverse rounded-xl font-medium hover:bg-accent-hover transition-colors"
          >
            Save Rules
          </button>
        </div>
      </div>
    </div>
  );
}


