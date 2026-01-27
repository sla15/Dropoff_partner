
import { createClient } from '@supabase/supabase-js';

// Access environment variables from process.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jndlmfxjaujjmksbacaz.supabase.co';
// Providing the key from the .env as a hard fallback to prevent 'supabaseKey is required' crash
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuZGxtZnhqYXVqam1rc2JhY2F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMTA5OTAsImV4cCI6MjA4Mzc4Njk5MH0.6I6QOI5ub_B4_gPFPYDzn76DpTnurB3f3ZWz2aJhx7w';

/**
 * Initializing the Supabase client.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if supabase is properly configured
export const isSupabaseConfigured = () => !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
