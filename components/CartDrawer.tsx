'use client';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { cart, removeFromCart } = useCart();
  
  // On calcule le total HT de tout le panier
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Petite fonction pour choisir la couleur selon la catégorie
  const getCategoryColor = (category: string) => {
    if (category === 'Gamme Business') return 'text-orange-500';
    if (category === 'Produits sans personnalisation') return 'text-green-500';
    return 'text-blue-500'; // Par défaut pour le Perso
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* L'arrière-plan qui assombrit le reste du site */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999]"
          />
          
          {/* Le panneau qui glisse depuis la droite */}
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0f092e] border-l border-white/10 z-[1000] shadow-2xl p-8 flex flex-col"
          >
            {/* Haut du panier */}
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">
                Mon <span className="text-blue-500">Panier</span>
              </h2>
              <button onClick={onClose} className="bg-white/5 hover:bg-white/10 p-3 rounded-full transition-all">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Fermer</span>
              </button>
            </div>

            {/* Liste des produits (Défilable) */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                  <p className="font-black uppercase text-xs tracking-[0.3em]">Le panier est vide</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="bg-white/[0.03] border border-white/5 p-5 rounded-3xl flex justify-between items-center group">
                    <div>
                      {/* Le nom du produit s'affiche avec sa couleur de catégorie */}
                      <p className={`font-black uppercase text-[11px] tracking-widest mb-1 ${getCategoryColor(item.category)}`}>
                        {item.name}
                      </p>
                      <p className="text-[10px] text-white/40 font-bold uppercase italic tracking-tighter">
                        {item.qty} exemplaires — {item.price.toFixed(2)}€/u
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className="font-black text-sm text-white">{(item.price * item.qty).toFixed(2)}€ HT</span>
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        className="text-red-500 font-black text-[8px] uppercase tracking-widest hover:bg-red-500/10 px-2 py-1 rounded transition-all"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bas du panier (Total et Bouton) */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="flex justify-between items-end mb-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase text-white/30 tracking-[0.2em]">Total de la commande</p>
                  <p className="text-[8px] font-bold text-white/20 uppercase italic">Hors frais de livraison</p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black tracking-tighter text-white">{total.toFixed(2)}€</span>
                  <span className="text-[10px] font-black text-white/30 ml-2 italic">HT</span>
                </div>
              </div>
              
              <button className="w-full bg-blue-500 hover:bg-blue-400 py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-xl shadow-blue-500/20 active:scale-95 text-white">
                Finaliser ma demande
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}