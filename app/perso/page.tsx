'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export default function PersoPage() {
  // --- ÉTATS POUR LE PANIER ---
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // --- ÉTATS POUR LES OPTIONS PRODUITS ---
  const [voeuxVernis, setVoeuxVernis] = useState('sans');
  const [voeuxEnveloppe, setVoeuxEnveloppe] = useState(false);
  const [voeuxLot, setVoeuxLot] = useState(1);
  const [agendaLot, setAgendaLot] = useState(1);

  // Simulation de prix unitaires HT (visibles uniquement dans le panier)
  const prices = {
    voeux: 2.50, // Prix unitaire
    enveloppe: 0.50,
    agenda: 12.00
  };

  const addToCart = (productName: string, unitPrice: number, quantity: number, options: string) => {
    const newItem = {
      id: Date.now(),
      name: productName,
      quantity: quantity,
      unitPrice: unitPrice,
      totalPrice: unitPrice * quantity,
      details: options
    };
    setCart([...cart, newItem]);
    setIsCartOpen(true);
  };

  const totalPriceHT = cart.reduce((acc, item) => acc + item.totalPrice, 0);

  // Options de lots
  const lotOptions = [1, 5, 10, 50, 100];

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans flex flex-col relative">
      
      {/* HEADER */}
      <header className="py-6 px-6 border-b border-white/10 flex justify-between items-center bg-[#0f092e]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">
          ← Retour Accueil
        </Link>
        <h1 className="text-xs font-black uppercase tracking-[0.3em]">Produits Personnalisables</h1>
        <div className="w-20"></div>
      </header>

      <main className="max-w-6xl mx-auto w-full py-12 px-6 pb-40">
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Personnalisation</h2>
          <p className="text-blue-300/60 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Configuration des lots et finitions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* 1. CARTE DE VOEUX */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="h-40 bg-slate-800 flex items-center justify-center font-black text-white/5 uppercase tracking-widest text-xs">Visuel Vœux</div>
            <div className="p-8">
              <h3 className="font-black text-2xl uppercase tracking-tight mb-6">Carte de Vœux 2026</h3>
              
              <div className="space-y-3 mb-6">
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Finition</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setVoeuxVernis('sans')} className={`p-3 rounded-lg border text-[10px] font-black uppercase transition-all ${voeuxVernis === 'sans' ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-white/10 bg-white/5'}`}>Sans Vernis</button>
                  <button onClick={() => setVoeuxVernis('clear')} className={`p-3 rounded-lg border text-[10px] font-black uppercase transition-all ${voeuxVernis === 'clear' ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-white/10 bg-white/5'}`}>Vernis Clear</button>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-3">Quantité (Nombre de lots)</p>
                <select 
                  value={voeuxLot} 
                  onChange={(e) => setVoeuxLot(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-[10px] font-black uppercase outline-none focus:border-blue-500"
                >
                  {lotOptions.map(qty => <option key={qty} value={qty} className="bg-[#0f092e] text-white">Lot de {qty}</option>)}
                </select>
              </div>

              <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer mb-8 transition-all ${voeuxEnveloppe ? 'border-green-500 bg-green-500/10' : 'border-white/10 bg-white/5'}`}>
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={voeuxEnveloppe} onChange={() => setVoeuxEnveloppe(!voeuxEnveloppe)} className="accent-green-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Option Enveloppes 16x16</span>
                </div>
              </label>

              <button 
                onClick={() => addToCart("Carte de Voeux", prices.voeux + (voeuxEnveloppe ? prices.enveloppe : 0), voeuxLot, `Vernis: ${voeuxVernis}`)}
                className="w-full bg-white text-[#0f092e] py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all"
              >
                Ajouter au panier
              </button>
            </div>
          </div>

          {/* 2. AGENDAS */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="h-40 bg-slate-800 flex items-center justify-center font-black text-white/5 uppercase tracking-widest text-xs">Visuel Agenda</div>
            <div className="p-8 flex-grow">
              <h3 className="font-black text-2xl uppercase tracking-tight mb-6">Agendas Agence</h3>
              
              <div className="mb-6">
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-3">Quantité (Nombre de lots)</p>
                <select 
                  value={agendaLot} 
                  onChange={(e) => setAgendaLot(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-[10px] font-black uppercase outline-none focus:border-blue-500"
                >
                  {lotOptions.map(qty => <option key={qty} value={qty} className="bg-[#0f092e] text-white">Lot de {qty}</option>)}
                </select>
              </div>

              <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/20 mb-8">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Finition unique : Couverture Rigide</p>
              </div>

              <button 
                onClick={() => addToCart("Agenda Agence", prices.agenda, agendaLot, "Couverture Rigide")}
                className="w-full bg-white text-[#0f092e] py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all"
              >
                Ajouter au panier
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* --- MON PANIER (BAS À GAUCHE) --- */}
      <div className="fixed bottom-8 left-8 z-[100]">
        <button 
          onClick={() => setIsCartOpen(!isCartOpen)}
          className="flex items-center gap-4 group"
        >
          <div className="bg-white text-[#0f092e] px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl hover:bg-blue-600 hover:text-white transition-all flex items-center gap-3">
            Mon Panier
            {cart.length > 0 && <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-[9px]">{cart.length}</span>}
          </div>
        </button>

        {/* RÉCAPITULATIF PANIER */}
        {isCartOpen && (
          <div className="absolute bottom-16 left-0 w-80 bg-white rounded-2xl shadow-2xl text-[#0f092e] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
              <span className="font-black text-[10px] uppercase tracking-widest">Récapitulatif (HT)</span>
              <button onClick={() => setIsCartOpen(false)} className="text-[10px] font-black text-red-500">FERMER</button>
            </div>
            
            <div className="max-h-80 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <p className="text-[10px] font-bold text-slate-400 uppercase text-center py-4">Panier vide</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="border-b border-slate-100 pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="font-black text-[11px] uppercase">{item.name}</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">Quantité : {item.quantity}</span>
                      </div>
                      <span className="font-black text-[11px]">{item.totalPrice.toFixed(2)}€ HT</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 bg-slate-50 border-t border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-black text-[10px] uppercase text-slate-400">Total Commande</span>
                  <span className="font-black text-xl text-blue-600">{totalPriceHT.toFixed(2)}€ HT</span>
                </div>
                <button className="w-full bg-[#0f092e] text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all">
                  Valider et Payer
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}