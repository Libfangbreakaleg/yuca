import React from 'react';
import Login from './components/Login';
import './App.css';

function App() {
  // 什么都不判断，直接显示登录组件
  return (
    <div className="App">
      <Login onLogin={(player, isAdmin) => {
          console.log('登录被触发', player, isAdmin);
          alert(`登录成功！${isAdmin ? '管理员' : '玩家'}模式`);
        }} 
      />
    </div>
  );
}

export default App;
