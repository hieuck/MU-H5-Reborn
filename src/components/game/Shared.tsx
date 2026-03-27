import React from 'react';
import { motion } from 'motion/react';
import { Lock, Zap, Trophy } from 'lucide-react';
import { Item } from '../../types';
import { formatNumber } from '../../utils/gameUtils';
import { L } from '../../locales';

export const DamageText = ({ x, y, value, type }: { x: number, y: number, value: number, type: 'normal' | 'crit' | 'exe' }) => {
  const colors = {
    normal: 'text-white',
    crit: 'text-blue-400',
    exe: 'text-green-400'
  };
  
  return (
    <motion.div
      initial={{ opacity: 1, y: y, x: x, scale: 0.5 }}
      animate={{ opacity: 0, y: y - 100, scale: 1.5 }}
      transition={{ duration: 1 }}
      className={`absolute font-black italic pointer-events-none z-50 text-xl drop-shadow-md ${colors[type]}`}
    >
      {type === 'exe' && `${L.UI.EXCELLENT}! `}
      {value}
    </motion.div>
  );
};

export const ItemTooltip = ({ item, children, actions }: { item: Item, children: React.ReactNode, actions?: React.ReactNode, key?: string | number }) => {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 z-[100] scale-90 group-hover:scale-100 origin-bottom">
        <div className="w-64 bg-zinc-950 border-2 border-amber-500/50 rounded-2xl p-4 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-3xl border border-zinc-800 shadow-inner">
              {item.image}
            </div>
            <div>
              <div className={`text-sm font-black uppercase tracking-tighter ${item.rarity === 'Excellent' ? 'text-green-400' : 'text-white'}`}>
                {item.name} {item.level > 0 && `+${item.level}`}
              </div>
              <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                {item.rarity === 'Excellent' ? L.UI.EXCELLENT : L.UI.NORMAL} {L.UI[item.slot.toUpperCase() as keyof typeof L.UI] || item.slot}
              </div>
            </div>
          </div>
          
          <div className="space-y-2 border-t border-zinc-800 pt-3">
            {Object.entries(item.stats).map(([key, val]) => (
              <div key={key} className="flex justify-between text-[11px]">
                <span className="text-zinc-500 uppercase font-bold">{L.UI.STATS[key.toUpperCase() as keyof typeof L.UI.STATS] || key}</span>
                <span className="text-white font-black">+{val + (item.level * 5)}</span>
              </div>
            ))}
            
            {item.excellentOptions && item.excellentOptions.length > 0 && (
              <div className="mt-2 pt-2 border-t border-zinc-800/50">
                <div className="text-[10px] text-green-400 font-black uppercase mb-1 tracking-widest">{L.UI.EXCELLENT_OPTIONS}</div>
                {item.excellentOptions.map((opt, i) => (
                  <div key={i} className="text-[10px] text-green-400/80 font-bold leading-tight">• {opt}</div>
                ))}
              </div>
            )}

            {item.optionLevel && item.optionLevel > 0 && (
              <div className="mt-2 pt-2 border-t border-zinc-800/50">
                <div className="text-[10px] text-blue-400 font-black uppercase mb-1 tracking-widest">{L.UI.REINFORCE}</div>
                <div className="text-[10px] text-blue-400/80 font-bold">• {L.UI.REINFORCE_DESC(item.optionLevel * 4)}</div>
              </div>
            )}
          </div>
          
          {item.isLocked && (
            <div className="mt-3 flex items-center gap-1 text-[9px] text-amber-500 font-black uppercase tracking-widest">
              <Lock size={10} /> {L.UI.LOCKED}
            </div>
          )}

          {actions && (
            <div className="mt-4 pt-4 border-t border-zinc-800 flex gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
