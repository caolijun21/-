import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import StatusBar from '../../components/StatusBar/StatusBar';
import Joystick from '../../components/Joystick/Joystick';
import { api, WebSocketManager } from '../../services/api';
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
  const [areaLimit, setAreaLimit] = useState(false);
  const [detectionType, setDetectionType] = useState(null);
  const [trackingType, setTrackingType] = useState(null);
  const [recognitionType, setRecognitionType] = useState(null);
  const [autoDriving, setAutoDriving] = useState(false);
  const [speed, setSpeed] = useState(50);

  // WebSocket管理器实例
  let wsManager = null;

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

  // 开始任务
  const handleStartTask = async () => {
    if (!isConnected) return;
    
    const operatorName = prompt('请输入操作员姓名:');
    if (!operatorName) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 5000;
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
      const devicePort = port || 5000;
      await api.endTask(deviceIp, devicePort);
      dispatch(endTask({}));
    } catch (error) {
      console.error('结束任务失败:', error);
    }
  };

  // 避障跟踪控制
  const handleObstacleAvoidance = async (mode) => {
    if (!isConnected) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 5000;
      
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
      const devicePort = port || 5000;
      
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

  // 画地为牢控制
  const handleAreaLimit = async () => {
    if (!isConnected) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 5000;
      
      if (areaLimit) {
        await api.stopAreaLimit(deviceIp, devicePort);
        setAreaLimit(false);
      } else {
        await api.startAreaLimit(deviceIp, devicePort);
        setAreaLimit(true);
      }
    } catch (error) {
      console.error('画地为牢控制失败:', error);
    }
  };

  // 目标检测控制
  const handleObjectDetection = async (type) => {
    if (!isConnected) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 5000;
      
      if (detectionType === type) {
        await api.stopObjectDetection(deviceIp, devicePort);
        setDetectionType(null);
      } else {
        await api.startObjectDetection(deviceIp, devicePort, type);
        setDetectionType(type);
      }
    } catch (error) {
      console.error('目标检测控制失败:', error);
    }
  };

  // 目标追踪控制
  const handleObjectTracking = async (type) => {
    if (!isConnected) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 5000;
      
      if (trackingType === type) {
        await api.stopObjectTracking(deviceIp, devicePort);
        setTrackingType(null);
      } else {
        await api.startObjectTracking(deviceIp, devicePort, type);
        setTrackingType(type);
      }
    } catch (error) {
      console.error('目标追踪控制失败:', error);
    }
  };

  // 目标识别控制
  const handleObjectRecognition = async (type) => {
    if (!isConnected) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 5000;
      
      if (recognitionType === type) {
        await api.stopObjectRecognition(deviceIp, devicePort);
        setRecognitionType(null);
      } else {
        await api.startObjectRecognition(deviceIp, devicePort, type);
        setRecognitionType(type);
      }
    } catch (error) {
      console.error('目标识别控制失败:', error);
    }
  };

  // 自动驾驶控制
  const handleAutoDriving = async () => {
    if (!isConnected) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 5000;
      
      if (autoDriving) {
        await api.stopAutoDriving(deviceIp, devicePort);
        setAutoDriving(false);
      } else {
        await api.startAutoDriving(deviceIp, devicePort);
        setAutoDriving(true);
      }
    } catch (error) {
      console.error('自动驾驶控制失败:', error);
    }
  };

  // 组件挂载时连接设备
  useEffect(() => {
    connectToDevice();
    
    // 组件卸载时断开WebSocket连接
    return () => {
      if (wsManager) {
        wsManager.disconnect();
      }
    };
  }, [ip, port]);

  return (
    <div className="container pb-20">
      <h1 className="text-xl font-bold mb-4">管道智能巡检系统</h1>
      
      {/* 视频播放器 */}
      <div className="mb-4">
        <VideoPlayer />
      </div>
      
      {/* 状态栏 */}
      <StatusBar />
      
      {/* 任务控制 */}
      <div className="card mb-4">
        <h2 className="font-bold text-lg mb-2">任务管理</h2>
        <div className="flex gap-4">
          <button 
            className="btn btn-primary flex-1"
            onClick={handleStartTask}
            disabled={isTaskRunning}
          >
            开始任务
          </button>
          <button 
            className="btn btn-danger flex-1"
            onClick={handleEndTask}
            disabled={!isTaskRunning}
          >
            结束任务
          </button>
        </div>
        {isTaskRunning && (
          <div className="mt-2 text-sm">
            任务进行中 - 操作员: {operator}
          </div>
        )}
      </div>
      
      {/* 速度控制 */}
      <div className="card mb-4">
        <h2 className="font-bold text-lg mb-2">速度控制</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm">速度: {speed}%</span>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={speed} 
            onChange={(e) => setSpeed(parseInt(e.target.value))}
            className="flex-1"
          />
        </div>
      </div>
      
      {/* 手动控制 */}
      <div className="card mb-4">
        <h2 className="font-bold text-lg mb-2">手动控制</h2>
        <Joystick speed={speed} />
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
          <button 
            className={`btn flex-1 ${areaLimit ? 'btn-success' : 'btn-primary'}`}
            onClick={handleAreaLimit}
            disabled={!isConnected}
          >
            {areaLimit ? '停止画地为牢' : '画地为牢'}
          </button>
        </div>
      </div>
      
      {/* 目标检测 */}
      <div className="card mb-4">
        <h2 className="font-bold text-lg mb-2">目标检测</h2>
        <div className="grid grid-cols-3 gap-2">
          <button 
            className={`btn ${detectionType === 'face' ? 'btn-success' : 'btn-primary'}`}
            onClick={() => handleObjectDetection('face')}
            disabled={!isConnected}
          >
            {detectionType === 'face' ? '停止人脸检测' : '人脸检测'}
          </button>
          <button 
            className={`btn ${detectionType === 'color' ? 'btn-success' : 'btn-primary'}`}
            onClick={() => handleObjectDetection('color')}
            disabled={!isConnected}
          >
            {detectionType === 'color' ? '停止颜色检测' : '颜色检测'}
          </button>
          <button 
            className={`btn ${detectionType === 'motion' ? 'btn-success' : 'btn-primary'}`}
            onClick={() => handleObjectDetection('motion')}
            disabled={!isConnected}
          >
            {detectionType === 'motion' ? '停止移动检测' : '移动检测'}
          </button>
        </div>
      </div>
      
      {/* 目标追踪 */}
      <div className="card mb-4">
        <h2 className="font-bold text-lg mb-2">目标追踪</h2>
        <div className="grid grid-cols-2 gap-2">
          <button 
            className={`btn ${trackingType === 'face' ? 'btn-success' : 'btn-primary'}`}
            onClick={() => handleObjectTracking('face')}
            disabled={!isConnected}
          >
            {trackingType === 'face' ? '停止人脸追踪' : '人脸追踪'}
          </button>
          <button 
            className={`btn ${trackingType === 'color' ? 'btn-success' : 'btn-primary'}`}
            onClick={() => handleObjectTracking('color')}
            disabled={!isConnected}
          >
            {trackingType === 'color' ? '停止颜色追踪' : '颜色追踪'}
          </button>
        </div>
      </div>
      
      {/* 目标识别 */}
      <div className="card mb-4">
        <h2 className="font-bold text-lg mb-2">目标识别</h2>
        <div className="grid grid-cols-3 gap-2">
          <button 
            className={`btn ${recognitionType === 'qr' ? 'btn-success' : 'btn-primary'}`}
            onClick={() => handleObjectRecognition('qr')}
            disabled={!isConnected}
          >
            {recognitionType === 'qr' ? '停止二维码识别' : '二维码识别'}
          </button>
          <button 
            className={`btn ${recognitionType === 'object' ? 'btn-success' : 'btn-primary'}`}
            onClick={() => handleObjectRecognition('object')}
            disabled={!isConnected}
          >
            {recognitionType === 'object' ? '停止物体识别' : '物体识别'}
          </button>
          <button 
            className={`btn ${recognitionType === 'gesture' ? 'btn-success' : 'btn-primary'}`}
            onClick={() => handleObjectRecognition('gesture')}
            disabled={!isConnected}
          >
            {recognitionType === 'gesture' ? '停止手势识别' : '手势识别'}
          </button>
        </div>
      </div>
      
      {/* 自动驾驶 */}
      <div className="card mb-4">
        <h2 className="font-bold text-lg mb-2">自动驾驶</h2>
        <button 
          className={`btn btn-block ${autoDriving ? 'btn-success' : 'btn-primary'}`}
          onClick={handleAutoDriving}
          disabled={!isConnected}
        >
          {autoDriving ? '停止自动驾驶' : '开始自动驾驶'}
        </button>
      </div>
    </div>
  );
};

export default Home;