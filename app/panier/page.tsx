'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSent, setOrderSent] = useState(false);

  // Calculs
  const totalHT = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tva = totalHT * 0.20;
  const totalTTC = totalHT + tva;

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    
    // 1. Simulation d'envoi ou enregistrement dans Supabase
    // On pourrait créer une table 'orders' ici
    
    setTimeout(() => {
      setIsSubmitting(false);
      setOrderSent(true);
      clearCart();
    }, 2000);
  };

  if (orderSent) {
    return (
      <div className="min-h-screen bg-[#0f092e] flex flex-col items-center justify-center text-center p-6">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/50">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <h2 className="text-3xl font-black uppercase italic italic mb-2">Commande Envoyée !</h2>
        <p className="text-white/40 text-sm max-w-md mb-8">Votre demande a été transmise à l'Imprimerie Connivence. Vous allez recevoir un récapitulatif par email.</p>
        <Link href="/" className="bg-blue-600 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans">
      <header className="py-10 px-6 border-b border-white/5 flex justify-between items-center bg-black/20">
        <Link href="/" className="text-[10px] font-black uppercase text-white/40 hover:text-white transition-colors">← Continuer mes achats</Link>
        <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 italic">Mon Panier</h1>
        <div className="w-20"></div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        {/* LISTE DES PRODUITS */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-white/20 mb-8">Articles sélectionnés</h2>
          
          {cart.length === 0 ? (
            <div className="py-20 border-2 border-dashed border-white/5 rounded-[40px] text-center">
              <p className="text-white/20 uppercase font-black text-[10px] tracking-widest">Votre panier est vide</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="bg-white/[0.03] border border-white/5 p-6 rounded-[30px] flex items-center justify-between group hover:border-white/10 transition-all">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-1">{item.category}</span>
                  <span className="text-sm font-black uppercase tracking-tight">{item.name}</span>
                  <span className="text-[10px] text-white/40 mt-1">Quantité : {item.qty} ex.</span>
                </div>
                <div className="flex items-center gap-8">
                  <span className="font-black text-sm">{(item.price * item.qty).toFixed(2)}€</span>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500/30 hover:text-red-500 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* RÉSUMÉ ET VALIDATION */}
        <div className="lg:col-span-1">
          <div className="bg-white text-[#0f092e] p-8 rounded-[40px] sticky top-32 shadow-2xl">
            <h2 className="text-[10px] font-black uppercase tracking-widest mb-8 border-b border-black/10 pb-4">Résumé Commande</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-[11px] font-bold uppercase opacity-60">
                <span>Total HT</span>
                <span>{totalHT.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold uppercase opacity-60">
                <span>TVA (20%)</span>
                <span>{tva.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-xl font-black uppercase border-t border-black/10 pt-4">
                <span>Total TTC</span>
                <span>{totalTTC.toFixed(2)}€</span>
              </div>
            </div>

            {/* ZONE UPLOAD (SIMPLE INPUT POUR L'INSTANT) */}
            <div className="mb-8 p-4 bg-black/5 rounded-2xl border border-black/5">
              <p className="text-[8px] font-black uppercase mb-3">Fichier de personnalisation :</p>
              <input type="file" className="text-[9px] font-bold file:bg-blue-600 file:text-white file:border-none file:px-3 file:py-1 file:rounded-md file:mr-3 cursor-pointer" />
            </div>

            <button 
              disabled={cart.length === 0 || isSubmitting}
              onClick={handleSubmitOrder}
              className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-blue-500/20 ${
                isSubmitting ? 'bg-gray-200 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
              }`}
            >
              {isSubmitting ? 'Traitement...' : 'Valider la commande'}
            </button>
            
            <p className="text-[7px] text-center mt-6 font-bold uppercase opacity-40 leading-relaxed">
              En validant, vous recevrez un bon à tirer (BAT) sous 24h ouvrées.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}