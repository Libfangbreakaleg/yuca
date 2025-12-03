{
  "gameState": {
    "currentDay": 1,
    "lastResetTime": "2024-...",
    "nextResetTime": "2024-..."
  },
  "players": {
    "player_001": {
      "name": "蓝精灵",
      "currentHealth": 85,
      "maxHealth": 100,
      "currentSanity": 70,
      "maxSanity": 100,
      "strength": 15,
      "agility": 12,
      "healingPower": 8,
      "luck": 5,
      "actionPoints": 10,
      "inventory": {
        "item_knife_001": { "id": "item_knife_001", "name": "锋利的猎刀", "strengthBonus": 20 },
        "item_herb_003": { "id": "item_herb_003", "name": "宁神草药", "sanityBonus": 15 }
      },
      "isAlive": true,
      "lastLogin": "2024-..."
    }
  },
  "locations": {
    "main_map": {
      "name": "玫瑰庄园主地图",
      "type": "2d",
      "backgroundImage": "url_to_your_map_image.jpg"
    },
    "room_101": {
      "name": "101号房间",
      "type": "3d",
      "items": {
        // 道具ID及其位置信息 (由Three.js坐标决定)
        "item_key_001": { "x": 10, "y": 0, "z": -5, "pickedUpBy": null }
      },
      "clues": ["桌角有奇怪的磕损痕迹", "壁炉里似乎有没烧完的纸"]
    },
    "garden": {
      "name": "静谧花园",
      "type": "3d",
      "items": {
        "item_flower_002": { "x": -3, "y": 0.5, "z": 8, "pickedUpBy": "player_002" }
      }
    }
  },
  "globalItems": {
    "item_knife_001": { "name": "锋利的刀", "type": "weapon", "strengthBonus": 20, "maxStack": 2 },
    "item_herb_003": { "name": "宁神草药", "type": "consumable", "sanityBonus": 15, "maxStack": 5 }
  },
  "combatRequests": {
    "combat_001": {
      "fromPlayerId": "player_001",
      "toPlayerId": "player_002",
      "status": "pending", // pending, accepted, finished
      "turn": "player_001"
    }
  }
}