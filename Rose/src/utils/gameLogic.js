import { ITEMS } from './items';

// 生成随机道具分布
export const generateRandomItems = () => {
  const items = [];
  const usedIds = new Set();
  
  // 每种道具最多2个
  const itemCounts = {};
  
  while (items.length < 60) {
    const randomItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    
    // 计算当前该道具的数量
    if (!itemCounts[randomItem.name]) {
      itemCounts[randomItem.name] = 0;
    }
    
    // 如果该道具数量少于2个，则添加
    if (itemCounts[randomItem.name] < 2) {
      const itemCopy = { 
        ...randomItem, 
        id: `${randomItem.id}_${Date.now()}_${items.length}`,
        location: getRandomLocation()
      };
      items.push(itemCopy);
      itemCounts[randomItem.name]++;
    }
  }
  
  return items;
};

// 获取随机地点
const getRandomLocation = () => {
  const locations = ['独立院落', '温泉', '图书室', '健身房', '咖啡馆', '大花园', '人造瀑布', '山顶野营地'];
  return locations[Math.floor(Math.random() * locations.length)];
};

// 搜索地点结果
export const calculateSearchResult = (playerLuck, locationType) => {
  const baseChance = 0.4; // 40%基础概率
  const luckBonus = playerLuck * 0.02; // 每1幸运增加2%概率
  const chance = Math.min(baseChance + luckBonus, 0.8); // 最大80%
  
  const roll = Math.random();
  
  if (roll < chance * 0.2) {
    // 20%概率获得道具
    const randomItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    return { 
      type: 'item', 
      item: { ...randomItem, id: `${randomItem.id}_${Date.now()}` },
      message: `恭喜！你找到了：${randomItem.name}`
    };
  } else if (roll < chance * 0.5) {
    // 30%概率获得线索
    const clues = [
      '你发现了一些奇怪的痕迹',
      '这里似乎发生过什么',
      '你感觉到一股寒意',
      '墙上有奇怪的符号',
      '你闻到了特别的气味'
    ];
    return { 
      type: 'clue', 
      value: clues[Math.floor(Math.random() * clues.length)],
      message: `你发现了线索：${clues[Math.floor(Math.random() * clues.length)]}`
    };
  } else if (roll < chance) {
    // 30%概率扣除SAN值
    const damage = Math.floor(Math.random() * 15) + 5;
    return { 
      type: 'damage', 
      value: damage,
      message: `你受到了惊吓！SAN值减少了${damage}点`
    };
  } else {
    // 20%概率无事发生
    return { 
      type: 'nothing', 
      message: '这里什么都没有找到' 
    };
  }
};

// 计算战斗伤害
export const calculateBattleDamage = (attacker, defender) => {
  const baseDamage = attacker.power * 0.8;
  const agilityBonus = attacker.agility * 0.4;
  const randomFactor = Math.random() * 30;
  const defense = defender.agility * 0.3;
  
  const damage = Math.max(5, 
    Math.floor(baseDamage + agilityBonus + randomFactor - defense)
  );
  
  const isCritical = randomFactor > 25;
  
  return {
    damage: isCritical ? damage * 1.5 : damage,
    critical: isCritical,
    message: isCritical ? '暴击！' : ''
  };
};