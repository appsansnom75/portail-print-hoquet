'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function HistoriqueCommandes() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [agencyName, setAgencyName] = useState("");
  const [isReordering, setIsReordering] = useState(false);
  const [orderToReorder, setOrderToReorder] = useState<any | null>(null);

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('agency_id, agencies(name)').eq('id', user.id).single();
      if (profile?.agencies) {
        const name = (profile.agencies as any).name;
        setAgencyName(name);
        const { data: history, error } = await supabase.from('orders').select(`*, profiles!user_id (full_name)`).eq('agency_name', name).order('created_at', { ascending: false });
        if (error) throw error;
        setOrders(history || []);
      }
    } catch (err) { console.error("Erreur:", err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  // FONCTION EXPORT CSV
  const exportToCSV = (order: any) => {
    const tva = 1.20;
    const headers = ["Date", "Acheteur", "Articles", "Adresse", "Total HT", "Total TTC"];
    const row = [
      new Date(order.created_at).toLocaleDateString('fr-FR'),
      order.profiles?.full_name || 'Système',
      order.produits_liste.replace(/,/g, ' |'),
      order.delivery_address.replace(/,/g, ' '),
      `${order.total_ht?.toFixed(2)}€`,
      `${(order.total_ht * tva).toFixed(2)}€`
    ];
    const csvContent = "data:text/csv;charset=utf-8," + [headers, row].map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Facture_${order.profiles?.full_name || 'Commande'}_${order.id.slice(0, 5)}.csv`);
    link.click();
  };

  const confirmReorder = async () => {
    if (!orderToReorder) return;
    setIsReordering(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('orders').insert([{
          agency_name: orderToReorder.agency_name,
          client_email: orderToReorder.client_email,
          client_phone: orderToReorder.client_phone,
          delivery_address: orderToReorder.delivery_address,
          produits_liste: orderToReorder.produits_liste,
          quantite_liste: orderToReorder.quantite_liste,
          total_ht: orderToReorder.total_ht,
          instructions: `(RECO) - ${orderToReorder.instructions || ''}`,
          status: 'En attente',
          user_id: user?.id 
      }]);
      if (error) throw error;
      setOrderToReorder(null);
      fetchOrders();
    } catch (err) { alert("Erreur lors de la recommandation"); } finally { setIsReordering(false); }
  };

  if (loading) return <div className="p-20 text-white font-black uppercase text-center animate-pulse tracking-[0.3em]">Chargement...</div>;

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="flex justify-between items-end border-b border-white/10 pb-8">
            <div>
              <h1 className="text-5xl font-black uppercase italic tracking-tighter text-blue-500">Historique</h1>
              <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.3em] mt-2 italic text-white/50 underline underline-offset-4">Cliquez sur une commande pour l'exporter en CSV</p>
            </div>
            <Link href="/" className="text-[10px] font-black uppercase bg-white/5 border border-white/10 px-6 py-4 rounded-2xl hover:bg-white/10 transition-all">Boutique</Link>
        </div>

        {/* LISTE DES COMMANDES */}
        <div className="space-y-4">
          {orders.map((order) => {
            const totalTTC = (order.total_ht || 0) * 1.20;
            return (
              <div 
                key={order.id} 
                onClick={() => exportToCSV(order)}
                className="bg-white/[0.03] border border-white/10 rounded-[35px] p-7 hover:bg-white/[0.06] hover:border-blue-500/30 transition-all group cursor-pointer active:scale-[0.99]"
              >
                <div className="flex flex-col lg:flex-row gap-8 items-center">
                  
                  {/* 1. LE CLIENT */}
                  <div className="w-full lg:w-1/4 border-r border-white/5">
                    <span className="text-[8px] font-black uppercase text-blue-500/60 tracking-[0.2em] block mb-1">Acheteur</span>
                    <h2 className="text-2xl font-black uppercase tracking-tight truncate leading-none">
                      {order.profiles?.full_name || 'Système'}
                    </h2>
                    <p className="text-[10px] font-bold opacity-30 mt-2">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>

                  {/* 2. RÉCAP ARTICLES (CENTRE) */}
                  <div className="flex-1 w-full bg-white/5 rounded-2xl p-5 border border-white/5 group-hover:bg-white/10 transition-colors">
                      <span className="text-[8px] font-black uppercase text-white/20 tracking-widest mb-2 block italic">Récapitulatif Articles</span>
                      <p className="text-sm font-bold text-white leading-relaxed">
                          {order.produits_liste.split(',').join(' • ')}
                      </p>
                      <div className="mt-3 text-[10px] text-white/40 truncate flex items-center gap-2 font-medium">
                        <span>📍</span> {order.delivery_address}
                      </div>
                  </div>

                  {/* 3. PRIX HT/TTC & ACTION */}
                  <div className="flex items-center gap-8 w-full lg:w-auto justify-between lg:justify-end">
                    <div className="text-right border-r border-white/5 pr-6">
                      <div className="flex items-center justify-end gap-2 opacity-30">
                        <span className="text-[8px] font-black uppercase tracking-tighter italic">HT</span>
                        <span className="text-sm font-bold tabular-nums">{order.total_ht?.toFixed(2)}€</span>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-[10px] font-black uppercase text-blue-500 italic">TTC</span>
                        <span className="text-3xl font-black italic tabular-nums leading-none">{totalTTC.toFixed(2)}€</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); setOrderToReorder(order); }}
                      className="bg-white text-[#0f092e] hover:bg-blue-600 hover:text-white text-[9px] font-black uppercase px-8 py-5 rounded-2xl transition-all active:scale-95 shadow-xl"
                    >
                      Refaire
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL RECOMMANDATION */}
      <AnimatePresence>
        {orderToReorder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0f092e]/90 backdrop-blur-md">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white text-[#0f092e] w-full max-w-md rounded-[40px] p-10 space-y-6">
              <h3 className="text-2xl font-black uppercase italic text-center">Refaire la commande ?</h3>
              <div className="bg-gray-100 rounded-3xl p-6">
                 <p className="text-sm font-black uppercase leading-tight mb-4">{orderToReorder.produits_liste}</p>
                 <div className="text-[10px] font-bold uppercase opacity-40 border-t border-gray-200 pt-4 italic">
                    Livraison : {orderToReorder.delivery_address}
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setOrderToReorder(null)} className="py-4 text-[10px] font-black uppercase opacity-40">Annuler</button>
                <button onClick={confirmReorder} disabled={isReordering} className="py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-blue-200">
                  {isReordering ? "..." : "Confirmer"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}