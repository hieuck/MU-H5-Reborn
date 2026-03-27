import React, { useEffect, useCallback, useRef } from 'react';
import React, { useEffect, useCallback, useRef } from 'react';
import { Hero, Monster, Item, CharacterClass, Equipment } from '../types';
import { MONSTERS, ITEM_SETS, CLASSES } from '../constants';
import { getHeroTotalStats, generateExcellentItem, generateId } from '../utils/gameUtils';
import { L } from '../locales';
import { GAME_CONFIG } from '../config/gameConfig';

interface GameLoopProps {
  player: any;
  setPlayer: React.Dispatch<React.SetStateAction<any>>;
  monsters: Monster[];
  setMonsters: React.Dispatch<React.SetStateAction<Monster[]>>;
  isBossBattle: boolean;
  setIsBossBattle: React.Dispatch<React.SetStateAction<boolean>>;
  currentBoss: any;
  setCurrentBoss: React.Dispatch<React.SetStateAction<any>>;
  setLogs: React.Dispatch<React.SetStateAction<string[]>>;
  setDamageTexts: React.Dispatch<React.SetStateAction<any[]>>;
  isAutoBattle: boolean;
  currentStage: any;
}

/**
 * Custom hook to manage the core game loop (combat, monster spawning, regeneration).
 */
