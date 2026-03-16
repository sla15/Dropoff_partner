
import { createClient } from '@supabase/supabase-js';

// Access environment variables from process.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Initializing the Supabase client.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
        heartbeatIntervalMs: 15000
    }
});

// Helper to check if supabase is properly configured
export const isSupabaseConfigured = () => !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
