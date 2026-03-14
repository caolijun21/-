import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import StatusBar from '../../components/StatusBar/StatusBar';
import Joystick from '../../components/Joystick/Joystick';
import { api, WebSocketManager, MQTTManager } from '../../services/api';
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

  // WebSocket管理器实例
  let wsManager = null;
  // MQTT管理器实例
  let mqttManager = null;

  // 连接到设备
  const connectToDevice = async () => {
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 5000;
      const connected = await api.checkConnection(deviceIp, devicePort);
      if (connected) {
        dispatch(setIsConnected(true));
        dispatch(setError(null));
        
        // 初始化WebSocket连接
        wsManager = new WebSocketManager(deviceIp, devicePort);
        wsManager.connect();
        
        // 监听WebSocket消息
        wsManager.on('message', (data) => {
          if (data.type === 'status') {
            dispatch(updateStatus(data.payload));
          }
        });
        
        // 初始化MQTT连接
        mqttManager = new MQTTManager();
        mqttManager.connect();
        
        // 监听MQTT消息
        mqttManager.on('message', (topic, data) => {
          if (topic === 'pipe_robot/status') {
            dispatch(updateStatus(data));
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
  const handleObstacleAvoidance = (mode) => {
    if (!isConnected) return;
    
    if (mqttManager) {
      if (obstacleMode === mode) {
        // 停止避障
        mqttManager.sendCommand('stop_obstacle_avoidance');
        setObstacleMode(null);
      } else {
        // 开始避障
        mqttManager.sendCommand('start_obstacle_avoidance', { mode });
        setObstacleMode(mode);
      }
    }
  };

  // 巡线模式控制
  const handleLineFollowing = () => {
    if (!isConnected) return;
    
    if (mqttManager) {
      if (lineFollowing) {
        mqttManager.sendCommand('stop_line_following');
        setLineFollowing(false);
      } else {
        mqttManager.sendCommand('start_line_following');
        setLineFollowing(true);
      }
    }
  };

  // 组件挂载时连接设备
  useEffect(() => {
    connectToDevice();
    
    // 组件卸载时断开连接
    return () => {
      if (wsManager) {
        wsManager.disconnect();
      }
      if (mqttManager) {
        mqttManager.disconnect();
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
            <Joystick speed={speed} onSpeedChange={setSpeed} mqttManager={mqttManager} />
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
    </div>
  );
};

export default Home;