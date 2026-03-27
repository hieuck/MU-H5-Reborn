import React, { useCallback } from 'react';
import { Hero, Item, Equipment, CharacterClass } from '../types';
import { JEWELS } from '../constants';

interface InventoryProps {
  player: any;
  setPlayer: React.Dispatch<React.SetStateAction<any>>;
  setLogs: React.Dispatch<React.SetStateAction<string[]>>;
}

/**
 * Custom hook to manage inventory operations like selling, locking, and enhancing.
 */
export const useInventory = ({ player, setPlayer, setLogs }: InventoryProps) => {

  const toggleLockItem = useCallback((item: Item) => {
    setPlayer((prev: any) => {
      if (!prev) return null;
      const newInventory = prev.inventory.map((i: Item) => 
        i.id === item.id ? { ...i, isLocked: !i.isLocked } : i
      );
      return { ...prev, inventory: newInventory };
    });
  }, [setPlayer]);

  const sellItem = useCallback((item: Item) => {
    if (item.isLocked) {
      setLogs((prev: string[]) => ["[Hệ thống] Không thể bán vật phẩm đang khóa!", ...prev.slice(0, 4)]);
      return;
    }
    setPlayer((prev: any) => {
      if (!prev) return null;
      const newInventory = prev.inventory.filter((i: Item) => i.id !== item.id);
      const zenGain = item.rarity === 'Excellent' ? 10000 : 1000;
      return { ...prev, inventory: newInventory, zen: prev.zen + zenGain };
    });
    setLogs((prev: string[]) => [`[Hệ thống] Đã bán ${item.name} nhận được Zen.`, ...prev.slice(0, 4)]);
  }, [setPlayer, setLogs]);

  const sellAllNormal = useCallback(() => {
    setPlayer((prev: any) => {
      if (!prev) return null;
      let zenGain = 0;
      const newInventory = prev.inventory.filter((i: Item) => {
        if (i.rarity === 'Normal' && !i.isLocked) {
          zenGain += 1000;
          return false;
        }
        return true;
      });
      setLogs((pl: string[]) => [`[Hệ thống] Đã bán tất cả vật phẩm thường, nhận được ${zenGain} Zen.`, ...pl.slice(0, 4)]);
      return { ...prev, inventory: newInventory, zen: prev.zen + zenGain };
    });
  }, [setPlayer, setLogs]);

  const handleEnhance = useCallback((item: Item) => {
    if (!player) return;
    const jewelName = item.level < 6 ? 'Ngọc Ước Nguyện' : 'Ngọc Tâm Hồn';
    const jewelIdx = player.inventory.findIndex((i: Item) => i.name === jewelName);
    
    if (jewelIdx === -1) {
      setLogs((prev: string[]) => [`[Hệ thống] Thiếu ${jewelName}!`, ...prev.slice(0, 4)]);
      return;
    }

    const cost = (item.level + 1) * 5000;
    if (player.zen < cost) {
      setLogs((prev: string[]) => ["[Hệ thống] Không đủ Zen!", ...prev.slice(0, 4)]);
      return;
    }

    setPlayer((prev: any) => {
      if (!prev) return null;
      const newInventory = [...prev.inventory];
      newInventory.splice(jewelIdx, 1);
      
      const successRate = item.level < 6 ? 1.0 : Math.max(0.1, 0.7 - (item.level - 6) * 0.1);
      const isSuccess = Math.random() < successRate;

      const updateItemInState = (oldItem: Item, newItem: Item) => {
        // Check if item is in inventory
        const invIdx = prev.inventory.findIndex((i: Item) => i.id === oldItem.id);
        if (invIdx !== -1) {
          const updatedInv = [...newInventory];
          const itemInInvIdx = updatedInv.findIndex((i: Item) => i.id === oldItem.id);
          if (itemInInvIdx !== -1) updatedInv[itemInInvIdx] = newItem;
          return { ...prev, inventory: updatedInv, zen: prev.zen - cost };
        }
        
        // Check if item is equipped
        const newTeam = prev.team.map((hero: Hero) => {
          const newEquip = { ...hero.equipment };
          let found = false;
          Object.entries(newEquip).forEach(([slot, eqItem]) => {
            if (eqItem && eqItem.id === oldItem.id) {
              newEquip[slot as keyof typeof newEquip] = newItem;
              found = true;
            }
          });
          return found ? { ...hero, equipment: newEquip } : hero;
        });
        
        return { ...prev, team: newTeam, inventory: newInventory, zen: prev.zen - cost };
      };

      if (isSuccess) {
        const updatedItem = { ...item, level: item.level + 1 };
        setLogs((pl: string[]) => [`[Cường hóa] Thành công! ${item.name} đạt +${updatedItem.level}`, ...pl.slice(0, 4)]);
        return updateItemInState(item, updatedItem);
      } else {
        const updatedItem = { ...item, level: Math.max(0, item.level - 1) };
        setLogs((pl: string[]) => [`[Cường hóa] Thất bại! ${item.name} bị giảm cấp.`, ...pl.slice(0, 4)]);
        return updateItemInState(item, updatedItem);
      }
    });
  }, [player, setPlayer, setLogs]);

  const handleOptionEnhance = useCallback((item: Item) => {
    if (!player) return;
    const jewelIdx = player.inventory.findIndex((i: Item) => i.name === 'Ngọc Sinh Mệnh');
    
    if (jewelIdx === -1) {
      setLogs((prev: string[]) => ["[Hệ thống] Thiếu Ngọc Sinh Mệnh!", ...prev.slice(0, 4)]);
      return;
    }

    const cost = ((item.optionLevel || 0) + 1) * 10000;
    if (player.zen < cost) {
      setLogs((prev: string[]) => ["[Hệ thống] Không đủ Zen!", ...prev.slice(0, 4)]);
      return;
    }

    setPlayer((prev: any) => {
      if (!prev) return null;
      const newInventory = [...prev.inventory];
      newInventory.splice(jewelIdx, 1);
      
      const isSuccess = Math.random() < 0.5;

      const updateItemInState = (oldItem: Item, newItem: Item) => {
        // Check if item is in inventory
        const invIdx = prev.inventory.findIndex((i: Item) => i.id === oldItem.id);
        if (invIdx !== -1) {
          const updatedInv = [...newInventory];
          const itemInInvIdx = updatedInv.findIndex((i: Item) => i.id === oldItem.id);
          if (itemInInvIdx !== -1) updatedInv[itemInInvIdx] = newItem;
          return { ...prev, inventory: updatedInv, zen: prev.zen - cost };
        }
        
        // Check if item is equipped
        const newTeam = prev.team.map((hero: Hero) => {
          const newEquip = { ...hero.equipment };
          let found = false;
          Object.entries(newEquip).forEach(([slot, eqItem]) => {
            if (eqItem && eqItem.id === oldItem.id) {
              newEquip[slot as keyof typeof newEquip] = newItem;
              found = true;
            }
          });
          return found ? { ...hero, equipment: newEquip } : hero;
        });
        
        return { ...prev, team: newTeam, inventory: newInventory, zen: prev.zen - cost };
      };

      if (isSuccess) {
        const updatedItem = { ...item, optionLevel: (item.optionLevel || 0) + 1 };
        setLogs((pl: string[]) => [`[Gia cường] Thành công! ${item.name} đạt Op +${updatedItem.optionLevel}`, ...pl.slice(0, 4)]);
        return updateItemInState(item, updatedItem);
      } else {
        setLogs((pl: string[]) => [`[Gia cường] Thất bại! ${item.name} không thay đổi.`, ...pl.slice(0, 4)]);
        return updateItemInState(item, item); // Just consume jewel and zen
      }
    });
  }, [player, setPlayer, setLogs]);

  return { toggleLockItem, sellItem, sellAllNormal, handleEnhance, handleOptionEnhance };
};
