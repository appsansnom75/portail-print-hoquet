'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface VariantItem {
  id: string;
  name: string;
  prices: string;
  file?: File | null;
  image?: string; // Pour garder l'image existante lors d'une modif
}

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // États du formulaire
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Perso');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [quantities, setQuantities] = useState('500, 1000, 5000');
  const [basePrices, setBasePrices] = useState('100, 180, 500');
  const [hasVariants, setHasVariants] = useState(false);
  const [variantsList, setVariantsList] = useState<VariantItem[]>([]);
  
  const [existingProducts, setExistingProducts] = useState<any[]>([]);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setExistingProducts(data);
  };

  const checkAuth = () => {
    if (password === "123") { setIsAuthenticated(true); fetchProducts(); } 
    else { alert("Accès refusé"); }
  };

  // REMPLIR LE FORMULAIRE POUR MODIFIER
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
        image: v.image,
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

    try {
      let mainUrl = existingProducts.find(p => p.id === editingId)?.image_url;

      // Upload nouvelle image principale si présente
      if (imageFile) {
        const fileName = `${Date.now()}-main-${imageFile.name}`;
        await supabase.storage.from('product-images').upload(fileName, imageFile);
        mainUrl = supabase.storage.from('product-images').getPublicUrl(fileName).data.publicUrl;
      }

      if (!mainUrl && !imageFile) return alert("Image requise");

      const qtyArray = quantities.split(',').map(n => Number(n.trim()));
      const finalPrices: any = {};
      const finalVariants: any[] = [];

      if (hasVariants) {
        for (const v of variantsList) {
          let vImg = v.image || mainUrl;
          if (v.file) {
            const vFileName = `${Date.now()}-v-${v.file.name}`;
            await supabase.storage.from('product-images').upload(vFileName, v.file);
            vImg = supabase.storage.from('product-images').getPublicUrl(vFileName).data.publicUrl;
          }
          finalPrices[v.id] = v.prices.split(',').map(n => Number(n.trim()));
          finalVariants.push({ id: v.id, name: v.name, image: vImg });
        }
      } else {
        finalPrices['default'] = basePrices.split(',').map(n => Number(n.trim()));
      }

      const payload = {
        name,
        category,
        image_url: mainUrl,
        has_variants: hasVariants,
        config: { quantities: qtyArray, prices: finalPrices, variants: finalVariants }
      };

      if (editingId) {
        await supabase.from('products').update(payload).eq('id', editingId);
      } else {
        await supabase.from('products').insert([payload]);
      }

      alert(editingId ? "Mis à jour !" : "Produit ajouté !");
      window.location.reload();
    } catch (err) { alert("Erreur de sauvegarde"); }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Supprimer définitivement ?")) {
      await supabase.from('products').delete().eq('id', id);
      fetchProducts();
    }
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#0f092e] flex items-center justify-center p-6 text-white font-sans">
      <div className="bg-white/5 p-8 rounded-2xl border border-white/10 w-full max-w-md text-center">
        <h2 className="font-black text-blue-500 uppercase tracking-widest mb-6">Admin Portal</h2>
        <input type="password" placeholder="Pass" className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl text-white outline-none mb-4 text-center" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkAuth()} />
        <button onClick={checkAuth} className="w-full bg-blue-500 py-4 rounded-xl font-black">ENTRER</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-10 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* COLONNE GAUCHE : FORMULAIRE */}
        <div className="lg:col-span-5 space-y-8">
          <h1 className="text-3xl font-black uppercase text-blue-500 italic">{editingId ? 'Modifier Produit' : 'Créer un Produit'}</h1>
          
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-white/40 block tracking-widest">Catégorie de destination</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl outline-none text-blue-400 font-bold uppercase text-xs">
                <option value="Perso">Perso (Bleu)</option>
                <option value="Vetements">Vetements / Business (Orange)</option>
                <option value="Signaletique">Signaletique / Standard (Vert)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl outline-none" placeholder="Nom du produit" />
              <input type="file" onChange={e => setImageFile(e.target.files?.[0] || null)} className="text-[9px] self-center" />
            </div>

            <input value={quantities} onChange={e => setQuantities(e.target.value)} className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl outline-none" placeholder="Quantités (500, 1000...)" />
            
            {!hasVariants && (
              <input value={basePrices} onChange={e => setBasePrices(e.target.value)} className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl outline-none" placeholder="Prix HT (100, 180...)" />
            )}

            <button onClick={() => setHasVariants(!hasVariants)} className="w-full py-3 border border-dashed border-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest">
              {hasVariants ? "✓ Plusieurs variantes activées" : "+ Ajouter des modèles (Couleurs, Papiers...)"}
            </button>

            {hasVariants && (
              <div className="space-y-4 border-l-2 border-blue-500 pl-4 py-2">
                {variantsList.map((v, idx) => (
                  <div key={idx} className="bg-white/5 p-4 rounded-2xl space-y-3">
                    <div className="flex justify-between font-black text-[10px] uppercase text-blue-500">
                      <span>{v.name}</span>
                      <button onClick={() => setVariantsList(variantsList.filter((_, i) => i !== idx))} className="text-red-500">Suppr.</button>
                    </div>
                    <input value={v.prices} onChange={(e) => { const c = [...variantsList]; c[idx].prices = e.target.value; setVariantsList(c); }} className="w-full bg-black/20 border border-white/5 p-2 rounded text-xs" placeholder="Prix pour cette variante" />
                    <input type="file" onChange={(e) => { const c = [...variantsList]; c[idx].file = e.target.files?.[0] || null; setVariantsList(c); }} className="text-[8px]" />
                  </div>
                ))}
                <button onClick={() => { const n = prompt("Nom :"); if(n) setVariantsList([...variantsList, { id: n.toLowerCase(), name: n, prices: basePrices }]); }} className="text-[9px] font-black text-blue-400 uppercase">+ Variante</button>
              </div>
            )}

            <button onClick={handleSaveProduct} className="w-full bg-blue-500 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-400 transition-all">
              {editingId ? 'Mettre à jour' : 'Publier le produit'}
            </button>
            {editingId && <button onClick={() => window.location.reload()} className="w-full text-[9px] font-black uppercase text-white/20">Annuler</button>}
          </div>
        </div>

        {/* COLONNE DROITE : CATALOGUE TRIÉ */}
        <div className="lg:col-span-7 space-y-12">
          {['Perso', 'Vetements', 'Signaletique'].map(cat => (
            <div key={cat} className="space-y-4">
              <h2 className={`text-xl font-black uppercase italic ${cat === 'Perso' ? 'text-blue-500' : cat === 'Vetements' ? 'text-orange-500' : 'text-green-500'}`}>
                {cat}
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {existingProducts.filter(p => p.category === cat).map(p => (
                  <div key={p.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 group hover:border-white/20 transition-all">
                    <img src={p.image_url} className="w-12 h-12 object-contain bg-black/20 rounded-lg" />
                    <div className="flex-1">
                      <p className="font-black uppercase text-[10px] tracking-widest">{p.name}</p>
                      <p className="text-[7px] text-white/20 font-bold uppercase">{p.config.quantities.length} paliers de prix</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(p)} className="bg-blue-500/10 text-blue-500 px-3 py-2 rounded-lg text-[9px] font-black hover:bg-blue-500 hover:text-white transition-all">MODIFIER</button>
                      <button onClick={() => handleDelete(p.id)} className="bg-red-500/10 text-red-500 px-3 py-2 rounded-lg text-[9px] font-black hover:bg-red-500 hover:text-white transition-all">SUPPR.</button>
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