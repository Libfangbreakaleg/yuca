// game-manager.js
// 游戏状态、玩家数据管理

// 导入Firebase函数
import { 
    savePlayerData, 
    getPlayerData, 
    updatePlayerData,
    listenToPlayers 
} from './firebase-config.js';

class GameManager {
    constructor() {
        this.currentPlayer = null;
        this.players = {};
        this.gameState = {
            currentDay: 1,
            actionPoints: 10,
            isNight: false
        };
    }
    
    // 初始化游戏
    async initGame(playerData) {
        this.currentPlayer = playerData;
        
        // 更新UI
        this.updatePlayerUI();
        
        // 监听其他玩家
        listenToPlayers((players) => {
            this.players = players || {};
            this.updatePlayersList();
        });
        
        // 开始游戏循环
        this.startGameLoop();
    }
    
    // 更新玩家UI
    updatePlayerUI() {
        if (!this.currentPlayer) return;
        
        document.getElementById('player-display-name').textContent = this.currentPlayer.name;
        document.getElementById('current-hp').textContent = `${this.currentPlayer.hp}/${this.currentPlayer.maxHp}`;
        document.getElementById('current-san').textContent = `${this.currentPlayer.san}/${this.currentPlayer.maxSan}`;
        document.getElementById('current-day').textContent = `第${this.currentPlayer.day || 1}天`;
        document.getElementById('action-points').textContent = `行动点: ${this.currentPlayer.actionPoints || 10}/10`;
        
        // 更新背包
        this.updateBackpack();
    }
    
