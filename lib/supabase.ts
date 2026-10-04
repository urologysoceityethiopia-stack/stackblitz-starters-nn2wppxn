import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE?.trim();

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL in environment");
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in environment");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export function createSupabaseServiceRoleClient(): SupabaseClient {
  if (!supabaseServiceRole) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE in environment");
  }

  return createClient(supabaseUrl, supabaseServiceRole, {
    auth: { persistSession: false },
  });
}