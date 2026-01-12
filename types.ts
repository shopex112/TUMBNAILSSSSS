

// FIX: Moved the AIStudio interface into `declare global` to ensure it has a single, unambiguous global definition and resolve declaration conflicts.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3';

export const AspectRatioLabels: Record<AspectRatio, string> = {
  '16:9': 'YouTube / Desktop (16:9)',
  '9:16': 'TikTok / Reels / Shorts (9:16)',
  '1:1': 'Instagram / Square (1:1)',
  '4:3': 'Standard / Presentation (4:3)'
};

export type YouTuberStyle = 'custom' | 'mrbeast' | 'mkbhd' | 'aliabdaal' | 'pewdiepie' | 'dudeperfect';
export type FontFamily = 'Heebo' | 'Rubik' | 'Assistant' | 'Alef';

export interface UsageStats {
  date: string;
  count: number;
}

export interface AnalysisResult {
  score: number;
  rating: string;
  styleDetected: string;
  colorPalette: string[];
  elements: string[];
  suggestions: string[];
  reasoning: string;
  recreationPrompt: string;
  optimizedViralPrompt: string;
  suggestedTextStyles: Array<{
    name: string;
    style: any;
  }>;
}

export type ThumbnailStyle = 'cinematic' | 'vibrant' | 'minimalist' | '3d-render' | 'cyberpunk' | 'anime' | 'realistic';
export type FaceExpression = 'natural' | 'shocked' | 'happy' | 'angry' | 'determined' | 'laughing';

export interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  vibrance: number;
  exposure: number;
}

export interface ThumbnailSettings {
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  style: ThumbnailStyle;
  expression: FaceExpression;
  youTuberStyle: YouTuberStyle;
  userPhotos?: string[];
  useVisualHebrew?: boolean;
  overlayText?: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  characterUrl?: string;
  explanation?: string;
  timestamp: number;
  svgContent?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  icon: string;
  unlocked: boolean;
}

export interface DailyChallenge {
  id: string;
  name: string;
  description: string;
  points: number;
  goal: number;
  current: number;
  isComplete: boolean;
  action: GamificationAction;
  meta?: any;
}

export interface GamificationState {
  points: number;
  level: number;
  levelName: string;
  pointsForNextLevel: number;
  achievements: { [key: string]: boolean };
  dailyStreak: {
    count: number;
    lastActivityDate: string | null;
  };
  stats: {
    thumbnailsCreated: number;
    viralScores: number;
    fastCreations: number;
  };
  challenges: {
    date: string;
    list: DailyChallenge[];
  };
}

export type GamificationAction =
  | 'THUMBNAIL_CREATED'
  | 'PROMPT_EXPANDED'
  | 'ANALYSIS_HIGH_SCORE'
  | 'USED_PERSONAL_PHOTO'
  | 'USED_STYLE';

// Supabase-specific types
export interface User {
  id: string;
  email?: string;
  // Add other user properties as needed
}

export interface Project {
  id: number;
  user_id: string;
  name: string;
  layout_data: any; // The Fabric.js canvas JSON
  created_at: string;
  updated_at: string;
}
