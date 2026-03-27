import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Sword, Backpack, Hammer, Trophy, 
  Plus, Zap, MessageSquare, Crown, Map as MapIcon, Briefcase,
  Lock, Trash2
} from 'lucide-react';
import { Hero, Player, Monster, Item, CharacterClass, Skill, Equipment } from './types';
import { 
  CLASSES_DATA, MONSTERS, STAGES, QUESTS, SHOP_ITEMS, JEWELS, 
  ITEM_SETS, WEAPONS, WORLD_BOSSES, EXCELLENT_OPTIONS, WINGS, REBIRTH_REQUIREMENTS 
} from './constants';
import { GAME_CONFIG } from './config/gameConfig';
import { L } from './locales';

// --- Utilities ---
import { calculatePower, getHeroTotalStats, formatNumber, generateExcellentItem, generateId } from './utils/gameUtils';

// --- Hooks ---
import { useGameLoop } from './hooks/useGameLoop';
import { useInventory } from './hooks/useInventory';

// --- Components ---
import { BattleTab } from './components/game/BattleTab';
import { RoleTab } from './components/game/RoleTab';
import { BagTab } from './components/game/BagTab';
import { ForgeTab } from './components/game/ForgeTab';
import { BossTab } from './components/game/BossTab';
import { MapTab } from './components/game/MapTab';
import { ShopTab } from './components/game/ShopTab';



// --- Components ---
const DamageText = ({ x, y, value, type }: { x: number, y: number, value: number, type: 'normal' | 'crit' | 'exe' }) => {
  const colors = {
    normal: 'text-yellow-400',
    crit: 'text-blue-400 font-bold italic',
    exe: 'text-green-400 font-bold text-lg'
  };
  return (
    <motion.div
      initial={{ opacity: 1, y: y, x: x }}
      animate={{ opacity: 0, y: y - 100, x: x + (Math.random() * 40 - 20) }}
      className={`absolute pointer-events-none z-50 text-shadow-sm ${colors[type]}`}
      transition={{ duration: 1 }}
    >
      {value}
    </motion.div>
  );
};

