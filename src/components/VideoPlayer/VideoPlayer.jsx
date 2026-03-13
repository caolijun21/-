import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../../services/api';

const VideoPlayer = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef(null);
  const { ip, port, isConnected } = useSelector(state => state.connection);

  // 获取视频流URL
  const deviceIp = ip || '10.42.0.1';
  const devicePort = port || 5000;
  const videoUrl = isConnected ? api.getVideoStreamUrl(deviceIp, devicePort) : '';

  // 处理全屏切换
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // 处理视频加载
  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  // 处理视频错误
  const handleVideoError = () => {
    setIsLoading(true);
  };

  // 截图功能
  const captureScreenshot = async () => {
    if (!videoRef.current) return;
    
    try {
      // 这里可以实现截图功能，例如使用canvas
      console.log('Screenshot captured');
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    }
  };

  return (
    <div className="video-container" ref={videoRef}>
      {isLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="loading"></div>
        </div>
      )}
      {isConnected ? (
        <>
          <img 
            src={videoUrl} 
            alt="实时视频" 
            className="w-full h-full object-cover" 
            onLoad={handleVideoLoad}
            onError={handleVideoError}
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <button 
              onClick={captureScreenshot}
              className="bg-white bg-opacity-50 rounded-full p-2"
              aria-label="截图"
            >
              📷
            </button>
            <button 
              onClick={toggleFullscreen}
              className="bg-white bg-opacity-50 rounded-full p-2"
              aria-label="全屏"
            >
              📺
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-white">
          <p>未连接到设备</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;