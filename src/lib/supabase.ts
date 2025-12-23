import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Global variable to track if we're in the browser
const isBrowser = typeof window !== 'undefined';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: isBrowser ? window.localStorage : undefined,
    // Add storage key to avoid conflicts
    storageKey: 'supabase.auth.token',
    // Handle refresh token better
    flowType: 'pkce', // More secure and reliable for SPAs
  },
  global: {
    // Ensure headers are sent with all requests
    headers: {
      'X-Client-Info': 'your-app-name',
    },
  },
});