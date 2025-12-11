import yaml from "js-yaml";
import { LangChainTool, ToolInputSchema } from "@/types";

interface YamlTool {
  description: string;
  classes: string[];
  auto_classified: boolean;
  args: Record<string, {
    type: string;
    description: string;
    required: boolean;
  }>;
}

interface YamlToolList {
  tools: Record<string, YamlTool>;
}

export async function loadToolsFromYaml(): Promise<LangChainTool[]> {
  try {
    const response = await fetch("/presets/tool_registry.yaml");
    const yamlText = await response.text();
    const data = yaml.load(yamlText) as YamlToolList;

    const tools: LangChainTool[] = [];

    for (const [toolName, toolData] of Object.entries(data.tools)) {
      const properties: Record<string, any> = {};
      const required: string[] = [];

      for (const [argName, argData] of Object.entries(toolData.args)) {
        properties[argName] = {
          type: argData.type,
          description: argData.description,
        };
        if (argData.required) {
          required.push(argName);
        }
      }

      const inputSchema: ToolInputSchema = {
        type: "object",
        properties,
        required,
      };

      const taintClass = toolData.classes[0] as LangChainTool["taintClass"];

      tools.push({
        id: toolName,
        name: toolName,
        displayName: toolName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        description: toolData.description,
        category: "Utilities",
        taintClass,
        classes: toolData.classes as LangChainTool["classes"],
        inputSchema,
        isCommon: ["web_search", "read_file", "send_email", "read_database"].includes(toolName),
        pricing: "Free",
      });
    }

    return tools;
  } catch (error) {
    console.error("Error loading tools from YAML:", error);
    return [];
  }
}


