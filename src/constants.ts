import { CharacterClass, Item, Monster } from './types';
import { L } from './locales';
import { GAME_CONFIG } from './config/gameConfig';

export const CLASSES: Record<string, CharacterClass> = {
  DARK_KNIGHT: 'Dark Knight',
  DARK_WIZARD: 'Dark Wizard',
  FAIRY_ELF: 'Fairy Elf',
};

export const CLASSES_DATA: Record<CharacterClass, { description: string; baseStats: any; skills: any[]; passiveSkills: any[] }> = {
  'Dark Knight': {
    description: L.CLASSES['Dark Knight'].description,
    baseStats: { str: 28, agi: 20, vit: 25, ene: 10 },
    skills: [
      { name: L.CLASSES['Dark Knight'].skills['Đâm Gió'], color: '#fbbf24', effect: '🌪️' },
      { name: L.CLASSES['Dark Knight'].skills['Xoay Kiếm'], color: '#f87171', effect: '⚔️' },
      { name: L.CLASSES['Dark Knight'].skills['Địa Chấn'], color: '#b45309', effect: '💥' }
    ],
    passiveSkills: [
      { id: 'dk_p1', name: L.CLASSES['Dark Knight'].passiveSkills['dk_p1'].name, description: L.CLASSES['Dark Knight'].passiveSkills['dk_p1'].description, level: 0, maxLevel: 10, statBonus: { defense: 5 } },
      { id: 'dk_p2', name: L.CLASSES['Dark Knight'].passiveSkills['dk_p2'].name, description: L.CLASSES['Dark Knight'].passiveSkills['dk_p2'].description, level: 0, maxLevel: 10, statBonus: { critChance: 2 } }
    ]
  },
  'Dark Wizard': {
    description: L.CLASSES['Dark Wizard'].description,
    baseStats: { str: 15, agi: 18, vit: 15, ene: 30 },
    skills: [
      { name: L.CLASSES['Dark Wizard'].skills['Quay Rồng'], color: '#60a5fa', effect: '🐉' },
      { name: L.CLASSES['Dark Wizard'].skills['Mưa Băng'], color: '#38bdf8', effect: '❄️' },
      { name: L.CLASSES['Dark Wizard'].skills['Vòng Tròn Lửa'], color: '#ef4444', effect: '🔥' }
    ],
    passiveSkills: [
      { id: 'dw_p1', name: L.CLASSES['Dark Wizard'].passiveSkills['dw_p1'].name, description: L.CLASSES['Dark Wizard'].passiveSkills['dw_p1'].description, level: 0, maxLevel: 10, statBonus: { atkPower: 10 } },
      { id: 'dw_p2', name: L.CLASSES['Dark Wizard'].passiveSkills['dw_p2'].name, description: L.CLASSES['Dark Wizard'].passiveSkills['dw_p2'].description, level: 0, maxLevel: 10, statBonus: { hpRegen: 5 } }
    ]
  },
  'Fairy Elf': {
    description: L.CLASSES['Fairy Elf'].description,
    baseStats: { str: 22, agi: 25, vit: 20, ene: 15 },
    skills: [
      { name: L.CLASSES['Fairy Elf'].skills['Bắn Đa Mục Tiêu'], color: '#4ade80', effect: '🏹' },
      { name: L.CLASSES['Fairy Elf'].skills['Mũi Tên Băng'], color: '#2dd4bf', effect: '🧊' },
      { name: L.CLASSES['Fairy Elf'].skills['Liên Hoàn Tiễn'], color: '#10b981', effect: '💨' }
    ],
    passiveSkills: [
      { id: 'fe_p1', name: L.CLASSES['Fairy Elf'].passiveSkills['fe_p1'].name, description: L.CLASSES['Fairy Elf'].passiveSkills['fe_p1'].description, level: 0, maxLevel: 10, statBonus: { critChance: 3 } },
      { id: 'fe_p2', name: L.CLASSES['Fairy Elf'].passiveSkills['fe_p2'].name, description: L.CLASSES['Fairy Elf'].passiveSkills['fe_p2'].description, level: 0, maxLevel: 10, statBonus: { defense: 3, critChance: 1 } }
    ]
  }
};

