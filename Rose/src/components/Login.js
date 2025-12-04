import React, { useState } from 'react';
import './Login.css';

const ADMIN_PASSWORD = '20041018';

function Login({ onLogin }) {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    hp: 100,
    san: 100,
    power: 10,
    agility: 10,
    heal: 10,
    luck: 10,
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isAdminMode) {
      // 管理员登录
      if (formData.password === ADMIN_PASSWORD) {
        onLogin(null, true);
      } else {
        alert('管理员密码错误！');
      }
    } else {
      // 玩家登录
      if (!formData.name.trim()) {
        alert('请输入姓名！');
        return;
      }
      
      // 创建玩家对象
      const newPlayer = {
        id: Date.now().toString(),
        name: formData.name,
        hp: parseInt(formData.hp),
        maxHp: parseInt(formData.hp),
        san: parseInt(formData.san),
        maxSan: parseInt(formData.san),
        power: parseInt(formData.power),
        agility: parseInt(formData.agility),
        heal: parseInt(formData.heal),
        luck: parseInt(formData.luck),
        inventory: [],
        actionPoints: 10,
        isAlive: true,
        createdAt: Date.now()
      };
      
      onLogin(newPlayer, false);
    }
  };

  return (
    <div className="login-container">
      <h1>🌹 小玫瑰庄园 🌹</h1>
      
      <div className="login-options">
        <button 
          className={!isAdminMode ? 'active' : ''}
          onClick={() => setIsAdminMode(false)}
        >
          玩家登录
        </button>
        <button 
          className={isAdminMode ? 'active' : ''}
          onClick={() => setIsAdminMode(true)}
        >
          管理员登录
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        {isAdminMode ? (
          <div className="form-group">
            <label>🔑 管理员密码：</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              placeholder="输入管理员密码"
            />
          </div>
        ) : (
          <>
            <div className="form-group">
              <label>👤 玩家姓名：</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                placeholder="请输入你的名字"
              />
            </div>
            
            <div className="stats-grid">
              <div className="form-group">
                <label>❤️ 初始HP：</label>
                <input
                  type="number"
                  min="50"
                  max="200"
                  value={formData.hp}
                  onChange={(e) => setFormData({...formData, hp: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>🧠 初始SAN：</label>
                <input
                  type="number"
                  min="50"
                  max="200"
                  value={formData.san}
                  onChange={(e) => setFormData({...formData, san: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>💪 力量：</label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={formData.power}
                  onChange={(e) => setFormData({...formData, power: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>⚡ 敏捷：</label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={formData.agility}
                  onChange={(e) => setFormData({...formData, agility: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>🌿 治疗效果：</label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={formData.heal}
                  onChange={(e) => setFormData({...formData, heal: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>🍀 幸运值：</label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={formData.luck}
                  onChange={(e) => setFormData({...formData, luck: e.target.value})}
                />
              </div>
            </div>
          </>
        )}
        
        <button type="submit" className="login-btn">
          {isAdminMode ? '🔧 进入管理员面板' : '🎮 开始游戏'}
        </button>
      </form>
    </div>
  );
}

export default Login;