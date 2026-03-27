import React from 'react';
import { Lock, Trash2, Coins } from 'lucide-react';
import { Item } from '../../types';
import { formatNumber } from '../../utils/gameUtils';
import { ItemTooltip } from './Shared';
import { motion } from 'motion/react';
import { L } from '../../locales';

interface BagTabProps {
  player: any;
  toggleLockItem: (itemId: string) => void;
  sellItem: (item: Item) => void;
  sellAllNormal: () => void;
  handleEquip: (item: Item) => void;
}

export const BagTab: React.FC<BagTabProps> = ({
  player,
  toggleLockItem,
  sellItem,
  sellAllNormal,
  handleEquip,
}) => {
  const [filter, setFilter] = React.useState<'all' | 'Excellent' | 'Normal'>('all');

  const filteredInventory = player.inventory.filter((item: Item) => {
    if (filter === 'all') return true;
    return item.rarity === filter;
  });

  return (
    <div className="flex-1 bg-zinc-950 p-4 flex flex-col overflow-hidden">
      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {(['all', 'Excellent', 'Normal'] as const).map((f) => (
            <motion.button
              whileTap={{ scale: 0.95 }}
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter border-2 transition-all ${filter === f ? 'bg-amber-500 border-amber-400 text-black shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
            >
              {f === 'all' ? L.UI.ALL : f === 'Excellent' ? L.UI.EXCELLENT : L.UI.NORMAL}
            </motion.button>
          ))}
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={sellAllNormal}
          className="px-4 py-1.5 bg-red-500/10 border-2 border-red-500/30 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-tighter hover:bg-red-500 hover:text-white transition-all"
        >
          {L.UI.QUICK_SELL}
        </motion.button>
      </div>

      {/* Inventory Grid */}
      <div className="flex-1 mu-panel p-4 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-5 gap-3">
          {filteredInventory.map((item: Item) => (
            <ItemTooltip 
              key={item.id} 
              item={item}
              actions={
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={() => handleEquip(item)}
                    className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-[9px] font-black uppercase"
                  >
                    {L.UI.EQUIP}
                  </button>
                  <button
                    onClick={() => toggleLockItem(item.id)}
                    className={`flex items-center justify-center gap-1 py-2 rounded text-[9px] font-black uppercase ${item.isLocked ? 'bg-zinc-700 text-amber-500' : 'bg-zinc-800 text-zinc-400'}`}
                  >
                    {item.isLocked ? <><Lock size={10} /> {L.UI.LOCKED}</> : L.UI.LOCK}
                  </button>
                  <button
                    onClick={() => sellItem(item)}
                    disabled={item.isLocked}
                    className="col-span-2 flex items-center justify-center gap-1 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white py-2 rounded text-[9px] font-black uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={10} /> {L.UI.SELL} ({formatNumber(item.value || 0)} {L.UI.ZEN})
                  </button>
                </div>
              }
            >
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`mu-item-slot ${item.rarity === 'Excellent' ? 'excellent' : ''} cursor-pointer`}
              >
                <div className="text-3xl">{item.image}</div>
                {item.level > 0 && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-black text-[7px] font-black px-1 rounded-bl">
                    +{item.level}
                  </div>
                )}
                {item.isLocked && (
                  <div className="absolute bottom-1 right-1 text-amber-500">
                    <Lock size={8} />
                  </div>
                )}
              </motion.div>
            </ItemTooltip>
          ))}
          
          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 30 - filteredInventory.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="mu-item-slot opacity-20" />
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 flex justify-between items-center bg-zinc-900/50 p-3 rounded-xl border border-white/5">
        <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
          {L.UI.BAG}: <span className="text-white">{player.inventory.length}</span> / 50
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Coins size={14} className="text-amber-500" />
            <span className="text-xs font-black text-white">{formatNumber(player.zen)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white font-black">K</div>
            <span className="text-xs font-black text-white">{formatNumber(player.diamond)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
