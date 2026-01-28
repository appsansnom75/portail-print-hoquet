'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export default function PersoPage() {
  // État pour les options de la carte de voeux
  const [vernis, setVernis] = useState('sans'); // 'sans' ou 'clear'
  const [enveloppe, setEnveloppe] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans flex flex-col">
      
      {/* HEADER NAVIGATION - Même style que Home */}
      <header className="py-6 px-6 border-b border-white/10 flex justify-between items-center bg-[#0f092e]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">
          ← Retour Accueil
        </Link>
        <h1 className="text-xs font-black uppercase tracking-[0.3em]">Produits Personnalisables</h1>
        <div className="w-20"></div>
      </header>

      <main className="max-w-6xl mx-auto w-full py-12 px-6">
        
        {/* TITRE DE SECTION - Pas d'italique */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
            Configurez vos supports
          </h2>
          <p className="text-blue-300/60 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
            Personnalisation automatique via profil agence
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* CARTE PRODUIT : CARTE DE VOEUX */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {/* Visuel */}
            <div className="h-64 bg-gradient-to-br from-slate-800 to-slate-900 relative flex items-center justify-center">
               <div className="absolute inset-0 opacity-20 bg-[url('/pattern.png')] bg-grid"></div>
               <span className="text-[12px] font-black uppercase text-white/20 tracking-[1em]">Aperçu Voeux</span>
            </div>

            {/* Configuration */}
            <div className="p-8">
              <h3 className="font-black text-2xl uppercase tracking-tight mb-6">Carte de Vœux 2026</h3>
              
              {/* Option Vernis */}
              <div className="space-y-4 mb-8">
                <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Sélectionnez la finition :</p>
                
                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${vernis === 'sans' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="vernis" checked={vernis === 'sans'} onChange={() => setVernis('sans')} className="hidden" />
                    <span className="text-xs font-black uppercase">Carte sans vernis "clear"</span>
                  </div>
                  {vernis === 'sans' && <span className="text-blue-400 text-xs">✓</span>}
                </label>

                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${vernis === 'clear' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="vernis" checked={vernis === 'clear'} onChange={() => setVernis('clear')} className="hidden" />
                    <span className="text-xs font-black uppercase">Vernis sélectif (Gui et Confettis)</span>
                  </div>
                  {vernis === 'clear' && <span className="text-blue-400 text-xs">✓</span>}
                </label>
              </div>

              {/* Option Supplément Enveloppe */}
              <div className="mb-8">
                <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-4">Options supplémentaires :</p>
                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${enveloppe ? 'border-green-500 bg-green-500/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={enveloppe} onChange={() => setEnveloppe(!enveloppe)} className="w-4 h-4 accent-green-500" />
                    <span className="text-xs font-black uppercase">Enveloppes carte de voeux 16x16</span>
                  </div>
                  <span className="text-[10px] font-black text-green-500 uppercase">Supplément</span>
                </label>
              </div>

              <button className="w-full bg-white text-[#0f092e] py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-xl">
                Personnaliser ce produit
              </button>
            </div>
          </div>

          {/* AUTRE PRODUIT (EXEMPLE RAPIDE) */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 flex flex-col justify-between opacity-50">
            <div>
              <h3 className="font-black text-2xl uppercase tracking-tight">Panneaux Akilux</h3>
              <p className="text-[10px] font-black uppercase text-blue-400 mt-2 tracking-widest">Bientôt disponible</p>
            </div>
            <div className="h-px bg-white/10 my-6"></div>
            <p className="text-xs font-bold text-white/40 uppercase leading-relaxed">
              La configuration des panneaux immobiliers avec pose d'oeillets sera disponible prochainement.
            </p>
          </div>

        </div>

        {/* FOOTER INFO - Même style que Profil */}
        <div className="mt-16 bg-white/[0.03] border border-white/10 rounded-2xl p-8">
          <p className="text-[10px] font-bold leading-loose text-white/40 uppercase tracking-widest text-center">
            Note : Les visuels de vos cartes de voeux incluront automatiquement le logo de l'agence configuré dans votre espace profil.
          </p>
        </div>

      </main>
    </div>
  );
}