'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function HistoriqueCommandes() {
  const { addToCart, clearCart } = useCart();
  const router = useRouter();

  const [orders, setOrders]                   = useState<any[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [agencyName, setAgencyName]           = useState("");
  const [agencyData, setAgencyData]           = useState<any>(null);
  const [showFacturation, setShowFacturation] = useState(false);

  // ─── Fetch commandes ─────────────────────────────────────────────
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

  // ─── RECOMMANDER ─────────────────────────────────────────────────
  // Vide le panier → réinjecte chaque item → redirige vers /panier
  // Le flux normal du panier gère tout le reste (Make, Google Sheets, etc.)
  const handleReorder = (order: any) => {
    clearCart();

    (order.items || []).forEach((item: any) => {
      addToCart({
        id:        item.id          || item.name      || item.produit || "",
        name:      item.name        || item.produit   || "",
        price:     parseFloat(item.price_unit || item.prix_unitaire || 0),
        qty:       item.qty         || item.quantite  || 1,
        category:  item.category    || item.categorie || "",
        color:     item.color       || item.couleur   || undefined,
        orderedBy: item.ordered_by  || item.membre    || null,
      });
    });

    router.push('/panier');
  };

  // ─── Export CSV global ───────────────────────────────────────────
  const exportAllToCSV = () => {
    if (orders.length === 0) return;
    const headers = ["Date", "Acheteur", "Articles", "Adresse", "Total HT", "Total TTC"];
    const rows = orders.map(order => [
      new Date(order.created_at).toLocaleDateString('fr-FR'),
      order.profiles?.full_name || 'Système',
      order.produits_liste.replace(/,/g, ' |'),
      order.delivery_address.replace(/,/g, ' '),
      `${order.total_ht?.toFixed(2)}€`,
      `${(order.total_ht * 1.20).toFixed(2)}€`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers, ...rows].map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Full_Historique_${agencyName.replace(/\s/g, '_')}.csv`);
    link.click();
  };

  // ─── Export CSV unitaire ─────────────────────────────────────────
  const exportSingleCSV = (order: any) => {
    const headers = ["Date", "Acheteur", "Articles", "Adresse", "Total HT", "Total TTC"];
    const row = [
      new Date(order.created_at).toLocaleDateString('fr-FR'),
      order.profiles?.full_name || 'Système',
      order.produits_liste.replace(/,/g, ' |'),
      order.delivery_address.replace(/,/g, ' '),
      `${order.total_ht?.toFixed(2)}€`,
      `${(order.total_ht * 1.20).toFixed(2)}€`,
    ];
    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers, row].map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Commande_${order.id.slice(0, 5)}.csv`);
    link.click();
  };

  // ─── Supprimer ───────────────────────────────────────────────────
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

        {/* ── HEADER ───────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end border-b border-white/10 pb-8 gap-6">
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter text-blue-500">Historique</h1>
            <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.3em] mt-2 italic">
              Agence : {agencyName}
            </p>
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

        {/* ── LISTE DES COMMANDES ──────────────────────────────────── */}
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
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                  {/* Passée par */}
                  <div className="w-full lg:w-1/4 lg:border-r border-white/5 lg:pr-8 shrink-0">
                    <span className="text-[8px] font-black uppercase text-blue-500/60 block mb-1">Passée par</span>
                    <h2 className="text-xl font-black uppercase truncate">
                      {order.profiles?.full_name || 'Système'}
                    </h2>
                    <p className="text-[10px] font-bold opacity-30 mt-2">
                      {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  {/* Produits */}
                  <div className="flex-1 w-full bg-white/5 rounded-2xl p-5 border border-white/5 group-hover:bg-white/10 transition-colors">
                    <span className="text-[8px] font-black uppercase text-white/20 tracking-widest mb-3 block italic">
                      Cliquez pour CSV ↓
                    </span>
                    <div className="space-y-3">
                      {(order.items && order.items.length > 0)
                        ? order.items.map((item: any, idx: number) => {
                            const nom    = item.name     || item.produit  || "Produit";
                            const qte    = item.qty      || item.quantite || 1;
                            const ht     = parseFloat(item.total_row || item.prix_ligne || 0);
                            const ttc    = ht * 1.20;
                            const membre = item.ordered_by || null;
                            return (
                              <div key={idx} className="flex justify-between items-start gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                                <div>
                                  <p className="text-[11px] font-black uppercase leading-tight">{nom}</p>
                                  <p className="text-[8px] font-bold opacity-30 mt-0.5">
                                    x{qte}
                                    {membre && <span className="text-blue-400 ml-2">— {membre}</span>}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-[10px] font-black tabular-nums">
                                    {ht.toFixed(2)}€ <span className="text-[8px] opacity-30">HT</span>
                                  </p>
                                  <p className="text-[9px] font-bold text-blue-400 tabular-nums">
                                    {ttc.toFixed(2)}€ <span className="opacity-60">TTC</span>
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        : (
                          <p className="text-sm font-bold text-white leading-relaxed">
                            {order.produits_liste.split(',').join(' • ')}
                          </p>
                        )
                      }
                    </div>
                    <p className="mt-4 text-[10px] text-white/40 truncate">📍 {order.delivery_address}</p>
                  </div>

                  {/* Prix + boutons */}
                  <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end shrink-0">
                    <div className="text-right border-r border-white/5 pr-6">
                      <div className="flex items-center justify-end gap-2 opacity-30">
                        <span className="text-[8px] font-black uppercase">HT</span>
                        <span className="text-sm font-bold">{order.total_ht?.toFixed(2)}€</span>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-[9px] font-black text-blue-500 uppercase italic">TTC</span>
                        <span className="text-3xl font-black italic tabular-nums leading-none">
                          {totalTTC.toFixed(2)}€
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* ← SEUL CHANGEMENT : onClick appelle handleReorder */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleReorder(order); }}
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
    </div>
  );
}