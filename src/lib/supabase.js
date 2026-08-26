import { createClient } from '@supabase/supabase-js';

// ️ REPLACE THESE WITH YOUR ACTUAL KEYS FROM SUPABASE
const supabaseUrl = 'https://uxsocbktluspffupvwlv.supabase.co'; 
const supabaseAnonKey = 'sb_publishable__A_0ORKS4HgbPxllLoxeEg_A66vWLcE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);