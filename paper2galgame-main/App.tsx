import React, { useState } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { UploadScreen } from './components/UploadScreen';
import { GameScreen } from './components/GameScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { DialogueLine, GameSettings } from './types';

export enum AppState {
  TITLE,
  UPLOAD,
  GAME,
  SETTINGS,
}

const App: React.FC = () => {
  const [currentState, setCurrentState] = useState<AppState>(AppState.TITLE);
  const [script, setScript] = useState<DialogueLine[]>([]);
  const [paperTitle, setPaperTitle] = useState<string>("");
  const [settings, setSettings] = useState<GameSettings>({
    detailLevel: 'detailed',
    personality: 'tsundere'
  });

  const [charId, setCharId] = useState<string>("yevna");
  const [projectId, setProjectId] = useState<string>("");
  const [outfit, setOutfit] = useState<string>("常服");

  const handleStartGame = (generatedScript: DialogueLine[], title: string, char_id?: string, project_id?: string, outfit_param?: string) => {
    setScript(generatedScript);
    setPaperTitle(title);
    setCharId(char_id || "yevna");
    setProjectId(project_id || "");
    setOutfit(outfit_param || "常服");
    setCurrentState(AppState.GAME);
  };

  const handleBackToTitle = () => {
    setCurrentState(AppState.TITLE);
    setScript([]);
    setPaperTitle("");
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden font-serif select-none">
      {/* Dynamic Background Layer */}
      <div className="absolute inset-0 z-0">
        {currentState !== AppState.GAME && (
          <div className="w-full h-full bg-gray-950 relative overflow-hidden">
             {/* Subdued Dark Lattice Effect */}
             <div className="absolute inset-0 opacity-[0.03]" 
                  style={{
                    backgroundImage: 'linear-gradient(45deg, #ff0000 25%, transparent 25%, transparent 50%, #ff0000 50%, #ff0000 75%, transparent 75%, transparent)',
                    backgroundSize: '40px 40px'
                  }}>
             </div>
             {/* Floating Decor */}
             <div className="absolute top-10 left-10 text-red-900 opacity-20 text-6xl animate-float">✦</div>
             <div className="absolute bottom-20 right-20 text-red-900 opacity-20 text-8xl animate-float" style={{animationDelay: '1s'}}>✦</div>
             <div className="absolute top-1/2 left-1/3 text-gray-500 opacity-10 text-4xl animate-float" style={{animationDelay: '2s'}}>✧</div>
          </div>
        )}
      </div>

      {/* Content Layer */}
      <div className="relative z-10 w-full h-full">
        {currentState === AppState.TITLE && (
          <TitleScreen 
            onStart={() => setCurrentState(AppState.UPLOAD)} 
            onSettings={() => setCurrentState(AppState.SETTINGS)}
            globalCharId={charId}
            setGlobalCharId={setCharId}
            globalOutfit={outfit}
            setGlobalOutfit={setOutfit}
          />
        )}
        
        {currentState === AppState.SETTINGS && (
          <SettingsScreen
            currentSettings={settings}
            onSave={(newSettings) => {
              setSettings(newSettings);
              setCurrentState(AppState.TITLE);
            }}
            onBack={() => setCurrentState(AppState.TITLE)}
          />
        )}

        {currentState === AppState.UPLOAD && (
          <UploadScreen 
            onScriptGenerated={handleStartGame} 
            onBack={handleBackToTitle}
            settings={settings}
          />
        )}
        
        {currentState === AppState.GAME && (
          <GameScreen 
            script={script} 
            title={paperTitle}
            char_id={charId}
            project_id={projectId}
            outfit={outfit}
            onExit={handleBackToTitle} 
          />
        )}
      </div>
    </div>
  );
};

export default App;