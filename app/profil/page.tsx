'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';


export default function ProfilPage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const router = useRouter();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [agenceId, setAgenceId] = useState<string | null>(null);
  const [agenceData, setAgenceData] = useState({
    logo_url: '',
    adresse: '',
    code_postal: '',
    ville: '',
    agence_telephone: '',
    agence_email: '',
    siret: ''
  });

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('agency_id')
        .eq('id', user.id)
        .single();

      if (profile?.agency_id) {
        setAgenceId(profile.agency_id);
        const { data: agence } = await supabase
          .from('agencies')
          .select('*')
          .eq('id', profile.agency_id)
          .single();

        if (agence) {
          setAgenceData({
            logo_url: agence.logo_url || '',
            adresse: agence.adresse || '',
            code_postal: agence.code_postal || '',
            ville: agence.ville || '',
            agence_telephone: agence.agence_telephone || '',
            agence_email: agence.agence_email || '',
            siret: agence.siret || ''
          });
        }
      }
      setLoading(false);
    };

    getProfile();
  }, [router]);

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX = 800;
        let width = img.width, height = img.height;
        if (width > MAX || height > MAX) {
          const ratio = Math.min(MAX / width, MAX / height);
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

  const uploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingLogo(true);
      if (!event.target.files?.[0] || !agenceId) return;
      const compressed = await compressImage(event.target.files[0]);
      const fileName = `${Date.now()}-${compressed.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '-')}`;
      const { error } = await supabase.storage.from('avatars').upload(fileName, compressed);
      if (error) throw error;
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      await supabase.from('agencies').update({ logo_url: data.publicUrl }).eq('id', agenceId);
      setAgenceData(prev => ({ ...prev, logo_url: data.publicUrl }));
    } catch (error) {
      alert("Erreur lors de l'envoi du logo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agenceId) return;
    setUpdating(true);
    const { error } = await supabase.from('agencies').update({
      adresse: agenceData.adresse,
      code_postal: agenceData.code_postal,
      ville: agenceData.ville,
      agence_telephone: agenceData.agence_telephone,
      agence_email: agenceData.agence_email,
      siret: agenceData.siret,
    }).eq('id', agenceId);
    if (error) alert("Erreur : " + error.message);
    else alert("Infos agence mises à jour !");
    setUpdating(false);
  };

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
          <h1 className="text-2xl font-black uppercase tracking-tighter italic text-blue-500">
            Infos Agence
          </h1>
          <button
            onClick={() => router.push('/')}
            className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
          >
            Retour
          </button>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6 bg-white/5 p-8 rounded-[40px] border border-white/10 backdrop-blur-xl shadow-2xl">

          {/* LOGO */}
          <div className="flex flex-col items-center justify-center space-y-4 pb-6 border-b border-white/5">
            <div
              onClick={() => logoInputRef.current?.click()}
              className="h-36 w-36 rounded-[28px] overflow-hidden border-2 border-dashed border-blue-500/30 bg-black/40 shadow-2xl flex items-center justify-center cursor-pointer hover:border-blue-500 transition-all relative"
            >
              {agenceData.logo_url ? (
                <img src={agenceData.logo_url} alt="Logo agence" className="h-full w-full object-contain p-3" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-white/20">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/>
                  </svg>
                  <span className="text-[8px] font-black uppercase tracking-widest">Logo</span>
                </div>
              )}
              {uploadingLogo && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-[28px]">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={uploadLogo} disabled={uploadingLogo} />
            <div className="text-center space-y-1">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="text-[9px] font-black uppercase text-blue-400 hover:text-blue-300 transition-colors"
              >
                {uploadingLogo ? 'Upload en cours...' : '+ Changer le logo'}
              </button>
              <p className="text-[7px] font-bold text-white/20 uppercase tracking-[0.3em]">PNG transparent recommandé</p>
            </div>
          </div>

          {/* ADRESSE */}
          <div className="space-y-1">
            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Adresse</label>
            <input
              type="text"
              value={agenceData.adresse}
              onChange={(e) => setAgenceData({ ...agenceData, adresse: e.target.value })}
              placeholder="Ex: 12 rue de la Paix"
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Code Postal</label>
              <input
                type="text"
                value={agenceData.code_postal}
                onChange={(e) => setAgenceData({ ...agenceData, code_postal: e.target.value })}
                placeholder="Ex: 75001"
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Ville</label>
              <input
                type="text"
                value={agenceData.ville}
                onChange={(e) => setAgenceData({ ...agenceData, ville: e.target.value })}
                placeholder="Ex: Paris"
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Téléphone Agence</label>
            <input
              type="tel"
              value={agenceData.agence_telephone}
              onChange={(e) => setAgenceData({ ...agenceData, agence_telephone: e.target.value })}
              placeholder="Ex: 01 23 45 67 89"
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Email Agence</label>
            <input
              type="email"
              value={agenceData.agence_email}
              onChange={(e) => setAgenceData({ ...agenceData, agence_email: e.target.value })}
              placeholder="Ex: contact@agence-paris.com"
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm"
            />
          </div>

          {/* ✅ SIRET */}
          <div className="space-y-1">
            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Numéro SIRET</label>
            <input
              type="text"
              value={agenceData.siret}
              onChange={(e) => setAgenceData({ ...agenceData, siret: e.target.value })}
              placeholder="Ex: 123 456 789 00012"
              maxLength={17}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={updating}
              className="w-full bg-blue-600 hover:bg-blue-500 p-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98] disabled:opacity-50"
            >
              {updating ? 'Enregistrement...' : 'Mettre à jour les infos agence'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}