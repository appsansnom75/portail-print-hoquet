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
      <header className="py-10 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-8 md:gap-16">
          <img src="/logo-imprimeur.png" alt="Mon Imprimerie" className="h-9 md:h-14 object-contain" />
          <div className="w-px h-6 bg-white/10"></div>
          <img src="/logo-hoquet.png" alt="Guy Hoquet" className="h-9 md:h-14 object-contain" />
        </div>
      </header>

      <section className="w-full relative group overflow-hidden">
        <div className="h-[220px] md:h-[300px] w-full overflow-hidden border-y border-white/5 relative">
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

      <div className="bg-white/[0.03] border-b border-white/10 py-3 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Session :</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-tight text-white">{agencyName}</span>
            <Link href="/profil" className="ml-2 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded transition-all">Mon Profil</Link>
          </div>
          <button onClick={() => alert('Déconnexion...')} className="text-[9px] font-black uppercase tracking-widest text-white/40 border border-white/10 px-3 py-1.5 rounded-md hover:text-red-400 hover:border-red-400/30">Déconnexion</button>
        </div>
      </div>

      <main className="flex-grow flex items-center py-10">
        <div className="max-w-5xl mx-auto w-full px-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/perso" className="group">
            <div className="h-24 md:h-28 bg-white rounded-lg flex flex-col items-center justify-center text-center p-3 shadow-xl transition-all hover:scale-[1.01]">
              <span className="font-black text-xs md:text-sm uppercase text-[#0f092e]">Produits Personnalisables</span>
              <span className="mt-2 text-[8px] font-black text-blue-600 uppercase tracking-widest opacity-80">Configurateur en ligne</span>
            </div>
          </Link>

          <Link href="/stock" className="group">
            <div className="h-24 md:h-28 bg-white rounded-lg flex flex-col items-center justify-center text-center p-3 shadow-xl transition-all hover:scale-[1.01]">
              <span className="font-black text-xs md:text-sm uppercase text-[#0f092e]">Produits sans personnalisation </span>
              <span className="mt-2 text-[8px] font-black text-green-600 uppercase tracking-widest opacity-80">Catalogue en ligne</span>
            </div>
          </Link>

          <Link href="/hoquet" className="group">
            <div className="h-24 md:h-28 bg-white rounded-lg flex flex-col items-center justify-center text-center p-3 shadow-xl transition-all hover:scale-[1.01]">
              <span className="font-black text-xs md:text-sm uppercase text-[#0f092e]">Gamme Hoquet Business</span>
              <span className="mt-2 text-[8px] font-black text-orange-500 uppercase tracking-widest opacity-80">Découvrir la gamme</span>
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