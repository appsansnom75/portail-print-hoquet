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

  if (loading) return <div className="min-h-screen bg-[#0f092e] flex items-center justify-center text-white font-black uppercase text-[10px] tracking-[0.2em] animate-pulse">Chargement du profil agence...</div>;

  if (orderSent) return (
    <div className="min-h-screen bg-[#0f092e] flex flex-col items-center justify-center text-center p-6 italic font-black uppercase text-white">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <h2 className="text-5xl mb-4 text-blue-500">Commande Reçue !</h2>
        <p className="text-white/40 text-[10px] tracking-[0.3em] mb-12 uppercase">L'équipe de production a été notifiée.</p>
        <Link href="/" className="bg-white text-[#0f092e] px-12 py-6 rounded-full text-[10px] hover:bg-blue-500 hover:text-white transition-all">Retour Boutique</Link>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans pb-20 overflow-x-hidden">
      <header className="py-10 px-6 max-w-6xl mx-auto flex justify-between items-center border-b border-white/10 mb-12">
          <Link href="/" className="group text-[10px] font-black uppercase opacity-40 hover:opacity-100 transition-all flex items-center gap-3">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Retour Boutique
          </Link>
          <div className="flex flex-col items-center">
            <h1 className="text-[11px] font-black uppercase tracking-[0.4em] italic text-blue-500">Validation</h1>
            <span className="text-[8px] uppercase opacity-20 font-bold tracking-[0.2em] mt-1">Étape finale</span>
          </div>
          <div className="w-24"></div>
      </header>

      <main className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-12">
          
          {/* 01. IDENTIFICATION */}
          <section className="bg-blue-600/5 border border-blue-500/20 rounded-[45px] p-10 space-y-8">
             <div className="flex items-center gap-4">
               <span className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-black italic">01</span>
               <h2 className="text-[11px] font-black uppercase text-blue-400 italic tracking-widest">Identification Agence</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase opacity-30 ml-2 italic">Votre Agence</label>
                    <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[11px] font-black text-blue-400 uppercase tracking-tight">{agencyData?.name}</div>
                </div>
                <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase opacity-30 ml-2 italic">Collaborateur</label>
                    <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none focus:border-blue-500/50 uppercase text-white cursor-pointer appearance-none">
                        {membres.map((m, idx) => <option key={idx} value={m.full_name || `${m.first_name} ${m.last_name}`}>{m.full_name || `${m.first_name} ${m.last_name}`}</option>)}
                    </select>
                </div>
             </div>
          </section>

          {/* 02. PANIER */}
          <section className="bg-white/[0.02] border border-white/10 rounded-[45px] p-10">
             <div className="flex items-center gap-4 mb-10">
               <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black italic">02</span>
               <h2 className="text-[11px] font-black uppercase text-white/60 italic tracking-widest">Récapitulatif Articles</h2>
             </div>
             <div className="space-y-6">
                {cart.length === 0 ? <p className="text-[10px] opacity-20 uppercase font-black italic p-4">Aucun article sélectionné.</p> : cart.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center border-b border-white/5 pb-6 last:border-0 last:pb-0">
                      <div className="flex flex-col">
                        <span className={`text-[13px] font-black uppercase tracking-tight ${item.color || 'text-white'}`}>{item.name}</span>
                        <span className="text-[9px] text-white/30 uppercase font-black mt-1 italic">Quantité : {item.qty} exemplaires</span>
                      </div>
                      <div className="flex items-center gap-8">
                        <span className="text-[14px] font-black italic">{(item.price * item.qty).toFixed(2)}€</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-[9px] text-red-500/50 hover:text-red-500 font-black transition-colors uppercase">Supprimer</button>
                      </div>
                    </div>
                ))}
             </div>
          </section>

          {/* 03. LIVRAISON & CONTACT */}
          <section className="bg-white/[0.02] border border-white/10 rounded-[45px] p-10 space-y-8">
            <div className="flex items-center gap-4">
               <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black italic">03</span>
               <h2 className="text-[11px] font-black uppercase text-white/60 italic tracking-widest">Livraison & Contact</h2>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase opacity-30 ml-2 italic">Adresse de livraison complète</label>
                <textarea placeholder="N°, RUE, CP, VILLE..." value={address} onChange={(e) => setAddress(e.target.value)} className="w-full h-28 bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none focus:border-blue-500/50 resize-none uppercase text-white tracking-widest" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase opacity-30 ml-2 italic">Email de suivi</label>
                  <input type="email" placeholder="CONTACT@EMAIL.COM" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none focus:border-blue-500/50 uppercase text-white" />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase opacity-30 ml-2 italic">Téléphone</label>
                  <input type="tel" placeholder="06 XX XX XX XX" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none focus:border-blue-500/50 uppercase text-white" />
                </div>
              </div>
            </div>
          </section>

          {/* 04. NOTES */}
          <section className="bg-blue-600/5 border border-blue-500/10 rounded-[45px] p-10">
            <h2 className="text-[10px] font-black uppercase text-blue-400/50 italic mb-6 tracking-widest">04. Instructions Spéciales</h2>
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Précisez ici toute information utile pour l'imprimeur (finition, urgence, etc.)" className="w-full h-24 bg-black/40 border border-white/5 rounded-3xl p-6 text-[11px] text-white/80 outline-none focus:border-blue-500/40 resize-none uppercase italic" />
          </section>
        </div>

        {/* COLONNE TOTAL */}
        <div className="lg:col-span-1">
          <div className="bg-white p-12 rounded-[50px] text-[#0f092e] sticky top-12 shadow-[0_30px_100px_rgba(0,0,0,0.4)] text-center">
            <h2 className="text-[10px] font-black uppercase mb-4 opacity-30 italic tracking-[0.2em]">Montant Total HT</h2>
            <div className="flex flex-col items-center">
              <span className="text-6xl font-black italic tracking-tighter leading-none">{totalHT.toFixed(2)}€</span>
              <span className="text-[9px] font-black uppercase mt-4 opacity-40">TVA non applicable</span>
            </div>
            
            <button 
              onClick={() => setShowConfirm(true)} 
              disabled={cart.length === 0} 
              className="w-full mt-12 py-7 bg-[#0f092e] text-white rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-20 shadow-2xl"
            >
              Vérifier la commande
            </button>
            
            <p className="text-[8px] font-bold uppercase mt-6 opacity-30 leading-relaxed px-4">
              En cliquant, vous acceptez la transmission de ces données au service impression.
            </p>
          </div>
        </div>
      </main>

      {/* MODAL DE CONFIRMATION */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0f092e]/98 backdrop-blur-xl" onClick={() => setShowConfirm(false)} />
            <motion.div initial={{ y: 50, opacity: 0, scale: 0.9 }} animate={{ y: