'use client';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { cart, removeFromCart } = useCart();
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const getCategoryColor = (cat: string) => {
    if (cat.includes('Business')) return 'text-orange-500';
    if (cat.includes('personnalisation')) return 'text-green-500';
    return 'text-blue-500';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999]" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0f092e] border-l border-white/10 z-[1000] p-8 flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-black uppercase italic text-white tracking-tighter">Votre <span className="text-blue-500">Panier</span></h2>
              <button onClick={onClose} className="text-[10px] font-black uppercase text-white/30 hover:text-white">Fermer</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {cart.length === 0 ? (
                <p className="text-center text-white/20 font-black uppercase text-[10px] py-20 tracking-widest italic">Le panier est vide</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="bg-white/5 border border-white/5 p-5 rounded-3xl flex justify-between items-center">
                    <div>
                      <p className={`font-black uppercase text-[10px] tracking-widest ${getCategoryColor(item.category)}`}>{item.name}</p>
                      <p className="text-[9px] text-white/40 font-bold uppercase mt-1">{item.qty} ex. — {item.price.toFixed(2)}€/u</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sm text-white mb-1">{(item.price * item.qty).toFixed(2)}€</p>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 font-black text-[8px] uppercase tracking-widest px-2 py-1 hover:bg-red-500/10 rounded">Supprimer</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-8 pt-8 border-t border-white/10 space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase text-white/40">Total HT</span>
                <span className="text-3xl font-black tracking-tighter text-white">{total.toFixed(2)}€</span>
              </div>
              <button className="w-full bg-blue-500 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-blue-400 transition-all shadow-xl shadow-blue-500/20 active:scale-95 text-white">Confirmer la demande</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}