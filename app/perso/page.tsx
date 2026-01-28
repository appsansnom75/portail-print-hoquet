'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export default function PersoPage() {
  // --- ÉTATS POUR LE PANIER ---
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // --- ÉTATS POUR LES OPTIONS ---
  // Carte de voeux
  const [voeuxVernis, setVoeuxVernis] = useState('sans');
  const [voeuxEnveloppe, setVoeuxEnveloppe] = useState(false);
  // Agendas
  const [agendaQty, setAgendaQty] = useState(1);

  // --- FONCTION AJOUT AU PANIER ---
  const addToCart = (productName: string, basePrice: number, options: string, extraPrice: number = 0) => {
    const newItem = {
      id: Date.now(),
      name: productName,
      price: basePrice + extraPrice,
      details: options
    };
    setCart([...cart, newItem]);
    setIsCartOpen(true); // Ouvre le panier pour confirmer l'ajout
  };

  const totalPriceHT = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans flex flex-col relative">
      
      {/* HEADER NAVIGATION */}
      <header className="py-6 px-6 border-b border-white/10 flex justify-between items-center bg-[#0f092e]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">
          ← Retour Accueil
        </Link>
        <h1 className="text-xs font-black uppercase tracking-[0.3em]">Produits Personnalisables</h1>
        <div className="w-20"></div>
      </header>

      <main className="max-w-6xl mx-auto w-full py-12 px-6 pb-32">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Personnalisation</h2>
          <p className="text-blue-300/60 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Tarification HT Professionnelle</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* 1. CARTE DE VOEUX */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="h-48 bg-slate-800 flex items-center justify-center font-black text-white/10 uppercase tracking-widest">Visuel Vœux</div>
            <div className="p-8 flex-grow">
              <h3 className="font-black text-2xl uppercase tracking-tight mb-6">Carte de Vœux 2026</h3>
              
              <div className="space-y-3 mb-6">
                <label onClick={() => setVoeuxVernis('sans')} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${voeuxVernis === 'sans' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5'}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest">Sans vernis "clear"</span>
                  {voeuxVernis === 'sans' && <span className="text-blue-400">●</span>}
                </label>
                <label onClick={() => setVoeuxVernis('clear')} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${voeuxVernis === 'clear' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5'}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest">Vernis sélectif</span>
                  {voeuxVernis === 'clear' && <span className="text-blue-400">●</span>}
                </label>
              </div>

              <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer mb-8 transition-all ${voeuxEnveloppe ? 'border-green-500 bg-green-500/10' : 'border-white/10 bg-white/5'}`}>
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={voeuxEnveloppe} onChange={() => setVoeuxEnveloppe(!voeuxEnveloppe)} className="accent-green-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Ajouter Enveloppes 16x16</span>
                </div>
              </label>

              <button 
                onClick={() => addToCart("Carte de Voeux", 150, `Vernis: ${voeuxVernis}, Env: ${voeuxEnveloppe ? 'Oui' : 'Non'}`, voeuxEnveloppe ? 45 : 0)}
                className="w-full bg-white text-[#0f092e] py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all"
              >
                Ajouter au panier
              </button>
            </div>
          </div>

          {/* 2. AGENDAS */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="h-48 bg-slate-800 flex items-center justify-center font-black text-white/10 uppercase tracking-widest">Visuel Agenda</div>
            <div className="p-8 flex-grow">
              <h3 className="font-black text-2xl uppercase tracking-tight mb-6">Agendas Agence</h3>
              <p className="text-[10px] font-bold text-white/40 uppercase mb-8 tracking-widest leading-relaxed">
                Agenda semainier format A5 personnalisé avec le logo de l'agence sur la couverture rigide.
              </p>
              
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-8 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase">Option Unique : Couverture Rigide</span>
                <span className="text-blue-400 text-[10px] font-black">INCLUS</span>
              </div>

              <button 
                onClick={() => addToCart("Agenda Agence", 320, "Couverture Rigide Personnalisée")}
                className="w-full bg-white text-[#0f092e] py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all mt-auto"
              >
                Ajouter au panier
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* --- PANIER FLOTTANT (BAS À GAUCHE) --- */}
      <div className="fixed bottom-8 left-8 z-[100]">
        <button 
          onClick={() => setIsCartOpen(!isCartOpen)}
          className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:bg-blue-500 transition-all group relative"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">🛒</span>
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#0f092e]">
              {cart.length}
            </span>
          )}
        </button>

        {/* RÉCAPITULATIF PANIER */}
        {isCartOpen && (
          <div className="absolute bottom-20 left-0 w-80 bg-white rounded-2xl shadow-2xl text-[#0f092e] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
              <span className="font-black text-[10px] uppercase tracking-widest">Votre Panier (HT)</span>
              <button onClick={() => setIsCartOpen(false)} className="text-[10px] font-bold opacity-50">FERMER</button>
            </div>
            
            <div className="max-h-96 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <p className="text-[10px] font-bold text-slate-400 uppercase text-center py-4">Le panier est vide</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="border-b border-slate-100 pb-3">
                    <div className="flex justify-between items-start">
                      <span className="font-black text-xs uppercase">{item.name}</span>
                      <span className="font-black text-xs">{item.price}€ HT</span>
                    </div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{item.details}</p>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 bg-slate-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-black text-xs uppercase">Total HT</span>
                  <span className="font-black text-lg text-blue-600">{totalPriceHT}€ HT</span>
                </div>
                <button 
                  onClick={() => alert('Validation commande...')}
                  className="w-full bg-[#0f092e] text-white py-3 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-colors"
                >
                  Valider la commande
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}