// 本地存储服务文件，用于处理离线缓存和数据持久化

const STORAGE_KEYS = {
  DEFECTS: 'pipe_inspection_defects',
  REPORTS: 'pipe_inspection_reports',
  SETTINGS: 'pipe_inspection_settings',
  TASK_HISTORY: 'pipe_inspection_task_history',
  CONNECTION: 'pipe_inspection_connection',
};

// 通用存储方法
const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// 存储服务
export const storage = {
  // 缺陷记录
  saveDefects: (defects) => {
    setItem(STORAGE_KEYS.DEFECTS, defects);
  },
  
  getDefects: () => {
    return getItem(STORAGE_KEYS.DEFECTS, []);
  },
  
  // 报告列表
  saveReports: (reports) => {
    setItem(STORAGE_KEYS.REPORTS, reports);
  },
  
  getReports: () => {
    return getItem(STORAGE_KEYS.REPORTS, []);
  },
  
  // 系统设置
  saveSettings: (settings) => {
    setItem(STORAGE_KEYS.SETTINGS, settings);
  },
  
  getSettings: () => {
    return getItem(STORAGE_KEYS.SETTINGS, {
      email: {
        smtp: '',
        port: 587,
        username: '',
        password: '',
        recipient: '',
      },
      network: {
        mode: 'hotspot',
        ssid: '',
        password: '',
      },
      odometry: {
        wheelDiameter: 0.1,
        pulsesPerRevolution: 1000,
      },
    });
  },
  
  // 任务历史
  saveTaskHistory: (history) => {
    setItem(STORAGE_KEYS.TASK_HISTORY, history);
  },
  
  getTaskHistory: () => {
    return getItem(STORAGE_KEYS.TASK_HISTORY, []);
  },
  
  // 连接信息
  saveConnectionInfo: (info) => {
    setItem(STORAGE_KEYS.CONNECTION, info);
  },
  
  getConnectionInfo: () => {
    return getItem(STORAGE_KEYS.CONNECTION, {
      ip: '192.168.1.1',
      port: 5000,
    });
  },
  
  // 清除所有数据
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      removeItem(key);
    });
  },
};

// 离线缓存管理
export class OfflineCache {
  constructor() {
    this.queue = [];
    this.isOnline = navigator.onLine;
    
    // 监听网络状态变化
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }
  
  // 添加到队列
  addToQueue(action, payload) {
    this.queue.push({ action, payload, timestamp: Date.now() });
    if (this.isOnline) {
      this.processQueue();
    }
  }
  
  // 处理队列
  processQueue() {
    if (!this.isOnline || this.queue.length === 0) {
      return;
    }
    
    const queueCopy = [...this.queue];
    this.queue = [];
    
    queueCopy.forEach(item => {
      // 这里可以根据action类型执行不同的操作
      console.log('Processing offline action:', item.action, item.payload);
      // 例如：重新发送API请求
    });
  }
  
  // 获取队列长度
  getQueueLength() {
    return this.queue.length;
  }
  
  // 清空队列
  clearQueue() {
    this.queue = [];
  }
}