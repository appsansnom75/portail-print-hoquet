'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  
  const [agencyData, setAgencyData] = useState<{name: string, address: string} | null>(null);
  const [membres, setMembres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [instructions, setInstructions] = useState("");

  const totalHT = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase.from('profiles').select('agency_id, first_name, last_name, email').eq('id', user.id).single();

      if (profile?.agency_id) {
        const { data: agency } = await supabase.from('agencies').select('name, address').eq('id', profile.agency_id).single();
        if (agency) { setAgencyData(agency); setAddress(agency.address); }
        const { data: team } = await supabase.from('profiles').select('full_name, first_name, last_name, email, phone').eq('agency_id', profile.agency_id).order('first_name', { ascending: true });
        setMembres(team || []);
        setSelectedUser(`${profile.first_name} ${profile.last_name}`);
        setEmail(profile.email || "");
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleFinalSubmit = async () => {
    if (!agencyData || !selectedUser || !email || !address || !phone) {
      alert("⚠️ Merci de remplir tous les champs de contact.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('orders').insert([{
        agency_name: agencyData.name,
        client_email: email,
        client_phone: phone,
        delivery_address: address,
        produits_liste: cart.map(item => item.name).join(', '),
        quantite_liste: cart.map(item => item.qty).join(', '),
        total_ht: totalHT,
        instructions: `Commandé par : ${selectedUser} -- ${instructions}`,
        status: 'En attente'
      }]);
      if (error) throw error;
      setOrderSent(true);
      setShowConfirm(false);
      clearCart();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0f092e] flex items-center justify-center text-white font-black uppercase text-[10px] animate-pulse">Chargement profil...</div>;

  if (orderSent) return (
    <div className="min-h-screen bg-[#0f092e] flex flex-col items-center justify-center text-center p-6 italic font-black uppercase text-white">
      <h2 className="text-4xl mb-4 text-blue-500 text-center">Commande Reçue !</h2>
      <p className="text-white/40 text-[10px] tracking-[0.3em] mb-12 text-center uppercase">L'équipe production a été notifiée.</p>
      <Link href="/" className="bg-white text-[#0f092e] px-10 py-5 rounded-full text-[10px] hover:bg-blue-500 hover:text-white transition-all">Retour Boutique</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans pb-20">
      <header className="py-8 px-6 max-w-6xl mx-auto flex justify-between items-center border-b border-white/10 mb-10">
          <Link href="/" className="text-[10px] font-black uppercase opacity-40 hover:opacity-100 transition-all flex items-center gap-2">
            ← Retour Boutique
          </Link>
          <h1 className="text-[10px] font-black uppercase tracking-widest italic text-blue-500">Validation Panier</h1>
          <div className="w-10"></div>
      </header>

      <main className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECTION 01 : IDENTIFICATION */}
          <section className="bg-blue-600/10 border border-blue-500/20 rounded-[40px] p-8 space-y-4">
             <h2 className="text-[10px] font-black uppercase text-blue-400 italic mb-2">01. Identification</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase opacity-50 ml-2">Votre Agence</label>
                    <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[11px] font-black text-blue-400 uppercase tracking-tight">{agencyData?.name}</div>
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase opacity-50 ml-2">Qui commande ?</label>
                    <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] font-black outline-none focus:border-blue-500/50 uppercase appearance-none text-white cursor-pointer">
                        {membres.map((m, idx) => <option key={idx} value={m.full_name || `${m.first_name} ${m.last_name}`}>{m.full_name || `${m.first_name} ${m.last_name}`}</option>)}
                    </select>
                </div>
             </div>
          </section>

          {/* SECTION 02 : PANIER */}
          <section className="bg-white/5 border border-white/10 rounded-[40px] p-8">
             <h2 className="text-[10px] font-black uppercase text-blue-400 italic mb-6">02. Votre Panier</h2>
             <div className="space-y-4">
                {cart.length === 0 ? <p className="text-[10px] opacity-40 uppercase">Votre panier est vide.</p> : cart.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
                      <div className="flex flex-col">
                        <span className={`text-[12px] font-black uppercase tracking-tight ${item.color || 'text-white'}`}>{item.name}</span>
                        <span className="text-[10px] text-white/50 uppercase font-bold">x{item.qty} exemplaires</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[12px] font-bold">{(item.price * item.qty).toFixed(2)}€</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-[10px] text-red-500 font-bold hover:scale-110 transition-transform">(X)</button>
                      </div>
                    </div>
                ))}
             </div>
          </section>

          {/* SECTION 03 : LIVRAISON */}
          <section className="bg-white/5 border border-white/10 rounded-[40px] p-8 space-y-4">
            <h2 className="text-[10px] font-black uppercase text-blue-400 italic mb-4">03. Livraison & Contact</h2>
            <textarea placeholder="ADRESSE DE LIVRAISON" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full h-24 bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] font-black outline-none focus:border-blue-500/50 resize-none uppercase text-white tracking-widest" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="email" placeholder="EMAIL DE SUIVI" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] font-black outline-none focus:border-blue-500/50 uppercase text-white" />
              <input type="tel" placeholder="TÉLÉPHONE" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] font-black outline-none focus:border-blue-500/50 uppercase text-white" />
            </div>
          </section>

          {/* SECTION 04 : NOTES */}
          <section className="bg-blue-600/5 border border-blue-500/10 rounded-[40px] p-8">
            <h2 className="text-[10px] font-black uppercase text-blue-400 italic mb-4">04. Notes pour l'imprimeur</h2>
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Précisez ici toute information utile (finition, urgence, etc.)" className="w-full h-20 bg-black/40 border border-white/5 rounded-3xl p-6 text-[11px] text-white/80 outline-none focus:border-blue-500/40 resize-none uppercase italic" />
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-10 rounded-[40px] text-[#0f092e] sticky top-10 shadow-2xl text-center">
            <h2 className="text-[10px] font-black uppercase mb-4 opacity-40 italic tracking-widest">Total à régler HT</h2>
            <span className="text-5xl font-black italic tracking-tighter leading-none">{totalHT.toFixed(2)}€</span>
            <button 
              onClick={() => setShowConfirm(true)} 
              disabled={cart.length === 0} 
              className="w-full mt-10 py-6 bg-[#0f092e] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-20 shadow-xl"
            >
              Vérifier la commande
            </button>
          </div>
        </div>
      </main>

      {/* MODAL DE CONFIRMATION */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0f092e]/95 backdrop-blur-xl">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white text-[#0f092e] w-full max-w-lg rounded-[40px] p-10 space-y-6 shadow-2xl">
              <h3 className="text-2xl font-black uppercase italic text-center text-blue-600">Confirmer ?</h3>
              <div className="bg-gray-100 rounded-3xl p-6 text-center space-y-2">
                 <p className="text-[11px] font-black uppercase">{agencyData?.name}</p>
                 <p className="text-[10px] uppercase opacity-50 font-bold italic">Par : {selectedUser}</p>
              </div>
              <div className="text-center py-4 border-y border-gray-100">
                <span className="text-4xl font-black italic">{totalHT.toFixed(2)}€ HT</span>
              </div>
              <button 
                onClick={handleFinalSubmit} 
                disabled={isSubmitting} 
                className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl hover:bg-blue-700 transition-all"
              >
                {isSubmitting ? "Envoi en cours..." : "Confirmer et Envoyer"}
              </button>
              <button onClick={() => setShowConfirm(false)} className="w-full text-[9px] font-black uppercase opacity-20 text-center tracking-widest hover:opacity-100 transition-opacity">Retour au panier</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}