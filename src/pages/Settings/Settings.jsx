import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { api } from '../../services/api';
import { setIsConnected, setError } from '../../redux/slices/connectionSlice';
import { startTask, endTask } from '../../redux/slices/taskSlice';

const Settings = () => {
  const dispatch = useDispatch();
  const { ip, port, isConnected } = useSelector(state => state.connection);
  const { isTaskRunning, operator } = useSelector(state => state.task);
  
  // 状态管理
  const [wifiList, setWifiList] = useState([]);
  const [selectedWifi, setSelectedWifi] = useState(null);
  const [wifiPassword, setWifiPassword] = useState('');
  const [showWifiModal, setShowWifiModal] = useState(false);
  const [operatorName, setOperatorName] = useState('');
  const [taskStatus, setTaskStatus] = useState('未开始');
  const [taskOperator, setTaskOperator] = useState('');
  const [taskStartTime, setTaskStartTime] = useState('');
  const [taskEndTime, setTaskEndTime] = useState('');

  // 扫描WiFi
  const handleScanWifi = async () => {
    if (!isConnected) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 6002;
      const wifiData = await api.scanWiFi(deviceIp, devicePort);
      setWifiList(wifiData);
    } catch (error) {
      console.error('扫描WiFi失败:', error);
    }
  };

  // 连接WiFi
  const handleConnectWifi = async () => {
    if (!isConnected || !selectedWifi || !wifiPassword) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 6002;
      await api.connectWiFi(deviceIp, devicePort, selectedWifi.ssid, wifiPassword);
      setShowWifiModal(false);
      setSelectedWifi(null);
      setWifiPassword('');
    } catch (error) {
      console.error('连接WiFi失败:', error);
    }
  };

  // 启动热点
  const handleStartHotspot = async () => {
    if (!isConnected) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 6002;
      await api.startHotspot(deviceIp, devicePort);
    } catch (error) {
      console.error('启动热点失败:', error);
    }
  };

  // 开始任务
  const handleStartTask = async () => {
    if (!isConnected || !operatorName) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 6002;
      await api.startTask(deviceIp, devicePort, operatorName);
      dispatch(startTask({ operator: operatorName }));
      
      // 更新任务状态
      setTaskStatus('进行中');
      setTaskOperator(operatorName);
      setTaskStartTime(new Date().toLocaleString());
      setTaskEndTime('');
    } catch (error) {
      console.error('开始任务失败:', error);
    }
  };

  // 结束任务
  const handleEndTask = async () => {
    if (!isConnected || !isTaskRunning) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 6002;
      await api.endTask(deviceIp, devicePort);
      dispatch(endTask({}));
      
      // 更新任务状态
      setTaskStatus('已结束');
      setTaskEndTime(new Date().toLocaleString());
    } catch (error) {
      console.error('结束任务失败:', error);
    }
  };

  return (
    <div className="container pb-20">
      <h1 className="text-xl font-bold mb-4">系统设置</h1>
      
      {/* 网络管理 */}
      <div className="card mb-4">
        <h2 className="font-bold text-lg mb-2">网络管理</h2>
        <div className="flex gap-2 mb-4">
          <button 
            className="btn btn-primary flex-1"
            onClick={handleScanWifi}
            disabled={!isConnected}
          >
            扫描WiFi
          </button>
          <button 
            className="btn btn-secondary flex-1"
            onClick={handleStartHotspot}
            disabled={!isConnected}
          >
            启动热点
          </button>
        </div>
        {wifiList.length > 0 && (
          <div className="wifi-list">
            <h3 className="font-bold mb-2">WiFi列表:</h3>
            <ul>
              {wifiList.map((wifi, index) => (
                <li key={index} className="mb-2">
                  <button 
                    className="text-left w-full p-2 border rounded"
                    onClick={() => {
                      setSelectedWifi(wifi);
                      setShowWifiModal(true);
                    }}
                  >
                    <div className="font-bold">{wifi.ssid}</div>
                    <div className="text-sm text-gray-600">信号强度: {wifi.signal}%</div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* 任务管理 */}
      <div className="card mb-4">
        <h2 className="font-bold text-lg mb-2">任务管理</h2>
        
        {/* 任务状态显示 */}
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="flex justify-between mb-1">
            <span className="font-medium">任务状态:</span>
            <span className={`font-bold ${taskStatus === '进行中' ? 'text-green-600' : taskStatus === '已结束' ? 'text-blue-600' : 'text-gray-600'}`}>
              {taskStatus}
            </span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-medium">操作员:</span>
            <span>{taskOperator || '未设置'}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-medium">开始时间:</span>
            <span>{taskStartTime || '未开始'}</span>
          </div>
          {taskEndTime && (
            <div className="flex justify-between">
              <span className="font-medium">结束时间:</span>
              <span>{taskEndTime}</span>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block mb-2">操作员:</label>
          <input 
            type="text" 
            value={operatorName} 
            onChange={(e) => setOperatorName(e.target.value)}
            className="input"
            placeholder="输入操作员姓名"
          />
        </div>
        <div className="flex gap-2">
          <button 
            className="btn btn-primary flex-1"
            onClick={handleStartTask}
            disabled={!isConnected || !operatorName}
          >
            开始任务
          </button>
          <button 
            className="btn btn-danger flex-1"
            onClick={handleEndTask}
            disabled={!isConnected || !isTaskRunning}
          >
            结束任务
          </button>
        </div>
      </div>
      
      {/* 传感器数据 */}
      <div className="card mb-4">
        <h2 className="font-bold text-lg mb-2">传感器数据</h2>
        <button 
          className="btn btn-primary mb-4"
          onClick={() => {
            if (!isConnected) return;
            const deviceIp = ip || '10.42.0.1';
            const devicePort = port || 6002;
            api.getSensors(deviceIp, devicePort)
              .then(data => {
                alert(`距离: ${data.distance_cm || data.distance || 'N/A'} cm\n左红外状态: ${data.left_obstacle || 'N/A'}\n右红外状态: ${data.right_obstacle || 'N/A'}`);
              })
              .catch(error => {
                console.error('获取传感器数据失败:', error);
              });
          }}
          disabled={!isConnected}
        >
          获取传感器数据
        </button>
      </div>
      
      {/* WiFi连接模态框 */}
      {showWifiModal && selectedWifi && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="font-bold text-lg mb-4">连接 WiFi: {selectedWifi.ssid}</h3>
            <div className="mb-4">
              <label className="block mb-2">密码:</label>
              <input 
                type="password" 
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                className="input"
                placeholder="输入WiFi密码"
              />
            </div>
            <div className="flex gap-2">
              <button 
                className="btn btn-primary flex-1"
                onClick={handleConnectWifi}
              >
                连接
              </button>
              <button 
                className="btn btn-secondary flex-1"
                onClick={() => {
                  setShowWifiModal(false);
                  setSelectedWifi(null);
                  setWifiPassword('');
                }}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;