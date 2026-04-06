import React, { useState, useEffect } from 'react';
import { llmService } from '../services/llmService';

interface TitleScreenProps {
  onStart: () => void;
  onSettings: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, onSettings }) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [paperType, setPaperType] = useState('计算机+人工智能');
  const [paperTypes, setPaperTypes] = useState<string[]>(['计算机+人工智能']);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  useEffect(() => {
    // 动态获取可用的论文类型
    const fetchTypes = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/paper_types');
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          setPaperTypes(json.data);
          if (json.data.length > 0) setPaperType(json.data[0]);
        }
      } catch (e) {
        console.error("Failed to fetch paper types:", e);
      }
    };
    fetchTypes();
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadProgress('文件发送中...');
    
    // 因为在本地或者网络好的情况下上传很快，这里设置一个稍后的定时器模拟后端真正读取
    const readingTimer = setTimeout(() => {
        setUploadProgress('耶芙娜阅读中...');
    }, 1500);

    try {
      const result = await llmService.analyzePaperGalgame(file, paperType, '');
      clearTimeout(readingTimer);
      if (result.status === 'success') {
        alert("解析完成！你可以点击“开始组会”去项目列表里找到它了！");
        setShowUploadModal(false);
        setFile(null);
      } else {
        alert("解析失败: " + JSON.stringify(result));
      }
    } catch (e: any) {
      clearTimeout(readingTimer);
      alert("上传失败: " + e.message);
    } finally {
      clearTimeout(readingTimer);
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative overflow-hidden">
      {/* Full Premium Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center animate-[scale_20s_ease-in-out_infinite_alternate]"
        style={{ backgroundImage: 'url(http://localhost:8000/api/assets/title_bg.png)' }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-red-900/20 to-transparent pointer-events-none mix-blend-multiply" />

      {/* Main Content Container */}
      <div className="z-10 flex flex-col items-center mt-32 md:mt-48 w-full px-6 transition-all duration-500">
        
        {/* Main Title */}
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-red-50 to-red-100 drop-shadow-[0_0_15px_rgba(255,50,50,0.8)] tracking-widest text-center mb-6 font-serif">
          犹格索托斯的组会
        </h1>
        
        {/* Subtitle / Decorative element */}
        <div className="flex items-center space-x-4 mb-20 opacity-80 backdrop-blur-sm bg-black/30 px-8 py-2 rounded-full border border-red-900/50">
          <div className="h-px w-12 bg-gradient-to-l from-red-500 to-transparent"></div>
          <span className="text-red-200 font-serif tracking-[0.5em] text-sm uppercase">
            Yog-Sothoth's Seminar
          </span>
          <div className="h-px w-12 bg-gradient-to-r from-red-500 to-transparent"></div>
        </div>

        {/* Buttons List Container */}
        <div className="flex flex-col space-y-4 items-center">
            <MenuButton onClick={onStart} label="开始组会" subLabel="START GAME" />
            <MenuButton onClick={() => setShowUploadModal(true)} label="上传论文" subLabel="UPLOAD PDF" />
            <MenuButton onClick={onSettings} label="系统设置" subLabel="CONFIG" />
        </div>
      </div>
      
      {/* Footer text */}
      <div className="absolute bottom-4 left-6 text-red-100/50 text-xs font-serif tracking-widest pointer-events-none">
         Powered by Advanced Agentic Customization • 2026 Red Dragon Edition
      </div>

      {/* Upload Modal Overlay */}
      {showUploadModal && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-6">
           <div className="bg-gray-900 border border-red-900 p-8 rounded-lg shadow-[0_0_30px_rgba(255,0,0,0.2)] max-w-md w-full flex flex-col relative text-white">
              <button 
                onClick={() => setShowUploadModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white"
                disabled={isUploading}
              >
                ✕
              </button>
              
              <h2 className="text-2xl font-serif text-red-400 mb-6 tracking-wider border-b border-red-900/50 pb-2">献上新的学术卷轴</h2>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">选择论文 (PDF)</label>
                <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-red-900/30 file:text-red-300 hover:file:bg-red-900/50 outline-none"
                  disabled={isUploading}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">研究领域 / 提示词流派</label>
                <select 
                  value={paperType}
                  onChange={(e) => setPaperType(e.target.value)}
                  className="w-full bg-black/50 border border-red-900/50 rounded py-2 px-3 text-red-200 outline-none focus:border-red-500"
                  disabled={isUploading}
                >
                  {paperTypes.map(pt => (
                    <option key={pt} value={pt}>{pt}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={handleUpload}
                disabled={!file || isUploading}
                className={`
                  w-full py-3 rounded font-bold tracking-widest transition-all duration-300
                  ${!file || isUploading ? 'bg-gray-800 text-gray-600' : 'bg-red-900/80 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(255,50,50,0.5)]'}
                `}
              >
                {isUploading ? (uploadProgress || '文件发送中...') : '发送给耶芙娜'}
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

const MenuButton: React.FC<{ onClick: () => void; label: string; subLabel: string }> = ({ onClick, label, subLabel }) => (
  <button 
    onClick={onClick}
    className="
      group relative overflow-hidden transition-all duration-500
      w-64 h-14 md:w-80 md:h-16 flex items-center justify-center
      bg-black/40 backdrop-blur-md border border-red-900/50 hover:bg-red-900/40 hover:border-red-500
      rounded shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(255,0,0,0.3)]
    "
  >
    <div className="flex flex-row items-baseline space-x-4 z-10 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
      <span className="text-xl md:text-2xl font-bold font-serif text-gray-100 group-hover:text-white drop-shadow-md tracking-widest">
          {label}
      </span>
      <span className="text-xs md:text-sm font-sans text-red-500/80 group-hover:text-red-400 tracking-wider">
          {subLabel}
      </span>
    </div>
    
    <div className="absolute -inset-full w-[200%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-[45deg] group-hover:animate-[shine_1.5s_infinite_linear]"></div>
  </button>
);