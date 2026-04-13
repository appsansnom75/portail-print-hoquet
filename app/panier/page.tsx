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
  
  const [agencyData, setAgencyData] = useState<any>(null);
  const [membres, setMembres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // États du formulaire
  const [selectedUser, setSelectedUser] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [siret, setSiret] = useState("");
  const [instructions, setInstructions] = useState("");

  const totalHT = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase.from('profiles').select('agency_id, first_name, last_name, email').eq('id', user.id).single();

      if (profile?.agency_id) {
        const { data: agency } = await supabase.from('agencies').select('*').eq('id', profile.agency_id).single();
        if (agency) { 
          setAgencyData(agency); 
          setAddress(agency.address || "");
          setZipCode(agency.zip_code || "");
          setCity(agency.city || "");
          setSiret(agency.siret || "");
        }
        
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
    if (!agencyData || !selectedUser || !email || !address || !zipCode || !city || !phone) {
      alert("⚠️ Merci de remplir tous les champs de livraison.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // --- LOGIQUE DU COMPTEUR SUPABASE SÉCURISÉE ---
      // On utilise .maybeSingle() pour éviter l'erreur 406 si la ligne n'est pas trouvée
      let { data: counterData, error: counterError } = await supabase
        .from('config')
        .select('last_value')
        .eq('counter_name', 'order_id')
        .maybeSingle();

      if (counterError) throw counterError;

      let nextOrderId;

      if (!counterData) {
        // Si la ligne n'existe pas encore, on l'initialise à 1
        nextOrderId = 1;
        await supabase
          .from('config')
          .insert([{ counter_name: 'order_id', last_value: 1 }]);
      } else {
        // Si elle existe, on incrémente normalement
        nextOrderId = counterData.last_value + 1;
        await supabase
          .from('config')
          .update({ last_value: nextOrderId })
          .eq('counter_name', 'order_id');
      }
      // ----------------------------------------------

      const nomsProduits = cart.map(item => item.name).join(', ');
      const quantitésProduits = cart.map(item => item.qty).join(', ');

      const itemsFormatted = cart.map(item => ({
        name: item.name,
        qty: item.qty,
        price_unit: item.price,
        total_row: (item.price * item.qty).toFixed(2)
      }));

      // Insertion dans Supabase avec le nouvel ID
      const { error } = await supabase.from('orders').insert([{
        order_number: nextOrderId, 
        agency_name: agencyData.name,
        client_email: email,
        client_phone: phone,
        delivery_address: address,
        zip_code: zipCode,
        city: city,
        siret: siret,
        produits_liste: nomsProduits,     
        quantite_liste: quantitésProduits, 
        items: itemsFormatted,
        total_ht: totalHT,
        instructions: `Commandé par : ${selectedUser} -- ${instructions}`,
        status: 'En attente'
      }]);

      if (error) throw error;

      // Envoi vers le Webhook Make
      await fetch('https://hook.eu1.make.com/mb6ok4o2jv41vrhd37r101wi98b1lfz4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: nextOrderId, 
          agency_name: agencyData.name,
          client_name: selectedUser,
          items: itemsFormatted,
          total_ht: totalHT,
          full_address: `${address}, ${zipCode} ${city}`,
          date: new Date().toLocaleString('fr-FR')
        })
      });

      setOrderSent(true);
      setShowConfirm(false);
      clearCart();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi vers la production.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0f092e] flex items-center justify-center text-white font-black uppercase text-[10px] tracking-[0.2em] animate-pulse">Synchronisation agence...</div>;

  if (orderSent) return (
    <div className="min-h-screen bg-[#0f092e] flex flex-col items-center justify-center text-center p-6 italic font-black uppercase text-white">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <h2 className="text-5xl mb-4 text-blue-500 tracking-tighter">Transmission Réussie</h2>
        <p className="text-white/40 text-[10px] tracking-[0.3em] mb-12 uppercase">Le suivi de production a été mis à jour.</p>
        <Link href="/" className="bg-white text-[#0f092e] px-12 py-6 rounded-full text-[10px] hover:bg-blue-500 hover:text-white transition-all shadow-2xl">Retour Boutique</Link>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans pb-20 overflow-x-hidden">
      <header className="py-10 px-6 max-w-6xl mx-auto flex justify-between items-center border-b border-white/10 mb-12">
          <Link href="/" className="group text-[10px] font-black uppercase opacity-40 hover:opacity-100 transition-all flex items-center gap-3">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Retour Boutique
          </Link>
          <h1 className="text-[11px] font-black uppercase tracking-[0.4em] italic text-blue-500">Validation Panier</h1>
          <div className="w-24"></div>
      </header>

      <main className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-12">
          
          <section className="bg-blue-600/5 border border-blue-500/20 rounded-[45px] p-10 space-y-8">
             <h2 className="text-[11px] font-black uppercase text-blue-400 italic tracking-widest">01. Identification</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase opacity-30 ml-2 italic">Votre Agence</label>
                    <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[11px] font-black text-blue-400 uppercase">{agencyData?.name}</div>
                </div>
                <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase opacity-30 ml-2 italic">Qui commande ?</label>
                    <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none focus:border-blue-500/50 uppercase text-white appearance-none cursor-pointer">
                        {membres.map((m, idx) => <option key={idx} value={m.full_name || `${m.first_name} ${m.last_name}`}>{m.full_name || `${m.first_name} ${m.last_name}`}</option>)}
                    </select>
                </div>
             </div>
          </section>

          <section className="bg-white/[0.02] border border-white/10 rounded-[45px] p-10">
             <h2 className="text-[11px] font-black uppercase text-white/60 italic tracking-widest mb-10">02. Votre Panier</h2>
             <div className="space-y-6">
                {cart.length === 0 ? <p className="text-[10px] opacity-20 uppercase font-black italic">Le panier est vide.</p> : cart.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center border-b border-white/5 pb-6 last:border-0 last:pb-0">
                      <div className="flex flex-col">
                        <span className={`text-[13px] font-black uppercase tracking-tight ${item.color || 'text-white'}`}>{item.name}</span>
                        <span className="text-[9px] text-white/30 uppercase font-black mt-1 italic">x{item.qty} exemplaires</span>
                      </div>
                      <div className="flex items-center gap-8">
                        <span className="text-[14px] font-black italic">{(item.price * item.qty).toFixed(2)}€</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-[10px] text-red-500/30 hover:text-red-500 font-black transition-colors uppercase">(X)</button>
                      </div>
                    </div>
                ))}
             </div>
          </section>

          <section className="bg-white/[0.02] border border-white/10 rounded-[45px] p-10 space-y-8">
            <h2 className="text-[11px] font-black uppercase text-white/60 italic tracking-widest">03. Livraison & Contact</h2>
            <div className="space-y-6">
                <input placeholder="ADRESSE DE LIVRAISON" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none focus:border-blue-500/50 uppercase text-white" />
                <div className="grid grid-cols-2 gap-6">
                  <input placeholder="CODE POSTAL" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none focus:border-blue-500/50 uppercase text-white" />
                  <input placeholder="VILLE" value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none focus:border-blue-500/50 uppercase text-white" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <input placeholder="SIRET" value={siret} onChange={(e) => setSiret(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none focus:border-blue-500/50 uppercase text-white" />
                  <input placeholder="TÉLÉPHONE" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none focus:border-blue-500/50 uppercase text-white" />
                </div>
                <input type="email" placeholder="MAIL DE CONTACT" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none focus:border-blue-500/50 uppercase text-white" />
            </div>
          </section>

          <section className="bg-blue-600/5 border border-blue-500/10 rounded-[45px] p-10">
            <h2 className="text-[10px] font-black uppercase text-blue-400/50 italic mb-6">04. Instructions Particulières</h2>
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Précisions pour le façonnage ou l'impression..." className="w-full h-24 bg-black/40 border border-white/5 rounded-3xl p-6 text-[11px] text-white/80 outline-none focus:border-blue-500/40 resize-none uppercase italic" />
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-12 rounded-[50px] text-[#0f092e] sticky top-12 shadow-2xl text-center">
            <h2 className="text-[10px] font-black uppercase mb-4 opacity-30 italic tracking-[0.2em]">Total à régler HT</h2>
            <span className="text-6xl font-black italic tracking-tighter leading-none">{totalHT.toFixed(2)}€</span>
            <button onClick={() => setShowConfirm(true)} disabled={cart.length === 0} className="w-full mt-12 py-7 bg-[#0f092e] text-white rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-20 shadow-xl">Vérifier la commande</button>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0f092e]/95 backdrop-blur-2xl" onClick={() => setShowConfirm(false)} />
            
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="relative bg-white text-[#0f092e] w-full max-w-2xl rounded-[60px] overflow-hidden shadow-2xl">
              <div className="p-10 md:p-14 space-y-8">
                <div className="text-center">
                  <h3 className="text-3xl font-black uppercase italic text-blue-600">Récapitulatif</h3>
                  <p className="text-[9px] font-black uppercase opacity-30 mt-2 tracking-widest italic">Vérifiez vos informations de livraison</p>
                </div>

                <div className="grid grid-cols-2 gap-8 py-8 border-y border-gray-100">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black opacity-30 uppercase">Agence</p>
                    <p className="text-[11px] font-black uppercase">{agencyData?.name}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[8px] font-black opacity-30 uppercase">Contact Mail</p>
                    <p className="text-[10px] font-bold uppercase">{email}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-[8px] font-black opacity-30 uppercase">Adresse de livraison complète</p>
                    <p className="text-[11px] font-black uppercase leading-snug">{address}, {zipCode} {city}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black opacity-30 uppercase">SIRET</p>
                    <p className="text-[11px] font-black uppercase">{siret}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[8px] font-black opacity-30 uppercase">Signé par</p>
                    <p className="text-[11px] font-black uppercase text-blue-600">{selectedUser}</p>
                  </div>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-3 pr-2 border-b border-gray-50 pb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-[10px] font-black uppercase italic">
                      <span className="opacity-60">{item.name} <span className="text-blue-500 ml-2">x{item.qty}</span></span>
                      <span>{(item.price * item.qty).toFixed(2)}€</span>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-[35px] p-8 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase opacity-40 italic">Total HT à régler</span>
                  <span className="text-4xl font-black italic tracking-tighter text-[#0f092e]">{totalHT.toFixed(2)}€</span>
                </div>

                <div className="flex flex-col gap-4">
                  <button onClick={handleFinalSubmit} disabled={isSubmitting} className="w-full py-7 bg-blue-600 text-white rounded-[25px] font-black uppercase text-[11px] tracking-[0.2em] shadow-xl hover:bg-blue-700 transition-all active:scale-[0.98]">
                    {isSubmitting ? "Envoi en cours..." : "Confirmer la commande"}
                  </button>
                  <button onClick={() => setShowConfirm(false)} className="py-2 text-[9px] font-black uppercase opacity-30 hover:opacity-100 transition-opacity tracking-widest italic">Modifier la saisie</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}