import { createClient } from '@supabase/supabase-js';

// Récupération des clés
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Création du client unique
export const supabase = createClient(supabaseUrl, supabaseAnonKey);