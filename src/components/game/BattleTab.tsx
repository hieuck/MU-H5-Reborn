import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sword, Zap, Shield, Target } from 'lucide-react';
import { Monster, Hero } from '../../types';
import { formatNumber } from '../../utils/gameUtils';
import { L } from '../../locales';

interface BattleTabProps {
  currentStage: any;
  monsters: Monster[];
  isBossBattle: boolean;
  currentBoss: any;
  damageTexts: any[];
  player: any;
  isAutoBattle: boolean;
  setIsAutoBattle: (val: boolean) => void;
  attack: () => void;
  logs: string[];
}

export const BattleTab: React.FC<BattleTabProps> = ({
  currentStage,
  monsters,
  isBossBattle,
  currentBoss,
  damageTexts,
  player,
  isAutoBattle,
  setIsAutoBattle,
  attack,
  logs,
}) => {
  const logContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
      {/* Arena View */}
      <div className="relative h-72 overflow-hidden border-b-2 border-amber-500/20">
        {/* Background Layer */}
        <div className="absolute inset-0 bg-zinc-900">
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/dungeon/800/600')] bg-cover bg-center opacity-30 grayscale" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
        </div>

        {/* Stage Info Overlay */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <div className="px-6 py-1 bg-black/60 backdrop-blur-md border-x-2 border-amber-500/50 rounded-full">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">
              {currentStage.name}
            </span>
          </div>
        </div>

        {/* Combat Area */}
        <div className="absolute inset-0 flex items-center justify-center gap-12 px-4">
          <AnimatePresence mode="popLayout">
            {isBossBattle && currentBoss ? (
              <motion.div
                key="boss"
                initial={{ scale: 0.5, opacity: 0, y: 100 }}
                animate={{ scale: 1.3, opacity: 1, y: 0 }}
                exit={{ scale: 0.5, opacity: 0, y: -100 }}
                className="relative flex flex-col items-center"
              >
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="text-8xl mb-4 drop-shadow-[0_0_25px_rgba(239,68,68,0.6)]"
                >
                  {currentBoss.image}
                </motion.div>
                
                {/* Boss Health Bar */}
                <div className="w-48 h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-red-700 via-red-500 to-red-400"
                    initial={{ width: '100%' }}
                    animate={{ width: `${(currentBoss.hp / currentBoss.maxHp) * 100}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] font-black text-white uppercase tracking-tighter bg-red-600 px-2 py-0.5 rounded shadow-lg">BOSS</span>
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-widest drop-shadow-md">{currentBoss.name}</span>
                </div>
              </motion.div>
            ) : (
              <div className="flex gap-6">
                {monsters.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ scale: 0, opacity: 0, x: 50 }}
                    animate={{ scale: 1, opacity: 1, x: 0 }}
                    exit={{ scale: 0, opacity: 0, x: -50 }}
                    className="relative flex flex-col items-center"
                  >
                    <motion.div 
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
                      className="text-6xl mb-3 drop-shadow-lg"
                    >
                      {m.image}
                    </motion.div>
                    <div className="w-20 h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/10">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-red-600 to-red-400"
                        initial={{ width: '100%' }}
                        animate={{ width: `${(m.hp / m.maxHp) * 100}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Damage Texts Overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <AnimatePresence>
            {damageTexts.map(dt => (
              <motion.div
                key={dt.id}
                initial={{ opacity: 1, y: dt.y, x: dt.x, scale: 0.8 }}
                animate={{ opacity: 0, y: dt.y - 120, scale: 1.8, x: dt.x + (Math.random() - 0.5) * 40 }}
                exit={{ opacity: 0 }}
                className={`absolute font-black z-50 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
                  dt.type === 'exe' ? 'text-green-400 text-2xl italic' : 
                  dt.type === 'crit' ? 'text-blue-400 text-xl' : 
                  'text-amber-400 text-lg'
                }`}
              >
                {dt.value}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Player Team Status Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex gap-3">
          {player.team.map((hero: Hero) => (
            <div key={hero.id} className="flex-1 flex flex-col gap-1">
              <div className="flex justify-between items-end">
                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter">{hero.class}</span>
                <span className="text-[9px] font-black text-white">Lv.{hero.level}</span>
              </div>
              <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  className="h-full bg-gradient-to-r from-red-600 to-red-400"
                  animate={{ width: `${(hero.hp / hero.maxHp) * 100}%` }}
                  transition={{ type: "spring", stiffness: 100 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Battle Controls Panel */}
      <div className="bg-zinc-900/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-white/5 shadow-xl relative z-20">
        <div className="flex items-center gap-3">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsAutoBattle(!isAutoBattle)}
            className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${
              isAutoBattle 
                ? 'bg-amber-500 border-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                : 'bg-zinc-800 border-zinc-700 text-zinc-500'
            }`}
          >
            <Zap size={14} fill={isAutoBattle ? "black" : "none"} className={isAutoBattle ? "animate-pulse" : ""} />
            {L.UI.AUTO}
            {isAutoBattle && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900 animate-ping" />
            )}
          </motion.button>
          
          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-950 rounded-xl border border-white/5">
            <Target size={12} className="text-zinc-500" />
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">
              {isBossBattle ? L.UI.BOSS_MODE : L.UI.FARMING}
            </span>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={attack}
          className="mu-button-primary px-8 py-2.5 flex items-center gap-3"
        >
          <Sword size={16} />
          <span className="text-xs font-black uppercase tracking-widest">{L.UI.ATTACK}</span>
        </motion.button>
      </div>

      {/* Battle Logs Section */}
      <div className="flex-1 flex flex-col bg-black relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />
        
        <div 
          ref={logContainerRef}
          className="flex-1 p-4 font-mono text-[10px] overflow-y-auto custom-scrollbar space-y-2"
        >
          {logs.map((log, i) => {
            const isItem = log.includes(L.SYSTEM.LOG_PREFIX_ITEM);
            const isLevel = log.includes(L.SYSTEM.LOG_PREFIX_LEVEL);
            const isBoss = log.includes(L.SYSTEM.LOG_PREFIX_BOSS);
            const isDeath = log.includes(L.SYSTEM.LOG_PREFIX_DEATH);

            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex gap-3 items-start ${
                  isItem ? 'text-green-400' : 
                  isLevel ? 'text-blue-400' : 
                  isBoss ? 'text-red-400 font-bold' : 
                  isDeath ? 'text-zinc-600 italic' :
                  'text-zinc-500'
                }`}
              >
                <span className="opacity-20 flex-shrink-0 font-black">
                  {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                </span>
                <span className="leading-relaxed tracking-tight">
                  {isItem && <span className="mr-1">💎</span>}
                  {isLevel && <span className="mr-1">✨</span>}
                  {isBoss && <span className="mr-1">💀</span>}
                  {log}
                </span>
              </motion.div>
            );
          })}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
      </div>
    </div>
  );
};
