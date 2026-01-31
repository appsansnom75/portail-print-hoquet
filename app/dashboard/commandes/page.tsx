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

  // État pour la modal de recommandation
  const [orderToReorder, setOrderToReorder] = useState<any | null>(null);

  const fetchOrders = async () => {
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

      const { data: history, error } = await supabase
        .from('orders')
        .select('*')
        .eq('agency_name', name)
        .order('created_at', { ascending: false });

      if (!error && history) setOrders(history);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // FONCTION POUR PASSER LA NOUVELLE COMMANDE
  const confirmReorder = async () => {
    if (!orderToReorder) return;
    setIsReordering(true);

    try {
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
          instructions: `(RECOMMANDE) - ${orderToReorder.instructions}`,
          status: 'En attente'
        }]);

      if (error) throw error;

      alert("Commande passée avec succès !");
      setOrderToReorder(null);
      fetchOrders(); // Rafraîchir la liste
    } catch (err) {
      alert("Erreur lors de la recommandation");
    } finally {
      setIsReordering(false);
    }
  };

  if (loading) return <div className="p-20 text-white font-black uppercase text-[10px]">Chargement...</div>;

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-6 md:p-12 relative">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">Historique <span className="text-blue-500">Achats</span></h1>
            <Link href="/dashboard/equipe" className="text-[10px] font-black uppercase bg-white/5 px-6 py-3 rounded-xl border border-white/10">Équipe</Link>
        </div>

        {/* LISTE */}
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white/5 border border-white/5 rounded-[40px] p-8 hover:bg-white/[0.08] transition-all group">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
                <div className="flex-grow">
                  <span className="text-[10px] font-bold opacity-30">{new Date(order.created_at).toLocaleDateString()}</span>
                  <h2 className="text-sm font-black uppercase mt-1">{order.produits_liste}</h2>
                  <p className="text-[9px] opacity-40 uppercase mt-1">{order.delivery_address}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="block text-[8px] font-black opacity-20 uppercase">Total</span>
                    <span className="text-xl font-black italic">{order.total_ht?.toFixed(2)}€</span>
                  </div>
                  
                  {/* BOUTON RECOMMANDER */}
                  <button 
                    onClick={() => setOrderToReorder(order)}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase px-6 py-3 rounded-xl shadow-lg shadow-blue-900/40 transition-all active:scale-95"
                  >
                    Recommander
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DE CONFIRMATION DE RECOMMANDATION */}
      <AnimatePresence>
        {orderToReorder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0f092e]/95 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="bg-white text-[#0f092e] w-full max-w-md rounded-[40px] p-10 space-y-6 shadow-2xl"
            >
              <h3 className="text-2xl font-black uppercase italic text-center">Recommander ?</h3>
              
              <div className="bg-gray-100 rounded-3xl p-6 space-y-4">
                 <div>
                    <p className="text-[8px] font-black opacity-30 uppercase">Produits</p>
                    <p className="text-[11px] font-black uppercase">{orderToReorder.produits_liste}</p>
                 </div>
                 <div>
                    <p className="text-[8px] font-black opacity-30 uppercase">Livraison</p>
                    <p className="text-[10px] font-bold uppercase">{orderToReorder.delivery_address}</p>
                 </div>
                 <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase">Total HT</span>
                    <span className="text-2xl font-black italic">{orderToReorder.total_ht?.toFixed(2)}€</span>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setOrderToReorder(null)} 
                  className="py-5 text-[9px] font-black uppercase opacity-40 hover:opacity-100 transition-opacity"
                >
                  Annuler
                </button>
                <button 
                  onClick={confirmReorder}
                  disabled={isReordering}
                  className="py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                >
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