import React, { useState } from 'react';
import Home from './pages/Home/Home';
import Defects from './pages/Defects/Defects';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';

const App = () => {
  const [activePage, setActivePage] = useState('home');

  // 渲染当前页面
  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <Home />;
      case 'defects':
        return <Defects />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
      
      {/* 底部导航栏 */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activePage === 'home' ? 'active' : ''}`}
          onClick={() => setActivePage('home')}
        >
          <div className="nav-icon">🏠</div>
          <span>主页</span>
        </button>
        <button 
          className={`nav-item ${activePage === 'defects' ? 'active' : ''}`}
          onClick={() => setActivePage('defects')}
        >
          <div className="nav-icon">🔍</div>
          <span>缺陷</span>
        </button>
        <button 
          className={`nav-item ${activePage === 'reports' ? 'active' : ''}`}
          onClick={() => setActivePage('reports')}
        >
          <div className="nav-icon">📋</div>
          <span>报告</span>
        </button>
        <button 
          className={`nav-item ${activePage === 'settings' ? 'active' : ''}`}
          onClick={() => setActivePage('settings')}
        >
          <div className="nav-icon">⚙️</div>
          <span>设置</span>
        </button>
      </nav>
    </div>
  );
};

export default App;