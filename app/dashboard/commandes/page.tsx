'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HistoriqueCommandes() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [agencyName, setAgencyName] = useState("");

  // ÉTATS POUR LES STATS
  const [stats, setStats] = useState({
    totalDepense: 0,
    panierMoyen: 0,
    commandesMois: 0
  });

  useEffect(() => {
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

        if (!error && history) {
          setOrders(history);
          calculerStats(history);
        }
      }
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const calculerStats = (data: any[]) => {
    const total = data.reduce((acc, curr) => acc + (curr.total_ht || 0), 0);
    const moyenne = data.length > 0 ? total / data.length : 0;
    
    // Commandes du mois en cours
    const ceMois = data.filter(order => {
      const date = new Date(order.created_at);
      const maintenant = new Date();
      return date.getMonth() === maintenant.getMonth() && date.getFullYear() === maintenant.getFullYear();
    }).length;

    setStats({
      totalDepense: total,
      panierMoyen: moyenne,
      commandesMois: ceMois
    });
  };

  if (loading) return <div className="p-20 text-white font-black uppercase text-[10px] animate-pulse">Calcul des statistiques...</div>;

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* HEADER & NAV */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <button onClick={() => router.back()} className="text-[10px] font-black uppercase opacity-30 hover:opacity-100 flex items-center gap-2">
              ← Retour
            </button>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">Historique <span className="text-blue-500 text-glow">Achats</span></h1>
          </div>

          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            <Link href="/dashboard/equipe" className="px-6 py-2 rounded-xl text-[9px] font-black uppercase text-white/40 hover:text-white transition-colors">
              Équipe
            </Link>
            <button className="bg-blue-600 px-6 py-2 rounded-xl text-[9px] font-black uppercase shadow-lg shadow-blue-900/40">
              Historique
            </button>
          </div>
        </div>

        {/* GRILLE DES STATISTIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/5 p-8 rounded-[35px] backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform font-black italic text-4xl">€</div>
            <span className="text-[9px] font-black uppercase opacity-40 block mb-2">Dépenses Totales</span>
            <span className="text-3xl font-black italic text-blue-400 tracking-tighter">{stats.totalDepense.toFixed(2)}€</span>
          </div>

          <div className="bg-white/5 border border-white/5 p-8 rounded-[35px] backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform font-black italic text-4xl">#</div>
            <span className="text-[9px] font-black uppercase opacity-40 block mb-2">Commandes ce mois</span>
            <span className="text-3xl font-black italic text-white tracking-tighter">{stats.commandesMois}</span>
          </div>

          <div className="bg-white/5 border border-white/5 p-8 rounded-[35px] backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform font-black italic text-4xl">Avg</div>
            <span className="text-[9px] font-black uppercase opacity-40 block mb-2">Panier Moyen</span>
            <span className="text-3xl font-black italic text-blue-400 tracking-tighter">{stats.panierMoyen.toFixed(2)}€</span>
          </div>
        </div>

        {/* LISTE DES COMMANDES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 italic">Détails des transactions</h2>
            <span className="text-[10px] font-bold text-blue-500">{orders.length} Résultat(s)</span>
          </div>

          {orders.map((order) => (
            <div key={order.id} className="bg-white/5 border border-white/5 rounded-[40px] p-8 hover:bg-white/[0.08] transition-all group border-l-4 border-l-transparent hover:border-l-blue-600">
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-lg ${
                      order.status === 'En attente' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'
                    }`}>
                      {order.status}
                    </span>
                    <span className="text-[10px] font-bold opacity-30">
                      {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-tight max-w-xl group-hover:text-blue-400 transition-colors">
                    {order.produits_liste}
                  </h2>
                  <p className="text-[9px] font-bold text-white/30 uppercase italic">
                    Utilisateur : <span className="text-white/60">{order.instructions?.split(' -- ')[0] || "Admin"}</span>
                  </p>
                </div>

                <div className="flex items-center gap-10 lg:text-right">
                  <div className="space-y-1">
                    <span className="block text-[8px] font-black opacity-20 uppercase">Montant HT</span>
                    <span className="text-2xl font-black italic text-white tracking-tighter">{order.total_ht?.toFixed(2)}€</span>
                  </div>
                  <button className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 transition-all opacity-0 group-hover:opacity-100">
                    <span className="text-[10px]">👁️</span>
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}