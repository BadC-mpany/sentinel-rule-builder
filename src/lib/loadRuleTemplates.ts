import yaml from "js-yaml";
import {
  RuleTemplate,
  TaintAction,
  TaintClass,
  TemplatePattern,
  TemplatePatternLogic,
  TemplatePatternSequence,
  TemplateRule,
  StaticRuleAction,
} from "@/types";

interface YamlRuleTemplate {
  name: string;
  description: string;
  static_rules?: Record<string, StaticRuleAction>;
  taint_rules: any[];
}

interface YamlRuleTemplatesFile {
  rule_templates: YamlRuleTemplate[];
}

function normalizeSequencePattern(pattern: any): TemplatePatternSequence | undefined {
  if (!pattern?.steps || !Array.isArray(pattern.steps)) return undefined;
  return {
    type: "sequence",
    steps: pattern.steps
      .map((step: any) => ({
        class: (step.class || step?.Class) as TaintClass,
      }))
      .filter((step: any) => !!step.class),
    maxDistance: pattern.maxDistance ?? pattern.max_distance ?? null,
  };
}

function normalizeLogicPattern(pattern: any): TemplatePatternLogic | undefined {
  const condition = pattern?.condition || {};

  const mapArray = (arr?: any[]) =>
    arr
      ?.map((item) => {
        if (!item) return null;
        return {
          sessionHasClass: item.session_has_class ?? item.sessionHasClass,
          currentToolClass: item.current_tool_class ?? item.currentToolClass,
        };
      })
      .filter(Boolean) as { sessionHasClass?: TaintClass; currentToolClass?: TaintClass }[] | undefined;

  return {
    type: "logic",
    condition: {
      AND: mapArray(condition.AND ?? condition.and),
      OR: mapArray(condition.OR ?? condition.or),
    },
  };
}

function normalizePattern(pattern: any): TemplatePattern | undefined {
  if (!pattern?.type) return undefined;
  if (pattern.type === "sequence") return normalizeSequencePattern(pattern);
  if (pattern.type === "logic") return normalizeLogicPattern(pattern);
  return undefined;
}

function toTemplateRule(rule: any, templateName: string, index: number): TemplateRule {
  return {
    id: `${templateName}-${index}`,
    action: rule.action as TaintAction,
    tool: rule.tool,
    toolClass: rule.tool_class ?? rule.toolClass,
    tag: rule.tag,
    forbiddenTags: rule.forbidden_tags ?? rule.forbiddenTags,
    error: rule.error,
    pattern: normalizePattern(rule.pattern),
    sourceTemplate: templateName,
  };
}

export async function loadRuleTemplatesFromYaml(): Promise<RuleTemplate[]> {
  try {
    const response = await fetch("/presets/rule_templates.yaml");
    const text = await response.text();
    const data = yaml.load(text) as YamlRuleTemplatesFile;

    if (!data?.rule_templates) return [];

    return data.rule_templates.map((template) => ({
      name: template.name,
      description: template.description,
      staticRules: template.static_rules,
      taintRules: (template.taint_rules || []).map((rule, idx) =>
        toTemplateRule(rule, template.name, idx)
      ),
    }));
  } catch (error) {
    console.error("Error loading rule templates from YAML:", error);
    return [];
  }
}

