'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function HomePage() {
  const [agencyName, setAgencyName] = useState("Guy Hoquet PARIS 10");
  const { cart } = useCart();
  const cartCount = cart.length; // On vérifie juste s'il y a des articles

  useEffect(() => {
    const savedData = localStorage.getItem('agencyData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      if (parsed.name) setAgencyName(parsed.name);
    }
  }, []);

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
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="h-1 w-1 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] font-black uppercase text-white/90 tracking-tight">{agencyName}</span>
            </div>

            <div className="flex gap-2">
              <Link href="/profil" className="bg-white/10 border border-white/10 hover:bg-white/20 text-white text-[9px] font-black uppercase tracking-widest px-6 py-2.5 transition-all">
                Profil
              </Link>
              
              {/* BOUTON PANIER AVEC PASTILLE DISCRÈTE */}
              <Link href="/panier" className="relative bg-white/10 border border-white/10 hover:bg-white/20 text-white text-[9px] font-black uppercase tracking-widest px-6 py-2.5 transition-all">
                Mon Panier
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 border border-[#0f092e]"></span>
                  </span>
                )}
              </Link>

              <button className="text-[9px] font-black uppercase tracking-widest text-red-500/60 py-2.5 px-4">Déconnexion</button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow flex items-center py-12 px-6">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/perso" className="h-28 bg-white/5 border border-white/5 rounded-sm flex flex-col items-center justify-center transition-all hover:bg-blue-600/10 hover:border-blue-500/30">
            <span className="font-black text-xs uppercase tracking-widest">Sur-Mesure</span>
          </Link>
          <Link href="/stock" className="h-28 bg-white/5 border border-white/5 rounded-sm flex flex-col items-center justify-center transition-all hover:bg-green-600/10 hover:border-green-500/30">
            <span className="font-black text-xs uppercase tracking-widest">Standard</span>
          </Link>
          <Link href="/hoquet" className="h-28 bg-white/5 border border-white/5 rounded-sm flex flex-col items-center justify-center transition-all hover:bg-orange-600/10 hover:border-orange-500/30">
            <span className="font-black text-xs uppercase tracking-widest">Business</span>
          </Link>
        </div>
      </main>
    </div>
  );
}