import React from 'react';
import { Plus, Zap, Shield, Sword, Heart, Activity } from 'lucide-react';
import { Hero, Item, CharacterClass } from '../../types';
import { formatNumber, getHeroTotalStats } from '../../utils/gameUtils';
import { ItemTooltip } from './Shared';
import { motion } from 'motion/react';
import { L } from '../../locales';
import { GAME_CONFIG } from '../../config/gameConfig';

import { CLASSES } from '../../constants';

interface RoleTabProps {
  player: any;
  selectedHeroIndex: number;
  setSelectedHeroIndex: (idx: number) => void;
  handleAddHero: (cls: CharacterClass) => void;
  handleStatIncrease: (stat: keyof Hero['stats']) => void;
  useFruit: () => void;
  handleRebirth: (idx: number) => void;
  handleUnequip: (slot: keyof Hero['equipment']) => void;
  upgradePassiveSkill: (skillId: string) => void;
}

export const RoleTab: React.FC<RoleTabProps> = ({
  player,
  selectedHeroIndex,
  setSelectedHeroIndex,
  handleAddHero,
  handleStatIncrease,
  useFruit,
  handleRebirth,
  handleUnequip,
  upgradePassiveSkill,
}) => {
  const currentHero = player.team[selectedHeroIndex];
  const stats = getHeroTotalStats(currentHero);

  const renderSlot = (slot: keyof Hero['equipment'], label: string) => {
    const equipItem = currentHero.equipment[slot] as Item | null;
    return (
      <div className="flex flex-col items-center gap-1">
        <div className={`mu-item-slot w-14 h-14 ${equipItem?.rarity === 'Excellent' ? 'excellent' : ''} ${!equipItem ? 'opacity-40' : ''}`}>
          {equipItem ? (
            <ItemTooltip 
              item={equipItem}
              actions={
                <button
                  onClick={() => handleUnequip(slot)}
                  className="w-full bg-red-600 hover:bg-red-500 text-white py-2 rounded text-[10px] font-black uppercase mt-4"
                >
                  {L.UI.UNEQUIP}
                </button>
              }
            >
              <div className="w-full h-full flex items-center justify-center text-2xl relative">
                {equipItem.image || '⚔️'}
                {equipItem.level > 0 && (
                  <div className="absolute top-0 right-0 text-[8px] bg-amber-500 text-black px-1 font-bold rounded-bl">
                    +{equipItem.level}
                  </div>
                )}
              </div>
            </ItemTooltip>
          ) : (
            <div className="text-xs font-black text-zinc-700 uppercase">{label}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-zinc-950 p-4 overflow-y-auto custom-scrollbar">
      {/* Hero Selection Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        {player.team.map((h: Hero, i: number) => (
          <motion.button 
            whileTap={{ scale: 0.95 }}
            key={h.id}
            onClick={() => setSelectedHeroIndex(i)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg border-2 transition-all flex flex-col items-center min-w-[80px] ${selectedHeroIndex === i ? 'bg-amber-500 border-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
          >
            <div className="text-[10px] font-black uppercase tracking-tighter">{h.class}</div>
            <div className="text-[9px] font-bold">Lv.{h.level}</div>
          </motion.button>
        ))}
        {player.team.length < player.unlockedSlots && (
          <div className="flex gap-1">
            {[CLASSES.DARK_WIZARD, CLASSES.FAIRY_ELF].map((cls) => (
              <motion.button 
                whileTap={{ scale: 0.95 }}
                key={cls}
                onClick={() => handleAddHero(cls as any)}
                className="px-4 py-2 rounded-lg border-2 border-dashed border-zinc-800 bg-zinc-900/30 flex flex-col items-center justify-center text-zinc-600 hover:text-amber-500 hover:border-amber-500 transition-all min-w-[80px]"
              >
                <Plus size={14} />
                <span className="text-[8px] font-black uppercase tracking-tighter">{cls}</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Main Character Display */}
      <div className="relative bg-zinc-900/50 rounded-3xl border border-white/5 p-6 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.05)_0%,_transparent_70%)]" />
        
        <div className="grid grid-cols-3 gap-4 relative z-10">
          {/* Left Slots */}
          <div className="flex flex-col justify-between py-4">
            {renderSlot('helm', L.UI.HELM)}
            {renderSlot('armor', L.UI.ARMOR)}
            {renderSlot('pants', L.UI.PANTS)}
          </div>

          {/* Center Preview */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative">
              <div className="w-32 h-32 bg-amber-500/10 rounded-full border border-amber-500/20 flex items-center justify-center animate-mu-glow">
                <div className="text-7xl animate-mu-float drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  {currentHero.class === CLASSES.DARK_KNIGHT ? '🛡️' : currentHero.class === CLASSES.DARK_WIZARD ? '🧙' : '🧝'}
                </div>
              </div>
              {/* Wings Slot */}
              <div className="absolute -top-4 -right-4">
                {renderSlot('wings', L.UI.WINGS)}
              </div>
            </div>
            <div className="mt-6 text-center">
              <div className="text-xl font-black text-white uppercase tracking-tighter">{currentHero.class}</div>
              <div className="text-amber-500 font-black text-xs uppercase tracking-widest">{L.UI.POWER}: {formatNumber(player.power)}</div>
            </div>
          </div>

          {/* Right Slots */}
          <div className="flex flex-col justify-between py-4">
            {renderSlot('weapon', L.UI.WEAPON)}
            {renderSlot('gloves', L.UI.GLOVES)}
            {renderSlot('boots', L.UI.BOOTS)}
          </div>
        </div>
      </div>

      {/* Stats and Potential */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="mu-panel p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="mu-text-gold text-xs">{L.UI.STAT_POINTS}</div>
            <div className="text-white font-black text-sm">{currentHero.statPoints} Pts</div>
          </div>
          <div className="space-y-4">
            {[
              { key: 'str', label: L.UI.STR, icon: Sword, color: 'text-red-500' },
              { key: 'agi', label: L.UI.AGI, icon: Activity, color: 'text-green-500' },
              { key: 'vit', label: L.UI.VIT, icon: Heart, color: 'text-blue-500' },
              { key: 'ene', label: L.UI.ENE, icon: Zap, color: 'text-purple-500' },
            ].map((stat) => (
              <div key={stat.key} className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-white/5">
                <div className="flex items-center gap-2">
                  <stat.icon size={14} className={stat.color} />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">{stat.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-white">{currentHero.stats[stat.key as keyof Hero['stats']]}</span>
                  <motion.button 
                    whileTap={{ scale: 0.8 }}
                    onClick={() => handleStatIncrease(stat.key as any)}
                    disabled={currentHero.statPoints <= 0}
                    className="w-6 h-6 bg-amber-500 text-black rounded-md flex items-center justify-center disabled:opacity-20 shadow-lg shadow-amber-500/20"
                  >
                    <Plus size={14} />
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={useFruit}
            className="w-full mt-4 mu-button-secondary py-2 text-[10px] flex items-center justify-center gap-2"
          >
            <span>✨ {L.UI.USE_FRUIT}</span>
            <span className="text-[8px] opacity-50">({L.UI.NEED_CREATION_JEWEL})</span>
          </motion.button>
        </div>

        <div className="mu-panel p-4">
          <div className="mu-text-gold text-xs mb-4">{L.UI.DETAILED_STATS}</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/40 p-3 rounded-lg border border-white/5">
              <div className="text-[8px] text-zinc-500 uppercase font-black mb-1">{L.UI.ATTACK}</div>
              <div className="text-sm font-black text-white">{formatNumber(stats.totalAtk)}</div>
            </div>
            <div className="bg-black/40 p-3 rounded-lg border border-white/5">
              <div className="text-[8px] text-zinc-500 uppercase font-black mb-1">{L.UI.DEFENSE}</div>
              <div className="text-sm font-black text-white">{formatNumber(stats.totalDef)}</div>
            </div>
            <div className="bg-black/40 p-3 rounded-lg border border-white/5">
              <div className="text-[8px] text-zinc-500 uppercase font-black mb-1">{L.UI.CRITICAL}</div>
              <div className="text-sm font-black text-white">{stats.totalCrit}%</div>
            </div>
            <div className="bg-black/40 p-3 rounded-lg border border-white/5">
              <div className="text-[8px] text-zinc-500 uppercase font-black mb-1">{L.UI.HP_REGEN}</div>
              <div className="text-sm font-black text-white">+{stats.totalHpRegen}</div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/5">
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRebirth(selectedHeroIndex)}
              className="w-full mu-button-primary py-3 text-xs"
            >
              {L.UI.REBIRTH} ({currentHero.rebirth})
            </motion.button>
            <div className="text-[8px] text-zinc-500 text-center mt-2 uppercase font-bold tracking-widest">
              {L.UI.REBIRTH_REQ}
            </div>
          </div>
        </div>
      </div>

      {/* Passive Skills */}
      <div className="mu-panel p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="mu-text-gold text-xs flex items-center gap-2">
            <Zap size={14} /> {L.UI.PASSIVE_SKILLS}
          </div>
        </div>
        <div className="space-y-3">
          {currentHero.passiveSkills.map((skill) => (
            <div key={skill.id} className="bg-black/40 border border-white/5 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center text-2xl shadow-inner border border-white/5">
                  {skill.image}
                </div>
                <div>
                  <div className="text-[10px] font-black text-white uppercase tracking-tighter">{skill.name}</div>
                  <div className="text-[8px] text-zinc-500 uppercase font-bold">{L.UI.LEVEL} {skill.level} / {skill.maxLevel}</div>
                  <div className="flex gap-2 mt-1">
                    {Object.entries(skill.statBonus).map(([s, b]) => (
                      <span key={s} className="text-[8px] text-amber-500 font-bold uppercase">+{b as number * skill.level} {s}</span>
                    ))}
                  </div>
                </div>
              </div>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => upgradePassiveSkill(skill.id)}
                disabled={currentHero.statPoints < (skill.level + 1) * GAME_CONFIG.PASSIVE_SKILL_UPGRADE_COST_MULT || skill.level >= skill.maxLevel}
                className="bg-zinc-800 text-amber-500 border border-amber-500/30 px-4 py-2 rounded-lg font-black text-[9px] uppercase disabled:opacity-20"
              >
                {L.UI.UPGRADE} ({(skill.level + 1) * GAME_CONFIG.PASSIVE_SKILL_UPGRADE_COST_MULT} Pts)
              </motion.button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
