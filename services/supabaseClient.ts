
import { createClient } from '@supabase/supabase-js';

// Konfigurasi dari Project Supabase Anda
const supabaseUrl = 'https://hzrgwinwuibrxdmtsypz.supabase.co';
const supabaseKey = 'sb_publishable_0AkUdkIARa8CfQtJJ0nd0g_gGHkdYig';

export const supabase = createClient(supabaseUrl, supabaseKey);
