'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilPage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    siret: '',
    role: ''
  });

  useEffect(() => {
    const getProfile = async () => {
      // 1. Récupérer l'utilisateur authentifié
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // 2. On utilise '*' pour récupérer ABSOLUMENT TOUT ce qui est en base
      const { data, error } = await supabase
        .from('profiles')
        .select('*') 
        .eq('id', user.id)
        .single();

      if (data) {
        setFormData({
          full_name: data.full_name || '',
          email: user.email || '',
          phone: data.phone || '', // Ton téléphone est ici
          siret: data.siret || '',
          role: data.role || ''
        });
      }
      setLoading(false);
    };

    getProfile();
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    const { data: { user } } = await supabase.auth.getUser();

    // On envoie les modifications vers Supabase
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        siret: formData.siret,
      })
      .eq('id', user?.id);

    if (error) {
      alert("Erreur lors de la mise à jour : " + error.message);
    } else {
      alert("Profil mis à jour avec succès !");
    }
    setUpdating(false);
  };

  if (loading) return <div className="min-h-screen bg-[#0f092e] flex items-center justify-center text-white font-black uppercase tracking-widest animate-pulse text-xs">Chargement du profil...</div>;

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-6 md:p-12">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-10">
            <h1 className="text-2xl font-black uppercase tracking-tighter">Mon Profil <span className="text-blue-500 italic">Account</span></h1>
            <button onClick={() => router.push('/')} className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">Retour au catalogue</button>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4 bg-white/5 p-8 rounded-[40px] border border-white/10 backdrop-blur-xl shadow-2xl">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Nom complet</label>
                <input 
                    type="text" 
                    value={formData.full_name} 
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium"
                />
            </div>

            <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Email (Lecture seule)</label>
                <input 
                    type="email" 
                    value={formData.email} 
                    disabled
                    className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none opacity-30 cursor-not-allowed font-medium"
                />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Téléphone</label>
                <input 
                    type="text" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium"
                    placeholder="06..."
                />
            </div>

            <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Numéro SIRET</label>
                <input 
                    type="text" 
                    value={formData.siret} 
                    onChange={(e) => setFormData({...formData, siret: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium"
                />
            </div>
          </div>

          <div className="pt-4">
            <button 
                type="submit" 
                disabled={updating}
                className="w-full bg-blue-600 hover:bg-blue-500 p-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-blue-600/20"
            >
                {updating ? 'Mise à jour...' : 'Sauvegarder les modifications'}
            </button>
          </div>

          <div className="mt-6 text-center text-[7px] font-black uppercase tracking-[0.3em] text-white/20">
            Type de compte : {formData.role === 'admin_agence' ? 'Administrateur Agence' : 'Collaborateur'}
          </div>
        </form>
      </div>
    </div>
  );
}