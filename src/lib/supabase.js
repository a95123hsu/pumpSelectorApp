// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// Create a single instance of the Supabase client to use across the application
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create the client only if URL and key are available
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export default supabase;