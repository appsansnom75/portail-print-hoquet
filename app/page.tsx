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
      {/* --- HEADER LOGOS --- */}
      <header className="py-8 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-6 md:gap-12">
          <img src="/logo-imprimeur.png" alt="Mon Imprimerie" className="h-7 md:h-10 object-contain opacity-70" />
          <div className="w-px h-5 bg-white/10"></div>
          <img src="/logo-hoquet.png" alt="Guy Hoquet" className="h-7 md:h-10 object-contain" />
        </div>
      </header>

      {/* --- BANNIÈRE --- */}
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

      {/* --- STATUT & NAV (UNE SEULE LIGNE SUR PC) --- */}
      <div className="border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-6 md:py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4">
            
            {/* Infos Agence : Gauche sur PC, Centre sur Mobile */}
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <span className="h-1 w-1 rounded-full bg-green-500"></span>
              <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">Connecté en tant que :</span>
                <span className="text-[10px] font-black uppercase text-white/90 tracking-tight">{agencyName}</span>
              </div>
            </div>

            {/* Boutons : Droite sur PC, Colonne sur Mobile */}
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <Link href="/profil" className="text-center bg-white/10 border border-white/10 hover:bg-white/20 text-white text-[9px] font-black uppercase tracking-widest px-6 py-2.5 transition-all">
                Profil Agence
              </Link>
              <Link href="/panier" className="text-center bg-white/10 border border-white/10 hover:bg-white/20 text-white text-[9px] font-black uppercase tracking-widest px-6 py-2.5 transition-all">
                Mon Panier
              </Link>
              <button onClick={() => alert('Déconnexion...')} className="text-center text-[9px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-400 py-2.5 px-4 transition-all">
                Déconnexion
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* --- GRILLE DE NAVIGATION (ENCORE PLUS PLATE) --- */}
      <main className="flex-grow flex items-center py-12">
        <div className="max-w-6xl mx-auto w-full px-6 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          
          <Link href="/perso" className="group">
            <div className="h-20 md:h-28 bg-white/5 border border-white/5 rounded-sm flex flex-col items-center justify-center p-4 text-center transition-all duration-300 hover:bg-blue-600/10 hover:border-blue-500/30">
              <span className="font-black text-[11px] md:text-xs uppercase tracking-[0.15em] text-white/80 group-hover:text-blue-400">Produit Sur-Mesure</span>
              <span className="mt-1 text-[7px] font-bold text-white/20 uppercase tracking-[0.2em] group-hover:text-blue-500/50">Configurateur</span>
            </div>
          </Link>

          <Link href="/stock" className="group">
            <div className="h-20 md:h-28 bg-white/5 border border-white/5 rounded-sm flex flex-col items-center justify-center p-4 text-center transition-all duration-300 hover:bg-green-600/10 hover:border-green-500/30">
              <span className="font-black text-[11px] md:text-xs uppercase tracking-[0.15em] text-white/80 group-hover:text-green-400">Produit standard </span>
              <span className="mt-1 text-[7px] font-bold text-white/20 uppercase tracking-[0.2em] group-hover:text-green-500/50">catalogue</span>
            </div>
          </Link>

          <Link href="/hoquet" className="group">
            <div className="h-20 md:h-28 bg-white/5 border border-white/5 rounded-sm flex flex-col items-center justify-center p-4 text-center transition-all duration-300 hover:bg-orange-600/10 hover:border-orange-500/30">
              <span className="font-black text-[11px] md:text-xs uppercase tracking-[0.15em] text-white/80 group-hover:text-orange-400">produit Business</span>
              <span className="mt-1 text-[7px] font-bold text-white/20 uppercase tracking-[0.2em] group-hover:text-orange-500/50">Gamme guy hoquet</span>
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