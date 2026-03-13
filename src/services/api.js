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
    return `${getBaseUrl(ip, port)}/video_feed`;
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