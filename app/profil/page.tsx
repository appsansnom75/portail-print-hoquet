'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilPage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [activeTab, setActiveTab] = useState<'profil' | 'agence'>('profil');
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

  const [agenceData, setAgenceData] = useState({
    logo_url: '',
    adresse: '',
    code_postal: '',
    ville: '',
    agence_telephone: '',
    agence_email: ''
  });

  const [agenceId, setAgenceId] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data } = await supabase
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

        if (data.role === 'admin_agence' && data.agency_id) {
          setAgenceId(data.agency_id);
          const { data: agence } = await supabase
            .from('agencies')
            .select('*')
            .eq('id', data.agency_id)
            .single();

          if (agence) {
            setAgenceData({
              logo_url: agence.logo_url || '',
              adresse: agence.adresse || '',
              code_postal: agence.code_postal || '',
              ville: agence.ville || '',
              agence_telephone: agence.agence_telephone || '',
              agence_email: agence.agence_email || ''
            });
          }
        }
      }
      setLoading(false);
    };

    getProfile();
  }, [router]);

  const compressImage = (file: File, maxSize = 800): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
      img.onload = () => {
        URL.revokeObjectURL(url);
        let width = img.width, height = img.height;
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob) return resolve(file);
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' }));
        }, 'image/webp', 0.85);
      };
    });
  };

  const uploadImage = async (file: File, bucket: string): Promise<string> => {
    const compressed = await compressImage(file);
    const fileName = `${Date.now()}-${compressed.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '-')}`;
    const { error } = await supabase.storage.from(bucket).upload(fileName, compressed);
    if (error) return '';
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files?.[0]) return;
      const url = await uploadImage(event.target.files[0], 'avatars');
      if (!url) throw new Error('Upload échoué');
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', user?.id);
      setFormData(prev => ({ ...prev, avatar_url: url }));
    } catch (error) {
      alert("Erreur lors de l'envoi de l'image.");
    } finally {
      setUploading(false);
    }
  };

  const uploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingLogo(true);
      if (!event.target.files?.[0] || !agenceId) return;
      const url = await uploadImage(event.target.files[0], 'avatars');
      if (!url) throw new Error('Upload échoué');
      await supabase.from('agencies').update({ logo_url: url }).eq('id', agenceId);
      setAgenceData(prev => ({ ...prev, logo_url: url }));
    } catch (error) {
      alert("Erreur lors de l'envoi du logo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleUpdateProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('profiles').update({
      first_name: formData.first_name,
      last_name: formData.last_name,
      full_name: `${formData.first_name} ${formData.last_name}`,
      phone: formData.phone,
      siret: formData.siret,
    }).eq('id', user?.id);
    if (error) alert("Erreur : " + error.message);
    else alert("Profil mis à jour !");
    setUpdating(false);
  };

  const handleUpdateAgence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agenceId) return;
    setUpdating(true);
    const { error } = await supabase.from('agencies').update({
      adresse: agenceData.adresse,
      code_postal: agenceData.code_postal,
      ville: agenceData.ville,
      agence_telephone: agenceData.agence_telephone,
      agence_email: agenceData.agence_email,
    }).eq('id', agenceId);
    if (error) alert("Erreur : " + error.message);
    else alert("Infos agence mises à jour !");
    setUpdating(false);
  };

  const isAdmin = formData.role === 'admin_agence' || formData.role === 'super_admin';

  if (loading) return (
    <div className="min-h-screen bg-[#0f092e] flex items-center justify-center text-white font-black uppercase tracking-widest animate-pulse text-xs">
      Chargement...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-6 md:p-12 selection:bg-blue-500/30">
      <div className="max-w-xl mx-auto">

        {/* EN-TÊTE */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-black uppercase tracking-tighter italic text-blue-500">Mon Profil</h1>
          <button onClick={() => router.push('/')} className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
            Retour
          </button>
        </div>

        {/* TABS — uniquement si admin */}
        {isAdmin && (
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 mb-8">
            <button
              onClick={() => setActiveTab('profil')}
              className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all ${activeTab === 'profil' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-white/40 hover:text-white'}`}
            >
              Mon Profil
            </button>
            <button
              onClick={() => setActiveTab('agence')}
              className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all ${activeTab === 'agence' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-white/40 hover:text-white'}`}
            >
              Infos Agence
            </button>
          </div>
        )}

        {/* ===== ONGLET MON PROFIL ===== */}
        {activeTab === 'profil' && (
          <form onSubmit={handleUpdateProfil} className="space-y-6 bg-white/5 p-8 rounded-[40px] border border-white/10 backdrop-blur-xl shadow-2xl">

            {/* PHOTO */}
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
                <label className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-500 text-white text-[8px] font-black uppercase px-4 py-2 rounded-full cursor-pointer transition-all shadow-lg shadow-blue-900/40 whitespace-nowrap">
                  {uploading ? '...' : 'Changer'}
                  <input type="file" className="hidden" accept="image/*" onChange={uploadAvatar} disabled={uploading} />
                </label>
              </div>
              <p className="text-[7px] font-bold text-white/20 uppercase tracking-[0.3em] mt-4">Format JPG/PNG • Max 2Mo</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Prénom</label>
                <input type="text" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Nom</label>
                <input type="text" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Email</label>
              <input type="email" value={formData.email} disabled
                className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none opacity-30 cursor-not-allowed font-medium text-sm" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Téléphone</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm" placeholder="06..." />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">SIRET</label>
                <input type="text" value={formData.siret} onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm" />
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" disabled={updating}
                className="w-full bg-blue-600 hover:bg-blue-500 p-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98] disabled:opacity-50">
                {updating ? 'Enregistrement...' : 'Mettre à jour mon profil'}
              </button>
            </div>

            <div className="text-center text-[7px] font-black uppercase tracking-[0.3em] text-white/20">
              Rôle : {formData.role === 'admin_agence' ? 'Administrateur' : formData.role === 'super_admin' ? 'Super Admin' : 'Collaborateur'}
            </div>
          </form>
        )}

        {/* ===== ONGLET INFOS AGENCE ===== */}
        {activeTab === 'agence' && isAdmin && (
          <form onSubmit={handleUpdateAgence} className="space-y-6 bg-white/5 p-8 rounded-[40px] border border-white/10 backdrop-blur-xl shadow-2xl">

            {/* LOGO */}
            <div className="flex flex-col items-center justify-center space-y-4 pb-6 border-b border-white/5">
              <div className="relative group">
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="h-32 w-32 rounded-[24px] overflow-hidden border-2 border-dashed border-blue-500/30 bg-black/40 shadow-2xl flex items-center justify-center cursor-pointer hover:border-blue-500 transition-all"
                >
                  {agenceData.logo_url ? (
                    <img src={agenceData.logo_url} alt="Logo agence" className="h-full w-full object-contain p-2" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-white/20">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/>
                      </svg>
                      <span className="text-[8px] font-black uppercase tracking-widest">Logo</span>
                    </div>
                  )}
                  {uploadingLogo && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-[24px]">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={uploadLogo} disabled={uploadingLogo} />
              </div>
              <div className="text-center space-y-1">
                <button type="button" onClick={() => logoInputRef.current?.click()}
                  className="text-[9px] font-black uppercase text-blue-400 hover:text-blue-300 transition-colors">
                  {uploadingLogo ? 'Upload en cours...' : 'Changer le logo →'}
                </button>
                <p className="text-[7px] font-bold text-white/20 uppercase tracking-[0.3em]">PNG transparent recommandé</p>
              </div>
            </div>

            {/* ADRESSE */}
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Adresse</label>
              <input type="text" value={agenceData.adresse} onChange={(e) => setAgenceData({ ...agenceData, adresse: e.target.value })}
                placeholder="Ex: 12 rue de la Paix"
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Code Postal</label>
                <input type="text" value={agenceData.code_postal} onChange={(e) => setAgenceData({ ...agenceData, code_postal: e.target.value })}
                  placeholder="Ex: 75001"
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Ville</label>
                <input type="text" value={agenceData.ville} onChange={(e) => setAgenceData({ ...agenceData, ville: e.target.value })}
                  placeholder="Ex: Paris"
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Téléphone Agence</label>
              <input type="tel" value={agenceData.agence_telephone} onChange={(e) => setAgenceData({ ...agenceData, agence_telephone: e.target.value })}
                placeholder="Ex: 01 23 45 67 89"
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm" />
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Email Agence</label>
              <input type="email" value={agenceData.agence_email} onChange={(e) => setAgenceData({ ...agenceData, agence_email: e.target.value })}
                placeholder="Ex: contact@agence-paris.com"
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm" />
            </div>

            <div className="pt-4">
              <button type="submit" disabled={updating}
                className="w-full bg-blue-600 hover:bg-blue-500 p-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98] disabled:opacity-50">
                {updating ? 'Enregistrement...' : 'Mettre à jour les infos agence'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}