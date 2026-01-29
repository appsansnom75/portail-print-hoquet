'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export default function PanierPage() {
  // Simulation des articles dans le panier
  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Panneaux A Vendre - Akilux 3.5mm", price: 12.50, qty: 10, category: "Produit Standard" },
    { id: 2, name: "Cartes de visite - Repiquage", price: 45.00, qty: 1, category: "Sur-Mesure" },
  ]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tva = subtotal * 0.20;
  const total = subtotal + tva;

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans flex flex-col">
      {/* --- HEADER --- */}
      <header className="py-6 px-6 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-all">
            ← Retour Boutique
          </Link>
          <img src="/logo-hoquet.png" alt="Guy Hoquet" className="h-6 opacity-80" />
        </div>
      </header>

      <main className="flex-grow py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl font-black uppercase tracking-tighter">Votre <span className="text-white/20">Sélection</span></h1>
            <div className="h-1 w-12 bg-white/10 mt-4"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* --- LISTE DES PRODUITS (Gauche) --- */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white/[0.03] border border-white/5 p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/[0.05] transition-all">
                  <div className="flex flex-col items-center md:items-start">
                    <span className="text-[7px] font-bold text-white/30 uppercase tracking-widest mb-1">{item.category}</span>
                    <h3 className="text-xs font-black uppercase tracking-widest">{item.name}</h3>
                  </div>

                  <div className="flex items-center gap-10">
                    <div className="flex items-center gap-4 border border-white/10 px-3 py-1">
                      <button className="text-white/30 hover:text-white text-lg">-</button>
                      <span className="text-[10px] font-black w-4 text-center">{item.qty}</span>
                      <button className="text-white/30 hover:text-white text-lg">+</button>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <p className="text-[11px] font-black tracking-tight">{(item.price * item.qty).toFixed(2)}€</p>
                      <p className="text-[8px] text-white/20 uppercase font-bold">HT</p>
                    </div>
                    <button className="text-red-500/30 hover:text-red-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* --- RÉSUMÉ (Droite) --- */}
            <div className="space-y-4">
              <div className="bg-white/10 border border-white/20 p-8">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-b border-white/10 pb-4 text-white/50">Résumé Commande</h2>
                
                <div className="space-y-4 text-[10px] font-bold uppercase tracking-widest">
                  <div className="flex justify-between">
                    <span className="text-white/40">Total HT</span>
                    <span>{subtotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">TVA (20%)</span>
                    <span>{tva.toFixed(2)} €</span>
                  </div>
                  <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                    <span className="text-white/40">Total TTC</span>
                    <span className="text-2xl font-black tracking-tighter text-white">{total.toFixed(2)} €</span>
                  </div>
                </div>

                <button className="w-full bg-white text-[#0f092e] font-black uppercase text-[10px] tracking-[0.2em] py-5 mt-10 hover:bg-white/90 transition-all active:scale-[0.98]">
                  Valider la commande
                </button>
              </div>

              <div className="p-4 border border-white/5 bg-black/20">
                <p className="text-[7px] font-black uppercase tracking-widest text-white/20 text-center leading-relaxed">
                  Livraison estimée : 3 à 5 jours ouvrés <br/> Facturation centralisée Agence.
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="py-8 border-t border-white/5 bg-black/5 opacity-50">
        <p className="text-[7px] font-black uppercase tracking-[0.4em] text-white/10 text-center">
          © 2026 IMPRIMERIE CONNIVENCE POUR GUY HOQUET IMMOBILIER.
        </p>
      </footer>
    </div>
  );
}