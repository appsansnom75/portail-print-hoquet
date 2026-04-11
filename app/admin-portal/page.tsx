'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import imageCompression from 'browser-image-compression';

// Imports pour le Drag & Drop
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface VariantItem {
  id: string;
  name: string;
  prices: string;
  fileRecto?: File | null;
  fileVerso?: File | null;
  image_recto?: string;
  image_verso?: string;
}

// COMPOSANT PETITE CARTE POUR LE DRAG & DROP
function SortableItem({ p, startEdit, handleDelete }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: p.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex items-center gap-4 bg-white/[0.03] p-4 rounded-[24px] border border-white/5 hover:border-white/20 transition-all group"
    >
      {/* POIGNÉE DE DRAG */}
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 text-white/20 hover:text-blue-500">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M7 11h10M7 15h10M7 19h10M7 7h10"/></svg>
      </div>

      <div className="flex -space-x-3">
          <div className="w-10 h-10 bg-black rounded-xl p-1 border border-white/10 shadow-lg relative z-20">
              <img src={p.image_recto} className="w-full h-full object-contain" alt="" />
          </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-black uppercase text-[10px] tracking-widest truncate">{p.name}</p>
        <p className="text-[7px] text-white/20 font-bold uppercase">Ordre: {p.sort_order}</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => startEdit(p)} className="p-2 bg-white/5 hover:bg-white hover:text-black rounded-lg transition-all">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
        </button>
        <button onClick={() => handleDelete(p.id)} className="p-2 bg-white/5 hover:bg-red-500 rounded-lg transition-all">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </div>
    </div>
  );
}

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
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

  // Configuration des capteurs pour le Drag
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('sort_order', { ascending: true });
    if (data) setExistingProducts(data);
  };

  // LOGIQUE DE FIN DE DRAG
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = existingProducts.findIndex((p) => p.id === active.id);
    const newIndex = existingProducts.findIndex((p) => p.id === over.id);
    
    const newArray = arrayMove(existingProducts, oldIndex, newIndex);
    setExistingProducts(newArray);

    // Sauvegarde en masse du nouvel ordre
    const updates = newArray.map((p, idx) => ({
      id: p.id,
      sort_order: idx + 1 // L'ordre commence à 1
    }));

    // On utilise Promise.all pour tout mettre à jour d'un coup
    await Promise.all(
      updates.map(u => supabase.from('products').update({ sort_order: u.sort_order }).eq('id', u.id))
    );
  };

  const compressAndUpload = async (file: File, suffix: string) => {
    const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1200, useWebWorker: true };
    const compressedFile = await imageCompression(file, options);
    const fileName = `${Date.now()}-${suffix}-${file.name.replace(/\s/g, '_')}`;
    await supabase.storage.from('product-images').upload(fileName, compressedFile);
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const checkAuth = () => { if (password === "123") { setIsAuthenticated(true); fetchProducts(); } };

  const handleSaveProduct = async () => {
    if (!name) return;
    setIsUploading(true);
    try {
      const existingP = existingProducts.find(p => p.id === editingId);
      let mainUrl = existingP?.image_recto;
      let versoUrl = existingP?.image_verso;

      if (imageFile) mainUrl = await compressAndUpload(imageFile, 'recto');
      if (imageFileVerso) versoUrl = await compressAndUpload(imageFileVerso, 'verso');

      const payload = {
        name, category, image_recto: mainUrl, image_verso: versoUrl || null,
        has_variants: hasVariants,
        config: { 
          quantities: quantities.split(',').map(n => Number(n.trim())), 
          prices: hasVariants ? variantsList.reduce((acc, v) => ({ ...acc, [v.id]: v.prices.split(',').map(n => Number(n.trim())) }), {}) : { default: basePrices.split(',').map(n => Number(n.trim())) },
          variants: hasVariants ? variantsList.map(v => ({ id: v.id, name: v.name, image_recto: v.image_recto || mainUrl, image_verso: v.image_verso || versoUrl })) : []
        }
      };

      if (!editingId) (payload as any).sort_order = existingProducts.length + 1;

      const { error } = editingId ? await supabase.from('products').update(payload).eq('id', editingId) : await supabase.from('products').insert([payload]);
      if (!error) { resetForm(); fetchProducts(); }
    } finally { setIsUploading(false); }
  };

  const resetForm = () => {
    setEditingId(null); setName(''); setCategory('Perso'); setImageFile(null); setImageFileVerso(null);
    setQuantities('500, 1000, 5000'); setBasePrices('100, 180, 500'); setHasVariants(false); setVariantsList([]);
  };

  const startEdit = (p: any) => {
    setEditingId(p.id); setName(p.name); setCategory(p.category); setQuantities(p.config.quantities.join(', '));
    setHasVariants(p.has_variants);
    if (p.has_variants) {
      setVariantsList(p.config.variants.map((v: any) => ({ id: v.id, name: v.name, image_recto: v.image_recto, image_verso: v.image_verso, prices: p.config.prices[v.id]?.join(', ') || "" })));
    } else { setBasePrices(p.config.prices.default?.join(', ') || ""); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => { if(confirm('Supprimer ?')) { await supabase.from('products').delete().eq('id', id); fetchProducts(); } };

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#0f092e] flex items-center justify-center p-6 text-white">
      <div className="bg-white/5 p-8 rounded-2xl border border-white/10 w-full max-w-md text-center">
        <h2 className="font-black text-blue-500 uppercase mb-6 tracking-widest">Admin Access</h2>
        <input type="password" placeholder="..." className="w-full bg-black/40 border border-white/10 p-4 rounded-xl mb-4 text-center" onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkAuth()} />
        <button onClick={checkAuth} className="w-full bg-blue-600 py-4 rounded-xl font-black uppercase">Entrer</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-10 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* FORMULAIRE (GAUCHE) */}
        <div className="lg:col-span-5 space-y-8">
            <h1 className="text-3xl font-black uppercase text-blue-500 italic">{editingId ? 'Édition' : 'Ajouter'}</h1>
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6 relative">
                {isUploading && <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center rounded-3xl">Patientez...</div>}
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl text-[11px] font-bold uppercase outline-none">
                    <option value="Perso">Impression</option>
                    <option value="Signaletique">Signalétique</option>
                    <option value="Vetements">Business</option>
                </select>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-sm font-bold outline-none" placeholder="Nom du produit" />
                <div className="grid grid-cols-2 gap-4">
                    <input type="file" onChange={e => setImageFile(e.target.files?.[0] || null)} className="text-[8px]" />
                    <input type="file" onChange={e => setImageFileVerso(e.target.files?.[0] || null)} className="text-[8px]" />
                </div>
                <input value={quantities} onChange={e => setQuantities(e.target.value)} className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-sm" placeholder="Quantités (ex: 500, 1000)" />
                {!hasVariants && <input value={basePrices} onChange={e => setBasePrices(e.target.value)} className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-sm text-blue-400" placeholder="Prix HT..." />}
                <button onClick={() => setHasVariants(!hasVariants)} className="w-full py-3 border border-dashed border-white/20 rounded-xl text-[9px] font-black uppercase">Variantes : {hasVariants ? 'OUI' : 'NON'}</button>
                <button onClick={handleSaveProduct} className="w-full py-5 rounded-2xl font-black uppercase bg-blue-600 hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20">Enregistrer</button>
            </div>
        </div>

        {/* LISTING AVEC DRAG & DROP (DROITE) */}
        <div className="lg:col-span-7 space-y-12">
          {['Perso', 'Signaletique', 'Vetements'].map(catId => (
            <div key={catId} className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-30 italic">{catId === 'Perso' ? 'Impression' : catId === 'Signaletique' ? 'Signalétique' : 'Business'}</h2>
              
              <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter} 
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={existingProducts.filter(p => p.category === catId)} 
                  strategy={verticalListSortingStrategy}
                >
                  <div className="grid gap-2">
                    {existingProducts.filter(p => p.category === catId).map((p) => (
                      <SortableItem 
                        key={p.id} 
                        p={p} 
                        startEdit={startEdit} 
                        handleDelete={handleDelete} 
                      />
                    ))}
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