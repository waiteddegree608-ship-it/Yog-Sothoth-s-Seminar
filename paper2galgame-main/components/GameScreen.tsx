import React, { useState, useEffect, useRef } from 'react';
import { DialogueLine } from '../types';

interface GameScreenProps {
  script: DialogueLine[];
  title: string;
  char_id?: string;
  project_id?: string;
  outfit?: string;
  onExit: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ script, title, char_id, project_id, outfit, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isAuto, setIsAuto] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [hideUI, setHideUI] = useState(false);
  const [jumpKey, setJumpKey] = useState(0); // Used to trigger jump animation

  // Chat Mode States
  const [showChatMode, setShowChatMode] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'assistant', content: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatEmotion, setChatEmotion] = useState<string | null>(null);
  const [chatFigure, setChatFigure] = useState<number | null>(null);

  // Pause auto-play when entering chat mode
  useEffect(() => {
    if (showChatMode) setIsAuto(false);
  }, [showChatMode]);
  
  const currentLine = script[currentIndex];
  const typingSpeed = 30; // ms per char
  const autoDelay = 2000; // ms to wait before next line in auto mode
  
  const timerRef = useRef<number | null>(null);
  const autoTimerRef = useRef<number | null>(null);

  // Trigger jump animation on new line
  useEffect(() => {
    setJumpKey(prev => prev + 1);
  }, [currentIndex]);

  // Character sprite handling based on emotion
  const getSpriteUrl = (emotion: string) => {
    const key = emotion ? emotion.toLowerCase() : 'normal';
    const cid = char_id || (currentLine?.char_id as string) || 'yevna';
    const out = outfit || (currentLine?.outfit as string) || '常服';
    return `http://localhost:8001/api/characters/${cid}/${out}/${key}.png`;
  };

  // Typewriter effect
  useEffect(() => {
    if (!currentLine) return;

    setDisplayedText("");
    setIsTyping(true);
    let charIndex = 0;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = window.setInterval(() => {
      charIndex++;
      setDisplayedText(currentLine.text.slice(0, charIndex));

      if (charIndex >= currentLine.text.length) {
        setIsTyping(false);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, typingSpeed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, currentLine]);

  // Auto mode logic
  useEffect(() => {
    if (isAuto && !isTyping && currentIndex < script.length - 1 && !showChatMode) {
      autoTimerRef.current = window.setTimeout(() => {
        handleNext();
      }, autoDelay);
    }
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [isAuto, isTyping, currentIndex, script.length, showChatMode]);

  const handleNext = () => {
    if (showChatMode) return; // Block advancing if chat mode is open
    if (isTyping) {
      // Instant finish
      if (timerRef.current) clearInterval(timerRef.current);
      setDisplayedText(currentLine.text);
      setIsTyping(false);
    } else {
      // Next line
      if (currentIndex < script.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // End of script
        setIsAuto(false);
      }
    }
  };

  if (!currentLine) return <div className="text-white">End of Chapter</div>;

  const defaultBg = `http://localhost:8001/api/characters/${char_id || currentLine?.char_id || 'yevna'}/game_bg.jpg`;
  const figureUrl = showChatMode 
                     ? (chatFigure !== null ? `http://localhost:8001/api/projects/${project_id || (currentLine as any).project_id || 'FashionR2R'}/images/Figure_${chatFigure}.png` : null)
                     : ((currentLine as any).display_figure !== undefined && (currentLine as any).display_figure !== null
                         ? `http://localhost:8001/api/projects/${project_id || (currentLine as any).project_id || 'FashionR2R'}/images/Figure_${(currentLine as any).display_figure}.png` 
                         : null);

  return (
    <div className="w-full h-full relative" onClick={handleNext}>
      
      {/* Game Background */}
      <div className="absolute inset-0 z-0 bg-black">
         <img 
            src={defaultBg} 
            alt="Game Background" 
            className={`w-full h-full object-cover transition-all duration-1000 ${figureUrl ? 'brightness-[0.4] blur-[4px]' : 'brightness-100'}`}
          />
      </div>

      {/* Figure Overlay Layer */}
      {figureUrl && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-12 pointer-events-none transition-opacity duration-500">
           <img 
              src={figureUrl} 
              alt={`Figure ${currentLine.display_figure}`}
              className="max-w-full max-h-[80%] object-contain rounded-lg shadow-2xl bg-white/90 p-4 transform scale-105"
           />
        </div>
      )}

      {/* Character Layer */}
      {!hideUI && (
        <div 
           key={showChatMode ? chatEmotion : jumpKey} // Re-trigger animation on emotion change in chat mode or auto mode line change
           className={`absolute bottom-0 right-0 md:right-32 h-[90%] z-10 animate-jump-once`}
        >
          <img 
            src={getSpriteUrl(showChatMode ? (chatEmotion || "normal") : (currentLine.emotion || "normal"))} 
            alt="Character" 
            className="h-full w-auto object-contain drop-shadow-2xl transition-all duration-300"
          />
        </div>
      )}

      {/* UI Overlay */}
      {!hideUI && (
        <div className="absolute inset-0 z-20 flex flex-col justify-end pb-8 px-4 md:px-32 pointer-events-none">
          
          {/* Important Note Popup */}
          {currentLine.note && (
             <div className="self-end mb-4 mr-10 max-w-md bg-yellow-50 border-2 border-yellow-200 text-yellow-800 p-3 rounded-lg shadow-lg animate-bounce-slow">
                <div className="text-xs font-bold uppercase text-yellow-500 mb-1"><i className="fas fa-lightbulb"></i> Important Note</div>
                <div className="text-sm">{currentLine.note}</div>
             </div>
          )}

          {/* Control Bar */}
          <div className="flex justify-end gap-2 mb-2 pointer-events-auto relative z-40">
             <ControlButton active={showChatMode} onClick={(e) => { e.stopPropagation(); setShowChatMode(!showChatMode); }} icon="fa-comments" label="自由问答" />
             <ControlButton active={isAuto} onClick={(e) => { e.stopPropagation(); setIsAuto(!isAuto); }} icon="fa-forward" label="Auto" />
             <ControlButton onClick={(e) => { e.stopPropagation(); setShowLog(true); }} icon="fa-history" label="Log" />
             <ControlButton onClick={(e) => { e.stopPropagation(); setHideUI(true); }} icon="fa-eye-slash" label="Hide" />
             <ControlButton onClick={(e) => { e.stopPropagation(); onExit(); }} icon="fa-door-open" label="Exit" />
          </div>

          {/* Dialogue Box (Hide underlying dialogue box if Chat Mode is perfectly overlayed, or keep it as background) */}
          <div className={`bg-white/90 backdrop-blur-md border-4 border-red-900/50 rounded-2xl p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.3)] pointer-events-auto relative min-h-[200px] transition-all duration-500 ${showChatMode ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100'}`}>
            
            {/* Name Tag */}
            <div className="absolute -top-6 left-10 bg-gradient-to-r from-gal-blue to-blue-400 text-white px-8 py-2 rounded-full shadow-md transform -skew-x-12 border-2 border-white">
              <span className="font-bold text-lg skew-x-12 inline-block">
                {currentLine.speaker} <i className="fas fa-sparkles ml-1 text-yellow-300"></i>
              </span>
            </div>

            {/* Text Content */}
            <div className="mt-4 text-xl md:text-2xl font-bold text-gray-800 leading-relaxed font-serif tracking-wide">
              {displayedText}
              {isTyping && <span className="inline-block w-2 h-6 bg-gal-pink ml-1 animate-pulse"></span>}
            </div>

            {/* Next Indicator */}
            {!isTyping && (
              <div className="absolute bottom-4 right-6 text-gal-pink-dark animate-bounce cursor-pointer">
                <i className="fas fa-chevron-down text-2xl"></i>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Real-time Chat UI Overlay */}
      {showChatMode && !hideUI && (
        <div className="absolute inset-y-0 left-0 w-full md:w-[60%] lg:w-1/2 p-4 md:p-12 z-30 pointer-events-auto flex flex-col justify-end" onClick={(e) => e.stopPropagation()}>
          <div className="bg-black/70 backdrop-blur-xl border border-red-500/30 rounded-2xl flex flex-col h-full shadow-[0_0_50px_rgba(200,0,0,0.15)] relative overflow-hidden transition-all duration-500">
             {/* Header */}
             <div className="bg-gradient-to-r from-red-900 to-transparent p-5 border-b border-red-500/30">
                <h3 className="text-white font-bold text-xl tracking-widest text-shadow-sm">
                   <i className="fas fa-satellite-dish mr-2 animate-pulse"></i> 实时意识连接 - 学术解惑频道
                </h3>
             </div>
             
             {/* Chat History */}
             <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col scrollbar-thin scrollbar-thumb-red-900 scrollbar-track-transparent">
                {chatHistory.length === 0 && (
                   <div className="text-gray-400 text-center m-auto animate-pulse flex flex-col items-center">
                      <span className="text-5xl mb-4">🔮</span>
                      关于这份报告，有什么没听懂的随时打断我哦。
                   </div>
                )}
                {chatHistory.map((msg, idx) => (
                   <div key={idx} className={`max-w-[85%] p-4 ${msg.role === 'user' ? 'bg-gradient-to-r from-blue-900/60 to-blue-800/60 text-white self-end rounded-2xl rounded-br-sm border border-blue-400/20 shadow-lg' : 'bg-gradient-to-r from-red-900/40 to-black/40 text-gray-100 self-start rounded-2xl rounded-bl-sm border border-red-500/20 shadow-lg'}`}>
                      <div className="text-xs text-red-200 mb-2 opacity-60 font-bold tracking-widest border-b border-white/10 pb-1">
                         {msg.role === 'user' ? 'GUEST' : (currentLine?.speaker || 'CHARACTER').toUpperCase()}
                      </div>
                      <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                   </div>
                ))}
                {isChatLoading && (
                   <div className="bg-gradient-to-r from-red-900/40 to-black/40 text-white self-start rounded-2xl rounded-bl-sm border border-red-500/20 shadow-lg p-5 flex space-x-3 items-center">
                      <div className="w-2.5 h-2.5 bg-red-400 rounded-full animate-bounce"></div>
                      <div className="w-2.5 h-2.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                      <div className="w-2.5 h-2.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                   </div>
                )}
             </div>

             {/* Input Block */}
             <div className="p-5 border-t border-red-500/30 bg-black/50 backdrop-blur-md">
                <form 
                   onSubmit={async (e) => {
                      e.preventDefault();
                      if(!chatInput.trim() || isChatLoading) return;
                      const userMsg = chatInput.trim();
                      setChatInput("");
                      setChatHistory(prev => [...prev, {role: 'user', content: userMsg}]);
                      setIsChatLoading(true);
                      
                      try {
                          const res = await fetch('http://localhost:8001/api/chat', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                  project_id: (currentLine as any).project_id || 'FashionR2R', 
                                  char_id: (currentLine as any).char_id || 'yevna',
                                  message: userMsg,
                                  history: chatHistory,
                                  api_key: localStorage.getItem('apiKey') || undefined,
                                  base_url: localStorage.getItem('apiUrl') || undefined,
                                  model_name: localStorage.getItem('modelName') || undefined
                              })
                          });
                          const data = await res.json();
                          if(data.status === 'success') {
                              setChatHistory(prev => [...prev, {role: 'assistant', content: data.data.text}]);
                              setChatEmotion(data.data.emotion);
                              if(data.data.display_figure !== undefined && data.data.display_figure !== null) {
                                  setChatFigure(data.data.display_figure);
                              } else {
                                  setChatFigure(null);
                              }
                          } else {
                              setChatHistory(prev => [...prev, {role: 'assistant', content: `连接出错: ${JSON.stringify(data)}`}]);
                          }
                      } catch(err: any) {
                          setChatHistory(prev => [...prev, {role: 'assistant', content: `信号断开啦！ ${err.message}`}]);
                      }
                      setIsChatLoading(false);
                   }}
                   className="flex gap-3 relative"
                >
                   <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="发送探针信号打断汇报..."
                      className="flex-1 bg-white/5 border border-red-500/30 rounded-xl px-5 py-3 text-white outline-none focus:border-red-400 focus:bg-white/10 transition-all font-serif"
                   />
                   <button 
                      type="submit" 
                      disabled={isChatLoading || !chatInput.trim()}
                      className="bg-red-800 hover:bg-red-600 text-white px-8 rounded-xl transition-all font-bold tracking-widest shadow-[0_0_15px_rgba(255,0,0,0.3)] disabled:opacity-50 disabled:shadow-none"
                   >
                      <i className="fas fa-paper-plane mr-2"></i>发送
                   </button>
                </form>
             </div>
          </div>
        </div>
      )}

      {/* Hide UI Click Handler (Invisible overlay when hidden) */}
      {hideUI && (
        <div 
          className="absolute inset-0 z-50 cursor-pointer" 
          onClick={(e) => { e.stopPropagation(); setHideUI(false); }}
        />
      )}

      {/* Backlog Modal */}
      {showLog && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center p-10" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white w-full max-w-4xl h-[80%] rounded-xl overflow-hidden flex flex-col shadow-2xl">
            <div className="bg-gal-pink-dark p-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-xl"><i className="fas fa-history mr-2"></i> Dialogue History</h3>
              <button onClick={() => setShowLog(false)} className="hover:text-gray-200"><i className="fas fa-times text-2xl"></i></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-pink-50">
              {script.slice(0, currentIndex + 1).map((line, idx) => (
                <div key={idx} className="border-b border-pink-200 pb-2">
                  <div className="text-gal-pink-dark font-bold text-sm mb-1">{line.speaker}</div>
                  <div className="text-gray-700">{line.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ControlButton: React.FC<{ onClick: (e: any) => void; icon: string; label: string; active?: boolean }> = ({ onClick, icon, label, active }) => (
  <button 
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-1 rounded-full text-sm font-bold transition-all
      ${active 
        ? 'bg-gal-pink text-white shadow-inner' 
        : 'bg-white/80 hover:bg-white text-gray-600 hover:text-gal-pink-dark'
      }
    `}
  >
    <i className={`fas ${icon}`}></i> {label}
  </button>
);