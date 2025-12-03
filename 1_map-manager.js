// map-manager.js
// 2D地图、地点切换逻辑

import { getLocationData } from './firebase-config.js';

class MapManager {
    constructor() {
        this.currentLocation = 'map';
        this.locations = {
            'room': {
                name: '独立院落',
                description: '配备两个房间一个花园，房间内有独立卫浴',
                objects: ['床', '桌子', '衣柜', '浴室', '窗户', '画'],
                type: 'indoor'
            },
            'hotspring': {
                name: '温泉',
                description: '共五处小温泉和两处大温泉',
                objects: ['小温泉1', '小温泉2', '大温泉', '更衣室', '休息椅'],
                type: 'outdoor'
            },
            'library': {
                name: '图书室',
                description: '老板对外开放的个人藏书，装饰古朴',
                objects: ['书架1', '书架2', '阅读桌', '古籍区', '管理员台'],
                type: 'indoor'
            },
            'gym': {
                name: '健身房',
                description: '简单的健身设备',
                objects: ['跑步机', '健身车', '仰卧起坐器', '健身球', '哑铃架'],
                type: 'indoor'
            },
            'cafe': {
                name: '咖啡馆',
                description: '健身房附近的咖啡馆',
                objects: ['咖啡机', '吧台', '餐桌1', '餐桌2', '沙发'],
                type: 'indoor'
            },
            'garden': {
                name: '大花园',
                description: '依山而建的大花园',
                objects: ['玫瑰丛', '喷泉', '长椅', '小径', '观景台'],
                type: 'outdoor'
            },
            'waterfall': {
                name: '人造瀑布',
                description: '人工建造的瀑布景观',
                objects: ['瀑布', '水池', '岩石', '观景台', '小桥'],
                type: 'outdoor'
            },
            'camp': {
                name: '山顶野营地',
                description: '烧烤和露营的好地方',
                objects: ['帐篷', '烧烤架', '篝火', '野餐桌', '望远镜'],
                type: 'outdoor'
            }
        };
    }
    
    // 初始化地图
    initMap() {
        this.setupMapClickEvents();
        this.updateLocationLabels();
    }
    
    // 设置地图点击事件
    setupMapClickEvents() {
        const locationLabels = document.querySelectorAll('.location-label');
        
        locationLabels.forEach(label => {
            label.addEventListener('click', (e) => {
                const locationId = e.target.id.replace('label-', '');
                this.enterLocation(locationId);
            });
        });
        
        // 返回地图按钮
        document.getElementById('back-to-map').addEventListener('click', () => {
            this.returnToMap();
        });
    }
    
    // 更新地点标签
    updateLocationLabels() {
        // 这里可以根据游戏状态更新标签样式
        // 例如：有道具的地点可以高亮显示
    }
    
    // 进入地点
    async enterLocation(locationId) {
        if (!window.gameManager || !window.gameManager.currentPlayer) {
            alert('请先登录游戏！');
            return;
        }
        
        // 检查行动点
        if (window.gameManager.currentPlayer.actionPoints <= 0) {
            window.gameManager.showMessage('行动点不足！');
            return;
        }
        
        const location = this.locations[locationId];
        if (!location) {
            console.error('未知地点:', locationId);
            return;
        }
        
        this.currentLocation = locationId;
        
        // 更新UI
        document.getElementById('scene-name').textContent = location.name;
        document.getElementById('scene-description').textContent = location.description;
        
        // 显示3D场景，隐藏2D地图
        document.getElementById('map-container').classList.add('hidden');
        document.getElementById('3d-container').classList.remove('hidden');
        
        // 初始化3D场景
        if (typeof window.initThreeScene === 'function') {
            window.initThreeScene(locationId, location);
        }
        
        // 更新玩家位置
        window.gameManager.currentPlayer.location = location.name;
        window.gameManager.updatePlayerUI();
        
        // 显示进入消息
        window.gameManager.showMessage(`进入${location.name}`);
    }
    
    // 返回地图
    returnToMap() {
        this.currentLocation = 'map';
        
        // 显示2D地图，隐藏3D场景
        document.getElementById('3d-container').classList.add('hidden');
        document.getElementById('map-container').classList.remove('hidden');
        
        // 清除3D场景
        if (typeof window.clearThreeScene === 'function') {
            window.clearThreeScene();
        }
        
        // 更新玩家位置
        if (window.gameManager && window.gameManager.currentPlayer) {
            window.gameManager.currentPlayer.location = '大地图';
            window.gameManager.updatePlayerUI();
        }
        
        // 显示返回消息
        window.gameManager.showMessage('返回大地图');
    }
    
