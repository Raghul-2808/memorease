import { createClient } from '@supabase/supabase-js';

// =====================================================================
// SUPABASE CONFIGURATION
// Replace the values below with your actual Supabase URL and Public Key
// =====================================================================

const SUPABASE_URL = "https://ixkrmtujqzmdalugqndj.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_6RUHYgl6rCwnxU52jz5KRA_sFbwXbOU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
