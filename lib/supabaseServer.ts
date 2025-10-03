import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABSE_ANON_KEY || '';

// Prefer service role to bypass RLS. Fallback to anon if service key missing.
export const supabaseServer = createClient(supabaseUrl, serviceKey || anonKey, {
  auth: { persistSession: false },
});
