'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ImprimeurPortal() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    // Système de rafraîchissement automatique toutes les 2 minutes
    const interval = setInterval(fetchOrders, 120000);
    return () => clearInterval(interval);
  }, []);

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .neq('status', 'Livré') // On ne montre que ce qui n'est pas encore fini
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  async function updateStatus(orderId: string, newStatus: string) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    
    if (!error) fetchOrders(); // Rafraîchir la liste
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans">
      <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-8">
        <div>
          <h1 className="text-blue-500 font-black uppercase text-[10px] tracking-[0.5em] mb-2">Production Hub</h1>
          <p className="text-3xl font-black italic uppercase">Commandes à traiter</p>
        </div>
        <div className="text-right text-[9px] font-bold opacity-40 uppercase">
          Mise à jour en direct <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse"></span>
        </div>
      </header>

      {loading ? (
        <div className="animate-pulse text-[10px] font-black uppercase tracking-widest text-center py-20">Synchronisation avec la base...</div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white/[0.03] border border-white/10 rounded-[30px] p-8 flex flex-col md:flex-row justify-between items-center gap-8 hover:border-blue-500/30 transition-all">
              
              {/* INFOS COMMANDE */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-[10px] font-black bg-blue-600 px-3 py-1 rounded-full uppercase italic">#{order.id.slice(0,5)}</span>
                  <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="text-xl font-black uppercase italic mb-1">{order.agency_name}</h3>
                <p className="text-blue-400 font-black text-[12px] uppercase mb-4">{order.produits_liste}</p>
                <div className="text-[10px] font-bold opacity-60 uppercase space-y-1">
                  <p>📍 {order.delivery_address}, {order.zip_code} {order.city}</p>
                  <p>📞 {order.client_phone}</p>
                </div>
              </div>

              {/* ACCÈS FICHIERS */}
              <div className="flex flex-col items-center gap-3">
                 <button className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase text-[10px] hover:bg-blue-500 hover:text-white transition-all">
                   📥 Télécharger PDF HD
                 </button>
                 <p className="text-[8px] font-black opacity-30 uppercase tracking-widest">Format: 85x55mm + 3mm fond perdu</p>
              </div>

              {/* ACTIONS STATUT */}
              <div className="flex flex-wrap justify-center gap-2">
                <StatusBtn label="En attente" active={order.status === 'En attente'} color="bg-orange-500" onClick={() => updateStatus(order.id, 'En attente')} />
                <StatusBtn label="Impression" active={order.status === 'Impression'} color="bg-blue-500" onClick={() => updateStatus(order.id, 'Impression')} />
                <StatusBtn label="Expédié" active={order.status === 'Expédié'} color="bg-green-500" onClick={() => updateStatus(order.id, 'Expédié')} />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* MODULE IA (PIED DE PAGE) */}
      <footer className="mt-20 border-t border-white/10 pt-10 flex flex-col items-center">
         <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-[30px] max-w-2xl w-full flex items-center gap-6">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl">🤖</div>
            <div className="flex-1">
               <p className="text-[9px] font-black uppercase text-blue-400 mb-1 tracking-widest">Assistant IA Technique</p>
               <input type="text" placeholder="Posez une question sur les specs..." className="bg-transparent border-none outline-none text-white font-bold italic w-full uppercase text-[12px]" />
            </div>
         </div>
      </footer>
    </div>
  );
}

function StatusBtn({ label, active, color, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase transition-all border ${active ? `${color} border-transparent text-white` : 'border-white/10 text-white/40 hover:border-white/30'}`}
    >
      {label}
    </button>
  );
}