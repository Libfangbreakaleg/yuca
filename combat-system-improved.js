// combat-system-improved.js
// 改进的战斗系统 - 包含逃跑、投降等机制

class ImprovedCombatSystem {
    constructor() {
        this.currentCombat = null;
        this.combatLog = [];
        this.combatState = 'idle'; // idle, active, playerTurn, enemyTurn, ended
        this.playerDefending = false;
        this.enemyDefending = false;
        this.escapeAttempts = 0;
    }
    
    // 开始战斗
    async startCombat(targetId, targetName) {
        if (!window.gameManager || !window.gameManager.currentPlayer) {
            return;
        }
        
        const player = window.gameManager.currentPlayer;
        
        // 检查是否能够战斗
        if (!player.isAlive) {
            window.gameManager.showMessage('你已死亡，无法战斗！');
            return;
        }
        
        if (player.actionPoints <= 0) {
            window.gameManager.showMessage('行动点不足！');
            return;
        }
        
        // 检查目标玩家状态
        const targetPlayer = window.gameManager.players[targetId];
        if (!targetPlayer || !targetPlayer.isAlive) {
            window.gameManager.showMessage('目标玩家无法战斗！');
            return;
        }
        
        // 初始化战斗数据
        this.currentCombat = {
            targetId: targetId,
            targetName: targetName,
            targetData: targetPlayer,
            round: 1,
            playerHP: player.hp,
            enemyHP: targetPlayer.hp || 100,
            escapeChance: 0.5,
            surrenderAccepted: false
        };
        
        this.combatState = 'active';
        this.playerDefending = false;
        this.enemyDefending = false;
        this.escapeAttempts = 0;
        
        // 显示战斗界面
        this.showCombatInterface(targetId, targetName);
        
        // 战斗开始消息
        this.addCombatLog(`⚔️ 战斗开始！${player.name} vs ${targetName}`);
    }
    
    // 显示战斗界面（改进版）
    showCombatInterface(targetId, targetName) {
        const combatPanel = document.getElementById('combat-panel');
        const combatInterface = document.getElementById('combat-interface');
        
        // 显示战斗面板
        document.getElementById('backpack-panel').classList.add('hidden');
        document.getElementById('players-panel').classList.add('hidden');
        combatPanel.classList.remove('hidden');
        
        // 创建战斗界面
        combatInterface.innerHTML = `
            <div class="combat-header">
                <h4>⚔️ 对战 ${targetName} - 第<span id="combat-round">1</span>回合</h4>
                <div class="combat-status">
                    <span class="combat-state" id="combat-state">战斗进行中</span>
                </div>
            </div>
            
            <div class="combatants">
                <div class="combatant you">
                    <div class="combatant-name">${window.gameManager.currentPlayer.name}</div>
                    <div class="combatant-hp">❤️ HP: <span id="player-hp">${window.gameManager.currentPlayer.hp}</span></div>
                    <div class="hp-bar">
                        <div class="hp-fill" id="player-hp-bar" style="width: 100%"></div>
                    </div>
                    <div class="combatant-stats">
                        <span>💪 ${window.gameManager.currentPlayer.strength || 0}</span>
                        <span>⚡ ${window.gameManager.currentPlayer.dexterity || 0}</span>
                        <span>🛡️ <span id="player-defense">0</span>%</span>
                    </div>
                </div>
                
                <div class="vs">VS</div>
                
                <div class="combatant enemy">
                    <div class="combatant-name">${targetName}</div>
                    <div class="combatant-hp">❤️ HP: <span id="enemy-hp">${this.currentCombat.enemyHP}</span></div>
                    <div class="hp-bar">
                        <div class="hp-fill" id="enemy-hp-bar" style="width: 100%"></div>
                    </div>
                    <div class="combatant-stats">
                        <span>💪 ???</span>
                        <span>⚡ ???</span>
                        <span>🛡️ <span id="enemy-defense">0</span>%</span>
                    </div>
                </div>
            </div>
            
            <div class="combat-controls" id="combat-controls">
                <button id="attack-btn" class="combat-btn">攻击</button>
                <button id="defend-btn" class="combat-btn">防御</button>
                <button id="skill-btn" class="combat-btn">技能</button>
                <button id="item-btn" class="combat-btn">使用道具</button>
                <button id="escape-btn" class="combat-btn">逃跑</button>
                <button id="surrender-btn" class="combat-btn danger">投降</button>
            </div>
            
            <div class="combat-actions" id="combat-actions">
                <h5>特殊行动</h5>
                <button id="taunt-btn" class="small-btn">嘲讽</button>
                <button id="focus-btn" class="small-btn">集中</button>
                <button id="rest-btn" class="small-btn">休息</button>
            </div>
            
            <div class="combat-log" id="combat-log"></div>
            
            <div class="combat-options">
                <button id="auto-combat" class="small-btn">自动战斗</button>
                <button id="fast-forward" class="small-btn">快速模式</button>
                <button id="close-combat" class="small-btn hidden">结束战斗</button>
            </div>
        `;
        
        // 更新战斗状态显示
        this.updateCombatUI();
        
        // 添加事件监听
        this.setupCombatEvents();
    }
    
