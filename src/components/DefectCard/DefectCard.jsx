import React from 'react';
import { useSelector } from 'react-redux';
import { api } from '../../services/api';

const DefectCard = ({ defect, onClick }) => {
  const { ip, port } = useSelector(state => state.connection);

  // 获取缺陷图像URL
  const getDefectImageUrl = (filename) => {
    return api.downloadFile(ip, port, filename);
  };

  return (
    <div className="card" onClick={() => onClick(defect)}>
      <div className="flex gap-4">
        <div className="w-24 h-24 flex-shrink-0">
          <img 
            src={getDefectImageUrl(defect.image)} 
            alt="缺陷图像" 
            className="w-full h-full object-cover rounded"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">{defect.type}</h3>
          <div className="text-sm text-gray-600 mb-1">
            置信度: {Math.round(defect.confidence * 100)}%
          </div>
          <div className="text-sm text-gray-600 mb-1">
            距离: {defect.distance.toFixed(2)}米
          </div>
          <div className="text-sm text-gray-600">
            时间: {new Date(defect.timestamp).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefectCard;