import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import {
  LangChainTool,
  SheetTool,
  Severity,
  StaticRuleAction,
  TaintRule,
  Policy,
  ExportedConfig,
  ExportedTool,
  TaintClass,
} from "@/types";

interface BuilderState {
  // Sheet tools (tools added to the builder sheet)
  sheetTools: SheetTool[];

  // Selected tool for configuration
  selectedToolId: string | null;

  // Policy name
  policyName: string;

  // Actions
  addToolToSheet: (tool: LangChainTool) => void;
  removeToolFromSheet: (id: string) => void;
  updateToolSeverity: (id: string, severity: Severity) => void;
  updateToolStaticRule: (id: string, action: StaticRuleAction) => void;
  updateToolTaintRules: (id: string, rules: TaintRule[]) => void;
  updateToolTaintClass: (id: string, taintClass: TaintClass) => void;
  reorderTools: (activeId: string, overId: string) => void;
  updateToolPosition: (id: string, x: number, y: number) => void;
  selectTool: (id: string | null) => void;
  setPolicyName: (name: string) => void;
  clearSheet: () => void;
  loadProjectTools: (tools: SheetTool[]) => void;

  // Export
  exportConfig: () => ExportedConfig;
  getExportedTools: () => ExportedTool[];
  getPolicy: () => Policy;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      sheetTools: [],
      selectedToolId: null,
      policyName: "default_policy",

      addToolToSheet: (tool: LangChainTool) => {
        const existingTool = get().sheetTools.find(
          (t) => t.tool.id === tool.id
        );
        if (existingTool) return; // Don't add duplicates
        

        const newSheetTool: SheetTool = {
          id: uuidv4(),
          tool,
          severity: "medium",
          staticRule: "ALLOW",
          taintRules: [],
          position: get().sheetTools.length,
          x: 50,
          y: 50,
          addedAt: new Date(),
        };

        set((state) => ({
          sheetTools: [...state.sheetTools, newSheetTool],
        }));
      },

      removeToolFromSheet: (id: string) => {
        set((state) => ({
          sheetTools: state.sheetTools.filter((t) => t.id !== id),
          selectedToolId:
            state.selectedToolId === id ? null : state.selectedToolId,
        }));
      },

      updateToolSeverity: (id: string, severity: Severity) => {
        set((state) => ({
          sheetTools: state.sheetTools.map((t) =>
            t.id === id ? { ...t, severity } : t
          ),
        }));
      },

      updateToolStaticRule: (id: string, action: StaticRuleAction) => {
        set((state) => ({
          sheetTools: state.sheetTools.map((t) =>
            t.id === id ? { ...t, staticRule: action } : t
          ),
        }));
      },

      updateToolTaintRules: (id: string, rules: TaintRule[]) => {
        set((state) => ({
          sheetTools: state.sheetTools.map((t) =>
            t.id === id ? { ...t, taintRules: rules } : t
          ),
        }));
      },

      updateToolTaintClass: (id: string, taintClass: TaintClass) => {
        set((state) => ({
          sheetTools: state.sheetTools.map((t) =>
            t.id === id
              ? {
                  ...t,
                  tool: { ...t.tool, taintClass },
                }
              : t
          ),
        }));
      },

      reorderTools: (activeId: string, overId: string) => {
        set((state) => {
          const oldIndex = state.sheetTools.findIndex((t) => t.id === activeId);
          const newIndex = state.sheetTools.findIndex((t) => t.id === overId);

          if (oldIndex === -1 || newIndex === -1) return state;

          const newTools = [...state.sheetTools];
          const [removed] = newTools.splice(oldIndex, 1);
          newTools.splice(newIndex, 0, removed);

          return {
            sheetTools: newTools.map((t, i) => ({ ...t, position: i })),
          };
        });
      },

      updateToolPosition: (id: string, x: number, y: number) => {
        set((state) => ({
          sheetTools: state.sheetTools.map((t) =>
            t.id === id ? { ...t, x, y } : t
          ),
        }));
      },

      selectTool: (id: string | null) => {
        set({ selectedToolId: id });
      },

      setPolicyName: (name: string) => {
        set({ policyName: name });
      },

      clearSheet: () => {
        set({ sheetTools: [], selectedToolId: null });
      },

      loadProjectTools: (tools: SheetTool[]) => {
        set({ sheetTools: tools, selectedToolId: null });
      },

      getExportedTools: () => {
        return get().sheetTools.map((st) => ({
          name: st.tool.name,
          description: st.tool.description,
          inputSchema: st.tool.inputSchema,
          taintClass: st.tool.taintClass,
          severity: st.severity,
        }));
      },

      getPolicy: () => {
        const state = get();
        const staticRules: Record<string, StaticRuleAction> = {};
        const taintRules: TaintRule[] = [];

        state.sheetTools.forEach((st) => {
          staticRules[st.tool.name] = st.staticRule;
          taintRules.push(...st.taintRules);
        });

        return {
          name: state.policyName,
          staticRules,
          taintRules,
        };
      },

      exportConfig: () => {
        const state = get();
        return {
          tools: state.getExportedTools(),
          policies: [state.getPolicy()],
          exportedAt: new Date().toISOString(),
          version: "1.0.0",
        };
      },
    }),
    {
      name: "sentinel-builder-storage",
      partialize: (state) => ({
        sheetTools: state.sheetTools,
        policyName: state.policyName,
      }),
    }
  )
);

