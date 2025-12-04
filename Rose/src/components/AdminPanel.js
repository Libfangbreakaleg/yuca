import React, { useState, useEffect } from 'react';
import { database } from '../firebase/config';
import { ref, get, set, update, remove } from 'firebase/database';
import { ITEMS } from '../utils/items';
import { generateRandomItems } from '../utils/gameLogic';

function AdminPanel() {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [gameState, setGameState] = useState({ day: 1, lastRefresh: Date.now() });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    try {
      setLoading(true);
      
      // 加载玩家数据
      const playersSnapshot = await get(ref(database, 'players'));
      if (playersSnapshot.exists()) {
        const playersData = playersSnapshot.val();
        setPlayers(Object.values(playersData));
      }
      
      // 加载游戏状态
      const stateSnapshot = await get(ref(database, 'gameState'));
      if (stateSnapshot.exists()) {
        setGameState(stateSnapshot.val());
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormatGame = async () => {
    if (window.confirm('⚠️ 警告：这将清除所有玩家数据和游戏状态！确定要格式化游戏吗？')) {
      try {
        // 清除所有玩家数据
        await set(ref(database, 'players'), {});
        
        // 重置游戏状态
        await set(ref(database, 'gameState'), {
          day: 1,
          lastRefresh: Date.now(),
          items: generateRandomItems()
        });
        
        alert('✅ 游戏已成功格式化！');
        loadGameData();
      } catch (error) {
        alert('❌ 格式化失败：' + error.message);
      }
    }
  };

  const updatePlayerStat = async (playerId, stat, value) => {
    try {
      await update(ref(database, `players/${playerId}`), {
        [stat]: parseInt(value) || 0
      });
      
      // 更新本地状态
      setPlayers(prev => prev.map(p => 
        p.id === playerId ? { ...p, [stat]: parseInt(value) || 0 } : p
      ));
      
      if (selectedPlayer && selectedPlayer.id === playerId) {
        setSelectedPlayer(prev => ({ ...prev, [stat]: parseInt(value) || 0 }));
      }
    } catch (error) {
      alert('更新失败：' + error.message);
    }
  };

  const addItemToPlayer = async (playerId, itemId) => {
    const player = players.find(p => p.id === playerId);
    const item = ITEMS.find(i => i.id === itemId);
    
    if (player && item) {
      try {
        const newInventory = [...(player.inventory || []), item];
        await update(ref(database, `players/${playerId}`), {
          inventory: newInventory
        });
        
        // 更新本地状态
        setPlayers(prev => prev.map(p => 
          p.id === playerId ? { ...p, inventory: newInventory } : p
        ));
        
        if (selectedPlayer && selectedPlayer.id === playerId) {
          setSelectedPlayer(prev => ({ ...prev, inventory: newInventory }));
        }
        
        alert(`✅ 已添加 ${item.name} 到 ${player.name} 的背包`);
      } catch (error) {
        alert('添加道具失败：' + error.message);
      }
    }
  };

  const removeItemFromPlayer = async (playerId, itemIndex) => {
    const player = players.find(p => p.id === playerId);
    if (player && player.inventory && player.inventory[itemIndex]) {
      try {
        const itemName = player.inventory[itemIndex].name;
        const newInventory = player.inventory.filter((_, index) => index !== itemIndex);
        
        await update(ref(database, `players/${playerId}`), {
          inventory: newInventory
        });
        
        // 更新本地状态
        setPlayers(prev => prev.map(p => 
          p.id === playerId ? { ...p, inventory: newInventory } : p
        ));
        
        if (selectedPlayer && selectedPlayer.id === playerId) {
          setSelectedPlayer(prev => ({ ...prev, inventory: newInventory }));
        }
        
        alert(`✅ 已移除 ${itemName}`);
      } catch (error) {
        alert('移除道具失败：' + error.message);
      }
    }
  };

  const deletePlayer = async (playerId) => {
    const player = players.find(p => p.id === playerId);
    if (player && window.confirm(`确定要删除玩家 ${player.name} 吗？`)) {
      try {
        await remove(ref(database, `players/${playerId}`));
        setPlayers(prev => prev.filter(p => p.id !== playerId));
        if (selectedPlayer && selectedPlayer.id === playerId) {
          setSelectedPlayer(null);
        }
        alert('✅ 玩家已删除');
      } catch (error) {
        alert('删除失败：' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="admin-panel">
        <h2>⚙️ 游戏管理面板</h2>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '24px', marginBottom: '20px' }}>🌀</div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <h2>⚙️ 游戏管理面板</h2>
      
      <div className="admin-controls">
        <button onClick={handleFormatGame} className="danger-btn">
          💥 格式化游戏
        </button>
        
        <button onClick={loadGameData} className="refresh-btn">
          🔄 刷新数据
        </button>
        
        <button 
          onClick={() => alert(`当前游戏天数：第 ${gameState.day} 天`)}
          style={{ background: 'linear-gradient(135deg, #3498db, #2980b9)' }}
        >
          📅 查看游戏天数
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <div className="players-list">
          <h3>👥 玩家列表 ({players.length}人)</h3>
          {players.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
              暂无玩家数据
            </div>
          ) : (
            players.map(player => (
              <div 
                key={player.id}
                className={`player-card ${selectedPlayer?.id === player.id ? 'selected' : ''}`}
                onClick={() => setSelectedPlayer(player)}
              >
                <div className="player-name">
                  {player.name}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePlayer(player.id);
                    }}
                    style={{ 
                      float: 'right', 
                      background: '#e74c3c', 
                      color: 'white', 
                      border: 'none',
                      borderRadius: '5px',
                      padding: '2px 8px',
                      fontSize: '12px'
                    }}
                  >
                    删除
                  </button>
                </div>
                <div className="player-stats">
                  <span>❤️ {player.hp}/{player.maxHp}</span>
                  <span>🧠 {player.san}/{player.maxSan}</span>
                  <span>{player.isAlive ? '🟢' : '💀'}</span>
                </div>
              </div>
            ))
          )}
        </div>
        
        {selectedPlayer && (
          <div className="player-detail" style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>👤 玩家详情: {selectedPlayer.name}</h3>
              <span style={{ color: '#666', fontSize: '14px' }}>
                创建时间: {new Date(selectedPlayer.createdAt).toLocaleString()}
              </span>
            </div>
            
            <div className="stats-editor">
              <div className="stat-control">
                <label>❤️ HP:</label>
                <input
                  type="number"
                  value={selectedPlayer.hp}
                  onChange={(e) => updatePlayerStat(selectedPlayer.id, 'hp', e.target.value)}
                />
                <span>/ {selectedPlayer.maxHp}</span>
              </div>
              
              <div className="stat-control">
                <label>🧠 SAN:</label>
                <input
                  type="number"
                  value={selectedPlayer.san}
                  onChange={(e) => updatePlayerStat(selectedPlayer.id, 'san', e.target.value)}
                />
                <span>/ {selectedPlayer.maxSan}</span>
              </div>
              
              <div className="stat-control">
                <label>💪 力量:</label>
                <input
                  type="number"
                  value={selectedPlayer.power}
                  onChange={(e) => updatePlayerStat(selectedPlayer.id, 'power', e.target.value)}
                />
              </div>
              
              <div className="stat-control">
                <label>⚡ 敏捷:</label>
                <input
                  type="number"
                  value={selectedPlayer.agility}
                  onChange={(e) => updatePlayerStat(selectedPlayer.id, 'agility', e.target.value)}
                />
              </div>
              
              <div className="stat-control">
                <label>🌿 治疗:</label>
                <input
                  type="number"
                  value={selectedPlayer.heal}
                  onChange={(e) => updatePlayerStat(selectedPlayer.id, 'heal', e.target.value)}
                />
              </div>
              
              <div className="stat-control">
                <label>🍀 幸运:</label>
                <input
                  type="number"
                  value={selectedPlayer.luck}
                  onChange={(e) => updatePlayerStat(selectedPlayer.id, 'luck', e.target.value)}
                />
              </div>
            </div>
            
            <div className="inventory-management">
              <h4>🎒 背包管理</h4>
              <div className="add-item">
                <select 
                  onChange={(e) => {
                    if (e.target.value) {
                      addItemToPlayer(selectedPlayer.id, parseInt(e.target.value));
                      e.target.value = '';
                    }
                  }}
                  style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
                >
                  <option value="">📦 选择要添加的道具...</option>
                  {ITEMS.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} (+{item.power}力 +{item.luck}运)
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="inventory-list">
                {selectedPlayer.inventory && selectedPlayer.inventory.length > 0 ? (
                  selectedPlayer.inventory.map((item, index) => (
                    <div key={index} className="inventory-item-admin">
                      <span>{item.name} - {item.description}</span>
                      <button 
                        onClick={() => removeItemFromPlayer(selectedPlayer.id, index)}
                        className="remove-btn"
                      >
                        移除
                      </button>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    背包空空如也
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;