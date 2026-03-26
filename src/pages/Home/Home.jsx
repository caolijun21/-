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
  const [servoId, setServoId] = useState(1);
  const [servoAngle, setServoAngle] = useState(90);

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
      // 这里可以添加需要的初始数据获取
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
      
      {/* 顶部布局：左方向控制，中间视频，右舵机控制 */}
      <div className="flex gap-4 mb-4">
        {/* 左侧方向控制（十字按钮） */}
        <div className="flex-1">
          <div className="card h-full">
            <h2 className="font-bold text-lg mb-2 text-center">方向控制</h2>
            <div className="direction-controls">
              <div className="flex justify-center mb-2">
                <button 
                  className="btn btn-primary direction-btn"
                  onClick={() => {
                    if (isConnected) {
                      const deviceIp = ip || '10.42.0.1';
                      const devicePort = port || 6002;
                      api.move(deviceIp, devicePort, 'forward', speed);
                    }
                  }}
                  disabled={!isConnected}
                >
                  ↑
                </button>
              </div>
              <div className="flex justify-center gap-2 mb-2">
                <button 
                  className="btn btn-primary direction-btn"
                  onClick={() => {
                    if (isConnected) {
                      const deviceIp = ip || '10.42.0.1';
                      const devicePort = port || 6002;
                      api.move(deviceIp, devicePort, 'left', speed);
                    }
                  }}
                  disabled={!isConnected}
                >
                  ←
                </button>
                <button 
                  className="btn btn-danger direction-btn"
                  onClick={() => {
                    if (isConnected) {
                      const deviceIp = ip || '10.42.0.1';
                      const devicePort = port || 6002;
                      api.stop(deviceIp, devicePort);
                    }
                  }}
                  disabled={!isConnected}
                >
                  停
                </button>
                <button 
                  className="btn btn-primary direction-btn"
                  onClick={() => {
                    if (isConnected) {
                      const deviceIp = ip || '10.42.0.1';
                      const devicePort = port || 6002;
                      api.move(deviceIp, devicePort, 'right', speed);
                    }
                  }}
                  disabled={!isConnected}
                >
                  →
                </button>
              </div>
              <div className="flex justify-center mb-4">
                <button 
                  className="btn btn-primary direction-btn"
                  onClick={() => {
                    if (isConnected) {
                      const deviceIp = ip || '10.42.0.1';
                      const devicePort = port || 6002;
                      api.move(deviceIp, devicePort, 'backward', speed);
                    }
                  }}
                  disabled={!isConnected}
                >
                  ↓
                </button>
              </div>
              <div className="flex justify-center gap-4 mb-4">
                <button 
                  className="btn btn-secondary direction-btn"
                  onClick={() => {
                    if (isConnected) {
                      const deviceIp = ip || '10.42.0.1';
                      const devicePort = port || 6002;
                      api.move(deviceIp, devicePort, 'spin_left', speed);
                    }
                  }}
                  disabled={!isConnected}
                >
                  ↶
                </button>
                <button 
                  className="btn btn-secondary direction-btn"
                  onClick={() => {
                    if (isConnected) {
                      const deviceIp = ip || '10.42.0.1';
                      const devicePort = port || 6002;
                      api.move(deviceIp, devicePort, 'spin_right', speed);
                    }
                  }}
                  disabled={!isConnected}
                >
                  ↷
                </button>
              </div>
              <div className="mb-2">
                <label className="block mb-2 text-center">速度: {speed}%</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={speed} 
                  onChange={(e) => setSpeed(parseInt(e.target.value))}
                  className="input w-full"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* 中间视频和摇杆控制 */}
        <div className="flex-1.5">
          {/* 视频和速度控制 */}
          <div className="relative mb-4">
            <div className="card home-video-card">
              <VideoPlayer />
            </div>
            {/* 左上角速度显示 */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full">
              速度: {speed}%
            </div>
          </div>
          
          {/* 摇杆控制 */}
          <div className="card home-joystick-card">
            <h2 className="font-bold text-lg mb-2 text-center">摇杆控制</h2>
            <Joystick speed={speed} onSpeedChange={setSpeed} />
          </div>
        </div>
        
        {/* 右侧舵机控制（十字按钮） */}
        <div className="flex-1">
          <div className="card h-full">
            <h2 className="font-bold text-lg mb-2 text-center">舵机控制</h2>
            <div className="mb-4">
              <label className="block mb-2">舵机编号:</label>
              <select 
                value={servoId} 
                onChange={(e) => setServoId(parseInt(e.target.value))}
                className="input w-full"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>
            <div className="servo-controls">
              <div className="flex justify-center mb-2">
                <button 
                  className="btn btn-primary direction-btn"
                  onClick={() => {
                    setServoAngle(prev => Math.min(prev + 10, 180));
                  }}
                >
                  ↑
                </button>
              </div>
              <div className="flex justify-center gap-2 mb-2">
                <button 
                  className="btn btn-primary direction-btn"
                  onClick={() => {
                    setServoAngle(prev => Math.max(prev - 10, 0));
                  }}
                >
                  ←
                </button>
                <button 
                  className="btn btn-primary direction-btn"
                  onClick={handleServoControl}
                  disabled={!isConnected}
                >
                  设置
                </button>
                <button 
                  className="btn btn-primary direction-btn"
                  onClick={() => {
                    setServoAngle(prev => Math.min(prev + 10, 180));
                  }}
                >
                  →
                </button>
              </div>
              <div className="flex justify-center mb-4">
                <button 
                  className="btn btn-primary direction-btn"
                  onClick={() => {
                    setServoAngle(prev => Math.max(prev - 10, 0));
                  }}
                >
                  ↓
                </button>
              </div>
              <div className="mb-2">
                <label className="block mb-2 text-center">角度: {servoAngle}°</label>
                <input 
                  type="range" 
                  min="0" 
                  max="180" 
                  value={servoAngle} 
                  onChange={(e) => setServoAngle(parseInt(e.target.value))}
                  className="input w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
        
      <StatusBar />
      
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