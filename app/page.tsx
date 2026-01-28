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
        <div className="h-[160px] md:h-[240px] w-full relative">
          <img src="/banner-1.jpg" alt="Bannière" className="w-full h-full object-cover opacity-10 grayscale" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f092e] via-transparent to-[#0f092e]"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tighter text-white/90 text-center">
              Catalogue Print <span className="text-white/30 font-light">2026</span>
            </h2>
          </div>
        </div>
      </section>

      {/* --- STATUT & NAV --- */}
      <div className="border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col items-center justify-center gap-6">
            
            {/* Infos Agence centrées */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Connecté en tant que</span>
              </div>
              <span className="text-[10px] font-black uppercase text-white/90">{agencyName}</span>
            </div>

            {/* Boutons centrés : En colonne sur mobile, En ligne sur PC */}
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto items-center justify-center">
              <Link href="/profil" className="w-full md:w-auto text-center bg-white/10 border border-white/20 hover:bg-white/20 text-white text-[9px] font-black uppercase tracking-widest px-10 py-3.5 transition-all">
                Profil Agence
              </Link>
              <Link href="/panier" className="w-full md:w-auto text-center bg-white/10 border border-white/20 hover:bg-white/20 text-white text-[9px] font-black uppercase tracking-widest px-10 py-3.5 transition-all">
                Mon Panier
              </Link>
              <button onClick={() => alert('Déconnexion...')} className="w-full md:w-auto text-center text-[9px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-400 py-3.5 px-6 transition-all">
                Déconnexion
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* --- GRILLE DE NAVIGATION --- */}
      <main className="flex-grow flex items-center py-12 md:py-20">
        <div className="max-w-6xl mx-auto w-full px-6 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          
          <Link href="/perso" className="group relative">
            <div className="h-36 md:h-48 bg-white/5 border border-white/10 rounded-sm flex flex-col items-center justify-center p-6 text-center transition-all duration-700 hover:bg-blue-500/[0.05] hover:border-blue-500/40">
              <span className="font-black text-xs md:text-sm uppercase tracking-[0.2em] text-white group-hover:text-blue-400 transition-colors">Sur-Mesure</span>
              <div className="h-[1px] w-6 bg-blue-500/50 my-4 group-hover:w-12 transition-all duration-700"></div>
              <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.3em]">Personnalisables</span>
            </div>
          </Link>

          <Link href="/stock" className="group relative">
            <div className="h-36 md:h-48 bg-white/5 border border-white/10 rounded-sm flex flex-col items-center justify-center p-6 text-center transition-all duration-700 hover:bg-green-500/[0.05] hover:border-green-500/40">
              <span className="font-black text-xs md:text-sm uppercase tracking-[0.2em] text-white group-hover:text-green-400 transition-colors">En Stock</span>
              <div className="h-[1px] w-6 bg-green-500/50 my-4 group-hover:w-12 transition-all duration-700"></div>
              <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.3em]">Sans repiquage</span>
            </div>
          </Link>

          <Link href="/hoquet" className="group relative">
            <div className="h-36 md:h-48 bg-white/5 border border-white/10 rounded-sm flex flex-col items-center justify-center p-6 text-center transition-all duration-700 hover:bg-orange-500/[0.05] hover:border-orange-500/40">
              <span className="font-black text-xs md:text-sm uppercase tracking-[0.2em] text-white group-hover:text-orange-400 transition-colors">Business</span>
              <div className="h-[1px] w-6 bg-orange-500/50 my-4 group-hover:w-12 transition-all duration-700"></div>
              <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.3em]">Gamme Agence</span>
            </div>
          </Link>

        </div>
      </main>

      <footer className="py-12 border-t border-white/5 bg-black/10">
        <div className="max-w-6xl mx-auto px-6 flex justify-center items-center">
          <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/10 text-center">
            Connivence x Guy Hoquet
          </p>
        </div>
      </footer>
    </div>
  );
}