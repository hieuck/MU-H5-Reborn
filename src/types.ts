export type CharacterClass = 'Dark Knight' | 'Dark Wizard' | 'Fairy Elf';

export interface Stats {
  str: number;
  agi: number;
  vit: number;
  ene: number;
}

export interface Skill {
  name: string;
  color: string;
  effect: string;
}

export interface PassiveSkill {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  statBonus: {
    critChance?: number;
    defense?: number;
    atkPower?: number;
    hpRegen?: number;
  };
}

export interface Equipment {
  weapon: Item | null;
  armor: Item | null;
  helm: Item | null;
  pants: Item | null;
  boots: Item | null;
  gloves: Item | null;
  wings: Item | null;
}

export interface Hero {
  id: string;
  class: CharacterClass;
  level: number;
  rebirth: number;
  exp: number;
  maxExp: number;
  hp: number;
  maxHp: number;
  stats: Stats;
  statPoints: number;
  equipment: Equipment;
  skills: Skill[];
  passiveSkills: PassiveSkill[];
}

export interface QuestProgress {
  questId: number;
  currentCount: number;
  isCompleted: boolean;
}

export interface Player {
  name: string;
  team: Hero[];
  zen: number;
  diamond: number;
  power: number;
  inventory: Item[];
  unlockedSlots: number;
  stage: number;
  quest: QuestProgress;
  dropRateMultiplier: number;
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'helm' | 'pants' | 'boots' | 'gloves' | 'wings' | 'ring' | 'material';
  rarity: 'Common' | 'Excellent' | 'Ancient' | 'Normal';
  level: number;
  slot: keyof Equipment | 'ring' | 'none';
  stats: { str?: number; agi?: number; vit?: number; ene?: number; zenBonus?: number; expBonus?: number; atkPower?: number; defense?: number; critChance?: number; hpRegen?: number };
  excellentOptions?: string[];
  optionLevel?: number;
  isLocked?: boolean;
  description: string;
  image?: string;
  value?: number;
}

export interface Monster {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  atk: number;
  expReward: number;
  zenReward: number;
  image: string;
}
