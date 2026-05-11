'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function HistoriqueCommandes() {
  const [orders, setOrders]               = useState<any[]>([]);
  const [loading, setLoading]             = useState(true);
  const [agencyName, setAgencyName]       = useState("");
  const [agencyData, setAgencyData]       = useState<any>(null);
  const [isReordering, setIsReordering]   = useState(false);
  const [orderToReorder, setOrderToReorder] = useState<any | null>(null);
  const [showFacturation, setShowFacturation] = useState(false);

  // Champs éditables livraison
  const [reorderAddress, setReorderAddress] = useState("");
  const [reorderZip, setReorderZip]         = useState("");
  const [reorderCity, setReorderCity]       = useState("");
  const [reorderPhone, setReorderPhone]     = useState("");
  const [reorderCollab, setReorderCollab]   = useState("");

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('agency_id, agencies(name)')
        .eq('id', user.id)
        .single();

      if (profile?.agencies) {
        const name = (profile.agencies as any).name;
        setAgencyName(name);

        // Charger les infos complètes de l'agence (mentions légales)
        const { data: agency } = await supabase
          .from('agencies')
          .select('*')
          .eq('name', name)
          .single();
        setAgencyData(agency);

        const { data: history, error } = await supabase
          .from('orders')
          .select(`*, profiles!user_id (full_name)`)
          .eq('agency_name', name)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setOrders(history || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // ─── Ouvrir overlay recommande ────────────────────────────────
  const openReorder = (order: any) => {
    setReorderAddress(order.delivery_address || "");
    setReorderZip(order.zip_code || "");
    setReorderCity(order.city || "");
    setReorderPhone(order.client_phone || "");
    setReorderCollab(order.client_email || "");
    setShowFacturation(false);
    setOrderToReorder(order);
  };

  // ─── EXPORT GLOBAL ────────────────────────────────────────────
  const exportAllToCSV = () => {
    if (orders.length === 0) return;
    const tva = 1.20;
    const headers = ["Date", "Acheteur", "Articles", "Adresse", "Total HT", "Total TTC"];
    const rows = orders.map(order => [
      new Date(order.created_at).toLocaleDateString('fr-FR'),
      order.profiles?.full_name || 'Système',
      order.produits_liste.replace(/,/g, ' |'),
      order.delivery_address.replace(/,/g, ' '),
      `${order.total_ht?.toFixed(2)}€`,
      `${(order.total_ht * tva).toFixed(2)}€`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Full_Historique_${agencyName.replace(/\s/g, '_')}.csv`);
    link.click();
  };

  // ─── EXPORT UNITAIRE ──────────────────────────────────────────
  const exportSingleCSV = (order: any) => {
    const tva = 1.20;
    const headers = ["Date", "Acheteur", "Articles", "Adresse", "Total HT", "Total TTC"];
    const row = [
      new Date(order.created_at).toLocaleDateString('fr-FR'),
      order.profiles?.full_name || 'Système',
      order.produits_liste.replace(/,/g, ' |'),
      order.delivery_address.replace(/,/g, ' '),
      `${order.total_ht?.toFixed(2)}€`,
      `${(order.total_ht * tva).toFixed(2)}€`,
    ];
    const csvContent = "data:text/csv;charset=utf-8," + [headers, row].map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Commande_${order.id.slice(0, 5)}.csv`);
    link.click();
  };

  // ─── RECOMMANDER + WEBHOOK MAKE ──────────────────────────────
  const confirmReorder = async () => {
    if (!orderToReorder) return;
    setIsReordering(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Récupérer le prochain order_number
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

      // 2. Insérer dans Supabase
      const { error } = await supabase.from('orders').insert([{
        order_number:     nextOrderId,
        agency_name:      orderToReorder.agency_name,
        client_email:     reorderCollab,
        client_phone:     reorderPhone,
        delivery_address: reorderAddress,
        zip_code:         reorderZip,
        city:             reorderCity,
        siret:            orderToReorder.siret,
        produits_liste:   orderToReorder.produits_liste,
        quantite_liste:   orderToReorder.quantite_liste,
        items:            orderToReorder.items,
        total_ht:         orderToReorder.total_ht,
        instructions:     `(RECO) - ${orderToReorder.instructions || ''}`,
        status:           'En attente',
        user_id:          user?.id,
      }]);
      if (error) throw error;

      const totalTTC = (orderToReorder.total_ht * 1.20).toFixed(2);

      // 3. Reconstruire itemsPayload depuis items sauvegardés
      const itemsPayload = (orderToReorder.items || []).map((item: any) => ({
        produit:            item.name       || item.produit    || "",
        quantite:           item.qty        || item.quantite   || "",
        prix_ligne:         item.total_row  || item.prix_ligne || (item.price_unit * item.qty)?.toFixed(2) || "",
        membre:             item.ordered_by || item.membre     || reorderCollab,
        nominatif_prenom:   item.nominatif_prenom   || "",
        nominatif_nom:      item.nominatif_nom      || "",
        nominatif_mail:     item.nominatif_mail     || "",
        nominatif_tel:      item.nominatif_tel      || "",
        nominatif_fonction: item.nominatif_fonction || "",
        nominatif_photo:    item.nominatif_photo    || "",
      }));

      // 4. Envoyer au webhook Make
      await fetch('https://hook.eu1.make.com/mb6ok4o2jv41vrhd37r101wi98b1lfz4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number:        nextOrderId,
          agency_name:         orderToReorder.agency_name,
          adresse:             reorderAddress,
          code_postal:         reorderZip,
          ville:               reorderCity,
          tel:                 reorderPhone,
          siret:               orderToReorder.siret || agencyData?.siret || "",
          collaborateur_nom:   reorderCollab,
          collaborateur_email: agencyData?.agence_email || "",
          collaborateur_phone: reorderPhone,
          items:               itemsPayload,
          total_ht:            orderToReorder.total_ht,
          total_ttc:           totalTTC,
          date:                new Date().toLocaleString('fr-FR'),
          // Mentions légales depuis l'agence courante
          mentions_nom_societe:             agencyData?.mentions_nom_societe             || "",
          mentions_statut:                  agencyData?.mentions_statut                  || "",
          mentions_capital:                 agencyData?.mentions_capital                 || "",
          mentions_rcs:                     agencyData?.mentions_rcs                     || "",
          mentions_ape:                     agencyData?.mentions_ape                     || "",
          mentions_carte_pro:               agencyData?.mentions_carte_pro               || "",
          mentions_carte_pro_delivree:      agencyData?.mentions_carte_pro_delivree      || "",
          mentions_caisse_garantie:         agencyData?.mentions_caisse_garantie         || "",
          mentions_caisse_garantie_adresse: agencyData?.mentions_caisse_garantie_adresse || "",
          mentions_tva:                     agencyData?.mentions_tva                     || "",
          mentions_mail_rgpd:               agencyData?.mentions_mail_rgpd               || "",
        }),
      });

      setOrderToReorder(null);
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la recommande.");
    } finally {
      setIsReordering(false);
    }
  };

  // ─── SUPPRIMER ────────────────────────────────────────────────
  const deleteOrder = async (orderId: string) => {
    if (!confirm("Supprimer cette commande de l'historique ?")) return;
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) { alert("Erreur lors de la suppression."); return; }
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  if (loading) return (
    <div className="p-20 text-white font-black uppercase text-center animate-pulse">
      Chargement...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* ── HEADER ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end border-b border-white/10 pb-8 gap-6">
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter text-blue-500">Historique</h1>
            <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.3em] mt-2 italic">Agence : {agencyName}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportAllToCSV}
              className="text-[9px] font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-6 py-4 rounded-2xl hover:bg-blue-500 hover:text-white transition-all"
            >
              Exporter Tout (.CSV)
            </button>
            <Link
              href="/"
              className="text-[9px] font-black uppercase bg-white/5 border border-white/10 px-6 py-4 rounded-2xl hover:bg-white/10 transition-all text-center"
            >
              Boutique
            </Link>
          </div>
        </div>

        {/* ── LISTE DES COMMANDES ─────────────────────────────────── */}
        <div className="space-y-4">
          {orders.length === 0 && (
            <p className="text-center text-[10px] font-black uppercase text-white/20 italic py-20">
              Aucune commande pour le moment
            </p>
          )}
          {orders.map((order) => {
            const totalTTC = (order.total_ht || 0) * 1.20;
            return (
              <div
                key={order.id}
                onClick={() => exportSingleCSV(order)}
                className="bg-white/[0.03] border border-white/10 rounded-[35px] p-7 hover:bg-white/[0.06] hover:border-blue-500/30 transition-all group cursor-pointer"
              >
                <div className="flex flex-col lg:flex-row gap-8 items-center">

                  <div className="w-full lg:w-1/4 border-r border-white/5">
                    <span className="text-[8px] font-black uppercase text-blue-500/60 block mb-1">Passée par</span>
                    <h2 className="text-xl font-black uppercase truncate">{order.profiles?.full_name || 'Système'}</h2>
                    <p className="text-[10px] font-bold opacity-30 mt-2">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>

                  <div className="flex-1 w-full bg-white/5 rounded-2xl p-5 border border-white/5 group-hover:bg-white/10 transition-colors">
                    <span className="text-[8px] font-black uppercase text-white/20 tracking-widest mb-2 block italic">Cliquez pour CSV ↓</span>
                    <p className="text-sm font-bold text-white leading-relaxed">
                      {order.produits_liste.split(',').join(' • ')}
                    </p>
                    <p className="mt-3 text-[10px] text-white/40 truncate">📍 {order.delivery_address}</p>
                  </div>

                  <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end">
                    <div className="text-right border-r border-white/5 pr-6">
                      <div className="flex items-center justify-end gap-2 opacity-30">
                        <span className="text-[8px] font-black uppercase mr-1">HT</span>
                        <span className="text-sm font-bold">{order.total_ht?.toFixed(2)}€</span>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-[9px] font-black text-blue-500 uppercase italic">TTC</span>
                        <span className="text-3xl font-black italic tabular-nums leading-none">{totalTTC.toFixed(2)}€</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); openReorder(order); }}
                        className="bg-white text-[#0f092e] hover:bg-blue-600 hover:text-white text-[9px] font-black uppercase px-8 py-5 rounded-2xl transition-all active:scale-95 shadow-xl"
                      >
                        Recommander
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteOrder(order.id); }}
                        className="w-12 h-12 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center transition-all active:scale-95 text-lg font-black shrink-0"
                        title="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── OVERLAY RECOMMANDER ─────────────────────────────────────── */}
      <AnimatePresence>
        {orderToReorder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0f092e]/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white text-[#0f092e] w-full max-w-lg rounded-[45px] p-12 space-y-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-blue-600 rounded-t-[45px]" />

              <div className="text-center pt-2">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter text-blue-600">
                  Recommander
                </h3>
                <p className="text-[9px] font-black uppercase opacity-30 mt-2 tracking-widest">
                  Vérifie les infos avant de confirmer
                </p>
              </div>

              {/* Produits (lecture seule) */}
              <div className="bg-blue-50 rounded-[28px] p-6">
                <span className="text-[8px] font-black uppercase text-blue-400 tracking-widest block mb-3">
                  Produits commandés
                </span>
                <p className="text-[11px] font-black uppercase leading-relaxed text-[#0f092e]">
                  {orderToReorder.produits_liste.split(',').join(' • ')}
                </p>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-blue-100">
                  <span className="text-[8px] font-black uppercase opacity-40">Total HT</span>
                  <span className="text-xl font-black italic text-blue-600">
                    {orderToReorder.total_ht?.toFixed(2)}€
                  </span>
                </div>
              </div>

              {/* Champs livraison modifiables */}
              <div className="space-y-4">
                <p className="text-[8px] font-black uppercase opacity-30 tracking-widest">
                  Livraison — modifiable
                </p>

                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest opacity-40 ml-2 block">Collaborateur</label>
                  <input
                    value={reorderCollab}
                    onChange={(e) => setReorderCollab(e.target.value)}
                    placeholder="Nom du collaborateur"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-[10px] font-black outline-none focus:border-blue-400 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest opacity-40 ml-2 block">Adresse</label>
                  <input
                    value={reorderAddress}
                    onChange={(e) => setReorderAddress(e.target.value)}
                    placeholder="Adresse de livraison"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-[10px] font-black uppercase outline-none focus:border-blue-400 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest opacity-40 ml-2 block">Code postal</label>
                    <input
                      value={reorderZip}
                      onChange={(e) => setReorderZip(e.target.value)}
                      placeholder="75001"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-[10px] font-black outline-none focus:border-blue-400 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest opacity-40 ml-2 block">Ville</label>
                    <input
                      value={reorderCity}
                      onChange={(e) => setReorderCity(e.target.value)}
                      placeholder="Paris"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-[10px] font-black uppercase outline-none focus:border-blue-400 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest opacity-40 ml-2 block">Téléphone</label>
                  <input
                    value={reorderPhone}
                    onChange={(e) => setReorderPhone(e.target.value)}
                    placeholder="06 00 00 00 00"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-[10px] font-black outline-none focus:border-blue-400 transition-all"
                  />
                </div>
              </div>

              {/* ── ACCORDION FACTURATION ─────────────────────────── */}
              <div className="border border-gray-100 rounded-[28px] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowFacturation(!showFacturation)}
                  className="w-full flex justify-between items-center px-6 py-5 text-left hover:bg-gray-50 transition-all"
                >
                  <span className="text-[8px] font-black uppercase tracking-widest opacity-40">
                    Informations de facturation
                  </span>
                  <span className={`text-[10px] font-black opacity-30 transition-transform duration-300 ${showFacturation ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                <AnimatePresence>
                  {showFacturation && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 space-y-3 border-t border-gray-100 pt-4">
                        {[
                          { label: 'Nom société',       val: agencyData?.mentions_nom_societe },
                          { label: 'Statut',            val: agencyData?.mentions_statut },
                          { label: 'Capital',           val: agencyData?.mentions_capital ? `${agencyData.mentions_capital}€` : null },
                          { label: 'RCS',               val: agencyData?.mentions_rcs },
                          { label: 'Code APE',          val: agencyData?.mentions_ape },
                          { label: 'Carte pro',         val: agencyData?.mentions_carte_pro },
                          { label: 'Délivrée par',      val: agencyData?.mentions_carte_pro_delivree },
                          { label: 'Caisse garantie',   val: agencyData?.mentions_caisse_garantie },
                          { label: 'Adresse caisse',    val: agencyData?.mentions_caisse_garantie_adresse },
                          { label: 'TVA',               val: agencyData?.mentions_tva },
                          { label: 'Mail RGPD',         val: agencyData?.mentions_mail_rgpd },
                          { label: 'SIRET',             val: orderToReorder.siret },
                        ].map(({ label, val }) => val ? (
                          <div key={label} className="flex justify-between items-start gap-4 text-[9px]">
                            <span className="font-black uppercase opacity-30 shrink-0">{label}</span>
                            <span className="font-bold text-right text-gray-700 break-all">{val}</span>
                          </div>
                        ) : null)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Boutons */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => setOrderToReorder(null)}
                  className="py-5 text-[10px] font-black uppercase opacity-30 hover:opacity-60 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmReorder}
                  disabled={isReordering || !reorderAddress.trim() || !reorderCollab.trim()}
                  className="py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg hover:bg-[#0f092e] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isReordering ? "Envoi..." : "✓ Confirmer"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}