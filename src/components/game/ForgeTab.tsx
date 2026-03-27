import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hammer, Zap, Plus, Lock, Sparkles, ChevronRight } from 'lucide-react';
import { Item, Hero } from '../../types';
import { formatNumber } from '../../utils/gameUtils';
import { L } from '../../locales';
import { GAME_CONFIG } from '../../config/gameConfig';
import { CLASSES } from '../../constants';

interface ForgeTabProps {
  player: any;
  forgeMode: 'enhance' | 'option' | 'wings';
  setForgeMode: (mode: 'enhance' | 'option' | 'wings') => void;
  selectedForgeItem: Item | null;
  setSelectedForgeItem: (item: Item | null) => void;
  handleEnhance: (item: Item) => void;
  handleOptionEnhance: (item: Item) => void;
}

export const ForgeTab: React.FC<ForgeTabProps> = ({
  player,
  forgeMode,
  setForgeMode,
  selectedForgeItem,
  setSelectedForgeItem,
  handleEnhance,
  handleOptionEnhance,
}) => {
  const equippedItems = player.team.flatMap((h: Hero) => 
    Object.entries(h.equipment)
      .filter(([_, item]) => item !== null)
      .map(([slot, item]) => ({ ...item as Item, equippedBy: h.class, slot: slot as any }))
  );
  const allForgeableItems = [...player.inventory.map(i => ({ ...i, equippedBy: null })), ...equippedItems];

  const [isForging, setIsForging] = useState(false);

  const onForge = async (item: Item, mode: 'enhance' | 'option') => {
    setIsForging(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    if (mode === 'enhance') handleEnhance(item);
    else handleOptionEnhance(item);
    setIsForging(false);
  };

  const currentSelectedItem = allForgeableItems.find(i => i.id === selectedForgeItem?.id) || null;

  return (
    <div className="flex-1 bg-zinc-950 p-4 flex flex-col overflow-hidden">
      {/* Mode Selection */}
      <div className="flex gap-3 mb-6">
        {[
          { id: 'enhance', label: L.UI.ENHANCE, icon: Hammer, color: 'from-amber-600 to-amber-400' },
          { id: 'option', label: L.UI.REINFORCE, icon: Zap, color: 'from-blue-600 to-blue-400' },
          { id: 'wings', label: L.UI.WING_CRAFT, icon: Plus, color: 'from-purple-600 to-purple-400' },
        ].map(mode => (
          <motion.button
            whileTap={{ scale: 0.95 }}
            key={mode.id}
            onClick={() => { setForgeMode(mode.id as any); setSelectedForgeItem(null); }}
            className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all relative overflow-hidden ${
              forgeMode === mode.id 
                ? `bg-gradient-to-br ${mode.color} border-white/20 text-black shadow-lg` 
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
          >
            <mode.icon size={16} strokeWidth={3} />
            <span className="text-[9px] font-black uppercase tracking-tighter">{mode.label}</span>
            {forgeMode === mode.id && (
              <motion.div 
                layoutId="forge-active-bg"
                className="absolute inset-0 bg-white/10 animate-pulse"
              />
            )}
          </motion.button>
        ))}
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Item Selection List */}
        <div className="w-[140px] flex flex-col overflow-hidden">
          <div className="text-[9px] font-black text-zinc-500 uppercase mb-3 tracking-widest px-1">{L.UI.ITEMS}</div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {allForgeableItems.length === 0 && (
              <div className="text-[10px] text-zinc-700 text-center py-8 uppercase font-black">{L.UI.EMPTY}</div>
            )}
            {allForgeableItems.map((item: any) => (
              <motion.button
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.95 }}
                key={item.id}
                onClick={() => setSelectedForgeItem(item)}
                className={`w-full p-2 rounded-xl flex items-center gap-2 transition-all border-2 ${
                  currentSelectedItem?.id === item.id 
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.1)]' 
                    : 'bg-zinc-900 border-zinc-800/50 hover:border-zinc-700'
                }`}
              >
                <div className="mu-item-slot w-10 h-10 text-xl flex-shrink-0">
                  {item.image}
                  {item.level > 0 && (
                    <div className="absolute -top-1 -right-1 bg-amber-500 text-black text-[7px] font-black px-1 rounded-full border border-zinc-900">
                      +{item.level}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className={`text-[9px] font-black truncate uppercase tracking-tighter ${item.rarity === 'Excellent' ? 'text-green-400' : 'text-blue-400'}`}>
                    {item.name}
                  </div>
                  <div className="text-[7px] text-zinc-500 uppercase font-bold truncate">
                    {item.equippedBy ? (item.equippedBy === CLASSES.DARK_KNIGHT ? 'DK' : item.equippedBy === CLASSES.DARK_WIZARD ? 'DW' : 'ELF') : item.slot}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Forge Area */}
        <div className="flex-1 mu-panel p-6 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/30 via-transparent to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-amber-500/10 rounded-full animate-mu-glow" />
          </div>
          
          <AnimatePresence mode="wait">
            {currentSelectedItem ? (
              <motion.div 
                key={currentSelectedItem.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                className="w-full flex flex-col items-center"
              >
                <div className="relative mb-10">
                  <motion.div 
                    animate={isForging ? { 
                      scale: [1, 1.15, 1],
                      rotate: [0, 10, -10, 0],
                    } : {}}
                    transition={{ repeat: Infinity, duration: 0.4 }}
                    className={`w-28 h-28 mu-item-slot text-6xl shadow-[0_0_40px_rgba(245,158,11,0.2)] ${currentSelectedItem.rarity === 'Excellent' ? 'excellent' : ''}`}
                  >
                    {currentSelectedItem.image}
                  </motion.div>
                  
                  <div className="absolute -top-3 -right-3 bg-amber-500 text-black px-3 py-1 rounded-lg text-[12px] font-black shadow-xl border-2 border-zinc-900">
                    +{currentSelectedItem.level}
                  </div>
                  
                  {isForging && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-[-20px] flex items-center justify-center"
                    >
                      <div className="w-full h-full border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                      <Sparkles size={40} className="absolute text-amber-500 animate-pulse" />
                    </motion.div>
                  )}
                </div>

                {forgeMode === 'enhance' && (
                  <div className="w-full max-w-[240px] space-y-5">
                    <div className="flex justify-between items-center bg-zinc-900/80 p-4 rounded-2xl border border-white/5 shadow-inner">
                      <div className="text-center flex-1">
                        <div className="text-[8px] text-zinc-500 uppercase font-black mb-1">{L.UI.CURRENT}</div>
                        <div className="text-sm font-black text-white">+{currentSelectedItem.level}</div>
                      </div>
                      <ChevronRight className="text-amber-500 animate-mu-float" size={20} />
                      <div className="text-center flex-1">
                        <div className="text-[8px] text-zinc-500 uppercase font-black mb-1">{L.UI.TARGET}</div>
                        <div className="text-sm font-black text-amber-500">+{currentSelectedItem.level + 1}</div>
                      </div>
                    </div>

                    <div className="bg-zinc-900/80 p-4 rounded-2xl border border-white/5">
                      <div className="text-[8px] text-zinc-500 uppercase font-black mb-3 tracking-widest">{L.UI.MATERIALS}</div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-black rounded-xl border-2 border-zinc-800 flex items-center justify-center text-2xl shadow-inner">
                            {currentSelectedItem.level < 6 ? '💎' : '🔮'}
                          </div>
                          <div className="flex flex-col">
                            <div className="text-[10px] text-white font-black uppercase tracking-tighter">
                              {currentSelectedItem.level < 6 ? L.ITEMS.JEWELS['Ngọc Ước Nguyện'].name : L.ITEMS.JEWELS['Ngọc Tâm Linh'].name}
                            </div>
                            <div className="text-[8px] text-zinc-500 font-bold uppercase">{L.UI.QUANTITY}: 1</div>
                          </div>
                        </div>
                        <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center">
                          <Plus size={12} className="text-amber-500" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 px-1">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                        <span className="text-zinc-500">{L.UI.RATE}:</span>
                        <span className={currentSelectedItem.level < 6 ? 'text-green-500' : 'text-amber-500'}>
                          {currentSelectedItem.level < 6 ? '100%' : `${Math.max(GAME_CONFIG.ENHANCE_MIN_SUCCESS_RATE, GAME_CONFIG.ENHANCE_SUCCESS_BASE_RATE - currentSelectedItem.level * GAME_CONFIG.ENHANCE_SUCCESS_LEVEL_PENALTY)}%`}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                        <span className="text-zinc-500">{L.UI.COST}:</span>
                        <span className="text-amber-500">{formatNumber((currentSelectedItem.level + 1) * GAME_CONFIG.ENHANCE_ZEN_COST_MULT)} {L.UI.ZEN}</span>
                      </div>
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isForging}
                      onClick={() => onForge(currentSelectedItem, 'enhance')}
                      className={`w-full mu-button-primary py-4 flex items-center justify-center gap-2 ${isForging ? 'opacity-50 grayscale' : ''}`}
                    >
                      <Hammer size={16} />
                      <span className="text-xs font-black uppercase tracking-widest">{isForging ? L.UI.FORGING : L.UI.ENHANCE}</span>
                    </motion.button>
                  </div>
                )}

                {forgeMode === 'option' && (
                  <div className="w-full max-w-[240px] space-y-5">
                    <div className="bg-zinc-900/80 p-4 rounded-2xl border border-white/5">
                      <div className="text-[8px] text-zinc-500 uppercase font-black mb-3 tracking-widest">{L.UI.REINFORCE}</div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-black rounded-xl border-2 border-zinc-800 flex items-center justify-center text-2xl shadow-inner">🍀</div>
                          <div className="flex flex-col">
                            <div className="text-[10px] text-white font-black uppercase tracking-tighter">{L.ITEMS.JEWELS['Ngọc Sinh Mệnh'].name}</div>
                            <div className="text-[8px] text-zinc-500 font-bold uppercase">{L.UI.QUANTITY}: 1</div>
                          </div>
                        </div>
                        <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <Plus size={12} className="text-blue-500" />
                        </div>
                      </div>
                      <div className="text-[9px] text-zinc-500 italic text-center leading-tight bg-black/40 p-2 rounded-lg border border-white/5">
                        {L.UI.REINFORCE_TOOLTIP}
                      </div>
                    </div>

                    <div className="space-y-2 px-1">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                        <span className="text-zinc-500">{L.UI.CURRENT_LEVEL}:</span>
                        <span className="text-blue-400">Op +{currentSelectedItem.optionLevel || 0}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                        <span className="text-zinc-500">{L.UI.RATE}:</span>
                        <span className="text-green-500">50%</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                        <span className="text-zinc-500">{L.UI.COST}:</span>
                        <span className="text-amber-500">{formatNumber(((currentSelectedItem.optionLevel || 0) + 1) * GAME_CONFIG.OPTION_ENHANCE_ZEN_COST_MULT)} {L.UI.ZEN}</span>
                      </div>
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isForging}
                      onClick={() => onForge(currentSelectedItem, 'option')}
                      className={`w-full mu-button-secondary py-4 flex items-center justify-center gap-2 ${isForging ? 'opacity-50 grayscale' : ''}`}
                    >
                      <Zap size={16} />
                      <span className="text-xs font-black uppercase tracking-widest">{isForging ? L.UI.FORGING : L.UI.REINFORCE}</span>
                    </motion.button>
                  </div>
                )}
                
                {forgeMode === 'wings' && (
                  <div className="text-center py-12 space-y-6">
                    <motion.div 
                      animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="text-7xl drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                    >
                      🕊️
                    </motion.div>
                    <div className="space-y-2">
                      <div className="text-sm font-black text-purple-400 uppercase tracking-widest">{L.UI.WING_CRAFT_TIER_1}</div>
                      <div className="text-[10px] text-zinc-500 uppercase font-bold">{L.UI.WING_CRAFT_REQ}</div>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded-xl">
                      <div className="text-[9px] text-purple-300 uppercase font-black">{L.UI.FEATURE_DEVELOPING}</div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                className="text-center space-y-4"
              >
                <div className="relative inline-block">
                  <Hammer size={64} className="text-amber-500/50" />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-20px] border-2 border-dashed border-amber-500/20 rounded-full"
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-black uppercase tracking-[0.3em] text-amber-500/50">{L.UI.FORGE_LORENCIA}</div>
                  <div className="text-[10px] uppercase font-bold text-zinc-600">{L.UI.SELECT_ITEM_TO_START}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
