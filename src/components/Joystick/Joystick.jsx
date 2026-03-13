import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { api } from '../../services/api';
import { setDirection, setSpeed } from '../../redux/slices/statusSlice';

const Joystick = ({ speed = 50 }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const joystickRef = useRef(null);
  const dispatch = useDispatch();
  const { ip, port, isConnected } = useSelector(state => state.connection);

  // 计算方向和速度
  const calculateDirection = (x, y) => {
    const distance = Math.sqrt(x * x + y * y);
    const maxDistance = 60; // 摇杆最大移动距离
    const normalizedDistance = Math.min(distance / maxDistance, 1);
    const currentSpeed = Math.round(normalizedDistance * speed);

    const deviceIp = ip || '10.42.0.1';
    const devicePort = port || 5000;

    if (distance < 10) {
      // 停止
      dispatch(setDirection('stop'));
      dispatch(setSpeed(0));
      if (isConnected) {
        api.stop(deviceIp, devicePort).catch(err => console.error('Error stopping:', err));
      }
      return;
    }

    // 计算角度
    const angle = Math.atan2(y, x) * 180 / Math.PI;
    let direction = 'stop';

    // 根据角度确定方向
    if (angle >= -45 && angle < 45) {
      direction = 'right';
    } else if (angle >= 45 && angle < 135) {
      direction = 'forward';
    } else if (angle >= 135 || angle < -135) {
      direction = 'left';
    } else if (angle >= -135 && angle < -45) {
      direction = 'backward';
    }

    dispatch(setDirection(direction));
    dispatch(setSpeed(currentSpeed));

    // 发送控制指令
    if (isConnected) {
      api.move(deviceIp, devicePort, direction, currentSpeed).catch(err => console.error('Error moving:', err));
    }
  };

  // 处理触摸/鼠标开始
  const handleStart = (e) => {
    setIsDragging(true);
    updatePosition(e);
  };

  // 处理触摸/鼠标移动
  const handleMove = (e) => {
    if (isDragging) {
      updatePosition(e);
    }
  };

  // 处理触摸/鼠标结束
  const handleEnd = () => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    dispatch(setDirection('stop'));
    dispatch(setSpeed(0));
    if (isConnected) {
      api.stop(ip, port).catch(err => console.error('Error stopping:', err));
    }
  };

  // 更新摇杆位置
  const updatePosition = (e) => {
    if (!joystickRef.current) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let clientX, clientY;
    if (e.type.includes('touch')) {
      e.preventDefault();
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - centerX;
    const y = clientY - centerY;
    const distance = Math.sqrt(x * x + y * y);
    const maxDistance = 60; // 摇杆最大移动距离

    if (distance > maxDistance) {
      const angle = Math.atan2(y, x);
      setPosition({
        x: Math.cos(angle) * maxDistance,
        y: Math.sin(angle) * maxDistance
      });
      calculateDirection(Math.cos(angle) * maxDistance, Math.sin(angle) * maxDistance);
    } else {
      setPosition({ x, y });
      calculateDirection(x, y);
    }
  };

  // 急停按钮
  const handleEmergencyStop = () => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    dispatch(setDirection('stop'));
    dispatch(setSpeed(0));
    if (isConnected) {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 5000;
      api.stop(deviceIp, devicePort).catch(err => console.error('Error stopping:', err));
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        className="joystick-container" 
        ref={joystickRef}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        <div 
          className="joystick-thumb" 
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`
          }}
        />
      </div>
      
      <div className="w-full max-w-xs">
        <div className="flex justify-between mb-1">
          <span className="text-sm">速度: {speed}%</span>
          <button 
            className="btn btn-danger btn-sm"
            onClick={handleEmergencyStop}
          >
            急停
          </button>
        </div>
      </div>
    </div>
  );
};

export default Joystick;