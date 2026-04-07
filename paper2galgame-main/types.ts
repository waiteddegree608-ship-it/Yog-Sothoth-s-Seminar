export interface DialogueLine {
  speaker: string;
  text: string;
  emotion: 'normal' | 'happy' | 'angry' | 'surprised' | 'shy' | 'proud';
  note?: string; // For technical terms explanation
  display_figure?: number; // Optional figure number to display
  background_url?: string; // Optional direct URL to background image
}

export interface PaperAnalysisResponse {
  title: string;
  script: DialogueLine[];
  char_id?: string;
  project_id?: string;
  outfit?: string;
}

export interface ProjectInfo {
  id: string;
  title: string;
  cover: string;
  char_id?: string;
  outfit?: string;
}

export interface GameSettings {
  detailLevel: 'brief' | 'detailed' | 'academic';
  personality: 'tsundere' | 'gentle' | 'strict';
}

export enum GameState {
  IDLE,
  PROCESSING,
  PLAYING,
  PAUSED,
}
