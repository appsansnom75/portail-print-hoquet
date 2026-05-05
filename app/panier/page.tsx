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
  const [agenceId, setAgenceId] = useState<string | null>(null);
  const [membres, setMembres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCollaborateur, setSelectedCollaborateur] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [siret, setSiret] = useState("");
  const [instructions, setInstructions] = useState("");

  const [useAltAddress, setUseAltAddress] = useState(false);
  const [altAddress, setAltAddress] = useState("");
  const [altZipCode, setAltZipCode] = useState("");
  const [altCity, setAltCity] = useState("");
  const [altPhone, setAltPhone] = useState("");

  const totalHT = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  // ─── 1. CHARGEMENT ─────────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('agency_id, first_name, last_name, email')
        .eq('id', user.id)
        .single();

      if (profile?.agency_id) {
        setAgenceId(profile.agency_id);

        const { data: agency } = await supabase
          .from('agencies')
          .select('*')
          .eq('id', profile.agency_id)
          .single();

        if (agency) {
          setAgencyData(agency);
          setAddress(agency.adresse || "");
          setZipCode(agency.code_postal || "");
          setCity(agency.ville || "");
          setSiret(agency.siret || "");
          setPhone(agency.agence_telephone || "");
        }

        // ✅ Colonnes alignées avec la table réelle
        const { data: collabs } = await supabase
          .from('collaborateurs')
          .select('id, full_name, first_name, last_name, email, phone, fonction, avatar_url')
          .eq('agency_id', profile.agency_id)
          .order('first_name', { ascending: true });

        setMembres(collabs || []);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // ─── 2. SYNC INFOS AGENCE ──────────────────────────────────────────
  const syncAgenceData = async () => {
    if (!agenceId || useAltAddress) return;
    await supabase.from('agencies').update({
      adresse:          address,
      code_postal:      zipCode,
      ville:            city,
      agence_telephone: phone,
      siret:            siret,
    }).eq('id', agenceId);
  };

  // ─── 3. ENVOI COMMANDE ─────────────────────────────────────────────
  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await syncAgenceData();

      const { data: counterData } = await supabase
        .from('config')
        .select('last_value')
        .eq('counter_name', 'order_id')
        .single();

      const nextOrderId = (counterData?.last_value || 0) + 1;

      await supabase
        .from('config')
        .update({ last_value: nextOrderId })
        .eq('counter_name', 'order_id');

      const deliveryAddress = useAltAddress ? altAddress : address;
      const deliveryZip     = useAltAddress ? altZipCode : zipCode;
      const deliveryCity    = useAltAddress ? altCity    : city;
      const deliveryPhone   = useAltAddress ? altPhone   : phone;

      const itemsFormattedJSON = cart.map(item => ({
        name:       item.name,
        qty:        item.qty,
        price_unit: item.price,
        total_row:  (item.price * item.qty).toFixed(2),
        ordered_by: item.orderedBy || null,
      }));

      const produitsListeTexte = cart.map(item =>
        `${item.name} (x${item.qty})${item.orderedBy ? ` — ${item.orderedBy}` : ''}`
      ).join(', ');

      const { error: insertError } = await supabase.from('orders').insert([{
        order_number:     nextOrderId,
        agency_name:      agencyData?.name || "Agence",
        client_email:     selectedCollaborateur,
        client_phone:     deliveryPhone,
        delivery_address: deliveryAddress,
        zip_code:         deliveryZip,
        city:             deliveryCity,
        siret:            siret,
        produits_liste:   produitsListeTexte,
        total_ht:         totalHT,
        items:            itemsFormattedJSON,
        instructions:     `Collaborateur : ${selectedCollaborateur}${useAltAddress ? ' | Adresse différente' : ''} | Note : ${instructions}`,
        status:           'En attente',
      }]);

      if (insertError) throw insertError;

      // ✅ Collaborateur principal
      const collaborateurData = membres.find(
        m => (m.full_name || `${m.first_name} ${m.last_name}`) === selectedCollaborateur
      );

      // ✅ Items enrichis avec colonne nominatif — colonnes corrigées (fonction, avatar_url)
      const itemsPayload = cart.map(item => {
        const collabNominatif = item.orderedBy
          ? membres.find(m => (m.full_name || `${m.first_name} ${m.last_name}`) === item.orderedBy)
          : null;

        const nominatif = collabNominatif
          ? [
              `👤 ${item.orderedBy}`,
              collabNominatif.email      ? `✉️ ${collabNominatif.email}`      : null,
              collabNominatif.phone      ? `📞 ${collabNominatif.phone}`      : null,
              collabNominatif.fonction   ? `💼 ${collabNominatif.fonction}`   : null,
              collabNominatif.avatar_url ? `🖼️ ${collabNominatif.avatar_url}` : null,
            ].filter(Boolean).join(' | ')
          : '';

        return {
          produit:     item.name,
          quantite:    item.qty,
          nominatif,
          membre:      item.orderedBy || selectedCollaborateur,
          total_ligne: (item.price * item.qty).toFixed(2),
        };
      });

      // ✅ Webhook Make — payload complet
      const response = await fetch('https://hook.eu1.make.com/mb6ok4o2jv41vrhd37r101wi98b1lfz4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: nextOrderId,

          // Agence
          agency_name:  agencyData?.name || "",
          adresse:      deliveryAddress,
          code_postal:  deliveryZip,
          ville:        deliveryCity,
          tel:          deliveryPhone,
          siret:        siret,

          // Collaborateur principal
          collaborateur_nom:   selectedCollaborateur,
          collaborateur_email: collaborateurData?.email || agencyData?.agence_email || "",
          collaborateur_phone: collaborateurData?.phone || deliveryPhone,

          // Produits avec nominatif
          items: itemsPayload,

          // Totaux & date
          total_ht: totalHT,
          date:     new Date().toLocaleString('fr-FR'),
        }),
      });

      if (response.ok) {
        setOrderSent(true);
        setShowConfirm(false);
        clearCart();
      } else {
        throw new Error("Erreur Webhook Make");
      }

    } catch (err) {
      console.error("Erreur critique :", err);
      alert("Erreur lors de la validation. Vérifie les colonnes Supabase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── ÉTATS SPÉCIAUX ────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#0f092e] flex items-center justify-center text-white uppercase text-[10px] animate-pulse italic font-black">
      Initialisation du bon de commande...
    </div>
  );

  if (orderSent) return (
    <div className="min-h-screen bg-[#0f092e] flex flex-col items-center justify-center text-center p-6 text-white font-black italic uppercase">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <h2 className="text-6xl mb-6 text-blue-500 tracking-tighter">Transmission OK</h2>
        <p className="text-[10px] mb-12 opacity-50">Ta commande est enregistrée et envoyée en production.</p>
        <Link href="/" className="bg-white text-[#0f092e] px-12 py-6 rounded-full text-[10px] hover:bg-blue-500 hover:text-white transition-all shadow-2xl">
          Retour Boutique
        </Link>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f092e] text-white pb-20">

      <header className="py-10 px-6 max-w-6xl mx-auto flex justify-between items-center border-b border-white/10 mb-12">
        <Link href="/" className="text-[10px] font-black uppercase opacity-40 hover:opacity-100 italic transition-all">← Boutique</Link>
        <h1 className="text-[11px] font-black uppercase tracking-[0.4em] italic text-blue-500">Validation Commande</h1>
        <div className="w-24" />
      </header>

      <main className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-12">

          {/* ── 01. IDENTIFICATION ─────────────────────────────────── */}
          <section className="bg-blue-600/5 border border-blue-500/20 rounded-[45px] p-10 space-y-8">
            <h2 className="text-[11px] font-black uppercase text-blue-400 italic">01. Identification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[9px] font-black opacity-30 italic ml-2 uppercase">Agence</label>
                <div className="bg-black/40 border border-white/10 rounded-2xl p-5 text-[11px] font-black text-blue-400">
                  {agencyData?.name || "Non détectée"}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-black opacity-30 italic ml-2 uppercase">Collaborateur</label>
                <select
                  value={selectedCollaborateur}
                  onChange={(e) => setSelectedCollaborateur(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none uppercase appearance-none cursor-pointer hover:border-blue-500 transition-all"
                >
                  <option value="">— Sélectionner —</option>
                  {membres.map((m) => (
                    <option key={m.id} value={m.full_name || `${m.first_name} ${m.last_name}`}>
                      {m.full_name || `${m.first_name} ${m.last_name}`}
                    </option>
                  ))}
                </select>
                {membres.length === 0 && (
                  <p className="text-[8px] text-white/30 font-black uppercase ml-2">
                    Aucun collaborateur —{' '}
                    <Link href="/dashboard/equipe" className="text-blue-400 hover:underline">Ajouter dans Équipe</Link>
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* ── 02. RÉCAPITULATIF ──────────────────────────────────── */}
          <section className="bg-white/[0.02] border border-white/10 rounded-[45px] p-10">
            <h2 className="text-[11px] font-black uppercase text-white/60 italic mb-10">02. Récapitulatif</h2>
            <div className="space-y-6">
              {cart.length === 0 && (
                <p className="text-[10px] font-black uppercase text-white/20 italic text-center py-8">Panier vide</p>
              )}
              {cart.map((item: any) => (
                <div key={item.id} className="flex justify-between items-start border-b border-white/5 pb-6 gap-4">
                  <div className="flex flex-col gap-1 flex-grow">
                    <span className="text-[13px] font-black uppercase tracking-tight italic">{item.name}</span>
                    <span className="text-[9px] text-white/30 font-black italic">Quantité : {item.qty}</span>
                    {item.orderedBy && (
                      <span className="text-[9px] text-blue-400 font-black uppercase mt-1">👤 {item.orderedBy}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-[14px] font-black italic">{(item.price * item.qty).toFixed(2)}€</span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center transition-all text-sm font-black"
                      title="Supprimer"
                    >×</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 03. LIVRAISON & INFOS AGENCE ───────────────────────── */}
          <section className="bg-white/[0.02] border border-white/10 rounded-[45px] p-10 space-y-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-[11px] font-black uppercase text-white/60 italic">03. Livraison & Infos Agence</h2>
                {!useAltAddress && (
                  <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">
                    Modifications sauvegardées dans vos infos agence
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setUseAltAddress(!useAltAddress)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[8px] font-black uppercase tracking-widest transition-all ${
                  useAltAddress
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-white/10 bg-white/5 text-white/30 hover:text-white/60 hover:border-white/20'
                }`}
              >
                <span className={`w-2 h-2 rounded-full transition-all ${useAltAddress ? 'bg-blue-400' : 'bg-white/20'}`} />
                {useAltAddress ? '✓ Adresse différente' : '+ Adresse différente'}
              </button>
            </div>

            <div className="space-y-6">
              {!useAltAddress ? (
                <>
                  <input
                    placeholder="ADRESSE DE LIVRAISON"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none uppercase hover:border-blue-500/50 focus:border-blue-500 transition-all"
                  />
                  <div className="grid grid-cols-2 gap-6">
                    <input
                      placeholder="CODE POSTAL"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none hover:border-blue-500/50 focus:border-blue-500 transition-all"
                    />
                    <input
                      placeholder="VILLE"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none uppercase hover:border-blue-500/50 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <input
                    placeholder="TÉLÉPHONE CONTACT"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none hover:border-blue-500/50 focus:border-blue-500 transition-all"
                  />
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Numéro SIRET</label>
                    <input
                      placeholder="Ex: 123 456 789 00012"
                      value={siret}
                      onChange={(e) => setSiret(e.target.value)}
                      maxLength={17}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none hover:border-blue-500/50 focus:border-blue-500 transition-all"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-6 border border-blue-500/20 bg-blue-600/5 rounded-[30px] p-6">
                  <p className="text-[8px] font-black uppercase text-blue-400/60 tracking-widest">
                    Adresse unique pour cette commande — non sauvegardée dans vos infos agence
                  </p>
                  <input
                    placeholder="ADRESSE DE LIVRAISON"
                    value={altAddress}
                    onChange={(e) => setAltAddress(e.target.value)}
                    className="w-full bg-black/40 border border-blue-500/20 rounded-2xl p-5 text-[10px] font-black outline-none uppercase hover:border-blue-500/50 focus:border-blue-500 transition-all"
                  />
                  <div className="grid grid-cols-2 gap-6">
                    <input
                      placeholder="CODE POSTAL"
                      value={altZipCode}
                      onChange={(e) => setAltZipCode(e.target.value)}
                      className="bg-black/40 border border-blue-500/20 rounded-2xl p-5 text-[10px] font-black outline-none hover:border-blue-500/50 focus:border-blue-500 transition-all"
                    />
                    <input
                      placeholder="VILLE"
                      value={altCity}
                      onChange={(e) => setAltCity(e.target.value)}
                      className="bg-black/40 border border-blue-500/20 rounded-2xl p-5 text-[10px] font-black outline-none uppercase hover:border-blue-500/50 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <input
                    placeholder="TÉLÉPHONE CONTACT"
                    value={altPhone}
                    onChange={(e) => setAltPhone(e.target.value)}
                    className="w-full bg-black/40 border border-blue-500/20 rounded-2xl p-5 text-[10px] font-black outline-none hover:border-blue-500/50 focus:border-blue-500 transition-all"
                  />
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-400/50 ml-2">
                      Numéro SIRET
                      <span className="ml-2 normal-case italic font-bold text-blue-400/40">— non sauvegardé</span>
                    </label>
                    <input
                      placeholder="Ex: 123 456 789 00012"
                      value={siret}
                      onChange={(e) => setSiret(e.target.value)}
                      maxLength={17}
                      className="w-full bg-black/40 border border-blue-500/20 rounded-2xl p-5 text-[10px] font-black outline-none hover:border-blue-500/50 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              )}

              <textarea
                placeholder="INSTRUCTIONS PARTICULIÈRES (Optionnel)"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none uppercase min-h-[100px] hover:border-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>
          </section>

        </div>

        {/* ── COLONNE DROITE : TOTAL ──────────────────────────────── */}
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

      {/* ── OVERLAY DE CONFIRMATION ─────────────────────────────────── */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0f092e]/95 backdrop-blur-2xl"
              onClick={() => setShowConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white text-[#0f092e] w-full max-w-2xl rounded-[60px] p-14 space-y-8 shadow-2xl overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />
              <h3 className="text-3xl font-black uppercase italic text-blue-600 tracking-tighter">Confirmation Finale</h3>
              <p className="text-[10px] font-black opacity-40 uppercase italic">
                Toute commande validée part directement en production.
              </p>
              <div className="bg-gray-50 rounded-[35px] p-8 space-y-4 text-left">
                <div className="flex justify-between text-[10px] font-black uppercase italic">
                  <span className="opacity-40">Agence</span>
                  <span className="text-blue-600">{agencyData?.name}</span>
                </div>
                {selectedCollaborateur && (
                  <div className="flex justify-between text-[10px] font-black uppercase italic">
                    <span className="opacity-40">Collaborateur</span>
                    <span>{selectedCollaborateur}</span>
                  </div>
                )}
                {useAltAddress && (
                  <div className="flex justify-between text-[10px] font-black uppercase italic">
                    <span className="opacity-40">Livraison</span>
                    <span className="text-blue-500 text-right">{altAddress}, {altZipCode} {altCity}</span>
                  </div>
                )}
                <div className="flex justify-between text-[10px] font-black uppercase italic border-t border-gray-200 pt-4">
                  <span className="opacity-40">Total HT</span>
                  <span className="text-2xl text-blue-600">{totalHT.toFixed(2)}€</span>
                </div>
              </div>
              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="w-full py-7 bg-[#0f092e] text-white rounded-[25px] font-black uppercase text-[11px] shadow-xl hover:bg-blue-600 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Transmission en cours..." : "Confirmer la commande"}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="w-full text-[9px] font-black uppercase opacity-30 italic hover:opacity-100 transition-all"
              >
                Retour aux modifications
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}