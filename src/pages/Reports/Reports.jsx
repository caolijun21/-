import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../../services/api';

const Reports = () => {
  const { ip, port, isConnected } = useSelector(state => state.connection);
  const [reports, setReports] = useState([]);
  const [reportFormat, setReportFormat] = useState('pdf');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSettings, setEmailSettings] = useState({
    smtp: '',
    port: '',
    email: '',
    password: '',
    recipient: ''
  });

  // 获取报告列表
  const fetchReports = async () => {
    if (!isConnected) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 6002;
      const reportsData = await api.getReports(deviceIp, devicePort);
      setReports(reportsData);
    } catch (error) {
      console.error('获取报告列表失败:', error);
    }
  };

  // 生成报告
  const handleGenerateReport = async () => {
    if (!isConnected) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 6002;
      const result = await api.generateReport(deviceIp, devicePort, reportFormat);
      console.log('报告生成成功:', result);
      
      // 刷新报告列表
      fetchReports();
    } catch (error) {
      console.error('生成报告失败:', error);
    }
  };

  // 保存邮箱设置
  const handleSaveEmailSettings = async () => {
    if (!isConnected) return;
    
    try {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 6002;
      await api.saveEmailSettings(deviceIp, devicePort, emailSettings);
      setShowEmailModal(false);
    } catch (error) {
      console.error('保存邮箱设置失败:', error);
    }
  };

  // 组件挂载时获取报告列表和邮箱设置
  useEffect(() => {
    fetchReports();
    
    if (isConnected) {
      const deviceIp = ip || '10.42.0.1';
      const devicePort = port || 6002;
      api.getEmailSettings(deviceIp, devicePort)
        .then(data => {
          if (data) {
            setEmailSettings(data);
          }
        })
        .catch(error => {
          console.error('获取邮箱设置失败:', error);
        });
    }
  }, [isConnected, ip, port]);

  return (
    <div className="container pb-20">
      <h1 className="text-xl font-bold mb-4">报告管理</h1>
      
      <div className="card mb-4">
        <h2 className="font-bold text-lg mb-2">报告生成</h2>
        <div className="mb-4">
          <label className="block mb-2">报告格式:</label>
          <select 
            value={reportFormat} 
            onChange={(e) => setReportFormat(e.target.value)}
            className="input"
          >
            <option value="pdf">PDF</option>
            <option value="txt">TXT</option>
            <option value="json">JSON</option>
          </select>
        </div>
        <div className="flex gap-2 mb-4">
          <button 
            className="btn btn-primary flex-1"
            onClick={handleGenerateReport}
            disabled={!isConnected}
          >
            生成报告
          </button>
          <button 
            className="btn btn-secondary flex-1"
            onClick={fetchReports}
            disabled={!isConnected}
          >
            刷新报告列表
          </button>
        </div>
        <button 
          className="btn btn-secondary mb-4"
          onClick={() => setShowEmailModal(true)}
          disabled={!isConnected}
        >
          配置邮箱
        </button>
        
        {reports.length > 0 && (
          <div className="reports-list">
            <h3 className="font-bold mb-2">报告列表:</h3>
            <ul>
              {reports.map((report, index) => (
                <li key={index} className="mb-2">
                  <a 
                    href={api.downloadFile(ip || '10.42.0.1', port || 6002, report.filename)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {report.filename}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* 邮箱配置模态框 */}
      {showEmailModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="font-bold text-lg mb-4">配置邮箱</h3>
            <div className="mb-4">
              <label className="block mb-2">SMTP服务器:</label>
              <input 
                type="text" 
                value={emailSettings.smtp}
                onChange={(e) => setEmailSettings({...emailSettings, smtp: e.target.value})}
                className="input"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">端口:</label>
              <input 
                type="text" 
                value={emailSettings.port}
                onChange={(e) => setEmailSettings({...emailSettings, port: e.target.value})}
                className="input"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">发件人邮箱:</label>
              <input 
                type="email" 
                value={emailSettings.email}
                onChange={(e) => setEmailSettings({...emailSettings, email: e.target.value})}
                className="input"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">密码:</label>
              <input 
                type="password" 
                value={emailSettings.password}
                onChange={(e) => setEmailSettings({...emailSettings, password: e.target.value})}
                className="input"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">收件人邮箱:</label>
              <input 
                type="email" 
                value={emailSettings.recipient}
                onChange={(e) => setEmailSettings({...emailSettings, recipient: e.target.value})}
                className="input"
              />
            </div>
            <div className="flex gap-2">
              <button 
                className="btn btn-primary flex-1"
                onClick={handleSaveEmailSettings}
              >
                保存
              </button>
              <button 
                className="btn btn-secondary flex-1"
                onClick={() => setShowEmailModal(false)}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;