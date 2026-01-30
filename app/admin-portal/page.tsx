'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Type pour gérer les fichiers des variantes
interface VariantItem {
  id: string;
  name: string;
  prices: string;
  file?: File | null;
}

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  const [name, setName] = useState('');
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
    if (password === "123") { 
      setIsAuthenticated(true);
      fetchProducts();
    } else { alert("Accès refusé"); }
  };

  const addVariantField = () => {
    const vName = prompt("Nom de la variante (ex: Mat, Brillant, Noël) :");
    if (vName) {
      setVariantsList([...variantsList, { 
        id: vName.toLowerCase().replace(/\s/g, ''), 
        name: vName, 
        prices: basePrices,
        file: null
      }]);
    }
  };

  const handleSaveProduct = async () => {
    if (!name || !imageFile) return alert("Nom et Image principale requis");

    try {
      // 1. Upload Image Principale
      const mainFileName = `${Date.now()}-main-${imageFile.name}`;
      const { data: mainData } = await supabase.storage.from('product-images').upload(mainFileName, imageFile);
      const { data: mainUrl } = supabase.storage.from('product-images').getPublicUrl(mainFileName);

      const qtyArray = quantities.split(',').map(n => Number(n.trim()));
      const finalPrices: any = {};
      const finalVariants: any[] = [];

      // 2. Traitement des variantes (images + prix)
      if (hasVariants && variantsList.length > 0) {
        for (const v of variantsList) {
          let variantImageUrl = mainUrl.publicUrl;

          // Si la variante a son propre fichier image
          if (v.file) {
            const vFileName = `${Date.now()}-v-${v.file.name}`;
            await supabase.storage.from('product-images').upload(vFileName, v.file);
            const { data: vUrlData } = supabase.storage.from('product-images').getPublicUrl(vFileName);
            variantImageUrl = vUrlData.publicUrl;
          }

          finalPrices[v.id] = v.prices.split(',').map(n => Number(n.trim()));
          finalVariants.push({ 
            id: v.id, 
            name: v.name, 
            image: variantImageUrl 
          });
        }
      } else {
        finalPrices['default'] = basePrices.split(',').map(n => Number(n.trim()));
      }

      const config = {
        quantities: qtyArray,
        prices: finalPrices,
        variants: finalVariants
      };

      const { error } = await supabase.from('products').insert([
        { 
          name, 
          image_url: mainUrl.publicUrl, 
          category: 'Perso', 
          has_variants: hasVariants, 
          config 
        }
      ]);

      if (!error) {
        alert("Produit publié avec ses variantes !");
        window.location.reload();
      }
    } catch (err) { 
      console.error(err);
      alert("Erreur lors de l'upload des images"); 
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Supprimer ?")) {
      await supabase.from('products').delete().eq('id', id);
      fetchProducts();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f092e] flex items-center justify-center p-6 text-white font-sans">
        <div className="bg-white/5 p-8 rounded-2xl border border-white/10 w-full max-w-md text-center shadow-2xl">
          <h2 className="font-black text-blue-500 uppercase tracking-widest mb-6 italic">Portail Impression</h2>
          <input 
            type="password" 
            placeholder="Mot de passe" 
            className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-blue-500 mb-4 text-center" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && checkAuth()}
          />
          <button onClick={checkAuth} className="w-full bg-blue-500 py-4 rounded-xl font-black uppercase hover:bg-blue-600 transition-all active:scale-95">Déverrouiller</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-10 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        <div className="space-y-8">
          <h1 className="text-3xl font-black uppercase text-blue-500 italic tracking-tighter">Créer un produit</h1>
          
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-white/40 block mb-2 tracking-widest">Nom du produit</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl outline-none focus:border-blue-500" placeholder="ex: Cartes de visite" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-white/40 block mb-2 tracking-widest">Image principale</label>
                <input type="file" onChange={e => setImageFile(e.target.files?.[0] || null)} className="text-[9px] mt-3 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-blue-500 file:text-white" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-white/40 block mb-2 tracking-widest">Quantités (ex: 500, 1000)</label>
              <input value={quantities} onChange={e => setQuantities(e.target.value)} className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl outline-none" />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-white/40 block mb-2 tracking-widest">Prix de base HT (ex: 100, 180)</label>
              <input value={basePrices} onChange={e => setBasePrices(e.target.value)} className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl outline-none focus:border-blue-500" />
            </div>

            <div className="pt-4 border-t border-white/5">
                <button 
                  onClick={() => setHasVariants(!hasVariants)}
                  className={`text-[9px] font-black uppercase px-6 py-2 rounded-full border transition-all ${hasVariants ? 'bg-blue-500 border-blue-500' : 'border-white/20 text-white/40 hover:text-white hover:border-white/40'}`}
                >
                  {hasVariants ? "✓ Plusieurs variantes" : "+ Image/Prix différent par modèle ?"}
                </button>
            </div>

            {hasVariants && (
              <div className="space-y-4 border-l-2 border-blue-500 pl-4 py-2">
                {variantsList.map((v, idx) => (
                  <div key={idx} className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="font-black text-blue-500 uppercase text-[10px] tracking-widest">{v.name}</p>
                        <button onClick={() => setVariantsList(variantsList.filter((_, i) => i !== idx))} className="text-red-500 text-[8px] font-black uppercase tracking-widest">Suppr.</button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <label className="text-[8px] font-black uppercase text-white/20 block mb-1">Prix spécifiques</label>
                            <input 
                                value={v.prices} 
                                onChange={(e) => {
                                    const copy = [...variantsList];
                                    copy[idx].prices = e.target.value;
                                    setVariantsList(copy);
                                }}
                                className="w-full bg-black/20 border border-white/5 p-3 rounded-lg text-xs outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-[8px] font-black uppercase text-white/20 block mb-1">Image spécifique (facultatif)</label>
                            <input 
                                type="file" 
                                onChange={(e) => {
                                    const copy = [...variantsList];
                                    copy[idx].file = e.target.files?.[0] || null;
                                    setVariantsList(copy);
                                }}
                                className="text-[8px] block w-full file:bg-white/10 file:text-white file:border-0 file:rounded file:px-2 file:py-1 cursor-pointer" 
                            />
                            {v.file && <p className="text-[8px] text-green-500 mt-1 font-black">✓ Image sélectionnée</p>}
                        </div>
                    </div>
                  </div>
                ))}
                <button onClick={addVariantField} className="text-[9px] font-black text-blue-400 uppercase tracking-widest hover:text-white transition-colors">+ Ajouter une variante</button>
              </div>
            )}

            <button onClick={handleSaveProduct} className="w-full bg-blue-500 py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-blue-400 transition-all shadow-xl active:scale-95 text-[11px]">
              Publier sur le site
            </button>
          </div>
        </div>

        <div className="space-y-8">
            <h2 className="text-3xl font-black uppercase italic text-white/10 tracking-tighter">Catalogue en ligne</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {existingProducts.length === 0 && <p className="text-[10px] font-black uppercase text-white/20 italic">Aucun produit pour le moment</p>}
                {existingProducts.map(p => (
                    <div key={p.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/20 transition-all group">
                        <img src={p.image_url} className="w-12 h-12 object-contain rounded bg-black/20" alt="" />
                        <div className="flex-1">
                            <span className="block font-black uppercase text-[10px] tracking-widest">{p.name}</span>
                            <span className="text-[7px] font-black uppercase text-white/20 tracking-widest">{p.has_variants ? 'Multi-modèles' : 'Standard'}</span>
                        </div>
                        <button onClick={() => handleDelete(p.id)} className="opacity-0 group-hover:opacity-100 text-red-500 text-[10px] font-black uppercase px-3 py-1 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-all">Supprimer</button>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}