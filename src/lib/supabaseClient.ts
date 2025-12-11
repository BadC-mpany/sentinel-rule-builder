import { createClient } from "@supabase/supabase-js";

// These would be set in environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_API_ANON_KEY || "";

if (!supabaseUrl) {
  console.warn("Supabase URL is not set. Please add NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL to your .env file");
}

if (!supabaseAnonKey) {
  console.warn("Supabase Anon Key is not set. Please add NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_API_ANON_KEY to your .env file");
}

// Client-side Supabase client (for use in client components)
export function getSupabaseClient(token?: string) {
  const options: any = {};
  
  if (token) {
    // Use Clerk JWT token for authentication
    options.global = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  return createClient(supabaseUrl, supabaseAnonKey, options);
}

// Default client for backward compatibility (will be updated to use Clerk token when available)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

