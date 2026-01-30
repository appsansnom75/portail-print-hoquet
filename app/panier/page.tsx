'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  
  // États pour les infos clients
  const [instructions, setInstructions] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const totalHT = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulation du processus d'envoi
    // 1. Si selectedFile existe -> Logique d'upload Supabase Storage
    // 2. Création de la ligne dans la table 'orders' avec les instructions
    
    setTimeout(() => {
      setIsSubmitting(false);
      setOrderSent(true);
      setShowConfirm(false);
      clearCart();
    }, 2000);
  };

  if (orderSent) {
    return (
      <div className="min-h-screen bg-[#0f092e] flex flex-col items-center justify-center text-center p-6">
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/50"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
        </motion.div>
        <h2 className="text-3xl font-black uppercase italic mb-2 tracking-tighter text-white">Commande Transmise</h2>
        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest max-w-xs mb-8">
          L'équipe Connivence va traiter votre demande et vous envoyer un BAT.
        </p>
        <Link href="/" className="bg-white text-[#0f092e] px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-xl">
          Retour au Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans pb-20">
      
      {/* HEADER NAVIGATION */}
      <header className="py-8 px-6 border-b border-white/5 flex justify-between items-center bg-[#0f092e]/80 backdrop-blur-xl sticky top-0 z-40">
        <Link href="/" className="text-[9px] font-black uppercase text-white/40 hover:text-white transition-colors tracking-[0.2em]">
          ← Continuer mes achats
        </Link>
        <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 italic">Validation Panier</h1>
        <div className="w-20" />
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* COLONNE GAUCHE : RÉCAP ET FORMULAIRE */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* ARTICLES */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">01.</span>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-white/60">Articles sélectionnés</h2>
            </div>
            
            <div className="space-y-3">
              {cart.length === 0 ? (
                <div className="py-16 border border-white/5 rounded-[40px] text-center bg-white/[0.01]">
                  <p className="text-white/20 uppercase font-black text-[9px] tracking-widest italic text-center">Votre panier est vide</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="bg-white/[0.03] border border-white/5 p-6 rounded-[30px] flex items-center justify-between group hover:border-blue-500/20 transition-all">
                    <div>
                      <span className="text-[8px] font-black text-blue-500/60 uppercase tracking-widest">{item.category}</span>
                      <h3 className="text-sm font-black uppercase tracking-tight text-white/90">{item.name}</h3>
                      <p className="text-[9px] text-white/30 font-bold mt-1 uppercase tracking-tighter italic">{item.qty} exemplaires</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="font-black text-sm italic tracking-tighter">{(item.price * item.qty).toFixed(2)}€</span>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500/20 hover:text-red-500 transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* PERSONNALISATION */}
          <section className="bg-blue-600/5 border border-blue-500/10 rounded-[40px] p-8 md:p-10">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-500/40">02.</span>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-blue-400 italic">Espace Personnalisation</h2>
            </div>

            <div className="space-y-8">
              {/* TEXTE */}
              <div className="space-y-4">
                <label className="block">
                  <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em] ml-1">Instructions & Coordonnées</span>
                  <textarea 
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Saisissez ici les textes à imprimer (Noms, adresses, téléphone...)"
                    className="w-full h-40 bg-black/40 border border-white/5 rounded-3xl p-6 text-[11px] font-medium text-white/80 outline-none focus:border-blue-500/40 transition-all placeholder:text-white/5 resize-none mt-3"
                  />
                </label>
              </div>

              {/* UPLOAD PHOTO OPTIONNEL */}
              <div className="pt-8 border-t border-white/5">
                <div className="flex justify-between items-center mb-4 px-1">
                  <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em]">Logo ou Photo <span className="text-blue-500/50 italic ml-1">(Optionnel)</span></span>
                </div>
                
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*,.pdf"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  <div className="w-full py-10 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-4 group-hover:bg-white/[0.02] group-hover:border-blue-500/20 transition-all">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white/20 group-hover:text-blue-400 group-hover:scale-110 transition-all">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                      {selectedFile ? `Fichier prêt : ${selectedFile.name}` : "Déposer un fichier"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* COLONNE DROITE : RÉSUMÉ FIXE */}
        <div className="lg:col-span-1">
          <div className="bg-white p-10 rounded-[40px] sticky top-32 shadow-2xl text-[#0f092e] overflow-hidden">
            {/* Décoration subtile */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16" />
            
            <h2 className="text-[10px] font-black uppercase tracking-widest border-b border-black/5 pb-6 mb-8 relative">Résumé Devis</h2>
            
            <div className="space-y-5 relative">
              <div className="flex justify-between text-[11px] font-bold uppercase opacity-40 italic">
                <span>Total Articles</span>
                <span>{totalHT.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-3xl font-black uppercase border-t border-black/5 pt-6">
                <span className="tracking-tighter italic text-xl">Total HT</span>
                <span className="tracking-tighter italic">{totalHT.toFixed(2)}€</span>
              </div>
            </div>

            <button 
              disabled={cart.length === 0}
              onClick={() => setShowConfirm(true)}
              className="w-full mt-10 py-6 bg-[#0f092e] text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-20 disabled:grayscale"
            >
              Vérifier la Commande
            </button>
            
            <p className="text-center text-[8px] font-black text-black/20 uppercase mt-8 tracking-widest italic">
              Confirmation immédiate par mail
            </p>
          </div>
        </div>
      </main>

      {/* DOUBLE CONFIRMATION MODALE */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              className="absolute inset-0 bg-[#0f092e]/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              className="relative bg-white text-[#0f092e] w-full max-w-xl rounded-[50px] shadow-2xl overflow-hidden"
            >
              <div className="p-10 md:p-14 space-y-8">
                <div className="text-center">
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter text-blue-600">Dernière relecture</h3>
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-30 mt-2">Vérifiez vos informations avant l'envoi</p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-black/5 p-6 rounded-3xl">
                    <p className="text-[9px] font-black uppercase opacity-40 mb-3 tracking-widest italic">Résumé des articles :</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-4 scrollbar-hide">
                      {cart.map((item, i) => (
                        <div key={i} className="flex justify-between text-[11px] font-bold uppercase italic">
                          <span>{item.name} <span className="opacity-40 ml-1">x{item.qty}</span></span>
                          <span>{(item.price * item.qty).toFixed(2)}€</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-black/5 p-6 rounded-3xl">
                    <p className="text-[9px] font-black uppercase opacity-40 mb-3 tracking-widest italic text-blue-600">Vos Instructions :</p>
                    <p className="text-[11px] font-bold leading-relaxed">
                      {instructions ? instructions : "Aucune instruction spécifique renseignée."}
                    </p>
                  </div>

                  {selectedFile && (
                    <div className="flex items-center gap-2 px-6">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span className="text-[9px] font-black uppercase opacity-40 tracking-widest italic">1 fichier joint : {selectedFile.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4 pt-4">
                  <button 
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all"
                  >
                    {isSubmitting ? "Transmission en cours..." : "Confirmer et Envoyer"}
                  </button>
                  <button 
                    onClick={() => setShowConfirm(false)}
                    className="w-full py-2 text-[9px] font-black uppercase opacity-30 hover:opacity-100 transition-all tracking-widest"
                  >
                    Retour pour modification
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}