    // 设置战斗事件
    setupCombatEvents() {
        // 攻击
        document.getElementById('attack-btn').addEventListener('click', () => {
            if (this.combatState === 'playerTurn') {
                this.performAttack();
            }
        });
        
        // 防御
        document.getElementById('defend-btn').addEventListener('click', () => {
            if (this.combatState === 'playerTurn') {
                this.performDefense();
            }
        });
        
        // 逃跑
        document.getElementById('escape-btn').addEventListener('click', () => {
            this.attemptEscape();
        });
        
        // 投降
        document.getElementById('surrender-btn').addEventListener('click', () => {
            this.attemptSurrender();
        });
        
        // 特殊行动
        document.getElementById('taunt-btn').addEventListener('click', () => {
            this.performTaunt();
        });
        
        document.getElementById('focus-btn').addEventListener('click', () => {
            this.performFocus();
        });
        
        document.getElementById('rest-btn').addEventListener('click', () => {
            this.performRest();
        });
        
        // 自动战斗
        document.getElementById('auto-combat').addEventListener('click', () => {
            this.toggleAutoCombat();
        });
        
        // 结束战斗
        document.getElementById('close-combat').addEventListener('click', () => {
            document.getElementById('combat-panel').classList.add('hidden');
            this.endCombat();
        });
        
        // 开始玩家回合
        this.startPlayerTurn();
    }
    
    // 开始玩家回合
    startPlayerTurn() {
        this.combatState = 'playerTurn';
        document.getElementById('combat-state').textContent = '你的回合';
        
        // 启用玩家控制按钮
        this.enablePlayerControls(true);
        
        this.addCombatLog(`第 ${this.currentCombat.round} 回合 - 你的回合开始`);
    }
    
    // 开始敌人回合
    startEnemyTurn() {
        this.combatState = 'enemyTurn';
        document.getElementById('combat-state').textContent = '对方回合';
        
        // 禁用玩家控制按钮
        this.enablePlayerControls(false);
        
        this.addCombatLog(`第 ${this.currentCombat.round} 回合 - ${this.currentCombat.targetName}的回合`);
        
        // 延迟后执行敌人行动
        setTimeout(() => {
            this.enemyAction();
        }, 1500);
    }
    
    // 敌人行动
    enemyAction() {
        const actions = ['attack', 'defend'];
        const weights = [70, 30]; // 70%攻击，30%防御
        
        let random = Math.random() * 100;
        let action;
        
        if (random < weights[0]) {
            action = 'attack';
        } else {
            action = 'defend';
        }
        
        if (action === 'attack') {
            this.enemyAttack();
        } else {
            this.enemyDefend();
        }
    }
    
    // 执行攻击
    performAttack() {
        if (this.combatState !== 'playerTurn') return;
        
        const player = window.gameManager.currentPlayer;
        
        // 消耗行动点
        window.gameManager.consumeActionPoint();
        
        // 计算伤害
        const attackResult = this.calculateDamage(player, this.currentCombat.targetData, 'attack');
        
        // 应用伤害
        this.currentCombat.enemyHP = Math.max(0, this.currentCombat.enemyHP - attackResult.damage);
        
        // 更新UI
        this.updateCombatUI();
        
        // 添加战斗日志
        this.addCombatLog(attackResult.message);
        
        // 检查敌人是否死亡
        if (this.currentCombat.enemyHP <= 0) {
            this.victory();
            return;
        }
        
        // 进入敌人回合
        this.combatState = 'enemyTurn';
        setTimeout(() => {
            this.enemyTurn();
        }, 1000);
    }
    
