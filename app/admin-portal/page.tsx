'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface VariantItem {
  id: string;
  name: string;
  prices: string;
  file?: File | null;
  image?: string; 
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

  // RÉINITIALISER LE FORMULAIRE
  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCategory('Perso');
    setImageFile(null);
    setQuantities('500, 1000, 5000');
    setBasePrices('100, 180, 500');
    setHasVariants(false);
    setVariantsList([]);
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

      if (editingId) { await supabase.from('products').update(payload).eq('id', editingId); } 
      else { await supabase.from('products').insert([payload]); }

      alert(editingId ? "Modification enregistrée !" : "Produit ajouté !");
      resetForm();
      fetchProducts();
    } catch (err) { alert("Erreur de sauvegarde"); }
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#0f092e] flex items-center justify-center p-6 text-white">
      <div className="bg-white/5 p-8 rounded-2xl border border-white/10 w-full max-w-md text-center">
        <h2 className="font-black text-blue-500 uppercase tracking-widest mb-6 italic">Admin Dashboard</h2>
        <input type="password" placeholder="Mot de passe" className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl text-white outline-none mb-4 text-center" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkAuth()} />
        <button onClick={checkAuth} className="w-full bg-blue-500 py-4 rounded-xl font-black uppercase">Connexion</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-10 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* FORMULAIRE D'AJOUT / MODIFICATION */}
        <div className="lg:col-span-5 space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-black uppercase text-blue-500 italic">
              {editingId ? 'Mode Édition' : 'Ajouter un produit'}
            </h1>
            {editingId && (
              <button onClick={resetForm} className="bg-red-500/20 text-red-500 px-4 py-2 rounded-full text-[9px] font-black uppercase border border-red-500/30 hover:bg-red-500 hover:text-white transition-all">
                Annuler la modification
              </button>
            )}
          </div>
          
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-white/40 block tracking-widest">Page de destination</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl outline-none text-white font-bold uppercase text-[11px]">
                <option value="Perso">Produits personnalisés (Bleu)</option>
                <option value="Signaletique">Produits sans personnalisation (Vert)</option>
                <option value="Vetements">Gamme Business (Orange)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase">Titre</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl outline-none text-sm" placeholder="Nom..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-tighter">Image {editingId && '(Optionnel)'}</label>
                <input type="file" onChange={e => setImageFile(e.target.files?.[0] || null)} className="text-[9px] mt-2 block w-full file:bg-blue-500 file:border-0 file:text-white file:px-3 file:py-1 file:rounded file:font-black file:uppercase" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase">Quantités proposées (Séparez par une virgule)</label>
              <input value={quantities} onChange={e => setQuantities(e.target.value)} className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl outline-none text-sm" placeholder="ex: 1, 5, 10, 50" />
            </div>

            {!hasVariants && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase">Prix HT correspondants (Séparez par une virgule)</label>
                <input value={basePrices} onChange={e => setBasePrices(e.target.value)} className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl outline-none text-sm border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]" placeholder="ex: 10, 45, 80, 350" />
                <p className="text-[8px] text-white/30 italic">L'ordre doit être identique aux quantités ci-dessus.</p>
              </div>
            )}

            <button onClick={() => setHasVariants(!hasVariants)} className={`w-full py-4 border-2 border-dashed rounded-2xl text-[9px] font-black uppercase transition-all ${hasVariants ? 'border-blue-500 text-blue-500 bg-blue-500/5' : 'border-white/10 text-white/30 hover:border-white/30'}`}>
              {hasVariants ? "✓ Plusieurs modèles activés" : "+ Configurer plusieurs modèles/options"}
            </button>

            {hasVariants && (
              <div className="space-y-6 border-l-2 border-blue-500 pl-6 py-2">
                <p className="text-[9px] font-black text-blue-400/60 uppercase tracking-widest mb-2">Détails des variantes :</p>
                {variantsList.map((v, idx) => (
                  <div key={idx} className="bg-white/5 p-5 rounded-2xl space-y-4 relative border border-white/5 shadow-inner">
                    <button onClick={() => setVariantsList(variantsList.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-red-500 text-[9px] font-black hover:scale-110 transition-transform px-2 py-1">SUPPRIMER</button>
                    <p className="font-black text-[12px] uppercase text-blue-500 tracking-tighter">{v.name}</p>
                    
                    <div className="space-y-2">
                      <label className="text-[8px] font-black text-white/40 uppercase">Prix spécifiques pour {v.name}</label>
                      <input value={v.prices} onChange={(e) => { const c = [...variantsList]; c[idx].prices = e.target.value; setVariantsList(c); }} className="w-full bg-black/30 border border-white/5 p-3 rounded-lg text-xs outline-none focus:border-blue-500" placeholder="Prix (ex: 12, 50, 95...)" />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-white/40 uppercase">Image spécifique (Laisser vide pour garder l'image principale)</label>
                      <input type="file" onChange={(e) => { const c = [...variantsList]; c[idx].file = e.target.files?.[0] || null; setVariantsList(c); }} className="text-[8px] opacity-60" />
                    </div>
                  </div>
                ))}
                <button onClick={() => { const n = prompt("Nom de l'option (ex: Papier Mat, Format A3...) :"); if(n) setVariantsList([...variantsList, { id: n.toLowerCase().replace(/\s/g, ''), name: n, prices: basePrices }]); }} className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-blue-400 uppercase hover:bg-white/10">+ Ajouter un modèle</button>
              </div>
            )}

            <button onClick={handleSaveProduct} className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 ${editingId ? 'bg-orange-600 hover:bg-orange-500' : 'bg-blue-600 hover:bg-blue-500'}`}>
              {editingId ? 'Enregistrer les modifications' : 'Publier sur le site'}
            </button>
          </div>
        </div>

        {/* LISTE DES PRODUITS */}
        <div className="lg:col-span-7 space-y-12">
          {[
            { id: 'Perso', name: 'Produits personnalisés', color: 'text-blue-500', bg: 'bg-blue-500' },
            { id: 'Signaletique', name: 'Produits sans personnalisation', color: 'text-green-500', bg: 'bg-green-500' },
            { id: 'Vetements', name: 'Gamme Business', color: 'text-orange-500', bg: 'bg-orange-500' }
          ].map(section => (
            <div key={section.id} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-1 h-6 ${section.bg}`}></div>
                <h2 className={`text-xl font-black uppercase italic tracking-tighter ${section.color}`}>{section.name}</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {existingProducts.filter(p => p.category === section.id).length === 0 ? (
                  <p className="text-[9px] font-black uppercase text-white/10 pl-5 italic tracking-widest">Aucun produit dans cette section</p>
                ) : (
                  existingProducts.filter(p => p.category === section.id).map(p => (
                    <div key={p.id} className="flex items-center gap-5 bg-white/[0.03] p-5 rounded-3xl border border-white/5 hover:bg-white/[0.06] transition-all group">
                      <img src={p.image_url} className="w-14 h-14 object-contain bg-black/40 rounded-xl p-1" alt="" />
                      <div className="flex-1">
                        <p className="font-black uppercase text-[11px] tracking-widest text-white/90">{p.name}</p>
                        <div className="flex gap-3 mt-1">
                          <span className="text-[7px] text-white/30 font-black uppercase">{p.config.quantities.length} Tarifs</span>
                          {p.has_variants && <span className="text-[7px] text-blue-500 font-black uppercase border border-blue-500/30 px-1 rounded">Modèles inclus</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(p)} className="bg-white text-[#0f092e] px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-lg active:scale-95">Modifier</button>
                        <button onClick={() => { if(confirm('Supprimer définitivement ?')) { supabase.from('products').delete().eq('id', p.id).then(() => fetchProducts()); } }} className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-2.5 rounded-xl text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">Suppr.</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}