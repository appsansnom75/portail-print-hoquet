'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  // État pour stocker le nom de l'agence (par défaut si rien n'est sauvegardé)
  const [agencyName, setAgencyName] = useState("Guy Hoquet PARIS 10 BONNE NOUVELLE");

  // Charger le nom sauvegardé au montage de la page
  useEffect(() => {
    const savedData = localStorage.getItem('agencyData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      if (parsed.name) {
        setAgencyName(parsed.name);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans flex flex-col">
      
      {/* --- SECTION 1 : LOGOS (Agrandis x1,3) --- */}
      <header className="py-10 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-8 md:gap-16">
          <img 
            src="/logo-imprimeur.png" 
            alt="Mon Imprimerie" 
            className="h-9 md:h-14 object-contain" 
          />
          <div className="w-px h-6 bg-white/10"></div>
          <img 
            src="/logo-hoquet.png" 
            alt="Guy Hoquet" 
            className="h-9 md:h-14 object-contain" 
          />
        </div>
      </header>

      {/* --- SECTION 2 : BANNIÈRE AVEC BANDEAU --- */}
      <section className="w-full relative group overflow-hidden">
        <div className="h-[220px] md:h-[300px] w-full overflow-hidden border-y border-white/5 relative">
          <div className="absolute top-6 -right-12 bg-red-600 text-white px-12 py-1 rotate-45 z-10 shadow-lg">
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Nouveautés</span>
          </div>
          <img 
            src="/banner-1.jpg" 
            alt="Nouveautés Print" 
            className="w-full h-full object-cover opacity-30 transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f092e] via-transparent to-transparent"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white">
              Catalogue Print 2026
            </h2>
          </div>
        </div>
      </section>

      {/* --- SECTION 3 : BARRE DE STATUT DYNAMIQUE --- */}
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
            {/* ICI LE NOM DEVIENT DYNAMIQUE */}
            <span className="text-[10px] font-black uppercase tracking-tight text-white">
              {agencyName}
            </span>
            
            <Link href="/profil" className="ml-2 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded transition-all shadow-lg active:scale-95">
              Mon Profil Agence
            </Link>
          </div>

          <button 
            onClick={() => alert('Déconnexion en cours...')} 
            className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-red-400 transition-colors border border-white/10 hover:border-red-400/30 px-3 py-1.5 rounded-md"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* --- SECTION 4 : BOUTONS RECTANGLES FINS --- */}
      <main className="flex-grow flex items-center py-10">
        <div className="max-w-5xl mx-auto w-full px-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/perso" className="group">
            <div className="h-24 md:h-28 bg-white rounded-lg flex flex-col items-center justify-center text-center p-3 shadow-xl transition-all duration-300 hover:bg-slate-50 hover:scale-[1.01] border border-white/10">
              <span className="font-black text-xs md:text-sm uppercase tracking-tight text-[#0f092e]">
                Produits Personnalisables
              </span>
              <span className="mt-2 text-[8px] font-black text-blue-600 uppercase tracking-widest opacity-80">
                Configurateur en ligne
              </span>
            </div>
          </Link>

          <Link href="/stock" className="group">
            <div className="h-24 md:h-28 bg-white rounded-lg flex flex-col items-center justify-center text-center p-3 shadow-xl transition-all duration-300 hover:bg-slate-50 hover:scale-[1.01] border border-white/10">
              <span className="font-black text-xs md:text-sm uppercase tracking-tight text-[#0f092e]">
                Produits sans personnalisation
              </span>
              <span className="mt-2 text-[8px] font-black text-green-600 uppercase tracking-widest opacity-80">
                Catalogue en ligne
              </span>
            </div>
          </Link>

          <Link href="/hoquet" className="group">
            <div className="h-24 md:h-28 bg-white rounded-lg flex flex-col items-center justify-center text-center p-3 shadow-xl transition-all duration-300 hover:bg-slate-50 hover:scale-[1.01] border border-white/10">
              <span className="font-black text-xs md:text-sm uppercase tracking-tight text-[#0f092e]">
                Gamme Business
              </span>
              <span className="mt-2 text-[8px] font-black text-slate-500 uppercase tracking-widest opacity-80">
                Accès réservé
              </span>
            </div>
          </Link>
        </div>
      </main>

      {/* --- SECTION 5 : FOOTER --- */}
      <footer className="py-8 text-center border-t border-white/5 opacity-40">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[7px] md:text-[8px] font-bold uppercase tracking-[0.2em] leading-loose text-white">
            © 2026 IMPRIMERIE CONNIVENCE POUR GUY HOQUET IMMOBILIER.<br/>
            ESPACE PRIVÉ RÉSERVÉ AUX FRANCHISÉS. TOUTE REPRODUCTION INTERDITE. 
            <span className="mx-2">|</span>
            <Link href="/mentions-legales" className="hover:text-white underline underline-offset-2">MENTIONS LÉGALES</Link> 
            <span className="mx-2">|</span> 
            <Link href="/cgv" className="hover:text-white underline underline-offset-2">CGV</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}