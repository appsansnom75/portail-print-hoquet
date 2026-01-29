'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilPage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    siret: '',
    role: ''
  });

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // On récupère toutes les infos pré-remplies par l'admin
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || user.email || '', // L'email que l'admin a saisi
          phone: data.phone || '',
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

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: formData.first_name,
        last_name: formData.last_name,
        full_name: `${formData.first_name} ${formData.last_name}`,
        phone: formData.phone,
        siret: formData.siret,
      })
      .eq('id', user?.id);

    if (error) {
      alert("Erreur : " + error.message);
    } else {
      alert("Profil mis à jour avec succès !");
    }
    setUpdating(false);
  };

  if (loading) return <div className="min-h-screen bg-[#0f092e] flex items-center justify-center text-white font-black uppercase tracking-widest animate-pulse text-xs">Chargement...</div>;

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-6 md:p-12">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-10">
            <h1 className="text-2xl font-black uppercase tracking-tighter italic text-blue-500">Mon Profil</h1>
            <button onClick={() => router.push('/')} className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">Retour</button>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4 bg-white/5 p-8 rounded-[40px] border border-white/10 backdrop-blur-xl shadow-2xl">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Prénom</label>
                <input 
                    type="text" 
                    value={formData.first_name} 
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium"
                />
            </div>

            <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Nom</label>
                <input 
                    type="text" 
                    value={formData.last_name} 
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium"
                />
            </div>
          </div>

          <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Email</label>
              <input 
                  type="email" 
                  value={formData.email} 
                  disabled
                  className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none opacity-30 cursor-not-allowed font-medium"
              />
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
                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">SIRET</label>
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
                className="w-full bg-blue-600 hover:bg-blue-500 p-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all"
            >
                {updating ? 'Enregistrement...' : 'Mettre à jour mon profil'}
            </button>
          </div>

          <div className="mt-6 text-center text-[7px] font-black uppercase tracking-[0.3em] text-white/20">
            Rôle : {formData.role === 'admin_agence' ? 'Administrateur' : 'Collaborateur'}
          </div>
        </form>
      </div>
    </div>
  );
}