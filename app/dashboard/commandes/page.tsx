'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function HistoriqueCommandes() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [agencyName, setAgencyName] = useState("");
  const [isReordering, setIsReordering] = useState(false);
  const [orderToReorder, setOrderToReorder] = useState<any | null>(null);

  const fetchOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Récupérer l'agence de l'utilisateur connecté
    const { data: profile } = await supabase
      .from('profiles')
      .select('agency_id, agencies(name)')
      .eq('id', user.id)
      .single();

    if (profile?.agencies) {
      const name = (profile.agencies as any).name;
      setAgencyName(name);

      // 2. Récupérer les commandes + Infos du profil qui a commandé (auteur)
      // Note: Assure-toi que ta table 'orders' a une colonne 'user_id'
      const { data: history, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id (full_name, avatar_url)
        `)
        .eq('agency_name', name)
        .order('created_at', { ascending: false });

      if (!error && history) setOrders(history);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const confirmReorder = async () => {
    if (!orderToReorder) return;
    setIsReordering(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('orders')
        .insert([{
          agency_name: orderToReorder.agency_name,
          client_email: orderToReorder.client_email,
          client_phone: orderToReorder.client_phone,
          delivery_address: orderToReorder.delivery_address,
          produits_liste: orderToReorder.produits_liste,
          quantite_liste: orderToReorder.quantite_liste,
          total_ht: orderToReorder.total_ht,
          instructions: `(RECOMMANDE) - ${orderToReorder.instructions || ''}`,
          status: 'En attente',
          user_id: user?.id // On lie la nouvelle commande à celui qui clique sur recommander
        }]);

      if (error) throw error;

      alert("Commande passée avec succès !");
      setOrderToReorder(null);
      fetchOrders();
    } catch (err) {
      alert("Erreur lors de la recommandation");
    } finally {
      setIsReordering(false);
    }
  };

  if (loading) return <div className="p-20 text-white font-black uppercase text-[10px] tracking-widest animate-pulse">Chargement de l'historique...</div>;

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-6 md:p-12 relative selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter">Historique <span className="text-blue-500">Achats</span></h1>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mt-2">Agence : {agencyName}</p>
            </div>
            <div className="flex gap-3">
              <Link href="/" className="text-[9px] font-black uppercase bg-white/5 px-6 py-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all">Boutique</Link>
              <Link href="/dashboard/equipe" className="text-[9px] font-black uppercase bg-blue-600 px-6 py-3 rounded-xl shadow-lg shadow-blue-900/40">Équipe</Link>
            </div>
        </div>

        {/* LISTE DES COMMANDES DÉTAILLÉE */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white/5 border border-white/5 rounded-[40px] p-8 hover:bg-white/[0.07] transition-all group relative overflow-hidden">
              
              {/* INDICATEUR DE STATUT */}
              <div className={`absolute top-0 left-0 w-2 h-full ${order.status === 'En attente' ? 'bg-orange-500' : 'bg-green-500'}`}></div>

              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                
                {/* COLONNE 1 : INFOS DE BASE & AUTEUR */}
                <div className="flex items-center gap-6">
                  {/* Photo de celui qui a commandé */}
                  <div className="h-14 w-14 rounded-2xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
                    {order.profiles?.avatar_url ? (
                      <img src={order.profiles.avatar_url} className="h-full w-full object-cover" alt="Auteur" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[10px] font-bold opacity-20">??</div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold opacity-30">{new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                      <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${order.status === 'En attente' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'}`}>
                        {order.status}
                      </span>
                    </div>
                    <h2 className="text-sm font-black uppercase mt-1 tracking-tight">{order.produits_liste}</h2>
                    <p className="text-[9px] font-bold text-blue-400 uppercase mt-1">
                      Par : {order.profiles?.full_name || 'Utilisateur inconnu'}
                    </p>
                  </div>
                </div>

                {/* COLONNE 2 : ADRESSE & NOTES */}
                <div className="flex-grow max-w-md">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <span className="text-[9px] opacity-20 mt-0.5">📍</span>
                      <p className="text-[9px] opacity-50 uppercase leading-relaxed">{order.delivery_address}</p>
                    </div>
                    {order.instructions && (
                      <div className="flex items-start gap-2">
                        <span className="text-[9px] opacity-20 mt-0.5">💬</span>
                        <p className="text-[9px] italic text-white/40 line-clamp-1">{order.instructions}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* COLONNE 3 : PRIX & ACTION */}
                <div className="flex items-center gap-8 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-none border-white/5 pt-6 lg:pt-0">
                  <div className="text-right">
                    <span className="block text-[8px] font-black opacity-20 uppercase tracking-widest text-blue-500">Montant HT</span>
                    <span className="text-2xl font-black italic">{order.total_ht?.toFixed(2)}€</span>
                  </div>
                  
                  <button 
                    onClick={() => setOrderToReorder(order)}
                    className="bg-white text-[#0f092e] hover:bg-blue-600 hover:text-white text-[9px] font-black uppercase px-8 py-4 rounded-2xl shadow-xl transition-all active:scale-95"
                  >
                    Recommander
                  </button>
                </div>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10">
              <p className="text-[10px] font-black uppercase opacity-20 tracking-[0.5em]">Aucune commande trouvée</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL RECOMMANDATION (Inchangée mais profite des nouvelles infos) */}
      <AnimatePresence>
        {orderToReorder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0f092e]/95 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white text-[#0f092e] w-full max-w-md rounded-[40px] p-10 space-y-6 shadow-2xl">
              <h3 className="text-2xl font-black uppercase italic text-center">Recommander ?</h3>
              <div className="bg-gray-100 rounded-3xl p-6 space-y-4">
                 <p className="text-[11px] font-black uppercase text-center border-b border-gray-200 pb-4">{orderToReorder.produits_liste}</p>
                 <div className="flex justify-between text-[9px] font-bold uppercase opacity-60">
                    <span>Livraison à</span>
                    <span className="text-right max-w-[150px]">{orderToReorder.delivery_address}</span>
                 </div>
                 <div className="pt-4 flex justify-between items-center border-t border-gray-200">
                    <span className="text-[10px] font-black uppercase">Total HT</span>
                    <span className="text-2xl font-black italic">{orderToReorder.total_ht?.toFixed(2)}€</span>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setOrderToReorder(null)} className="py-5 text-[9px] font-black uppercase opacity-40 hover:opacity-100 transition-opacity">Annuler</button>
                <button onClick={confirmReorder} disabled={isReordering} className="py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] active:scale-95 disabled:opacity-50">
                  {isReordering ? "Envoi..." : "Confirmer"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}