    // 敌人攻击
    enemyAttack() {
        // 计算伤害
        const attackResult = this.calculateDamage(this.currentCombat.targetData, window.gameManager.currentPlayer, 'attack');
        
        // 应用防御减伤
        let finalDamage = attackResult.damage;
        if (this.playerDefending) {
            finalDamage = Math.floor(finalDamage * 0.5); // 防御状态减伤50%
            this.addCombatLog(`你的防御减少了伤害！`);
        }
        
        // 应用伤害
        this.currentCombat.playerHP = Math.max(0, this.currentCombat.playerHP - finalDamage);
        
        // 更新UI
        this.updateCombatUI();
        
        // 添加战斗日志
        this.addCombatLog(attackResult.message);
        
        // 检查玩家是否死亡
        if (this.currentCombat.playerHP <= 0) {
            this.defeat();
            return;
        }
        
        // 进入下一回合
        this.nextRound();
    }
    
    // 执行防御
    performDefense() {
        if (this.combatState !== 'playerTurn') return;
        
        // 消耗行动点
        window.gameManager.consumeActionPoint();
        
        this.playerDefending = true;
        this.addCombatLog('你采取了防御姿态，下次受到的伤害减少50%');
        
        // 进入敌人回合
        this.combatState = 'enemyTurn';
        setTimeout(() => {
            this.enemyTurn();
        }, 1000);
    }
    
    // 敌人防御
    enemyDefend() {
        this.enemyDefending = true;
        this.addCombatLog(`${this.currentCombat.targetName}采取了防御姿态`);
        
        // 进入下一回合
        this.nextRound();
    }
    
    // 敌人回合
    enemyTurn() {
        if (this.enemyDefending) {
            this.enemyDefending = false;
        }
        
        this.enemyAction();
    }
    
    // 下一回合
    nextRound() {
        this.currentCombat.round++;
        document.getElementById('combat-round').textContent = this.currentCombat.round;
        
        // 重置防御状态
        if (this.playerDefending) {
            this.playerDefending = false;
        }
        
        // 开始玩家回合
        setTimeout(() => {
            this.startPlayerTurn();
        }, 1000);
    }
    
    // 尝试逃跑
    attemptEscape() {
        if (this.combatState !== 'playerTurn') {
            this.addCombatLog('只能在你的回合尝试逃跑！');
            return;
        }
        
        // 消耗行动点
        window.gameManager.consumeActionPoint();
        
        this.escapeAttempts++;
        
        // 计算逃跑成功率
        const baseChance = 0.4; // 基础40%成功率
        const dexBonus = (window.gameManager.currentPlayer.dexterity || 0) * 0.02; // 每点敏捷+2%
        const luckBonus = (window.gameManager.currentPlayer.luck || 0) * 0.01; // 每点幸运+1%
        const attemptPenalty = this.escapeAttempts * 0.1; // 每次尝试降低10%成功率
        
        let escapeChance = baseChance + dexBonus + luckBonus - attemptPenalty;
        escapeChance = Math.max(0.1, Math.min(0.9, escapeChance)); // 限制在10%-90%之间
        
        const isSuccess = Math.random() < escapeChance;
        
        if (isSuccess) {
            this.addCombatLog('逃跑成功！你成功脱离了战斗。');
            
            // 逃跑惩罚：损失少量HP和San值
            const hpLoss = Math.floor(window.gameManager.currentPlayer.hp * 0.1); // 损失10%HP
            const sanLoss = Math.floor(window.gameManager.currentPlayer.san * 0.05); // 损失5%San值
            
            window.gameManager.currentPlayer.hp = Math.max(1, window.gameManager.currentPlayer.hp - hpLoss);
            window.gameManager.currentPlayer.san = Math.max(1, window.gameManager.currentPlayer.san - sanLoss);
            
            window.gameManager.updatePlayerUI();
            window.gameManager.saveCurrentPlayer();
            
            // 结束战斗
            this.endCombat();
            document.getElementById('combat-panel').classList.add('hidden');
        } else {
            this.addCombatLog('逃跑失败！');
            
            // 逃跑失败惩罚：敌人获得一次额外攻击
            setTimeout(() => {
                this.addCombatLog('逃跑失败，敌人趁机攻击！');
                this.enemyAttack();
            }, 1000);
        }
    }
    
