'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [instructions, setInstructions] = useState("");

  const totalHT = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleFinalSubmit = async () => {
    // On vérifie juste que les infos de contact sont là
    if (!email || !address || !phone) {
      alert("⚠️ Merci de remplir Email, Téléphone et Adresse.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Préparation des listes pour le Excel
      const listeProduits = cart.map(item => item.name).join(', ');
      const listeQuantites = cart.map(item => item.qty).join(', ');

      const { error: orderError } = await supabase
        .from('orders')
        .insert([{
          client_email: email,
          client_phone: phone,
          delivery_address: address,
          produits_liste: listeProduits,
          quantite_liste: listeQuantites,
          total_ht: totalHT,
          instructions: instructions,
          status: 'En attente'
        }]);

      if (orderError) throw orderError;

      setOrderSent(true);
      setShowConfirm(false);
      clearCart();

    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'envoi. Vérifiez votre connexion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSent) {
    return (
      <div className="min-h-screen bg-[#0f092e] flex flex-col items-center justify-center text-center p-6 italic font-black uppercase text-white">
        <h2 className="text-4xl mb-4">Commande Envoyée !</h2>
        <p className="text-blue-500 text-xs tracking-widest mb-12 text-center">L'imprimeur a reçu votre demande.</p>
        <Link href="/" className="bg-white text-[#0f092e] px-10 py-5 rounded-full text-[10px]">Retour</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans pb-20">
      <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          
          {/* CONTACT */}
          <section className="bg-white/5 border border-white/10 rounded-[40px] p-8 space-y-4">
            <h2 className="text-[10px] font-black uppercase text-blue-400 italic mb-4">01. Infos Livraison</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="email" placeholder="VOTRE EMAIL" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] font-black outline-none focus:border-blue-500/50 uppercase" />
              <input type="tel" placeholder="TÉLÉPHONE" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] font-black outline-none focus:border-blue-500/50 uppercase" />
            </div>
            <textarea placeholder="ADRESSE DE LIVRAISON" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full h-24 bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] font-black outline-none focus:border-blue-500/50 resize-none uppercase" />
          </section>

          {/* INSTRUCTIONS */}
          <section className="bg-blue-600/5 border border-blue-500/10 rounded-[40px] p-8">
            <h2 className="text-[10px] font-black uppercase text-blue-400 italic mb-4">02. Instructions</h2>
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Textes à imprimer, détails, précisions..." className="w-full h-32 bg-black/40 border border-white/5 rounded-3xl p-6 text-[11px] text-white/80 outline-none focus:border-blue-500/40 resize-none uppercase" />
          </section>
        </div>

        {/* RÉSUMÉ */}
        <div className="lg:col-span-1">
          <div className="bg-white p-10 rounded-[40px] text-[#0f092e]">
            <h2 className="text-[10px] font-black uppercase mb-4">Total HT</h2>
            <span className="text-4xl font-black italic">{totalHT.toFixed(2)}€</span>
            <button onClick={() => setShowConfirm(true)} className="w-full mt-10 py-6 bg-[#0f092e] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600">
              Vérifier
            </button>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0f092e]/95 backdrop-blur-xl">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white text-[#0f092e] w-full max-w-lg rounded-[40px] p-10 space-y-6">
              <h3 className="text-2xl font-black uppercase italic text-center">Tout est bon ?</h3>
              <div className="text-[10px] font-bold uppercase space-y-2 opacity-60">
                <p>📍 {address}</p>
                <p>📞 {phone}</p>
                <p>✉️ {email}</p>
              </div>
              <button onClick={handleFinalSubmit} disabled={isSubmitting} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px]">
                {isSubmitting ? "Envoi..." : "Confirmer et Envoyer"}
              </button>
              <button onClick={() => setShowConfirm(false)} className="w-full text-[9px] font-black uppercase opacity-20 text-center">Modifier</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}