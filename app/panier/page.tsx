'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';


export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [orderSent, setOrderSent]       = useState(false);

  // ✅ Accordéon mentions légales
  const [mentionsOpen, setMentionsOpen] = useState(false);

  const [agencyData, setAgencyData]     = useState<any>(null);
  const [agenceId, setAgenceId]         = useState<string | null>(null);
  const [membres, setMembres]           = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);

  // 03 - LIVRAISON
  const [phone, setPhone]         = useState('');
  const [phoneFix, setPhoneFix]   = useState('');
  const [address, setAddress]     = useState('');
  const [zipCode, setZipCode]     = useState('');
  const [city, setCity]           = useState('');
  const [siret, setSiret]         = useState('');

  const [useAltAddress, setUseAltAddress] = useState(false);
  const [altAddress, setAltAddress]       = useState('');
  const [altZipCode, setAltZipCode]       = useState('');
  const [altCity, setAltCity]             = useState('');
  const [altPhone, setAltPhone]           = useState('');
  const [altPhoneFix, setAltPhoneFix]     = useState('');

  // 04 - FACTURATION & LÉGALES
  const [mentionsMailFacturation, setMentionsMailFacturation]               = useState('');
  const [mentionsNomSociete, setMentionsNomSociete]                         = useState('');
  const [mentionsVilleAgence, setMentionsVilleAgence]                       = useState('');
  const [mentionsUrlQrCode, setMentionsUrlQrCode]                           = useState('');
  const [mentionsStatut, setMentionsStatut]                                 = useState('');
  const [mentionsCapital, setMentionsCapital]                               = useState('');
  const [mentionsRcs, setMentionsRcs]                                       = useState('');
  const [mentionsApe, setMentionsApe]                                       = useState('');
  const [mentionsCartePro, setMentionsCartePro]                             = useState('');
  const [mentionsCarteProDelivree, setMentionsCarteProDelivree]             = useState('');
  const [mentionsCaisseGarantie, setMentionsCaisseGarantie]                 = useState('');
  const [mentionsCaisseGarantieAdresse, setMentionsCaisseGarantieAdresse]   = useState('');
  const [mentionsTva, setMentionsTva]                                       = useState('');
  const [mentionsMailRgpd, setMentionsMailRgpd]                             = useState('');

  const totalHT  = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const totalTTC = totalHT * 1.2;
  const fmt = (n: number) => n.toFixed(2).replace('.', ',');


  // ─── 1. CHARGEMENT ──────────────────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from('profiles').select('agency_id').eq('id', user.id).single();

      if (profile?.agency_id) {
        setAgenceId(profile.agency_id);

        const { data: agency } = await supabase
          .from('agencies').select('*').eq('id', profile.agency_id).single();

        if (agency) {
          setAgencyData(agency);
          setAddress(agency.adresse              || '');
          setZipCode(agency.code_postal          || '');
          setCity(agency.ville                   || '');
          setSiret(agency.siret                  || '');
          setPhone(agency.agence_telephone       || '');
          setPhoneFix(agency.phone_fix           || '');
          setMentionsMailFacturation(agency.mentions_mail_facturation       || agency.agence_email || '');
          setMentionsNomSociete(agency.mentions_nom_societe                 || '');
          setMentionsVilleAgence(agency.mentions_ville_agence               || agency.ville || '');
          setMentionsUrlQrCode(agency.mentions_url_qr_code                  || '');
          setMentionsStatut(agency.mentions_statut                          || '');
          setMentionsCapital(agency.mentions_capital                        || '');
          setMentionsRcs(agency.mentions_rcs                                || '');
          setMentionsApe(agency.mentions_ape                                || '');
          setMentionsCartePro(agency.mentions_carte_pro                     || '');
          setMentionsCarteProDelivree(agency.mentions_carte_pro_delivree    || '');
          setMentionsCaisseGarantie(agency.mentions_caisse_garantie         || '');
          setMentionsCaisseGarantieAdresse(agency.mentions_caisse_garantie_adresse || '');
          setMentionsTva(agency.mentions_tva                                || '');
          setMentionsMailRgpd(agency.mentions_mail_rgpd                     || '');
        }

        const { data: collabs } = await supabase
          .from('collaborateurs')
          .select('id, full_name, first_name, last_name, email, phone, phone_fix, fonction, rsac, adresse, ville, code_postal, avatar_url')
          .eq('agency_id', profile.agency_id);
        setMembres(collabs || []);
      }
      setLoading(false);
    };
    loadData();
  }, []);


  // ─── 2. SYNC INFOS AGENCE ────────────────────────────────────────────────────
  const syncAgenceData = async () => {
    if (!agenceId) return;
    await supabase.from('agencies').update({
      ...(useAltAddress ? {} : {
        adresse:          address,
        code_postal:      zipCode,
        ville:            city,
        agence_telephone: phone,
        phone_fix:        phoneFix,
      }),
      siret,
      mentions_mail_facturation:        mentionsMailFacturation,
      mentions_ville_agence:            mentionsVilleAgence,
      mentions_url_qr_code:             mentionsUrlQrCode,
      mentions_nom_societe:             mentionsNomSociete,
      mentions_statut:                  mentionsStatut,
      mentions_capital:                 mentionsCapital,
      mentions_rcs:                     mentionsRcs,
      mentions_ape:                     mentionsApe,
      mentions_carte_pro:               mentionsCartePro,
      mentions_carte_pro_delivree:      mentionsCarteProDelivree,
      mentions_caisse_garantie:         mentionsCaisseGarantie,
      mentions_caisse_garantie_adresse: mentionsCaisseGarantieAdresse,
      mentions_tva:                     mentionsTva,
      mentions_mail_rgpd:               mentionsMailRgpd,
    }).eq('id', agenceId);
  };


  // ─── 3. VALIDATION ──────────────────────────────────────────────────────────
  const isFormValid = () => {
    const livraisonOk = useAltAddress
      ? altAddress.trim() && altZipCode.trim() && altCity.trim() && altPhone.trim() && altPhoneFix.trim()
      : address.trim() && zipCode.trim() && city.trim() && phone.trim() && phoneFix.trim();

    const mentionsOk =
      mentionsMailFacturation.trim() &&
      mentionsNomSociete.trim() &&
      mentionsVilleAgence.trim() &&
      mentionsUrlQrCode.trim() &&
      mentionsStatut.trim() &&
      mentionsCapital.trim() &&
      mentionsRcs.trim() &&
      mentionsApe.trim() &&
      mentionsCartePro.trim() &&
      mentionsCarteProDelivree.trim() &&
      mentionsCaisseGarantie.trim() &&
      mentionsCaisseGarantieAdresse.trim() &&
      mentionsTva.trim() &&
      mentionsMailRgpd.trim();

    return !!(siret.trim() && livraisonOk && mentionsOk);
  };


  // ─── 4. ENVOI COMMANDE ──────────────────────────────────────────────────────
  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await syncAgenceData();

      const { data: counterData } = await supabase
        .from('config').select('last_value').eq('counter_name', 'order_id').single();
      const nextOrderId = (counterData?.last_value || 0) + 1;
      await supabase.from('config').update({ last_value: nextOrderId }).eq('counter_name', 'order_id');

      const deliveryAddress  = useAltAddress ? altAddress  : address;
      const deliveryZip      = useAltAddress ? altZipCode  : zipCode;
      const deliveryCity     = useAltAddress ? altCity     : city;
      const deliveryPhone    = useAltAddress ? altPhone    : phone;
      const deliveryPhoneFix = useAltAddress ? altPhoneFix : phoneFix;

      const produitsListeTexte = cart.map(item =>
        `${item.name} (x${item.qty})${item.orderedBy ? ` — ${item.orderedBy}` : ''}`
      ).join(', ');

      const itemsFormattedJSON = cart.map(item => ({
        name:       item.name,
        qty:        item.qty,
        price_unit: item.price,
        total_row:  fmt(item.price * item.qty),
        ordered_by: item.orderedBy || null,
      }));

      const { error: insertError } = await supabase.from('orders').insert([{
        order_number:     nextOrderId,
        agency_name:      agencyData?.name || 'Agence',
        client_phone:     deliveryPhone,
        delivery_address: deliveryAddress,
        zip_code:         deliveryZip,
        city:             deliveryCity,
        siret,
        produits_liste:   produitsListeTexte,
        total_ht:         totalHT,
        items:            itemsFormattedJSON,
        status:           'En attente',
      }]);
      if (insertError) throw insertError;

      const itemsPayload = cart.map(item => {
        const collabNominatif = item.orderedBy
          ? membres.find(m => (m.full_name || `${m.first_name} ${m.last_name}`) === item.orderedBy)
          : null;
        return {
          produit:            item.name,
          quantite:           item.qty,
          prix_ligne:         fmt(item.price * item.qty),
          membre:             item.orderedBy || '',
          nominatif_prenom:   collabNominatif?.first_name  || '',
          nominatif_nom:      collabNominatif?.last_name   || '',
          nominatif_mail:     collabNominatif?.email       || '',
          nominatif_tel:      collabNominatif?.phone       || '',
          nominatif_tel_fix:  collabNominatif?.phone_fix   || deliveryPhoneFix,
          nominatif_fonction: collabNominatif?.fonction    || '',
          nominatif_rsac:     collabNominatif?.rsac        || '',
          nominatif_adresse:  collabNominatif?.adresse     || deliveryAddress,
          nominatif_ville:    collabNominatif?.ville       || deliveryCity,
          nominatif_cp:       collabNominatif?.code_postal || deliveryZip,
          nominatif_photo:    collabNominatif?.avatar_url  || '',
        };
      });

      const response = await fetch('https://hook.eu1.make.com/mb6ok4o2jv41vrhd37r101wi98b1lfz4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number:  nextOrderId,
          agency_name:   agencyData?.name || '',
          adresse:       deliveryAddress,
          code_postal:   deliveryZip,
          ville:         deliveryCity,
          tel:           deliveryPhone,
          tel_fix:       deliveryPhoneFix,
          siret,
          items:         itemsPayload,
          total_ht:      fmt(totalHT),
          total_ttc:     fmt(totalTTC),
          date:          new Date().toLocaleString('fr-FR'),
          // ✅ Tous les champs passent toujours au webhook
          mentions_mail_facturation:        mentionsMailFacturation,
          mentions_nom_societe:             mentionsNomSociete,
          mentions_ville_agence:            mentionsVilleAgence,
          mentions_url_qr_code:             mentionsUrlQrCode,
          mentions_statut:                  mentionsStatut,
          mentions_capital:                 mentionsCapital,
          mentions_rcs:                     mentionsRcs,
          mentions_ape:                     mentionsApe,
          mentions_carte_pro:               mentionsCartePro,
          mentions_carte_pro_delivree:      mentionsCarteProDelivree,
          mentions_caisse_garantie:         mentionsCaisseGarantie,
          mentions_caisse_garantie_adresse: mentionsCaisseGarantieAdresse,
          mentions_tva:                     mentionsTva,
          mentions_mail_rgpd:               mentionsMailRgpd,
        }),
      });

      if (response.ok) {
        setOrderSent(true);
        setShowConfirm(false);
        clearCart();
      } else {
        throw new Error('Erreur Webhook Make');
      }
    } catch (err) {
      console.error('Erreur critique :', err);
      alert('Erreur lors de la validation. Vérifie les colonnes Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };


  // ─── ÉTATS SPÉCIAUX ─────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#0f092e] flex items-center justify-center text-white uppercase text-[13px] animate-pulse italic font-black">
      Initialisation du bon de commande...
    </div>
  );

  if (orderSent) return (
    <div className="min-h-screen bg-[#0f092e] flex flex-col items-center justify-center text-center p-6 text-white font-black italic uppercase">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <h2 className="text-6xl mb-6 text-blue-500 tracking-tighter">Transmission OK</h2>
        <p className="text-[13px] mb-12 opacity-50">Ta commande est enregistrée et envoyée en production.</p>
        <Link href="/" className="bg-white text-[#0f092e] px-12 py-6 rounded-full text-[13px] hover:bg-blue-500 hover:text-white transition-all shadow-2xl">
          Retour Boutique
        </Link>
      </motion.div>
    </div>
  );

  const formValid = isFormValid();

  // ── helpers styles ──────────────────────────────────────────────────────────
  const inp = (val: string) =>
    `w-full bg-black/40 border rounded-2xl p-5 text-[13px] font-black outline-none transition-all ${
      !val.trim()
        ? 'border-red-500/30 hover:border-red-500/50 focus:border-red-500'
        : 'border-white/10 hover:border-blue-500/50 focus:border-blue-500'
    }`;

  const inpAlt = (val: string) =>
    `w-full bg-black/40 border rounded-2xl p-5 text-[13px] font-black outline-none transition-all ${
      !val.trim()
        ? 'border-red-500/30 focus:border-red-500'
        : 'border-blue-500/20 focus:border-blue-500'
    }`;

  // champs mentions qui comptent pour la validation (pour le badge ⚠)
  const mentionsLegalesFields = [
    { label: 'Ville sous le logo',        val: mentionsVilleAgence,            set: setMentionsVilleAgence,            ph: 'Ex: ANGERS' },
    { label: 'URL QR Code',               val: mentionsUrlQrCode,              set: setMentionsUrlQrCode,              ph: 'Ex: https://www.guy-hoquet.com/agence-angers' },
    { label: 'Statut Juridique',          val: mentionsStatut,                 set: setMentionsStatut,                 ph: 'Ex: SARL, SAS, EI...' },
    { label: 'Capital Social (€)',        val: mentionsCapital,                set: setMentionsCapital,                ph: 'Ex: 10 000' },
    { label: 'RCS',                       val: mentionsRcs,                    set: setMentionsRcs,                    ph: 'Ex: Paris 123 456 789' },
    { label: 'Code APE',                  val: mentionsApe,                    set: setMentionsApe,                    ph: 'Ex: 6831Z' },
    { label: 'N° Carte Professionnelle',  val: mentionsCartePro,               set: setMentionsCartePro,               ph: 'Ex: CPI 7501 2016 000 012 345' },
    { label: 'Délivrée par la CCI de',    val: mentionsCarteProDelivree,       set: setMentionsCarteProDelivree,       ph: 'Ex: Paris Île-de-France' },
    { label: 'Caisse de Garantie',        val: mentionsCaisseGarantie,         set: setMentionsCaisseGarantie,         ph: 'Ex: GALIAN Assurances' },
    { label: 'Adresse Caisse',            val: mentionsCaisseGarantieAdresse,  set: setMentionsCaisseGarantieAdresse,  ph: 'Ex: 89 rue de la Boétie, 75008 Paris' },
    { label: 'TVA Intracommunautaire',    val: mentionsTva,                    set: setMentionsTva,                    ph: 'Ex: FR 12 123456789' },
    { label: 'Mail RGPD',                 val: mentionsMailRgpd,               set: setMentionsMailRgpd,               ph: 'Ex: informatique-et-libertes@guy-hoquet.com' },
  ] as { label: string; val: string; set: (v: string) => void; ph: string }[];

  const mentionsIncomplets = mentionsLegalesFields.filter(f => !f.val.trim()).length;


  return (
    <div className="min-h-screen bg-[#0f092e] text-white pb-20">

      <header className="py-10 px-6 max-w-6xl mx-auto flex justify-between items-center border-b border-white/10 mb-12">
        <Link href="/" className="text-[13px] font-black uppercase opacity-40 hover:opacity-100 italic transition-all">← Boutique</Link>
        <h1 className="text-[11px] font-black uppercase tracking-[0.4em] italic text-blue-500">Validation Commande</h1>
        <div className="w-24" />
      </header>

      <main className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-12">


          {/* ── 01. IDENTIFICATION ──────────────────────────────────────────── */}
          <section className="bg-blue-600/5 border border-blue-500/20 rounded-[45px] p-10 space-y-4">
            <h2 className="text-[11px] font-black uppercase text-blue-400 italic">01. Identification</h2>
            <div className="space-y-2">
              <label className="text-[12px] font-black opacity-30 italic ml-2 uppercase">Agence</label>
              <div className="bg-black/40 border border-white/10 rounded-2xl p-5 text-[11px] font-black text-blue-400">
                {agencyData?.name || 'Non détectée'}
              </div>
            </div>
          </section>


          {/* ── 02. RÉCAPITULATIF ───────────────────────────────────────────── */}
          <section className="bg-white/[0.02] border border-white/10 rounded-[45px] p-10">
            <h2 className="text-[11px] font-black uppercase text-white/60 italic mb-10">02. Récapitulatif</h2>
            <div className="space-y-6">
              {cart.length === 0 && (
                <p className="text-[13px] font-black uppercase text-white/20 italic text-center py-8">Panier vide</p>
              )}
              {cart.map((item) => (
                <div key={item.cartLineId} className="flex justify-between items-start border-b border-white/5 pb-6 gap-4">
                  <div className="flex flex-col gap-1 flex-grow">
                    <span className="text-[13px] font-black uppercase tracking-tight italic">{item.name}</span>
                    <span className="text-[12px] text-white/30 font-black italic">Quantité : {item.qty}</span>
                    {item.orderedBy && (
                      <span className="text-[12px] text-blue-400 font-black uppercase mt-1">👤 {item.orderedBy}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-[14px] font-black italic">{fmt(item.price * item.qty)}€</p>
                      <p className="text-[11px] font-black opacity-30 uppercase">HT</p>
                    </div>
                    <button type="button" onClick={() => removeFromCart(item.cartLineId)}
                      className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center transition-all text-sm font-black">
                      ×
                    </button>
                  </div>
                </div>
              ))}
              {cart.length > 0 && (
                <div className="pt-4 space-y-2">
                  <div className="flex justify-between text-[13px] font-black uppercase italic opacity-50">
                    <span>Sous-total HT</span><span>{fmt(totalHT)}€</span>
                  </div>
                  <div className="flex justify-between text-[13px] font-black uppercase italic opacity-30">
                    <span>TVA (20%)</span><span>{fmt(totalTTC - totalHT)}€</span>
                  </div>
                  <div className="flex justify-between text-[13px] font-black uppercase italic border-t border-white/10 pt-3">
                    <span className="text-white/60">Total TTC</span>
                    <span className="text-blue-400">{fmt(totalTTC)}€</span>
                  </div>
                </div>
              )}
            </div>
          </section>


          {/* ── 03. INFORMATIONS DE LIVRAISON ───────────────────────────────── */}
          <section className="bg-white/[0.02] border border-white/10 rounded-[45px] p-10 space-y-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-[11px] font-black uppercase text-white/60 italic">03. Informations de Livraison</h2>
                {!useAltAddress && (
                  <p className="text-[11px] font-black text-white/20 uppercase tracking-widest mt-1">
                    Modifications sauvegardées dans vos infos agence
                  </p>
                )}
              </div>
              <button type="button" onClick={() => setUseAltAddress(!useAltAddress)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[11px] font-black uppercase tracking-widest transition-all ${
                  useAltAddress
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-white/10 bg-white/5 text-white/30 hover:text-white/60 hover:border-white/20'
                }`}>
                <span className={`w-2 h-2 rounded-full transition-all ${useAltAddress ? 'bg-blue-400' : 'bg-white/20'}`} />
                {useAltAddress ? '✓ Adresse différente' : '+ Adresse différente'}
              </button>
            </div>

            <div className="space-y-6">
              {!useAltAddress ? (
                <>
                  <input placeholder="ADRESSE DE LIVRAISON *" value={address}   onChange={(e) => setAddress(e.target.value)}   className={inp(address)} />
                  <div className="grid grid-cols-2 gap-6">
                    <input placeholder="CODE POSTAL *"         value={zipCode}  onChange={(e) => setZipCode(e.target.value)}   className={inp(zipCode)} />
                    <input placeholder="VILLE *"               value={city}     onChange={(e) => setCity(e.target.value)}      className={inp(city)} />
                  </div>
                  <input placeholder="TÉLÉPHONE MOBILE *"      value={phone}    onChange={(e) => setPhone(e.target.value)}     className={inp(phone)} />
                  <input placeholder="TÉLÉPHONE FIXE AGENCE *" value={phoneFix} onChange={(e) => setPhoneFix(e.target.value)} className={inp(phoneFix)} />
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Numéro SIRET *</label>
                    <input placeholder="Ex: 123 456 789 00012" value={siret} onChange={(e) => setSiret(e.target.value)}
                      maxLength={17} className={inp(siret)} />
                  </div>
                </>
              ) : (
                <div className="space-y-6 border border-blue-500/20 bg-blue-600/5 rounded-[30px] p-6">
                  <p className="text-[11px] font-black uppercase text-blue-400/60 tracking-widest">
                    Adresse unique pour cette commande — non sauvegardée dans vos infos agence
                  </p>
                  <input placeholder="ADRESSE DE LIVRAISON *"  value={altAddress}  onChange={(e) => setAltAddress(e.target.value)}   className={inpAlt(altAddress)} />
                  <div className="grid grid-cols-2 gap-6">
                    <input placeholder="CODE POSTAL *"          value={altZipCode} onChange={(e) => setAltZipCode(e.target.value)}   className={inpAlt(altZipCode)} />
                    <input placeholder="VILLE *"                value={altCity}    onChange={(e) => setAltCity(e.target.value)}      className={inpAlt(altCity)} />
                  </div>
                  <input placeholder="TÉLÉPHONE MOBILE *"       value={altPhone}    onChange={(e) => setAltPhone(e.target.value)}    className={inpAlt(altPhone)} />
                  <input placeholder="TÉLÉPHONE FIXE AGENCE *"  value={altPhoneFix} onChange={(e) => setAltPhoneFix(e.target.value)} className={inpAlt(altPhoneFix)} />
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400/50 ml-2">
                      Numéro SIRET * <span className="normal-case italic font-bold text-blue-400/40 ml-1">— non sauvegardé</span>
                    </label>
                    <input placeholder="Ex: 123 456 789 00012" value={siret} onChange={(e) => setSiret(e.target.value)}
                      maxLength={17} className={inpAlt(siret)} />
                  </div>
                </div>
              )}
            </div>
          </section>


          {/* ── 04. INFORMATIONS FACTURATION & LÉGALES ──────────────────────── */}
          <section className="bg-white/[0.02] border border-white/10 rounded-[45px] p-10 space-y-8">
            <div>
              <h2 className="text-[11px] font-black uppercase text-white/60 italic">04. Informations Facturation & Légales</h2>
              <p className="text-[11px] font-black text-white/20 uppercase tracking-widest mt-1">
                Modifications sauvegardées dans vos infos agence
              </p>
            </div>

            <div className="space-y-5">

              {/* ── Mail de facturation — TOUJOURS VISIBLE ── */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-2 flex items-center gap-2">
                  Mail de facturation <span className="text-red-400">*</span>
                  {mentionsMailFacturation && <span className="text-blue-400/50 normal-case font-bold tracking-normal">· agence</span>}
                </label>
                <input value={mentionsMailFacturation} onChange={(e) => setMentionsMailFacturation(e.target.value)}
                  placeholder="Ex: compta@guy-hoquet-angers.com" className={inp(mentionsMailFacturation)} />
              </div>

              {/* ── Nom société — TOUJOURS VISIBLE ── */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-2 flex items-center gap-2">
                  Nom Société <span className="text-red-400">*</span>
                  {mentionsNomSociete && <span className="text-blue-400/50 normal-case font-bold tracking-normal">· agence</span>}
                </label>
                <input value={mentionsNomSociete} onChange={(e) => setMentionsNomSociete(e.target.value)}
                  placeholder="Ex: GUY HOQUET PARIS 1" className={inp(mentionsNomSociete)} />
              </div>

              {/* ── ACCORDÉON : Mentions légales complètes ── */}
              <div className="border border-white/10 rounded-[28px] overflow-hidden">

                {/* Bouton toggle */}
                <button type="button" onClick={() => setMentionsOpen(!mentionsOpen)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-black uppercase tracking-widest text-white/40">
                      Mentions légales complètes
                    </span>
                    {/* Badge d'alerte si des champs sont vides */}
                    {mentionsIncomplets > 0 && (
                      <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                        {mentionsIncomplets} champ{mentionsIncomplets > 1 ? 's' : ''} vide{mentionsIncomplets > 1 ? 's' : ''}
                      </span>
                    )}
                    {mentionsIncomplets === 0 && (
                      <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                        ✓ Complet
                      </span>
                    )}
                  </div>
                  <motion.span
                    animate={{ rotate: mentionsOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-white/30 text-lg font-black"
                  >
                    ↓
                  </motion.span>
                </button>

                {/* Contenu déroulant */}
                <AnimatePresence initial={false}>
                  {mentionsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 space-y-5 border-t border-white/5 pt-5">
                        {mentionsLegalesFields.map(({ label, val, set, ph }) => (
                          <div key={label} className="space-y-1">
                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-2 flex items-center gap-2">
                              {label} <span className="text-red-400">*</span>
                            </label>
                            <input value={val} onChange={(e) => set(e.target.value)}
                              placeholder={ph} className={inp(val)} />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>
          </section>

        </div>


        {/* ── COLONNE DROITE : TOTAL ───────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white p-12 rounded-[50px] text-[#0f092e] sticky top-12 text-center shadow-2xl">
            <h2 className="text-[13px] font-black uppercase opacity-30 italic mb-4">Total à régler</h2>
            <span className="text-6xl font-black italic tracking-tighter">{fmt(totalHT)}€</span>
            <p className="text-[11px] font-black uppercase opacity-30 mt-1 tracking-widest">Hors Taxes (HT)</p>
            <div className="mt-4 bg-black/5 rounded-2xl px-6 py-4">
              <span className="text-2xl font-black italic tracking-tighter opacity-60">{fmt(totalTTC)}€</span>
              <p className="text-[11px] font-black uppercase opacity-30 mt-0.5 tracking-widest">TTC (TVA 20%)</p>
            </div>
            {!formValid && cart.length > 0 && (
              <p className="text-[11px] font-black uppercase text-red-400 mt-6 italic">Tous les champs sont obligatoires</p>
            )}
            <button onClick={() => setShowConfirm(true)} disabled={cart.length === 0 || !formValid}
              className="w-full mt-6 py-7 bg-blue-600 text-white rounded-3xl font-black uppercase text-[13px] hover:bg-[#0f092e] transition-all shadow-xl disabled:opacity-20 disabled:cursor-not-allowed">
              {!formValid && cart.length > 0 ? 'Formulaire incomplet' : 'Vérifier la commande'}
            </button>
          </div>
        </div>
      </main>


      {/* ── OVERLAY DE CONFIRMATION ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0f092e]/95 backdrop-blur-2xl"
              onClick={() => setShowConfirm(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white text-[#0f092e] w-full max-w-2xl rounded-[60px] p-14 space-y-8 shadow-2xl overflow-y-auto max-h-[90vh] text-center">
              <div className="absolute top-0 left-0 w-full h-2 bg-blue-600 rounded-t-[60px]" />
              <h3 className="text-3xl font-black uppercase italic text-blue-600 tracking-tighter">Confirmation Finale</h3>
              <p className="text-[13px] font-black opacity-40 uppercase italic">
                Toute commande validée part directement en production.
              </p>

              <div className="bg-gray-50 rounded-[35px] p-8 space-y-4 text-left">
                <div className="flex justify-between text-[13px] font-black uppercase italic">
                  <span className="opacity-40">Agence</span>
                  <span className="text-blue-600">{agencyData?.name}</span>
                </div>
                <div className="flex justify-between text-[13px] font-black uppercase italic">
                  <span className="opacity-40">Livraison</span>
                  <span className="text-right">
                    {useAltAddress ? `${altAddress}, ${altZipCode} ${altCity}` : `${address}, ${zipCode} ${city}`}
                  </span>
                </div>
                <div className="flex justify-between text-[13px] font-black uppercase italic">
                  <span className="opacity-40">Tél. fixe agence</span>
                  <span>{useAltAddress ? altPhoneFix : phoneFix}</span>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <span className="text-[11px] font-black uppercase opacity-30 tracking-widest block">Produits</span>
                  {cart.map((item) => (
                    <div key={item.cartLineId} className="flex justify-between items-start gap-4">
                      <div>
                        <p className="text-[13px] font-black uppercase italic leading-tight">{item.name}</p>
                        <p className="text-[11px] font-bold opacity-30 mt-0.5">
                          x{item.qty}
                          {item.orderedBy && <span className="text-blue-500 ml-2">— {item.orderedBy}</span>}
                        </p>
                      </div>
                      <span className="text-[13px] font-black shrink-0 tabular-nums">
                        {fmt(item.price * item.qty)}€
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between text-[13px] font-black uppercase italic border-t border-gray-200 pt-4">
                  <span className="opacity-40">Total HT</span>
                  <span className="text-2xl text-blue-600">{fmt(totalHT)}€</span>
                </div>
                <div className="flex justify-between text-[13px] font-black uppercase italic">
                  <span className="opacity-40">Total TTC (20%)</span>
                  <span className="text-lg text-gray-400">{fmt(totalTTC)}€</span>
                </div>
              </div>

              <button onClick={handleFinalSubmit} disabled={isSubmitting}
                className="w-full py-7 bg-[#0f092e] text-white rounded-[25px] font-black uppercase text-[11px] shadow-xl hover:bg-blue-600 transition-all disabled:opacity-50">
                {isSubmitting ? 'Transmission en cours...' : 'Confirmer la commande'}
              </button>
              <button onClick={() => setShowConfirm(false)}
                className="w-full text-[12px] font-black uppercase opacity-30 italic hover:opacity-100 transition-all">
                Retour aux modifications
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}