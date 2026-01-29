'use client';
import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function PanierPage() {
  const { cart, removeFromCart } = useCart();

  // Le sous-total multiplie le prix unitaire par la quantité cumulée (ex: 1000 ex)
  const subtotal = cart.reduce((acc, item) => acc + (Number(item.price) * Number(item.qty)), 0);
  const tva = subtotal * 0.20;
  const total = subtotal + tva;

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans flex flex-col">
      <header className="py-6 px-6 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors">
            ← Retour Catalogue
          </Link>
          <img src="/logo-hoquet.png" alt="Guy Hoquet" className="h-6 opacity-80" />
        </div>
      </header>

      <main className="flex-grow py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-12">
            Votre <span className="text-white/20">Sélection</span>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-4">
              {cart.length === 0 ? (
                <div className="p-20 border border-dashed border-white/10 rounded-3xl text-center">
                  <p className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-6">Votre panier est vide</p>
                  <Link href="/" className="inline-block bg-white/5 border border-white/10 px-8 py-3 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                    Parcourir le catalogue
                  </Link>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:border-white/20">
                    <div className="flex flex-col items-center md:items-start">
                      <span className="text-[7px] font-bold text-white/30 uppercase mb-1 tracking-[0.2em]">{item.category}</span>
                      <h3 className="text-xs font-black uppercase tracking-widest text-center md:text-left">{item.name}</h3>
                    </div>

                    <div className="flex items-center gap-10">
                      {/* AFFICHAGE DES EXEMPLAIRES (ex: 1000 ex.) */}
                      <div className="bg-black/20 border border-white/10 rounded-full px-6 py-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                          {item.qty} ex.
                        </span>
                      </div>

                      <div className="text-right min-w-[100px]">
                        <p className="text-sm font-black tracking-tight">
                          {(Number(item.price) * Number(item.qty)).toFixed(2)}€
                        </p>
                        <p className="text-[8px] text-white/20 font-bold uppercase tracking-tighter">HT</p>
                      </div>

                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500/30 hover:text-red-500 transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="relative">
              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl sticky top-32">
                <h2 className="text-[10px] font-black uppercase tracking-widest mb-8 border-b border-white/5 pb-4 text-white/40 text-center">Résumé HT</h2>
                
                <div className="space-y-4 text-[10px] font-bold uppercase tracking-widest">
                  <div className="flex justify-between text-white/40">
                    <span>Sous-total</span>
                    <span>{subtotal.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-white/40">
                    <span>TVA (20%)</span>
                    <span>{tva.toFixed(2)}€</span>
                  </div>
                  
                  <div className="pt-8 mt-4 border-t border-white/10 flex justify-between items-end">
                    <span className="text-3xl font-black text-white leading-none tracking-tighter">{total.toFixed(2)}€</span>
                  </div>
                </div>

                <button 
                  disabled={cart.length === 0}
                  className="w-full bg-white text-[#0f092e] font-black uppercase text-[10px] tracking-[0.2em] py-5 mt-10 rounded-2xl hover:bg-green-500 hover:text-white transition-all disabled:opacity-20 shadow-2xl active:scale-95"
                >
                  Envoyer la commande
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}