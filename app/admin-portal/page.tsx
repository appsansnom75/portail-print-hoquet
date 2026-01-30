'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Champs Formulaire
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [quantities, setQuantities] = useState('500, 1000, 5000');
  
  // Gestion des variantes et prix
  const [hasVariants, setHasVariants] = useState(false);
  const [variantsList, setVariantsList] = useState<{id: string, name: string, prices: string}[]>([]);
  const [defaultPrices, setDefaultPrices] = useState('100, 180, 500');

  const [existingProducts, setExistingProducts] = useState<any[]>([]);

  // FONCTION : Charger les produits
  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setExistingProducts(data);
  };

  // FONCTION : Vérifier l'accès
  const checkAuth = () => {
    // REMPLACE "ton_mot_de_passe" par ton vrai mot de passe
    if (password === "ton_mot_de_passe") { 
      setIsAuthenticated(true);
      fetchProducts();
    } else {
      alert("Accès refusé");
    }
  };

  // FONCTION : Ajouter une ligne de variante
  const addVariantField = () => {
    const vName = prompt("Nom de la variante (ex: Papier Mat, Vernis...) :");
    if (vName) {
      setVariantsList([...variantsList, { 
        id: vName.toLowerCase().replace(/\s/g, ''), 
        name: vName, 
        prices: defaultPrices 
      }]);
    }
  };

  // FONCTION : Supprimer un produit
  const handleDelete = async (id: string) => {
    if (confirm("Supprimer définitivement ce produit ?")) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) fetchProducts();
    }
  };

  // FONCTION : Enregistrer le produit
  const handleSaveProduct = async () => {
    if (!name || !imageFile) return alert("Nom et Image requis");

    try {
      // 1. Upload Image
      const fileName = `${Date.now()}-${imageFile.name}`;
      const { data: imgData, error: imgError } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageFile);

      if (imgError) throw imgError;

      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);

      // 2. Préparation des données
      const qtyArray = quantities.split(',').map(n => Number(n.trim()));
      const finalPrices: any = {};

      if (hasVariants) {
        variantsList.forEach(v => {
          finalPrices[v.id] = v.prices.split(',').map(n => Number(n.trim()));
        });
      } else {
        finalPrices['default'] = defaultPrices.split(',').map(n => Number(n.trim()));
      }

      const config = {
        quantities: qtyArray,
        prices: finalPrices,
        variants: hasVariants ? variantsList.map(({id, name}) => ({id, name})) : []
      };

      // 3. Envoi Supabase
      const { error: dbError } = await supabase.from('products').insert([
        { 
          name, 
          image_url: urlData.publicUrl, 
          category: 'Perso', 
          has_variants: hasVariants, 
          config 
        }
      ]);

      if (dbError) throw dbError;

      alert("Produit ajouté avec succès !");
      window.location.reload();
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };

  // ÉCRAN DE CONNEXION
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f092e] flex items-center justify-center p-6">
        <div className="bg-white/5 p-8 rounded-2xl border border-white/10 w-full max-w-md text-center">
          <h2 className="font-black text-blue-500 uppercase tracking-widest mb-6 italic">Portail Admin</h2>
          <input 
            type="password" 
            placeholder="Mot de passe secret" 
            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-blue-500 mb-4 text-center"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && checkAuth()}
          />
          <button onClick={checkAuth} className="w-full bg-blue-500 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all">
            Déverrouiller
          </button>
        </div>
      </div>
    );
  }

  // ÉCRAN DASHBOARD
  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-10 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* COLONNE GAUCHE : FORMULAIRE */}
        <div className="space-y-8">
          <h1 className="text-3xl font-black uppercase text-blue-500 italic">Nouveau Produit</h1>
          
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase text-white/40 block mb-2 tracking-widest">Nom</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-blue-500" />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-white/40 block mb-2 tracking-widest">Image Produit</label>
              <input type="file" onChange={e => setImageFile(e.target.files?.[0] || null)} className="text-xs file:bg-blue-500 file:border-none file:px-4 file:py-2 file:rounded file:text-white file:font-black file:uppercase" />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-white/40 block mb-2 tracking-widest">Quantités (ex: 500, 1000)</label>
              <input value={quantities} onChange={e => setQuantities(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none" />
            </div>

            <button 
              onClick={() => setHasVariants(!hasVariants)}
              className={`text-[9px] font-black uppercase px-4 py-2 rounded-full border transition-all ${hasVariants ? 'bg-blue-500 border-blue-500' : 'border-white/20 text-white/40'}`}
            >
              {hasVariants ? "✓ Plusieurs variantes activées" : "+ Ajouter des variantes ?"}
            </button>

            {!hasVariants ? (
              <div>
                <label className="text-[10px] font-black uppercase text-white/40 block mb-2 tracking-widest">Prix HT correspondants</label>
                <input value={defaultPrices} onChange={e => setDefaultPrices(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none" />
              </div>
            ) : (
              <div className="space-y-4 border-l-2 border-blue-500 pl-4 py-2">
                {variantsList.map((v, idx) => (
                  <div key={idx} className="bg-white/5 p-4 rounded-xl space-y-3">
                    <p className="font-black text-blue-500 uppercase text-[10px]">{v.name}</p>
                    <input 
                      value={v.prices} 
                      onChange={(e) => {
                        const copy = [...variantsList];
                        copy[idx].prices = e.target.value;
                        setVariantsList(copy);
                      }}
                      placeholder="Prix pour cette variante..."
                      className="w-full bg-black/20 border border-white/5 p-2 rounded text-xs"
                    />
                  </div>
                ))}
                <button onClick={addVariantField} className="text-[9px] font-black text-blue-400 uppercase tracking-widest">+ Ajouter Option</button>
              </div>
            )}

            <button onClick={handleSaveProduct} className="w-full bg-blue-500 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-400 transition-all shadow-xl">
              Publier sur le site
            </button>
          </div>
        </div>

        {/* COLONNE DROITE : LISTE ACTUELLE */}
        <div className="space-y-8">
          <h2 className="text-3xl font-black uppercase text-white/20 italic">Catalogue Actif</h2>
          <div className="space-y-4 overflow-y-auto max-h-[700px] pr-2">
            {existingProducts.map(p => (
              <div key={p.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-all">
                <img src={p.image_url} className="w-12 h-12 object-contain" alt="" />
                <div className="flex-1">
                  <p className="font-black uppercase text-[11px] tracking-tight">{p.name}</p>
                  <p className="text-[8px] text-white/30 uppercase">{p.has_variants ? 'Multi-variantes' : 'Standard'}</p>
                </div>
                <button 
                  onClick={() => handleDelete(p.id)}
                  className="opacity-0 group-hover:opacity-100 bg-red-500/10 text-red-500 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}