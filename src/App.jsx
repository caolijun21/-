import React from 'react';
import Home from './pages/Home/Home';

const App = () => {
  return (
    <div className="App">
      <Home />
      
      {/* 底部导航栏 */}
      <nav className="bottom-nav">
        <button className="nav-item active">
          <div className="nav-icon">🏠</div>
          <span>主页</span>
        </button>
        <button className="nav-item">
          <div className="nav-icon">🔍</div>
          <span>缺陷</span>
        </button>
        <button className="nav-item">
          <div className="nav-icon">📋</div>
          <span>报告</span>
        </button>
        <button className="nav-item">
          <div className="nav-icon">⚙️</div>
          <span>设置</span>
        </button>
      </nav>
    </div>
  );
};

export default App;