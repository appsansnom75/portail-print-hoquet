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
          .select(`
            *,
            profiles!user_id (
              full_name
            )
          `)
          .eq('agency_name', name)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(history || []);
      }
    } catch (err) {
      console.error("Erreur chargement commandes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

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
    } catch (err) {
      alert("Erreur lors de la recommandation");
    } finally {
      setIsReordering(false);
    }
  };

  if (loading) return <div className="p-20 text-white font-black uppercase text-center animate-pulse">Chargement...</div>;

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-white/10 pb-8">
            <div>
              <h1 className="text-4xl font-black uppercase italic italic tracking-tighter text-blue-500">Historique</h1>
              <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.3em]">Agence : {agencyName}</p>
            </div>
            <Link href="/" className="text-[10px] font-black uppercase bg-white/10 px-6 py-3 rounded-xl hover:bg-white/20 transition-all">Retour Boutique</Link>
        </div>

        {/* LISTE DES COMMANDES */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white/5 border-2 border-white/10 rounded-[30px] p-8 hover:border-blue-500/50 transition-all relative overflow-hidden group">
              
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                
                {/* 1. LA PERSONNE (XXL) */}
                <div className="flex-1 border-r border-white/10 pr-4 w-full lg:w-auto text-center lg:text-left">
                  <span className="text-[9px] font-black uppercase text-blue-500 tracking-widest mb-1 block">Commandé par :</span>
                  <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">
                    {order.profiles?.full_name || 'Commande Système'}
                  </h2>
                  <div className="mt-3 flex gap-2 items-center justify-center lg:justify-start">
                    <span className="text-[10px] font-bold opacity-40">{new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${order.status === 'En attente' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'}`}>
                        {order.status}
                    </span>
                  </div>
                </div>

                {/* 2. L'ADRESSE (TRES VISIBLE) */}
                <div className="flex-[1.5] w-full lg:w-auto">
                    <span className="text-[9px] font-black uppercase text-blue-500 tracking-widest mb-2 block text-center lg:text-left">Adresse de livraison :</span>
                    <div className="bg-white text-[#0f092e] p-4 rounded-2xl font-black text-lg uppercase leading-tight transform -rotate-1 group-hover:rotate-0 transition-transform">
                        📍 {order.delivery_address}
                    </div>
                    <p className="text-[11px] font-bold mt-2 text-white/60 text-center lg:text-left">
                        📦 {order.produits_liste}
                    </p>
                </div>

                {/* 3. PRIX & ACTION */}
                <div className="flex items-center gap-6 w-full lg:w-auto justify-center">
                  <div className="text-right mr-4">
                    <span className="block text-[8px] font-black opacity-30 uppercase">Total HT</span>
                    <span className="text-3xl font-black italic">{order.total_ht?.toFixed(2)}€</span>
                  </div>
                  
                  <button 
                    onClick={() => setOrderToReorder(order)}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase px-10 py-5 rounded-2xl shadow-xl shadow-blue-900/40 transition-all active:scale-95"
                  >
                    Recommander
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL RECOMMANDATION RESTE IDENTIQUE MAIS ÉPURÉ */}
      <AnimatePresence>
        {orderToReorder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0f092e]/95 backdrop-blur-xl">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white text-[#0f092e] w-full max-w-md rounded-[40px] p-10 space-y-6">
              <h3 className="text-2xl font-black uppercase italic text-center">Refaire cette commande ?</h3>
              <div className="bg-gray-100 rounded-3xl p-6">
                 <p className="text-sm font-black uppercase border-b border-gray-200 pb-3 mb-3">{orderToReorder.produits_liste}</p>
                 <p className="text-[10px] font-bold uppercase opacity-60">Livré à :</p>
                 <p className="text-sm font-black uppercase">{orderToReorder.delivery_address}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <button onClick={() => setOrderToReorder(null)} className="py-4 text-[10px] font-black uppercase opacity-40 hover:opacity-100 transition-opacity">Fermer</button>
                <button onClick={confirmReorder} disabled={isReordering} className="py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-blue-700 transition-colors">
                  {isReordering ? "Patientez..." : "Confirmer"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}