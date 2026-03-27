import { Hero, Item, Equipment, CharacterClass } from '../types';
import { EXCELLENT_OPTIONS } from '../constants';
import { L } from '../locales';

export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Calculates the total power score of a hero based on stats, level, rebirth, and equipment.
 */
export const calculatePower = (hero: Hero): number => {
  const stats = hero.stats;
  let equipPower = 0;
  let setPieces = 0;
  
  Object.values(hero.equipment).forEach(item => {
    if (item) {
      equipPower += (item.level + 1) * 100;
      if (item.rarity === 'Excellent') equipPower += 500;
      if (item.name.includes(L.UI.SET_PREFIX || 'Bộ')) setPieces++;
      
      if (item.excellentOptions) {
        equipPower += item.excellentOptions.length * 200;
      }
      
      if (item.optionLevel) {
        equipPower += item.optionLevel * 300;
      }
      
      const extraStats = item.stats as any;
      if (extraStats.atkPower) equipPower += extraStats.atkPower * 5;
      if (extraStats.defense) equipPower += extraStats.defense * 5;
      if (extraStats.critChance) equipPower += extraStats.critChance * 50;
    }
  });

  const basePower = (stats.str + stats.agi + stats.vit + stats.ene) * 10;
  const levelPower = hero.level * 50;
  const rebirthPower = hero.rebirth * 5000;
  const setBonus = setPieces >= 5 ? 5000 : 0;
  
  return basePower + levelPower + rebirthPower + equipPower + setBonus;
};

/**
 * Calculates total combat stats including equipment and passive bonuses.
 */
export const getHeroTotalStats = (hero: Hero) => {
  let totalAtk = hero.stats.str * 2 + hero.level * 5;
  let totalDef = hero.stats.agi * 1.5 + hero.level * 2;
  let totalCrit = 8;
  let totalHpRegen = 0;

  Object.values(hero.equipment).forEach(item => {
    if (item) {
      totalAtk += (item.stats.atkPower || 0) + (item.level * 10) + ((item.optionLevel || 0) * 4);
      totalDef += (item.stats.defense || 0) + (item.level * 5) + ((item.optionLevel || 0) * 4);
      totalCrit += (item.stats.critChance || 0);
      totalHpRegen += (item.stats.hpRegen || 0);
      
      if (item.excellentOptions?.includes(L.EXCELLENT_OPTIONS.ATK_POWER)) totalAtk *= 1.1;
      if (item.excellentOptions?.includes(L.EXCELLENT_OPTIONS.DEFENSE)) totalDef *= 1.05;
      if (item.excellentOptions?.includes(L.EXCELLENT_OPTIONS.CRIT_CHANCE)) totalCrit += 10;
    }
  });

  hero.passiveSkills.forEach(p => {
    totalAtk += (p.statBonus.atkPower || 0) * p.level;
    totalDef += (p.statBonus.defense || 0) * p.level;
    totalCrit += (p.statBonus.critChance || 0) * p.level;
    totalHpRegen += (p.statBonus.hpRegen || 0) * p.level;
  });

  return { 
    totalAtk: Math.floor(totalAtk), 
    totalDef: Math.floor(totalDef), 
    totalCrit: Math.floor(totalCrit), 
    totalHpRegen: Math.floor(totalHpRegen) 
  };
};

/**
 * Formats large numbers into readable strings (K, M).
 */
export const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

/**
 * Generates an excellent item with random options.
 */
export const generateExcellentItem = (baseItem: any, itemClass: CharacterClass, slot: keyof Equipment): Item => {
  const numOptions = Math.floor(Math.random() * 2) + 1;
  const options: string[] = [];
  const availableOptions = [...EXCELLENT_OPTIONS];
  
  for (let i = 0; i < numOptions; i++) {
    const idx = Math.floor(Math.random() * availableOptions.length);
    options.push(availableOptions[idx].name);
    availableOptions.splice(idx, 1);
  }

  return {
    ...baseItem,
    id: generateId(),
    rarity: 'Excellent',
    level: 0,
    optionLevel: 0,
    isLocked: false,
    excellentOptions: options,
    slot
  };
};
