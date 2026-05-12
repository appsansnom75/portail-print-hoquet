'use client';
import React, { useState, useEffect } from 'react';
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-sm cursor-zoom-out"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative max-w-full max-h-full flex items-center justify-center"
          >
            <img
              src={imageSrc}
              alt={imageAlt}
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            />
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 text-white font-black uppercase text-[13px] tracking-widest hover:text-cyan-400 transition-colors"
            >
              Fermer ×
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

const THEME = {
  category: 'Signaletique',
  label: 'Signalétique',
  color: 'text-cyan-400',
  bg: 'bg-cyan-400',
};

export default function SignaletiquePage() {
  const { cart, addToCart } = useCart();
  const [isCartOpen, setIsCartOpen]           = useState(false);
  const [products, setProducts]               = useState<any[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [selections, setSelections]           = useState<any>({});
  const [flippedProducts, setFlippedProducts] = useState<Record<string, boolean>>({});
  const [selectedImage, setSelectedImage]     = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('category', THEME.category)
          .order('sort_order', { ascending: true });

        if (error) throw error;
        if (data) {
          const formatted = data.map(p => ({
            id:          p.id,
            name:        p.name,
            image_recto: p.image_recto,
            image_verso: p.image_verso,
            hasVariants: p.has_variants,
            variants:    p.config?.variants   || [],
            quantities:  p.config?.quantities || [],
            prices:      p.config?.prices     || { default: [] },
          }));
          setProducts(formatted);
          setSelections(formatted.reduce((acc, p) => ({
            ...acc,
            [p.id]: {
              qty:     p.quantities[0] || 0,
              variant: p.hasVariants ? (p.variants[0]?.id || 'default') : 'default',
            },
          }), {}));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const toggleFlip = (id: string) => {
    setFlippedProducts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = (p: any) => {
    const s      = selections[p.id];
    const pList  = p.prices[s.variant] || p.prices.default || [];
    const priceIndex = p.quantities.indexOf(Number(s.qty));
    const totalHT    = pList[priceIndex] || 0;

    addToCart({
      id:       `${p.id}-${s.variant}`,
      name:     `${p.name}${p.hasVariants ? ' - ' + (p.variants.find((v: any) => v.id === s.variant)?.name || '') : ''}`,
      price:    totalHT / (Number(s.qty) || 1),
      qty:      Number(s.qty),
      category: THEME.label,
      color:    THEME.color,
    });
    setIsCartOpen(true);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f092e] flex items-center justify-center font-black text-cyan-400 uppercase animate-pulse tracking-widest">
      Chargement Signalétique...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f092e] text-white flex flex-col relative overflow-x-hidden">
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageSrc={selectedImage || ''}
        imageAlt="Aperçu produit"
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

          let currentImg = p.image_recto;
          if (isFlipped) {
            currentImg = currentVariant?.image_verso || p.image_verso || p.image_recto;
          } else {
            currentImg = currentVariant?.image_recto || p.image_recto;
          }

          return (
            <div key={p.id} className="pt-10 relative group">
              {/* ZONE IMAGE */}
              <div className="h-48 w-full flex items-center justify-center relative -mb-10 z-20">

                {(p.image_verso || currentVariant?.image_verso) && (
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFlip(p.id); }}
                    className="absolute right-0 bottom-4 z-30 bg-white text-black px-4 py-2 rounded-full shadow-xl hover:bg-cyan-400 hover:text-[#0f092e] transition-all active:scale-95 flex items-center gap-2"
                  >
                    <span className="text-[12px] font-black uppercase tracking-wider">
                      {isFlipped ? 'Voir Recto' : 'Voir Verso'}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-500 ${isFlipped ? 'rotate-180' : ''}`}>
                      <path d="m15 18 6-6-6-6"/><path d="M3 12h18"/>
                    </svg>
                  </button>
                )}

                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImg}
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

              <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 pt-16 hover:bg-white/[0.05] hover:border-cyan-400/30 transition-all duration-500 shadow-xl">
                <h3 className={`font-black text-base uppercase mb-6 ${THEME.color} tracking-tight`}>{p.name}</h3>
                <div className="space-y-4">
                  {p.hasVariants && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Taille / Modèle</p>
                      <select
                        value={sel.variant}
                        onChange={(e) => {
                          setSelections({ ...selections, [p.id]: { ...sel, variant: e.target.value } });
                          setFlippedProducts(prev => ({ ...prev, [p.id]: false }));
                        }}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[13px] font-black uppercase text-white outline-none focus:border-cyan-400 transition-all cursor-pointer"
                      >
                        {p.variants.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Quantité souhaitée</p>
                    <select
                      value={sel.qty}
                      onChange={(e) => setSelections({ ...selections, [p.id]: { ...sel, qty: Number(e.target.value) } })}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[13px] font-black uppercase text-white outline-none focus:border-cyan-400 transition-all cursor-pointer"
                    >
                      {p.quantities.map((q: any) => <option key={q} value={q}>{q} exemplaires</option>)}
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-4">
                    <div className="flex flex-col">
                      <span className="font-black text-2xl text-white">{currentPrice.toFixed(2)}€</span>
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest italic">Hors Taxes (HT)</span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(p)}
                      className="bg-white text-[#0f092e] px-8 py-3.5 rounded-2xl font-black uppercase text-[12px] hover:bg-cyan-400 hover:text-[#0f092e] transition-all active:scale-95 shadow-lg shadow-white/5"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-white rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center z-[100] hover:scale-110 active:scale-95 transition-all group"
      >
        <div className="relative">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f092e" strokeWidth="2.5" className="group-hover:stroke-cyan-400 transition-colors">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          {cart.length > 0 && (
            <span className={`absolute -top-3 -right-3 ${THEME.bg} text-[#0f092e] text-[12px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-[#0f092e]`}>
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