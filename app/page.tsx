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
      <header className="py-10 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-8 md:gap-16">
          <img src="/logo-imprimeur.png" alt="Mon Imprimerie" className="h-9 md:h-12 object-contain opacity-80" />
          <div className="w-px h-6 bg-white/10"></div>
          <img src="/logo-hoquet.png" alt="Guy Hoquet" className="h-9 md:h-12 object-contain" />
        </div>
      </header>

      {/* --- BANNIÈRE ÉPURÉE --- */}
      <section className="w-full relative overflow-hidden border-y border-white/5 bg-white/[0.01]">
        <div className="h-[180px] md:h-[260px] w-full relative">
          <img src="/banner-1.jpg" alt="Bannière" className="w-full h-full object-cover opacity-20 grayscale" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f092e] via-transparent to-[#0f092e]"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white/90">
              Catalogue Print <span className="text-white/40">2026</span>
            </h2>
          </div>
        </div>
      </section>

      {/* --- STATUT & NAVIGATION SECONDAIRE --- */}
      <div className="border-b border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Agence :</span>
            <span className="text-[10px] font-black uppercase text-white/80">{agencyName}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/profil" className="flex-1 md:flex-none text-center border border-white/10 hover:border-white/40 text-white/60 hover:text-white text-[9px] font-black uppercase tracking-widest px-6 py-3 rounded-sm transition-all">
              Profil
            </Link>
            <Link href="/panier" className="flex-1 md:flex-none text-center border border-white/10 hover:border-white/40 text-white/60 hover:text-white text-[9px] font-black uppercase tracking-widest px-6 py-3 rounded-sm transition-all relative">
              Mon Panier
            </Link>
            <button onClick={() => alert('Déconnexion...')} className="text-[9px] font-black uppercase tracking-widest text-red-500/50 hover:text-red-500 px-4 transition-all">
              Quitter
            </button>
          </div>
        </div>
      </div>

      {/* --- NAVIGATION PRINCIPALE (MODERNE) --- */}
      <main className="flex-grow flex items-center py-16">
        <div className="max-w-6xl mx-auto w-full px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* CARTE PERSO (BLEU SUBTIL) */}
          <Link href="/perso" className="group relative">
            <div className="h-40 bg-white/[0.03] border border-white/10 rounded-sm flex flex-col items-center justify-center p-6 transition-all duration-500 group-hover:bg-blue-500/[0.05] group-hover:border-blue-500/50">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_40px_rgba(59,130,246,0.1)]"></div>
              <span className="font-black text-sm uppercase tracking-widest text-white/90 group-hover:text-blue-400 transition-colors">Sur-Mesure</span>
              <div className="h-px w-8 bg-blue-500 my-4 group-hover:w-16 transition-all"></div>
              <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">Configurateur</span>
            </div>
          </Link>

          {/* CARTE STOCK (VERT SUBTIL) */}
          <Link href="/stock" className="group relative">
            <div className="h-40 bg-white/[0.03] border border-white/10 rounded-sm flex flex-col items-center justify-center p-6 transition-all duration-500 group-hover:bg-green-500/[0.05] group-hover:border-green-500/50">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_40px_rgba(34,197,94,0.1)]"></div>
              <span className="font-black text-sm uppercase tracking-widest text-white/90 group-hover:text-green-400 transition-colors">En Stock</span>
              <div className="h-px w-8 bg-green-500 my-4 group-hover:w-16 transition-all"></div>
              <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">Prêt à l'envoi</span>
            </div>
          </Link>

          {/* CARTE BUSINESS (ORANGE SUBTIL) */}
          <Link href="/hoquet" className="group relative">
            <div className="h-40 bg-white/[0.03] border border-white/10 rounded-sm flex flex-col items-center justify-center p-6 transition-all duration-500 group-hover:bg-orange-500/[0.05] group-hover:border-orange-500/50">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_40px_rgba(249,115,22,0.1)]"></div>
              <span className="font-black text-sm uppercase tracking-widest text-white/90 group-hover:text-orange-400 transition-colors">Business</span>
              <div className="h-px w-8 bg-orange-500 my-4 group-hover:w-16 transition-all"></div>
              <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">Gamme Agence</span>
            </div>
          </Link>

        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="py-10 border-t border-white/5">
        <p className="text-center text-[8px] font-black uppercase tracking-[0.4em] text-white/20">
          Privé : Guy Hoquet Immobilier x Imprimerie Connivence
        </p>
      </footer>
    </div>
  );
}