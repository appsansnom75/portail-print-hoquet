'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function OperationsPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen bg-[#0f092e] flex items-center justify-center text-white font-black uppercase tracking-[0.5em] text-[10px]">
      Chargement des offres...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans flex flex-col selection:bg-purple-500/30">
      
      {/* HEADER SIMPLE */}
      <header className="py-10 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/">
            <img src="/logo-imprimeur.png" alt="Logo" className="h-6 md:h-8 object-contain opacity-50 hover:opacity-100 transition-opacity" />
          </Link>
          <Link href="/" className="bg-white/5 border border-white/10 hover:border-purple-500/50 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">
            Retour au catalogue
          </Link>
        </div>
      </header>

      {/* TITRE DE LA SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-12 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
          <span className="text-purple-400 text-[8px] font-black uppercase tracking-[0.3em]">Exclusivité 2026</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
          Opérations <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-fuchsia-400">du moment</span>
        </h1>
        <p className="max-w-2xl mx-auto text-white/40 text-xs md:text-sm font-medium leading-relaxed uppercase tracking-widest">
          Découvrez nos offres éphémères et collections limitées pour booster votre communication.
        </p>
      </section> {/* <--- C'ÉTAIT ICI L'ERREUR (tu avais mis </header>) */}

      {/* GRILLE DE CONTENU */}
      <main className="flex-grow container mx-auto max-w-6xl px-6 pb-20">
        <div className="relative group">
          <div className="h-[400px] w-full bg-white/[0.02] border border-dashed border-white/10 rounded-[40px] flex flex-col items-center justify-center p-12 text-center group-hover:border-purple-500/30 transition-colors">
            <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-6">
               <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            </div>
            <h3 className="text-xl font-black uppercase tracking-widest mb-2">Bientôt disponible</h3>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] max-w-xs leading-loose">
              De nouvelles opérations marketing arrivent. Restez connectés pour profiter des tarifs préférentiels.
            </p>
          </div>

          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-600/10 blur-[120px] pointer-events-none"></div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-12 border-t border-white/5 bg-black/20 mt-auto">
        <div className="flex flex-col items-center gap-4">
          <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/10">
            © 2026 Opérations Spéciales • Guy Hoquet
          </p>
        </div>
      </footer>
    </div>
  );
}