import React from 'react';
import { useSelector } from 'react-redux';
import { api } from '../../services/api';

const ReportItem = ({ report, onDownload, onDelete }) => {
  const { ip, port } = useSelector(state => state.connection);

  // 获取报告下载URL
  const getReportDownloadUrl = (filename) => {
    return api.downloadFile(ip, port, filename);
  };

  // 处理下载
  const handleDownload = (e) => {
    e.stopPropagation();
    onDownload(report);
  };

  // 处理删除
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(report);
  };

  return (
    <div className="card flex justify-between items-center">
      <div>
        <h3 className="font-bold text-lg mb-1">{report.filename}</h3>
        <div className="text-sm text-gray-600 mb-1">
          大小: {report.size} bytes
        </div>
        <div className="text-sm text-gray-600">
          生成时间: {new Date(report.timestamp).toLocaleString()}
        </div>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={handleDownload}
          className="btn btn-primary btn-sm"
        >
          下载
        </button>
        <button 
          onClick={handleDelete}
          className="btn btn-danger btn-sm"
        >
          删除
        </button>
      </div>
    </div>
  );
};

export default ReportItem;