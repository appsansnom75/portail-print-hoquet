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

  // CHARGEMENT INITIAL
  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true });
    if (data) setExistingProducts(data);
  };

  // MISE À JOUR RAPIDE (ORDRE OU LIGNE)
  const quickUpdate = async (id: string, field: string, value: number) => {
    const { error } = await supabase
      .from('products')
      .update({ [field]: value })
      .eq('id', id);
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

      // Si création, on ajoute à la fin
      if (!editingId) {
        payload.sort_order = existingProducts.length + 1;
        payload.line_position = 1;
      }

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
        <input type="password" placeholder="Mot de passe" className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl mb-4 text-center outline-none focus:border-blue-500" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkAuth()} />
        <button onClick={checkAuth} className="w-full bg-blue-500 py-4 rounded-xl font-black uppercase hover:bg-blue-400 transition-all">Connexion</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-10 font-sans relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* FORMULAIRE (GAUCHE) */}
        <div className="lg:col-span-5 space-y-8">
          <div className="flex justify-between items-center sticky top-0 z-40 bg-[#0f092e]/90 py-4 backdrop-blur-md">
            <h1 className="text-3xl font-black uppercase text-blue-500 italic">{editingId ? 'Édition' : 'Ajouter'}</h1>
            {editingId && <button onClick={resetForm} className="bg-red-500/10 text-red-500 px-4 py-2 rounded-full text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">Annuler</button>}
          </div>
          
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6 relative shadow-2xl">
            {isUploading && (
              <div className="absolute inset-0 bg-[#0f092e]/80 z-[100] flex flex-col items-center justify-center rounded-3xl backdrop-blur-sm">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Upload en cours...</p>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-white/30 ml-2">Type de produit</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl text-[11px] font-bold uppercase outline-none focus:border-blue-500">
                <option value="Perso">Impression (Bleu)</option>
                <option value="Signaletique">Signalétique (Vert)</option>
                <option value="Vetements">Business (Orange)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-white/30 ml-2">Nom affiché</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl text-sm font-bold outline-none focus:border-blue-500" placeholder="Ex: Panneau Akilux 3mm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-white/40 ml-1">Image Recto (Main)</label>
                <input type="file" onChange={e => setImageFile(e.target.files?.[0] || null)} className="block w-full text-[8px] text-white/40 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20 cursor-pointer" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-white/40 ml-1">Image Verso</label>
                <input type="file" onChange={e => setImageFileVerso(e.target.files?.[0] || null)} className="block w-full text-[8px] text-white/40 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-white/5 file:text-white/40 hover:file:bg-white/10 cursor-pointer" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-white/30 ml-2">Paliers Quantités (séparés par virgule)</label>
              <input value={quantities} onChange={e => setQuantities(e.target.value)} className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl text-sm font-mono" placeholder="500, 1000, 2500" />
            </div>

            {!hasVariants && (
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-white/30 ml-2">Prix HT par palier (séparés par virgule)</label>
                <input value={basePrices} onChange={e => setBasePrices(e.target.value)} className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl text-sm font-mono text-blue-400" placeholder="120, 200, 450" />
              </div>
            )}

            <button onClick={() => setHasVariants(!hasVariants)} className={`w-full py-4 border-2 border-dashed rounded-2xl text-[9px] font-black uppercase transition-all ${hasVariants ? 'border-blue-500 text-blue-500 bg-blue-500/5' : 'border-white/10 text-white/40 hover:border-white/20'}`}>
              {hasVariants ? "✓ Plusieurs modèles configurés" : "+ Activer différents modèles/tailles"}
            </button>

            {hasVariants && (
              <div className="space-y-4 border-l-2 border-blue-500 pl-4 py-2">
                {variantsList.map((v, idx) => (
                  <div key={idx} className="bg-white/5 p-4 rounded-2xl space-y-3 relative group">
                    <button onClick={() => setVariantsList(variantsList.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-500 text-[8px] font-black opacity-0 group-hover:opacity-100 transition-all">SUPPRIMER</button>
                    <p className="text-[10px] font-black text-blue-500 uppercase italic tracking-tighter">{v.name}</p>
                    <input value={v.prices} onChange={(e) => { const c = [...variantsList]; c[idx].prices = e.target.value; setVariantsList(c); }} className="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-[10px] font-mono" placeholder="Prix HT (ex: 10, 20, 30)" />
                    <div className="grid grid-cols-2 gap-2">
                        <input type="file" onChange={(e) => { const c = [...variantsList]; c[idx].fileRecto = e.target.files?.[0] || null; setVariantsList(c); }} className="text-[7px] w-full" />
                        <input type="file" onChange={(e) => { const c = [...variantsList]; c[idx].fileVerso = e.target.files?.[0] || null; setVariantsList(c); }} className="text-[7px] w-full" />
                    </div>
                  </div>
                ))}
                <button onClick={() => { const n = prompt("Nom de la variante (ex: Format A3, Taille L) :"); if(n) setVariantsList([...variantsList, { id: n.toLowerCase().replace(/\s/g, '-'), name: n, prices: basePrices }]); }} className="w-full py-3 bg-blue-500/10 text-blue-500 rounded-xl text-[9px] font-black uppercase hover:bg-blue-500/20 transition-all">+ Ajouter une option</button>
              </div>
            )}

            <button onClick={handleSaveProduct} disabled={isUploading} className="w-full py-5 rounded-2xl font-black uppercase bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
              {editingId ? 'Mettre à jour le produit' : 'Publier sur le portail'}
            </button>
          </div>
        </div>

        {/* LISTING (DROITE) */}
        <div className="lg:col-span-7 space-y-12">
          {[
            { id: 'Perso', name: 'Catalogue Impression', color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { id: 'Signaletique', name: 'Catalogue Signalétique', color: 'text-green-500', bg: 'bg-green-500/10' },
            { id: 'Vetements', name: 'Catalogue Business', color: 'text-orange-500', bg: 'bg-orange-500/10' }
          ].map(section => (
            <div key={section.id} className="space-y-6">
              <div className={`inline-block px-4 py-2 rounded-full ${section.bg}`}>
                <h2 className={`text-xs font-black uppercase tracking-[0.2em] ${section.color}`}>{section.name}</h2>
              </div>
              
              <div className="grid gap-3">
                {existingProducts.filter(p => p.category === section.id).map((p) => (
                  <div key={p.id} className="flex items-center gap-6 bg-white/[0.03] p-4 rounded-[24px] border border-white/5 hover:border-white/10 transition-all group">
                    
                    {/* POSITION & LIGNE */}
                    <div className="flex items-center gap-3 bg-black/40 p-3 rounded-2xl border border-white/5">
                        <div className="flex flex-col items-center">
                            <span className="text-[7px] font-black text-white/20 uppercase mb-1">Rang</span>
                            <input 
                                type="number" 
                                value={p.sort_order} 
                                onChange={(e) => quickUpdate(p.id, 'sort_order', parseInt(e.target.value))}
                                className="w-8 bg-transparent text-center font-black text-blue-500 text-xs outline-none"
                            />
                        </div>
                        <div className="w-[1px] h-6 bg-white/10"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-[7px] font-black text-white/20 uppercase mb-1">Ligne</span>
                            <div className="flex gap-1">
                                {[1, 2, 3].map(col => (
                                    <button 
                                        key={col}
                                        onClick={() => quickUpdate(p.id, 'line_position', col)}
                                        className={`w-5 h-5 rounded-md text-[8px] font-black transition-all ${p.line_position === col ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/20 hover:bg-white/10'}`}
                                    >
                                        {col}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* MINIATURES */}
                    <div className="flex -space-x-3 group-hover:space-x-1 transition-all">
                        <div className="w-12 h-12 bg-black rounded-xl p-1 border border-white/10 shadow-lg relative z-20">
                            <img src={p.image_recto} className="w-full h-full object-contain" />
                        </div>
                        {p.image_verso && (
                            <div className="w-12 h-12 bg-black/40 rounded-xl p-1 border border-white/10 opacity-40 group-hover:opacity-100 transition-all relative z-10">
                                <img src={p.image_verso} className="w-full h-full object-contain" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-black uppercase text-[11px] tracking-widest truncate">{p.name}</p>
                      <p className="text-[8px] text-white/30 font-bold mt-0.5">
                        {p.has_variants ? `${p.config.variants.length} modèles` : 'Unique'} • {p.config.quantities.length} paliers
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => startEdit(p)} className="p-3 bg-white/5 hover:bg-white text-white hover:text-black rounded-xl transition-all">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-3 bg-white/5 hover:bg-red-500 text-white rounded-xl transition-all">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
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