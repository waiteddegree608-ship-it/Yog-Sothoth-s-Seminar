import React, { useState, useEffect } from 'react';
import { getProjectsList, playProject } from '../services/llmService';
import { ProjectInfo, DialogueLine, GameSettings } from '../types';

interface UploadScreenProps {
  onScriptGenerated: (script: DialogueLine[], title: string, char_id?: string, project_id?: string, outfit_param?: string) => void;
  onBack: () => void;
  settings: GameSettings;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({ onScriptGenerated, onBack }) => {
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [errorDesc, setErrorDesc] = useState<string | null>(null);

  // Character and Outfit Selection
  const [characters, setCharacters] = useState<any[]>([]);
  const [selectedCharId, setSelectedCharId] = useState<string>('yevna');
  const [selectedOutfit, setSelectedOutfit] = useState<string>('常服');

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

    // Fetch characters list
    fetch('http://localhost:8001/api/characters_list')
      .then(res => res.json())
      .then(json => {
        if (json.status === 'success' && json.data) {
          setCharacters(json.data);
          let initialChar = json.data.find((c: any) => c.id === 'yevna') || json.data[0];
          if (initialChar) {
             setSelectedCharId(initialChar.id);
             setSelectedOutfit(initialChar.outfits[0] || '常服');
          }
        }
      })
      .catch(err => console.error("Failed to fetch characters list", err));
  }, []);

  const handleCharChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
     const newId = e.target.value;
     setSelectedCharId(newId);
     const c = characters.find(c => c.id === newId);
     if(c && c.outfits && c.outfits.length > 0) {
        setSelectedOutfit(c.outfits[0]);
     }
  };

  const handleSelectProject = async (projectId: string) => {
    setStartingId(projectId);
    setErrorDesc(null);
    try {
      const resp = await playProject(projectId);
      onScriptGenerated(resp.script, resp.title || projectId, selectedCharId, projectId, selectedOutfit);
    } catch (e) {
      setErrorDesc("加载剧本出错啦！");
      setStartingId(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center p-8 relative overflow-hidden font-serif">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/archive_bg.png)' }}
      />
      {/* Black Transparent Mask */}
      <div className="absolute inset-0 z-0 bg-black/70 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 w-full max-w-5xl flex justify-between items-center mb-8">
        <button 
          onClick={onBack}
          className="px-6 py-2 bg-black/50 border border-red-900 hover:bg-red-900/80 hover:border-red-500 text-red-200 rounded-full font-bold shadow transition-all active:scale-95"
        >
          ← 返回标题
        </button>
        <h1 className="text-3xl font-extrabold text-red-200 drop-shadow-[0_0_10px_rgba(255,100,100,0.8)] tracking-widest">
           选择已解析文献档案馆
        </h1>
        
        {/* Character & Outfit Selector */}
        <div className="relative z-10 flex gap-4">
           {characters.length > 0 && (
             <select 
                value={selectedCharId} 
                onChange={handleCharChange}
                className="bg-black/60 border border-red-900/80 text-red-200 rounded px-4 py-2 font-bold shadow focus:outline-none focus:border-red-500 hover:bg-black/80 transition-all cursor-pointer"
             >
                {characters.map(c => <option key={c.id} value={c.id} className="bg-black">{c.name}</option>)}
             </select>
           )}
           {characters.length > 0 && (
             <select 
                value={selectedOutfit} 
                onChange={(e) => setSelectedOutfit(e.target.value)}
                className="bg-black/60 border border-red-900/80 text-red-200 rounded px-4 py-2 font-bold shadow focus:outline-none focus:border-red-500 hover:bg-black/80 transition-all cursor-pointer"
             >
                {characters.find(c => c.id === selectedCharId)?.outfits?.map((o: string) => <option key={o} value={o} className="bg-black">{o}</option>)}
             </select>
           )}
        </div>
      </div>

      {loading && (
        <div className="relative z-10 flex-1 flex items-center justify-center">
            <p className="text-xl text-red-300 animate-pulse font-bold tracking-widest">文件整理加载中...</p>
        </div>
      )}

      {errorDesc && (
        <div className="w-full max-w-4xl p-4 mb-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            {errorDesc}
        </div>
      )}

      {/* Project Grid / List */}
      {!loading && projects.length === 0 && (
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center opacity-70">
              <span className="text-6xl mb-4 drop-shadow-lg">📂</span>
              <p className="text-xl text-red-200 font-bold tracking-widest">档案馆空空如也...</p>
          </div>
      )}

      {!loading && projects.length > 0 && (
         <div className="relative z-10 w-full max-w-5xl flex-1 overflow-y-auto pr-4 space-y-6">
            {projects.map((proj) => (
                <button
                    key={proj.id}
                    onClick={() => handleSelectProject(proj.id)}
                    disabled={startingId !== null}
                    className="w-full text-left relative transition-all duration-300 transform hover:-translate-y-2 group h-48 mb-8 mt-4"
                >
                    {/* Inner Boundary-locked layer for Background and Text */}
                    <div className="absolute inset-0 overflow-hidden rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_25px_rgba(255,50,50,0.4)] border border-red-900/40 group-hover:border-red-500/80 transition-all duration-500 z-0 bg-black">
                        {/* Background Layer with frosted glass */}
                        <div 
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                            style={{ backgroundImage: `url(${proj.cover})` }}
                        />
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] group-hover:bg-black/40 transition-all duration-500" />
                        
                        {/* Gradient Overlay for Text Readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                        {/* Content Layer with padding reserved for the pop-out avatar */}
                        <div className="absolute inset-0 flex flex-col justify-end p-6 pr-48 md:pr-64">
                            <span className="text-sm font-bold text-red-300 mb-1 uppercase tracking-[0.2em] drop-shadow-md transition-all group-hover:text-red-200">
                                {proj.id}
                            </span>
                            <h2 className="text-3xl font-extrabold text-gray-200 group-hover:text-white drop-shadow-[0_0_8px_rgba(255,100,100,0.3)] group-hover:drop-shadow-[0_0_15px_rgba(255,50,50,0.8)] line-clamp-2 transition-all duration-500 font-serif tracking-wide">
                               {proj.title}
                            </h2>
                        </div>
                    </div>

                    {/* Pop-out 3D Effect Layer */}
                    <img 
                        src={`http://localhost:8001/api/characters/${proj.char_id || 'yevna'}/avatar.png`}
                        alt="Project Avatar"
                        className="absolute -right-4 md:-right-8 -top-8 h-[130%] object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.8)] z-20 pointer-events-none transition-all duration-500 group-hover:scale-[1.15] group-hover:-rotate-6 group-hover:-translate-x-6 group-hover:-translate-y-2 filter brightness-90 group-hover:brightness-110"
                    />

                    {/* Loading Spinner overlay when clicked */}
                    {startingId === proj.id && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center rounded-xl z-30">
                             <div className="relative flex justify-center items-center">
                                <div className="absolute animate-ping inline-flex h-12 w-12 rounded-full bg-red-800 opacity-75"></div>
                                <div className="relative inline-flex rounded-full h-8 w-8 bg-red-500"></div>
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