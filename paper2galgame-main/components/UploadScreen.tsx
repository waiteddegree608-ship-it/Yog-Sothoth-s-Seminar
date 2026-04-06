import React, { useState, useEffect } from 'react';
import { getProjectsList, playProject } from '../services/llmService';
import { ProjectInfo, DialogueLine, GameSettings } from '../types';

interface UploadScreenProps {
  onScriptGenerated: (script: DialogueLine[], title: string) => void;
  onBack: () => void;
  settings: GameSettings;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({ onScriptGenerated, onBack }) => {
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [errorDesc, setErrorDesc] = useState<string | null>(null);

  useEffect(() => {
    // Fetch cached project parsed list
    getProjectsList()
      .then(data => {
        setProjects(data);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        setErrorDesc("加载项目列表失败...");
      });
  }, []);

  const handleSelectProject = async (projectId: string) => {
    setStartingId(projectId);
    setErrorDesc(null);
    try {
      const resp = await playProject(projectId);
      onScriptGenerated(resp.script, resp.title || projectId);
    } catch (e) {
      setErrorDesc("加载剧本出错啦！");
      setStartingId(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center p-8 bg-white/40 backdrop-blur-md">
      
      {/* Header */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-8">
        <button 
          onClick={onBack}
          className="px-6 py-2 bg-white/60 hover:bg-white text-gray-800 rounded-full font-bold shadow transition-all active:scale-95"
        >
          ← 返回标题
        </button>
        <h1 className="text-3xl font-extrabold text-gray-800 drop-shadow-md">
           选择已解析文献档案馆
        </h1>
        <div className="w-24"></div> {/* Spacer for centering */}
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
            <p className="text-xl text-gray-600 animate-pulse font-bold">小丛雨正在翻箱倒柜找论文呢...</p>
        </div>
      )}

      {errorDesc && (
        <div className="w-full max-w-4xl p-4 mb-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            {errorDesc}
        </div>
      )}

      {/* Project Grid / List */}
      {!loading && projects.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center opacity-70">
              <span className="text-6xl mb-4">📂</span>
              <p className="text-xl text-gray-800 font-bold">书库里空空如也，还没有处理好的论文哦</p>
          </div>
      )}

      {!loading && projects.length > 0 && (
         <div className="w-full max-w-5xl flex-1 overflow-y-auto pr-4 space-y-6">
            {projects.map((proj) => (
                <button
                    key={proj.id}
                    onClick={() => handleSelectProject(proj.id)}
                    disabled={startingId !== null}
                    className="w-full text-left relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group h-48 border-4 border-white/40 hover:border-white/80"
                >
                    {/* Background Layer with frosted glass */}
                    <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url(${proj.cover})` }}
                    />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm group-hover:bg-black/20 group-hover:backdrop-blur-none transition-all duration-500" />
                    
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    {/* Content Layer */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                        <span className="text-sm font-bold text-pink-300 mb-1 uppercase tracking-widest">
                            {proj.id}
                        </span>
                        <h2 className="text-3xl font-extrabold text-white drop-shadow-lg line-clamp-2">
                           {proj.title}
                        </h2>
                    </div>

                    {/* Loading Spinner overlay when clicked */}
                    {startingId === proj.id && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-md flex items-center justify-center">
                             <div className="relative flex justify-center items-center">
                                <div className="absolute animate-ping inline-flex h-12 w-12 rounded-full bg-pink-400 opacity-75"></div>
                                <div className="relative inline-flex rounded-full h-8 w-8 bg-pink-500"></div>
                             </div>
                        </div>
                    )}
                </button>
            ))}
         </div>
      )}

    </div>
  );
};