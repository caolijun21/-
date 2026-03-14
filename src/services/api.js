// API服务文件，用于与树莓派服务器进行通信

// 基础URL构建
const getBaseUrl = (ip, port) => `http://${ip}:${port}`;

// 通用请求函数
const request = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// API方法
export const api = {
  // 设备连接
  checkConnection: async (ip, port) => {
    const url = `${getBaseUrl(ip, port)}/`;
    try {
      const response = await fetch(url);
      return response.ok;
    } catch (error) {
      return false;
    }
  },
  
  // 视频流
  getVideoStreamUrl: (ip, port) => {
    // 使用端口 6001 作为视频流端口
    return `http://${ip}:6001/video_feed`;
  },
  
  // 状态获取
  getStatus: async (ip, port) => {
    const url = `${getBaseUrl(ip, port)}/api/status`;
    return request(url);
  },
  
  // 控制指令
  move: async (ip, port, direction, speed) => {
    const url = `${getBaseUrl(ip, port)}/api/control/move`;
    return request(url, {
      method: 'POST',
      body: JSON.stringify({ direction, speed }),
    });
  },
  
  // 云台控制
  moveCamera: async (ip, port, direction, speed) => {
    const url = `${getBaseUrl(ip, port)}/api/control/camera`;
    return request(url, {
      method: 'POST',
      body: JSON.stringify({ direction, speed }),
    });
  },
  
  stop: async (ip, port) => {
    const url = `${getBaseUrl(ip, port)}/api/control/stop`;
    return request(url, {
      method: 'POST',
    });
  },
  
  // 里程重置
  resetOdometry: async (ip, port) => {
    const url = `${getBaseUrl(ip, port)}/api/odometry/reset`;
    return request(url, {
      method: 'POST',
    });
  },
  
  // 避障跟踪
  startObstacleAvoidance: async (ip, port, mode) => {
    const url = `${getBaseUrl(ip, port)}/api/obstacle/start`;
    return request(url, {
      method: 'POST',
      body: JSON.stringify({ mode }), // mode: 'ultrasonic' or 'ultrasonic_ir'
    });
  },
  
  stopObstacleAvoidance: async (ip, port) => {
    const url = `${getBaseUrl(ip, port)}/api/obstacle/stop`;
    return request(url, {
      method: 'POST',
    });
  },
  
  // 巡线模式
  startLineFollowing: async (ip, port) => {
    const url = `${getBaseUrl(ip, port)}/api/line_following/start`;
    return request(url, {
      method: 'POST',
    });
  },
  
  stopLineFollowing: async (ip, port) => {
    const url = `${getBaseUrl(ip, port)}/api/line_following/stop`;
    return request(url, {
      method: 'POST',
    });
  },
  
  // 画地为牢
  startAreaLimit: async (ip, port) => {
    const url = `${getBaseUrl(ip, port)}/api/area_limit/start`;
    return request(url, {
      method: 'POST',
    });
  },
  
  stopAreaLimit: async (ip, port) => {
    const url = `${getBaseUrl(ip, port)}/api/area_limit/stop`;
    return request(url, {
      method: 'POST',
    });
  },
  
  // 目标检测
  startObjectDetection: async (ip, port, type) => {
    const url = `${getBaseUrl(ip, port)}/api/detection/start`;
    return request(url, {
      method: 'POST',
      body: JSON.stringify({ type }), // type: 'face', 'color', 'motion'
    });
  },
  
  stopObjectDetection: async (ip, port) => {
    const url = `${getBaseUrl(ip, port)}/api/detection/stop`;
    return request(url, {
      method: 'POST',
    });
  },
  
  // 目标追踪
  startObjectTracking: async (ip, port, type, color) => {
    const url = `${getBaseUrl(ip, port)}/api/tracking/start`;
    return request(url, {
      method: 'POST',
      body: JSON.stringify({ type, color }), // type: 'face', 'color'
    });
  },
  
  stopObjectTracking: async (ip, port) => {
    const url = `${getBaseUrl(ip, port)}/api/tracking/stop`;
    return request(url, {
      method: 'POST',
    });
  },
  
  // 目标识别
  startObjectRecognition: async (ip, port, type) => {
    const url = `${getBaseUrl(ip, port)}/api/recognition/start`;
    return request(url, {
      method: 'POST',
      body: JSON.stringify({ type }), // type: 'qr', 'object', 'gesture'
    });
  },
  
  stopObjectRecognition: async (ip, port) => {
    const url = `${getBaseUrl(ip, port)}/api/recognition/stop`;
    return request(url, {
      method: 'POST',
    });
  },
  
  // 自动驾驶
  startAutoDriving: async (ip, port) => {
    const url = `${getBaseUrl(ip, port)}/api/autodrive/start`;
    return request(url, {
      method: 'POST',
    });
  },
  
  stopAutoDriving: async (ip, port) => {
    const url = `${getBaseUrl(ip, port)}/api/autodrive/stop`;
    return request(url, {
      method: 'POST',
    });
  },
  
  // 缺陷管理
  getDefects: async (ip, port) => {
    const url = `${getBaseUrl(ip, port)}/api/defects`;
    return request(url);
  },
  
  // 拍照
  takeSnapshot: async (ip, port) => {
    const url = `${getBaseUrl(ip, port)}/api/snapshot`;
    return request(url, {
      method: 'POST',
    });
  },
  
  // 文件下载
  downloadFile: (ip, port, filename) => {
    return `${getBaseUrl(ip, port)}/api/download/${filename}`;
  },
  
  // 报告生成
  generateReport: async (ip, port, format) => {
    const url = `${getBaseUrl(ip, port)}/api/report/generate`;
    return request(url, {
      method: 'POST',
      body: JSON.stringify({ format }),
    });
  },
  
  // 报告列表
  getReports: async (ip, port) => {
    const url = `${getBaseUrl(ip, port)}/api/report/list`;
    return request(url);
  },
  
  // 任务管理
  startTask: async (ip, port, operator) => {
    const url = `${getBaseUrl(ip, port)}/api/task/start`;
    return request(url, {
      method: 'POST',
      body: JSON.stringify({ operator }),
    });
  },
  
  endTask: async (ip, port) => {
    const url = `${getBaseUrl(ip, port)}/api/task/end`;
    return request(url, {
      method: 'POST',
    });
  },
  
  getTaskStatus: async (ip, port) => {
    const url = `${getBaseUrl(ip, port)}/api/task/status`;
    return request(url);
  },
  
  // 网络设置
  scanWiFi: async (ip, port) => {
    const url = `${getBaseUrl(ip, port)}/api/network/scan`;
    return request(url);
  },
  
  connectWiFi: async (ip, port, ssid, password) => {
    const url = `${getBaseUrl(ip, port)}/api/network/connect`;
    return request(url, {
      method: 'POST',
      body: JSON.stringify({ ssid, password }),
    });
  },
  
  startHotspot: async (ip, port) => {
    const url = `${getBaseUrl(ip, port)}/api/network/hotspot`;
    return request(url, {
      method: 'POST',
    });
  },
  
  // 邮箱设置
  getEmailSettings: async (ip, port) => {
    const url = `${getBaseUrl(ip, port)}/api/settings/email`;
    return request(url);
  },
  
  saveEmailSettings: async (ip, port, settings) => {
    const url = `${getBaseUrl(ip, port)}/api/settings/email`;
    return request(url, {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  },
};

// WebSocket连接管理
export class WebSocketManager {
  constructor(ip, port) {
    this.ip = ip;
    this.port = port;
    this.ws = null;
    this.callbacks = {
      onOpen: [],
      onClose: [],
      onMessage: [],
      onError: [],
    };
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }
  
  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }
    
    const wsUrl = `ws://${this.ip}:${this.port}/ws`;
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.callbacks.onOpen.forEach(callback => callback());
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.callbacks.onClose.forEach(callback => callback());
      this.attemptReconnect();
    };
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.callbacks.onMessage.forEach(callback => callback(data));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.callbacks.onError.forEach(callback => callback(error));
    };
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }
  
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }
  
  off(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }
  
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
  
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// MQTT连接管理
export class MQTTManager {
  constructor() {
    this.brokerUrl = 'ws://broker.emqx.io:8083/mqtt';
    this.client = null;
    this.callbacks = {
      onConnect: [],
      onMessage: [],
      onError: [],
    };
  }
  
  connect() {
    if (this.client && this.client.connected) {
      return;
    }
    
    this.client = mqtt.connect(this.brokerUrl);
    
    this.client.on('connect', () => {
      console.log('MQTT 连接成功');
      // 订阅状态主题
      this.client.subscribe('pipe_robot/status');
      this.callbacks.onConnect.forEach(callback => callback());
    });
    
    this.client.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        this.callbacks.onMessage.forEach(callback => callback(topic, data));
      } catch (error) {
        console.error('Error parsing MQTT message:', error);
      }
    });
    
    this.client.on('error', (error) => {
      console.error('MQTT error:', error);
      this.callbacks.onError.forEach(callback => callback(error));
    });
  }
  
  disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
  }
  
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }
  
  off(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }
  
  // 发送指令函数
  sendCommand(command, params = {}) {
    if (this.client && this.client.connected) {
      const message = JSON.stringify({
        command: command,
        ...params,
        timestamp: Date.now()
      });
      this.client.publish('pipe_robot/command', message);
      console.log('指令已发送:', command);
      return true;
    }
    console.error('MQTT 未连接，无法发送指令');
    return false;
  }
  
  isConnected() {
    return this.client && this.client.connected;
  }
}