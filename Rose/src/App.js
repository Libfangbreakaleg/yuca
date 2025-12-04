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

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async () => {
    try {
      const snapshot = await get(ref(database, 'gameState'));
      if (!snapshot.exists()) {
        await set(ref(database, 'gameState'), {
          day: 1,
          lastRefresh: Date.now(),
          items: []
        });
      }
    } catch (error) {
      console.error('初始化失败:', error);
    }
  };

  const handleLogin = async (playerData, isAdminMode = false) => {
    if (isAdminMode) {
      setIsAdmin(true);
    } else {
      await set(ref(database, `players/${playerData.id}`), playerData);
      setCurrentPlayer(playerData);
    }
  };

  const handleLogout = () => {
    setCurrentPlayer(null);
    setIsAdmin(false);
  };

  if (!currentPlayer && !isAdmin) {
    return <Login onLogin={handleLogin} />;
  }

  if (isAdmin) {
    return (
      <div className="App">
        <div className="game-header">
          <div className="day-counter">管理员模式</div>
          <button onClick={handleLogout} className="logout-btn">退出</button>
        </div>
        <AdminPanel />
      </div>
    );
  }

  return (
    <div className="App">
      <div className="game-header">
        <div className="day-counter">第{gameState.day}天 | 行动点: {currentPlayer?.actionPoints || 10}</div>
        <button onClick={handleLogout} className="logout-btn">退出游戏</button>
      </div>
      <div className="game-container">
        <div className="left-panel">
          <PlayerPanel player={currentPlayer} />
        </div>
        <div className="main-content">
          <GameMap2D player={currentPlayer} />
        </div>
      </div>
    </div>
  );
}

export default App;
