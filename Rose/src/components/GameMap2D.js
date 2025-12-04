import React, { useState } from 'react';
import { calculateSearchResult } from '../utils/gameLogic';

const LOCATIONS = [
  { id: 'courtyard', name: '独立院落', x: 100, y: 150, type: 'interior' },
  { id: 'hotspring', name: '温泉', x: 250, y: 80, type: 'exterior' },
  { id: 'library', name: '图书室', x: 400, y: 150, type: 'interior' },
  { id: 'gym', name: '健身房', x: 300, y: 300, type: 'interior' },
  { id: 'cafe', name: '咖啡馆', x: 350, y: 350, type: 'interior' },
  { id: 'garden', name: '大花园', x: 500, y: 200, type: 'exterior' },
  { id: 'waterfall', name: '人造瀑布', x: 600, y: 100, type: 'exterior' },
  { id: 'campsite', name: '山顶野营地', x: 700, y: 50, type: 'exterior' },
];

function GameMap2D({ player, onActionComplete }) {
  const [currentScene, setCurrentScene] = useState(null);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [searchResult, setSearchResult] = useState(null);

  const handleLocationClick = async (locationId) => {
    if (player.actionPoints <= 0) {
      alert('行动点不足！');
      return;
    }

    // 消耗1行动点进入场景
    onActionComplete(1);
    
    // 进入3D场景
    setCurrentScene(locationId);
  };

  const handleMiniMapClick = async (itemLocation) => {
    if (player.actionPoints <= 0) {
      alert('行动点不足！');
      return;
    }

    if (player.hp <= 0 || player.san <= 0) {
      alert('你已死亡，无法行动！');
      return;
    }

    // 消耗1行动点搜索
    onActionComplete(1);
    
    // 获取搜索结果
    const result = calculateSearchResult(player.luck, itemLocation);
    setSearchResult(result);
    
    // 显示结果
    setTimeout(() => {
      alert(result.message);
      
      // 如果是伤害，更新玩家状态
      if (result.type === 'damage') {
        // 这里应该通过回调更新玩家状态
        // onPlayerUpdate({ san: player.san - result.value });
      }
      
      // 如果是道具，添加到背包
      if (result.type === 'item') {
        // onAddToInventory(result.item);
      }
      
      setSearchResult(null);
    }, 100);
  };

  if (currentScene) {
    return (
      <div className="scene-3d-container">
        <button onClick={() => setCurrentScene(null)} className="logout-btn">
          ← 返回大地图
        </button>
        <div className="scene-description">
          <h2>欢迎来到{currentScene}</h2>
          <p>这是3D场景预览区域，点击物体可以互动。</p>
          <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
            <p>🔍 点击物体可以搜索物品</p>
            <p>⚔️ 可以与其他玩家互动</p>
            <p>📦 收集道具和线索</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-map">
      <div className="map-background">
        {/* 地图片段 - 你可以替换为你的图片 */}
        {LOCATIONS.map(loc => (
          <div
            key={loc.id}
            className={`location-marker ${loc.type}`}
            style={{ left: `${loc.x}px`, top: `${loc.y}px` }}
            onClick={() => handleLocationClick(loc.name)}
            title={loc.name}
          >
            <div className="location-dot"></div>
            <div className="location-label">{loc.name}</div>
          </div>
        ))}
        
        {/* 地形装饰 */}
        <div className="map-decoration" style={{ left: '50px', top: '200px' }}>🏡</div>
        <div className="map-decoration" style={{ left: '200px', top: '50px' }}>♨️</div>
        <div className="map-decoration" style={{ left: '450px', top: '100px' }}>📚</div>
        <div className="map-decoration" style={{ left: '280px', top: '250px' }}>💪</div>
        <div className="map-decoration" style={{ left: '330px', top: '300px' }}>☕</div>
        <div className="map-decoration" style={{ left: '550px', top: '150px' }}>🌺</div>
        <div className="map-decoration" style={{ left: '650px', top: '80px' }}>🌊</div>
        <div className="map-decoration" style={{ left: '750px', top: '30px' }}>⛺</div>
      </div>
      
      <button 
        className="mini-map-btn"
        onClick={() => setShowMiniMap(!showMiniMap)}
      >
        {showMiniMap ? '🗺️ 隐藏小地图' : '🗺️ 显示小地图'}
      </button>
      
      {showMiniMap && (
        <div className="mini-map">
          <h3>🔍 小地图 - 点击搜索物品</h3>
          <div className="mini-map-grid">
            {['书桌', '藤椅', '书架', '温泉边', '健身器材', '吧台', '花园长椅', '瀑布岩石', '帐篷内'].map((item, idx) => (
              <div 
                key={idx}
                className="mini-map-item"
                onClick={() => handleMiniMapClick(item)}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {searchResult && (
        <div className="search-result-overlay">
          搜索中...
        </div>
      )}
    </div>
  );
}

export default GameMap2D;