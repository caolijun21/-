import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DefectCard from '../../components/DefectCard/DefectCard';
import { api } from '../../services/api';
import { setDefects, selectDefect, deleteDefect, setIsLoading, setError } from '../../redux/slices/defectsSlice';

const Defects = () => {
  const dispatch = useDispatch();
  const { ip, port, isConnected } = useSelector(state => state.connection);
  const { list: defects, selectedDefect, isLoading, error } = useSelector(state => state.defects);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showDetail, setShowDetail] = useState(false);

  // 获取缺陷列表
  const fetchDefects = async () => {
    if (!isConnected) return;
    
    dispatch(setIsLoading(true));
    try {
      const data = await api.getDefects(ip, port);
      dispatch(setDefects(data));
      dispatch(setError(null));
    } catch (error) {
      console.error('获取缺陷列表失败:', error);
      dispatch(setError('获取缺陷列表失败: ' + error.message));
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  // 组件挂载时获取缺陷列表
  useEffect(() => {
    fetchDefects();
  }, [isConnected, ip, port]);

  // 处理缺陷点击，显示详情
  const handleDefectClick = (defect) => {
    dispatch(selectDefect(defect));
    setShowDetail(true);
  };

  // 处理删除缺陷
  const handleDeleteDefect = async (defect) => {
    if (!isConnected) return;
    
    if (window.confirm('确定要删除这个缺陷记录吗？')) {
      try {
        // 这里应该调用API删除缺陷，假设API为DELETE /api/defects/{id}
        // await api.deleteDefect(ip, port, defect.id);
        dispatch(deleteDefect(defect.id));
      } catch (error) {
        console.error('删除缺陷失败:', error);
        dispatch(setError('删除缺陷失败: ' + error.message));
      }
    }
  };

  // 过滤缺陷
  const filteredDefects = defects.filter(defect => {
    const matchesSearch = defect.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || defect.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container pb-20">
      <h1 className="text-xl font-bold mb-4">缺陷记录</h1>
      
      {/* 搜索和筛选 */}
      <div className="card mb-4">
        <div className="mb-2">
          <input 
            type="text" 
            placeholder="搜索缺陷类型..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
          />
        </div>
        <div className="flex gap-2">
          <button 
            className={`btn ${filterType === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterType('all')}
          >
            全部
          </button>
          <button 
            className={`btn ${filterType === 'crack' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterType('crack')}
          >
            裂缝
          </button>
          <button 
            className={`btn ${filterType === 'corrosion' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterType('corrosion')}
          >
            腐蚀
          </button>
          <button 
            className={`btn ${filterType === 'deformation' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterType('deformation')}
          >
            变形
          </button>
        </div>
      </div>
      
      {/* 缺陷列表 */}
      {isLoading ? (
        <div className="flex justify-center">
          <div className="loading"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : filteredDefects.length === 0 ? (
        <div className="text-center py-8">
          <p>没有缺陷记录</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDefects.map(defect => (
            <DefectCard 
              key={defect.id} 
              defect={defect} 
              onClick={handleDefectClick}
            />
          ))}
        </div>
      )}
      
      {/* 缺陷详情模态框 */}
      {showDetail && selectedDefect && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 max-w-md w-full">
            <h2 className="font-bold text-xl mb-2">缺陷详情</h2>
            <div className="mb-4">
              <img 
                src={api.downloadFile(ip, port, selectedDefect.image)} 
                alt="缺陷图像" 
                className="w-full h-auto rounded"
              />
            </div>
            <div className="space-y-2">
              <div>
                <span className="font-bold">类型:</span> {selectedDefect.type}
              </div>
              <div>
                <span className="font-bold">置信度:</span> {Math.round(selectedDefect.confidence * 100)}%
              </div>
              <div>
                <span className="font-bold">距离:</span> {selectedDefect.distance.toFixed(2)}米
              </div>
              <div>
                <span className="font-bold">时间:</span> {new Date(selectedDefect.timestamp).toLocaleString()}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button 
                className="btn btn-danger flex-1"
                onClick={() => handleDeleteDefect(selectedDefect)}
              >
                删除
              </button>
              <button 
                className="btn btn-secondary flex-1"
                onClick={() => setShowDetail(false)}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Defects;