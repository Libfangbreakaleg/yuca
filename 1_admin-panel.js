// admin-panel.js
// 管理员功能

import { 
    dbRefs, 
    getAllItems, 
    getPlayerData,
    updatePlayerData,
    listenToPlayers 
} from './firebase-config.js';

class AdminPanel {
    constructor() {
        this.players = {};
        this.allItems = [];
    }
    
    // 初始化管理员面板
    async initAdminPanel() {
        // 加载玩家列表
        this.loadPlayersList();
        
        // 加载所有道具
        this.loadAllItems();
        
        // 监听玩家数据变化
        listenToPlayers((players) => {
            this.players = players || {};
            this.updatePlayersList();
        });
        
        // 设置控制按钮事件
        this.setupAdminControls();
    }
    
    // 加载玩家列表
    async loadPlayersList() {
        const adminPlayersList = document.getElementById('admin-players-list');
        if (!adminPlayersList) return;
        
        // 显示加载中
        adminPlayersList.innerHTML = '<div class="loading">加载玩家数据...</div>';
        
        // 这里应该从Firebase获取所有玩家数据
        // 暂时使用模拟数据
        setTimeout(() => {
            this.updatePlayersList();
        }, 500);
    }
    
    // 更新玩家列表
    updatePlayersList() {
        const adminPlayersList = document.getElementById('admin-players-list');
        if (!adminPlayersList) return;
        
        adminPlayersList.innerHTML = '';
        
        Object.entries(this.players).forEach(([id, player]) => {
            const playerEl = document.createElement('div');
            playerEl.className = 'admin-player-card';
            playerEl.innerHTML = `
                <div class="admin-player-header">
                    <span class="player-name">${player.name || '未知玩家'}</span>
                    <span class="player-status ${player.isAlive ? 'alive' : 'dead'}">
                        ${player.isAlive ? '存活' : '死亡'}
                    </span>
                </div>
                <div class="admin-player-stats">
                    <div class="stat-row">
                        <label>HP:</label>
                        <input type="number" class="stat-input hp-input" data-player="${id}" 
                               value="${player.hp || 0}" min="0" max="${player.maxHp || 100}">
                        <span>/ ${player.maxHp || 100}</span>
                    </div>
                    <div class="stat-row">
                        <label>SAN:</label>
                        <input type="number" class="stat-input san-input" data-player="${id}" 
                               value="${player.san || 0}" min="0" max="${player.maxSan || 100}">
                        <span>/ ${player.maxSan || 100}</span>
                    </div>
                    <div class="stat-row">
                        <label>行动点:</label>
                        <input type="number" class="stat-input ap-input" data-player="${id}" 
                               value="${player.actionPoints || 0}" min="0" max="10">
                    </div>
                </div>
                <div class="admin-player-attributes">
                    <div class="attr">💪 ${player.strength || 0}</div>
                    <div class="attr">⚡ ${player.dexterity || 0}</div>
                    <div class="attr">❤️ ${player.healing || 0}</div>
                    <div class="attr">🍀 ${player.luck || 0}</div>
                </div>
                <div class="admin-player-backpack">
                    <strong>背包:</strong>
                    <div class="backpack-items">
                        ${player.backpack && player.backpack.length > 0 
                            ? player.backpack.map(item => 
                                `<span class="backpack-item" title="${item.description || ''}">${item.name}</span>`
                              ).join('')
                            : '<span class="empty">空</span>'
                        }
                    </div>
                </div>
                <div class="admin-player-actions">
                    <button class="small-btn save-btn" data-player="${id}">保存</button>
                    <button class="small-btn delete-btn" data-player="${id}">删除玩家</button>
                </div>
            `;
            adminPlayersList.appendChild(playerEl);
        });
        
        // 添加保存按钮事件
        document.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playerId = e.target.dataset.player;
                this.savePlayerChanges(playerId);
            });
        });
        
        // 添加删除按钮事件
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playerId = e.target.dataset.player;
                if (confirm(`确定要删除玩家 ${this.players[playerId]?.name} 吗？`)) {
                    this.deletePlayer(playerId);
                }
            });
        });
    }
    
    // 保存玩家更改
    async savePlayerChanges(playerId) {
        const player = this.players[playerId];
        if (!player) return;
        
        // 获取输入值
        const hpInput = document.querySelector(`.hp-input[data-player="${playerId}"]`);
        const sanInput = document.querySelector(`.san-input[data-player="${playerId}"]`);
        const apInput = document.querySelector(`.ap-input[data-player="${playerId}"]`);
        
        const updates = {
            hp: parseInt(hpInput?.value) || player.hp,
            san: parseInt(sanInput?.value) || player.san,
            actionPoints: parseInt(apInput?.value) || player.actionPoints,
            lastModified: new Date().toISOString(),
            modifiedBy: 'admin'
        };
        
        try {
            await updatePlayerData(playerId, updates);
            alert('玩家数据已更新！');
        } catch (error) {
            console.error('更新玩家数据失败:', error);
            alert('更新失败！');
        }
    }
    
    // 删除玩家
    async deletePlayer(playerId) {
        try {
            // 这里应该从Firebase删除玩家
            // 暂时只是从本地移除
            delete this.players[playerId];
            this.updatePlayersList();
            console.log(`玩家 ${playerId} 已被删除`);
        } catch (error) {
            console.error('删除玩家失败:', error);
        }
    }
    
    // 加载所有道具
    async loadAllItems() {
        try {
            this.allItems = await getAllItems() || [];
            this.updateItemsList();
        } catch (error) {
            console.error('加载道具失败:', error);
        }
    }
    
    // 更新道具列表
    updateItemsList() {
        const allItemsList = document.getElementById('all-items-list');
        if (!allItemsList) return;
        
        allItemsList.innerHTML = '';
        
        this.allItems.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'admin-item-card';
            itemEl.innerHTML = `
                <div class="item-header">
                    <span class="item-name">${item.name}</span>
                    <span class="item-type ${item.type}">${this.getItemTypeLabel(item.type)}</span>
                </div>
                <div class="item-description">${item.description || '无描述'}</div>
                <div class="item-stats">
                    ${item.strength ? `<span>💪 +${item.strength}</span>` : ''}
                    ${item.dexterity ? `<span>⚡ +${item.dexterity}</span>` : ''}
                    ${item.healing ? `<span>❤️ +${item.healing}</span>` : ''}
                    ${item.luck ? `<span>🍀 +${item.luck}</span>` : ''}
                    ${item.hpRestore ? `<span>HP恢复 +${item.hpRestore}</span>` : ''}
                    ${item.sanRestore ? `<span>SAN恢复 +${item.sanRestore}</span>` : ''}
                </div>
                <div class="item-info">
                    <span>稀有度: ${item.rarity || '普通'}</span>
                    <span>最大数量: ${item.maxCount || 1}</span>
                </div>
                <div class="item-actions">
                    <button class="small-btn edit-item" data-index="${index}">编辑</button>
                    <button class="small-btn delete-item" data-index="${index}">删除</button>
                </div>
            `;
            allItemsList.appendChild(itemEl);
        });
        
        // 添加搜索功能
        const itemSearch = document.getElementById('item-search');
        if (itemSearch) {
            itemSearch.addEventListener('input', (e) => {
                this.filterItems(e.target.value);
            });
        }
    }
    
    // 过滤道具
    filterItems(searchTerm) {
        const filteredItems = this.allItems.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        
        // 重新渲染过滤后的列表
        const allItemsList = document.getElementById('all-items-list');
        if (allItemsList) {
            allItemsList.innerHTML = '';
            
            filteredItems.forEach((item, index) => {
                const itemEl = document.createElement('div');
                itemEl.className = 'admin-item-card';
                itemEl.innerHTML = `
                    <div class="item-header">
                        <span class="item-name">${item.name}</span>
                        <span class="item-type ${item.type}">${this.getItemTypeLabel(item.type)}</span>
                    </div>
                    <div class="item-description">${item.description || '无描述'}</div>
                    <div class="item-stats">
                        ${item.strength ? `<span>💪 +${item.strength}</span>` : ''}
                        ${item.dexterity ? `<span>⚡ +${item.dexterity}</span>` : ''}
                        ${item.healing ? `<span>❤️ +${item.healing}</span>` : ''}
                        ${item.luck ? `<span>🍀 +${item.luck}</span>` : ''}
                    </div>
                `;
                allItemsList.appendChild(itemEl);
            });
        }
    }
    
    // 获取道具类型标签
    getItemTypeLabel(type) {
        const typeLabels = {
            'weapon': '武器',
            'armor': '防具',
            'accessory': '饰品',
            'consumable': '消耗品',
            'clue': '线索'
        };
        
        return typeLabels[type] || type;
    }
    
    // 设置管理员控制
    setupAdminControls() {
        // 重置游戏
        document.getElementById('reset-game').addEventListener('click', () => {
            if (confirm('确定要重置游戏吗？这将清除所有玩家数据和游戏进度！')) {
                this.resetGame();
            }
        });
        
        // 刷新所有道具
        document.getElementById('refresh-items').addEventListener('click', () => {
            if (confirm('确定要刷新所有地点的道具吗？')) {
                this.refreshAllItems();
            }
        });
        
        // 强制所有玩家退出
        document.getElementById('force-logout').addEventListener('click', () => {
            if (confirm('确定要强制所有玩家退出吗？')) {
                this.forceLogoutAllPlayers();
            }
        });
    }
    
    // 重置游戏
    async resetGame() {
        try {
            // 这里应该重置Firebase数据库中的所有游戏数据
            alert('游戏重置功能需要后端支持');
        } catch (error) {
            console.error('重置游戏失败:', error);
        }
    }
    
    // 刷新所有道具
    async refreshAllItems() {
        try {
            // 这里应该刷新所有地点的道具
            alert('道具刷新功能需要后端支持');
        } catch (error) {
            console.error('刷新道具失败:', error);
        }
    }
    
    // 强制所有玩家退出
    async forceLogoutAllPlayers() {
        try {
            // 这里应该强制所有玩家退出游戏
            alert('强制退出功能需要后端支持');
        } catch (error) {
            console.error('强制退出失败:', error);
        }
    }
    
    // 添加新道具
    addNewItem(itemData) {
        // 这里应该添加新道具到数据库
        console.log('添加新道具:', itemData);
    }
}

// 创建管理员面板实例
const adminPanel = new AdminPanel();

// 导出初始化函数
function initAdminPanel() {
    adminPanel.initAdminPanel();
}

// 导出到全局
window.adminPanel = adminPanel;
window.initAdminPanel = initAdminPanel;