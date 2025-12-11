"use client";

import React, { useState, useMemo } from "react";
import { ExportedConfig } from "@/types";
import yaml from "js-yaml";
import {
  X,
  Copy,
  Download,
  Check,
  CloudUpload,
  Code2,
  FileJson,
} from "lucide-react";

interface ExportModalProps {
  config: ExportedConfig;
  onClose: () => void;
  onSaveToDatabase: (config: ExportedConfig, projectName: string) => Promise<void>;
}

export function ExportModal({ config, onClose, onSaveToDatabase }: ExportModalProps) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"json" | "yaml">("yaml");
  const [projectName, setProjectName] = useState("");

  const policyObject = useMemo(() => {
    if (config.policyFile) return config.policyFile;
    if (config.customers) {
      return { customers: config.customers, policies: config.policies };
    }
    return config;
  }, [config]);

  const jsonString = useMemo(() => JSON.stringify(policyObject, null, 2), [policyObject]);
  const yamlString = useMemo(() => {
    try {
      return yaml.dump(policyObject, { indent: 2, lineWidth: -1 });
    } catch (error) {
      console.error("Error converting to YAML:", error);
      return jsonString;
    }
  }, [policyObject, jsonString]);

  const currentString = activeTab === "yaml" ? yamlString : jsonString;
  const fileExtension = activeTab === "yaml" ? "yaml" : "json";
  const mimeType = activeTab === "yaml" ? "application/x-yaml" : "application/json";

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(currentString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const blob = new Blob([currentString], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const policyName = policyObject.policies?.[0]?.name || "export";
    a.download = `policies.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveToDatabase = async () => {
    if (!projectName.trim()) return;
    
    setSaving(true);
    try {
      await onSaveToDatabase(config, projectName.trim());
      setSaved(true);
      // Close modal after successful save (user will see project list)
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error("Failed to save:", error);
      alert(error?.message || "Failed to save project. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-white/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl bg-card-bg rounded-2xl shadow-2xl border border-border-primary overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-primary">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center">
              <FileJson className="w-6 h-6 text-accent-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-text-primary">
                Export Configuration
              </h2>
              <p className="text-sm text-text-muted">
                {config.tools.length} tools &bull; {(policyObject as any)?.policies?.length || config.policies.length} policy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-secondary text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-6 pt-4">
          <button
            onClick={() => setActiveTab("json")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === "json"
                ? "bg-accent-primary text-text-inverse"
                : "text-text-secondary hover:bg-bg-secondary"
            }`}
          >
            <Code2 className="w-4 h-4" />
            JSON
          </button>
          <button
            onClick={() => setActiveTab("yaml")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === "yaml"
                ? "bg-accent-primary text-text-inverse"
                : "text-text-secondary hover:bg-bg-secondary"
            }`}
          >
            <Code2 className="w-4 h-4" />
            YAML
          </button>
        </div>

        {/* Code Preview */}
        <div className="p-6">
          <div className="relative bg-bg-secondary rounded-xl border border-border-primary overflow-hidden">
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={copyToClipboard}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  copied
                    ? "bg-severity-low text-white"
                    : "bg-card-bg text-text-secondary hover:bg-bg-tertiary"
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
            </div>
            <pre className="p-4 max-h-80 overflow-auto text-sm font-mono text-text-secondary">
              <code>{currentString}</code>
            </pre>
          </div>
        </div>

        {/* Project Name Input */}
        <div className="px-6 pb-4">
          <label className="block text-sm font-medium mb-2 text-text-primary">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project name..."
            className="w-full px-3 py-2 rounded-lg border border-border-primary bg-card-bg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
            disabled={saving || saved}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-border-primary bg-bg-secondary">
          <button
            onClick={downloadFile}
            className="flex items-center gap-2 px-4 py-2.5 border border-border-primary rounded-xl text-text-secondary font-medium hover:bg-card-bg transition-colors"
          >
            <Download className="w-5 h-5" />
            Download {activeTab === "yaml" ? "YAML" : "JSON"}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-text-secondary font-medium hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveToDatabase}
              disabled={saving || saved || !projectName.trim()}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all ${
                saved
                  ? "bg-severity-low text-white"
                  : saving || !projectName.trim()
                  ? "bg-accent-secondary text-text-inverse opacity-50 cursor-not-allowed"
                  : "bg-accent-primary text-text-inverse hover:bg-accent-hover"
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-5 h-5" />
                  Saved to Database
                </>
              ) : saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CloudUpload className="w-5 h-5" />
                  Save &amp; Upload
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


