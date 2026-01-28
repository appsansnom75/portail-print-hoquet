'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [agencyName, setAgencyName] = useState("Guy Hoquet PARIS 10 BONNE NOUVELLE");

  useEffect(() => {
    const savedData = localStorage.getItem('agencyData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      if (parsed.name) setAgencyName(parsed.name);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans flex flex-col">
      {/* --- LOGOS --- */}
      <header className="py-10 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-8 md:gap-16">
          <img src="/logo-imprimeur.png" alt="Mon Imprimerie" className="h-9 md:h-14 object-contain" />
          <div className="w-px h-6 bg-white/10"></div>
          <img src="/logo-hoquet.png" alt="Guy Hoquet" className="h-9 md:h-14 object-contain" />
        </div>
      </header>

      {/* --- BANNIÈRE --- */}
      <section className="w-full relative group overflow-hidden">
        <div className="h-[200px] md:h-[300px] w-full overflow-hidden border-y border-white/5 relative">
          <div className="absolute top-6 -right-12 bg-red-600 text-white px-12 py-1 rotate-45 z-10 shadow-lg">
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Nouveautés</span>
          </div>
          <img src="/banner-1.jpg" alt="Bannière" className="w-full h-full object-cover opacity-30 transition-transform duration-1000 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f092e] via-transparent to-transparent"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white">Catalogue Print 2026</h2>
          </div>
        </div>
      </section>

      {/* --- BARRE DE STATUT RÉORGANISÉE --- */}
      <div className="bg-white/[0.03] border-b border-white/10 py-4 px-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          
          {/* Ligne 1 : Nom de l'agence */}
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Session :</span>
            </div>
            <span className="text-[10px] md:text-xs font-black uppercase tracking-tight text-white">{agencyName}</span>
          </div>

          {/* Ligne 2 : Boutons d'action (Côte à côte sur mobile) */}
          <div className="flex items-center justify-center md:justify-start gap-2 overflow-x-auto pb-1">
            <Link href="/profil" className="flex-1 md:flex-none text-center bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded transition-all">
              Mon Profil
            </Link>
            <Link href="/panier" className="flex-1 md:flex-none text-center bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded transition-all shadow-lg shadow-blue-500/20">
              🛒 Mon Panier
            </Link>
            <button onClick={() => alert('Déconnexion...')} className="flex-1 md:flex-none text-[9px] font-black uppercase tracking-widest text-white/40 border border-white/5 px-4 py-2.5 rounded hover:text-red-400 hover:bg-red-400/10 transition-all">
              Quitter
            </button>
          </div>

        </div>
      </div>

      {/* --- BOUTONS NAVIGATION AVEC FONDUS COLORÉS --- */}
      <main className="flex-grow flex items-center py-12">
        <div className="max-w-5xl mx-auto w-full px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* PERSO - DÉGRADÉ BLEU */}
          <Link href="/perso" className="group">
            <div className="h-28 md:h-32 bg-gradient-to-br from-blue-600/80 to-blue-900/40 rounded-xl flex flex-col items-center justify-center text-center p-4 shadow-xl border border-blue-400/20 transition-all hover:scale-[1.02] hover:border-blue-400/40">
              <span className="font-black text-sm md:text-base uppercase text-white drop-shadow-md">Produits Personnalisables</span>
              <span className="mt-2 text-[9px] font-black text-blue-200 uppercase tracking-widest opacity-90 bg-blue-900/50 px-2 py-1 rounded">Configurateur en ligne</span>
            </div>
          </Link>

          {/* STOCK - DÉGRADÉ VERT */}
          <Link href="/stock" className="group">
            <div className="h-28 md:h-32 bg-gradient-to-br from-green-600/80 to-green-900/40 rounded-xl flex flex-col items-center justify-center text-center p-4 shadow-xl border border-green-400/20 transition-all hover:scale-[1.02] hover:border-green-400/40">
              <span className="font-black text-sm md:text-base uppercase text-white drop-shadow-md">Produits en stock</span>
              <span className="mt-2 text-[9px] font-black text-green-100 uppercase tracking-widest opacity-90 bg-green-900/50 px-2 py-1 rounded">Sans personnalisation</span>
            </div>
          </Link>

          {/* BUSINESS - DÉGRADÉ ORANGE */}
          <Link href="/hoquet" className="group">
            <div className="h-28 md:h-32 bg-gradient-to-br from-orange-500/80 to-orange-900/40 rounded-xl flex flex-col items-center justify-center text-center p-4 shadow-xl border border-orange-400/20 transition-all hover:scale-[1.02] hover:border-orange-400/40">
              <span className="font-black text-sm md:text-base uppercase text-white drop-shadow-md">Gamme Business</span>
              <span className="mt-2 text-[9px] font-black text-orange-100 uppercase tracking-widest opacity-90 bg-orange-900/50 px-2 py-1 rounded">Découvrir la gamme</span>
            </div>
          </Link>

        </div>
      </main>

      <footer className="py-8 text-center border-t border-white/5 opacity-40">
        <p className="text-[7px] md:text-[8px] font-bold uppercase tracking-[0.2em] text-white">
          © 2026 IMPRIMERIE CONNIVENCE POUR GUY HOQUET IMMOBILIER.
        </p>
      </footer>
    </div>
  );
}