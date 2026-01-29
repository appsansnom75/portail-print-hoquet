'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase'; // Import de Supabase
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [agencyName, setAgencyName] = useState("Chargement...");
  const [userName, setUserName] = useState("");
  const { cart } = useCart();
  const router = useRouter();
  
  const hasItems = cart.length > 0;

  useEffect(() => {
    const fetchUserAndAgency = async () => {
      // 1. On récupère l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 2. On récupère son profil et le nom de son agence liée
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            full_name,
            agencies ( name )
          `)
          .eq('id', user.id)
          .single();

        if (data) {
          setUserName(data.full_name);
          // @ts-ignore
          setAgencyName(data.agencies?.name || "Agence Inconnue");
        }
      } else {
        // Si pas de session, on peut rediriger vers login
        router.push('/login');
      }
    };

    fetchUserAndAgency();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans flex flex-col">
      <header className="py-8 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-6 md:gap-12">
          <img src="/logo-imprimeur.png" alt="Mon Imprimerie" className="h-7 md:h-10 object-contain opacity-70" />
          <div className="w-px h-5 bg-white/10"></div>
          <img src="/logo-hoquet.png" alt="Guy Hoquet" className="h-7 md:h-10 object-contain" />
        </div>
      </header>

      <section className="w-full relative border-y border-white/5 bg-white/[0.01]">
        <div className="h-[140px] md:h-[220px] w-full relative">
          <img src="/banner-1.jpg" alt="Bannière" className="w-full h-full object-cover opacity-10 grayscale" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f092e] via-transparent to-[#0f092e]"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white/90">
              Catalogue Print <span className="text-white/30 font-light">2026</span>
            </h2>
          </div>
        </div>
      </section>

      <div className="border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-6 md:py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <span className="h-1 w-1 rounded-full bg-green-500 animate-pulse"></span>
              <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">Session :</span>
                <span className="text-[10px] font-black uppercase text-white/90 tracking-tight">
                    {userName} <span className="text-white/30 mx-1">—</span> {agencyName}
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <Link href="/dashboard/equipe" className="text-center bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/40 text-blue-400 text-[9px] font-black uppercase tracking-widest px-6 py-2.5 transition-all">
                Gérer l'Équipe
              </Link>
              
              <Link href="/panier" className="relative text-center bg-white/10 border border-white/10 hover:bg-white/20 text-white text-[9px] font-black uppercase tracking-widest px-6 py-2.5 transition-all">
                Mon Panier 
                {hasItems && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 border border-[#0f092e]"></span>
                  </span>
                )}
              </Link>

              <button onClick={handleLogout} className="text-center text-[9px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-400 py-2.5 px-4 transition-all">
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow flex items-center py-12">
        <div className="max-w-6xl mx-auto w-full px-6 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <Link href="/perso" className="group">
            <div className="h-20 md:h-28 bg-white/5 border border-white/5 rounded-sm flex flex-col items-center justify-center p-4 text-center transition-all duration-300 hover:bg-blue-600/10 hover:border-blue-500/30">
              <span className="font-black text-[11px] md:text-xs uppercase tracking-[0.15em] text-white/80 group-hover:text-blue-400 transition-colors">Produit Sur-Mesure</span>
              <div className="h-[1px] w-6 bg-blue-500/50 my-2 group-hover:w-12 transition-all duration-500"></div>
              <span className="text-[7px] font-bold text-white/20 uppercase tracking-[0.2em] group-hover:text-blue-500/50">Configurateur</span>
            </div>
          </Link>

          <Link href="/stock" className="group">
            <div className="h-20 md:h-28 bg-white/5 border border-white/5 rounded-sm flex flex-col items-center justify-center p-4 text-center transition-all duration-300 hover:bg-green-600/10 hover:border-green-500/30">
              <span className="font-black text-[11px] md:text-xs uppercase tracking-[0.15em] text-white/80 group-hover:text-green-400 transition-colors">Produit standard</span>
              <div className="h-[1px] w-6 bg-green-500/50 my-2 group-hover:w-12 transition-all duration-500"></div>
              <span className="text-[7px] font-bold text-white/20 uppercase tracking-[0.2em] group-hover:text-green-500/50">catalogue</span>
            </div>
          </Link>

          <Link href="/hoquet" className="group">
            <div className="h-20 md:h-28 bg-white/5 border border-white/5 rounded-sm flex flex-col items-center justify-center p-4 text-center transition-all duration-300 hover:bg-orange-600/10 hover:border-orange-500/30">
              <span className="font-black text-[11px] md:text-xs uppercase tracking-[0.15em] text-white/80 group-hover:text-orange-400 transition-colors">produit Business</span>
              <div className="h-[1px] w-6 bg-orange-500/50 my-2 group-hover:w-12 transition-all duration-500"></div>
              <span className="text-[7px] font-bold text-white/20 uppercase tracking-[0.2em] group-hover:text-orange-500/50">Gamme guy hoquet</span>
            </div>
          </Link>
        </div>
      </main>

      <footer className="py-8 border-t border-white/5 bg-black/5">
        <p className="text-[7px] font-black uppercase tracking-[0.4em] text-white/10 text-center">
          © 2026 IMPRIMERIE CONNIVENCE POUR GUY HOQUET IMMOBILIER.
        </p>
      </footer>
    </div>
  );
}