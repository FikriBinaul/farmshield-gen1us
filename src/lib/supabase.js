import { createClient } from '@supabase/supabase-js';

// Extract project ref from connection string
// postgresql://postgres:[Depok13k]@db.ocjnbyhmnqdriuvfvdbo.supabase.co:5432/postgres
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ocjnbyhmnqdriuvfvdbo.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// For server-side operations, use service role key if available
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create Supabase client (for client-side, use anon key)
export const supabase = SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// For server-side operations (API routes) - use service role key
export const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

