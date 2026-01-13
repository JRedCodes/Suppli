import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

/**
 * Supabase client for server-side operations
 * Uses service role key - bypasses RLS
 * Use only in backend code, never expose to frontend
 */
export const supabaseAdmin = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
