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

  const [selectedUser, setSelectedUser] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [siret, setSiret] = useState("");
  const [instructions, setInstructions] = useState("");

  const totalHT = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  // 1. CHARGEMENT DES DONNÉES UTILISATEUR ET AGENCE
  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      
      const { data: profile } = await supabase.from('profiles')
        .select('agency_id, first_name, last_name, email')
        .eq('id', user.id)
        .single();

      if (profile?.agency_id) {
        const { data: agency } = await supabase.from('agencies')
            .select('*')
            .eq('id', profile.agency_id)
            .single();

        if (agency) { 
          setAgencyData(agency); 
          setAddress(agency.address || "");
          setZipCode(agency.zip_code || "");
          setCity(agency.city || "");
          setSiret(agency.siret || "");
        }

        const { data: team } = await supabase.from('profiles')
            .select('full_name, first_name, last_name, email, phone')
            .eq('agency_id', profile.agency_id)
            .order('first_name', { ascending: true });

        setMembres(team || []);
        setSelectedUser(`${profile.first_name} ${profile.last_name}`);
        setEmail(profile.email || "");
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // 2. LOGIQUE D'ENVOI DE LA COMMANDE
  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // A. RÉCUPÉRATION DU COMPTEUR (Table 'config')
      const { data: counterData } = await supabase
        .from('config')
        .select('last_value')
        .eq('counter_name', 'order_id')
        .single();

      const nextOrderId = (counterData?.last_value || 0) + 1;

      // B. MISE À JOUR DU COMPTEUR
      await supabase.from('config')
        .update({ last_value: nextOrderId })
        .eq('counter_name', 'order_id');

      // C. PRÉPARATION DES DONNÉES POUR LES COLONNES RÉELLES
      const itemsFormattedJSON = cart.map(item => ({
        name: item.name,
        qty: item.qty,
        price_unit: item.price,
        total_row: (item.price * item.qty).toFixed(2)
      }));

      const produitsListeTexte = cart.map(item => `${item.name} (x${item.qty})`).join(', ');

      // D. INSERTION DANS 'ORDERS' (Avec les noms de colonnes de tes captures)
      const { error: insertError } = await supabase.from('orders').insert([{
        order_number: nextOrderId,
        agency_name: agencyData?.name || "Agence",
        client_email: selectedUser, // Correspond à ta colonne client_email vue sur Supabase
        client_phone: phone,
        delivery_address: address,
        zip_code: zipCode,
        city: city,
        siret: siret,
        produits_liste: produitsListeTexte, // Colonne texte vue sur capture
        total_ht: totalHT,
        items: itemsFormattedJSON, // Colonne JSONB vue sur capture
        instructions: `Signataire : ${selectedUser} | Note : ${instructions}`,
        status: 'En attente'
      }]);

      if (insertError) throw insertError;

      // E. ENVOI VERS MAKE (Webhook)
      const response = await fetch('https://hook.eu1.make.com/mb6ok4o2jv41vrhd37r101wi98b1lfz4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: nextOrderId, // Très important pour le format GH-XXXXX dans Make
          agency_name: agencyData?.name,
          client_name: selectedUser,
          produits: produitsListeTexte,
          total_ht: totalHT,
          full_address: `${address}, ${zipCode} ${city}`,
          phone: phone,
          date: new Date().toLocaleString('fr-FR')
        })
      });

      if (response.ok) {
        setOrderSent(true);
        setShowConfirm(false);
        clearCart();
      } else {
        throw new Error("Erreur Webhook Make");
      }

    } catch (err) {
      console.error("Erreur critique détectée :", err);
      alert("Erreur lors de la validation. Vérifie que toutes les colonnes Supabase sont correctes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. AFFICHAGES (Loading / Success / Formulaire)
  if (loading) return <div className="min-h-screen bg-[#0f092e] flex items-center justify-center text-white uppercase text-[10px] animate-pulse italic font-black">Initialisation du bon de commande...</div>;

  if (orderSent) return (
    <div className="min-h-screen bg-[#0f092e] flex flex-col items-center justify-center text-center p-6 text-white font-black italic uppercase">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <h2 className="text-6xl mb-6 text-blue-500 tracking-tighter">Transmission OK</h2>
        <p className="text-[10px] mb-12 opacity-50">Ta commande est enregistrée et envoyée en production.</p>
        <Link href="/" className="bg-white text-[#0f092e] px-12 py-6 rounded-full text-[10px] hover:bg-blue-500 hover:text-white transition-all shadow-2xl">Retour Boutique</Link>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f092e] text-white pb-20">
      <header className="py-10 px-6 max-w-6xl mx-auto flex justify-between items-center border-b border-white/10 mb-12">
          <Link href="/" className="text-[10px] font-black uppercase opacity-40 hover:opacity-100 italic transition-all">← Boutique</Link>
          <h1 className="text-[11px] font-black uppercase tracking-[0.4em] italic text-blue-500">Validation Commande</h1>
          <div className="w-24"></div>
      </header>

      <main className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-12">
          {/* SECTION 01 : AGENCE */}
          <section className="bg-blue-600/5 border border-blue-500/20 rounded-[45px] p-10 space-y-8">
             <h2 className="text-[11px] font-black uppercase text-blue-400 italic">01. Identification</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="text-[9px] font-black opacity-30 italic ml-2 uppercase">Agence</label>
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-5 text-[11px] font-black text-blue-400">{agencyData?.name || "Non détectée"}</div>
                </div>
                <div className="space-y-3">
                    <label className="text-[9px] font-black opacity-30 italic ml-2 uppercase">Signataire</label>
                    <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none uppercase appearance-none cursor-pointer">
                        {membres.map((m, idx) => (
                          <option key={idx} value={m.full_name || `${m.first_name} ${m.last_name}`}>{m.full_name || `${m.first_name} ${m.last_name}`}</option>
                        ))}
                    </select>
                </div>
             </div>
          </section>

          {/* SECTION 02 : PANIER */}
          <section className="bg-white/[0.02] border border-white/10 rounded-[45px] p-10">
             <h2 className="text-[11px] font-black uppercase text-white/60 italic mb-10">02. Récapitulatif</h2>
             <div className="space-y-6">
                {cart.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center border-b border-white/5 pb-6">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-black uppercase tracking-tight italic">{item.name}</span>
                        <span className="text-[9px] text-white/30 font-black italic">Quantité : {item.qty}</span>
                      </div>
                      <span className="text-[14px] font-black italic">{(item.price * item.qty).toFixed(2)}€</span>
                    </div>
                ))}
             </div>
          </section>

          {/* SECTION 03 : LIVRAISON */}
          <section className="bg-white/[0.02] border border-white/10 rounded-[45px] p-10 space-y-8">
            <h2 className="text-[11px] font-black uppercase text-white/60 italic">03. Livraison & SIRET</h2>
            <div className="space-y-6">
                <input placeholder="ADRESSE DE LIVRAISON" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none uppercase" />
                <div className="grid grid-cols-2 gap-6">
                  <input placeholder="CP" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none" />
                  <input placeholder="VILLE" value={city} onChange={(e) => setCity(e.target.value)} className="bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none uppercase" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <input placeholder="NUMÉRO SIRET" value={siret} onChange={(e) => setSiret(e.target.value)} className="bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none" />
                  <input placeholder="TÉLÉPHONE CONTACT" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none" />
                </div>
                <textarea placeholder="INSTRUCTIONS PARTICULIÈRES (Optionnel)" value={instructions} onChange={(e) => setInstructions(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none uppercase min-h-[100px]" />
            </div>
          </section>
        </div>

        {/* COLONNE DE DROITE : TOTAL & BOUTON */}
        <div className="lg:col-span-1">
          <div className="bg-white p-12 rounded-[50px] text-[#0f092e] sticky top-12 text-center shadow-2xl">
            <h2 className="text-[10px] font-black uppercase opacity-30 italic mb-4">Total HT à régler</h2>
            <span className="text-6xl font-black italic tracking-tighter">{totalHT.toFixed(2)}€</span>
            <button 
              onClick={() => setShowConfirm(true)} 
              disabled={cart.length === 0} 
              className="w-full mt-12 py-7 bg-blue-600 text-white rounded-3xl font-black uppercase text-[10px] hover:bg-[#0f092e] transition-all shadow-xl disabled:opacity-20"
            >
              Vérifier la commande
            </button>
          </div>
        </div>
      </main>

      {/* OVERLAY DE CONFIRMATION */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0f092e]/95 backdrop-blur-2xl" onClick={() => setShowConfirm(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white text-[#0f092e] w-full max-w-2xl rounded-[60px] p-14 space-y-8 shadow-2xl overflow-hidden text-center">
              <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
              <h3 className="text-3xl font-black uppercase italic text-blue-600 tracking-tighter">Confirmation Finale</h3>
              <p className="text-[10px] font-black opacity-40 uppercase italic">Toute commande validée part directement en production.</p>
              
              <div className="bg-gray-50 rounded-[35px] p-8 space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase italic">
                    <span className="opacity-40">Total HT</span>
                    <span className="text-2xl text-blue-600">{totalHT.toFixed(2)}€</span>
                </div>
              </div>

              <button 
                onClick={handleFinalSubmit} 
                disabled={isSubmitting} 
                className="w-full py-7 bg-[#0f092e] text-white rounded-[25px] font-black uppercase text-[11px] shadow-xl hover:bg-blue-600 transition-all"
              >
                {isSubmitting ? "Transmission en cours..." : "Confirmer la commande"}
              </button>
              
              <button onClick={() => setShowConfirm(false)} className="w-full text-[9px] font-black uppercase opacity-30 italic hover:opacity-100 transition-all">Retour aux modifications</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}