    // 更新背包
    updateBackpack() {
        const backpackItems = document.getElementById('backpack-items');
        const itemCount = document.getElementById('item-count');
        
        if (!this.currentPlayer || !this.currentPlayer.backpack) {
            backpackItems.innerHTML = '<p class="empty">背包为空</p>';
            itemCount.textContent = '(0)';
            return;
        }
        
        backpackItems.innerHTML = '';
        this.currentPlayer.backpack.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'backpack-item';
            itemEl.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-desc">${item.description || ''}</div>
                </div>
                <div class="item-stats">
                    ${item.strength ? `<span>💪 +${item.strength}</span>` : ''}
                    ${item.dexterity ? `<span>⚡ +${item.dexterity}</span>` : ''}
                    ${item.healing ? `<span>❤️ +${item.healing}</span>` : ''}
                    ${item.luck ? `<span>🍀 +${item.luck}</span>` : ''}
                </div>
                <button class="small-btn use-item" data-index="${index}">使用</button>
            `;
            backpackItems.appendChild(itemEl);
        });
        
        itemCount.textContent = `(${this.currentPlayer.backpack.length})`;
        
        // 添加使用道具事件
        document.querySelectorAll('.use-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.useItem(index);
            });
        });
    }
    
    // 使用道具
    useItem(index) {
        if (!this.currentPlayer || !this.currentPlayer.backpack[index]) return;
        
        const item = this.currentPlayer.backpack[index];
        
        // 应用道具效果
        if (item.hpRestore) {
            this.currentPlayer.hp = Math.min(this.currentPlayer.maxHp, this.currentPlayer.hp + item.hpRestore);
        }
        
        if (item.sanRestore) {
            this.currentPlayer.san = Math.min(this.currentPlayer.maxSan, this.currentPlayer.san + item.sanRestore);
        }
        
        // 如果是消耗品，从背包移除
        if (item.type === 'consumable') {
            this.currentPlayer.backpack.splice(index, 1);
        }
        
        // 更新UI和保存数据
        this.updatePlayerUI();
        this.saveCurrentPlayer();
        
        // 显示使用效果
        this.showMessage(`使用了 ${item.name}`);
    }
    
    // 更新玩家列表
    updatePlayersList() {
        const playersList = document.getElementById('players-list');
        if (!playersList) return;
        
        playersList.innerHTML = '';
        
        Object.entries(this.players).forEach(([id, player]) => {
            if (id === window.game.playerId) return; // 不显示自己
            
            const playerEl = document.createElement('div');
            playerEl.className = 'player-item';
            playerEl.innerHTML = `
                <div class="player-name">${player.name} ${!player.isAlive ? '💀' : ''}</div>
                <div class="player-stats">
                    <span>❤️ ${player.hp || 0}/${player.maxHp || 0}</span>
                    <span>🧠 ${player.san || 0}/${player.maxSan || 0}</span>
                </div>
                <div class="player-location">📍 ${player.location || '未知'}</div>
                <div class="player-actions">
                    ${player.isAlive ? `
                        <button class="small-btn combat-btn" data-target="${id}">挑战</button>
                        <button class="small-btn heal-btn" data-target="${id}">治疗</button>
                    ` : '<span class="dead-text">已死亡</span>'}
                </div>
            `;
            playersList.appendChild(playerEl);
        });
        
        // 添加战斗和治疗事件
        document.querySelectorAll('.combat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = e.target.dataset.target;
                this.initiateCombat(targetId);
            });
        });
        
        document.querySelectorAll('.heal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = e.target.dataset.target;
                this.initiateHealing(targetId);
            });
        });
    }
    
    // 发起战斗
    initiateCombat(targetId) {
        if (!this.currentPlayer || this.currentPlayer.actionPoints <= 0) {
            this.showMessage('行动点不足！');
            return;
        }
        
        const targetPlayer = this.players[targetId];
        if (!targetPlayer || !targetPlayer.isAlive) {
            this.showMessage('目标玩家不可战斗！');
            return;
        }
        
        // 这里会调用战斗系统的函数
        if (typeof window.startCombat === 'function') {
            window.startCombat(targetId, targetPlayer.name);
        }
    }
    
    // 发起治疗
    initiateHealing(targetId) {
        if (!this.currentPlayer || this.currentPlayer.actionPoints <= 0) {
            this.showMessage('行动点不足！');
            return;
        }
        
        // 消耗行动点
        this.consumeActionPoint();
        
        const healAmount = this.currentPlayer.healing || 5;
        
        if (targetId === window.game.playerId) {
            // 治疗自己
            this.currentPlayer.hp = Math.min(this.currentPlayer.maxHp, this.currentPlayer.hp + healAmount);
            this.showMessage(`治疗了自己，恢复 ${healAmount} HP`);
        } else {
            // 治疗其他玩家（需要更新数据库）
            this.showMessage(`向玩家发起治疗 ${healAmount} HP`);
            // 这里应该更新目标玩家的HP
        }
        
        this.updatePlayerUI();
        this.saveCurrentPlayer();
    }
    
    // 消耗行动点
    consumeActionPoint() {
        if (this.currentPlayer.actionPoints > 0) {
            this.currentPlayer.actionPoints--;
            this.updatePlayerUI();
            this.saveCurrentPlayer();
            
            if (this.currentPlayer.actionPoints <= 0) {
                this.showMessage('今日行动点已用完！');
            }
        }
    }
    
    // 新的一天
    async newDay() {
        if (this.currentPlayer) {
            this.currentPlayer.day = (this.currentPlayer.day || 1) + 1;
            this.currentPlayer.actionPoints = 10;
            
            // 恢复少量HP和San值
            this.currentPlayer.hp = Math.min(this.currentPlayer.maxHp, this.currentPlayer.hp + 20);
            this.currentPlayer.san = Math.min(this.currentPlayer.maxSan, this.currentPlayer.san + 10);
            
            this.updatePlayerUI();
            await this.saveCurrentPlayer();
            
            this.showMessage(`第 ${this.currentPlayer.day} 天开始！行动点已刷新。`);
        }
    }
    
    // 保存当前玩家数据
    async saveCurrentPlayer() {
        if (this.currentPlayer && window.game.playerId) {
            await updatePlayerData(window.game.playerId, this.currentPlayer);
        }
    }
    
    // 显示消息
    showMessage(message) {
        const log = document.getElementById('interaction-log');
        if (log) {
            const messageEl = document.createElement('div');
            messageEl.className = 'log-message';
            messageEl.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
            log.appendChild(messageEl);
            log.scrollTop = log.scrollHeight;
        }
        
        // 也显示在控制台
        console.log(`游戏消息: ${message}`);
    }
    
    // 游戏主循环
    startGameLoop() {
        // 每5分钟检查一次是否需要刷新新的一天
        setInterval(() => {
            this.checkDayUpdate();
        }, 5 * 60 * 1000);
        
        // 每30秒自动保存
        setInterval(() => {
            if (this.currentPlayer) {
                this.saveCurrentPlayer();
            }
        }, 30 * 1000);
    }
    
    // 检查天数更新
    checkDayUpdate() {
        // 这里应该检查服务器时间，判断是否需要进入新的一天
        // 暂时每24小时游戏时间更新一天
        const now = new Date();
        const lastUpdate = this.currentPlayer?.lastUpdate ? new Date(this.currentPlayer.lastUpdate) : now;
        const hoursDiff = (now - lastUpdate) / (1000 * 60 * 60);
        
        if (hoursDiff >= 24) {
            this.newDay();
        }
    }
    
    // 拾取物品
    async pickUpItem(item, locationId) {
        if (!this.currentPlayer || this.currentPlayer.actionPoints <= 0) {
            this.showMessage('行动点不足！');
            return false;
        }
        
        // 消耗行动点
        this.consumeActionPoint();
        
        // 添加到背包
        if (!this.currentPlayer.backpack) {
            this.currentPlayer.backpack = [];
        }
        
        this.currentPlayer.backpack.push(item);
        
        // 更新UI
        this.updatePlayerUI();
        await this.saveCurrentPlayer();
        
        this.showMessage(`获得了 ${item.name}！`);
        return true;
    }
    
    // 玩家死亡检查
    checkPlayerDeath() {
        if (this.currentPlayer) {
            if (this.currentPlayer.hp <= 0 || this.currentPlayer.san <= 0) {
                this.currentPlayer.isAlive = false;
                this.showMessage('你已死亡！无法行动。');
                this.saveCurrentPlayer();
                return true;
            }
        }
        return false;
    }
}

// 创建全局游戏管理器实例
const gameManager = new GameManager();

// 导出初始化函数
function initGame(playerData) {
    gameManager.initGame(playerData);
}

// 导出到全局
window.gameManager = gameManager;
window.initGame = initGame;