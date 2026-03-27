import React from 'react';
import { Trophy, Sword, Target, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { WORLD_BOSSES } from '../../constants';
import { formatNumber } from '../../utils/gameUtils';
import { L } from '../../locales';

interface BossTabProps {
  player: any;
  worldBossActive: any;
  handleChallengeBoss: (boss: any) => void;
}

export const BossTab: React.FC<BossTabProps> = ({
  player,
  worldBossActive,
  handleChallengeBoss,
}) => {
  return (
    <div className="flex-1 bg-zinc-950 p-4 overflow-y-auto custom-scrollbar">
      {/* Active Event Banner */}
      {worldBossActive && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 bg-gradient-to-br from-red-900/60 via-amber-900/40 to-zinc-900/80 p-6 rounded-2xl border-2 border-amber-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-2">
            <span className="flex items-center gap-1 text-[8px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black animate-pulse">
              <div className="w-1 h-1 bg-white rounded-full animate-ping" />
              {L.UI.LIVE_EVENT}
            </span>
          </div>
          
          <div className="flex items-center gap-6 relative z-10">
            <motion.div 
              animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-7xl drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]"
            >
              {worldBossActive.image}
            </motion.div>
            
            <div className="flex-1">
              <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">{L.UI.WORLD_BOSS}</div>
              <div className="text-2xl font-black text-white uppercase tracking-tighter mb-2 drop-shadow-md">{worldBossActive.name}</div>
              <div className="flex items-center gap-3 text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1"><Target size={10} className="text-amber-500" /> Lv.{worldBossActive.level}</span>
                <span className="flex items-center gap-1"><ShieldAlert size={10} className="text-red-500" /> {L.UI.BOSS_TICKET} x1</span>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleChallengeBoss(worldBossActive)}
                className="mt-5 w-full mu-button-primary py-3 flex items-center justify-center gap-2"
              >
                <Sword size={16} />
                <span className="text-xs font-black uppercase tracking-widest">{L.UI.CHALLENGE_NOW}</span>
              </motion.button>
            </div>
          </div>
          
          {/* Decorative background element */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        </motion.div>
      )}

      <div className="flex items-center gap-3 mb-6 px-1">
        <Trophy size={18} className="text-amber-500" />
        <div className="text-[11px] font-black text-amber-500 uppercase tracking-[0.3em]">{L.UI.BOSS_LIST}</div>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-amber-500/30 to-transparent" />
      </div>

      <div className="space-y-4">
        {WORLD_BOSSES.map((boss, index) => {
          const isUnlocked = player.team[0].level >= boss.level;
          
          return (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              key={boss.id} 
              className={`mu-panel p-4 flex items-center justify-between transition-all ${!isUnlocked ? 'opacity-60 grayscale' : 'hover:border-amber-500/30'}`}
            >
              <div className="flex items-center gap-5">
                <div className="text-5xl drop-shadow-lg">{boss.image}</div>
                <div className="space-y-1">
                  <div className="text-sm font-black text-white uppercase tracking-tight">{boss.name}</div>
                  <div className="flex items-center gap-3 text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">
                    <span>Lv.{boss.level}</span>
                    <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                    <span>HP: {formatNumber(boss.hp)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-black text-green-500 uppercase tracking-tighter bg-green-500/5 px-2 py-0.5 rounded border border-green-500/10">
                    <span>{L.UI.REWARD}:</span>
                    <span className="text-white">{formatNumber(boss.rewardZen)} {L.UI.ZEN}</span>
                    <span className="text-blue-400">{formatNumber(boss.rewardDiamond)} {L.UI.DIAMOND}</span>
                  </div>
                </div>
              </div>
              
              <motion.button 
                whileHover={isUnlocked ? { scale: 1.05, x: 5 } : {}}
                whileTap={isUnlocked ? { scale: 0.95 } : {}}
                onClick={() => handleChallengeBoss(boss)}
                className={`min-w-[100px] py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-2 ${
                  isUnlocked 
                    ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/20' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
                disabled={!isUnlocked}
              >
                {isUnlocked ? (
                  <>
                    <Sword size={12} />
                    {L.UI.HUNT_BOSS}
                  </>
                ) : (
                  `Lv.${boss.level}`
                )}
              </motion.button>
            </motion.div>
          );
        })}
      </div>
      
      {/* Bottom padding for scroll */}
      <div className="h-10" />
    </div>
  );
};
