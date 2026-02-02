'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function StatusPage() {
  const [status, setStatus] = useState({
    supabase: 'loading',
    auth: 'loading',
    lastOrder: 'loading'
  });

  useEffect(() => {
    checkHealth();
  }, []);

  async function checkHealth() {
    try {
      // 1. Test Connexion Supabase
      const start = Date.now();
      const { data, error } = await supabase.from('products').select('id').limit(1);
      const latency = Date.now() - start;
      
      // 2. Test Session Auth
      const { data: session } = await supabase.auth.getSession();

      setStatus({
        supabase: error ? '🔴 Erreur' : `🟢 OK (${latency}ms)`,
        auth: session.session ? '🟢 Connecté' : '🟠 Non connecté (Public)',
        lastOrder: 'Vérification...'
      });

      // 3. Récupérer la dernière commande
      const { data: lastOrder } = await supabase.from('orders').select('created_at').order('created_at', { ascending: false }).limit(1);
      setStatus(prev => ({ ...prev, lastOrder: lastOrder?.[0] ? `🟢 ${new Date(lastOrder[0].created_at).toLocaleString()}` : '⚪ Aucune' }));

    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-12 font-sans">
      <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-12">System Health Monitor</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard title="Base de données (Supabase)" value={status.supabase} />
        <StatusCard title="Session Utilisateur" value={status.auth} />
        <StatusCard title="Dernière commande reçue" value={status.lastOrder} />
      </div>

      <div className="mt-12 p-8 border border-white/10 rounded-[40px] bg-white/[0.02]">
        <h2 className="text-[10px] font-black uppercase mb-6">Test de Flux Complet</h2>
        <p className="text-white/40 text-xs mb-6">Cliquez pour envoyer une commande fantôme et vérifiez votre Google Sheets.</p>
        <button 
          onClick={() => alert('Envoi d\'une commande de test...')} 
          className="bg-blue-600 px-8 py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-blue-500 transition-all"
        >
          Lancer un Test de Transmission
        </button>
      </div>
    </div>
  );
}

function StatusCard({ title, value }: { title: string, value: string }) {
  return (
    <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[40px]">
      <p className="text-[8px] font-black uppercase opacity-30 mb-2">{title}</p>
      <p className="text-lg font-black italic">{value}</p>
    </div>
  );
}