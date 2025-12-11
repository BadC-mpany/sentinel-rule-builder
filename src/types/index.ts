// Tool Types
export interface ToolInputProperty {
  type: string;
  description: string;
  enum?: string[];
  default?: unknown;
}

export interface ToolInputSchema {
  type: "object";
  properties: Record<string, ToolInputProperty>;
  required: string[];
}

export interface LangChainTool {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: ToolCategory;
  taintClass: TaintClass;
  classes?: TaintClass[];
  inputSchema: ToolInputSchema;
  isCommon?: boolean;
  pricing?: "Free" | "Paid" | "Freemium";
}

export type ToolCategory =
  | "Search"
  | "Code Interpreter"
  | "Productivity"
  | "Web Browsing"
  | "Database"
  | "Finance"
  | "File System"
  | "Communication"
  | "AI/ML"
  | "Utilities";

// Taint Classes
export type TaintClass =
  | "SAFE_READ"
  | "SENSITIVE_READ"
  | "SAFE_WRITE"
  | "CONSEQUENTIAL_WRITE"
  | "UNSAFE_EXECUTE"
  | "HUMAN_VERIFY"
  | "SANITIZER";

export interface TaintClassDefinition {
  className: TaintClass;
  classificationRule: string;
  description: string;
  exampleFunctionName: string;
  exampleFunctionDescription: string;
  necessity: string;
  color: string;
}

// Rule Types
export type StaticRuleAction = "ALLOW" | "DENY";

export interface StaticRule {
  toolName: string;
  action: StaticRuleAction;
}

export type TaintAction = "ADD_TAINT" | "CHECK_TAINT" | "BLOCK_SECOND" | "BLOCK_CURRENT";

export interface SimpleTaintRule {
  type: "simple";
  tool?: string;
  toolClass?: TaintClass;
  action: TaintAction;
  tag?: string;
  forbiddenTags?: string[];
  error?: string;
}

export interface PatternSequence {
  type: "sequence";
  steps: { class: TaintClass }[];
  maxDistance?: number | null;
}

export interface PatternLogic {
  type: "logic";
  condition: {
    AND?: (
      | { sessionHasClass: TaintClass }
      | { currentToolClass: TaintClass }
    )[];
    OR?: (
      | { sessionHasClass: TaintClass }
      | { currentToolClass: TaintClass }
    )[];
  };
}

export interface PatternTaintRule {
  type: "pattern";
  pattern: PatternSequence | PatternLogic;
  action: TaintAction;
  error?: string;
}

export type TaintRule = SimpleTaintRule | PatternTaintRule;

// Severity Levels
export type Severity = "low" | "medium" | "high" | "critical";

// Builder Sheet Item (tool added to the sheet)
export interface SheetTool {
  id: string;
  tool: LangChainTool;
  severity: Severity;
  staticRule: StaticRuleAction;
  taintRules: TaintRule[];
  position: number;
  x: number;
  y: number;
  addedAt: Date;
}

// Policy Configuration
export interface Policy {
  name: string;
  staticRules: Record<string, StaticRuleAction>;
  taintRules: TaintRule[];
}

// Rule Templates
export interface TemplatePatternSequence {
  type: "sequence";
  steps: { class: TaintClass }[];
  maxDistance?: number | null;
}

export interface TemplatePatternLogicCondition {
  AND?: ({ sessionHasClass?: TaintClass; currentToolClass?: TaintClass } | null)[];
  OR?: ({ sessionHasClass?: TaintClass; currentToolClass?: TaintClass } | null)[];
}

export interface TemplatePatternLogic {
  type: "logic";
  condition: TemplatePatternLogicCondition;
}

export type TemplatePattern = TemplatePatternSequence | TemplatePatternLogic;

export interface TemplateRule {
  id: string;
  action: TaintAction;
  tool?: string;
  toolClass?: TaintClass;
  tag?: string;
  forbiddenTags?: string[];
  error?: string;
  pattern?: TemplatePattern;
  sourceTemplate: string;
}

export interface RuleTemplate {
  name: string;
  description: string;
  staticRules?: Record<string, StaticRuleAction>;
  taintRules: TemplateRule[];
}

// Export policy file shape (customers + policies)
export interface ExportCustomer {
  api_key: string;
  owner: string;
  mcp_upstream_url: string;
  policy_name: string;
}

export interface PolicyFilePolicy {
  name: string;
  static_rules: Record<string, StaticRuleAction>;
  taint_rules: any[];
}

export interface PolicyFile {
  customers: ExportCustomer[];
  policies: PolicyFilePolicy[];
}

// Project Secrets
export interface ProjectSecrets {
  apiKey: string;
  privateKey: string;
  publicKey: string;
}

// Project
export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  tools: ExportedTool[];
  policies: Policy[];
  apiKey?: string;
  privateKey?: string;
  publicKey?: string;
  yaml?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Export Format
export interface ExportedTool {
  name: string;
  description: string;
  inputSchema: ToolInputSchema;
  taintClass?: TaintClass;
  severity?: Severity;
}

export interface ExportedConfig {
  tools: ExportedTool[];
  policies: Policy[];
  customers?: ExportCustomer[];
  policyFile?: PolicyFile;
  exportedAt: string;
  version: string;
}

// Theme
export type Theme = "light" | "dark";

