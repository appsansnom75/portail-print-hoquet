'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [quantities, setQuantities] = useState('500, 1000, 5000');
  const [basePrices, setBasePrices] = useState('100, 180, 500'); // LE CHAMP PRIX PAR DÉFAUT
  
  const [hasVariants, setHasVariants] = useState(false);
  const [variantsList, setVariantsList] = useState<{id: string, name: string, prices: string}[]>([]);
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
    const vName = prompt("Nom de la variante (ex: Mat, Brillant) :");
    if (vName) {
      // Quand on ajoute une variante, elle prend les prix de base par défaut pour aider le client
      setVariantsList([...variantsList, { 
        id: vName.toLowerCase().replace(/\s/g, ''), 
        name: vName, 
        prices: basePrices 
      }]);
    }
  };

  const handleSaveProduct = async () => {
    if (!name || !imageFile) return alert("Nom et Image requis");

    try {
      const fileName = `${Date.now()}-${imageFile.name}`;
      await supabase.storage.from('product-images').upload(fileName, imageFile);
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);

      const qtyArray = quantities.split(',').map(n => Number(n.trim()));
      const finalPrices: any = {};

      if (hasVariants && variantsList.length > 0) {
        variantsList.forEach(v => {
          finalPrices[v.id] = v.prices.split(',').map(n => Number(n.trim()));
        });
      } else {
        // Si pas de variantes, on prend les prix du champ principal
        finalPrices['default'] = basePrices.split(',').map(n => Number(n.trim()));
      }

      const config = {
        quantities: qtyArray,
        prices: finalPrices,
        variants: hasVariants ? variantsList.map(({id, name}) => ({id, name})) : []
      };

      const { error } = await supabase.from('products').insert([
        { name, image_url: urlData.publicUrl, category: 'Perso', has_variants: hasVariants, config }
      ]);

      if (!error) {
        alert("Produit publié !");
        window.location.reload();
      }
    } catch (err) { alert("Erreur upload"); }
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
        <div className="bg-white/5 p-8 rounded-2xl border border-white/10 w-full max-w-md text-center">
          <h2 className="font-black text-blue-500 uppercase tracking-widest mb-6">Accès Admin</h2>
          <input type="password" placeholder="Mot de passe" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-blue-500 mb-4 text-center" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={checkAuth} className="w-full bg-blue-500 py-4 rounded-xl font-black uppercase">Entrer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-10 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* FORMULAIRE */}
        <div className="space-y-8">
          <h1 className="text-3xl font-black uppercase text-blue-500 italic tracking-tighter">Nouveau Produit</h1>
          
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-white/40 block mb-2">Nom</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-white/40 block mb-2">Image</label>
                <input type="file" onChange={e => setImageFile(e.target.files?.[0] || null)} className="text-[10px] mt-3" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-white/40 block mb-2">Quantités (ex: 500, 1000)</label>
              <input value={quantities} onChange={e => setQuantities(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none" />
            </div>

            {/* CHAMP PRIX TOUJOURS PRÉSENT */}
            <div>
              <label className="text-[10px] font-black uppercase text-white/40 block mb-2">Prix HT pour chaque quantité (ex: 100, 180)</label>
              <input value={basePrices} onChange={e => setBasePrices(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-blue-500" />
            </div>

            <div className="pt-4 border-t border-white/5">
                <button 
                  onClick={() => setHasVariants(!hasVariants)}
                  className={`text-[9px] font-black uppercase px-4 py-2 rounded-full border transition-all ${hasVariants ? 'bg-blue-500 border-blue-500' : 'border-white/20 text-white/40'}`}
                >
                  {hasVariants ? "✓ Plusieurs variantes" : "+ Différencier les prix par variante ?"}
                </button>
            </div>

            {hasVariants && (
              <div className="space-y-4 border-l-2 border-blue-500 pl-4">
                {variantsList.map((v, idx) => (
                  <div key={idx} className="bg-white/5 p-4 rounded-xl space-y-3">
                    <p className="font-black text-blue-500 uppercase text-[10px]">{v.name}</p>
                    <label className="text-[8px] font-black uppercase text-white/20">Prix spécifiques pour {v.name}</label>
                    <input 
                      value={v.prices} 
                      onChange={(e) => {
                        const copy = [...variantsList];
                        copy[idx].prices = e.target.value;
                        setVariantsList(copy);
                      }}
                      className="w-full bg-black/20 border border-white/5 p-2 rounded text-xs"
                    />
                  </div>
                ))}
                <button onClick={addVariantField} className="text-[9px] font-black text-blue-400 uppercase">+ Ajouter une variante</button>
              </div>
            )}

            <button onClick={handleSaveProduct} className="w-full bg-blue-500 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-400 transition-all shadow-xl">
              Publier le produit
            </button>
          </div>
        </div>

        {/* LISTE PRODUITS */}
        <div className="space-y-8 text-white/20">
            <h2 className="text-3xl font-black uppercase italic">Catalogue</h2>
            <div className="space-y-4">
                {existingProducts.map(p => (
                    <div key={p.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 text-white">
                        <img src={p.image_url} className="w-10 h-10 object-contain" alt="" />
                        <span className="flex-1 font-black uppercase text-[10px] tracking-widest">{p.name}</span>
                        <button onClick={() => handleDelete(p.id)} className="text-red-500 text-[10px] font-black uppercase px-3 py-1 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-all">Supprimer</button>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}