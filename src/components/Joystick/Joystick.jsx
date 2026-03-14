import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { api } from '../../services/api';
import { setDirection, setSpeed } from '../../redux/slices/statusSlice';

const Joystick = ({ speed = 50, onSpeedChange, mqttManager }) => {
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

    if (distance < 10) {
      // 停止
      dispatch(setDirection('stop'));
      dispatch(setSpeed(0));
      if (isConnected && mqttManager) {
        mqttManager.sendCommand('stop');
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
    if (isConnected && mqttManager) {
      mqttManager.sendCommand('move', { direction, speed: currentSpeed });
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
    if (isConnected && mqttManager) {
      mqttManager.sendCommand('stop');
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
    if (isConnected && mqttManager) {
      mqttManager.sendCommand('stop');
    }
  };

  const handleSpeedChange = (e) => {
    const value = parseInt(e.target.value);
    if (Number.isNaN(value)) return;
    if (onSpeedChange) {
      onSpeedChange(value);
    }
  };

  return (
    <div className="joystick-panel">
      <button
        className="joystick-stop-button"
        onClick={handleEmergencyStop}
      >
        停
      </button>

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

      <div className="joystick-speed">
        <span className="joystick-speed-percent">{speed}%</span>
        <input
          type="range"
          min="0"
          max="100"
          value={speed}
          onChange={handleSpeedChange}
          className="vertical-slider"
        />
      </div>
    </div>
  );
};

export default Joystick;