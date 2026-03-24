import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import StatusBar from '../../components/StatusBar/StatusBar';
import Joystick from '../../components/Joystick/Joystick';
import { api, SocketManager } from '../../services/api';
import { setIsConnected, setError } from '../../redux/slices/connectionSlice';
import { updateStatus } from '../../redux/slices/statusSlice';
import { startTask, endTask } from '../../redux/slices/taskSlice';

const Home = () => {
  const dispatch = useDispatch();
  const { ip, port, isConnected } = useSelector(state => state.connection);
  const { isTaskRunning, operator } = useSelector(state => state.task);

  // 状态管理
  const [obstacleMode, setObstacleMode] = useState(null);
  const [lineFollowing, setLineFollowing] = useState(false);
  const [speed, setSpeed] = useState(75);
  const [sensorData, setSensorData] = useState(null);
  const [servoId, setServoId] = useState(1);
  const [servoAngle, setServoAngle] = useState(90);
  const [operatorName, setOperatorName] = useState('');
  
  // 新增状态
  const [reports, setReports] = useState([]);
  const [defects, setDefects] = useState([]);
  const [wifiList, setWifiList] = useState([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSettings, setEmailSettings] = useState({
    smtp: '',
    port: '',
    email: '',
    password: '',
    recipient: ''
  });
  const [reportFormat, setReportFormat] = useState('pdf');
  const [selectedWifi, setSelectedWifi] = useState(null);
  const [wifiPassword, setWifiPassword] = useState('');
  const [showWifiModal, setShowWifiModal] = useState(false);

  // Socket.IO管理器实例
  let socketManager = null;

  // 连接到设备
  const connectToDevice = async () => {
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 6002;
      const connected = await api.checkConnection(deviceIp, devicePort);
      if (connected) {
        dispatch(setIsConnected(true));
        dispatch(setError(null));
        
        // 初始化Socket.IO连接
        socketManager = new SocketManager(deviceIp, devicePort);
        socketManager.connect();
        
        // 监听Socket.IO消息
        socketManager.on('onMessage', (data) => {
          if (data.type === 'status') {
            dispatch(updateStatus(data.payload));
          } else if (data.type === 'new_defect') {
            setDefects(prev => [data.payload, ...prev]);
          }
        });
        
        // 获取初始状态
        const status = await api.getStatus(deviceIp, devicePort);
        dispatch(updateStatus(status));
        
        // 获取初始数据
        await fetchInitialData();
      } else {
        dispatch(setIsConnected(false));
        dispatch(setError('无法连接到设备，请检查IP和端口'));
      }
    } catch (error) {
      dispatch(setIsConnected(false));
      dispatch(setError('连接失败: ' + error.message));
    }
  };

  // 获取初始数据
  const fetchInitialData = async () => {
    if (!isConnected) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 6002;
      
      // 获取缺陷列表
      const defectsData = await api.getDefects(deviceIp, devicePort);
      setDefects(defectsData);
      
      // 获取报告列表
      const reportsData = await api.getReports(deviceIp, devicePort);
      setReports(reportsData);
      
      // 获取邮箱设置
      const emailData = await api.getEmailSettings(deviceIp, devicePort);
      if (emailData) {
        setEmailSettings(emailData);
      }
    } catch (error) {
      console.error('获取初始数据失败:', error);
    }
  };

  // 避障跟踪控制
  const handleObstacleAvoidance = async (mode) => {
    if (!isConnected) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 6002;
      
      if (obstacleMode === mode) {
        // 停止避障
        await api.stopObstacleAvoidance(deviceIp, devicePort);
        setObstacleMode(null);
      } else {
        // 开始避障
        await api.startObstacleAvoidance(deviceIp, devicePort, mode);
        setObstacleMode(mode);
      }
    } catch (error) {
      console.error('避障控制失败:', error);
    }
  };

  // 巡线模式控制
  const handleLineFollowing = async () => {
    if (!isConnected) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 6002;
      
      if (lineFollowing) {
        await api.stopLineFollowing(deviceIp, devicePort);
        setLineFollowing(false);
      } else {
        await api.startLineFollowing(deviceIp, devicePort);
        setLineFollowing(true);
      }
    } catch (error) {
      console.error('巡线模式控制失败:', error);
    }
  };

  // 获取传感器数据
  const handleGetSensors = async () => {
    if (!isConnected) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 6002;
      const data = await api.getSensors(deviceIp, devicePort);
      setSensorData(data);
    } catch (error) {
      console.error('获取传感器数据失败:', error);
    }
  };

  // 控制舵机
  const handleServoControl = async () => {
    if (!isConnected) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 6002;
      await api.moveServo(deviceIp, devicePort, servoId, servoAngle);
    } catch (error) {
      console.error('舵机控制失败:', error);
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
    } catch (error) {
      console.error('结束任务失败:', error);
    }
  };

  // 生成报告
  const handleGenerateReport = async () => {
    if (!isConnected) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 6002;
      const result = await api.generateReport(deviceIp, devicePort, reportFormat);
      console.log('报告生成成功:', result);
      
      // 刷新报告列表
      const reportsData = await api.getReports(deviceIp, devicePort);
      setReports(reportsData);
    } catch (error) {
      console.error('生成报告失败:', error);
    }
  };

  // 刷新报告列表
  const handleRefreshReports = async () => {
    if (!isConnected) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 6002;
      const reportsData = await api.getReports(deviceIp, devicePort);
      setReports(reportsData);
    } catch (error) {
      console.error('刷新报告列表失败:', error);
    }
  };

  // 保存邮箱设置
  const handleSaveEmailSettings = async () => {
    if (!isConnected) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 6002;
      await api.saveEmailSettings(deviceIp, devicePort, emailSettings);
      setShowEmailModal(false);
    } catch (error) {
      console.error('保存邮箱设置失败:', error);
    }
  };

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

  // 组件挂载时连接设备（使用 setTimeout 延迟执行，避免阻塞页面加载）
  useEffect(() => {
    const connectTimer = setTimeout(() => {
      connectToDevice();
    }, 1000);
    
    // 组件卸载时断开Socket.IO连接
    return () => {
      clearTimeout(connectTimer);
      if (socketManager) {
        socketManager.disconnect();
      }
    };
  }, [ip, port]);

  return (
    <div className="container pb-20">
      <h1 className="text-xl font-bold mb-4">管道智能巡检系统</h1>
      
      {/* 顶部两栏布局：左侧视频+状态，右侧手动控制 */}
      <div className="home-top-layout mb-4">
        <div className="home-top-left">
          <div className="card home-video-card">
            <VideoPlayer />
          </div>
          <StatusBar />
        </div>
        <div className="home-top-right">
          <div className="card home-joystick-card">
            <Joystick speed={speed} onSpeedChange={setSpeed} />
          </div>
        </div>
      </div>
      
      {/* 避障跟踪 */}
      <div className="card mb-4">
        <h2 className="font-bold text-lg mb-2">避障跟踪</h2>
        <div className="flex gap-2">
          <button 
            className={`btn flex-1 ${obstacleMode === 'ultrasonic' ? 'btn-success' : 'btn-primary'}`}
            onClick={() => handleObstacleAvoidance('ultrasonic')}
            disabled={!isConnected}
          >
            {obstacleMode === 'ultrasonic' ? '停止超声波避障' : '超声波避障'}
          </button>
          <button 
            className={`btn flex-1 ${obstacleMode === 'ultrasonic_ir' ? 'btn-success' : 'btn-primary'}`}
            onClick={() => handleObstacleAvoidance('ultrasonic_ir')}
            disabled={!isConnected}
          >
            {obstacleMode === 'ultrasonic_ir' ? '停止超声+红外避障' : '超声+红外避障'}
          </button>
        </div>
      </div>
      
      {/* 巡线模式 */}
      <div className="card mb-4">
        <h2 className="font-bold text-lg mb-2">巡线模式</h2>
        <div className="flex gap-2">
          <button 
            className={`btn flex-1 ${lineFollowing ? 'btn-success' : 'btn-primary'}`}
            onClick={handleLineFollowing}
            disabled={!isConnected}
          >
            {lineFollowing ? '停止巡线' : '开始巡线'}
          </button>
        </div>
      </div>
      
      {/* 传感器数据 */}
      <div className="card mb-4">
        <h2 className="font-bold text-lg mb-2">传感器数据</h2>
        <button 
          className="btn btn-primary mb-4"
          onClick={handleGetSensors}
          disabled={!isConnected}
        >
          获取传感器数据
        </button>
        {sensorData && (
          <div className="sensor-data">
            <p>距离: {sensorData.distance_cm || sensorData.distance || 'N/A'} cm</p>
            <p>左红外状态: {sensorData.left_obstacle || 'N/A'}</p>
            <p>右红外状态: {sensorData.right_obstacle || 'N/A'}</p>
          </div>
        )}
      </div>
      
      {/* 舵机控制 */}
      <div className="card mb-4">
        <h2 className="font-bold text-lg mb-2">舵机控制</h2>
        <div className="mb-4">
          <label className="block mb-2">舵机编号:</label>
          <select 
            value={servoId} 
            onChange={(e) => setServoId(parseInt(e.target.value))}
            className="input"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-2">角度: {servoAngle}°</label>
          <input 
            type="range" 
            min="0" 
            max="180" 
            value={servoAngle} 
            onChange={(e) => setServoAngle(parseInt(e.target.value))}
            className="input"
          />
        </div>
        <button 
          className="btn btn-primary"
          onClick={handleServoControl}
          disabled={!isConnected}
        >
          控制舵机
        </button>
      </div>
      
      {/* 任务管理 */}
      <div className="card mb-4">
        <h2 className="font-bold text-lg mb-2">任务管理</h2>
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
      
      {/* 报告生成 */}
      <div className="card mb-4">
        <h2 className="font-bold text-lg mb-2">报告生成</h2>
        <div className="mb-4">
          <label className="block mb-2">报告格式:</label>
          <select 
            value={reportFormat} 
            onChange={(e) => setReportFormat(e.target.value)}
            className="input"
          >
            <option value="pdf">PDF</option>
            <option value="txt">TXT</option>
            <option value="json">JSON</option>
          </select>
        </div>
        <div className="flex gap-2 mb-4">
          <button 
            className="btn btn-primary flex-1"
            onClick={handleGenerateReport}
            disabled={!isConnected}
          >
            生成报告
          </button>
          <button 
            className="btn btn-secondary flex-1"
            onClick={handleRefreshReports}
            disabled={!isConnected}
          >
            刷新报告列表
          </button>
        </div>
        <button 
          className="btn btn-secondary mb-4"
          onClick={() => setShowEmailModal(true)}
          disabled={!isConnected}
        >
          配置邮箱
        </button>
        {reports.length > 0 && (
          <div className="reports-list">
            <h3 className="font-bold mb-2">报告列表:</h3>
            <ul>
              {reports.map((report, index) => (
                <li key={index} className="mb-2">
                  <a 
                    href={api.downloadFile(ip || '10.42.0.1', port || 6002, report.filename)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {report.filename}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
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
      
      {/* 缺陷记录 */}
      <div className="card mb-4">
        <h2 className="font-bold text-lg mb-2">缺陷记录</h2>
        {defects.length > 0 ? (
          <div className="defects-table">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b">时间</th>
                  <th className="text-left p-2 border-b">缺陷类型</th>
                  <th className="text-left p-2 border-b">距离(米)</th>
                  <th className="text-left p-2 border-b">置信度(%)</th>
                  <th className="text-left p-2 border-b">图像</th>
                </tr>
              </thead>
              <tbody>
                {defects.map((defect, index) => (
                  <tr key={index}>
                    <td className="p-2 border-b">{defect.time || new Date().toLocaleString()}</td>
                    <td className="p-2 border-b">{defect.type || '未知'}</td>
                    <td className="p-2 border-b">{defect.distance || 'N/A'}</td>
                    <td className="p-2 border-b">{defect.confidence || 'N/A'}</td>
                    <td className="p-2 border-b">
                      {defect.image ? (
                        <img 
                          src={api.downloadFile(ip || '10.42.0.1', port || 6002, defect.image)}
                          alt="缺陷图像"
                          className="w-16 h-16 object-cover"
                        />
                      ) : (
                        '无图像'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>暂无缺陷记录</p>
        )}
      </div>
      
      {/* 邮箱配置模态框 */}
      {showEmailModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="font-bold text-lg mb-4">配置邮箱</h3>
            <div className="mb-4">
              <label className="block mb-2">SMTP服务器:</label>
              <input 
                type="text" 
                value={emailSettings.smtp}
                onChange={(e) => setEmailSettings({...emailSettings, smtp: e.target.value})}
                className="input"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">端口:</label>
              <input 
                type="text" 
                value={emailSettings.port}
                onChange={(e) => setEmailSettings({...emailSettings, port: e.target.value})}
                className="input"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">发件人邮箱:</label>
              <input 
                type="email" 
                value={emailSettings.email}
                onChange={(e) => setEmailSettings({...emailSettings, email: e.target.value})}
                className="input"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">密码:</label>
              <input 
                type="password" 
                value={emailSettings.password}
                onChange={(e) => setEmailSettings({...emailSettings, password: e.target.value})}
                className="input"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">收件人邮箱:</label>
              <input 
                type="email" 
                value={emailSettings.recipient}
                onChange={(e) => setEmailSettings({...emailSettings, recipient: e.target.value})}
                className="input"
              />
            </div>
            <div className="flex gap-2">
              <button 
                className="btn btn-primary flex-1"
                onClick={handleSaveEmailSettings}
              >
                保存
              </button>
              <button 
                className="btn btn-secondary flex-1"
                onClick={() => setShowEmailModal(false)}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
      
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

export default Home;