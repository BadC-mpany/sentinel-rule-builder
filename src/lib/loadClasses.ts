import { TaintClass } from "@/types";

export interface ClassDefinition {
  className: TaintClass;
  classificationRule: string;
  description: string;
  exampleFunctionName: string;
  exampleFunctionDescription: string;
  necessity: string;
}

export async function loadClassesFromYaml(): Promise<ClassDefinition[]> {
  try {
    const response = await fetch("/presets/classes.yaml");
    const text = await response.text();
    // The file is JSON format despite .yaml extension
    const data = JSON.parse(text) as ClassDefinition[];
    return data;
  } catch (error) {
    console.error("Error loading classes from YAML:", error);
    return [];
  }
}