export const QUESTS = [
  { id: 1, title: L.QUESTS['1'].title, description: L.QUESTS['1'].description, targetCount: 10, targetMonster: L.MONSTERS['Nhện Độc'], rewardZen: 500, rewardExp: 1000 },
  { id: 2, title: L.QUESTS['2'].title, description: L.QUESTS['2'].description, targetCount: 15, targetMonster: L.MONSTERS['Bò Cạp'], rewardZen: 1000, rewardExp: 3000 },
  { id: 3, title: L.QUESTS['3'].title, description: L.QUESTS['3'].description, targetCount: 20, targetMonster: L.MONSTERS['Lich'], rewardZen: 2000, rewardExp: 8000 },
  { id: 4, title: L.QUESTS['4'].title, description: L.QUESTS['4'].description, targetCount: 25, targetMonster: L.MONSTERS['Người Tuyết'], rewardZen: 5000, rewardExp: 20000 },
  { id: 5, title: L.QUESTS['5'].title, description: L.QUESTS['5'].description, targetCount: 30, targetMonster: L.MONSTERS['Yeti'], rewardZen: 8000, rewardExp: 45000 },
  { id: 6, title: L.QUESTS['6'].title, description: L.QUESTS['6'].description, targetCount: 35, targetMonster: L.MONSTERS['Bạch Long'], rewardZen: 12000, rewardExp: 80000 },
  { id: 7, title: L.QUESTS['7'].title, description: L.QUESTS['7'].description, targetCount: 40, targetMonster: L.MONSTERS['Ma Cà Rồng'], rewardZen: 20000, rewardExp: 150000 },
  { id: 8, title: L.QUESTS['8'].title, description: L.QUESTS['8'].description, targetCount: 45, targetMonster: L.MONSTERS['Gorgon'], rewardZen: 35000, rewardExp: 300000 },
];

export const ITEM_SETS: Record<string, any> = {
  'Dark Knight': [
    { name: L.ITEM_SETS['Bộ Da'], minLevel: 1, image: '🛡️' },
    { name: L.ITEM_SETS['Bộ Đồng'], minLevel: 20, image: '🛡️' },
    { name: L.ITEM_SETS['Bộ Thiết Bản'], minLevel: 50, image: '🛡️' },
    { name: L.ITEM_SETS['Bộ Rồng Đỏ'], minLevel: 100, image: '🛡️' },
    { name: L.ITEM_SETS['Bộ Rồng Xanh'], minLevel: 200, image: '🛡️' },
    { name: L.ITEM_SETS['Bộ Phượng Hoàng'], minLevel: 350, image: '🛡️' },
  ],
  'Dark Wizard': [
    { name: L.ITEM_SETS['Bộ Vải'], minLevel: 1, image: '🥋' },
    { name: L.ITEM_SETS['Bộ Xương'], minLevel: 20, image: '🥋' },
    { name: L.ITEM_SETS['Bộ Ánh Sáng'], minLevel: 50, image: '🥋' },
    { name: L.ITEM_SETS['Bộ Ma Thuật'], minLevel: 100, image: '🥋' },
    { name: L.ITEM_SETS['Bộ Triệu Hoán'], minLevel: 200, image: '🥋' },
    { name: L.ITEM_SETS['Bộ Thần Ma'], minLevel: 350, image: '🥋' },
  ],
  'Fairy Elf': [
    { name: L.ITEM_SETS['Bộ Lụa'], minLevel: 1, image: '👗' },
    { name: L.ITEM_SETS['Bộ Gió'], minLevel: 20, image: '👗' },
    { name: L.ITEM_SETS['Bộ Tinh Linh'], minLevel: 50, image: '👗' },
    { name: L.ITEM_SETS['Bộ Thánh Nữ'], minLevel: 100, image: '👗' },
    { name: L.ITEM_SETS['Bộ Kim Ngân'], minLevel: 200, image: '👗' },
    { name: L.ITEM_SETS['Bộ Nữ Thần'], minLevel: 350, image: '👗' },
  ]
};

