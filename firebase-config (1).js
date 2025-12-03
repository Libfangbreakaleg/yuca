// firebase-config.js
// Firebase配置和初始化

// 注意：在实际部署中，请将Firebase配置放在安全的地方
// 这里使用您提供的配置

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, get, update, remove, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCwDlSDJwLgTleetPH5iCfEH01JiPyCRoQ",
    authDomain: "my-game-6273c.firebaseapp.com",
    databaseURL: "https://my-game-6273c-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "my-game-6273c",
    storageBucket: "my-game-6273c.firebasestorage.app",
    messagingSenderId: "407172408466",
    appId: "1:407172408466:web:c7dbed948732b91d1db24b",
    measurementId: "G-RFHNTER82D"
};

// 初始化Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// 匿名登录（用于简单的用户识别）
signInAnonymously(auth).catch((error) => {
    console.error("匿名登录失败:", error);
});

// 数据库引用
const dbRefs = {
    players: ref(database, 'players'),
    items: ref(database, 'items'),
    gameState: ref(database, 'gameState'),
    locations: ref(database, 'locations'),
    combatQueue: ref(database, 'combatQueue')
};

// 游戏道具数据库（60种道具）
const initialItems = [
    // 武器类
    { id: 'item_001', name: '玫瑰刺刀', type: 'weapon', strength: 20, dexterity: 5, rarity: 'rare', maxCount: 2, description: '锋利的刀身刻有玫瑰图案' },
    { id: 'item_002', name: '月光匕首', type: 'weapon', strength: 15, dexterity: 10, luck: 5, rarity: 'rare', maxCount: 2, description: '在月光下会发出微光' },
    { id: 'item_003', name: '花园剪刀', type: 'weapon', strength: 10, dexterity: 8, rarity: 'common', maxCount: 2, description: '修剪玫瑰的剪刀，异常锋利' },
    
    // 防具类
    { id: 'item_004', name: '荆棘护手', type: 'armor', strength: 5, healing: 3, rarity: 'uncommon', maxCount: 2, description: '由庄园荆棘编织而成' },
    { id: 'item_005', name: '古老披风', type: 'armor', dexterity: 8, luck: 3, rarity: 'uncommon', maxCount: 2, description: '沾有古老香气的披风' },
    
    // 饰品类
    { id: 'item_006', name: '玫瑰胸针', type: 'accessory', luck: 15, rarity: 'rare', maxCount: 2, description: '镶嵌着红宝石的玫瑰胸针' },
    { id: 'item_007', name: '幸运硬币', type: 'accessory', luck: 10, rarity: 'common', maxCount: 2, description: '一枚古老的幸运硬币' },
    
    // 治疗类
    { id: 'item_008', name: '治愈玫瑰', type: 'consumable', healing: 30, hpRestore: 50, rarity: 'uncommon', maxCount: 2, description: '具有治愈效果的神秘玫瑰' },
    { id: 'item_009', name: '安神香囊', type: 'consumable', sanRestore: 30, rarity: 'common', maxCount: 2, description: '散发安宁香气的香囊' },
    
    // 线索类
    { id: 'item_010', name: '泛黄日记', type: 'clue', rarity: 'rare', maxCount: 1, description: '记录庄园秘密的日记' },
    { id: 'item_011', name: '旧钥匙', type: 'clue', rarity: 'uncommon', maxCount: 2, description: '生锈的古老钥匙' },
    
    // 更多道具...
    // 实际游戏中应该有60种，这里只列出一部分作为示例
];

// 初始化数据库函数
async function initializeDatabase() {
    try {
        // 检查游戏状态是否存在
        const gameStateSnap = await get(dbRefs.gameState);
        if (!gameStateSnap.exists()) {
            // 初始化游戏状态
            await set(dbRefs.gameState, {
                currentDay: 1,
                lastReset: new Date().toISOString(),
                itemRefreshDay: 0,
                isActive: true
            });
            
            // 初始化道具
            await set(dbRefs.items, initialItems);
            
            // 初始化地点
            const locations = [
                { id: 'room', name: '独立院落', description: '你的私人空间', items: [] },
                { id: 'hotspring', name: '温泉', description: '放松身心的温泉', items: [] },
                { id: 'library', name: '图书室', description: '收藏古籍的图书室', items: [] },
                { id: 'gym', name: '健身房', description: '锻炼身体的场所', items: [] },
                { id: 'cafe', name: '咖啡馆', description: '香气四溢的咖啡馆', items: [] },
                { id: 'garden', name: '大花园', description: '种植各种玫瑰的花园', items: [] },
                { id: 'waterfall', name: '人造瀑布', description: '人工建造的瀑布', items: [] },
                { id: 'camp', name: '山顶野营地', description: '欣赏星空的好地方', items: [] }
            ];
            
            await set(dbRefs.locations, locations);
        }
        
        console.log('数据库初始化完成');
        return true;
    } catch (error) {
        console.error('数据库初始化失败:', error);
        return false;
    }
}

// 玩家数据操作
async function savePlayerData(playerId, data) {
    try {
        await set(ref(database, `players/${playerId}`), data);
        return true;
    } catch (error) {
        console.error('保存玩家数据失败:', error);
        return false;
    }
}

async function getPlayerData(playerId) {
    try {
        const snapshot = await get(ref(database, `players/${playerId}`));
        return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
        console.error('获取玩家数据失败:', error);
        return null;
    }
}

async function updatePlayerData(playerId, updates) {
    try {
        await update(ref(database, `players/${playerId}`), updates);
        return true;
    } catch (error) {
        console.error('更新玩家数据失败:', error);
        return false;
    }
}

// 道具数据操作
async function getAllItems() {
    try {
        const snapshot = await get(dbRefs.items);
        return snapshot.exists() ? snapshot.val() : [];
    } catch (error) {
        console.error('获取道具数据失败:', error);
        return [];
    }
}

// 地点数据操作
async function getLocationData(locationId) {
    try {
        const snapshot = await get(ref(database, `locations/${locationId}`));
        return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
        console.error('获取地点数据失败:', error);
        return null;
    }
}

// 实时监听
function listenToPlayers(callback) {
    onValue(dbRefs.players, (snapshot) => {
        callback(snapshot.val());
    });
}

// 导出函数和引用
export {
    database,
    auth,
    dbRefs,
    initializeDatabase,
    savePlayerData,
    getPlayerData,
    updatePlayerData,
    getAllItems,
    getLocationData,
    listenToPlayers
};