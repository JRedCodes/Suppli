import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Lazy-loaded Supabase client for server-side operations
 * Uses service role key - bypasses RLS
 * Use only in backend code, never expose to frontend
 * 
 * Reads environment variables directly to avoid config loading issues
 */
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
      throw new Error(
        'Supabase configuration is missing. Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local'
      );
    }

    _supabaseAdmin = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _supabaseAdmin;
}

/**
 * Proxy for backward compatibility - allows existing code to use supabaseAdmin
 * as if it were a direct client instance
 */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdmin();
    const value = client[prop as keyof SupabaseClient];
    // If it's a function, bind it to the client so 'this' works correctly
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