export const WEAPONS: Record<string, any> = {
  'Dark Knight': [
    { name: L.WEAPONS['Kiếm Ngắn'], minLevel: 1, image: '🗡️' },
    { name: L.WEAPONS['Rìu Sắt'], minLevel: 20, image: '🪓' },
    { name: L.WEAPONS['Kiếm Điện'], minLevel: 50, image: '⚔️' },
    { name: L.WEAPONS['Kiếm Rồng'], minLevel: 150, image: '🔥' },
    { name: L.WEAPONS['Đao Quyền Năng'], minLevel: 300, image: '⚡' },
  ],
  'Dark Wizard': [
    { name: L.WEAPONS['Gậy Gỗ'], minLevel: 1, image: '🪄' },
    { name: L.WEAPONS['Gậy Thiên Sứ'], minLevel: 50, image: '✨' },
    { name: L.WEAPONS['Gậy Rồng'], minLevel: 150, image: '🐉' },
    { name: L.WEAPONS['Gậy Kundun'], minLevel: 300, image: '👑' },
  ],
  'Fairy Elf': [
    { name: L.WEAPONS['Cung Gỗ'], minLevel: 1, image: '🏹' },
    { name: L.WEAPONS['Cung Bạc'], minLevel: 50, image: '🏹' },
    { name: L.WEAPONS['Nỏ Rồng'], minLevel: 150, image: '🏹' },
    { name: L.WEAPONS['Cung Thánh Nữ'], minLevel: 300, image: '🏹' },
  ]
};

