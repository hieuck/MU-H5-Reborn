import React from 'react';
import { Coins, ShoppingBag } from 'lucide-react';
import { SHOP_ITEMS } from '../../constants';
import { formatNumber } from '../../utils/gameUtils';
import { motion } from 'motion/react';
import { L } from '../../locales';

interface ShopTabProps {
  player: any;
  buyItem: (item: any, currency: 'zen' | 'diamond') => void;
}

export const ShopTab: React.FC<ShopTabProps> = ({ player, buyItem }) => {
  return (
    <div className="flex-1 bg-zinc-950 p-4 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
          <ShoppingBag size={16} className="text-amber-500" />
          {L.UI.SHOP}
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1 rounded-full border border-white/5">
            <Coins size={12} className="text-amber-500" />
            <span className="text-[10px] font-black text-white">{formatNumber(player.zen)}</span>
          </div>
          <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1 rounded-full border border-white/5">
            <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[7px] text-white font-black">K</div>
            <span className="text-[10px] font-black text-white">{formatNumber(player.diamond)}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 mu-panel p-4 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 gap-3">
          {SHOP_ITEMS.map((item, idx) => (
            <motion.div
              key={`${item.name}-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex items-center justify-between hover:bg-zinc-900 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg bg-zinc-950 border-2 flex items-center justify-center text-2xl ${item.rarity === 'Excellent' ? 'border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]' : 'border-zinc-800'}`}>
                  {item.image}
                </div>
                <div>
                  <h3 className={`text-[11px] font-black uppercase tracking-tight ${item.rarity === 'Excellent' ? 'text-amber-500' : 'text-zinc-200'}`}>
                    {item.name}
                  </h3>
                  <p className="text-[9px] text-zinc-500 font-medium leading-tight max-w-[180px]">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {item.zenPrice && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => buyItem(item, 'zen')}
                    className="flex items-center justify-center gap-2 bg-zinc-950 border border-amber-500/30 hover:border-amber-500 px-4 py-1.5 rounded-lg transition-all group"
                  >
                    <Coins size={10} className="text-amber-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black text-white">{formatNumber(item.zenPrice)}</span>
                  </motion.button>
                )}
                {item.diamondPrice && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => buyItem(item, 'diamond')}
                    className="flex items-center justify-center gap-2 bg-zinc-950 border border-blue-500/30 hover:border-blue-500 px-4 py-1.5 rounded-lg transition-all group"
                  >
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex items-center justify-center text-[6px] text-white font-black group-hover:scale-110 transition-transform">K</div>
                    <span className="text-[10px] font-black text-white">{formatNumber(item.diamondPrice)}</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
