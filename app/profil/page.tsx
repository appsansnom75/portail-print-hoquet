'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilPage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    siret: '',
    role: '',
    avatar_url: ''
  });

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          siret: data.siret || '',
          role: data.role || '',
          avatar_url: data.avatar_url || ''
        });
      }
      setLoading(false);
    };

    getProfile();
  }, [router]);

  // FONCTION MAGIQUE : UPLOAD PHOTO
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // 1. Upload dans Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Récupérer l'URL Publique
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // 3. Mettre à jour l'état local et la DB immédiatement pour la photo
      const { data: { user } } = await supabase.auth.getUser();
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      setFormData({ ...formData, avatar_url: publicUrl });
      alert("Photo de profil mise à jour !");
      
    } catch (error) {
      alert("Erreur lors de l'envoi de l'image.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

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
    <div className="min-h-screen bg-[#0f092e] text-white p-6 md:p-12 selection:bg-blue-500/30">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-10">
            <h1 className="text-2xl font-black uppercase tracking-tighter italic text-blue-500">Mon Profil</h1>
            <button onClick={() => router.push('/')} className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">Retour</button>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6 bg-white/5 p-8 rounded-[40px] border border-white/10 backdrop-blur-xl shadow-2xl">
          
          {/* SECTION PHOTO DE PROFIL */}
          <div className="flex flex-col items-center justify-center space-y-4 pb-6 border-b border-white/5">
            <div className="relative group">
              <div className="h-28 w-28 rounded-full overflow-hidden border-2 border-blue-500/30 bg-black/40 shadow-2xl relative">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Profil" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[10px] font-black opacity-20 uppercase">No Pic</div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-500 text-white text-[8px] font-black uppercase px-4 py-2 rounded-full cursor-pointer transition-all shadow-lg shadow-blue-900/40">
                {uploading ? '...' : 'Changer'}
                <input type="file" className="hidden" accept="image/*" onChange={uploadAvatar} disabled={uploading} />
              </label>
            </div>
            <p className="text-[7px] font-bold text-white/20 uppercase tracking-[0.3em]">Format JPG/PNG • Max 2Mo</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Prénom</label>
                <input 
                    type="text" 
                    value={formData.first_name} 
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm"
                />
            </div>

            <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Nom</label>
                <input 
                    type="text" 
                    value={formData.last_name} 
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm"
                />
            </div>
          </div>

          <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Email</label>
              <input 
                  type="email" 
                  value={formData.email} 
                  disabled
                  className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none opacity-30 cursor-not-allowed font-medium text-sm"
              />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Téléphone</label>
                <input 
                    type="text" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm"
                    placeholder="06..."
                />
            </div>

            <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">SIRET</label>
                <input 
                    type="text" 
                    value={formData.siret} 
                    onChange={(e) => setFormData({...formData, siret: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm"
                />
            </div>
          </div>

          <div className="pt-4">
            <button 
                type="submit" 
                disabled={updating}
                className="w-full bg-blue-600 hover:bg-blue-500 p-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98]"
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