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
  const [areaLimit, setAreaLimit] = useState(false);
  const [detectionType, setDetectionType] = useState(null);
  const [trackingType, setTrackingType] = useState(null);
  const [recognitionType, setRecognitionType] = useState(null);
  const [autoDriving, setAutoDriving] = useState(false);
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

  // 开始任务
  const handleStartTask = () => {
    if (!isConnected) return;
    
    const operatorName = prompt('请输入操作员姓名:');
    if (!operatorName) return;
    
    if (mqttManager) {
      mqttManager.sendCommand('start_task', { operator: operatorName });
      dispatch(startTask({ operator: operatorName }));
    }
  };

  // 结束任务
  const handleEndTask = () => {
    if (!isConnected || !isTaskRunning) return;
    
    if (mqttManager) {
      mqttManager.sendCommand('end_task');
      dispatch(endTask({}));
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

  // 画地为牢控制
  const handleAreaLimit = () => {
    if (!isConnected) return;
    
    if (mqttManager) {
      if (areaLimit) {
        mqttManager.sendCommand('stop_area_limit');
        setAreaLimit(false);
      } else {
        mqttManager.sendCommand('start_area_limit');
        setAreaLimit(true);
      }
    }
  };

  // 目标检测控制
  const handleObjectDetection = (type) => {
    if (!isConnected) return;
    
    if (mqttManager) {
      if (detectionType === type) {
        mqttManager.sendCommand('stop_object_detection');
        setDetectionType(null);
      } else {
        mqttManager.sendCommand('start_object_detection', { type });
        setDetectionType(type);
      }
    }
  };

  // 目标追踪控制
  const handleObjectTracking = (type) => {
    if (!isConnected) return;
    
    if (mqttManager) {
      if (trackingType === type) {
        mqttManager.sendCommand('stop_object_tracking');
        setTrackingType(null);
      } else {
        mqttManager.sendCommand('start_object_tracking', { type });
        setTrackingType(type);
      }
    }
  };

  // 目标识别控制
  const handleObjectRecognition = (type) => {
    if (!isConnected) return;
    
    if (mqttManager) {
      if (recognitionType === type) {
        mqttManager.sendCommand('stop_object_recognition');
        setRecognitionType(null);
      } else {
        mqttManager.sendCommand('start_object_recognition', { type });
        setRecognitionType(type);
      }
    }
  };

  // 自动驾驶控制
  const handleAutoDriving = () => {
    if (!isConnected) return;
    
    if (mqttManager) {
      if (autoDriving) {
        mqttManager.sendCommand('stop_auto_driving');
        setAutoDriving(false);
      } else {
        mqttManager.sendCommand('start_auto_driving');
        setAutoDriving(true);
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
      
      {/* 任务控制（开始/结束巡检） */}
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