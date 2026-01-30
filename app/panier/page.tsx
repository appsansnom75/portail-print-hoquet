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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const totalHT = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleFinalSubmit = async () => {
    if (!email || !address || !phone) {
      alert("⚠️ Merci de remplir tous les champs de contact (Email, Tel, Adresse).");
      return;
    }

    setIsSubmitting(true);
    let fileUrl = null;

    try {
      // 1. UPLOAD PHOTO
      if (selectedFile) {
        const fileName = `${Date.now()}-${selectedFile.name.replace(/\s/g, '_')}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('briefings')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('briefings')
          .getPublicUrl(fileName);
        
        fileUrl = urlData.publicUrl;
      }

      // 2. PRÉPARATION DES TEXTES POUR LE EXCEL
      // On crée une liste propre des noms et des quantités
      const listeProduits = cart.map(item => item.name).join(', ');
      const listeQuantites = cart.map(item => item.qty).join(', ');

      // 3. ENVOI SUPABASE
      const { error: orderError } = await supabase
        .from('orders')
        .insert([{
          items: cart,               // Garde le JSON pour la sécurité
          produits_liste: listeProduits, // Pour ta colonne PRODUITS
          quantite_liste: listeQuantites, // Pour ta colonne QUANTITÉ
          total_ht: totalHT,
          instructions: instructions,
          file_url: fileUrl,
          client_email: email,       // Pour ta colonne AGENCE
          client_phone: phone,       // Pour ta colonne TÉLÉPHONE
          delivery_address: address,  // Pour ta colonne ADRESSE DE LIVRAISON
          status: 'En attente'
        }]);

      if (orderError) throw orderError;

      setOrderSent(true);
      setShowConfirm(false);
      clearCart();

    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue. Vérifiez que votre table Supabase possède bien toutes les colonnes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- LE RESTE DU RENDU (JSX) RESTE IDENTIQUE À TON CODE ---
  if (orderSent) {
    return (
      <div className="min-h-screen bg-[#0f092e] flex flex-col items-center justify-center text-center p-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/50">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
        </motion.div>
        <h2 className="text-3xl font-black uppercase italic mb-2 text-white tracking-tighter">Commande Transmise</h2>
        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest max-w-xs mb-8">L'imprimeur a bien reçu votre demande sur son tableau de bord.</p>
        <Link href="/" className="bg-white text-[#0f092e] px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Retour Accueil</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans pb-20">
      <header className="py-8 px-6 border-b border-white/5 flex justify-between items-center bg-[#0f092e]/80 backdrop-blur-xl sticky top-0 z-40">
        <Link href="/" className="text-[9px] font-black uppercase text-white/40 hover:text-white transition-colors tracking-[0.2em]">← Continuer mes achats</Link>
        <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 italic">Validation Panier</h1>
        <div className="w-20" />
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          
          <section className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-10 space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-blue-400 italic mb-4">01. Contact & Livraison</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="email" placeholder="VOTRE EMAIL" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] font-black outline-none focus:border-blue-500/50 uppercase" />
              <input type="tel" placeholder="TÉLÉPHONE" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] font-black outline-none focus:border-blue-500/50 uppercase" />
            </div>
            <textarea placeholder="ADRESSE COMPLÈTE DE LIVRAISON" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full h-24 bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] font-black outline-none focus:border-blue-500/50 resize-none uppercase" />
          </section>

          <section className="bg-blue-600/5 border border-blue-500/10 rounded-[40px] p-8 md:p-10">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-blue-400 italic mb-6">02. Espace Personnalisation</h2>
            <textarea 
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Saisissez ici les textes à imprimer..."
              className="w-full h-40 bg-black/40 border border-white/5 rounded-3xl p-6 text-[11px] font-medium text-white/80 outline-none focus:border-blue-500/40 resize-none"
            />
            <div className="mt-8 pt-8 border-t border-white/5">
              <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em]">Logo ou Photo <span className="text-blue-500/50 italic ml-1">(Optionnel)</span></span>
              <input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="block w-full text-[10px] text-white/20 mt-4" />
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-10 rounded-[40px] sticky top-32 shadow-2xl text-[#0f092e]">
            <h2 className="text-[10px] font-black uppercase mb-8">Résumé Devis</h2>
            <div className="flex justify-between text-3xl font-black uppercase border-t border-black/5 pt-6">
              <span className="italic text-xl text-black">Total HT</span>
              <span className="italic">{totalHT.toFixed(2)}€</span>
            </div>
            <button 
              disabled={cart.length === 0}
              onClick={() => setShowConfirm(true)}
              className="w-full mt-10 py-6 bg-[#0f092e] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all"
            >
              Vérifier la Commande
            </button>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0f092e]/95 backdrop-blur-xl">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-white text-[#0f092e] w-full max-w-xl rounded-[50px] p-10 md:p-14 space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-black uppercase italic text-blue-600">Dernier Check</h3>
                <p className="text-[9px] font-bold uppercase opacity-30 mt-2 tracking-widest">Confirmez vos informations</p>
              </div>
              <div className="bg-black/5 p-6 rounded-3xl space-y-2 text-[10px] font-black uppercase italic">
                <p>📍 Adresse : {address}</p>
                <p>📞 Tel : {phone}</p>
                <p>✉️ Mail : {email}</p>
              </div>
              <button 
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700"
              >
                {isSubmitting ? "Envoi..." : "Tout est OK, Envoyer"}
              </button>
              <button onClick={() => setShowConfirm(false)} className="w-full text-[9px] font-black uppercase opacity-30">Modifier mes infos</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}