'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ProfilPage() {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInfos = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        if (data) setNom(data.full_name);
      }
      setLoading(false);
    };
    getInfos();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('profiles').update({ full_name: nom }).eq('id', user?.id);
    
    if (error) alert("Erreur : " + error.message);
    else alert("Profil mis à jour !");
  };

  if (loading) return <div className="p-20 text-white">Chargement...</div>;

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-10">
      <div className="max-w-md mx-auto bg-white/5 p-8 rounded-3xl border border-white/10">
        <h1 className="text-xl font-black uppercase mb-6 text-blue-500">Mon Profil</h1>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase text-white/40 font-bold mb-2 block">Email (non modifiable)</label>
            <input type="text" value={email} disabled className="w-full bg-white/5 border border-white/5 p-4 rounded-xl opacity-50 cursor-not-allowed" />
          </div>
          <div>
            <label className="text-[10px] uppercase text-white/40 font-bold mb-2 block">Nom Complet</label>
            <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-blue-500" />
          </div>
          <button className="w-full bg-blue-600 p-4 rounded-xl font-bold uppercase text-[10px] tracking-widest">Enregistrer les modifications</button>
        </form>
      </div>
    </div>
  );
}