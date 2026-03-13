import React from 'react';
import { useSelector } from 'react-redux';

const StatusBar = () => {
  const { mode, ip, temperature, odometry, defectsCount, taskStatus, operator, direction, speed } = useSelector(state => state.status);
  const { isConnected } = useSelector(state => state.connection);

  if (!isConnected) {
    return (
      <div className="status-bar">
        <div className="status-item">
          <span>连接状态:</span>
          <span className="text-red-500">未连接</span>
        </div>
      </div>
    );
  }

  return (
    <div className="status-bar">
      <div className="grid grid-cols-2 gap-2">
        <div className="status-item">
          <span>连接模式:</span>
          <span>{mode === 'hotspot' ? '热点' : '客户端'}</span>
        </div>
        <div className="status-item">
          <span>IP地址:</span>
          <span>{ip}</span>
        </div>
        <div className="status-item">
          <span>CPU温度:</span>
          <span>{temperature}°C</span>
        </div>
        <div className="status-item">
          <span>当前里程:</span>
          <span>{odometry.toFixed(2)}米</span>
        </div>
        <div className="status-item">
          <span>缺陷总数:</span>
          <span>{defectsCount}</span>
        </div>
        <div className="status-item">
          <span>任务状态:</span>
          <span>
            {taskStatus === 'running' ? '进行中' : 
             taskStatus === 'idle' ? '未开始' : '已完成'}
          </span>
        </div>
        {taskStatus === 'running' && (
          <div className="status-item col-span-2">
            <span>操作员:</span>
            <span>{operator}</span>
          </div>
        )}
        <div className="status-item">
          <span>当前方向:</span>
          <span>
            {direction === 'forward' ? '前进' : 
             direction === 'backward' ? '后退' : 
             direction === 'left' ? '左转' : 
             direction === 'right' ? '右转' : '停止'}
          </span>
        </div>
        <div className="status-item">
          <span>当前速度:</span>
          <span>{speed}%</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;