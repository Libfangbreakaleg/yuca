import React, { useState, useEffect } from 'react';
import { ref, set, get } from 'firebase/database';
import { database } from './firebase/config';
import Login from './components/Login';
import GameMap2D from './components/GameMap2D';
import PlayerPanel from './components/PlayerPanel';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [gameState, setGameState] = useState({ day: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseAvailable, setFirebaseAvailable] = useState(true);

  // 本地存储键名
  const STORAGE_KEYS = {
    PLAYER: 'rose_manor_player',
    GAME_STATE: 'rose_manor_game_state',
    IS_ADMIN: 'rose_manor_is_admin'
  };

  // 初始化游戏
  useEffect(() => {
    const initGame = async () => {
      try {
        // 尝试连接 Firebase
        console.log('正在初始化 Firebase...');
        const snapshot = await get(ref(database, 'gameState'));
        
        if (!snapshot.exists()) {
          console.log('创建初始游戏状态...');
          await set(ref(database, 'gameState'), {
            day: 1,
            lastRefresh: Date.now(),
            items: []
          });
        } else {
          const firebaseState = snapshot.val();
          setGameState(firebaseState);
        }
        
        setFirebaseAvailable(true);
        console.log('Firebase 连接成功');
        
      } catch (error) {
        console.log('Firebase 连接失败，使用本地存储:', error.message);
        setFirebaseAvailable(false);
        
        // 尝试从本地存储加载游戏状态
        const localGameState = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
        if (localGameState) {
          setGameState(JSON.parse(localGameState));
        }
      } finally {
        setIsLoading(false);
      }
    };

    // 从本地存储恢复登录状态
    const savedPlayer = localStorage.getItem(STORAGE_KEYS.PLAYER);
    const savedAdmin = localStorage.getItem(STORAGE_KEYS.IS_ADMIN);
    
    if (savedPlayer) {
      try {
        setCurrentPlayer(JSON.parse(savedPlayer));
      } catch (e) {
        localStorage.removeItem(STORAGE_KEYS.PLAYER);
      }
    }
    
    if (savedAdmin === 'true') {
      setIsAdmin(true);
    }

    initGame();
    
    // 清理函数
    return () => {
      // 如果有需要清理的内容
    };
  }, []);

  // 保存玩家数据
  const savePlayerData = async (playerData) => {
    // 保存到本地存储
    localStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(playerData));
    
    // 如果 Firebase 可用，也保存到云端
    if (firebaseAvailable) {
      try {
        await set(ref(database, `players/${playerData.id}`), playerData);
        console.log('玩家数据已保存到 Firebase');
      } catch (error) {
        console.error('保存到 Firebase 失败:', error);
      }
    }
  };

  // 处理登录
  const handleLogin = async (playerData, isAdminMode = false) => {
    if (isAdminMode) {
      // 管理员登录
      setIsAdmin(true);
      localStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'true');
      console.log('管理员已登录');
    } else {
      // 玩家登录
      const playerWithDefaults = {
        ...playerData,
        // 确保有默认值
        actionPoints: playerData.actionPoints || 10,
        inventory: playerData.inventory || [],
        location: playerData.location || '大厅',
        createdAt: playerData.createdAt || Date.now(),
        lastPlayed: Date.now()
      };
      
      setCurrentPlayer(playerWithDefaults);
      await savePlayerData(playerWithDefaults);
      console.log('玩家已登录:', playerWithDefaults.name);
    }
  };

  // 处理登出
  const handleLogout = () => {
    setCurrentPlayer(null);
    setIsAdmin(false);
    
    // 清除本地存储
    localStorage.removeItem(STORAGE_KEYS.PLAYER);
    localStorage.removeItem(STORAGE_KEYS.IS_ADMIN);
    
    console.log('已登出');
  };

  // 更新游戏状态（例如天数增加）
  const updateGameState = async (updates) => {
    const newState = { ...gameState, ...updates };
    setGameState(newState);
    
    // 保存到本地存储
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(newState));
    
    // 如果 Firebase 可用，也保存到云端
    if (firebaseAvailable) {
      try {
        await set(ref(database, 'gameState'), newState);
      } catch (error) {
        console.error('更新 Firebase 游戏状态失败:', error);
      }
    }
  };

  // 更新玩家数据（例如属性变化）
  const updatePlayerData = async (updates) => {
    if (!currentPlayer) return;
    
    const updatedPlayer = { ...currentPlayer, ...updates, lastPlayed: Date.now() };
    setCurrentPlayer(updatedPlayer);
    await savePlayerData(updatedPlayer);
  };

  // 加载中界面
  if (isLoading) {
    return (
      <div className="App loading-screen">
        <div className="loading-content">
          <div className="rose-icon">🌹</div>
          <h1>小玫瑰庄园</h1>
          <p>加载中...</p>
          <div className="loading-spinner"></div>
          {!firebaseAvailable && (
            <div className="offline-notice">
              <small>⚠️ 离线模式 - 数据保存在本地</small>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 未登录时显示登录页面
  if (!currentPlayer && !isAdmin) {
    return (
      <div className="App">
        {!firebaseAvailable && (
          <div className="offline-banner">
            <span>⚠️ 离线模式 - 数据保存在本地</span>
          </div>
        )}
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  // 管理员模式
  if (isAdmin) {
    return (
      <div className="App">
        <div className="game-header">
          <div className="day-counter">
            管理员模式 {!firebaseAvailable && <span className="offline-badge">离线</span>}
          </div>
          <h1>👑 小玫瑰庄园管理面板</h1>
          <button onClick={handleLogout} className="logout-btn">
            退出管理
          </button>
        </div>
        <AdminPanel 
          firebaseAvailable={firebaseAvailable}
          updateGameState={updateGameState}
        />
      </div>
    );
  }

  // 玩家游戏界面
  return (
    <div className="App">
      {/* 顶部状态栏 */}
      <div className="game-header">
        <div className="day-counter">
          第 {gameState.day} 天 
          {!firebaseAvailable && <span className="offline-badge">离线</span>}
          <span className="action-points">
            行动点: {currentPlayer.actionPoints || 10}
          </span>
        </div>
        <h1>🌹 小玫瑰庄园 🌹</h1>
        <button onClick={handleLogout} className="logout-btn">
          退出游戏
        </button>
      </div>

      {/* 离线提示条 */}
      {!firebaseAvailable && (
        <div className="offline-banner">
          <span>
            ⚠️ 离线模式 - 数据保存在本地，恢复网络连接后自动同步
          </span>
        </div>
      )}

      {/* 主游戏区域 */}
      <div className="game-container">
        {/* 左侧玩家面板 */}
        <div className="left-panel">
          <PlayerPanel 
            player={currentPlayer}
            updatePlayer={updatePlayerData}
          />
          
          {/* 快捷操作 */}
          <div className="quick-actions">
            <h3>快捷操作</h3>
            <button 
              className="quick-btn"
              onClick={() => updatePlayerData({ actionPoints: (currentPlayer.actionPoints || 10) + 1 })}
            >
              恢复1行动点
            </button>
            <button 
              className="quick-btn"
              onClick={() => updateGameState({ day: gameState.day + 1 })}
            >
              进入下一天
            </button>
          </div>
        </div>

        {/* 主游戏内容 */}
        <div className="main-content">
          <GameMap2D 
            player={currentPlayer}
            updatePlayer={updatePlayerData}
          />
          
          {/* 游戏提示 */}
          <div className="game-tips">
            <h3>游戏提示</h3>
            <p>点击地图上的地点进行探索，每个地点都有独特的事件和物品。</p>
            <p>行动点每天重置，合理分配行动点以最大化收益。</p>
            {!firebaseAvailable && (
              <p className="offline-tip">
                <strong>离线模式提示：</strong> 游戏进度保存在本地浏览器中，请勿清除浏览器数据。
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 底部状态栏 */}
      <div className="status-footer">
        <span>玩家: {currentPlayer.name}</span>
        <span>位置: {currentPlayer.location || '庄园大厅'}</span>
        <span>状态: {currentPlayer.isAlive ? '正常' : '已死亡'}</span>
        {firebaseAvailable && <span className="online-status">● 在线</span>}
        {!firebaseAvailable && <span className="offline-status">● 离线</span>}
      </div>
    </div>
  );
}

export default App;
