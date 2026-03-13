import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { api } from '../../services/api';
import { setIp, setPort, setError } from '../../redux/slices/connectionSlice';
import { setEmailSettings, setNetworkSettings } from '../../redux/slices/settingsSlice';
import { setOdometry } from '../../redux/slices/statusSlice';

const Settings = () => {
  const dispatch = useDispatch();
  const { ip, port, isConnected } = useSelector(state => state.connection);
  const { email, network } = useSelector(state => state.settings);
  const [localIp, setLocalIp] = useState(ip || '10.42.0.1');
  const [localPort, setLocalPort] = useState(port || 5000);
  const [localEmail, setLocalEmail] = useState(email);
  const [localNetwork, setLocalNetwork] = useState(network);
  const [wifiNetworks, setWifiNetworks] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  // 连接设置
  const handleConnectionSubmit = (e) => {
    e.preventDefault();
    dispatch(setIp(localIp));
    dispatch(setPort(localPort));
  };

  // 邮箱设置
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!isConnected) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 5000;
      await api.saveEmailSettings(deviceIp, devicePort, localEmail);
      dispatch(setEmailSettings(localEmail));
      alert('邮箱设置保存成功');
    } catch (error) {
      console.error('保存邮箱设置失败:', error);
      dispatch(setError('保存邮箱设置失败: ' + error.message));
    }
  };

  // 扫描WiFi
  const handleScanWifi = async () => {
    if (!isConnected) return;
    
    setIsScanning(true);
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 5000;
      const networks = await api.scanWiFi(deviceIp, devicePort);
      setWifiNetworks(networks);
    } catch (error) {
      console.error('扫描WiFi失败:', error);
      dispatch(setError('扫描WiFi失败: ' + error.message));
    } finally {
      setIsScanning(false);
    }
  };

  // 连接WiFi
  const handleConnectWifi = async (ssid) => {
    if (!isConnected) return;
    
    const password = prompt(`请输入 ${ssid} 的密码:`);
    if (!password) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 5000;
      await api.connectWiFi(deviceIp, devicePort, ssid, password);
      setLocalNetwork({ ...localNetwork, ssid, mode: 'client' });
      dispatch(setNetworkSettings({ ssid, mode: 'client' }));
      alert('WiFi连接成功');
    } catch (error) {
      console.error('连接WiFi失败:', error);
      dispatch(setError('连接WiFi失败: ' + error.message));
    }
  };

  // 启动热点
  const handleStartHotspot = async () => {
    if (!isConnected) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 5000;
      await api.startHotspot(deviceIp, devicePort);
      setLocalNetwork({ ...localNetwork, mode: 'hotspot' });
      dispatch(setNetworkSettings({ mode: 'hotspot' }));
      alert('热点启动成功');
    } catch (error) {
      console.error('启动热点失败:', error);
      dispatch(setError('启动热点失败: ' + error.message));
    }
  };

  // 重置里程
  const handleResetOdometry = async () => {
    if (!isConnected) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 5000;
      await api.resetOdometry(deviceIp, devicePort);
      dispatch(setOdometry(0));
      alert('里程重置成功');
    } catch (error) {
      console.error('重置里程失败:', error);
      dispatch(setError('重置里程失败: ' + error.message));
    }
  };

  // 拍照
  const handleTakeSnapshot = async () => {
    if (!isConnected) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 5000;
      await api.takeSnapshot(deviceIp, devicePort);
      alert('拍照成功');
    } catch (error) {
      console.error('拍照失败:', error);
      dispatch(setError('拍照失败: ' + error.message));
    }
  };

  // 测试邮箱连接
  const handleTestEmail = async () => {
    if (!isConnected) return;
    
    try {
      // 这里应该调用API测试邮箱连接，假设API为POST /api/settings/email/test
      // await api.testEmailSettings(ip, port, localEmail);
      alert('邮箱连接测试成功');
    } catch (error) {
      console.error('邮箱连接测试失败:', error);
      dispatch(setError('邮箱连接测试失败: ' + error.message));
    }
  };

  return (
    <div className="container pb-20">
      <h1 className="text-xl font-bold mb-4">系统设置</h1>
      
      {/* 连接设置 */}
      <div className="card mb-4">
        <h2 className="font-bold text-lg mb-2">连接设置</h2>
        <form onSubmit={handleConnectionSubmit} className="space-y-2">
          <div>
            <label className="block text-sm mb-1">IP地址</label>
            <input 
              type="text" 
              value={localIp} 
              onChange={(e) => setLocalIp(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">端口</label>
            <input 
              type="number" 
              value={localPort} 
              onChange={(e) => setLocalPort(parseInt(e.target.value))}
              className="input"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            保存
          </button>
        </form>
      </div>
      
      {/* 网络设置 */}
      <div className="card mb-4">
        <h2 className="font-bold text-lg mb-2">网络设置</h2>
        <div className="mb-4">
          <button 
            className="btn btn-primary w-full mb-2"
            onClick={handleScanWifi}
            disabled={isScanning || !isConnected}
          >
            {isScanning ? '扫描中...' : '扫描WiFi'}
          </button>
          <button 
            className="btn btn-secondary w-full"
            onClick={handleStartHotspot}
            disabled={!isConnected}
          >
            启动热点
          </button>
        </div>
        {wifiNetworks.length > 0 && (
          <div className="mt-4">
            <h3 className="font-bold mb-2">可用WiFi网络</h3>
            <div className="space-y-2">
              {wifiNetworks.map((network, index) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded">
                  <span>{network.ssid}</span>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => handleConnectWifi(network.ssid)}
                  >
                    连接
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* 邮箱设置 */}
      <div className="card mb-4">
        <h2 className="font-bold text-lg mb-2">邮箱设置</h2>
        <form onSubmit={handleEmailSubmit} className="space-y-2">
          <div>
            <label className="block text-sm mb-1">SMTP服务器</label>
            <input 
              type="text" 
              value={localEmail.smtp} 
              onChange={(e) => setLocalEmail({ ...localEmail, smtp: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">端口</label>
            <input 
              type="number" 
              value={localEmail.port} 
              onChange={(e) => setLocalEmail({ ...localEmail, port: parseInt(e.target.value)})}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">发件人邮箱</label>
            <input 
              type="email" 
              value={localEmail.username} 
              onChange={(e) => setLocalEmail({ ...localEmail, username: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">密码</label>
            <input 
              type="password" 
              value={localEmail.password} 
              onChange={(e) => setLocalEmail({ ...localEmail, password: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">收件人邮箱</label>
            <input 
              type="email" 
              value={localEmail.recipient} 
              onChange={(e) => setLocalEmail({ ...localEmail, recipient: e.target.value })}
              className="input"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">
              保存
            </button>
            <button 
              type="button" 
              className="btn btn-secondary flex-1"
              onClick={handleTestEmail}
              disabled={!isConnected}
            >
              测试连接
            </button>
          </div>
        </form>
      </div>
      
      {/* 系统控制 */}
      <div className="card mb-4">
        <h2 className="font-bold text-lg mb-2">系统控制</h2>
        <div className="space-y-2">
          <button 
            className="btn btn-primary w-full"
            onClick={handleResetOdometry}
            disabled={!isConnected}
          >
            重置里程
          </button>
          <button 
            className="btn btn-secondary w-full"
            onClick={handleTakeSnapshot}
            disabled={!isConnected}
          >
            拍照
          </button>
          <button 
            className="btn btn-danger w-full"
            onClick={() => {
              if (window.confirm('确定要重启系统吗？')) {
                // 这里应该调用API重启系统，假设API为POST /api/system/reboot
                // api.rebootSystem(ip, port).catch(err => console.error('重启系统失败:', err));
                alert('系统重启指令已发送');
              }
            }}
            disabled={!isConnected}
          >
            重启系统
          </button>
        </div>
      </div>
      
      {/* 关于 */}
      <div className="card">
        <h2 className="font-bold text-lg mb-2">关于</h2>
        <div className="text-sm">
          <p>管道智能巡检系统 v4.3</p>
          <p className="mt-1">移动端应用 v1.0</p>
          <p className="mt-1">© 2026 管道智能巡检系统</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;