    // 尝试投降
    attemptSurrender() {
        if (this.combatState !== 'playerTurn') {
            this.addCombatLog('只能在你的回合尝试投降！');
            return;
        }
        
        // 投降确认
        if (confirm('确定要投降吗？投降将损失大量HP和San值，但可以保留性命。')) {
            // 消耗行动点
            window.gameManager.consumeActionPoint();
            
            this.addCombatLog('你选择了投降...');
            
            // 投降惩罚：损失80%HP和50%San值
            const hpLoss = Math.floor(window.gameManager.currentPlayer.hp * 0.8);
            const sanLoss = Math.floor(window.gameManager.currentPlayer.san * 0.5);
            
            window.gameManager.currentPlayer.hp = Math.max(1, window.gameManager.currentPlayer.hp - hpLoss);
            window.gameManager.currentPlayer.san = Math.max(1, window.gameManager.currentPlayer.san - sanLoss);
            
            window.gameManager.updatePlayerUI();
            window.gameManager.saveCurrentPlayer();
            
            // 添加战斗日志
            this.addCombatLog(`投降惩罚：损失${hpLoss}HP和${sanLoss}San值`);
            
            // 结束战斗
            this.endCombat();
            document.getElementById('combat-panel').classList.add('hidden');
            
            // 显示投降消息
            window.gameManager.showMessage('你投降了，损失了大量生命值和san值。');
        }
    }
    
    // 特殊行动：嘲讽
    performTaunt() {
        if (this.combatState !== 'playerTurn') return;
        
        window.gameManager.consumeActionPoint();
        
        // 嘲讽效果：下回合敌人必定攻击，但伤害增加
        this.addCombatLog('你嘲讽了敌人，下回合敌人会更猛烈地攻击！');
        
        // 这里可以添加状态效果
        // 例如：this.currentCombat.enemyEnraged = true;
    }
    
    // 特殊行动：集中
    performFocus() {
        if (this.combatState !== 'playerTurn') return;
        
        window.gameManager.consumeActionPoint();
        
        // 集中效果：下回合攻击必定暴击
        this.addCombatLog('你集中精神，下回合攻击必定暴击！');
        
        // 这里可以添加状态效果
        // 例如：this.currentCombat.playerFocused = true;
    }
    
    // 特殊行动：休息
    performRest() {
        if (this.combatState !== 'playerTurn') return;
        
        window.gameManager.consumeActionPoint();
        
        // 休息效果：恢复少量HP和San值
        const hpRestore = Math.floor(window.gameManager.currentPlayer.maxHp * 0.1);
        const sanRestore = Math.floor(window.gameManager.currentPlayer.maxSan * 0.05);
        
        window.gameManager.currentPlayer.hp = Math.min(
            window.gameManager.currentPlayer.maxHp,
            window.gameManager.currentPlayer.hp + hpRestore
        );
        
        window.gameManager.currentPlayer.san = Math.min(
            window.gameManager.currentPlayer.maxSan,
            window.gameManager.currentPlayer.san + sanRestore
        );
        
        window.gameManager.updatePlayerUI();
        window.gameManager.saveCurrentPlayer();
        
        this.addCombatLog(`你休息了一会，恢复了${hpRestore}HP和${sanRestore}San值`);
        
        // 进入敌人回合
        this.combatState = 'enemyTurn';
        setTimeout(() => {
            this.enemyTurn();
        }, 1000);
    }
    
    // 计算伤害
    calculateDamage(attacker, defender, action) {
        let baseDamage = 0;
        let message = '';
        
        if (action === 'attack') {
            // 基础伤害 = 力量 × 2
            baseDamage = (attacker.strength || 0) * 2;
            
            // 随机因素 (0.8 ~ 1.2)
            const randomFactor = 0.8 + Math.random() * 0.4;
            baseDamage = Math.floor(baseDamage * randomFactor);
            
            // 暴击检查
            const critChance = 0.1 + (attacker.luck || 0) * 0.01;
            const isCrit = Math.random() < critChance;
            
            if (isCrit) {
                baseDamage = Math.floor(baseDamage * 1.5);
                message = `${attacker.name} 造成了 ${baseDamage} 点暴击伤害！`;
            } else {
                message = `${attacker.name} 造成了 ${baseDamage} 点伤害！`;
            }
        }
        
        return {
            damage: baseDamage,
            message: message,
            isCrit: message.includes('暴击')
        };
    }
    
