// game.js - 游戏核心逻辑 (已整合管理员登录功能)
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, update, onValue, remove } from "firebase/database";

// ==================== 1. Firebase 配置 (必须替换！) ====================
const firebaseConfig = {
  apiKey: "AIzaSyCwDlSDJwLgTleetPH5iCfEH01JiPyCRoQ",
  authDomain: "my-game-6273c.firebaseapp.com",
  databaseURL: "https://my-game-6273c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "my-game-6273c",
  storageBucket: "my-game-6273c.firebasestorage.app",
  messagingSenderId: "G-RFHNTER82D",
  appId: "1:407172408466:web:c7dbed948732b91d1db24b"
};
// ==================== 注意：请务必将上面的值替换成你自己的Firebase项目配置 ====================

// 初始化Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ==================== 2. 游戏全局状态 ====================
let currentPlayer = null; // 当前登录的玩家信息
let isAdminMode = false;  // 是否为管理员模式

// ==================== 3. 玩家登录/注册系统 ====================
async function loginOrRegister() {
    const playerName = document.getElementById('playerName').value.trim();
    if (!playerName) {
        alert('请输入角色名！');
        return;
    }

    const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const playerRef = ref(db, 'players/' + playerId);

    try {
        // 创建新玩家数据
        const playerData = {
            id: playerId,
            name: playerName,
            health: 100,
            maxHealth: 100,
            sanity: 100,
            maxSanity: 100,
            strength: 10,
            agility: 10,
            healing: 5,
            luck: 5,
            inventory: {},
            isAlive: true,
            actionPoints: 10,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        await set(playerRef, playerData);
        
        currentPlayer = playerData;
        isAdminMode = false;
        
        alert(`欢迎来到变形山谷，${playerName}！`);
        switchToGameView();
        startListeningToPlayerData(playerId);
        
    } catch (error) {
        console.error("创建玩家失败:", error);
        alert('创建角色失败，请检查网络或控制台。');
    }
}

// ==================== 4. 管理员登录验证 ====================
function adminLogin() {
    const passwordInput = document.getElementById('adminPasswordInput');
    const password = passwordInput.value.trim();
    
    // 验证密码 (你设置的密码：20041018)
    if (password === '20041018') {
        // 登录成功
        currentPlayer = {
            id: 'admin',
            name: '系统管理员',
            isAdmin: true
        };
        isAdminMode = true;
        
        // 清空密码框
        passwordInput.value = '';
        
        alert('✅ 管理员身份验证成功！正在进入控制台...');
        switchToGameView();
        loadAllPlayersForAdmin(); // 加载所有玩家数据供管理员查看
        
    } else {
        alert('❌ 密钥错误！请重新输入。');
        passwordInput.value = '';
        passwordInput.focus(); // 重新聚焦到输入框
    }
}

// ==================== 5. 界面切换函数 ====================
function switchToGameView() {
    // 隐藏登录界面
    document.getElementById('loginScreen').style.display = 'none';
    
    // 显示游戏主界面
    const gameScreen = document.getElementById('gameScreen');
    gameScreen.style.display = 'block';
    
    // 根据模式更新界面显示
    if (isAdminMode) {
        // 管理员模式
        document.querySelector('.player-info').innerHTML = `
            <span style="color:#ff6b6b; font-weight:bold;">🔧 系统管理员</span>
            <span style="color:#aaa;">(管理控制模式)</span>
        `;
        
        // 显示管理员面板
        document.getElementById('adminPanel').style.display = 'block';
        
        // 更改标题提示
        document.getElementById('currentLocationName').textContent = '管理员控制台';
        
    } else {
        // 普通玩家模式
        document.getElementById('playerDisplayName').textContent = currentPlayer.name;
        document.getElementById('healthValue').textContent = currentPlayer.health;
        document.getElementById('sanityValue').textContent = currentPlayer.sanity;
        
        // 隐藏管理员面板
        document.getElementById('adminPanel').style.display = 'none';
    }
}

// ==================== 6. 玩家数据实时监听 ====================
function startListeningToPlayerData(playerId) {
    const playerRef = ref(db, 'players/' + playerId);
    
    onValue(playerRef, (snapshot) => {
        const playerData = snapshot.val();
        if (playerData) {
            updatePlayerUI(playerData);
        }
    }, (error) => {
        console.error("监听玩家数据失败:", error);
    });
}

// ==================== 7. 更新玩家界面显示 ====================
function updatePlayerUI(playerData) {
    if (isAdminMode) return; // 管理员模式不更新这些
    
    // 更新顶部状态栏
    document.getElementById('healthValue').textContent = playerData.health;
    document.getElementById('sanityValue').textContent = playerData.sanity;
    document.getElementById('actionPointsDisplay').textContent = playerData.actionPoints;
    
    // 更新属性面板
    document.getElementById('attrStrength').textContent = playerData.strength;
    document.getElementById('attrAgility').textContent = playerData.agility;
    document.getElementById('attrHealing').textContent = playerData.healing;
    document.getElementById('attrLuck').textContent = playerData.luck;
    
    // 更新背包
    updateInventoryDisplay(playerData.inventory);
}

// ==================== 8. 背包显示更新 ====================
function updateInventoryDisplay(inventory) {
    const inventoryList = document.getElementById('inventoryList');
    
    if (!inventory || Object.keys(inventory).length === 0) {
        inventoryList.innerHTML = '<p class="empty">背包空空如也。</p>';
        return;
    }
    
    let html = '';
    for (const itemId in inventory) {
        const item = inventory[itemId];
        html += `
            <div class="inventory-item">
                <strong>${item.name || '未知道具'}</strong>
                <small>${item.obtainedAt ? new Date(item.obtainedAt).toLocaleDateString() : ''}</small>
            </div>
        `;
    }
    
    inventoryList.innerHTML = html;
}

// ==================== 9. 管理员功能：加载所有玩家 ====================
function loadAllPlayersForAdmin() {
    const playersRef = ref(db, 'players');
    
    onValue(playersRef, (snapshot) => {
        const allPlayers = snapshot.val();
        displayPlayerListForAdmin(allPlayers);
    });
}

function displayPlayerListForAdmin(players) {
    const adminControls = document.getElementById('adminControls');
    
    if (!players || Object.keys(players).length === 0) {
        adminControls.innerHTML = '<p style="color:#888;">暂无玩家数据。</p>';
        return;
    }
    
    let html = '<h4>👥 玩家管理系统</h4>';
    html += '<div style="max-height:400px; overflow-y:auto; margin-top:15px;">';
    
    for (const playerId in players) {
        const player = players[playerId];
        const inventoryCount = player.inventory ? Object.keys(player.inventory).length : 0;
        
        html += `
            <div class="player-card" style="
                background: linear-gradient(45deg, rgba(40,25,60,0.7), rgba(60,35,80,0.7));
                padding: 15px;
                margin: 10px 0;
                border-radius: 8px;
                border-left: 4px solid ${player.isAlive ? '#4CAF50' : '#F44336'};
            ">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong style="color:#e0d0ff;">${player.name}</strong>
                        <small style="color:#aaa; margin-left:10px;">ID: ${playerId.substr(0, 8)}...</small>
                    </div>
                    <span style="color:${player.isAlive ? '#4CAF50' : '#F44336'};">
                        ${player.isAlive ? '存活' : '已倒下'}
                    </span>
                </div>
                
                <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px; margin-top:10px;">
                    <div>❤️ 血量: <strong>${player.health}/${player.maxHealth}</strong></div>
                    <div>🧠 San值: <strong>${player.sanity}/${player.maxSanity}</strong></div>
                    <div>⚡ 行动点: <strong>${player.actionPoints}</strong></div>
                    <div>🎒 背包: <strong>${inventoryCount}件</strong></div>
                </div>
                
                <div style="margin-top:10px; font-size:0.9em; color:#bbb;">
                    创建于: ${new Date(player.createdAt).toLocaleString()}
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    
    // 添加管理按钮
    html += `
        <div style="margin-top:20px; display:flex; gap:10px;">
            <button onclick="forceResetGame()" style="
                padding:10px 15px;
                background:linear-gradient(45deg, #F44336, #E91E63);
                color:white;
                border:none;
                border-radius:5px;
                cursor:pointer;
                flex:1;
            ">
                🔄 强制重置游戏
            </button>
            <button onclick="refreshAllPlayers()" style="
                padding:10px 15px;
                background:linear-gradient(45deg, #2196F3, #03A9F4);
                color:white;
                border:none;
                border-radius:5px;
                cursor:pointer;
                flex:1;
            ">
                📊 刷新玩家数据
            </button>
        </div>
    `;
    
    adminControls.innerHTML = html;
}

// ==================== 10. 地图地点点击处理 ====================
function setupMapLocationButtons() {
    const locationButtons = document.querySelectorAll('.location-btn');
    
    locationButtons.forEach(button => {
        button.addEventListener('click', function() {
            const locationId = this.getAttribute('data-location');
            enterLocation(locationId);
        });
    });
}

function enterLocation(locationId) {
    if (isAdminMode) {
        alert('管理员模式：正在查看地点数据...');
        // 这里可以添加管理员查看地点数据的功能
        return;
    }
    
    // 检查行动点
    if (currentPlayer.actionPoints <= 0) {
        alert('行动点不足！请等待明天恢复或使用道具。');
        return;
    }
    
    // 更新界面显示
    const locationNames = {
        'room_101': '101号房间',
        'garden': '静谧花园',
        'library': '古老图书室',
        'hotspring': '山间温泉'
    };
    
    document.getElementById('currentLocationName').textContent = 
        locationNames[locationId] || locationId;
    
    // 显示场景描述
    const descriptions = {
        'room_101': '一间略显陈旧的客房，木质家具散发着淡淡霉味。书桌抽屉半开着...',
        'garden': '月光下的花园异常静谧，藤蔓在微风中轻轻摆动，石凳上似乎放着什么东西...',
        'library': '成排的书架散发着旧纸和皮革的气味，安静的只有你的呼吸声...',
        'hotspring': '温泉水面雾气氤氲，岩石边缘放着客人们遗忘的物品...'
    };
    
    document.getElementById('locationDescription').innerHTML = 
        `<p>${descriptions[locationId] || '一个未知的地点...'}</p>`;
    
    // 这里未来可以加载Three.js 3D场景
    document.getElementById('threejsContainer').innerHTML = `
        <div style="text-align:center; padding:50px;">
            <h3>🎮 3D场景加载中...</h3>
            <p>未来这里将显示完整的3D探索场景</p>
            <button onclick="exploreLocation('${locationId}')" style="
                padding:12px 25px;
                background:linear-gradient(45deg, #6a3cb8, #8a5cea);
                color:white;
                border:none;
                border-radius:8px;
                cursor:pointer;
                margin-top:20px;
            ">
                开始探索此地
            </button>
        </div>
    `;
}

// ==================== 11. 地点探索功能 ====================
async function exploreLocation(locationId) {
    if (isAdminMode) {
        alert('管理员不能进行探索。');
        return;
    }
    
    if (!currentPlayer || currentPlayer.actionPoints <= 0) {
        alert('行动点不足！');
        return;
    }
    
    try {
        // 扣除行动点
        await update(ref(db, `players/${currentPlayer.id}`), {
            actionPoints: currentPlayer.actionPoints - 1
        });
        
        // 模拟探索结果
        const outcomes = [
            { type: 'item', text: '你发现了一把生锈的钥匙！', item: '生锈的钥匙' },
            { type: 'clue', text: '你注意到桌角有奇怪的刻痕...', clue: '奇怪的刻痕' },
            { type: 'damage', text: '触发陷阱！受到5点伤害。', damage: 5 },
            { type: 'sanity', text: '诡异的低语声...理智值下降。', sanityLoss: 10 },
            { type: 'nothing', text: '仔细搜索后，这里似乎什么都没有。' }
        ];
        
        const result = outcomes[Math.floor(Math.random() * outcomes.length)];
        
        // 显示探索结果
        const clueBox = document.getElementById('clueDisplay');
        clueBox.innerHTML = `<strong>探索结果：</strong> ${result.text}`;
        clueBox.style.display = 'block';
        
        // 处理不同结果
        if (result.type === 'damage' && currentPlayer.health > 0) {
            const newHealth = Math.max(0, currentPlayer.health - result.damage);
            await update(ref(db, `players/${currentPlayer.id}`), {
                health: newHealth
            });
            
            if (newHealth <= 0) {
                await update(ref(db, `players/${currentPlayer.id}`), {
                    isAlive: false
                });
                alert('💀 你倒下了！生命值归零。');
            }
        }
        
        if (result.type === 'sanity' && currentPlayer.sanity > 0) {
            const newSanity = Math.max(0, currentPlayer.sanity - result.sanityLoss);
            await update(ref(db, `players/${currentPlayer.id}`), {
                sanity: newSanity
            });
        }
        
        if (result.type === 'item') {
            // 简化：直接添加到背包
            const itemId = `item_${Date.now()}`;
            const updates = {};
            updates[`players/${currentPlayer.id}/inventory/${itemId}`] = {
                name: result.item,
                obtainedAt: new Date().toISOString(),
                fromLocation: locationId
            };
            
            await update(ref(db), updates);
        }
        
        // 显示剩余行动点
        alert(`探索完成！剩余行动点: ${currentPlayer.actionPoints - 1}`);
        
    } catch (error) {
        console.error("探索失败:", error);
        alert('探索过程中发生错误。');
    }
}

// ==================== 12. 管理员控制功能 ====================
async function forceResetGame() {
    if (!isAdminMode || !window.confirm('⚠️ 确定要强制重置游戏吗？这将重置所有地点的道具状态！')) {
        return;
    }
    
    try {
        alert('🔄 游戏重置功能开发中...');
        // 这里可以添加重置逻辑
    } catch (error) {
        console.error("重置失败:", error);
        alert('重置失败，请查看控制台。');
    }
}

async function refreshAllPlayers() {
    if (!isAdminMode) return;
    
    loadAllPlayersForAdmin();
    alert('玩家数据已刷新！');
}

// ==================== 13. 游戏初始化 ====================
function initGame() {
    console.log('🎮 游戏初始化开始...');
    
    // 绑定玩家登录按钮
    document.getElementById('loginBtn').addEventListener('click', loginOrRegister);
    
    // 绑定管理员登录按钮
    document.getElementById('adminLoginBtn').addEventListener('click', adminLogin);
    
    // 设置地图地点按钮
    setupMapLocationButtons();
    
    // 允许按回车键触发登录
    document.getElementById('playerName').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') loginOrRegister();
    });
    
    document.getElementById('adminPasswordInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') adminLogin();
    });
    
    // 检查是否已有登录状态（简化版）
    const savedPlayer = localStorage.getItem('lastPlayer');
    if (savedPlayer) {
        console.log('检测到上次登录记录:', savedPlayer);
    }
    
    console.log('✅ 游戏初始化完成！');
}

// ==================== 14. 页面加载完成后启动游戏 ====================
window.addEventListener('DOMContentLoaded', initGame);

// 将一些函数暴露给全局，以便HTML按钮调用
window.exploreLocation = exploreLocation;
window.forceResetGame = forceResetGame;
window.refreshAllPlayers = refreshAllPlayers;