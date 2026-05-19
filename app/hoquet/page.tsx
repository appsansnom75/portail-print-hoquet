'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import CartDrawer from '@/components/CartDrawer';


// --- COMPOSANT MODAL ZOOM ---
function ImageModal({ isOpen, onClose, imageSrc, imageAlt }: { isOpen: boolean, onClose: () => void, imageSrc: string, imageAlt: string }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-10">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-sm cursor-zoom-out"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
            className="relative max-w-full max-h-full flex items-center justify-center"
          >
            <img src={imageSrc} alt={imageAlt} className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" />
            <button onClick={onClose} className="absolute -top-12 right-0 text-white font-black uppercase text-[13px] tracking-widest hover:text-orange-500 transition-colors">
              Fermer ×
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}


// --- MODAL CRÉER UN PROFIL ---
function CreateProfileModal({ isOpen, onClose, agencyId, onCreated, agencyDefaults }: {
  isOpen: boolean; onClose: () => void; agencyId: string;
  onCreated: (member: any) => void;
  agencyDefaults: { phone_fix: string; adresse: string; ville: string; code_postal: string; };
}) {
  const [prenom, setPrenom]         = useState('');
  const [nom, setNom]               = useState('');
  const [email, setEmail]           = useState('');
  const [phone, setPhone]           = useState('');
  const [phoneFix, setPhoneFix]     = useState('');
  const [fonction, setFonction]     = useState('');
  const [rsac, setRsac]             = useState('');
  const [adresse, setAdresse]       = useState('');
  const [ville, setVille]           = useState('');
  const [codePostal, setCodePostal] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading]   = useState(false);
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPhoneFix(agencyDefaults.phone_fix);
      setAdresse(agencyDefaults.adresse);
      setVille(agencyDefaults.ville);
      setCodePostal(agencyDefaults.code_postal);
    }
  }, [isOpen, agencyDefaults]);

  const compressImage = (file: File): Promise<File> => new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 800; let w = img.width, h = img.height;
      if (w > MAX || h > MAX) { const r = Math.min(MAX/w, MAX/h); w = Math.round(w*r); h = Math.round(h*r); }
      const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d'); if (!ctx) return resolve(file);
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => {
        if (!blob || blob.size < 100) { resolve(file); return; }
        resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' }));
      }, 'image/webp', 0.85);
    };
  });

  const uploadAvatar = async (file: File): Promise<string> => {
    const compressed = await compressImage(file);
    const fileName = `${Date.now()}-${compressed.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]/g,'-')}`;
    const { error } = await supabase.storage.from('avatars').upload(fileName, compressed);
    if (error) return '';
    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const resetForm = () => {
    setPrenom(''); setNom(''); setEmail(''); setPhone(''); setFonction(''); setRsac('');
    setAvatarFile(null); setAvatarPreview(null); setErrors({});
    setPhoneFix(agencyDefaults.phone_fix); setAdresse(agencyDefaults.adresse);
    setVille(agencyDefaults.ville); setCodePostal(agencyDefaults.code_postal);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!prenom.trim())     e.prenom     = 'Requis';
    if (!nom.trim())        e.nom        = 'Requis';
    if (!email.trim())      e.email      = 'Requis';
    if (!phone.trim())      e.phone      = 'Requis';
    if (!phoneFix.trim())   e.phoneFix   = 'Requis';
    if (!fonction.trim())   e.fonction   = 'Requis';
    if (!rsac.trim())       e.rsac       = 'Requis';
    if (!adresse.trim())    e.adresse    = 'Requis';
    if (!ville.trim())      e.ville      = 'Requis';
    if (!codePostal.trim()) e.codePostal = 'Requis';
    return e;
  };

  const handleCreate = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setIsLoading(true); setErrors({});
    try {
      const avatarUrl = avatarFile ? await uploadAvatar(avatarFile) : '';
      const { data, error: err } = await supabase.from('collaborateurs').insert([{
        first_name: prenom.trim(), last_name: nom.trim(),
        full_name: `${prenom.trim()} ${nom.trim()}`,
        email: email.trim(), phone: phone.trim(), phone_fix: phoneFix.trim(),
        fonction: fonction.trim(), rsac: rsac.trim(), adresse: adresse.trim(),
        ville: ville.trim(), code_postal: codePostal.trim(),
        avatar_url: avatarUrl || null, agency_id: agencyId,
      }]).select().single();
      if (err) throw err;
      onCreated({ ...data, full_name: `${prenom.trim()} ${nom.trim()}`, _source: 'collaborateurs' });
      resetForm(); onClose();
    } catch (err: any) { setErrors({ global: err.message }); }
    finally { setIsLoading(false); }
  };

  const inputClass = (key: string) =>
    `w-full bg-white/[0.06] border px-4 py-3 rounded-2xl outline-none focus:bg-white/[0.09] transition-all text-sm text-white font-medium placeholder:text-white/20 ${
      errors[key] ? 'border-red-500/60 focus:border-red-400' : 'border-white/10 focus:border-orange-500'
    }`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { resetForm(); onClose(); }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-[#16103a] border border-white/10 rounded-[32px] p-8 w-full max-w-2xl shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-xl font-black uppercase text-orange-500 tracking-tighter italic">Nouveau Collaborateur</h3>
                <p className="text-[8px] font-bold text-white/25 uppercase tracking-widest mt-1">La photo de profil est optionnelle</p>
              </div>
              <button onClick={() => { resetForm(); onClose(); }} className="text-white/30 hover:text-white transition-colors text-lg font-black">×</button>
            </div>

            <div className="space-y-6">
              {/* PHOTO */}
              <div className="flex items-center gap-5">
                <div onClick={() => fileInputRef.current?.click()}
                  className="h-16 w-16 rounded-full border-2 border-dashed border-white/20 hover:border-orange-500 bg-white/5 flex items-center justify-center cursor-pointer transition-all overflow-hidden shrink-0">
                  {avatarPreview ? <img src={avatarPreview} className="h-full w-full object-cover" alt="preview" /> : <span className="text-xl">📷</span>}
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[9px] font-black uppercase text-orange-400 hover:text-orange-300 transition-colors">
                  Choisir une photo (optionnelle) →
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)); } }} className="hidden" />
              </div>

              {/* IDENTITÉ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[['prenom','Prénom',prenom,setPrenom],['nom','Nom',nom,setNom],['fonction','Fonction',fonction,setFonction],['rsac','RSAC',rsac,setRsac]].map(([k,l,v,s]: any) => (
                  <div key={k}>
                    <label className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30 mb-1.5 ml-1 flex items-center gap-1">{l} <span className="text-red-400">*</span></label>
                    <input type="text" value={v} onChange={(e) => s(e.target.value)} className={inputClass(k)} />
                  </div>
                ))}
              </div>

              {/* CONTACT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30 mb-1.5 ml-1 flex items-center gap-1">Email <span className="text-red-400">*</span></label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass('email')} />
                </div>
                <div>
                  <label className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30 mb-1.5 ml-1 flex items-center gap-1">Mobile <span className="text-red-400">*</span></label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass('phone')} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30 mb-1.5 ml-1 flex items-center gap-1">Téléphone fixe <span className="text-red-400">*</span></label>
                  <input type="tel" value={phoneFix} onChange={(e) => setPhoneFix(e.target.value)} className={inputClass('phoneFix')} />
                </div>
              </div>

              {/* ADRESSE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30 mb-1.5 ml-1 flex items-center gap-1">Adresse <span className="text-red-400">*</span></label>
                  <input type="text" value={adresse} onChange={(e) => setAdresse(e.target.value)} className={inputClass('adresse')} />
                </div>
                <div>
                  <label className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30 mb-1.5 ml-1 flex items-center gap-1">Ville <span className="text-red-400">*</span></label>
                  <input type="text" value={ville} onChange={(e) => setVille(e.target.value)} className={inputClass('ville')} />
                </div>
                <div>
                  <label className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30 mb-1.5 ml-1 flex items-center gap-1">Code postal <span className="text-red-400">*</span></label>
                  <input type="text" value={codePostal} onChange={(e) => setCodePostal(e.target.value)} className={inputClass('codePostal')} />
                </div>
              </div>

              {errors.global && <p className="text-red-400 text-[10px] font-black uppercase bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">{errors.global}</p>}
              {Object.keys(errors).filter(k => k !== 'global').length > 0 && (
                <p className="text-red-400 text-[9px] font-black uppercase bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">⚠ Veuillez remplir tous les champs obligatoires</p>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => { resetForm(); onClose(); }} className="flex-1 py-4 rounded-2xl border border-white/10 text-[9px] font-black uppercase text-white/40 hover:text-white hover:border-white/30 transition-all">Annuler</button>
                <button onClick={handleCreate} disabled={isLoading} className="flex-1 bg-orange-600 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-500 transition-all shadow-lg active:scale-95 disabled:opacity-50">
                  {isLoading ? 'Ajout en cours...' : 'Ajouter au répertoire →'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}


const THEME = {
  category: 'Vetements',
  label: 'Gamme Business',
  color: 'text-orange-500',
  bg: 'bg-orange-500'
};


export default function BusinessPage() {
  const { cart, addToCart }           = useCart();
  const [isCartOpen, setIsCartOpen]   = useState(false);
  const [products, setProducts]       = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selections, setSelections]   = useState<any>({});
  const [flippedProducts, setFlippedProducts] = useState<Record<string, boolean>>({});
  const [selectedImage, setSelectedImage]     = useState<string | null>(null);

  // ── Qui commande ──
  const [userRole, setUserRole]       = useState<string>('');
  const [agencyId, setAgencyId]       = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [orderedBy, setOrderedBy]     = useState<Record<string, string>>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pendingProductId, setPendingProductId]   = useState<string | null>(null);
  const [agencyDefaults, setAgencyDefaults] = useState({ phone_fix: '', adresse: '', ville: '', code_postal: '' });


  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('role, agency_id').eq('id', user.id).single();
      if (profile) {
        setUserRole(profile.role);
        setAgencyId(profile.agency_id);
        if (profile.agency_id) {
          fetchTeamMembers(profile.agency_id);
          const { data: agence } = await supabase.from('agencies').select('phone_fix, adresse, ville, code_postal').eq('id', profile.agency_id).single();
          if (agence) setAgencyDefaults({ phone_fix: agence.phone_fix || '', adresse: agence.adresse || '', ville: agence.ville || '', code_postal: agence.code_postal || '' });
        }
      }
    };
    fetchUserData();
  }, []);

  const fetchTeamMembers = async (agId: string) => {
    const { data: admins }  = await supabase.from('profiles').select('id, full_name, first_name, last_name, role, email, phone, fonction, avatar_url').eq('agency_id', agId);
    const { data: collabs } = await supabase.from('collaborateurs').select('id, full_name, first_name, last_name, email, phone, phone_fix, fonction, rsac, adresse, ville, code_postal, avatar_url').eq('agency_id', agId);
    const merged = [
      ...(admins  || []).map(m => ({ ...m, _source: 'profiles' })),
      ...(collabs || []).map(m => ({ ...m, _source: 'collaborateurs' })),
    ].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
    setTeamMembers(merged);
  };


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*').eq('category', THEME.category).order('sort_order', { ascending: true });
        if (error) throw error;
        if (data) {
          const formatted = data.map(p => ({
            id: p.id, name: p.name,
            image_recto: p.image_recto, image_verso: p.image_verso,
            hasVariants: p.has_variants,
            variants:   p.config?.variants   || [],
            quantities: p.config?.quantities || [],
            prices:     p.config?.prices     || { default: [] },
            showOrderedBy: p.config?.show_ordered_by || false,
          }));
          setProducts(formatted);
          setSelections(formatted.reduce((acc, p) => ({
            ...acc, [p.id]: { qty: p.quantities[0] || 0, variant: p.hasVariants ? (p.variants[0]?.id || 'default') : 'default' }
          }), {}));
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, []);


  const toggleFlip = (id: string) => setFlippedProducts(prev => ({ ...prev, [id]: !prev[id] }));

  const handleAddToCart = (p: any) => {
    if (p.showOrderedBy && (userRole === 'admin_agence' || userRole === 'super_admin') && !orderedBy[p.id]) {
      alert('⚠ Veuillez sélectionner un collaborateur avant de commander.');
      return;
    }
    const s = selections[p.id];
    const pList = p.prices[s.variant] || p.prices.default || [];
    const totalHT = pList[p.quantities.indexOf(Number(s.qty))] || 0;
    const member = teamMembers.find(m => m.id === orderedBy[p.id]);
    addToCart({
      id: `${p.id}-${s.variant}`,
      name: `${p.name}${p.hasVariants ? ' - ' + (p.variants.find((v:any)=>v.id===s.variant)?.name || '') : ''}`,
      price: totalHT / (Number(s.qty) || 1),
      qty: Number(s.qty),
      category: THEME.label,
      color: THEME.color,
      orderedBy: member?.full_name || null,
    });
    setIsCartOpen(true);
  };

  const handleMemberCreated = (newMember: any) => {
    setTeamMembers(prev => [...prev, newMember].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || '')));
    if (pendingProductId) { setOrderedBy(prev => ({ ...prev, [pendingProductId]: newMember.id })); setPendingProductId(null); }
  };

  const handleOrderedByChange = (productId: string, value: string) => {
    if (value === '__create__') { setPendingProductId(productId); setIsCreateModalOpen(true); }
    else setOrderedBy(prev => ({ ...prev, [productId]: value }));
  };


  if (loading) return (
    <div className="min-h-screen bg-[#0f092e] flex items-center justify-center font-black text-orange-500 uppercase animate-pulse tracking-widest">
      Chargement Gamme Business...
    </div>
  );


  return (
    <div className="min-h-screen bg-[#0f092e] text-white flex flex-col relative overflow-x-hidden">
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <ImageModal isOpen={!!selectedImage} onClose={() => setSelectedImage(null)} imageSrc={selectedImage || ''} imageAlt="Aperçu produit" />

      <CreateProfileModal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); setPendingProductId(null); }}
        agencyId={agencyId}
        onCreated={handleMemberCreated}
        agencyDefaults={agencyDefaults}
      />

      <header className="py-6 px-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#0f092e]/80 backdrop-blur-md z-50">
        <Link href="/" className="text-[13px] font-black uppercase text-white/40 hover:text-white transition-all">← Retour</Link>
        <h1 className={`text-[13px] font-black uppercase tracking-[0.3em] ${THEME.color} italic`}>{THEME.label}</h1>
        <div className="w-10"></div>
      </header>

      <main className="max-w-7xl mx-auto w-full py-16 px-6 pb-40 grid grid-cols-1 md:grid-cols-3 gap-12">
        {products.map((p) => {
          const sel = selections[p.id];
          if (!sel) return null;

          const pList        = p.prices[sel.variant] || p.prices.default || [];
          const currentPrice = pList[p.quantities.indexOf(Number(sel.qty))] || 0;
          const isFlipped    = flippedProducts[p.id] || false;
          const currentVariant = p.variants.find((v: any) => v.id === sel.variant);
          const currentImg   = isFlipped
            ? (currentVariant?.image_verso || p.image_verso || p.image_recto)
            : (currentVariant?.image_recto || p.image_recto);

          const needsMember    = p.showOrderedBy && (userRole === 'admin_agence' || userRole === 'super_admin');
          const memberSelected = !!orderedBy[p.id];
          const canOrder       = !needsMember || memberSelected;

          return (
            <div key={p.id} className="pt-10 relative group">
              <div className="h-48 w-full flex items-center justify-center relative -mb-10 z-20">
                {(p.image_verso || currentVariant?.image_verso) && (
                  <button onClick={(e) => { e.stopPropagation(); toggleFlip(p.id); }}
                    className="absolute right-0 bottom-4 z-30 bg-white text-black px-4 py-2 rounded-full shadow-xl hover:bg-orange-500 hover:text-white transition-all active:scale-95 flex items-center gap-2">
                    <span className="text-[12px] font-black uppercase tracking-wider">{isFlipped ? 'Voir Recto' : 'Voir Verso'}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-500 ${isFlipped ? 'rotate-180' : ''}`}>
                      <path d="m15 18 6-6-6-6"/><path d="M3 12h18"/>
                    </svg>
                  </button>
                )}
                <AnimatePresence mode="wait">
                  <motion.img key={currentImg}
                    initial={{ opacity: 0, x: isFlipped ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isFlipped ? -20 : 20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    src={currentImg}
                    onClick={() => setSelectedImage(currentImg)}
                    className="max-h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-zoom-in transition-transform duration-500 group-hover:scale-110"
                    alt={p.name}
                  />
                </AnimatePresence>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 pt-16 hover:bg-white/[0.05] hover:border-orange-500/30 transition-all duration-500 shadow-xl">
                <h3 className={`font-black text-base uppercase mb-6 ${THEME.color} tracking-tight`}>{p.name}</h3>
                <div className="space-y-4">

                  {p.hasVariants && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Taille / Modèle</p>
                      <select value={sel.variant}
                        onChange={(e) => { setSelections({...selections, [p.id]:{...sel, variant: e.target.value}}); setFlippedProducts(prev => ({ ...prev, [p.id]: false })); }}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[13px] font-black uppercase text-white outline-none focus:border-orange-500 transition-all cursor-pointer">
                        {p.variants.map((v:any) => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Quantité souhaitée</p>
                    <select value={sel.qty}
                      onChange={(e) => setSelections({...selections, [p.id]:{...sel, qty: Number(e.target.value)}})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[13px] font-black uppercase text-white outline-none focus:border-orange-500 transition-all cursor-pointer">
                      {p.quantities.map((q:any) => <option key={q} value={q}>{q} exemplaires</option>)}
                    </select>
                  </div>

                  {/* ── QUI COMMANDE ? ── */}
                  {needsMember && (
                    <div className="space-y-1 border-t border-white/5 pt-4">
                      <label className="text-[10px] font-black uppercase ml-2 tracking-widest flex items-center gap-1.5">
                        <span className={memberSelected ? 'text-white/30' : 'text-red-400/80'}>nom du collaborateur</span>
                        {!memberSelected && <span className="text-red-400 text-[9px] font-bold normal-case tracking-normal">— requis pour commander</span>}
                      </label>
                      <select value={orderedBy[p.id] || ''}
                        onChange={(e) => handleOrderedByChange(p.id, e.target.value)}
                        className={`w-full bg-black/40 rounded-2xl p-4 text-[13px] font-black uppercase text-white outline-none cursor-pointer transition-all border ${
                          memberSelected ? 'border-orange-500/30 hover:border-orange-500' : 'border-red-500/30 hover:border-red-400'
                        }`}>
                        <option value="">— Sélectionner un membre —</option>
                        {teamMembers.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                        <option value="__create__">✚ Créer un profil</option>
                      </select>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-4">
                    <div className="flex flex-col">
                      <span className="font-black text-2xl text-white">{currentPrice.toFixed(2)}€</span>
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest italic">Hors Taxes (HT)</span>
                    </div>
                    <button onClick={() => handleAddToCart(p)} disabled={!canOrder}
                      title={!canOrder ? 'Sélectionnez un collaborateur' : ''}
                      className={`px-8 py-3.5 rounded-2xl font-black uppercase text-[12px] transition-all active:scale-95 shadow-lg ${
                        canOrder
                          ? 'bg-white text-[#0f092e] hover:bg-orange-500 hover:text-white shadow-white/5 cursor-pointer'
                          : 'bg-white/10 text-white/20 cursor-not-allowed border border-white/10'
                      }`}>
                      {canOrder ? 'Ajouter' : 'Choisir membre'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      <button onClick={() => setIsCartOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-white rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center z-[100] hover:scale-110 active:scale-95 transition-all group">
        <div className="relative">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f092e" strokeWidth="2.5" className="group-hover:stroke-orange-500 transition-colors">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          {cart.length > 0 && (
            <span className={`absolute -top-3 -right-3 ${THEME.bg} text-white text-[12px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-[#0f092e]`}>
              {cart.length}
            </span>
          )}
        </div>
      </button>

      <footer className="py-10 border-t border-white/5 text-center">
        <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">Guy Hoquet Business Portal — 2026</p>
      </footer>
    </div>
  );
}