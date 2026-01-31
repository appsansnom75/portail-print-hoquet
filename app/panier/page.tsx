'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
// On importe la liste des agences
import { AGENCIES } from '@/lib/agencies'; 

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  
  // Nouveaux états pour Agence et Utilisateur
  const [selectedAgency, setSelectedAgency] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  
  // On garde les anciens (address sera rempli auto)
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [instructions, setInstructions] = useState("");

  const totalHT = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  // Fonction magique : Quand on change d'agence
  const handleAgencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const agencyName = e.target.value;
    setSelectedAgency(agencyName);
    
    // On trouve l'adresse correspondante et on l'injecte
    const agencyData = AGENCIES.find(a => a.name === agencyName);
    if (agencyData) {
      setAddress(agencyData.address);
      setSelectedUser(""); // On reset l'utilisateur si on change d'agence
    }
  };

  const handleFinalSubmit = async () => {
    if (!selectedAgency || !selectedUser || !email || !address || !phone) {
      alert("⚠️ Merci de sélectionner une Agence, un Utilisateur et remplir les contacts.");
      return;
    }

    setIsSubmitting(true);

    try {
      const listeProduits = cart.map(item => item.name).join(', ');
      const listeQuantites = cart.map(item => item.qty).join(', ');

      const { error: orderError } = await supabase
        .from('orders')
        .insert([{
          agency_name: selectedAgency, // Nouvelle colonne
          client_email: email, // On utilisera ça comme identifiant utilisateur aussi si besoin
          client_phone: phone,
          delivery_address: address,
          produits_liste: listeProduits,
          quantite_liste: listeQuantites,
          total_ht: totalHT,
          instructions: `Commandé par : ${selectedUser} - ${instructions}`, // On ajoute le user dans les notes
          status: 'En attente'
        }]);

      if (orderError) throw orderError;

      setOrderSent(true);
      setShowConfirm(false);
      clearCart();

    } catch (error) {
      console.error(error);
      alert("Erreur technique. Vérifiez Supabase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSent) {
    return (
      <div className="min-h-screen bg-[#0f092e] flex flex-col items-center justify-center text-center p-6 italic font-black uppercase text-white">
        <h2 className="text-4xl mb-4">Commande Reçue !</h2>
        <p className="text-blue-500 text-xs tracking-widest mb-12 text-center">Merci à l'équipe {selectedAgency}</p>
        <Link href="/" className="bg-white text-[#0f092e] px-10 py-5 rounded-full text-[10px]">Retour à l'accueil</Link>
      </div>
    );
  }

  // Helper pour trouver les utilisateurs de l'agence sélectionnée
  const currentAgencyUsers = AGENCIES.find(a => a.name === selectedAgency)?.users || [];

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans pb-20">
      <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          
          {/* SÉLECTION AGENCE (NOUVEAU) */}
          <section className="bg-blue-600/10 border border-blue-500/20 rounded-[40px] p-8 space-y-4">
             <h2 className="text-[10px] font-black uppercase text-blue-400 italic mb-2">01. Identification</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Selecteur d'Agence */}
                <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase opacity-50 ml-2">Agence</label>
                    <select 
                        value={selectedAgency} 
                        onChange={handleAgencyChange}
                        className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] font-black outline-none focus:border-blue-500/50 uppercase appearance-none text-white"
                    >
                        <option value="">-- Choisir l'agence --</option>
                        {AGENCIES.map((agency) => (
                            <option key={agency.name} value={agency.name}>{agency.name}</option>
                        ))}
                    </select>
                </div>

                {/* Selecteur d'Utilisateur (Apparaît seulement si agence choisie) */}
                <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase opacity-50 ml-2">Utilisateur</label>
                    <select 
                        value={selectedUser} 
                        onChange={(e) => setSelectedUser(e.target.value)}
                        disabled={!selectedAgency}
                        className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] font-black outline-none focus:border-blue-500/50 uppercase appearance-none text-white disabled:opacity-30"
                    >
                        <option value="">-- Qui commande ? --</option>
                        {currentAgencyUsers.map((user) => (
                            <option key={user} value={user}>{user}</option>
                        ))}
                    </select>
                </div>
             </div>
          </section>

          {/* LISTE PRODUITS */}
          <section className="bg-white/5 border border-white/10 rounded-[40px] p-8">
             <h2 className="text-[10px] font-black uppercase text-blue-400 italic mb-6">02. Votre Panier</h2>
             <div className="space-y-4">
                {cart.length === 0 ? <p className="text-[10px] opacity-40 uppercase">Vide.</p> : cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-black uppercase">{item.name}</span>
                        <span className="text-[10px] text-white/50 uppercase font-bold">x{item.qty}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[12px] font-bold">{(item.price * item.qty).toFixed(2)}€</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-[10px] text-red-500 hover:text-red-400 font-bold">(X)</button>
                      </div>
                    </div>
                ))}
             </div>
          </section>

          {/* INFOS LIVRAISON (Pré-remplies mais modifiables) */}
          <section className="bg-white/5 border border-white/10 rounded-[40px] p-8 space-y-4">
            <h2 className="text-[10px] font-black uppercase text-blue-400 italic mb-4">03. Livraison & Contact</h2>
            <textarea 
                placeholder="ADRESSE DE LIVRAISON" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                className="w-full h-24 bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] font-black outline-none focus:border-blue-500/50 resize-none uppercase text-white" 
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="email" placeholder="EMAIL DE SUIVI" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] font-black outline-none focus:border-blue-500/50 uppercase" />
              <input type="tel" placeholder="TÉLÉPHONE" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] font-black outline-none focus:border-blue-500/50 uppercase" />
            </div>
          </section>

          {/* INSTRUCTIONS */}
          <section className="bg-blue-600/5 border border-blue-500/10 rounded-[40px] p-8">
            <h2 className="text-[10px] font-black uppercase text-blue-400 italic mb-4">04. Notes</h2>
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Infos supplémentaires..." className="w-full h-20 bg-black/40 border border-white/5 rounded-3xl p-6 text-[11px] text-white/80 outline-none focus:border-blue-500/40 resize-none uppercase" />
          </section>
        </div>

        {/* TOTAL GAUCHE */}
        <div className="lg:col-span-1">
          <div className="bg-white p-10 rounded-[40px] text-[#0f092e] sticky top-10">
            <h2 className="text-[10px] font-black uppercase mb-4">Total HT</h2>
            <span className="text-4xl font-black italic">{totalHT.toFixed(2)}€</span>
            <button onClick={() => setShowConfirm(true)} disabled={cart.length === 0 || !selectedAgency} className="w-full mt-10 py-6 bg-[#0f092e] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
              {!selectedAgency ? "Choisir Agence" : "Vérifier"}
            </button>
          </div>
        </div>
      </main>

      {/* MODAL DE CONFIRMATION */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0f092e]/95 backdrop-blur-xl">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white text-[#0f092e] w-full max-w-lg rounded-[40px] p-10 space-y-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-black uppercase italic text-center">Récapitulatif</h3>
              
              <div className="bg-gray-100 rounded-2xl p-6 text-center">
                 <p className="text-[10px] font-black uppercase mb-2">Agence : {selectedAgency}</p>
                 <p className="text-[10px] uppercase opacity-60">Utilisateur : {selectedUser}</p>
              </div>

              <div className="text-[10px] font-bold uppercase space-y-2 opacity-60 text-center border-t border-b border-gray-200 py-4">
                <p>📍 {address}</p>
                <div className="flex justify-center gap-4">
                    <p>📞 {phone}</p>
                    <p>✉️ {email}</p>
                </div>
              </div>

               <div className="text-center">
                    <span className="text-4xl font-black italic">{totalHT.toFixed(2)}€</span>
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