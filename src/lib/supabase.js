import { createClient } from '@supabase/supabase-js';

// ️ REPLACE THESE WITH YOUR ACTUAL KEYS FROM SUPABASE
const supabaseUrl = 'https://uxsocbktluspffupvwlv.supabase.co'; 
// const supabaseAnonKey = 'sb_publishable__A_0ORKS4HgbPxllLoxeEg_A66vWLcE';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4c29jYmt0bHVzcGZmdXB2d2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MzkxNjUsImV4cCI6MjEwMzMxNTE2NX0.mWnICOtDpAQ_jaWccnvKxdXUF5MUGX8Ovt7MT-YYCIY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);