export const useGameLoop = ({
  player,
  setPlayer,
  monsters,
  setMonsters,
  isBossBattle,
  setIsBossBattle,
  currentBoss,
  setCurrentBoss,
  setLogs,
  setDamageTexts,
  isAutoBattle,
  currentStage,
}: GameLoopProps) => {

  const attack = useCallback(() => {
    if (!player || (monsters.length === 0 && !isBossBattle)) return;

    setPlayer((prev: any) => {
      if (!prev) return null;
      let newPlayer = { ...prev };
      let newMonsters = [...monsters];
      
      newPlayer.team.forEach((hero: Hero) => {
        if (hero.hp <= 0) {
          hero.hp = hero.maxHp;
          return;
        }

        const { totalAtk, totalCrit } = getHeroTotalStats(hero);

        if (isBossBattle && currentBoss) {
          const isCrit = Math.random() * 100 < totalCrit;
          const isExe = Math.random() > 0.95;
          let damage = totalAtk;
          if (isCrit) damage *= GAME_CONFIG.CRIT_DAMAGE_MULT;
          if (isExe) damage *= GAME_CONFIG.EXE_DAMAGE_MULT;
          damage = Math.floor(damage * (0.9 + Math.random() * 0.2));

          setCurrentBoss((prevBoss: any) => {
            if (!prevBoss) return null;
            const updatedBoss = { ...prevBoss, hp: prevBoss.hp - damage };
            if (updatedBoss.hp <= 0) {
              setLogs((prevLogs: string[]) => [L.SYSTEM.BOSS_DEFEATED(updatedBoss.name), ...prevLogs.slice(0, GAME_CONFIG.MAX_LOGS)]);
              setPlayer((p: any) => {
                const updatedPlayer = { ...p };
                updatedPlayer.zen += updatedBoss.level * GAME_CONFIG.BOSS_ZEN_REWARD_MULT;
                updatedPlayer.diamond += GAME_CONFIG.BOSS_DIAMOND_REWARD;

                const bossDropChance = GAME_CONFIG.BOSS_DROP_CHANCE * (updatedPlayer.dropRateMultiplier || 1);
                if (Math.random() < bossDropChance) {
                  const classes: CharacterClass[] = Object.values(CLASSES);
                  const randomClass = classes[Math.floor(Math.random() * classes.length)];
                  const sets = ITEM_SETS[randomClass];
                  const availableItems = sets.filter((i: any) => i.minLevel <= updatedBoss.level + 50);
                  const baseItem = availableItems[availableItems.length - 1] || sets[0];
                  const item = generateExcellentItem(baseItem, randomClass, 'armor');
                  updatedPlayer.inventory.push(item);
                  setLogs((pl: string[]) => [L.SYSTEM.ITEM_RECEIVED(item.name), ...pl.slice(0, GAME_CONFIG.MAX_LOGS)]);
                }
                return updatedPlayer;
              });
              setIsBossBattle(false);
              return null;
            }
            return updatedBoss;
          });

          setDamageTexts((prev: any[]) => [...prev, {
            id: generateId(),
            x: 150 + (Math.random() * 100),
            y: 150 + (Math.random() * 100),
            value: damage,
            type: isExe ? 'exe' : (isCrit ? 'crit' : 'normal')
          }].slice(-GAME_CONFIG.MAX_DAMAGE_TEXTS));

        } else if (newMonsters.length > 0) {
          const targetIndex = Math.floor(Math.random() * newMonsters.length);
          const target = newMonsters[targetIndex];
          
          const isCrit = Math.random() * 100 < totalCrit;
          const isExe = Math.random() > 0.95;
          let damage = totalAtk;
          if (isCrit) damage *= GAME_CONFIG.CRIT_DAMAGE_MULT;
          if (isExe) damage *= GAME_CONFIG.EXE_DAMAGE_MULT;
          damage = Math.floor(damage * (0.9 + Math.random() * 0.2));

          target.hp -= damage;
          setDamageTexts((prev: any[]) => [...prev, {
            id: generateId(),
            x: 150 + (Math.random() * 100),
            y: 200 + (Math.random() * 100),
            value: damage,
            type: isExe ? 'exe' : (isCrit ? 'crit' : 'normal')
          }].slice(-GAME_CONFIG.MAX_DAMAGE_TEXTS));

          if (target.hp <= 0) {
            newMonsters.splice(targetIndex, 1);
            newPlayer.zen += target.level * 10;
            newPlayer.team.forEach((h: Hero) => {
              h.exp += target.level * 5;
              if (h.exp >= h.maxExp) {
                h.level++;
                h.exp = 0;
                h.maxExp = Math.floor(h.maxExp * GAME_CONFIG.LEVEL_UP_EXP_MULT);
                h.statPoints += GAME_CONFIG.STAT_POINTS_PER_LEVEL;
                h.hp = h.maxHp;
                setLogs((pl: string[]) => [L.SYSTEM.LEVEL_UP(h.class, h.level), ...pl.slice(0, GAME_CONFIG.MAX_LOGS)]);
              }
            });

            const dropChance = GAME_CONFIG.BASE_DROP_CHANCE * (newPlayer.dropRateMultiplier || 1);
            if (Math.random() < dropChance) {
              const classes: CharacterClass[] = Object.values(CLASSES);
              const randomClass = classes[Math.floor(Math.random() * classes.length)];
              const sets = ITEM_SETS[randomClass];
              const availableItems = sets.filter((i: any) => i.minLevel <= target.level + 20);
              const baseItem = availableItems[availableItems.length - 1] || sets[0];
              const newItem = { ...baseItem, id: generateId(), level: 0, optionLevel: 0, isLocked: false };
              newPlayer.inventory.push(newItem);
              setLogs((pl: string[]) => [L.SYSTEM.ITEM_RECEIVED(newItem.name), ...pl.slice(0, GAME_CONFIG.MAX_LOGS)]);
            }
          }
        }
      });

      setMonsters(newMonsters);
      return newPlayer;
    });
  }, [player, monsters, isBossBattle, currentBoss, setIsBossBattle, setCurrentBoss, setLogs, setDamageTexts, setMonsters, setPlayer]);

  useEffect(() => {
    const spawnMonsters = () => {
      if (monsters.length < 3 && !isBossBattle) {
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
      
      setPlayer((prev: any) => {
        if (!prev) return null;
        let hasChanges = false;
        const newTeam = prev.team.map((hero: Hero) => {
          const { totalHpRegen } = getHeroTotalStats(hero);
          if (totalHpRegen > 0 && hero.hp < hero.maxHp && hero.hp > 0) {
            hasChanges = true;
            return { ...hero, hp: Math.min(hero.maxHp, hero.hp + totalHpRegen) };
          }
          return hero;
        });
        if (hasChanges) return { ...prev, team: newTeam };
        return prev;
      });
    }, GAME_CONFIG.BATTLE_INTERVAL);

    return () => clearInterval(interval);
  }, [player, monsters, isAutoBattle, isBossBattle, currentStage, attack, setPlayer, setMonsters]);

  return { attack };
};
