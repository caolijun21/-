import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ReportItem from '../../components/ReportItem/ReportItem';
import { api } from '../../services/api';
import { setReports, addReport, setIsGenerating, setError } from '../../redux/slices/reportsSlice';

const Reports = () => {
  const dispatch = useDispatch();
  const { ip, port, isConnected } = useSelector(state => state.connection);
  const { list: reports, isGenerating, error } = useSelector(state => state.reports);
  const [reportFormat, setReportFormat] = useState('pdf');

  // 获取报告列表
  const fetchReports = async () => {
    if (!isConnected) return;
    
    try {
      const data = await api.getReports(ip, port);
      dispatch(setReports(data));
      dispatch(setError(null));
    } catch (error) {
      console.error('获取报告列表失败:', error);
      dispatch(setError('获取报告列表失败: ' + error.message));
    }
  };

  // 组件挂载时获取报告列表
  useEffect(() => {
    fetchReports();
  }, [isConnected, ip, port]);

  // 生成报告
  const handleGenerateReport = async () => {
    if (!isConnected) return;
    
    dispatch(setIsGenerating(true));
    try {
      const result = await api.generateReport(ip, port, reportFormat);
      dispatch(addReport(result));
      dispatch(setError(null));
    } catch (error) {
      console.error('生成报告失败:', error);
      dispatch(setError('生成报告失败: ' + error.message));
    } finally {
      dispatch(setIsGenerating(false));
    }
  };

  // 下载报告
  const handleDownloadReport = (report) => {
    if (!isConnected) return;
    
    const downloadUrl = api.downloadFile(ip, port, report.filename);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = report.filename;
    link.click();
  };

  // 删除报告
  const handleDeleteReport = async (report) => {
    if (!isConnected) return;
    
    if (window.confirm('确定要删除这个报告吗？')) {
      try {
        // 这里应该调用API删除报告，假设API为DELETE /api/report/{filename}
        // await api.deleteReport(ip, port, report.filename);
        dispatch(setReports(reports.filter(r => r.filename !== report.filename)));
      } catch (error) {
        console.error('删除报告失败:', error);
        dispatch(setError('删除报告失败: ' + error.message));
      }
    }
  };

  return (
    <div className="container pb-20">
      <h1 className="text-xl font-bold mb-4">报告管理</h1>
      
      {/* 生成报告 */}
      <div className="card mb-4">
        <h2 className="font-bold text-lg mb-2">生成报告</h2>
        <div className="flex gap-2 mb-2">
          <select 
            value={reportFormat} 
            onChange={(e) => setReportFormat(e.target.value)}
            className="input flex-1"
          >
            <option value="pdf">PDF</option>
            <option value="json">JSON</option>
            <option value="txt">TXT</option>
          </select>
          <button 
            className="btn btn-primary"
            onClick={handleGenerateReport}
            disabled={isGenerating || !isConnected}
          >
            {isGenerating ? '生成中...' : '生成'}
          </button>
        </div>
      </div>
      
      {/* 报告列表 */}
      {error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-8">
          <p>没有报告记录</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(report => (
            <ReportItem 
              key={report.filename} 
              report={report} 
              onDownload={handleDownloadReport}
              onDelete={handleDeleteReport}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;