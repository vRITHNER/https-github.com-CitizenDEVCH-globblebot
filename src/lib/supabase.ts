import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

export type Profile = {
  id: string;
  display_name: string;
  email: string;
  created_at: string;
  updated_at: string;
  role: string;
  is_admin: boolean;
  learning_language: string;
  learning_level: string;
  api_calls_limit: number;
  api_calls_count: number;
  api_calls_reset_at: string;
  subscription_plan_id: string;
};