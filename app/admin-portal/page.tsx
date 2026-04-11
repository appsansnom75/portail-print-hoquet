'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import imageCompression from 'browser-image-compression';

interface VariantItem {
  id: string;
  name: string;
  prices: string;
  fileRecto?: File | null;
  fileVerso?: File | null;
  image_recto?: string;
  image_verso?: string;
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

  // 1. CHARGEMENT AVEC TRI PAR SORT_ORDER
  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true }); // Tri par position
    if (data) setExistingProducts(data);
  };

  // 2. FONCTION POUR CHANGER L'ORDRE
  const moveOrder = async (product: any, direction: 'up' | 'down') => {
    const currentIndex = product.sort_order || 0;
    const newOrder = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    const { error } = await supabase
      .from('products')
      .update({ sort_order: newOrder })
      .eq('id', product.id);

    if (!error) fetchProducts();
  };

  const compressAndUpload = async (file: File, suffix: string) => {
    const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1200, useWebWorker: true };
    try {
      const compressedFile = await imageCompression(file, options);
      const cleanedName = file.name.replace(/\s/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
      const fileName = `${Date.now()}-${suffix}-${cleanedName}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, compressedFile);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (error) {
      console.error("Erreur compression/upload:", error);
      throw error;
    }
  };

  const checkAuth = () => {
    if (password === "123") { setIsAuthenticated(true); fetchProducts(); } 
    else { alert("Accès refusé"); }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCategory('Perso');
    setImageFile(null);
    setImageFileVerso(null);
    setQuantities('500, 1000, 5000');
    setBasePrices('100, 180, 500');
    setHasVariants(false);
    setVariantsList([]);
    setIsUploading(false);
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setName(p.name);
    setCategory(p.category);
    setQuantities(p.config.quantities.join(', '));
    setHasVariants(p.has_variants);
    if (p.has_variants) {
      setVariantsList(p.config.variants.map((v: any) => ({
        id: v.id,
        name: v.name,
        image_recto: v.image_recto,
        image_verso: v.image_verso,
        prices: p.config.prices[v.id]?.join(', ') || ""
      })));
    } else {
      setBasePrices(p.config.prices.default?.join(', ') || "");
      setVariantsList([]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

      const payload: any = {
        name,
        category,
        image_recto: mainUrl,
        image_verso: versoUrl || null,
        has_variants: hasVariants,
        config: { quantities: qtyArray, prices: finalPrices, variants: finalVariants }
      };

      // 3. ON GARDE L'ORDRE EXISTANT OU ON MET À 0
      if (!editingId) payload.sort_order = existingProducts.length;

      const { error: dbError } = editingId 
        ? await supabase.from('products').update(payload).eq('id', editingId)
        : await supabase.from('products').insert([payload]);

      if (dbError) throw dbError;

      alert(editingId ? "Modification enregistrée !" : "Produit ajouté !");
      resetForm();
      fetchProducts();
    } catch (err: any) { 
      alert("Erreur : " + err.message); 
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm('Supprimer définitivement ce produit ?')) {
      await supabase.from('products').delete().eq('id', id);
      fetchProducts(); 
    }
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#0f092e] flex items-center justify-center p-6 text-white">
      <div className="bg-white/5 p-8 rounded-2xl border border-white/10 w-full max-w-md text-center">
        <h2 className="font-black text-blue-500 uppercase tracking-widest mb-6">Admin Dashboard</h2>
        <input type="password" placeholder="Mot de passe" className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl mb-4 text-center" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkAuth()} />
        <button onClick={checkAuth} className="w-full bg-blue-500 py-4 rounded-xl font-black uppercase">Connexion</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-10 font-sans relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* FORMULAIRE (GAUCHE) */}
        <div className="lg:col-span-5 space-y-8">
          <div className="flex justify-between items-center sticky top-10 z-40 bg-[#0f092e]/80 p-2 backdrop-blur-sm">
            <h1 className="text-3xl font-black uppercase text-blue-500 italic">{editingId ? 'Édition' : 'Ajouter'}</h1>
            {editingId && <button onClick={resetForm} className="text-red-500 text-[9px] font-black uppercase">Annuler</button>}
          </div>
          
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6 relative">
            {isUploading && <div className="absolute inset-0 bg-[#0f092e]/80 z-[100] flex flex-col items-center justify-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}

            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl text-[11px] font-bold uppercase">
              <option value="Perso">Produits personnalisés (Bleu)</option>
              <option value="Signaletique">Produits sans personnalisation (Vert)</option>
              <option value="Vetements">Gamme Business (Orange)</option>
            </select>

            <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl text-sm" placeholder="Nom du produit" />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-white/40">Recto Principal</label>
                <input type="file" onChange={e => setImageFile(e.target.files?.[0] || null)} className="text-[8px]" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-white/40">Verso Principal</label>
                <input type="file" onChange={e => setImageFileVerso(e.target.files?.[0] || null)} className="text-[8px]" />
              </div>
            </div>

            <input value={quantities} onChange={e => setQuantities(e.target.value)} className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl text-sm" placeholder="Quantités (ex: 500, 1000)" />
            {!hasVariants && <input value={basePrices} onChange={e => setBasePrices(e.target.value)} className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl text-sm" placeholder="Prix HT" />}

            <button onClick={() => setHasVariants(!hasVariants)} className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-[9px] font-black uppercase">
              {hasVariants ? "✓ Modèles activés" : "+ Configurer modèles"}
            </button>

            {hasVariants && (
              <div className="space-y-4 border-l-2 border-blue-500 pl-4">
                {variantsList.map((v, idx) => (
                  <div key={idx} className="bg-white/5 p-4 rounded-xl space-y-3 relative">
                    <button onClick={() => setVariantsList(variantsList.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-500 text-[8px] font-black">SUPPR</button>
                    <p className="text-[10px] font-black text-blue-500 uppercase">{v.name}</p>
                    <input value={v.prices} onChange={(e) => { const c = [...variantsList]; c[idx].prices = e.target.value; setVariantsList(c); }} className="w-full bg-black/20 p-2 rounded text-xs" placeholder="Prix..." />
                    <div className="grid grid-cols-2 gap-2">
                        <input type="file" onChange={(e) => { const c = [...variantsList]; c[idx].fileRecto = e.target.files?.[0] || null; setVariantsList(c); }} className="text-[8px]" />
                        <input type="file" onChange={(e) => { const c = [...variantsList]; c[idx].fileVerso = e.target.files?.[0] || null; setVariantsList(c); }} className="text-[8px]" />
                    </div>
                  </div>
                ))}
                <button onClick={() => { const n = prompt("Nom :"); if(n) setVariantsList([...variantsList, { id: n.toLowerCase().replace(/\s/g, ''), name: n, prices: basePrices }]); }} className="text-[9px] font-black text-blue-400">+ Ajouter une variante</button>
              </div>
            )}

            <button onClick={handleSaveProduct} disabled={isUploading} className="w-full py-5 rounded-2xl font-black uppercase bg-blue-600">
              {editingId ? 'Sauvegarder' : 'Publier'}
            </button>
          </div>
        </div>

        {/* LISTING (DROITE) */}
        <div className="lg:col-span-7 space-y-12">
          {[
            { id: 'Perso', name: 'Personnalisés', color: 'text-blue-500' },
            { id: 'Signaletique', name: 'Signalétique', color: 'text-green-500' },
            { id: 'Vetements', name: 'Business', color: 'text-orange-500' }
          ].map(section => (
            <div key={section.id} className="space-y-4">
              <h2 className={`text-xl font-black uppercase italic ${section.color}`}>{section.name}</h2>
              <div className="space-y-2">
                {existingProducts.filter(p => p.category === section.id).map(p => (
                  <div key={p.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 group">
                    
                    {/* 4. BOUTONS DE TRI */}
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => moveOrder(p, 'up')} className="text-white/40 hover:text-white text-[10px]">▲</button>
                        <button onClick={() => moveOrder(p, 'down')} className="text-white/40 hover:text-white text-[10px]">▼</button>
                    </div>

                    <div className="flex gap-1 bg-black/20 p-1 rounded-lg">
                        <img src={p.image_recto} className="w-8 h-8 object-contain" />
                        {p.image_verso && <img src={p.image_verso} className="w-8 h-8 object-contain border-l border-white/10" />}
                    </div>

                    <div className="flex-1">
                      <p className="font-black uppercase text-[10px] tracking-widest">{p.name}</p>
                      <p className="text-[7px] text-white/20 uppercase font-black">Position: {p.sort_order || 0}</p>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => startEdit(p)} className="bg-white text-black px-3 py-1.5 rounded-lg text-[8px] font-black uppercase">Modifier</button>
                      <button onClick={() => handleDelete(p.id)} className="bg-red-500/20 text-red-500 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase">Suppr.</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}