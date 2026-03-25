import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../../services/api';

const Defects = () => {
  const { ip, port, isConnected } = useSelector(state => state.connection);
  const [defects, setDefects] = useState([]);

  // 获取缺陷列表
  const fetchDefects = async () => {
    if (!isConnected) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 6002;
      const defectsData = await api.getDefects(deviceIp, devicePort);
      setDefects(defectsData);
    } catch (error) {
      console.error('获取缺陷列表失败:', error);
    }
  };

  // 组件挂载时获取缺陷列表
  useEffect(() => {
    fetchDefects();
  }, [isConnected, ip, port]);

  return (
    <div className="container pb-20">
      <h1 className="text-xl font-bold mb-4">缺陷记录</h1>
      
      <div className="card mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">缺陷列表</h2>
          <button 
            className="btn btn-primary"
            onClick={fetchDefects}
            disabled={!isConnected}
          >
            刷新列表
          </button>
        </div>
        
        {defects.length > 0 ? (
          <div className="defects-table">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b">时间</th>
                  <th className="text-left p-2 border-b">缺陷类型</th>
                  <th className="text-left p-2 border-b">距离(米)</th>
                  <th className="text-left p-2 border-b">置信度(%)</th>
                  <th className="text-left p-2 border-b">图像</th>
                </tr>
              </thead>
              <tbody>
                {defects.map((defect, index) => (
                  <tr key={index}>
                    <td className="p-2 border-b">{defect.time || new Date().toLocaleString()}</td>
                    <td className="p-2 border-b">{defect.type || '未知'}</td>
                    <td className="p-2 border-b">{defect.distance || 'N/A'}</td>
                    <td className="p-2 border-b">{defect.confidence || 'N/A'}</td>
                    <td className="p-2 border-b">
                      {defect.image ? (
                        <img 
                          src={api.downloadFile(ip || '10.42.0.1', port || 6002, defect.image)}
                          alt="缺陷图像"
                          className="w-16 h-16 object-cover"
                        />
                      ) : (
                        '无图像'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>暂无缺陷记录</p>
        )}
      </div>
    </div>
  );
};

export default Defects;