const App: React.FC = () => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [activeTab, setActiveTab] = useState<'battle' | 'role' | 'bag' | 'forge' | 'boss' | 'map' | 'shop'>('battle');
  const [recentDrops, setRecentDrops] = useState<{ id: string, name: string, image: string, rarity: string }[]>([]);
  const [isBossBattle, setIsBossBattle] = useState(false);
  const [currentBoss, setCurrentBoss] = useState<any>(null);
  const [selectedHeroIndex, setSelectedHeroIndex] = useState(0);
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [damageTexts, setDamageTexts] = useState<{ id: number, x: number, y: number, value: number, type: 'normal' | 'crit' | 'exe' }[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [isAutoBattle, setIsAutoBattle] = useState(true);
  const [worldBossActive, setWorldBossActive] = useState<any>(null);
  
  // Initialize or Load Game
  useEffect(() => {
    const saved = localStorage.getItem('mu_h5_v3_save');
    if (saved) {
      const parsed = JSON.parse(saved);
      
      // Calculate Offline Progress
      const lastSave = parsed.lastSave || Date.now();
      const now = Date.now();
      const diffSeconds = Math.floor((now - lastSave) / 1000);
      
      if (diffSeconds > 60) {
        const maxOfflineSeconds = GAME_CONFIG.MAX_OFFLINE_SECONDS;
        const actualSeconds = Math.min(diffSeconds, maxOfflineSeconds);
        const expPerSec = parsed.team[0].level * GAME_CONFIG.EXP_PER_SEC_LEVEL_MULT;
        const zenPerSec = parsed.team[0].level * GAME_CONFIG.ZEN_PER_SEC_LEVEL_MULT;
        
        const totalExp = Math.floor(expPerSec * actualSeconds);
        const totalZen = Math.floor(zenPerSec * actualSeconds);
        
        parsed.zen += totalZen;
        parsed.team.forEach((h: any) => {
          h.exp += totalExp;
          while (h.exp >= h.maxExp) {
            h.level++;
            h.exp -= h.maxExp;
            h.maxExp = Math.floor(h.maxExp * GAME_CONFIG.LEVEL_UP_EXP_MULT);
            h.statPoints += GAME_CONFIG.STAT_POINTS_PER_LEVEL;
          }
        });
        
        setLogs(prev => [L.SYSTEM.WELCOME_BACK(totalExp, totalZen), ...prev]);
      }
      
      setPlayer({ 
        ...parsed, 
        dropRateMultiplier: parsed.dropRateMultiplier || 1.0,
        team: parsed.team.map((h: any) => ({
          ...h,
          passiveSkills: h.passiveSkills || [...CLASSES_DATA[h.class as CharacterClass].passiveSkills]
        }))
      });
    } else {
      setIsCreating(true);
    }
  }, []);

  // Auto Save & Power Update
  useEffect(() => {
    if (player) {
      const newPower = player.team.reduce((sum, h) => sum + calculatePower(h), 0);
      if (newPower !== player.power) {
        setPlayer(prev => prev ? { ...prev, power: newPower } : null);
      }
      
      // Check for slot unlocks
      const mainHero = player.team[0];
      if (mainHero.level >= GAME_CONFIG.UNLOCK_SLOT_2_LEVEL && player.unlockedSlots < 2) {
        setPlayer(prev => prev ? { ...prev, unlockedSlots: 2 } : null);
        setLogs(prev => [L.SYSTEM.SLOT_UNLOCK_2, ...prev]);
      }
      if (mainHero.level >= GAME_CONFIG.UNLOCK_SLOT_3_LEVEL && player.unlockedSlots < 3) {
        setPlayer(prev => prev ? { ...prev, unlockedSlots: 3 } : null);
        setLogs(prev => [L.SYSTEM.SLOT_UNLOCK_3, ...prev]);
      }

      localStorage.setItem('mu_h5_v3_save', JSON.stringify({ ...player, lastSave: Date.now() }));
    }
  }, [player]);

  // Battle Logic
  useEffect(() => {
    if (!player || activeTab !== 'battle') return;

    const currentStage = STAGES.find(s => s.id === player.stage) || STAGES[0];
    
    const spawnMonsters = () => {
      if (monsters.length < 3) {
        const monsterName = currentStage.monsters[Math.floor(Math.random() * currentStage.monsters.length)];
        const baseMonster = MONSTERS.find(m => m.name === monsterName) || MONSTERS[0];
        setMonsters(prev => [...prev, { ...baseMonster, id: generateId() } as any]);
      }
    };

    const interval = setInterval(() => {
      spawnMonsters();
      if (isAutoBattle) {
        attack();
      }
      
      // HP Regeneration from passive skills
      setPlayer(prev => {
        if (!prev) return null;
        let hasChanges = false;
        const newTeam = prev.team.map(hero => {
          const passiveRegen = hero.passiveSkills.reduce((sum, p) => sum + (p.statBonus.hpRegen || 0) * p.level, 0);
          if (passiveRegen > 0 && hero.hp < hero.maxHp && hero.hp > 0) {
            hasChanges = true;
            return { ...hero, hp: Math.min(hero.maxHp, hero.hp + passiveRegen) };
          }
          return hero;
        });
        if (hasChanges) return { ...prev, team: newTeam };
        return prev;
      });
    }, GAME_CONFIG.BATTLE_INTERVAL);

    return () => clearInterval(interval);
  }, [player, monsters, activeTab, isAutoBattle]);

  const addDropNotification = (item: any) => {
    const id = generateId();
    setRecentDrops(prev => [{ id, name: item.name, image: item.image, rarity: item.rarity }, ...prev].slice(0, 3));
    setTimeout(() => {
      setRecentDrops(prev => prev.filter(d => d.id !== id));
    }, GAME_CONFIG.DROP_NOTIFICATION_DURATION);
  };

  const attack = useCallback(() => {
    if (!player || (monsters.length === 0 && !isBossBattle)) return;

    setPlayer(prev => {
      if (!prev) return null;
      let newPlayer = { ...prev };
      let newMonsters = [...monsters];
      let newLogs = [...logs];
      let newDamageTexts = [...damageTexts];

      newPlayer.team.forEach(hero => {
        if (hero.hp <= 0) {
          hero.hp = hero.maxHp; // Auto revive
          return;
        }

        const { totalAtk, totalCrit } = getHeroTotalStats(hero);

        if (isBossBattle && currentBoss) {
          const isCrit = Math.random() * 100 < totalCrit;
          const isExe = Math.random() > (1 - GAME_CONFIG.EXCELLENT_DROP_CHANCE); // Reusing for exe hit chance
          let damage = totalAtk;
          if (isCrit) damage *= GAME_CONFIG.CRIT_DAMAGE_MULT;
          if (isExe) damage *= GAME_CONFIG.EXE_DAMAGE_MULT;
          damage = Math.floor(damage * (0.9 + Math.random() * 0.2));

          currentBoss.hp -= damage;
          newDamageTexts.push({
            id: generateId(),
            x: 150 + (Math.random() * 100),
            y: 150 + (Math.random() * 100),
            value: damage,
            type: isExe ? 'exe' : (isCrit ? 'crit' : 'normal')
          });

          if (currentBoss.hp <= 0) {
            newLogs.unshift(L.SYSTEM.BOSS_DEFEATED(currentBoss.name));
            newPlayer.zen += currentBoss.level * GAME_CONFIG.BOSS_ZEN_REWARD_MULT;
            newPlayer.diamond += GAME_CONFIG.BOSS_DIAMOND_REWARD;

            // Boss Item Drops (Higher chance)
            const bossDropChance = GAME_CONFIG.BOSS_DROP_CHANCE * (newPlayer.dropRateMultiplier || 1);
            if (Math.random() < bossDropChance) {
              const classes: CharacterClass[] = ['Dark Knight', 'Dark Wizard', 'Fairy Elf'];
              const randomClass = classes[Math.floor(Math.random() * classes.length)];
              const sets = ITEM_SETS[randomClass];
              const availableItems = sets.filter((i: any) => i.minLevel <= currentBoss.level + 50);
              const baseItem = availableItems[availableItems.length - 1] || sets[0];
              
              const item = generateExcellentItem(baseItem, randomClass, 'armor');
              newPlayer.inventory.push(item);
              newLogs.unshift(L.SYSTEM.ITEM_DROP_EXCELLENT(item.name));
              addDropNotification(item);
            }

            setIsBossBattle(false);
            setCurrentBoss(null);
          }
        } else if (newMonsters.length > 0) {
          const targetIndex = Math.floor(Math.random() * newMonsters.length);
          const target = newMonsters[targetIndex];
          
          const isCrit = Math.random() * 100 < totalCrit;
          const isExe = Math.random() > (1 - GAME_CONFIG.EXCELLENT_DROP_CHANCE);
          
          let damage = totalAtk;
          if (isCrit) damage *= GAME_CONFIG.CRIT_DAMAGE_MULT;
          if (isExe) damage *= GAME_CONFIG.EXE_DAMAGE_MULT;
          damage = Math.floor(damage * (0.9 + Math.random() * 0.2));

          target.hp -= damage;
          
          newDamageTexts.push({
            id: generateId(),
            x: 150 + (Math.random() * 100),
            y: 200 + (Math.random() * 100),
            value: damage,
            type: isExe ? 'exe' : (isCrit ? 'crit' : 'normal')
          });

          if (target.hp <= 0) {
            newLogs.unshift(L.SYSTEM.MONSTER_DEFEATED(hero.class, target.name, target.expReward, target.zenReward));
            newPlayer.zen += target.zenReward;
            
            // Item Drops
            const baseDropChance = GAME_CONFIG.BASE_DROP_CHANCE;
            const modifiedDropChance = baseDropChance * (newPlayer.dropRateMultiplier || 1);
            if (Math.random() < modifiedDropChance) {
              const isJewel = Math.random() > GAME_CONFIG.JEWEL_DROP_CHANCE;
              if (isJewel) {
                const jewel = JEWELS[Math.floor(Math.random() * JEWELS.length)];
                newPlayer.inventory.push({ ...jewel, id: generateId() });
                newLogs.unshift(L.SYSTEM.ITEM_DROP_JEWEL(jewel.name));
                addDropNotification(jewel);
              } else {
                // Drop equipment based on stage and class
                const classes: CharacterClass[] = ['Dark Knight', 'Dark Wizard', 'Fairy Elf'];
                const randomClass = classes[Math.floor(Math.random() * classes.length)];
                const sets = ITEM_SETS[randomClass];
                const weapons = WEAPONS[randomClass];
                
                const isWeapon = Math.random() > GAME_CONFIG.WEAPON_DROP_CHANCE;
                const pool = isWeapon ? weapons : sets;
                const availableItems = pool.filter((i: any) => i.minLevel <= target.level + 20);
                const baseItem = availableItems[availableItems.length - 1] || pool[0];
                
                const slots: (keyof Equipment)[] = isWeapon ? ['weapon'] : ['armor', 'helm', 'pants', 'boots', 'gloves'];
                const slot = slots[Math.floor(Math.random() * slots.length)];

                const isExcellent = Math.random() > (1 - GAME_CONFIG.EXCELLENT_DROP_CHANCE);
                const item = isExcellent 
                  ? generateExcellentItem(baseItem, randomClass, slot)
                  : {
                      id: generateId(),
                      name: `${baseItem.name} (${randomClass})`,
                      type: isWeapon ? 'weapon' : 'armor',
                      rarity: 'Common',
                      stats: { str: 5, agi: 5, vit: 5, ene: 5 },
                      level: 0,
                      slot: slot,
                      description: `Trang bị của ${randomClass}.`,
                      image: baseItem.image
                    } as Item;

                newPlayer.inventory.push(item);
                newLogs.unshift(L.SYSTEM.ITEM_DROP_EQUIPMENT(item.name, item.rarity));
                addDropNotification(item);
              }
            }

            // Quest Progress
            const currentQuest = QUESTS.find(q => q.id === newPlayer.quest.questId);
            if (currentQuest && target.name === currentQuest.targetMonster && !newPlayer.quest.isCompleted) {
              newPlayer.quest.currentCount++;
              if (newPlayer.quest.currentCount >= currentQuest.targetCount) {
                newPlayer.quest.isCompleted = true;
                newLogs.unshift(L.SYSTEM.QUEST_COMPLETED(currentQuest.title));
              }
            }

            // Distribute EXP
            newPlayer.team.forEach(h => {
              h.exp += target.expReward;
              if (h.exp >= h.maxExp) {
                h.level++;
                h.exp = 0;
                h.maxExp = Math.floor(h.maxExp * GAME_CONFIG.LEVEL_UP_EXP_MULT);
                h.statPoints += GAME_CONFIG.STAT_POINTS_PER_LEVEL;
                h.hp = h.maxHp;
                newLogs.unshift(L.SYSTEM.LEVEL_UP(h.class, h.level));
                
                // Unlock slots logic
                if (h.level >= GAME_CONFIG.UNLOCK_SLOT_2_LEVEL && newPlayer.unlockedSlots === 1) {
                  newPlayer.unlockedSlots = 2;
                  newLogs.unshift(L.SYSTEM.SLOT_UNLOCK_2);
                }
                if (h.level >= GAME_CONFIG.UNLOCK_SLOT_3_LEVEL && newPlayer.unlockedSlots === 2) {
                  newPlayer.unlockedSlots = 3;
                  newLogs.unshift(L.SYSTEM.SLOT_UNLOCK_3);
                }
              }
            });
            newMonsters.splice(targetIndex, 1);
          }
        }
      });

      // Monster attack back
      if (isBossBattle && currentBoss) {
        const targetHero = newPlayer.team[Math.floor(Math.random() * newPlayer.team.length)];
        const passiveDef = targetHero.passiveSkills.reduce((sum, p) => sum + (p.statBonus.defense || 0) * p.level, 0);
        const bDamage = Math.max(1, currentBoss.level * 10 - (targetHero.stats.vit * 0.5 + passiveDef));
        targetHero.hp = Math.max(0, targetHero.hp - bDamage);
      } else {
        newMonsters.forEach(m => {
          const targetHero = newPlayer.team[Math.floor(Math.random() * newPlayer.team.length)];
          const passiveDef = targetHero.passiveSkills.reduce((sum, p) => sum + (p.statBonus.defense || 0) * p.level, 0);
          const mDamage = Math.max(1, m.atk - (targetHero.stats.vit * 0.5 + passiveDef));
          targetHero.hp = Math.max(0, targetHero.hp - mDamage);
        });
      }

      setMonsters(newMonsters);
      setLogs(newLogs.slice(0, 20));
      setDamageTexts(newDamageTexts.slice(-10));
      
      return newPlayer;
    });
  }, [monsters, logs, damageTexts, player, isBossBattle, currentBoss]);

  const handleChallengeBoss = (boss: any) => {
    if (!player) return;
    if (player.team[0].level < boss.level) {
      setLogs(prev => [L.SYSTEM.BOSS_CHALLENGE_LEVEL_LOW(boss.name), ...prev.slice(0, 4)]);
      return;
    }
    
    const ticketIdx = player.inventory.findIndex(i => i.name === L.ITEMS.SHOP['Vé Boss Thế Giới'].name);
    if (ticketIdx === -1) {
      setLogs(prev => [L.SYSTEM.BOSS_CHALLENGE_NO_TICKET, ...prev.slice(0, 4)]);
      return;
    }

    setPlayer(prev => {
      if (!prev) return null;
      const newInventory = [...prev.inventory];
      newInventory.splice(ticketIdx, 1);
      return { ...prev, inventory: newInventory };
    });

    setCurrentBoss({ ...boss, hp: boss.hp, maxHp: boss.hp });
    setIsBossBattle(true);
    setActiveTab('battle');
    setLogs(prev => [L.SYSTEM.BOSS_CHALLENGE_START(boss.name), ...prev.slice(0, 4)]);
    
    // If it was a world boss, clear it
    if (worldBossActive && worldBossActive.id === boss.id) {
      setWorldBossActive(null);
    }
  };

  const handleCreateTeam = () => {
    if (!teamName.trim()) return;
    const initialHero: Hero = {
      id: '1',
      class: CLASSES.DARK_KNIGHT,
      level: 1,
      rebirth: 0,
      exp: 0,
      maxExp: GAME_CONFIG.INITIAL_MAX_EXP,
      hp: CLASSES_DATA[CLASSES.DARK_KNIGHT].baseStats.vit * GAME_CONFIG.HP_PER_VIT,
      maxHp: CLASSES_DATA[CLASSES.DARK_KNIGHT].baseStats.vit * GAME_CONFIG.HP_PER_VIT,
      stats: { ...CLASSES_DATA[CLASSES.DARK_KNIGHT].baseStats },
      statPoints: 0,
      equipment: { weapon: null, armor: null, helm: null, pants: null, boots: null, gloves: null, wings: null },
      skills: [...CLASSES_DATA[CLASSES.DARK_KNIGHT].skills],
      passiveSkills: [...CLASSES_DATA[CLASSES.DARK_KNIGHT].passiveSkills]
    };

    setPlayer({
      name: teamName,
      team: [initialHero],
      zen: GAME_CONFIG.INITIAL_ZEN,
      diamond: GAME_CONFIG.INITIAL_DIAMOND,
      power: calculatePower(initialHero),
      inventory: [],
      unlockedSlots: 1,
      stage: 1,
      quest: { questId: 1, currentCount: 0, isCompleted: false },
      dropRateMultiplier: 1.0
    });
    setIsCreating(false);
  };

  const completeQuest = () => {
    if (!player || !player.quest.isCompleted) return;
    const currentQuest = QUESTS.find(q => q.id === player.quest.questId);
    if (!currentQuest) return;

    setPlayer(prev => {
      if (!prev) return null;
      const nextQuestId = prev.quest.questId + 1;
      const nextStage = prev.stage + (nextQuestId % 2 === 0 ? 1 : 0); // Advance stage every 2 quests
      return {
        ...prev,
        zen: prev.zen + currentQuest.rewardZen,
        team: prev.team.map(h => ({ ...h, exp: h.exp + currentQuest.rewardExp })),
        quest: { questId: nextQuestId, currentCount: 0, isCompleted: false },
        stage: Math.min(nextStage, STAGES.length)
      };
    });
    setLogs(prev => [L.SYSTEM.QUEST_COMPLETE(currentQuest.title), ...prev.slice(0, 4)]);
  };

  const upgradePassiveSkill = (skillId: string) => {
    setPlayer(prev => {
      if (!prev) return null;
      const newTeam = [...prev.team];
      const hero = { ...newTeam[selectedHeroIndex] };
      const skillIndex = hero.passiveSkills.findIndex(s => s.id === skillId);
      
      if (skillIndex === -1) return prev;
      const skill = { ...hero.passiveSkills[skillIndex] };
      
      if (skill.level >= skill.maxLevel) {
        setLogs(prevLogs => [L.SYSTEM.SKILL_MAX_LEVEL, ...prevLogs.slice(0, 4)]);
        return prev;
      }
      
      const cost = (skill.level + 1) * GAME_CONFIG.PASSIVE_SKILL_UPGRADE_COST_MULT;
      if (hero.statPoints < cost) {
        setLogs(prevLogs => [L.SYSTEM.SKILL_NO_POINTS, ...prevLogs.slice(0, 4)]);
        return prev;
      }
      
      hero.statPoints -= cost;
      skill.level += 1;
      hero.passiveSkills[skillIndex] = skill;
      newTeam[selectedHeroIndex] = hero;
      
      setLogs(prevLogs => [L.SYSTEM.SKILL_UPGRADED(skill.name, skill.level), ...prevLogs.slice(0, 4)]);
      return { ...prev, team: newTeam };
    });
  };

  const equipItem = (item: Item) => {
    setPlayer(prev => {
      if (!prev) return null;
      const newTeam = [...prev.team];
      const hero = { ...newTeam[selectedHeroIndex] };
      
      if (item.slot === 'none') return prev;
      const slot = item.slot as keyof Equipment;

      // Remove from inventory
      const newInventory = prev.inventory.filter(i => i.id !== item.id);
      
      // If already equipped, return old item to inventory
      const oldItem = hero.equipment[slot];
      if (oldItem) {
        newInventory.push(oldItem);
      }
      
      // Equip new item
      hero.equipment[slot] = item;
      newTeam[selectedHeroIndex] = hero;
      
      setLogs(prev => [L.SYSTEM.EQUIP_SUCCESS(item.name), ...prev.slice(0, 4)]);
      return { ...prev, team: newTeam, inventory: newInventory };
    });
  };

  const buyItem = (item: any, currency: 'zen' | 'diamond') => {
    setPlayer(p => {
      if (!p) return null;
      const cost = currency === 'zen' ? item.zenPrice : item.diamondPrice;
      if (p[currency] < cost) {
        setLogs(prev => [L.SYSTEM.LACK_CURRENCY(currency === 'zen' ? L.UI.ZEN : L.UI.DIAMOND), ...prev.slice(0, 4)]);
        return p;
      }
      
      const newItem: Item = {
        id: generateId(),
        ...item,
        level: 0,
        stats: item.stats || { str: 5, agi: 5, vit: 5, ene: 5 }
      };

      setLogs(prev => [L.SYSTEM.BUY_SUCCESS(item.name), ...prev.slice(0, 4)]);
      return { 
        ...p, 
        [currency]: p[currency] - cost,
        inventory: [...p.inventory, newItem]
      };
    });
  };
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < GAME_CONFIG.WORLD_BOSS_SPAWN_CHANCE && !worldBossActive) {
        const boss = WORLD_BOSSES[Math.floor(Math.random() * WORLD_BOSSES.length)];
        setWorldBossActive(boss);
        setLogs(prev => [L.SYSTEM.WORLD_BOSS_APPEARED(boss.name), ...prev.slice(0, 4)]);
      }
      
      if (Math.random() < GAME_CONFIG.DROP_RATE_EVENT_CHANCE) {
        increaseDropRate();
        setTimeout(() => {
          setPlayer(prev => prev ? ({ ...prev, dropRateMultiplier: 1.0 }) : null);
          setLogs(prev => [L.SYSTEM.DROP_RATE_NORMAL, ...prev.slice(0, 4)]);
        }, GAME_CONFIG.DROP_RATE_EVENT_DURATION);
      }
    }, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [worldBossActive]);

  const handleStatIncrease = (stat: keyof Hero['stats']) => {
    setPlayer(prev => {
      if (!prev) return null;
      const newTeam = [...prev.team];
      const hero = { ...newTeam[selectedHeroIndex] };
      if (hero.statPoints > 0) {
        hero.stats[stat]++;
        hero.statPoints--;
        
        if (stat === 'vit') {
          hero.maxHp = hero.stats.vit * GAME_CONFIG.HP_PER_VIT;
          hero.hp = hero.maxHp;
        }

        newTeam[selectedHeroIndex] = hero;
        return { ...prev, team: newTeam };
      }
      return prev;
    });
  };

  const useFruit = () => {
    setPlayer(p => {
      if (!p) return null;
      const newInventory = [...p.inventory];
      const fruitIdx = newInventory.findIndex(i => i.name === L.ITEMS.JEWELS['Ngọc Sáng Tạo'].name);
      
      if (fruitIdx === -1) {
        setLogs(prev => [L.SYSTEM.FRUIT_NO_MATERIAL, ...prev.slice(0, 4)]);
        return p;
      }

      newInventory.splice(fruitIdx, 1);
      const newTeam = [...p.team];
      const hero = { ...newTeam[selectedHeroIndex] };
      
      const stats: (keyof Hero['stats'])[] = ['str', 'agi', 'vit', 'ene'];
      const randomStat = stats[Math.floor(Math.random() * stats.length)];
      hero.stats[randomStat] += GAME_CONFIG.FRUIT_STAT_BONUS;
      
      if (randomStat === 'vit') {
        hero.maxHp = hero.stats.vit * GAME_CONFIG.HP_PER_VIT;
        hero.hp = hero.maxHp;
      }
      
      newTeam[selectedHeroIndex] = hero;
      setLogs(prev => [L.SYSTEM.FRUIT_SUCCESS(hero.class, GAME_CONFIG.FRUIT_STAT_BONUS, L.UI.STATS[randomStat.toUpperCase() as keyof typeof L.UI.STATS]), ...prev.slice(0, 4)]);
      return { ...p, inventory: newInventory, team: newTeam };
    });
  };

  const createWings = () => {
    setPlayer(p => {
      if (!p) return null;
      const newInventory = [...p.inventory];
      const chaosIdx = newInventory.findIndex(i => i.name === L.ITEMS.JEWELS['Ngọc Hỗn Nguyên'].name);
      
      if (chaosIdx === -1) {
        setLogs(prev => [L.SYSTEM.WING_NO_MATERIAL, ...prev.slice(0, 4)]);
        return p;
      }

      const zenCost = GAME_CONFIG.WING_CREATE_ZEN_COST;
      if (p.zen < zenCost) {
        setLogs(prev => [L.SYSTEM.WING_NO_ZEN, ...prev.slice(0, 4)]);
        return p;
      }

      const hero = p.team[selectedHeroIndex];
      const availableWings = WINGS[hero.class];
      const currentWings = hero.equipment.wings;
      const nextTier = currentWings ? (currentWings as any).tier + 1 : 1;
      const wingData = availableWings.find(w => w.tier === nextTier);

      if (!wingData) {
        setLogs(prev => [L.SYSTEM.WING_MAX_TIER, ...prev.slice(0, 4)]);
        return p;
      }

      newInventory.splice(chaosIdx, 1);
      
      // 50% success rate
      if (Math.random() < GAME_CONFIG.WING_CREATE_SUCCESS_RATE) {
        const wing: Item = {
          id: generateId(),
          name: wingData.name,
          type: 'wings',
          rarity: 'Excellent',
          level: 0,
          slot: 'wings',
          stats: { atkPower: nextTier * 50, defense: nextTier * 30, critChance: nextTier * 2 },
          description: `Cánh bậc ${nextTier} của ${hero.class}.`,
          image: wingData.image,
          excellentOptions: ['Tăng sát thương +10%']
        };

        newInventory.push(wing);
        setLogs(prev => [L.SYSTEM.WING_SUCCESS(wing.name), ...prev.slice(0, 4)]);
        return { ...p, inventory: newInventory, zen: p.zen - zenCost };
      } else {
        setLogs(prev => [L.SYSTEM.WING_FAILURE, ...prev.slice(0, 4)]);
        return { ...p, inventory: newInventory, zen: p.zen - zenCost };
      }
    });
  };

  const handleRebirth = (heroIndex: number) => {
    if (!player) return;
    const hero = player.team[heroIndex];
    const req = REBIRTH_REQUIREMENTS[hero.rebirth] || REBIRTH_REQUIREMENTS[REBIRTH_REQUIREMENTS.length - 1];

    if (hero.level < req.level) {
      setLogs(prev => [L.SYSTEM.REBIRTH_LEVEL_LOW(req.level), ...prev.slice(0, 4)]);
      return;
    }
    if (player.zen < req.zen || player.diamond < req.diamond) {
      setLogs(prev => [L.SYSTEM.REBIRTH_NO_CURRENCY, ...prev.slice(0, 4)]);
      return;
    }

    setPlayer(prev => {
      if (!prev) return null;
      const newTeam = [...prev.team];
      newTeam[heroIndex] = {
        ...newTeam[heroIndex],
        level: 1,
        rebirth: newTeam[heroIndex].rebirth + 1,
        exp: 0,
        maxExp: GAME_CONFIG.INITIAL_MAX_EXP,
        statPoints: newTeam[heroIndex].statPoints + GAME_CONFIG.REBIRTH_STAT_POINTS_BONUS, // Bonus points
        hp: newTeam[heroIndex].maxHp,
      };
      return {
        ...prev,
        zen: prev.zen - req.zen,
        diamond: prev.diamond - req.diamond,
        team: newTeam
      };
    });
    setLogs(prev => [L.SYSTEM.REBIRTH_SUCCESS(hero.class), ...prev.slice(0, 4)]);
  };

  const handleAddHero = (charClass: CharacterClass) => {
    setPlayer(prev => {
      if (!prev || prev.team.length >= prev.unlockedSlots) return prev;
      const baseStats = CLASSES_DATA[charClass].baseStats;
      const newHero: Hero = {
        id: generateId(),
        class: charClass,
        level: 1,
        rebirth: 0,
        exp: 0,
        maxExp: GAME_CONFIG.INITIAL_MAX_EXP,
        hp: baseStats.vit * GAME_CONFIG.HP_PER_VIT,
        maxHp: baseStats.vit * GAME_CONFIG.HP_PER_VIT,
        stats: { ...baseStats },
        statPoints: 0,
        equipment: { weapon: null, armor: null, helm: null, pants: null, boots: null, gloves: null, wings: null },
        skills: [...CLASSES_DATA[charClass].skills],
        passiveSkills: [...CLASSES_DATA[charClass].passiveSkills]
      };
      setIsCreating(false);
      setLogs(prev => [L.SYSTEM.ADD_HERO_SUCCESS(charClass), ...prev.slice(0, 4)]);
      return { ...prev, team: [...prev.team, newHero] };
    });
  };

  const increaseDropRate = () => {
    setPlayer(prev => {
      if (!prev) return null;
      const newMultiplier = +(prev.dropRateMultiplier + GAME_CONFIG.DROP_RATE_INCREMENT).toFixed(1);
      setLogs(prevLogs => [L.SYSTEM.DROP_RATE_EVENT(newMultiplier), ...prevLogs.slice(0, 4)]);
      return { ...prev, dropRateMultiplier: newMultiplier };
    });
  };

  const handleUnequip = (heroIndex: number, slot: keyof Equipment) => {
    setPlayer(prev => {
      if (!prev) return null;
      const newTeam = [...prev.team];
      const item = newTeam[heroIndex].equipment[slot];
      if (!item) return prev;

      newTeam[heroIndex] = {
        ...newTeam[heroIndex],
        equipment: {
          ...newTeam[heroIndex].equipment,
          [slot]: null
        }
      };

      setLogs(prev => [L.SYSTEM.UNEQUIP_SUCCESS(item.name), ...prev.slice(0, 4)]);
      return {
        ...prev,
        team: newTeam,
        inventory: [...prev.inventory, item]
      };
    });
  };

  const handleEnhance = (item: Item) => {
    if (item.level >= GAME_CONFIG.ENHANCE_MAX_LEVEL) {
      setLogs(prev => [L.SYSTEM.ENHANCE_MAX_LEVEL, ...prev.slice(0, 4)]);
      return;
    }

    setPlayer(prev => {
      if (!prev) return null;
      const jewelName = item.level < 6 ? L.ITEMS.JEWELS['Ngọc Ước Nguyện'].name : L.ITEMS.JEWELS['Ngọc Tâm Linh'].name;
      const jewel = prev.inventory.find(i => i.name === jewelName);
      const zenCost = (item.level + 1) * GAME_CONFIG.ENHANCE_ZEN_COST_MULT;

      if (!jewel) {
        setLogs(prevLogs => [L.SYSTEM.ENHANCE_NO_MATERIAL(jewelName), ...prevLogs.slice(0, 4)]);
        return prev;
      }
      if (prev.zen < zenCost) {
        setLogs(prevLogs => [L.SYSTEM.ENHANCE_NO_ZEN, ...prevLogs.slice(0, 4)]);
        return prev;
      }
      
      const successRate = Math.max(GAME_CONFIG.ENHANCE_SUCCESS_BASE_RATE - item.level * GAME_CONFIG.ENHANCE_SUCCESS_LEVEL_PENALTY, GAME_CONFIG.ENHANCE_MIN_SUCCESS_RATE);
      const isSuccess = Math.random() * 100 < successRate;
      const isDestroyed = !isSuccess && item.level >= 6 && Math.random() > (1 - GAME_CONFIG.ENHANCE_DESTROY_CHANCE);

      const newInventory = [...prev.inventory];
      const jewelIdx = newInventory.findIndex(i => i.id === jewel.id);
      newInventory.splice(jewelIdx, 1);

      let newTeam = [...prev.team];

      if (isSuccess) {
        const newItem = { ...item, level: item.level + 1 };
        
        // Update in inventory
        const invIdx = newInventory.findIndex(i => i.id === item.id);
        if (invIdx !== -1) newInventory[invIdx] = newItem;

        // Update in team equipment
        newTeam = prev.team.map(h => {
          const newEquip = { ...h.equipment };
          let changed = false;
          Object.keys(newEquip).forEach(slot => {
            if (newEquip[slot as keyof Equipment]?.id === item.id) {
              newEquip[slot as keyof Equipment] = newItem;
              changed = true;
            }
          });
          return changed ? { ...h, equipment: newEquip } : h;
        });

        setLogs(prevLogs => [L.SYSTEM.ENHANCE_SUCCESS(item.name, newItem.level), ...prevLogs.slice(0, 4)]);
        return { ...prev, inventory: newInventory, team: newTeam, zen: prev.zen - zenCost };
      } else if (isDestroyed) {
        // Remove from inventory
        const invIdx = newInventory.findIndex(i => i.id === item.id);
        if (invIdx !== -1) newInventory.splice(invIdx, 1);

        // Remove from team equipment
        newTeam = prev.team.map(h => {
          const newEquip = { ...h.equipment };
          let changed = false;
          Object.keys(newEquip).forEach(slot => {
            if (newEquip[slot as keyof Equipment]?.id === item.id) {
              newEquip[slot as keyof Equipment] = null;
              changed = true;
            }
          });
          return changed ? { ...h, equipment: newEquip } : h;
        });

        setLogs(prevLogs => [L.SYSTEM.ENHANCE_DESTROYED(item.name), ...prevLogs.slice(0, 4)]);
        return { ...prev, inventory: newInventory, team: newTeam, zen: prev.zen - zenCost };
      } else {
        // Level might drop or stay same
        const newLevel = Math.max(0, item.level - 1);
        const newItem = { ...item, level: newLevel };

        // Update in inventory
        const invIdx = newInventory.findIndex(i => i.id === item.id);
        if (invIdx !== -1) newInventory[invIdx] = newItem;

        // Update in team equipment
        newTeam = prev.team.map(h => {
          const newEquip = { ...h.equipment };
          let changed = false;
          Object.keys(newEquip).forEach(slot => {
            if (newEquip[slot as keyof Equipment]?.id === item.id) {
              newEquip[slot as keyof Equipment] = newItem;
              changed = true;
            }
          });
          return changed ? { ...h, equipment: newEquip } : h;
        });

        setLogs(prevLogs => [L.SYSTEM.ENHANCE_FAILURE(item.name, newLevel), ...prevLogs.slice(0, 4)]);
        return { ...prev, inventory: newInventory, team: newTeam, zen: prev.zen - zenCost };
      }
    });
  };

  const handleOptionEnhance = (item: Item) => {
    if ((item.optionLevel || 0) >= GAME_CONFIG.OPTION_ENHANCE_MAX_LEVEL) {
      setLogs(prev => [L.SYSTEM.OPTION_MAX_LEVEL, ...prev.slice(0, 4)]);
      return;
    }

    setPlayer(prev => {
      if (!prev) return null;
      const jewelName = L.ITEMS.JEWELS['Ngọc Sinh Mệnh'].name;
      const jewel = prev.inventory.find(i => i.name === jewelName);
      const zenCost = ((item.optionLevel || 0) + 1) * GAME_CONFIG.OPTION_ENHANCE_ZEN_COST_MULT;

      if (!jewel) {
        setLogs(prevLogs => [L.SYSTEM.OPTION_NO_MATERIAL(jewelName), ...prevLogs.slice(0, 4)]);
        return prev;
      }
      if (prev.zen < zenCost) {
        setLogs(prevLogs => [L.SYSTEM.OPTION_NO_ZEN, ...prevLogs.slice(0, 4)]);
        return prev;
      }

      const isSuccess = Math.random() * 100 < GAME_CONFIG.OPTION_ENHANCE_SUCCESS_RATE;

      const newInventory = [...prev.inventory];
      const jewelIdx = newInventory.findIndex(i => i.id === jewel.id);
      newInventory.splice(jewelIdx, 1);

      let newTeam = [...prev.team];

      if (isSuccess) {
        const newOptionLevel = (item.optionLevel || 0) + 1;
        const newItem = { ...item, optionLevel: newOptionLevel };
        
        // Update in inventory
        const invIdx = newInventory.findIndex(i => i.id === item.id);
        if (invIdx !== -1) newInventory[invIdx] = newItem;

        // Update in team equipment
        newTeam = prev.team.map(h => {
          const newEquip = { ...h.equipment };
          let changed = false;
          Object.keys(newEquip).forEach(slot => {
            if (newEquip[slot as keyof Equipment]?.id === item.id) {
              newEquip[slot as keyof Equipment] = newItem;
              changed = true;
            }
          });
          return changed ? { ...h, equipment: newEquip } : h;
        });

        setLogs(prevLogs => [L.SYSTEM.OPTION_SUCCESS(item.name, newOptionLevel * 4), ...prevLogs.slice(0, 4)]);
        return { ...prev, inventory: newInventory, team: newTeam, zen: prev.zen - zenCost };
      } else {
        setLogs(prevLogs => [L.SYSTEM.OPTION_FAILURE(item.name), ...prevLogs.slice(0, 4)]);
        return { ...prev, inventory: newInventory, zen: prev.zen - zenCost };
      }
    });
  };

  const toggleLockItem = (itemId: string) => {
    setPlayer(prev => {
      if (!prev) return null;
      const newInventory = prev.inventory.map(i => i.id === itemId ? { ...i, isLocked: !i.isLocked } : i);
      const newTeam = prev.team.map(h => {
        const newEquip = { ...h.equipment };
        let changed = false;
        Object.keys(newEquip).forEach(slot => {
          const item = newEquip[slot as keyof Equipment];
          if (item?.id === itemId) {
            newEquip[slot as keyof Equipment] = { ...item, isLocked: !item.isLocked };
            changed = true;
          }
        });
        return changed ? { ...h, equipment: newEquip } : h;
      });

      const item = prev.inventory.find(i => i.id === itemId) || 
                   prev.team.flatMap(h => Object.values(h.equipment)).find(i => i?.id === itemId);
      
      if (item) {
        setLogs(prevLogs => [item.isLocked ? L.SYSTEM.ITEM_UNLOCKED(item.name) : L.SYSTEM.ITEM_LOCKED_LOG(item.name), ...prevLogs.slice(0, 4)]);
      }

      return { ...prev, inventory: newInventory, team: newTeam };
    });
  };

  const sellItem = (item: Item) => {
    if (item.isLocked) {
      setLogs(prev => [L.SYSTEM.ITEM_LOCKED(item.name), ...prev.slice(0, 4)]);
      return;
    }
    setPlayer(prev => {
      if (!prev) return null;
      const zenGain = item.rarity === 'Excellent' ? GAME_CONFIG.SELL_ZEN_EXCELLENT : GAME_CONFIG.SELL_ZEN_NORMAL;
      return {
        ...prev,
        zen: prev.zen + zenGain,
        inventory: prev.inventory.filter(i => i.id !== item.id)
      };
    });
    const zenGainStr = item.rarity === 'Excellent' ? formatNumber(GAME_CONFIG.SELL_ZEN_EXCELLENT) : formatNumber(GAME_CONFIG.SELL_ZEN_NORMAL);
    setLogs(prev => [L.SYSTEM.SELL_SUCCESS(item.name, zenGainStr), ...prev.slice(0, 4)]);
  };

  const sellAllNormal = () => {
    setPlayer(prev => {
      if (!prev) return null;
      const normalItems = prev.inventory.filter(i => (i.rarity === 'Normal' || i.rarity === 'Common') && !i.isLocked && i.type !== 'material');
      if (normalItems.length === 0) {
        setLogs(prevLogs => [L.SYSTEM.SELL_ALL_NO_ITEMS, ...prevLogs.slice(0, 4)]);
        return prev;
      }
      const zenGain = normalItems.length * GAME_CONFIG.SELL_ZEN_NORMAL;
      const newInventory = prev.inventory.filter(i => !normalItems.find(ni => ni.id === i.id));
      setLogs(prevLogs => [L.SYSTEM.SELL_ALL_SUCCESS(normalItems.length, formatNumber(zenGain)), ...prevLogs.slice(0, 4)]);
      return { ...prev, zen: prev.zen + zenGain, inventory: newInventory };
    });
  };

  if (isCreating) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-zinc-900 border-2 border-amber-500/50 rounded-xl p-8 shadow-2xl shadow-amber-500/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-amber-500 tracking-tighter mb-2">{L.UI.GAME_TITLE}</h1>
            <p className="text-zinc-400 text-sm italic">{L.UI.GAME_SUBTITLE}</p>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-amber-500 text-xs font-bold uppercase tracking-widest mb-2">{L.UI.TEAM_NAME}</label>
              <input 
                type="text" 
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full bg-black border border-zinc-700 rounded-lg p-4 text-white focus:border-amber-500 outline-none transition-all"
                placeholder={L.UI.ENTER_NAME}
              />
            </div>
            <button 
              onClick={handleCreateTeam}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-400 text-black font-black py-4 rounded-lg hover:scale-105 transition-transform active:scale-95"
            >
              {L.UI.START_JOURNEY}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!player) return null;

  const currentHero = player.team[selectedHeroIndex];
  const currentQuest = QUESTS.find(q => q.id === player.quest.questId);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col max-w-md mx-auto relative overflow-hidden font-sans border-x border-zinc-800">
      
      {/* --- Top Bar --- */}
      <div className="bg-gradient-to-b from-zinc-800 to-black border-b border-amber-500/30 p-3 z-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-zinc-700 border border-amber-500 flex items-center justify-center overflow-hidden">
              <User size={24} className="text-amber-500" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-500 uppercase leading-none">{player.name}</div>
              <div className="text-[10px] text-zinc-400">VIP 0</div>
            </div>
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-black/50 border border-amber-500/20 rounded-full h-6 flex items-center px-3 relative overflow-hidden">
              <div className="text-[10px] font-black text-amber-400 z-10 w-full text-center">
                Lực chiến: {formatNumber(player.power)}
              </div>
              <motion.div 
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-amber-600 to-amber-400 opacity-30"
                animate={{ width: '100%' }}
              />
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-[10px] text-amber-400">
              <Crown size={10} /> {formatNumber(player.zen)}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-blue-400">
              <Zap size={10} /> {formatNumber(player.diamond)}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-green-400">
              <Trophy size={10} /> Drop: x{player.dropRateMultiplier.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        
        {activeTab === 'battle' && (
          <div className="flex-1 relative bg-cover bg-center transition-all duration-1000" style={{ backgroundImage: `url(${STAGES[player.stage-1]?.bg})` }}>
            <div className="absolute inset-0 bg-black/40" />
            
            {/* Stage Info */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 border border-amber-500/40 px-6 py-1 rounded-full z-10 flex items-center gap-4">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
                {STAGES[player.stage-1]?.name} - Stage {player.stage}
              </span>
              <button 
                onClick={() => setActiveTab('map')}
                className="bg-amber-500 text-black text-[8px] font-black px-2 py-0.5 rounded uppercase"
              >
                Bản đồ
              </button>
            </div>

            {/* Auto Battle Toggle */}
            <div className="absolute top-16 left-2 z-20 flex flex-col gap-2">
              <button 
                onClick={() => setIsAutoBattle(!isAutoBattle)}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all shadow-lg ${isAutoBattle ? 'bg-amber-500 border-amber-400 text-black animate-pulse' : 'bg-zinc-900 border-zinc-700 text-zinc-500'}`}
              >
                <div className="flex flex-col items-center">
                  <Zap size={16} fill={isAutoBattle ? "currentColor" : "none"} />
                  <span className="text-[8px] font-black uppercase leading-none mt-0.5">{isAutoBattle ? 'Auto' : 'Off'}</span>
                </div>
              </button>

              <button 
                onClick={increaseDropRate}
                className="w-12 h-12 rounded-full bg-green-600 border-2 border-green-400 text-white flex items-center justify-center transition-all shadow-lg hover:scale-110 active:scale-90"
                title="Tăng tỷ lệ rơi đồ (Sự kiện)"
              >
                <div className="flex flex-col items-center">
                  <Trophy size={16} />
                  <span className="text-[8px] font-black uppercase leading-none mt-0.5">+Drop</span>
                </div>
              </button>
            </div>

            {/* Quest Tracker */}
            <div className="absolute top-16 right-2 z-20 w-32">
              {currentQuest && (
                <motion.div 
                  onClick={completeQuest}
                  className={`p-2 rounded-lg border text-[10px] cursor-pointer transition-all ${player.quest.isCompleted ? 'bg-amber-500/20 border-amber-500 animate-pulse' : 'bg-black/60 border-zinc-700'}`}
                >
                  <div className="font-bold text-amber-500 mb-1 uppercase">Nhiệm vụ</div>
                  <div className="text-white leading-tight mb-1">{currentQuest.title}</div>
                  <div className="text-zinc-400">
                    {currentQuest.targetMonster}: {player.quest.currentCount}/{currentQuest.targetCount}
                  </div>
                  {player.quest.isCompleted && (
                    <div className="mt-1 text-amber-400 font-bold text-center">NHẬN THƯỞNG</div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Battle Scene */}
            <div 
              className="absolute inset-0 flex items-center justify-center cursor-crosshair"
              onClick={() => !isAutoBattle && attack()}
            >
              <div className="flex gap-4 items-end mb-20">
                {player.team.map((hero, idx) => (
                  <motion.div 
                    key={hero.id}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: idx * 0.1 }}
                    className="relative"
                  >
                    <div className="w-16 h-24 bg-zinc-800/50 rounded-lg border-2 border-blue-500/30 flex items-center justify-center text-3xl">
                      {hero.class === 'Dark Knight' ? '⚔️' : hero.class === 'Dark Wizard' ? '🧙' : '🏹'}
                      {/* Skill Effect Overlay */}
                      <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 2, delay: idx * 0.5 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      >
                        <span className="text-2xl">{hero.skills[0]?.effect}</span>
                      </motion.div>
                    </div>
                    <div className="absolute -top-6 left-0 right-0">
                      <div className="h-1 bg-black rounded-full overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: `${(hero.hp / hero.maxHp) * 100}%` }} />
                      </div>
                      <div className="text-[8px] text-center mt-0.5">Lv.{hero.level}</div>
                    </div>
                    <motion.div 
                      animate={{ x: [-10, 10, -10] }}
                      transition={{ repeat: Infinity, duration: 0.2 }}
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/10 blur-sm rounded-full"
                    />
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col gap-4 ml-20">
                {isBossBattle && currentBoss ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 2 }}
                    animate={{ opacity: 1, scale: 1.5 }}
                    className="relative"
                  >
                    <div className="w-24 h-24 bg-purple-900/20 rounded-full border-2 border-purple-500 flex items-center justify-center text-6xl">
                      {currentBoss.image}
                    </div>
                    <div className="absolute -top-8 left-0 right-0">
                      <div className="h-2 bg-black rounded-full overflow-hidden border border-purple-500/50">
                        <div className="h-full bg-purple-600" style={{ width: `${(currentBoss.hp / currentBoss.maxHp) * 100}%` }} />
                      </div>
                      <div className="text-[10px] text-center mt-1 font-black text-purple-400 uppercase">{currentBoss.name}</div>
                    </div>
                  </motion.div>
                ) : (
                  <AnimatePresence>
                    {monsters.map((m: any) => (
                      <motion.div 
                        key={m.id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="relative"
                      >
                        <div className="w-14 h-14 bg-red-900/20 rounded-full border border-red-500/30 flex items-center justify-center text-2xl">
                          {m.image}
                        </div>
                        <div className="absolute -top-4 left-0 right-0">
                          <div className="h-1 bg-black rounded-full overflow-hidden">
                            <div className="h-full bg-red-600" style={{ width: `${(m.hp / m.maxHp) * 100}%` }} />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {damageTexts.map(dt => (
                <DamageText key={dt.id} {...dt} />
              ))}
            </div>

            {/* Chat Box */}
            <div className="absolute bottom-4 left-2 right-2 h-20 bg-black/40 border border-zinc-800 rounded p-2 overflow-hidden pointer-events-none">
              <div className="flex items-center gap-1 text-[10px] text-amber-500 mb-1">
                <MessageSquare size={10} /> <span>Thế giới</span>
              </div>
              <div className="space-y-0.5">
                {logs.map((log, i) => (
                  <div key={i} className="text-[9px] text-zinc-300 truncate">{log}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {activeTab === 'battle' && (
              <BattleTab 
                player={player}
                monsters={monsters}
                isBossBattle={isBossBattle}
                currentBoss={currentBoss}
                damageTexts={damageTexts}
                logs={logs}
                isAutoBattle={isAutoBattle}
                setIsAutoBattle={setIsAutoBattle}
                attack={attack}
                handleChallengeBoss={handleChallengeBoss}
                currentStage={STAGES.find(s => s.id === player?.stage) || STAGES[0]}
              />
            )}

            {activeTab === 'role' && (
              <RoleTab 
                player={player}
                selectedHeroIndex={selectedHeroIndex}
                setSelectedHeroIndex={setSelectedHeroIndex}
                handleAddHero={handleAddHero}
                handleStatIncrease={handleStatIncrease}
                useFruit={useFruit}
                handleRebirth={handleRebirth}
                handleUnequip={(slot) => handleUnequip(selectedHeroIndex, slot)}
                upgradePassiveSkill={upgradePassiveSkill}
              />
            )}

            {activeTab === 'bag' && (
              <BagTab 
                player={player}
                toggleLockItem={toggleLockItem}
                sellItem={sellItem}
                sellAllNormal={sellAllNormal}
                handleEquip={equipItem}
              />
            )}

            {activeTab === 'shop' && (
              <ShopTab 
                player={player}
                buyItem={buyItem}
              />
            )}

            {activeTab === 'forge' && (
              <ForgeTab 
                player={player}
                handleEnhance={handleEnhance}
                handleOptionEnhance={handleOptionEnhance}
                createWings={createWings}
              />
            )}

            {activeTab === 'map' && (
              <MapTab 
                player={player}
                currentStage={STAGES.find(s => s.id === player?.stage) || STAGES[0]}
                setCurrentStage={(stage) => setPlayer(p => p ? ({ ...p, stage: stage.id }) : null)}
                setLogs={setLogs}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'boss' && (
              <BossTab 
                player={player}
                worldBossActive={worldBossActive}
                handleChallengeBoss={handleChallengeBoss}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Item Acquisition Notifications */}
        <div className="absolute top-20 right-4 pointer-events-none z-50 flex flex-col gap-2 items-end">
          <AnimatePresence>
            {recentDrops.map(drop => (
              <motion.div
                key={drop.id}
                initial={{ opacity: 0, x: 50, scale: 0.5 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.8 }}
                className={`bg-black/80 backdrop-blur-md border ${drop.rarity === 'Excellent' ? 'border-green-500' : 'border-zinc-700'} p-2 rounded-lg flex items-center gap-3 shadow-xl`}
              >
                <div className="text-2xl">{drop.image}</div>
                <div className="pr-2">
                  <div className="text-[8px] text-zinc-400 uppercase font-bold">{L.UI.YOU_RECEIVED}</div>
                  <div className={`text-[10px] font-black ${drop.rarity === 'Excellent' ? 'text-green-400' : 'text-white'}`}>{drop.name}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* --- Bottom Navigation --- */}
      <div className="bg-zinc-900 border-t border-amber-500/30 grid grid-cols-7 h-16">
        {[
          { id: 'battle', label: L.UI.BATTLE, icon: Sword },
          { id: 'map', label: L.UI.MAP, icon: MapIcon },
          { id: 'role', label: L.UI.CHARACTER, icon: User },
          { id: 'bag', label: L.UI.BAG, icon: Backpack },
          { id: 'shop', label: L.UI.SHOP, icon: Coins },
          { id: 'forge', label: L.UI.FORGE, icon: Hammer },
          { id: 'boss', label: L.UI.BOSS, icon: Trophy },
        ].map(tab => (
          <motion.button
            whileTap={{ scale: 0.9 }}
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${activeTab === tab.id ? 'text-amber-500 bg-amber-500/5' : 'text-zinc-500'}`}
          >
            <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 1.5} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">{tab.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default App;