    // 获取当前地点的道具
    async getLocationItems(locationId) {
        try {
            const locationData = await getLocationData(locationId);
            return locationData?.items || [];
        } catch (error) {
            console.error('获取地点道具失败:', error);
            return [];
        }
    }
    
    // 在地点内搜索道具
    async searchLocation(locationId) {
        if (!window.gameManager || !window.gameManager.currentPlayer) {
            return;
        }
        
        // 检查行动点
        if (window.gameManager.currentPlayer.actionPoints <= 0) {
            window.gameManager.showMessage('行动点不足！');
            return;
        }
        
        const location = this.locations[locationId];
        if (!location) return;
        
        // 消耗行动点
        window.gameManager.consumeActionPoint();
        
        // 随机决定是否找到物品
        const findChance = 0.6 + (window.gameManager.currentPlayer.luck || 0) * 0.02;
        const foundItem = Math.random() < findChance;
        
        if (foundItem) {
            // 随机生成一个道具
            const item = this.generateRandomItem();
            
            // 随机决定是道具还是线索
            const isClue = Math.random() < 0.3;
            
            if (isClue) {
                const clues = [
                    { name: '奇怪的痕迹', description: '看起来像是最近留下的' },
                    { name: '褪色的照片', description: '照片上的人已经无法辨认' },
                    { name: '破碎的玻璃', description: '窗玻璃上有裂痕' },
                    { name: '湿漉漉的脚印', description: '从温泉方向延伸过来' },
                    { name: '撕下的书页', description: '来自某本古籍的一页' }
                ];
                
                const clue = clues[Math.floor(Math.random() * clues.length)];
                window.gameManager.showMessage(`找到了线索: ${clue.name} - ${clue.description}`);
            } else {
                // 添加到玩家背包
                window.gameManager.pickUpItem(item, locationId);
            }
            
            // 随机扣除血量和san值
            const loseHp = Math.random() < 0.2;
            const loseSan = Math.random() < 0.3;
            
            if (loseHp && window.gameManager.currentPlayer) {
                const hpLoss = Math.floor(Math.random() * 10) + 1;
                window.gameManager.currentPlayer.hp = Math.max(0, window.gameManager.currentPlayer.hp - hpLoss);
                window.gameManager.showMessage(`探索中受伤，损失 ${hpLoss} HP`);
            }
            
            if (loseSan && window.gameManager.currentPlayer) {
                const sanLoss = Math.floor(Math.random() * 5) + 1;
                window.gameManager.currentPlayer.san = Math.max(0, window.gameManager.currentPlayer.san - sanLoss);
                window.gameManager.showMessage(`发现可怕的东西，损失 ${sanLoss} SAN`);
            }
            
            window.gameManager.updatePlayerUI();
            window.gameManager.checkPlayerDeath();
        } else {
            window.gameManager.showMessage('搜索了该区域，但没有发现任何东西。');
        }
    }
    
    // 生成随机道具
    generateRandomItem() {
        const itemTypes = [
            { name: '小刀', strength: 5, description: '普通的小刀' },
            { name: '绷带', healing: 10, hpRestore: 20, description: '医疗用绷带' },
            { name: '护身符', luck: 8, description: '带来好运的护身符' },
            { name: '能量饮料', hpRestore: 15, description: '恢复体力的饮料' },
            { name: '镇静剂', sanRestore: 20, description: '恢复理智的药物' },
            { name: '手套', dexterity: 4, description: '增加灵活性的手套' },
            { name: '力量戒指', strength: 8, description: '增加力量的戒指' },
            { name: '敏捷靴子', dexterity: 6, description: '增加敏捷的靴子' }
        ];
        
        const randomItem = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        return {
            ...randomItem,
            id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
    }
}

// 创建地图管理器实例
const mapManager = new MapManager();

// 导出初始化函数
function initMap() {
    mapManager.initMap();
}

// 导出到全局
window.mapManager = mapManager;
window.initMap = initMap;
window.enterLocation = (locationId) => mapManager.enterLocation(locationId);