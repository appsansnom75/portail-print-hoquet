import { createClient } from '@supabase/supabase-js';

// Récupération des clés depuis les variables d'environnement (Vercel ou local)
// Si elles sont absentes, on met une chaîne vide pour éviter l'erreur de build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tmfhfjebesrfzendjrny.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZmhmamViZXNyZnplbmRqcm55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2OTU1MTUsImV4cCI6MjA4NTI3MTUxNX0.XIxeDZoq7g2IkGP4YD2PG3ZtE5JiaqaRH2nVtkpPL3I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);