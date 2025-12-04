import React from 'react';

function PlayerPanel({ player }) {
  if (!player) return null;

  return (
    <div className="player-panel">
      <h3>👤 玩家信息: {player.name}</h3>
      
      <div className="stat-bar">
        <label>❤️ 生命值 (HP):</label>
        <div className="bar-container">
          <div 
            className="bar-fill hp"
            style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
          ></div>
          <div className="bar-text">
            {player.hp} / {player.maxHp}
          </div>
        </div>
      </div>
      
      <div className="stat-bar">
        <label>🧠 理智值 (SAN):</label>
        <div className="bar-container">
          <div 
            className="bar-fill san"
            style={{ width: `${(player.san / player.maxSan) * 100}%` }}
          ></div>
          <div className="bar-text">
            {player.san} / {player.maxSan}
          </div>
        </div>
      </div>
      
      <div className="stats-display">
        <div className="stat-box">
          <div className="label">💪 力量</div>
          <div className="value">{player.power}</div>
        </div>
        <div className="stat-box">
          <div className="label">⚡ 敏捷</div>
          <div className="value">{player.agility}</div>
        </div>
        <div className="stat-box">
          <div className="label">🌿 治疗</div>
          <div className="value">{player.heal}</div>
        </div>
        <div className="stat-box">
          <div className="label">🍀 幸运</div>
          <div className="value">{player.luck}</div>
        </div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4>🎒 背包 ({player.inventory?.length || 0}/20)</h4>
          <span>行动点: {player.actionPoints}</span>
        </div>
        
        <div className="inventory-grid">
          {player.inventory && player.inventory.length > 0 ? (
            player.inventory.slice(0, 8).map((item, index) => (
              <div key={index} className="inventory-item" title={item.description}>
                {item.name}
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#666' }}>
              背包空空如也
            </div>
          )}
        </div>
        
        {player.inventory && player.inventory.length > 8 && (
          <div style={{ textAlign: 'center', marginTop: '10px', color: '#4a6491' }}>
            还有 {player.inventory.length - 8} 件物品...
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
        <h4>⚔️ 状态</h4>
        <p>状态: {player.isAlive ? '🟢 存活' : '💀 已死亡'}</p>
        {!player.isAlive && (
          <p style={{ color: '#ff416c' }}>你已死亡，无法行动</p>
        )}
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          className="logout-btn"
          style={{ width: '100%', background: 'linear-gradient(135deg, #4a6491, #2c3e50)' }}
          onClick={() => alert('治疗功能开发中...')}
        >
          🌿 治疗自己 (消耗2行动点)
        </button>
      </div>
    </div>
  );
}

export default PlayerPanel;