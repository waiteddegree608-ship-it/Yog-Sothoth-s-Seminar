import React, { useState, useEffect } from 'react';
import { GameSettings } from '../types';

interface SettingsScreenProps {
  currentSettings: GameSettings;
  onSave: (settings: GameSettings) => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ currentSettings, onSave, onBack }) => {
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('apiUrl') || 'https://api.siliconflow.cn/v1');
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');
  const [modelName, setModelName] = useState(localStorage.getItem('modelName') || 'Qwen/Qwen3-VL-235B-A22B-Thinking');
  
  const [chars, setChars] = useState<any[]>([]);
  const heroines = ['yevna', 'xialuling', 'xiaoyezi', 'teliboka'];
  const [selectedChar, setSelectedChar] = useState<string>('yevna');
  const [promptData, setPromptData] = useState<Record<string, string>>({});
  const [activePrompt, setActivePrompt] = useState<string>('');
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8001/api/characters_list')
      .then(r => r.json())
      .then(res => {
         if(res.status === 'success') {
            setChars(res.data);
            const pDict: Record<string, string> = {};
            res.data.forEach((c: any) => {
               pDict[c.id] = c.prompt || '';
            });
            setPromptData(pDict);
            if(pDict['yevna']) setActivePrompt(pDict['yevna']);
         }
      })
      .catch(e => console.error(e));
  }, []);

  useEffect(() => {
    if(promptData[selectedChar] !== undefined) {
       setActivePrompt(promptData[selectedChar]);
    } else {
       setActivePrompt('');
    }
  }, [selectedChar, promptData]);

  const handleSaveAll = async () => {
    setIsSaving(true);
    localStorage.setItem('apiUrl', apiUrl);
    localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('modelName', modelName);
    
    // Save prompt to backend
    try {
       await fetch(`http://localhost:8001/api/characters/${selectedChar}/config`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ prompt: activePrompt })
       });
       // update local cache state
       setPromptData(prev => ({...prev, [selectedChar]: activePrompt}));
    } catch(e) {
       console.error("Failed to save config:", e);
    }
    
    setIsSaving(false);
    onSave(currentSettings); // Keep parent structure intact
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-black/80 backdrop-blur-md p-8 relative overflow-y-auto">
      <div className="bg-gray-900 border border-red-900 shadow-[0_0_50px_rgba(255,0,0,0.15)] rounded-2xl p-8 max-w-4xl w-full">
        <h2 className="text-3xl font-serif text-center text-red-400 mb-8 tracking-widest border-b border-red-900/50 pb-4 shadow-sm">
          系统全局设置
        </h2>

        {/* Global LLM Settings */}
        <div className="space-y-4 mb-10">
           <h3 className="text-xl font-bold text-red-200 border-l-4 border-red-500 pl-3">API 连接配置</h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm text-gray-400 mb-1">API URL (默认硅基流动)</label>
                 <input 
                    type="text" value={apiUrl} onChange={e => setApiUrl(e.target.value)}
                    className="w-full bg-black/60 border border-red-900/50 text-gray-200 rounded px-3 py-2 outline-none focus:border-red-500 transition-all font-mono text-sm"
                    placeholder="https://api.siliconflow.cn/v1"
                 />
              </div>
              <div>
                 <label className="block text-sm text-gray-400 mb-1">Model Name</label>
                 <input 
                    type="text" value={modelName} onChange={e => setModelName(e.target.value)}
                    className="w-full bg-black/60 border border-red-900/50 text-gray-200 rounded px-3 py-2 outline-none focus:border-red-500 transition-all font-mono text-sm"
                    placeholder="Qwen/Qwen3-VL-235B-A22B-Thinking"
                 />
              </div>
              <div className="md:col-span-2">
                 <label className="block text-sm text-gray-400 mb-1">API Key</label>
                 <input 
                    type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
                    className="w-full bg-black/60 border border-red-900/50 text-gray-200 rounded px-3 py-2 outline-none focus:border-red-500 transition-all font-mono text-sm tracking-widest"
                    placeholder="sk-..."
                 />
              </div>
           </div>
        </div>

        {/* Heroine Config Section */}
        <div className="space-y-4">
           <h3 className="text-xl font-bold text-red-200 border-l-4 border-red-500 pl-3">角色特质档案录入 (System Prompt)</h3>
           
           {/* Avatars */}
           <div className="flex space-x-6 justify-center my-6">
              {heroines.map(sid => (
                 <button 
                    key={sid} 
                    onClick={() => {
                        // Background quick-save current form text to state dict before switching chars
                        setPromptData(prev => ({...prev, [selectedChar]: activePrompt}));
                        setSelectedChar(sid);
                    }}
                    className={`relative w-20 h-20 rounded-full border-4 overflow-hidden transition-all duration-300 ${selectedChar === sid ? 'border-red-500 scale-110 shadow-[0_0_20px_rgba(255,50,50,0.6)]' : 'border-gray-800 opacity-60 hover:opacity-100 hover:border-red-900 filter grayscale hover:grayscale-0'}`}
                 >
                    <img src={`http://localhost:8001/api/characters/${sid}/avatar.png`} className="w-full h-full object-cover" />
                 </button>
              ))}
           </div>

           {/* Prompt Editor */}
           <div className="relative">
               <textarea 
                  value={activePrompt}
                  onChange={e => setActivePrompt(e.target.value)}
                  className="w-full h-48 bg-black/70 border border-red-900/80 text-gray-200 rounded-lg p-4 outline-none focus:border-red-500 focus:shadow-[0_0_15px_rgba(255,0,0,0.3)] transition-all font-mono text-sm leading-relaxed resize-none scrollbar-thin scrollbar-thumb-red-900"
                  placeholder="请输入该角色的系统提示词，用于塑造性格与语气..."
               />
               <span className="absolute bottom-4 right-6 text-red-900/80 font-bold opacity-30 select-none pointer-events-none">
                  {selectedChar.toUpperCase()} DATA
               </span>
           </div>
        </div>

        <div className="flex justify-end gap-6 mt-10">
          <button 
            onClick={onBack}
            className="px-6 py-2 rounded font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            返回
          </button>
          <button 
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-8 py-2 rounded font-bold bg-red-900/80 text-white border border-red-500/50 hover:bg-red-700 hover:shadow-[0_0_15px_rgba(255,50,50,0.5)] transition-all flex items-center"
          >
            {isSaving ? <span className="animate-pulse">保存中...</span> : '应用配置'}
          </button>
        </div>

      </div>
    </div>
  );
};