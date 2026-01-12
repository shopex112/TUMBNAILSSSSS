import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- SUPABASE CONFIGURATION ---
// You need to provide your Supabase Project URL and Public API Key.
//
// HOW TO FIND YOUR KEYS:
// 1. Go to your Supabase project dashboard.
// 2. Navigate to: Project Settings (the gear icon) > API.
// 3. Under "Project API keys", find the key labeled "Publishable key". This is your public API key.
//    - It usually starts with `sb_publishable_...` (for new projects).
//    - For older projects, it might be a long string starting with `ey...` found under the "Legacy" tab.
// 4. Copy the Project URL and the Publishable Key and paste them below.
// ---
const supabaseUrl: string = 'https://qqnnczmsvbmjokblqukw.supabase.co'; 
const supabaseAnonKey: string = 'sb_publishable_qosKdf7D9xLKYr861mXNOw_47mzW0BC';

let supabase: SupabaseClient | null = null;

// The app will crash if createClient is called with an invalid URL.
// We prevent this by checking if the URL seems valid before initializing.
const isConfigured = supabaseUrl 
  && supabaseAnonKey 
  && (supabaseAnonKey.startsWith('ey') || supabaseAnonKey.startsWith('sb_publishable_')) 
  && supabaseUrl.startsWith('http');

if (isConfigured) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
    // This warning is for the developer console, the UI will show a more user-friendly message.
    console.warn("Supabase is not configured correctly. Please add your URL and anon key in services/supabaseClient.ts");
}

export { supabase };
export const isSupabaseConfigured = isConfigured;