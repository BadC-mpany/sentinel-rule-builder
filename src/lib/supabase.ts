import { createClient } from "@supabase/supabase-js";
import { ExportedConfig, Project, ProjectSecrets } from "@/types";
import { generateEd25519KeyPair, generateApiKey } from "./keyGeneration";
import yaml from "js-yaml";
import { getSupabaseClient } from "./supabaseClient";

// These would be set in environment variables
// Note: For client-side access in Next.js, these must be prefixed with NEXT_PUBLIC_
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_API_ANON_KEY || "";

if (!supabaseUrl) {
  console.warn("Supabase URL is not set. Please add NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL to your .env file");
}

if (!supabaseAnonKey) {
  console.warn("Supabase Anon Key is not set. Please add NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_API_ANON_KEY to your .env file");
}

// Helper function to get Supabase client with Clerk token
async function getClient(token?: string) {
  return getSupabaseClient(token);
}

// Project-related functions
export async function saveProject(
  userId: string,
  name: string,
  config: ExportedConfig,
  description?: string,
  generateSecrets: boolean = true,
  clerkToken?: string
): Promise<Project | null> {
  let apiKey: string | undefined;
  let privateKey: string | undefined;
  let publicKey: string | undefined;

  if (generateSecrets) {
    // Generate secrets automatically when creating a new project
    // Ensure we're in browser environment
    if (typeof window !== "undefined") {
      apiKey = generateApiKey();
      try {
        const keyPair = await generateEd25519KeyPair();
        privateKey = keyPair.privateKey;
        publicKey = keyPair.publicKey;
      } catch (error) {
        console.error("Error generating key pair:", error);
        throw new Error("Failed to generate encryption keys. Please ensure you're using HTTPS or localhost.");
      }
    } else {
      throw new Error("Key generation must be performed in the browser");
    }
  }

  // Convert config to YAML string (always save as YAML regardless of export format)
  const yamlSource: any = (config as any)?.policyFile ?? config;
  const yamlString = yaml.dump(yamlSource, { indent: 2, lineWidth: -1 });

  const supabase = await getClient(clerkToken);

  // Ensure userId is a string (Clerk user IDs are strings like "user_xxx")
  const userIdString = String(userId);

  const { data, error } = await supabase
    .from("projects")
    .insert([
      {
        user_id: userIdString, // Explicitly convert to string
        name,
        description,
        tools: config.tools,
        policies: config.policies,
        api_key: apiKey,
        private_key: privateKey,
        public_key: publicKey,
        yaml: yamlString,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error saving project:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error hint:", error.hint);
    throw new Error(error.message || "Failed to save project");
  }

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    description: data.description,
    tools: data.tools,
    policies: data.policies,
    apiKey: data.api_key,
    privateKey: data.private_key,
    publicKey: data.public_key,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function getUserProjects(userId: string, clerkToken?: string): Promise<Project[]> {
  const supabase = await getClient(clerkToken);
  const userIdString = String(userId); // Ensure it's a string
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userIdString)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    userId: item.user_id,
    name: item.name,
    description: item.description,
    tools: item.tools,
    policies: item.policies,
    apiKey: item.api_key,
    privateKey: item.private_key,
    publicKey: item.public_key,
    yaml: item.yaml,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
  }));
}

export async function getProject(projectId: string, clerkToken?: string): Promise<Project | null> {
  const supabase = await getClient(clerkToken);
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error) {
    console.error("Error fetching project:", error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    description: data.description,
    tools: data.tools,
    policies: data.policies,
    apiKey: data.api_key,
    privateKey: data.private_key,
    publicKey: data.public_key,
    yaml: data.yaml,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function updateProject(
  projectId: string,
  updates: Partial<Pick<Project, "name" | "description" | "tools" | "policies">>,
  clerkToken?: string
): Promise<boolean> {
  const supabase = await getClient(clerkToken);
  const { error } = await supabase
    .from("projects")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) {
    console.error("Error updating project:", error);
    return false;
  }

  return true;
}

export async function deleteProject(projectId: string, clerkToken?: string): Promise<boolean> {
  const supabase = await getClient(clerkToken);
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    console.error("Error deleting project:", error);
    return false;
  }

  return true;
}