    // 胜利
    victory() {
        this.combatState = 'ended';
        
        this.addCombatLog(`🎉 你杀死了 ${this.currentCombat.targetName}！`);
        this.addCombatLog('战斗胜利！');
        
        // 胜利奖励
        const expGain = 50 + this.currentCombat.round * 5;
        const itemDropChance = 0.3 + (window.gameManager.currentPlayer.luck || 0) * 0.01;
        
        this.addCombatLog(`获得经验值：${expGain}`);
        
        if (Math.random() < itemDropChance) {
            this.addCombatLog('从敌人身上获得了道具！');
            // 这里可以添加获得随机道具的逻辑
        }
        
        // 显示结束按钮
        document.getElementById('close-combat').classList.remove('hidden');
        document.getElementById('combat-state').textContent = '战斗胜利';
        
        // 更新玩家数据
        window.gameManager.currentPlayer.hp = this.currentCombat.playerHP;
        window.gameManager.updatePlayerUI();
        window.gameManager.saveCurrentPlayer();
    }
    
    // 失败
    defeat() {
        this.combatState = 'ended';
        
        this.addCombatLog(`💀 你被 ${this.currentCombat.targetName} 杀死了！`);
        this.addCombatLog('战斗失败...');
        
        // 死亡惩罚
        window.gameManager.currentPlayer.hp = 0;
        window.gameManager.currentPlayer.isAlive = false;
        
        window.gameManager.updatePlayerUI();
        window.gameManager.saveCurrentPlayer();
        
        // 显示结束按钮
        document.getElementById('close-combat').classList.remove('hidden');
        document.getElementById('combat-state').textContent = '战斗失败';
        
        window.gameManager.showMessage('你被杀死了！角色已死亡，无法行动。');
    }
    
    // 结束战斗
    endCombat() {
        this.combatState = 'idle';
        this.currentCombat = null;
        this.playerDefending = false;
        this.enemyDefending = false;
        this.escapeAttempts = 0;
    }
    
    // 更新战斗UI
    updateCombatUI() {
        // 更新HP显示
        document.getElementById('player-hp').textContent = this.currentCombat.playerHP;
        document.getElementById('enemy-hp').textContent = this.currentCombat.enemyHP;
        
        // 更新HP条
        const playerHpPercent = (this.currentCombat.playerHP / window.gameManager.currentPlayer.maxHp) * 100;
        const enemyHpPercent = (this.currentCombat.enemyHP / 100) * 100; // 假设敌人最大HP为100
        
        document.getElementById('player-hp-bar').style.width = `${playerHpPercent}%`;
        document.getElementById('enemy-hp-bar').style.width = `${enemyHpPercent}%`;
        
        // 更新防御状态
        document.getElementById('player-defense').textContent = this.playerDefending ? '50' : '0';
        document.getElementById('enemy-defense').textContent = this.enemyDefending ? '50' : '0';
    }
    
    // 启用/禁用玩家控制
    enablePlayerControls(enabled) {
        const buttons = ['attack-btn', 'defend-btn', 'skill-btn', 'item-btn', 'escape-btn', 'surrender-btn'];
        
        buttons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.disabled = !enabled;
                btn.style.opacity = enabled ? '1' : '0.5';
            }
        });
    }
    
    // 添加战斗日志
    addCombatLog(message) {
        const combatLog = document.getElementById('combat-log');
        if (combatLog) {
            const logEntry = document.createElement('div');
            logEntry.className = 'combat-log-entry';
            logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
            combatLog.appendChild(logEntry);
            combatLog.scrollTop = combatLog.scrollHeight;
        }
        
        this.combatLog.push(message);
    }
    
    // 切换自动战斗
    toggleAutoCombat() {
        // 自动战斗逻辑
        this.addCombatLog('自动战斗功能开发中...');
    }
}

// 创建改进的战斗系统实例
const improvedCombatSystem = new ImprovedCombatSystem();

// 导出到全局
window.combatSystem = improvedCombatSystem;
window.startCombat = (targetId, targetName) => improvedCombatSystem.startCombat(targetId, targetName);