export const STAGES = [
  { id: 1, name: L.STAGES['Lorencia'], minLevel: 1, monsters: [L.MONSTERS['Nhện Độc'], L.MONSTERS['Bò Cạp'], L.MONSTERS['Lich']], bg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop', image: '🏰' },
  { id: 2, name: L.STAGES['Devias'], minLevel: 15, monsters: [L.MONSTERS['Người Tuyết'], L.MONSTERS['Yeti'], L.MONSTERS['Bạch Long']], bg: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?q=80&w=800&auto=format&fit=crop', image: '❄️' },
  { id: 3, name: L.STAGES['Dungeon'], minLevel: 30, monsters: [L.MONSTERS['Ma Cà Rồng'], L.MONSTERS['Quỷ Lùn'], L.MONSTERS['Gorgon']], bg: 'https://images.unsplash.com/photo-1505673539012-ee7507e84e9f?q=80&w=800&auto=format&fit=crop', image: '💀' },
  { id: 4, name: L.STAGES['Atlans'], minLevel: 50, monsters: [L.MONSTERS['Quái Vật Biển'], L.MONSTERS['Rồng Nước'], L.MONSTERS['Hydra']], bg: 'https://images.unsplash.com/photo-1518467166778-b88f373ffec7?q=80&w=800&auto=format&fit=crop', image: '🌊' },
  { id: 5, name: L.STAGES['Lost Tower'], minLevel: 80, monsters: [L.MONSTERS['Quỷ Lửa'], L.MONSTERS['Tử Thần'], L.MONSTERS['Balrog']], bg: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=800&auto=format&fit=crop', image: '🗼' },
  { id: 6, name: L.STAGES['Tarkan'], minLevel: 120, monsters: [L.MONSTERS['Bọ Cạp Cát'], L.MONSTERS['Quái Vật Đất'], L.MONSTERS['Zaikan']], bg: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=800&auto=format&fit=crop', image: '🏜️' },
  { id: 7, name: L.STAGES['Icarus'], minLevel: 180, monsters: [L.MONSTERS['Chim Ưng'], L.MONSTERS['Phượng Hoàng'], L.MONSTERS['Dark Phoenix']], bg: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop', image: '☁️' },
  { id: 8, name: L.STAGES['Kanturu'], minLevel: 250, monsters: [L.MONSTERS['Robot Chiến Đấu'], L.MONSTERS['Maya Hand'], L.MONSTERS['Nightmare']], bg: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop', image: '⚙️' },
  { id: 9, name: L.STAGES['Raklion'], minLevel: 350, monsters: [L.MONSTERS['Quái Vật Băng'], L.MONSTERS['Người Khổng Lồ'], L.MONSTERS['Selupan']], bg: 'https://images.unsplash.com/photo-1478719059408-592965723cbc?q=80&w=800&auto=format&fit=crop', image: '🏔️' },
  { id: 10, name: L.STAGES['Swamp of Calmness'], minLevel: 450, monsters: [L.MONSTERS['Quái Vật Đầm Lầy'], L.MONSTERS['Medusa']], bg: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop', image: '🐊' },
];

export const MONSTERS: Monster[] = [
  { name: L.MONSTERS['Nhện Độc'], level: 1, hp: 120, maxHp: 120, atk: 10, expReward: 25, zenReward: 15, image: '🕷️' },
  { name: L.MONSTERS['Bò Cạp'], level: 5, hp: 400, maxHp: 400, atk: 22, expReward: 60, zenReward: 30, image: '🦂' },
  { name: L.MONSTERS['Lich'], level: 10, hp: 1000, maxHp: 1000, atk: 45, expReward: 180, zenReward: 80, image: '💀' },
  { name: L.MONSTERS['Người Tuyết'], level: 15, hp: 2000, maxHp: 2000, atk: 70, expReward: 400, zenReward: 150, image: '⛄' },
  { name: L.MONSTERS['Yeti'], level: 20, hp: 3500, maxHp: 3500, atk: 110, expReward: 800, zenReward: 250, image: '🦍' },
  { name: L.MONSTERS['Bạch Long'], level: 25, hp: 6000, maxHp: 6000, atk: 180, expReward: 1500, zenReward: 500, image: '🐉' },
  { name: L.MONSTERS['Ma Cà Rồng'], level: 30, hp: 10000, maxHp: 10000, atk: 280, expReward: 3000, zenReward: 1000, image: '🧛' },
  { name: L.MONSTERS['Quỷ Lùn'], level: 35, hp: 15000, maxHp: 15000, atk: 400, expReward: 5000, zenReward: 1800, image: '👺' },
  { name: L.MONSTERS['Gorgon'], level: 40, hp: 25000, maxHp: 25000, atk: 600, expReward: 10000, zenReward: 3500, image: '🐍' },
  { name: L.MONSTERS['Quái Vật Biển'], level: 50, hp: 50000, maxHp: 50000, atk: 1000, expReward: 25000, zenReward: 8000, image: '🐙' },
  { name: L.MONSTERS['Rồng Nước'], level: 60, hp: 80000, maxHp: 80000, atk: 1500, expReward: 50000, zenReward: 15000, image: '🐲' },
  { name: L.MONSTERS['Hydra'], level: 70, hp: 150000, maxHp: 150000, atk: 2500, expReward: 100000, zenReward: 30000, image: '🐉' },
  { name: L.MONSTERS['Quỷ Lửa'], level: 80, hp: 250000, maxHp: 250000, atk: 4000, expReward: 200000, zenReward: 50000, image: '🔥' },
  { name: L.MONSTERS['Tử Thần'], level: 90, hp: 400000, maxHp: 400000, atk: 6000, expReward: 350000, zenReward: 80000, image: '👻' },
  { name: L.MONSTERS['Balrog'], level: 100, hp: 800000, maxHp: 800000, atk: 10000, expReward: 600000, zenReward: 150000, image: '👹' },
  { name: L.MONSTERS['Bọ Cạp Cát'], level: 120, hp: 1500000, maxHp: 1500000, atk: 15000, expReward: 1000000, zenReward: 250000, image: '🦂' },
  { name: L.MONSTERS['Quái Vật Đất'], level: 140, hp: 2500000, maxHp: 2500000, atk: 22000, expReward: 1800000, zenReward: 400000, image: '🗿' },
  { name: L.MONSTERS['Zaikan'], level: 160, hp: 4000000, maxHp: 4000000, atk: 35000, expReward: 3000000, zenReward: 700000, image: '🦁' },
  { name: L.MONSTERS['Chim Ưng'], level: 180, hp: 6000000, maxHp: 6000000, atk: 50000, expReward: 5000000, zenReward: 1000000, image: '🦅' },
  { name: L.MONSTERS['Phượng Hoàng'], level: 200, hp: 10000000, maxHp: 10000000, atk: 80000, expReward: 8000000, zenReward: 2000000, image: '🔥' },
  { name: L.MONSTERS['Dark Phoenix'], level: 250, hp: 20000000, maxHp: 20000000, atk: 150000, expReward: 15000000, zenReward: 5000000, image: '🐦' },
];

export const WORLD_BOSSES = [
  { id: 'b1', name: L.WORLD_BOSSES['Quỷ Vương Balrog'], level: 80, hp: 5000000, maxHp: 5000000, atk: 8000, rewardZen: 500000, rewardDiamond: 100, image: '👹', rarity: 'Excellent' },
  { id: 'b2', name: L.WORLD_BOSSES['Rồng Lửa Icarus'], level: 150, hp: 20000000, maxHp: 20000000, atk: 25000, rewardZen: 2000000, rewardDiamond: 500, image: '🐲', rarity: 'Excellent' },
  { id: 'b3', name: L.WORLD_BOSSES['Chúa Tể Kundun'], level: 300, hp: 100000000, maxHp: 100000000, atk: 100000, rewardZen: 10000000, rewardDiamond: 2000, image: '👑', rarity: 'Excellent' },
  { id: 'b4', name: L.WORLD_BOSSES['Selupan'], level: 400, hp: 500000000, maxHp: 500000000, atk: 300000, rewardZen: 50000000, rewardDiamond: 5000, image: '🕷️', rarity: 'Excellent' },
];

export const JEWELS = [
  { id: 'j1', name: L.ITEMS.JEWELS['Ngọc Ước Nguyện'].name, type: 'material', rarity: 'Excellent', description: L.ITEMS.JEWELS['Ngọc Ước Nguyện'].description, image: '💎', level: 0, slot: 'none', stats: {} },
  { id: 'j2', name: L.ITEMS.JEWELS['Ngọc Tâm Linh'].name, type: 'material', rarity: 'Excellent', description: L.ITEMS.JEWELS['Ngọc Tâm Linh'].description, image: '🔮', level: 0, slot: 'none', stats: {} },
  { id: 'j3', name: L.ITEMS.JEWELS['Ngọc Sinh Mệnh'].name, type: 'material', rarity: 'Excellent', description: L.ITEMS.JEWELS['Ngọc Sinh Mệnh'].description, image: '🧪', level: 0, slot: 'none', stats: {} },
  { id: 'j4', name: L.ITEMS.JEWELS['Ngọc Hỗn Nguyên'].name, type: 'material', rarity: 'Excellent', description: L.ITEMS.JEWELS['Ngọc Hỗn Nguyên'].description, image: '🌀', level: 0, slot: 'none', stats: {} },
  { id: 'j5', name: L.ITEMS.JEWELS['Ngọc Sáng Tạo'].name, type: 'material', rarity: 'Excellent', description: L.ITEMS.JEWELS['Ngọc Sáng Tạo'].description, image: '✨', level: 0, slot: 'none', stats: {} },
];

export const EXCELLENT_OPTIONS = [
  { name: L.EXCELLENT_OPTIONS.CRIT_CHANCE, bonus: { critChance: 10 } },
  { name: L.EXCELLENT_OPTIONS.ATK_POWER, bonus: { atkPower: 5 } },
  { name: L.EXCELLENT_OPTIONS.DEFENSE, bonus: { defense: 5 } },
  { name: L.EXCELLENT_OPTIONS.HP_REGEN, bonus: { hpRegen: 2 } },
  { name: L.EXCELLENT_OPTIONS.ZEN_BONUS, bonus: { zenBonus: 40 } },
  { name: L.EXCELLENT_OPTIONS.EXP_BONUS, bonus: { expBonus: 10 } },
];

export const WINGS = {
  'Dark Knight': [
    { name: L.WINGS['Cánh Thiên Sứ (DK)'], minLevel: 100, image: '🦋', tier: 1 },
    { name: L.WINGS['Cánh Rồng'], minLevel: 200, image: '🐉', tier: 2 },
    { name: L.WINGS['Cánh Phượng Hoàng'], minLevel: 350, image: '🔥', tier: 3 },
  ],
  'Dark Wizard': [
    { name: L.WINGS['Cánh Thiên Sứ (DW)'], minLevel: 100, image: '🦋', tier: 1 },
    { name: L.WINGS['Cánh Linh Hồn'], minLevel: 200, image: '✨', tier: 2 },
    { name: L.WINGS['Cánh Thần Ma'], minLevel: 350, image: '🌌', tier: 3 },
  ],
  'Fairy Elf': [
    { name: L.WINGS['Cánh Thiên Sứ (FE)'], minLevel: 100, image: '🦋', tier: 1 },
    { name: L.WINGS['Cánh Tinh Linh'], minLevel: 200, image: '🧚', tier: 2 },
    { name: L.WINGS['Cánh Nữ Thần'], minLevel: 350, image: '🌸', tier: 3 },
  ]
};

export const REBIRTH_REQUIREMENTS = [
  { level: GAME_CONFIG.REBIRTH_LEVEL_REQ, zen: GAME_CONFIG.REBIRTH_ZEN_BASE, diamond: GAME_CONFIG.REBIRTH_DIAMOND_BASE },
  { level: GAME_CONFIG.REBIRTH_LEVEL_REQ, zen: GAME_CONFIG.REBIRTH_ZEN_BASE * 5, diamond: GAME_CONFIG.REBIRTH_DIAMOND_BASE * 5 },
  { level: GAME_CONFIG.REBIRTH_LEVEL_REQ, zen: GAME_CONFIG.REBIRTH_ZEN_BASE * 20, diamond: GAME_CONFIG.REBIRTH_DIAMOND_BASE * 10 },
];

export const SHOP_ITEMS = [
  { ...JEWELS[0], zenPrice: GAME_CONFIG.JEWEL_BLESS_ZEN, diamondPrice: GAME_CONFIG.JEWEL_DIAMOND_PRICE },
  { ...JEWELS[1], zenPrice: GAME_CONFIG.JEWEL_SOUL_ZEN, diamondPrice: GAME_CONFIG.JEWEL_DIAMOND_PRICE },
  { ...JEWELS[3], zenPrice: GAME_CONFIG.JEWEL_CHAOS_ZEN, diamondPrice: GAME_CONFIG.JEWEL_DIAMOND_PRICE },
  { ...JEWELS[4], zenPrice: GAME_CONFIG.JEWEL_CREATION_ZEN, diamondPrice: GAME_CONFIG.JEWEL_DIAMOND_PRICE },
  { name: L.ITEMS.JEWELS['Ngọc Sinh Mệnh'].name, type: 'material', rarity: 'Excellent', image: '🧪', zenPrice: GAME_CONFIG.JEWEL_LIFE_ZEN, diamondPrice: GAME_CONFIG.JEWEL_LIFE_DIAMOND, description: L.ITEMS.JEWELS['Ngọc Sinh Mệnh'].description },
  { name: L.ITEMS.SHOP['Bình Máu Lớn'].name, type: 'material', rarity: 'Normal', image: '🧪', zenPrice: GAME_CONFIG.HP_POTION_ZEN, diamondPrice: GAME_CONFIG.HP_POTION_DIAMOND, description: L.ITEMS.SHOP['Bình Máu Lớn'].description },
  { name: L.ITEMS.SHOP['Vé Boss Thế Giới'].name, type: 'material', rarity: 'Excellent', image: '🎫', zenPrice: GAME_CONFIG.BOSS_TICKET_ZEN, diamondPrice: GAME_CONFIG.BOSS_TICKET_DIAMOND, description: L.ITEMS.SHOP['Vé Boss Thế Giới'].description },
];
