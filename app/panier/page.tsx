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

  if (loading) return <div className="min-h-screen bg-[#0f092e] flex items-center justify-center text-white font-black uppercase text-[10px] tracking-[0.2em] animate-pulse">Chargement profil agence...</div>;

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
            <h1 className="text-[11px] font-black uppercase tracking-[0.4em] italic text-blue-500">Validation Panier</h1>
          </div>
          <div className="w-24"></div>
      </header>

      <main className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-12">
          <section className="bg-blue-600/5 border border-blue-500/20 rounded-[45px] p-10 space-y-8">
             <h2 className="text-[11px] font-black uppercase text-blue-400 italic tracking-widest">01. Identification</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase opacity-30 ml-2 italic">Agence</label>
                    <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[11px] font-black text-blue-400 uppercase">{agencyData?.name}</div>
                </div>
                <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase opacity-30 ml-2 italic">Collaborateur</label>
                    <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none focus:border-blue-500/50 uppercase text-white appearance-none">
                        {membres.map((m, idx) => <option key={idx} value={m.full_name || `${m.first_name} ${m.last_name}`}>{m.full_name || `${m.first_name} ${m.last_name}`}</option>)}
                    </select>
                </div>
             </div>
          </section>

          <section className="bg-white/[0.02] border border-white/10 rounded-[45px] p-10">
             <h2 className="text-[11px] font-black uppercase text-white/60 italic tracking-widest mb-10">02. Votre Panier</h2>
             <div className="space-y-6">
                {cart.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center border-b border-white/5 pb-6 last:border-0 last:pb-0">
                      <div className="flex flex-col">
                        <span className={`text-[13px] font-black uppercase tracking-tight ${item.color || 'text-white'}`}>{item.name}</span>
                        <span className="text-[9px] text-white/30 uppercase font-black mt-1 italic">x{item.qty} exemplaires</span>
                      </div>
                      <div className="flex items-center gap-8">
                        <span className="text-[14px] font-black italic">{(item.price * item.qty).toFixed(2)}€</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-[9px] text-red-500/50 hover:text-red-500 font-black transition-colors uppercase">Supprimer</button>
                      </div>
                    </div>
                ))}
             </div>
          </section>

          <section className="bg-white/[0.02] border border-white/10 rounded-[45px] p-10 space-y-8">
            <h2 className="text-[11px] font-black uppercase text-white/60 italic tracking-widest">03. Livraison</h2>
            <div className="space-y-6">
                <textarea placeholder="ADRESSE DE LIVRAISON" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full h-28 bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none focus:border-blue-500/50 resize-none uppercase text-white" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="email" placeholder="EMAIL" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none focus:border-blue-500/50 uppercase text-white" />
                  <input type="tel" placeholder="TÉLÉPHONE" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none focus:border-blue-500/50 uppercase text-white" />
                </div>
            </div>
          </section>

          <section className="bg-blue-600/5 border border-blue-500/10 rounded-[45px] p-10">
            <h2 className="text-[10px] font-black uppercase text-blue-400/50 italic mb-6">04. Notes</h2>
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Note..." className="w-full h-24 bg-black/40 border border-white/5 rounded-3xl p-6 text-[11px] text-white/80 outline-none focus:border-blue-500/40 resize-none uppercase italic" />
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-12 rounded-[50px] text-[#0f092e] sticky top-12 shadow-2xl text-center">
            <h2 className="text-[10px] font-black uppercase mb-4 opacity-30 italic tracking-[0.2em]">Total HT</h2>
            <span className="text-6xl font-black italic tracking-tighter leading-none">{totalHT.toFixed(2)}€</span>
            <button onClick={() => setShowConfirm(true)} disabled={cart.length === 0} className="w-full mt-12 py-7 bg-[#0f092e] text-white rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-600 transition-all shadow-2xl">
              Vérifier
            </button>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0f092e]/98 backdrop-blur-xl" onClick={() => setShowConfirm(false)} />
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-white text-[#0f092e] w-full max-w-xl rounded-[60px] p-12 shadow-2xl text-center space-y-6">
                <h3 className="text-3xl font-black uppercase italic text-blue-600">Confirmer ?</h3>
                <div className="bg-blue-50 rounded-3xl p-8">
                  <span className="text-5xl font-black italic tracking-tighter">{totalHT.toFixed(2)}€ HT</span>
                </div>
                <button onClick={handleFinalSubmit} disabled={isSubmitting} className="w-full py-7 bg-blue-600 text-white rounded-[25px] font-black uppercase text-[11px] shadow-xl hover:bg-blue-700 transition-all">
                  {isSubmitting ? "Envoi..." : "Confirmer"}
                </button>
                <button onClick={() => setShowConfirm(false)} className="py-4 text-[9px] font-black uppercase opacity-30 hover:opacity-100 tracking-widest">Retour</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}