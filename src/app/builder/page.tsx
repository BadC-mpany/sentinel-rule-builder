"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useBuilderStore } from "@/store/builderStore";
import { BuilderSheet } from "@/components/BuilderSheet";
import { ExportModal } from "@/components/ExportModal";
import { YamlViewModal } from "@/components/YamlViewModal";
import {
  LangChainTool,
  ExportedConfig,
  Project,
  SheetTool,
  ExportedTool,
  StaticRuleAction,
  RuleTemplate,
  TemplateRule,
  PolicyFile,
  ExportCustomer,
} from "@/types";
import { loadToolsFromYaml } from "@/lib/loadTools";
import { loadRuleTemplatesFromYaml } from "@/lib/loadRuleTemplates";
import { v4 as uuidv4 } from "uuid";
import { ToolCard } from "@/components/ToolCard";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { Search, X, Download, Plus, Folder, ArrowLeft, ArrowRight, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { saveProject, getUserProjects, deleteProject, getProject } from "@/lib/supabase";
import { useUser, useAuth, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { ProjectCard } from "@/components/ProjectCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DeleteProjectModal } from "@/components/DeleteProjectModal";

export default function BuilderPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const {
    sheetTools,
    selectedToolId,
    policyName,
    addToolToSheet,
    removeToolFromSheet,
    updateToolSeverity,
    updateToolStaticRule,
    selectTool,
    setPolicyName,
    clearSheet,
    loadProjectTools,
    getExportedTools,
  } = useBuilderStore();

  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();

  // State
  const [langchainTools, setLangchainTools] = useState<LangChainTool[]>([]);
  const [ruleTemplates, setRuleTemplates] = useState<RuleTemplate[]>([]);
  const [selectedTemplateName, setSelectedTemplateName] = useState<string | null>(null);
  const [selectedRules, setSelectedRules] = useState<TemplateRule[]>([]);
  const [currentStep, setCurrentStep] = useState<"template" | "tools" | "rules">("template");
  const [pendingTemplateTools, setPendingTemplateTools] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [showYamlModal, setShowYamlModal] = useState(false);
  const [exportedConfig, setExportedConfig] = useState<ExportedConfig | null>(null);
  const [draggedTool, setDraggedTool] = useState<LangChainTool | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const selectedSheetTool = sheetTools.find((t) => t.id === selectedToolId);
  const addedToolIds = sheetTools.map((t) => t.tool.id);
  const selectedToolNames = useMemo(
    () => new Set(sheetTools.map((t) => t.tool.name)),
    [sheetTools]
  );
  const selectedToolClasses = useMemo(
    () => new Set(sheetTools.map((t) => t.tool.taintClass)),
    [sheetTools]
  );
  const allTemplateRules = useMemo(
    () => ruleTemplates.flatMap((template) => template.taintRules),
    [ruleTemplates]
  );
  const selectedRuleIds = useMemo(
    () => new Set(selectedRules.map((r) => r.id)),
    [selectedRules]
  );
  const selectedTemplateRules = useMemo(
    () =>
      selectedTemplateName
        ? ruleTemplates.find((t) => t.name === selectedTemplateName)?.taintRules || []
        : [],
    [selectedTemplateName, ruleTemplates]
  );

  const isRuleRelevant = useCallback(
    (rule: TemplateRule) => {
      const matchesTool = rule.tool ? selectedToolNames.has(rule.tool) : false;
      const matchesClass = rule.toolClass ? selectedToolClasses.has(rule.toolClass) : false;

      const matchesPattern =
        !!rule.pattern &&
        (() => {
          if (rule.pattern?.type === "sequence") {
            return rule.pattern.steps.some((step) => selectedToolClasses.has(step.class));
          }
          if (rule.pattern?.type === "logic") {
            const andMatch = rule.pattern.condition.AND?.some(
              (c) =>
                (c?.sessionHasClass && selectedToolClasses.has(c.sessionHasClass)) ||
                (c?.currentToolClass && selectedToolClasses.has(c.currentToolClass))
            );
            const orMatch = rule.pattern.condition.OR?.some(
              (c) =>
                (c?.sessionHasClass && selectedToolClasses.has(c.sessionHasClass)) ||
                (c?.currentToolClass && selectedToolClasses.has(c.currentToolClass))
            );
            return Boolean(andMatch || orMatch);
          }
          return false;
        })();

      if (selectedToolNames.size === 0 && selectedToolClasses.size === 0) {
        // If no tools yet, surface all rules so users can preview templates
        return true;
      }

      return matchesTool || matchesClass || matchesPattern;
    },
    [selectedToolNames, selectedToolClasses]
  );

  const relevantRules = useMemo(
    () => allTemplateRules.filter((rule) => isRuleRelevant(rule)),
    [allTemplateRules, isRuleRelevant]
  );

  const canExport =
    (selectedTemplateName !== null && selectedTemplateName !== undefined) ||
    sheetTools.length > 0 ||
    selectedRules.length > 0;

  const normalizeImportedPattern = useCallback((pattern: any): TemplateRule["pattern"] => {
    if (!pattern?.type) return undefined;
    if (pattern.type === "sequence") {
      return {
        type: "sequence",
        steps: (pattern.steps || []).map((step: any) => ({ class: step.class || step.Class })),
        maxDistance: pattern.max_distance ?? pattern.maxDistance ?? null,
      };
    }
    if (pattern.type === "logic") {
      const mapEntry = (entry: any) => ({
        sessionHasClass: entry?.session_has_class ?? entry?.sessionHasClass,
        currentToolClass: entry?.current_tool_class ?? entry?.currentToolClass,
      });
      return {
        type: "logic",
        condition: {
          AND: pattern.condition?.AND?.map(mapEntry),
          OR: pattern.condition?.OR?.map(mapEntry),
        },
      };
    }
    return undefined;
  }, []);

  const rehydrateImportedRule = useCallback(
    (rule: any, index: number): TemplateRule => ({
      id: rule.id || `imported-${index}-${uuidv4()}`,
      action: rule.action,
      tool: rule.tool,
      toolClass: rule.tool_class ?? rule.toolClass,
      tag: rule.tag,
      forbiddenTags: rule.forbidden_tags ?? rule.forbiddenTags,
      error: rule.error,
      pattern: normalizeImportedPattern(rule.pattern),
      sourceTemplate: rule.sourceTemplate || "imported",
    }),
    [normalizeImportedPattern]
  );

  // Effects
  useEffect(() => {
    loadToolsFromYaml().then(setLangchainTools);
  }, []);

  useEffect(() => {
    loadRuleTemplatesFromYaml().then(setRuleTemplates);
  }, []);

  useEffect(() => {
    if (userLoaded && user?.id) {
      loadProjects();
    }
  }, [userLoaded, user?.id]);

  useEffect(() => {
    if (pendingTemplateTools.length === 0 || langchainTools.length === 0) return;
    // Clear current tools to align with template defaults
    clearSheet();
    pendingTemplateTools.forEach((toolName) => {
      const tool = langchainTools.find((t) => t.name === toolName);
      if (tool) addToolToSheet(tool);
    });
    setPendingTemplateTools([]);
  }, [pendingTemplateTools, langchainTools, addToolToSheet, clearSheet]);

  useEffect(() => {
    if (editingProject && langchainTools.length > 0) {
      const projectSheetTools: SheetTool[] = [];
      editingProject.tools.forEach((exportedTool: ExportedTool, index: number) => {
        const langchainTool = langchainTools.find((t) => t.name === exportedTool.name);
        if (langchainTool) {
          const staticRule = editingProject.policies[0]?.staticRules?.[exportedTool.name] || "ALLOW";
          const sheetTool: SheetTool = {
            id: uuidv4(),
            tool: {
              ...langchainTool,
              taintClass: exportedTool.taintClass || langchainTool.taintClass,
            },
            severity: exportedTool.severity || "medium",
            staticRule: staticRule as "ALLOW" | "DENY",
            taintRules: editingProject.policies[0]?.taintRules?.filter((rule) => {
              if (rule.type === "simple") {
                return rule.tool === exportedTool.name || rule.toolClass === exportedTool.taintClass;
              }
              return false;
            }) || [],
            position: index,
            x: 50,
            y: 50 + (index * 60),
            addedAt: new Date(),
          };
          projectSheetTools.push(sheetTool);
        }
      });
      loadProjectTools(projectSheetTools);

      const importedPolicy = editingProject.policies?.[0];
      const importedTaintRules =
        (importedPolicy as any)?.taintRules || (importedPolicy as any)?.taint_rules || [];
      if (importedTaintRules.length) {
        const normalized = importedTaintRules.map((rule: any, idx: number) =>
          rehydrateImportedRule(rule, idx)
        );
        setSelectedRules(normalized);
      } else {
        setSelectedRules([]);
      }
      setSelectedTemplateName(null);
      setCurrentStep("rules");
    }
  }, [editingProject, langchainTools, loadProjectTools, rehydrateImportedRule]);

  useEffect(() => {
    if (selectedTemplateName) {
      const template = ruleTemplates.find((t) => t.name === selectedTemplateName);
      if (template) {
        setSelectedRules(template.taintRules);
        const allowedTools = Object.entries(template.staticRules || {})
          .filter(([, action]) => action === "ALLOW")
          .map(([toolName]) => toolName);
        setPendingTemplateTools(allowedTools);
      }
    }
  }, [selectedTemplateName, ruleTemplates]);

  // Handlers
  const loadProjects = async () => {
    if (!user?.id) return;
    setLoadingProjects(true);
    try {
      const token = await getToken();
      const userProjects = await getUserProjects(user.id, token || undefined);
      setProjects(userProjects);
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleSelectTemplate = (templateName: string) => {
    setSelectedTemplateName(templateName);
    setSelectedRules([]);
    setCurrentStep("tools");
  };

  const handleClearTemplate = () => {
    setSelectedTemplateName(null);
    setSelectedRules([]);
    setCurrentStep("tools");
    setPendingTemplateTools([]);
  };

  const handleChangeTemplate = () => {
    clearSheet();
    setSelectedTemplateName(null);
    setSelectedRules([]);
    setPendingTemplateTools([]);
    setCurrentStep("template");
  };

  const handleToggleAdditionalRule = (rule: TemplateRule) => {
    setSelectedRules((prev) => {
      const exists = prev.some((r) => r.id === rule.id);
      if (exists) {
        return prev.filter((r) => r.id !== rule.id);
      }
      return [...prev, rule];
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return langchainTools;
    const query = searchQuery.toLowerCase();
    return langchainTools.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.displayName.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.taintClass.toLowerCase().includes(query)
    );
  }, [searchQuery, langchainTools]);

  const availableTools = filteredTools.filter((t) => !addedToolIds.includes(t.id));

  const handleToolToggle = (tool: LangChainTool, checked: boolean) => {
    if (checked) {
      addToolToSheet(tool);
    } else {
      const sheetTool = sheetTools.find((st) => st.tool.id === tool.id);
      if (sheetTool) removeToolFromSheet(sheetTool.id);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const tool = langchainTools.find((t) => t.id === event.active.id);
    if (tool) setDraggedTool(tool);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedTool(null);
    if (!over) return;
    const tool = langchainTools.find((t) => t.id === active.id);
    if (tool && over.id === "selected-tools-dropzone" && !addedToolIds.includes(tool.id)) {
      addToolToSheet(tool);
    }
  };

  const mapRuleToPolicyRule = (rule: TemplateRule) => {
    const output: any = {
      action: rule.action,
    };

    if (rule.tool) output.tool = rule.tool;
    if (rule.toolClass) output.tool_class = rule.toolClass;
    if (rule.tag) output.tag = rule.tag;
    if (rule.forbiddenTags?.length) output.forbidden_tags = rule.forbiddenTags;
    if (rule.error) output.error = rule.error;

    if (rule.pattern) {
      if (rule.pattern.type === "sequence") {
        output.pattern = {
          type: "sequence",
          steps: rule.pattern.steps.map((step) => ({ class: step.class })),
        };
        if (rule.pattern.maxDistance !== undefined && rule.pattern.maxDistance !== null) {
          output.pattern.max_distance = rule.pattern.maxDistance;
        }
      }

      if (rule.pattern.type === "logic") {
        const mapCondition = (entry?: { sessionHasClass?: string; currentToolClass?: string } | null) => {
          if (!entry) return null;
          const normalized: any = {};
          if (entry.sessionHasClass) normalized.session_has_class = entry.sessionHasClass;
          if (entry.currentToolClass) normalized.current_tool_class = entry.currentToolClass;
          return Object.keys(normalized).length ? normalized : null;
        };

        const AND = rule.pattern.condition.AND?.map(mapCondition).filter(Boolean);
        const OR = rule.pattern.condition.OR?.map(mapCondition).filter(Boolean);

        output.pattern = {
          type: "logic",
          condition: {
            ...(AND && AND.length ? { AND } : {}),
            ...(OR && OR.length ? { OR } : {}),
          },
        };
      }
    }

    return output;
  };

  const buildPolicyFile = (): PolicyFile => {
    const policyNameSafe = policyName?.trim() || "default_policy";
    const staticRules: Record<string, StaticRuleAction> = {};
    sheetTools.forEach((st) => {
      staticRules[st.tool.name] = "ALLOW";
    });

    const taintRules = selectedRules.map((rule) => mapRuleToPolicyRule(rule));
    const customers: ExportCustomer[] = [
      {
        api_key: "",
        owner: "",
        mcp_upstream_url: "",
        policy_name: policyNameSafe,
      },
    ];

    return {
      customers,
      policies: [
        {
          name: policyNameSafe,
          static_rules: staticRules,
          taint_rules: taintRules,
        },
      ],
    };
  };

  const handleExport = () => {
    const policyFile = buildPolicyFile();
    const config: ExportedConfig = {
      tools: getExportedTools(),
      policies: policyFile.policies.map((policy) => ({
        name: policy.name,
        staticRules: policy.static_rules,
        taintRules: policy.taint_rules as any,
      })),
      customers: policyFile.customers,
      policyFile,
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
    };
    setExportedConfig(config);
    setShowExportModal(true);
  };

  const handleSaveToDatabase = async (config: ExportedConfig, projectName: string) => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    try {
      const token = await getToken();
      console.log("Saving project with name:", projectName);
      console.log("Config tools count:", config.tools.length);
      console.log("Config policies count:", config.policies.length);

      // Save project with automatically generated secrets (generateSecrets: true)
      const project = await saveProject(
        user.id,
        projectName,
        config,
        undefined,
        true, // generateSecrets = true to auto-generate API key and encryption keys
        token || undefined
      );

      if (project) {
        console.log("Project saved successfully:", project.id);
        console.log("Generated API key:", project.apiKey ? "Yes" : "No");
        console.log("Generated keys:", project.privateKey ? "Yes" : "No");

        // Reload projects list
        await loadProjects();

        // Reset builder state
        setIsCreatingNew(false);
        setEditingProject(null);
        clearSheet();
        setPolicyName("");
        setSelectedTemplateName(null);
        setSelectedRules([]);
        setCurrentStep("template");
      } else {
        throw new Error("Failed to save project: No project returned");
      }
    } catch (error: any) {
      console.error("Error saving project:", error);
      console.error("Error stack:", error?.stack);
      throw error;
    }
  };

  const handleEditProject = async (project: Project) => {
    setEditingProject(project);
    setIsCreatingNew(false);
    clearSheet();
    setPolicyName(project.policies[0]?.name || "");
  };

  const handleDeleteProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setProjectToDelete(project);
    }
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      const token = await getToken();
      await deleteProject(projectToDelete.id, token || undefined);
      await loadProjects();
      if (editingProject?.id === projectToDelete.id) {
        setEditingProject(null);
        setIsCreatingNew(false);
        clearSheet();
        setSelectedTemplateName(null);
        setSelectedRules([]);
        setCurrentStep("template");
      }
      setProjectToDelete(null);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleNewProject = () => {
    setIsCreatingNew(true);
    setEditingProject(null);
    clearSheet();
    setPolicyName("");
    setSelectedTemplateName(null);
    setSelectedRules([]);
    setCurrentStep("template");
  };

  const showBuilderInterface = isCreatingNew || editingProject !== null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full flex flex-col bg-bg-primary overflow-hidden">

        {/* Header */}
        <header className="h-16 px-6 border-b border-border-primary flex items-center justify-between bg-bg-primary flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            {showBuilderInterface ? (
              <>
                <button
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingProject(null);
                    clearSheet();
                    setPolicyName("");
                    setSelectedTemplateName(null);
                    setSelectedRules([]);
                    setCurrentStep("template");
                  }}
                  className="p-2 -ml-2 rounded-lg hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-lg font-bold font-[var(--font-inter)] text-text-primary">
                    {editingProject ? `Editing: ${editingProject.name}` : "New Policy"}
                  </h1>
                </div>
              </>
            ) : (
              <h1 className="text-lg font-bold font-[var(--font-inter)] text-text-primary">Projects</h1>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Additional header actions if needed */}
            {!showBuilderInterface && (
              <>
                <SignedIn>
                  <Button onClick={handleNewProject} className="h-9 text-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button className="h-9 text-sm">
                      <Plus className="w-4 h-4 mr-2" />
                      New Project
                    </Button>
                  </SignInButton>
                </SignedOut>
              </>
            )}
            {showBuilderInterface && canExport && (
              <Button onClick={handleExport} className="h-9 text-sm bg-purple-600 hover:bg-purple-700 text-white border-0">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden">
          {!showBuilderInterface ? (
            // Projects Grid View
            <div className="h-full overflow-y-auto p-8">
              <div className="max-w-7xl mx-auto">
                {loadingProjects ? (
                  <div className="text-center py-20 text-text-secondary">Loading projects...</div>
                ) : projects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-bg-secondary/50 rounded-xl border border-dashed border-border-primary">
                    <div className="w-16 h-16 rounded-full bg-bg-primary flex items-center justify-center mb-4 shadow-sm">
                      <Folder className="w-8 h-8 text-text-muted" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                    <p className="text-text-secondary mb-6">Create your first security policy to get started</p>
                    <Button onClick={handleNewProject}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onEdit={handleEditProject}
                        onDelete={handleDeleteProject}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : currentStep === "template" ? (
            // Step 1: pick a template or start from scratch
            <div className="h-full overflow-y-auto p-8">
              <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { }}
                      disabled
                      className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-text-muted">Step 1</p>
                      <h2 className="text-xl font-semibold text-text-primary">Choose a starting point</h2>
                      <p className="text-sm text-text-secondary mt-1">
                        Pick a rule template to preload rules, or start from scratch with no rules.
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentStep("tools")}
                      className="p-2 rounded-lg hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={handleClearTemplate}
                  >
                    Start from scratch
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-border-primary bg-bg-primary">
                    <div className="p-4 border-b border-border-primary flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-accent-primary" />
                        <p className="text-sm font-semibold text-text-primary">Rule Templates</p>
                      </div>
                      <Badge variant="secondary" className="text-[11px]">
                        {ruleTemplates.length} available
                      </Badge>
                    </div>
                    <div className="p-4 space-y-3 max-h-[420px] overflow-y-auto">
                      {ruleTemplates.length === 0 ? (
                        <p className="text-sm text-text-secondary">Loading templates...</p>
                      ) : (
                        ruleTemplates.map((template) => (
                          <div
                            key={template.name}
                            className={cn(
                              "border rounded-xl p-3 transition-colors",
                              selectedTemplateName === template.name
                                ? "border-accent-primary/70 bg-accent-primary/5"
                                : "border-border-primary hover:border-accent-primary/40"
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-sm text-text-primary truncate">
                                    {template.name.replace(/_/g, " ")}
                                  </p>
                                  <Badge variant="outline" className="text-[11px]">
                                    {template.taintRules.length} rule{template.taintRules.length !== 1 ? "s" : ""}
                                  </Badge>
                                </div>
                                <p className="text-xs text-text-secondary mt-1 line-clamp-2">{template.description}</p>
                              </div>
                              <Button size="sm" variant="default" onClick={() => handleSelectTemplate(template.name)}>
                                Use template
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>

                  <Card className="border-border-primary bg-bg-primary flex flex-col justify-between hover:border-accent-primary/70 transition-colors cursor-pointer group">
                    <div className="p-6 space-y-3">
                      <h3 className="text-lg font-semibold text-text-primary">Start from scratch</h3>
                      <p className="text-sm text-text-secondary">
                        Begin with no preset rules. You'll pick tools next, then add rules relevant to them.
                      </p>
                    </div>
                    <div className="p-6 pt-0">
                      <Button
                        className="w-full"
                        variant="secondary"
                        onClick={handleClearTemplate}
                      >
                        Continue without template
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            // Steps 2 & 3: tools, then rules
            <div className="flex h-full w-full">
              {/* Left Sidebar - Tool Library */}
              <aside className="w-80 flex flex-col border-r border-border-primary bg-bg-secondary/30">
                <div className="p-4 border-b border-border-primary bg-bg-primary">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none z-10" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tools..."
                      className="w-full h-10 pl-9 pr-9 rounded-md border border-border-primary bg-bg-primary text-text-primary outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-text-secondary/50"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary z-10"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-text-secondary">
                    <span>Available Tools</span>
                    <span className="bg-bg-secondary px-2 py-0.5 rounded-full border border-border-primary">
                      {availableTools.length}
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {availableTools.length === 0 ? (
                    <div className="text-center py-10 text-text-secondary text-sm">
                      No tools found matching "{searchQuery}"
                    </div>
                  ) : (
                    availableTools.map((tool) => (
                      <div key={tool.id} className="flex items-start gap-3 group">
                        <Switch
                          checked={false}
                          onCheckedChange={(checked) => handleToolToggle(tool, checked)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <ToolCard tool={tool} compact />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </aside>

              {/* Right Canvas - Steps */}
              <div className="flex-1 flex flex-col bg-bg-tertiary relative">
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
                  style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`, backgroundSize: '24px 24px' }}>
                </div>

                <div className="relative z-10 flex-1 p-8 overflow-hidden">
                  <div className="h-full max-w-6xl mx-auto flex flex-col gap-4 overflow-y-auto pb-6">
                    {/* Step header & template summary */}
                    <Card className="border-border-primary bg-bg-primary">
                      <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              if (currentStep === "rules") {
                                setCurrentStep("tools");
                              } else if (currentStep === "tools") {
                                setCurrentStep("template");
                              }
                            }}
                            className="p-2 rounded-lg hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-text-muted">
                              {currentStep === "tools" ? "Step 2" : "Step 3"}
                            </p>
                            <p className="text-sm font-semibold text-text-primary">
                              {currentStep === "tools" ? "Select tools" : "Add rules"}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              if (currentStep === "tools" && sheetTools.length > 0) {
                                setCurrentStep("rules");
                              } else if (currentStep === "rules") {
                                // Already at last step
                              }
                            }}
                            disabled={currentStep === "tools" && sheetTools.length === 0}
                            className="p-2 rounded-lg hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[11px]">
                            {selectedTemplateName ? `Template: ${selectedTemplateName}` : "No template"}
                          </Badge>
                          <Button size="sm" variant="ghost" onClick={handleChangeTemplate}>
                            Change template
                          </Button>
                        </div>
                      </div>
                    </Card>

                    {/* Builder Sheet - Only show in Step 2 (tools) */}
                    {currentStep === "tools" && (
                      <div className="flex flex-col bg-bg-primary rounded-2xl border border-border-primary shadow-sm max-h-[75vh] overflow-y-auto">
                        <BuilderSheet
                          sheetTools={sheetTools}
                          selectedToolId={selectedToolId}
                          onSelectTool={(id) => {
                            if (id) setShowYamlModal(true);
                            selectTool(id);
                          }}
                          onRemoveTool={(id) => {
                            const sheetTool = sheetTools.find((st) => st.id === id);
                            if (sheetTool) removeToolFromSheet(id);
                          }}
                          onUpdateSeverity={updateToolSeverity}
                          onUpdateStaticRule={updateToolStaticRule}
                          onClearSheet={clearSheet}
                          onExport={handleExport}
                          policyName={policyName}
                          onPolicyNameChange={setPolicyName}
                        />
                        <div className="p-4 border-t border-border-primary flex items-center justify-between bg-bg-secondary/40">
                          <div className="text-xs text-text-secondary">
                            Add tools, then continue to pick rules relevant to them.
                          </div>
                          <Button onClick={() => setCurrentStep("rules")} disabled={sheetTools.length === 0}>
                            Continue to rules
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Rules Panel */}
                    {currentStep === "rules" && (
                      <Card className="border-border-primary bg-bg-primary">
                        <div className="p-4 border-b border-border-primary flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-text-primary">Add more rules</p>
                            <p className="text-xs text-text-secondary mt-1">
                              Showing rules relevant to the tools you selected. Toggle any extras to include them.
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-[11px]">
                            {selectedRules.length} selected
                          </Badge>
                        </div>
                        <div className="p-4 space-y-3 max-h-[420px] overflow-y-auto">
                          {sheetTools.length === 0 ? (
                            <p className="text-sm text-text-secondary">
                              Add at least one tool to see relevant rules.
                            </p>
                          ) : relevantRules.length === 0 ? (
                            <p className="text-sm text-text-secondary">
                              No relevant rules. Select tools or templates to see suggestions.
                            </p>
                          ) : (
                            relevantRules.map((rule) => {
                              const isChecked = selectedRuleIds.has(rule.id);
                              return (
                                <div
                                  key={rule.id}
                                  className="flex items-start gap-3 border border-border-primary rounded-xl p-3 hover:border-accent-primary/40 transition-colors"
                                >
                                  <Switch
                                    checked={isChecked}
                                    onCheckedChange={() => handleToggleAdditionalRule(rule)}
                                    className="mt-1"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-[11px]">
                                        {rule.action.replace(/_/g, " ")}
                                      </Badge>
                                      {rule.tool && <Badge variant="secondary">tool: {rule.tool}</Badge>}
                                      {rule.toolClass && (
                                        <Badge variant="secondary">
                                          class: {rule.toolClass.replace(/_/g, " ")}
                                        </Badge>
                                      )}
                                    </div>
                                    {rule.error && (
                                      <p className="text-xs text-text-primary mt-1 line-clamp-2">{rule.error}</p>
                                    )}
                                    {rule.pattern && (
                                      <p className="text-[11px] text-text-muted mt-1">
                                        Pattern:{" "}
                                        {rule.pattern.type === "sequence"
                                          ? rule.pattern.steps.map((s) => s.class).join(" → ")
                                          : "Logic condition"}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                        <div className="p-4 border-t border-border-primary bg-bg-secondary/40 flex items-center justify-between">
                          <Button variant="ghost" onClick={() => setCurrentStep("tools")}>
                            Back to tools
                          </Button>
                          <Button onClick={handleExport} disabled={!canExport}>
                            Export
                          </Button>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Drag Overlay */}
        <DragOverlay>
          {draggedTool && (
            <div className="opacity-90 w-80">
              <ToolCard tool={draggedTool} isDragging />
            </div>
          )}
        </DragOverlay>

        {/* Modals */}
        {showExportModal && exportedConfig && (
          <ExportModal
            config={exportedConfig}
            onClose={() => setShowExportModal(false)}
            onSaveToDatabase={handleSaveToDatabase}
          />
        )}

        {showYamlModal && selectedSheetTool && (
          <YamlViewModal
            sheetTool={selectedSheetTool}
            onClose={() => {
              setShowYamlModal(false);
              selectTool(null);
            }}
          />
        )}

        {projectToDelete && (
          <DeleteProjectModal
            projectName={projectToDelete.name}
            onConfirm={confirmDeleteProject}
            onCancel={() => setProjectToDelete(null)}
          />
        )}
      </div>
    </DndContext>
  );
}
