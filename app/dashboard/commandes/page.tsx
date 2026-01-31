'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function HistoriqueCommandes() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [agencyName, setAgencyName] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Récupérer le nom de l'agence via le profil
      const { data: profile } = await supabase
        .from('profiles')
        .select('agency_id, agencies(name)')
        .eq('id', user.id)
        .single();

      if (profile?.agencies) {
        const name = (profile.agencies as any).name;
        setAgencyName(name);

        // 2. Récupérer toutes les commandes de cette agence
        const { data: history, error } = await supabase
          .from('orders')
          .select('*')
          .eq('agency_name', name)
          .order('created_at', { ascending: false });

        if (!error) setOrders(history || []);
      }
      setLoading(false);
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="p-20 text-white font-black uppercase text-[10px]">Chargement de l'historique...</div>;

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <button onClick={() => router.back()} className="text-[10px] font-black uppercase opacity-30 hover:opacity-100 mb-4 flex items-center gap-2">
              ← Retour
            </button>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">Historique <span className="text-blue-500">Commandes</span></h1>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-2">Agence : {agencyName}</p>
          </div>
          <div className="bg-white/5 border border-white/10 px-8 py-4 rounded-3xl">
             <span className="block text-[9px] font-black opacity-30 uppercase">Total Commandes</span>
             <span className="text-2xl font-black italic">{orders.length}</span>
          </div>
        </div>

        {/* LISTE DES COMMANDES */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white/5 border border-white/5 rounded-[40px] p-20 text-center">
              <p className="text-[10px] font-black uppercase opacity-20">Aucune commande enregistrée pour le moment.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white/5 border border-white/5 rounded-[40px] p-8 hover:bg-white/[0.07] transition-all group">
                <div className="flex flex-col lg:flex-row justify-between gap-8">
                  
                  {/* Infos de base */}
                  <div className="space-y-4 max-w-md">
                    <div className="flex items-center gap-3">
                      <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${
                        order.status === 'En attente' ? 'bg-orange-500/20 text-orange-500' : 'bg-green-500/20 text-green-500'
                      }`}>
                        {order.status}
                      </span>
                      <span className="text-[10px] font-bold opacity-30 italic">
                        {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <h2 className="text-sm font-black uppercase leading-relaxed">
                      {order.produits_liste}
                    </h2>
                    <p className="text-[10px] font-bold text-white/40 uppercase">
                       {order.instructions?.split('--')[0] || "Commande agence"}
                    </p>
                  </div>

                  {/* Quantités et Détails */}
                  <div className="flex flex-wrap items-center gap-8 lg:text-right">
                    <div className="space-y-1">
                      <span className="block text-[8px] font-black opacity-20 uppercase">Quantités</span>
                      <span className="text-[11px] font-bold">{order.quantite_liste}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[8px] font-black opacity-20 uppercase">Montant</span>
                      <span className="text-xl font-black italic text-blue-400">{order.total_ht?.toFixed(2)}€ HT</span>
                    </div>
                    <div className="space-y-1">
                       <span className="block text-[8px] font-black opacity-20 uppercase">Livraison</span>
                       <span className="text-[9px] font-medium opacity-60 block max-w-[150px] truncate uppercase">{order.delivery_address}</span>
                    </div>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}