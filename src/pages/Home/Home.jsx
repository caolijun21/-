import React, { useEffect } from 'react';
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

  // WebSocket管理器实例
  let wsManager = null;

  // 连接到设备
  const connectToDevice = async () => {
    try {
      const connected = await api.checkConnection(ip, port);
      if (connected) {
        dispatch(setIsConnected(true));
        dispatch(setError(null));
        
        // 初始化WebSocket连接
        wsManager = new WebSocketManager(ip, port);
        wsManager.connect();
        
        // 监听WebSocket消息
        wsManager.on('message', (data) => {
          if (data.type === 'status') {
            dispatch(updateStatus(data.payload));
          }
        });
        
        // 获取初始状态
        const status = await api.getStatus(ip, port);
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
      await api.startTask(ip, port, operatorName);
      dispatch(startTask({ operator: operatorName }));
    } catch (error) {
      console.error('开始任务失败:', error);
    }
  };

  // 结束任务
  const handleEndTask = async () => {
    if (!isConnected || !isTaskRunning) return;
    
    try {
      await api.endTask(ip, port);
      dispatch(endTask({}));
    } catch (error) {
      console.error('结束任务失败:', error);
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
      
      {/* 虚拟摇杆 */}
      <div className="mt-4">
        <h2 className="font-bold text-lg mb-2">手动控制</h2>
        <Joystick />
      </div>
    </div>
  );
};

export default Home;