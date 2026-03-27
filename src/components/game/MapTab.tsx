import React from 'react';
import { Map as MapIcon, ChevronRight, Lock, Compass } from 'lucide-react';
import { motion } from 'motion/react';
import { STAGES } from '../../constants';
import { L } from '../../locales';

interface MapTabProps {
  player: any;
  currentStage: any;
  setCurrentStage: (stage: any) => void;
  setLogs: React.Dispatch<React.SetStateAction<string[]>>;
  setActiveTab: (tab: string) => void;
}

export const MapTab: React.FC<MapTabProps> = ({
  player,
  currentStage,
  setCurrentStage,
  setLogs,
  setActiveTab,
}) => {
  return (
    <div className="flex-1 bg-zinc-950 p-4 overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-3 mb-8 px-1">
        <Compass size={20} className="text-amber-500 animate-spin-slow" />
        <div className="text-[12px] font-black text-amber-500 uppercase tracking-[0.4em]">{L.UI.WORLD_MAP}</div>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-amber-500/30 to-transparent" />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {STAGES.map((stage, index) => {
          const isUnlocked = player.team[0].level >= stage.minLevel;
          const isActive = currentStage.id === stage.id;
          
          return (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={isUnlocked ? { scale: 1.02, x: 8 } : {}}
              whileTap={isUnlocked ? { scale: 0.98 } : {}}
              key={stage.id}
              onClick={() => {
                if (isUnlocked) {
                  setCurrentStage(stage);
                  setLogs(prev => [`${L.SYSTEM.MOVED_TO} ${stage.name}`, ...prev.slice(0, 4)]);
                  setActiveTab('battle');
                }
              }}
              disabled={!isUnlocked}
              className={`group relative overflow-hidden rounded-2xl border-2 transition-all p-5 flex items-center justify-between ${
                isActive 
                  ? 'bg-gradient-to-r from-amber-600 to-amber-400 border-white/20 text-black shadow-lg shadow-amber-500/20' 
                  : isUnlocked 
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-amber-500/30' 
                    : 'bg-zinc-950 border-zinc-900 text-zinc-700 opacity-60 grayscale'
              }`}
            >
              {/* Background pattern for active stage */}
              {isActive && (
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
              )}

              <div className="flex items-center gap-6 relative z-10">
                <div className={`text-5xl transition-all duration-500 ${isActive ? 'scale-110 drop-shadow-md' : 'group-hover:scale-110'}`}>
                  {stage.image}
                </div>
                <div className="text-left">
                  <div className={`text-sm font-black uppercase tracking-tight ${isActive ? 'text-black' : 'text-white group-hover:text-amber-500'}`}>
                    {stage.name}
                  </div>
                  <div className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isActive ? 'text-black/60' : 'text-zinc-500'}`}>
                    {L.UI.REQUIRE}: Lv.{stage.minLevel}
                  </div>
                </div>
              </div>

              <div className="relative z-10">
                {!isUnlocked ? (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-lg">
                    <Lock size={12} className="text-red-500" />
                    <span className="text-[9px] font-black uppercase text-red-500">{L.UI.LOCKED}</span>
                  </div>
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-black/20' : 'bg-zinc-800 group-hover:bg-amber-500/20'}`}>
                    <ChevronRight size={18} className={isActive ? 'text-black' : 'text-zinc-600 group-hover:text-amber-500'} />
                  </div>
                )}
              </div>

              {/* Active indicator glow */}
              {isActive && (
                <motion.div 
                  layoutId="active-map-glow"
                  className="absolute inset-0 border-2 border-white/40 rounded-2xl animate-pulse"
                />
              )}
            </motion.button>
          );
        })}
      </div>
      
      {/* Bottom padding */}
      <div className="h-10" />
    </div>
  );
};
