'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import imageCompression from 'browser-image-compression';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface VariantItem {
  id: string; name: string; prices: string;
  fileRecto?: File | null; fileVerso?: File | null;
  image_recto?: string; image_verso?: string;
}

// ── Composant variante sortable ──────────────────────────────────────────────
function SortableVariant({
  v, idx, variantsList, setVariantsList
}: {
  v: VariantItem; idx: number;
  variantsList: VariantItem[]; setVariantsList: (list: VariantItem[]) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: v.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}
      className="bg-white/5 p-4 rounded-2xl space-y-3 relative group border border-white/5 hover:border-blue-500/20 transition-all">
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners}
          className="cursor-grab active:cursor-grabbing p-1.5 text-white/10 hover:text-blue-400 transition-colors shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M7 11h10M7 15h10M7 19h10M7 7h10"/>
          </svg>
        </div>
        <p className="text-[13px] font-black text-blue-500 uppercase italic tracking-tighter flex-1 truncate">
          {v.name}
        </p>
        <button
          onClick={() => setVariantsList(variantsList.filter((_, i) => i !== idx))}
          className="text-red-500 text-[11px] font-black opacity-0 group-hover:opacity-100 transition-all uppercase shrink-0"
        >
          Supprimer
        </button>
      </div>
      <input
        value={v.prices}
        onChange={(e) => {
          const c = [...variantsList]; c[idx].prices = e.target.value; setVariantsList(c);
        }}
        className="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-[13px] font-mono outline-none focus:border-blue-500 transition-all"
        placeholder="Prix par palier..."
      />
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-white/20 uppercase ml-1">Recto</p>
          <input type="file" onChange={(e) => {
            const c = [...variantsList]; c[idx].fileRecto = e.target.files?.[0] || null; setVariantsList(c);
          }} className="text-[10px] w-full" />
          {v.image_recto && !v.fileRecto && (
            <img src={v.image_recto} className="h-8 w-8 object-contain rounded mt-1 opacity-50" alt="" />
          )}
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-white/20 uppercase ml-1">Verso</p>
          <input type="file" onChange={(e) => {
            const c = [...variantsList]; c[idx].fileVerso = e.target.files?.[0] || null; setVariantsList(c);
          }} className="text-[10px] w-full" />
          {v.image_verso && !v.fileVerso && (
            <img src={v.image_verso} className="h-8 w-8 object-contain rounded mt-1 opacity-50" alt="" />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Composant produit sortable (listing) ─────────────────────────────────────
function SortableItem({ p, startEdit, handleDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: p.id });
  const style = {
    transform: CSS.Transform.toString(transform), transition,
    zIndex: isDragging ? 100 : 1, opacity: isDragging ? 0.6 : 1,
  };

  const CATEGORY_COLOR: Record<string, string> = {
    Perso: 'text-blue-500', Stock: 'text-green-500',
    Vetements: 'text-orange-500', Signaletique: 'text-cyan-400', Operations: 'text-purple-500',
  };

  return (
    <div ref={setNodeRef} style={style}
      className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-[24px] border border-white/5 hover:border-blue-500/30 transition-all group">
      <div {...attributes} {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 text-white/10 hover:text-blue-500 transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M7 11h10M7 15h10M7 19h10M7 7h10"/>
        </svg>
      </div>
      <div className="w-12 h-12 bg-black rounded-xl overflow-hidden border border-white/10 flex items-center justify-center shrink-0">
        <img src={p.image_recto || '/placeholder.png'} className="max-w-full max-h-full object-contain" alt="" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black uppercase text-[13px] tracking-widest truncate">{p.name}</p>
        <p className={`text-[10px] font-bold uppercase ${CATEGORY_COLOR[p.category] || 'text-white/20'}`}>
          {p.has_variants ? `${p.config.variants?.length} modèles` : 'Modèle unique'}
        </p>
        {p.config?.show_ordered_by && (
          <p className="text-[10px] text-blue-500/60 font-black uppercase tracking-widest mt-0.5">✓ Qui commande ?</p>
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={() => startEdit(p)} className="p-2.5 bg-white/5 hover:bg-blue-500 rounded-xl transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
          </svg>
        </button>
        <button onClick={() => handleDelete(p.id)}
          className="p-2.5 bg-white/5 hover:bg-red-500 rounded-xl transition-all text-white/40 hover:text-white">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Page principale ──────────────────────────────────────────────────────────
export default function AdminPortal() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Perso');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFileVerso, setImageFileVerso] = useState<File | null>(null);
  const [quantities, setQuantities] = useState('500, 1000, 5000');
  const [basePrices, setBasePrices] = useState('100, 180, 500');
  const [hasVariants, setHasVariants] = useState(false);
  const [variantsList, setVariantsList] = useState<VariantItem[]>([]);
  const [existingProducts, setExistingProducts] = useState<any[]>([]);
  const [showOrderedBy, setShowOrderedBy] = useState(false);

  // ── États bannière promo ──
  const [promoBannerUrl, setPromoBannerUrl] = useState('');
  const [promoLinkUrl, setPromoLinkUrl] = useState('');
  const [promoFile, setPromoFile] = useState<File | null>(null);
  const [promoSaving, setPromoSaving] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/login'); return; }
      const { data: profile, error } = await supabase
        .from('profiles').select('role').eq('id', session.user.id).single();
      if (error || profile?.role !== 'super_admin') { setAuthStatus('unauthorized'); return; }
      setAuthStatus('authorized');
      fetchProducts();
      fetchPromoBanner();
    };
    checkAccess();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products').select('*').order('sort_order', { ascending: true });
    if (error) console.error("Erreur fetch:", error.message);
    if (data) setExistingProducts(data);
  };

  const fetchPromoBanner = async () => {
    const { data } = await supabase
      .from('promo_banner')
      .select('image_url, link_url')
      .eq('active', true)
      .single();
    if (data) {
      setPromoBannerUrl(data.image_url || '');
      setPromoLinkUrl(data.link_url || '');
    }
  };

  const handleSavePromoBanner = async () => {
    setPromoSaving(true);
    setPromoSuccess(false);
    try {
      let finalImageUrl = promoBannerUrl;
      if (promoFile) {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 2000, useWebWorker: true };
        const compressed = await imageCompression(promoFile, options);
        const fileName = `promo-banner-${Date.now()}.${promoFile.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, compressed, { upsert: true });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
      }
      await supabase.from('promo_banner').update({ active: false }).eq('active', true);
      await supabase.from('promo_banner').insert({
        image_url: finalImageUrl,
        link_url: promoLinkUrl,
        active: true,
      });
      setPromoBannerUrl(finalImageUrl);
      setPromoFile(null);
      setPromoSuccess(true);
      setTimeout(() => setPromoSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPromoSaving(false);
    }
  };

  const handleDeletePromoBanner = async () => {
    if (!confirm('Supprimer la bannière de la homepage ?')) return;
    await supabase.from('promo_banner').update({ active: false }).eq('active', true);
    setPromoBannerUrl('');
    setPromoLinkUrl('');
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = existingProducts.findIndex((p) => p.id === active.id);
    const newIndex = existingProducts.findIndex((p) => p.id === over.id);
    const newArray = arrayMove(existingProducts, oldIndex, newIndex);
    setExistingProducts(newArray);
    const updates = newArray.map((p, idx) => ({ id: p.id, sort_order: idx + 1 }));
    await Promise.all(updates.map(u =>
      supabase.from('products').update({ sort_order: u.sort_order }).eq('id', u.id)
    ));
  };

  const handleVariantDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = variantsList.findIndex(v => v.id === active.id);
    const newIndex = variantsList.findIndex(v => v.id === over.id);
    setVariantsList(arrayMove(variantsList, oldIndex, newIndex));
  };

  const compressAndUpload = async (file: File, suffix: string) => {
    const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1200, useWebWorker: true };
    const compressedFile = await imageCompression(file, options);
    const fileName = `${Date.now()}-${suffix}-${file.name.replace(/\s/g, '_')}`;
    const { error } = await supabase.storage.from('product-images').upload(fileName, compressedFile);
    if (error) throw error;
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSaveProduct = async () => {
    if (!name) return alert("Nom requis");
    setIsUploading(true);
    try {
      const existingP = existingProducts.find(p => p.id === editingId);
      let mainUrl = existingP?.image_recto;
      let versoUrl = existingP?.image_verso;
      if (imageFile) mainUrl = await compressAndUpload(imageFile, 'recto');
      if (imageFileVerso) versoUrl = await compressAndUpload(imageFileVerso, 'verso');

      const qtyArray = quantities.split(',').map(n => Number(n.trim()));
      const finalPrices: any = {};
      const finalVariants: any[] = [];

      if (hasVariants) {
        for (const v of variantsList) {
          let vImgRecto = v.image_recto || mainUrl;
          let vImgVerso = v.image_verso || versoUrl;
          if (v.fileRecto) vImgRecto = await compressAndUpload(v.fileRecto, `v-${v.id}-recto`);
          if (v.fileVerso) vImgVerso = await compressAndUpload(v.fileVerso, `v-${v.id}-verso`);
          finalPrices[v.id] = v.prices.split(',').map(n => Number(n.trim()));
          finalVariants.push({ id: v.id, name: v.name, image_recto: vImgRecto, image_verso: vImgVerso });
        }
      } else {
        finalPrices['default'] = basePrices.split(',').map(n => Number(n.trim()));
      }

      const payload = {
        name, category, image_recto: mainUrl, image_verso: versoUrl || null,
        has_variants: hasVariants,
        config: {
          quantities: qtyArray,
          prices: finalPrices,
          variants: finalVariants,
          show_ordered_by: showOrderedBy,
        }
      };

      if (!editingId) (payload as any).sort_order = existingProducts.length + 1;
      const { error } = editingId
        ? await supabase.from('products').update(payload).eq('id', editingId)
        : await supabase.from('products').insert([payload]);
      if (!error) { resetForm(); fetchProducts(); }
    } catch (err: any) { alert(err.message); }
    finally { setIsUploading(false); }
  };

  const resetForm = () => {
    setEditingId(null); setName(''); setCategory('Perso');
    setImageFile(null); setImageFileVerso(null);
    setQuantities('500, 1000, 5000'); setBasePrices('100, 180, 500');
    setHasVariants(false); setVariantsList([]); setShowOrderedBy(false);
  };

  const startEdit = (p: any) => {
    setEditingId(p.id); setName(p.name); setCategory(p.category);
    setQuantities(p.config.quantities.join(', '));
    setHasVariants(p.has_variants);
    setShowOrderedBy(p.config?.show_ordered_by || false);
    if (p.has_variants) {
      setVariantsList(p.config.variants.map((v: any) => ({
        id: v.id, name: v.name, image_recto: v.image_recto, image_verso: v.image_verso,
        prices: p.config.prices[v.id]?.join(', ') || "",
      })));
    } else {
      setBasePrices(p.config.prices.default?.join(', ') || "");
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ?')) {
      await supabase.from('products').delete().eq('id', id);
      fetchProducts();
    }
  };

  if (authStatus === 'loading') return (
    <div className="min-h-screen bg-[#0f092e] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (authStatus === 'unauthorized') return (
    <div className="min-h-screen bg-[#0f092e] flex items-center justify-center p-6 text-white text-center">
      <div className="bg-white/5 p-10 rounded-[40px] border border-white/10 w-full max-w-md shadow-2xl space-y-4">
        <div className="text-5xl">🚫</div>
        <h2 className="font-black text-red-500 uppercase tracking-[0.3em] italic text-xl">Accès refusé</h2>
        <p className="text-white/40 text-sm">Vous n'avez pas les droits pour accéder à cette page.</p>
        <button onClick={() => router.replace('/')}
          className="w-full bg-white/5 hover:bg-white/10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all">
          Retour à l'accueil
        </button>
      </div>
    </div>
  );

  const SECTIONS = [
    { id: 'Perso',        label: 'Produits personnalisables',  color: 'text-blue-500'   },
    { id: 'Stock',        label: 'Produits non personnalisés', color: 'text-green-500'  },
    { id: 'Vetements',    label: 'Gamme Business',             color: 'text-orange-500' },
    { id: 'Signaletique', label: 'Signalétique',               color: 'text-cyan-400'   },
    { id: 'Operations',   label: 'Opérations du moment',       color: 'text-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-10 font-sans relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">

        {/* ── FORMULAIRE GAUCHE ── */}
        <div className="lg:col-span-5 space-y-8">
          <div className="flex justify-between items-center sticky top-0 z-40 bg-[#0f092e]/90 py-4 backdrop-blur-md">
            <h1 className="text-3xl font-black uppercase text-blue-500 italic tracking-tighter">
              {editingId ? 'Édition' : 'Nouveau'}
            </h1>
            {editingId && (
              <button onClick={resetForm}
                className="bg-red-500/10 text-red-500 px-4 py-2 rounded-full text-[12px] font-black uppercase">
                Annuler
              </button>
            )}
          </div>

          {/* ── FORMULAIRE PRODUIT ── */}
          <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 space-y-6 relative shadow-2xl">
            {isUploading && (
              <div className="absolute inset-0 bg-[#0f092e]/80 z-[100] flex flex-col items-center justify-center rounded-[40px] backdrop-blur-sm">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[12px] font-black uppercase text-white/30 ml-2">Emplacement</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full bg-[#16103a] border border-white/10 p-4 rounded-2xl text-[11px] font-black uppercase outline-none focus:border-blue-500">
                <option value="Perso">Produits personnalisables</option>
                <option value="Stock">Produits non personnalisés</option>
                <option value="Vetements">Gamme Business</option>
                <option value="Signaletique">Signalétique</option>
                <option value="Operations">Opérations du moment</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-black uppercase text-white/30 ml-2">Nom du produit</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-sm font-bold outline-none"
                placeholder="Ex: Panneau de chantier" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[11px] font-black text-white/30 uppercase mb-2">Image Recto</p>
                <input type="file" onChange={e => setImageFile(e.target.files?.[0] || null)} className="text-[11px] w-full" />
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[11px] font-black text-white/30 uppercase mb-2">Image Verso</p>
                <input type="file" onChange={e => setImageFileVerso(e.target.files?.[0] || null)} className="text-[11px] w-full" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-black uppercase text-white/30 ml-2">Paliers de quantités</label>
              <input value={quantities} onChange={e => setQuantities(e.target.value)}
                className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-sm font-mono"
                placeholder="500, 1000, 2000" />
            </div>

            {!hasVariants && (
              <div className="space-y-1">
                <label className="text-[12px] font-black uppercase text-white/30 ml-2">Prix par palier</label>
                <input value={basePrices} onChange={e => setBasePrices(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-sm font-mono text-blue-400"
                  placeholder="100, 180, 300" />
              </div>
            )}

            <button onClick={() => setHasVariants(!hasVariants)}
              className={`w-full py-4 border-2 border-dashed rounded-2xl text-[12px] font-black uppercase transition-all ${
                hasVariants ? 'border-blue-500 text-blue-500 bg-blue-500/5' : 'border-white/10 text-white/30'
              }`}>
              {hasVariants ? "✓ Plusieurs modèles configurés" : "+ Ajouter des options / tailles"}
            </button>

            {hasVariants && (
              <div className="space-y-4 border-l-2 border-blue-500 pl-4 py-2">
                {variantsList.length > 1 && (
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-400/40 flex items-center gap-2">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M7 11h10M7 15h10M7 19h10M7 7h10"/>
                    </svg>
                    Glisser pour réordonner · affiché dans cet ordre dans le menu
                  </p>
                )}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleVariantDragEnd}>
                  <SortableContext items={variantsList.map(v => v.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {variantsList.map((v, idx) => (
                        <SortableVariant key={v.id} v={v} idx={idx} variantsList={variantsList} setVariantsList={setVariantsList} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                <button
                  onClick={() => {
                    const n = prompt("Nom de l'option :");
                    if (n) setVariantsList([...variantsList, {
                      id: n.toLowerCase().replace(/\s/g, '-'),
                      name: n,
                      prices: basePrices,
                    }]);
                  }}
                  className="w-full py-3 bg-blue-500/10 text-blue-500 rounded-xl text-[12px] font-black uppercase hover:bg-blue-500/20 transition-all"
                >
                  + Nouvelle variante
                </button>
              </div>
            )}

            <div onClick={() => setShowOrderedBy(!showOrderedBy)}
              className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                showOrderedBy ? 'border-blue-500/40 bg-blue-500/5' : 'border-white/5 bg-white/[0.02] hover:border-white/10'
              }`}>
              <div className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${showOrderedBy ? 'bg-blue-500' : 'bg-white/10'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${showOrderedBy ? 'left-7' : 'left-1'}`}></div>
              </div>
              <div>
                <p className="text-[12px] font-black uppercase tracking-widest text-white/70">Afficher "Nom du collaborateur"</p>
                <p className="text-[11px] text-white/20 mt-0.5">Affiche la liste de l'équipe sur ce produit (admin agence uniquement)</p>
              </div>
            </div>

            <button onClick={handleSaveProduct} disabled={isUploading}
              className="w-full py-5 rounded-2xl font-black uppercase bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-500/20 active:scale-95 transition-all tracking-[0.2em]">
              {editingId ? 'Sauvegarder' : 'Publier'}
            </button>
          </div>

          {/* ── SECTION IMAGE HOMEPAGE ── */}
          <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 space-y-6 shadow-2xl relative">
            {promoSaving && (
              <div className="absolute inset-0 bg-[#0f092e]/80 z-[100] flex items-center justify-center rounded-[40px] backdrop-blur-sm">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[13px] font-black uppercase tracking-[0.2em] text-orange-400 italic">
                  🖼️ Image Homepage
                </h2>
                <p className="text-[11px] text-white/20 mt-1">Bannière promotionnelle affichée sous les catégories</p>
              </div>
              {promoBannerUrl && (
                <button
                  onClick={handleDeletePromoBanner}
                  className="text-[11px] font-black text-red-500/50 hover:text-red-500 uppercase transition-colors"
                >
                  Supprimer
                </button>
              )}
            </div>

            {/* Aperçu image actuelle */}
            {promoBannerUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-white/5">
                <img
                  src={promoBannerUrl}
                  alt="Bannière actuelle"
                  className="w-full h-auto max-h-[120px] object-cover"
                />
                <div className="absolute top-2 right-2 bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-black uppercase px-2 py-1 rounded-full">
                  ✓ Actif
                </div>
              </div>
            )}

            {/* Upload nouvelle image */}
            <div className="space-y-2">
              <label className="text-[12px] font-black uppercase text-white/30 ml-2">
                {promoBannerUrl ? "Remplacer l'image" : 'Choisir une image'}
              </label>
              <div className="flex items-center gap-2">
                <div className="bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
                  <span className="text-orange-400 text-[11px] font-black uppercase tracking-widest">📐 Format conseillé</span>
                  <span className="text-orange-300 text-[13px] font-black tabular-nums">1000 × 300 px</span>
                </div>
                <span className="text-white/10 text-[10px] font-black uppercase">JPG ou PNG</span>
              </div>
              <div className="bg-black/40 border border-white/10 p-4 rounded-2xl">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setPromoFile(e.target.files?.[0] || null)}
                  className="text-[12px] w-full text-white/50"
                />
                {promoFile && (
                  <p className="text-[11px] text-orange-400 font-black mt-2 uppercase">
                    ✓ {promoFile.name}
                  </p>
                )}
              </div>
            </div>

            {/* Lien cliquable */}
            <div className="space-y-1">
              <label className="text-[12px] font-black uppercase text-white/30 ml-2">Lien (URL de destination)</label>
              <input
                value={promoLinkUrl}
                onChange={e => setPromoLinkUrl(e.target.value)}
                className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-sm font-mono outline-none focus:border-orange-500 transition-all text-orange-300 placeholder-white/10"
                placeholder="https://... ou /operations"
              />
              <p className="text-[10px] text-white/10 ml-2">Lien interne (/operations) ou externe (https://...)</p>
            </div>

            <button
              onClick={handleSavePromoBanner}
              disabled={promoSaving || (!promoFile && !promoBannerUrl)}
              className="w-full py-4 rounded-2xl font-black uppercase bg-orange-600 hover:bg-orange-500 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-orange-500/10 active:scale-95 transition-all tracking-[0.2em]"
            >
              {promoSaving ? 'Enregistrement...' : promoSuccess ? '✓ Sauvegardé !' : promoBannerUrl ? 'Mettre à jour' : 'Publier la bannière'}
            </button>
          </div>
          {/* ── FIN SECTION IMAGE HOMEPAGE ── */}

        </div>

        {/* ── LISTING DRAG & DROP DROITE ── */}
        <div className="lg:col-span-7 space-y-12 pb-20">
          {SECTIONS.map(section => (
            <div key={section.id} className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className={`text-xs font-black uppercase tracking-[0.3em] italic ${section.color}`}>
                  {section.label}
                </h2>
                <div className="h-[1px] flex-1 bg-white/5"></div>
                <span className="text-[11px] font-black text-white/10 uppercase">
                  {existingProducts.filter(p => p.category === section.id).length} produit(s)
                </span>
              </div>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={existingProducts.filter(p => p.category === section.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="grid gap-2">
                    {existingProducts.filter(p => p.category === section.id).length === 0 ? (
                      <p className="text-[11px] text-white/10 font-black uppercase tracking-widest text-center py-6 border border-dashed border-white/5 rounded-2xl">
                        Aucun produit
                      </p>
                    ) : (
                      existingProducts.filter(p => p.category === section.id).map((p) => (
                        <SortableItem key={p.id} p={p} startEdit={startEdit} handleDelete={handleDelete} />
                      ))
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}