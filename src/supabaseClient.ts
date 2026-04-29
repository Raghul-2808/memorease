import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL || "https://ixkrmtujqzmdalugqndj.supabase.co";
const SUPABASE_PUBLIC_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "sb_publishable_6RUHYgl6rCwnxU52jz5KRA_sFbwXbOU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);