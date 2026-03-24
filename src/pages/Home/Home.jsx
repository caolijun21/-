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
          }
        });
        
        // 获取初始状态
        const status = await api.getStatus(deviceIp, devicePort);
        dispatch(updateStatus(status));
      } else {
        dispatch(setIsConnected(false));
        dispatch(setError('无法连接到设备，请检查IP和端口'));
      }
    } catch (error) {
      dispatch(setIsConnected(false));
      dispatch(setError('连接失败: ' + error.message));
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
      const result = await api.generateReport(deviceIp, devicePort, 'pdf');
      console.log('报告生成成功:', result);
    } catch (error) {
      console.error('生成报告失败:', error);
    }
  };

  // 组件挂载时连接设备
  useEffect(() => {
    connectToDevice();
    
    // 组件卸载时断开Socket.IO连接
    return () => {
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
            <p>距离: {sensorData.distance || 'N/A'} cm</p>
            <p>红外状态: {sensorData.ir_status || 'N/A'}</p>
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
        <button 
          className="btn btn-primary"
          onClick={handleGenerateReport}
          disabled={!isConnected}
        >
          生成 PDF 报告
        </button>
      </div>
    </div>
  );
};

export default Home;