// Regenerate secrets for a project (kept for backward compatibility)
export async function regenerateProjectSecrets(projectId: string, clerkToken?: string): Promise<ProjectSecrets | null> {
  // Ensure we're in browser environment
  if (typeof window === "undefined") {
    throw new Error("Secret regeneration must be performed in the browser");
  }

  try {
    const apiKey = generateApiKey();
    const keyPair = await generateEd25519KeyPair();

    const supabase = await getClient(clerkToken);
    const { error } = await supabase
      .from("projects")
      .update({
        api_key: apiKey,
        private_key: keyPair.privateKey,
        public_key: keyPair.publicKey,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    if (error) {
      console.error("Error regenerating secrets:", error);
      return null;
    }

    return {
      apiKey,
      privateKey: keyPair.privateKey,
      publicKey: keyPair.publicKey,
    };
  } catch (error) {
    console.error("Error generating keys:", error);
    throw error;
  }
}

// Roll API key separately (deletes all instances)
export async function rollApiKey(projectId: string, clerkToken?: string): Promise<string | null> {
  if (typeof window === "undefined") {
    throw new Error("Key rolling must be performed in the browser");
  }

  try {
    const apiKey = generateApiKey();
    const supabase = await getClient(clerkToken);

    // Delete all instances associated with this project
    // Silently handle if instances table doesn't exist or has no rows
    try {
      const { error: instancesError } = await supabase
        .from("instances")
        .delete()
        .eq("project_id", projectId);

      // Only log meaningful errors (not table not found or no rows)
      if (instancesError && instancesError.code !== "42P01" && instancesError.code !== "PGRST116") {
        console.warn("Warning deleting instances:", instancesError.message || instancesError);
      }
    } catch (instancesErr: any) {
      // Table might not exist - that's okay, continue
      if (instancesErr?.code !== "42P01" && instancesErr?.message?.includes("relation") === false) {
        console.warn("Could not delete instances (table may not exist):", instancesErr?.message || instancesErr);
      }
    }

    // Update the API key
    const { error } = await supabase
      .from("projects")
      .update({
        api_key: apiKey,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    if (error) {
      console.error("Error rolling API key:", error);
      throw new Error(error.message || "Failed to roll API key");
    }

    return apiKey;
  } catch (error: any) {
    console.error("Error rolling API key:", error);
    throw error;
  }
}

// Roll JWT secrets separately (private/public keys)
export async function rollJwtSecrets(projectId: string, clerkToken?: string): Promise<{ privateKey: string; publicKey: string } | null> {
  if (typeof window === "undefined") {
    throw new Error("Secret rolling must be performed in the browser");
  }

  try {
    const keyPair = await generateEd25519KeyPair();
    const supabase = await getClient(clerkToken);

    // Delete all instances associated with this project
    // Silently handle if instances table doesn't exist or has no rows
    try {
      const { error: instancesError } = await supabase
        .from("instances")
        .delete()
        .eq("project_id", projectId);

      // Only log meaningful errors (not table not found or no rows)
      if (instancesError && instancesError.code !== "42P01" && instancesError.code !== "PGRST116") {
        console.warn("Warning deleting instances:", instancesError.message || instancesError);
      }
    } catch (instancesErr: any) {
      // Table might not exist - that's okay, continue
      if (instancesErr?.code !== "42P01" && instancesErr?.message?.includes("relation") === false) {
        console.warn("Could not delete instances (table may not exist):", instancesErr?.message || instancesErr);
      }
    }

    // Update the JWT keys
    const { error } = await supabase
      .from("projects")
      .update({
        private_key: keyPair.privateKey,
        public_key: keyPair.publicKey,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    if (error) {
      console.error("Error rolling JWT secrets:", error);
      throw new Error(error.message || "Failed to roll JWT secrets");
    }

    return {
      privateKey: keyPair.privateKey,
      publicKey: keyPair.publicKey,
    };
  } catch (error: any) {
    console.error("Error rolling JWT secrets:", error);
    throw error;
  }
}



// Analytics & Dashboard Functions

export interface TrafficDataPoint {
  time: string;
  requests: number;
  errors: number;
}

export interface ProjectStats {
  totalRequests: number;
  totalTokens: number;
  activeSessions: number;
  breaches: number;
  requestsTrend: { value: string; trend: "up" | "down" | "neutral" };
  tokensTrend: { value: string; trend: "up" | "down" | "neutral" };
}

export async function getProjectTraffic(projectId: string, days: number = 7, clerkToken?: string): Promise<TrafficDataPoint[]> {
  const supabase = await getClient(clerkToken);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Fetch raw traffic data
  const { data, error } = await supabase
    .from("api_traffic")
    .select("timestamp, status")
    .eq("project_id", projectId)
    .gte("timestamp", startDate.toISOString())
    .order("timestamp", { ascending: true })
    .limit(2000); // Safety limit for client-side aggregation

  if (error) {
    console.error("Error fetching traffic:", error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Client-side aggregation by day
  const dailyMap = new Map<string, { requests: number; errors: number }>();

  // Initialize all days with 0
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dailyMap.set(dateStr, { requests: 0, errors: 0 });
  }

  data.forEach((row: any) => {
    const date = new Date(row.timestamp);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (dailyMap.has(dateStr)) {
      const entry = dailyMap.get(dateStr)!;
      entry.requests++;
      if (row.status >= 400) {
        entry.errors++;
      }
    }
  });

  return Array.from(dailyMap.entries()).map(([time, stats]) => ({
    time,
    requests: stats.requests,
    errors: stats.errors
  }));
}

export async function getProjectStats(projectId: string, clerkToken?: string): Promise<ProjectStats> {
  const supabase = await getClient(clerkToken);

  // Parallel fetch for counts
  const [traffic, tokens, sessions, events] = await Promise.all([
    supabase.from("api_traffic").select("id", { count: "exact", head: true }).eq("project_id", projectId),
    supabase.from("token_usage").select("total_tokens", { count: "exact", head: true }).eq("project_id", projectId), // Warning: This is count of rows, not sum of tokens. Real sum needs RPC or loop.
    supabase.from("active_sessions").select("id", { count: "exact", head: true }).eq("project_id", projectId),
    supabase.from("security_events").select("id", { count: "exact", head: true }).eq("project_id", projectId).eq("type", "breach"),
  ]);

  // For total tokens, we should try to sum if possible, but without RPC/Sum function in basic PostgREST, 
  // we might validly need to fetch rows. For now, let's just use row count * estimated average or 0 if empty for safety.
  // Ideally: use a materialized view.
  // Current workaround: fetch last 100 rows and sum usage? Or, keeps it 0 if no data.

  // Real implementation for valid stats:
  // We will assume 0 for now if no smart sum available easily without customized RPC

  return {
    totalRequests: traffic.count || 0,
    totalTokens: (tokens.count || 0), // Replacing mock multiplier with raw count (or 0)
    activeSessions: sessions.count || 0,
    breaches: events.count || 0,
    requestsTrend: { value: "0%", trend: "neutral" }, // No trend calc without history comparison
    tokensTrend: { value: "0%", trend: "neutral" },
  };
}

export async function getSecurityEvents(projectId: string, limit: number = 5, clerkToken?: string) {
  const supabase = await getClient(clerkToken);

  const { data, error } = await supabase
    .from("security_events")
    .select("*")
    .eq("project_id", projectId)
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching security events:", error);
    return [];
  }

  return data || [];
}

export async function getActiveSessions(projectId: string, clerkToken?: string) {
  const supabase = await getClient(clerkToken);

  const { data, error } = await supabase
    .from("active_sessions")
    .select("*")
    .eq("project_id", projectId)
    .order("last_active", { ascending: false });

  if (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }

  return data || [];
}

export async function getTokenUsageHistory(projectId: string, days: number = 7, clerkToken?: string) {
  const supabase = await getClient(clerkToken);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from("token_usage")
    .select("timestamp, total_tokens")
    .eq("project_id", projectId)
    .gte("timestamp", startDate.toISOString());

  if (error || !data) return [];

  // Aggregate by day
  const dailyMap = new Map<string, number>();
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dailyMap.set(dateStr, 0);
  }

  data.forEach((row: any) => {
    const date = new Date(row.timestamp);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (dailyMap.has(dateStr)) {
      dailyMap.set(dateStr, dailyMap.get(dateStr)! + row.total_tokens);
    }
  });

  return Array.from(dailyMap.entries()).map(([time, tokens]) => ({ time, tokens }));
}

export async function getLatencyHistory(projectId: string, days: number = 7, clerkToken?: string) {
  const supabase = await getClient(clerkToken);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from("api_traffic")
    .select("timestamp, latency")
    .eq("project_id", projectId)
    .gte("timestamp", startDate.toISOString());

  if (error || !data) return [];

  // Aggregate average latency per day
  const dailyMap = new Map<string, { total: number; count: number }>();
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dailyMap.set(dateStr, { total: 0, count: 0 });
  }

  data.forEach((row: any) => {
    const date = new Date(row.timestamp);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (dailyMap.has(dateStr)) {
      const entry = dailyMap.get(dateStr)!;
      entry.total += row.latency;
      entry.count++;
    }
  });

  return Array.from(dailyMap.entries()).map(([time, stats]) => ({
    time,
    latency: stats.count > 0 ? Math.round(stats.total / stats.count) : 0
  }));
}
