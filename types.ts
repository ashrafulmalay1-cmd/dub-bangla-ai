export type LanguageCode =
  | 'bn'
  | 'hi'
  | 'en'
  | 'ms'
  | 'ar'
  | 'es'
  | 'fr'
  | 'pt'
  | 'ta'
  | 'te'
  | 'auto';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  popular?: boolean;
}

export const SUPPORTED_TARGET_LANGUAGES: LanguageOption[] = [
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', popular: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', popular: true },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
];

export const SUPPORTED_SOURCE_LANGUAGES: LanguageOption[] = [
  { code: 'auto', name: 'Auto Detect', nativeName: 'Auto Detect', flag: '🌐', popular: true },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', popular: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
];

export type LipSyncQuality = 'standard' | 'high' | 'ultra';
export type SubtitleStyle = 'clean' | 'modern' | 'movie';

export interface VisemeFrame {
  time: number; // seconds into the segment
  viseme: 'sil' | 'PP' | 'FF' | 'TH' | 'DD' | 'kk' | 'CH' | 'SS' | 'nn' | 'RR' | 'aa' | 'E' | 'I' | 'O' | 'U';
  intensity: number; // 0 to 1
}

export interface SpeakerProfile {
  id: string; // e.g. 'speaker_1'
  name: string; // e.g. 'Speaker 1'
  detectedGender: 'male' | 'female';
  approxAge: number; // e.g. 26
  ageCategory: 'young' | 'mature' | 'senior';
  pitchHz: number; // e.g. 125
  pitchDesc: string; // e.g. 'Medium-low baritone (125 Hz)'
  tone: string; // e.g. 'Authoritative, Resonant, Warm'
  speakingSpeed: number; // 0.8 - 1.3
  speakingSpeedWpm: number; // e.g. 145
  emotion: string; // e.g. 'Enthusiastic & Convincing'
  accent: string; // e.g. 'Standard North American'
  speakingStyle: string; // e.g. 'Professional presentation style'
  
  // Target voice preservation settings
  voicePreservationEnabled?: boolean;
  targetVoiceMode?: 'preserve' | 'choose' | 'alternative';
  assignedVoiceName?: string; // e.g. 'Zephyr (Warm Female Bengali)' or 'Fenrir (Mature Hindi Male)'
  voiceProviderId?: string; // 'gemini_kore', 'gemini_fenrir', 'gemini_puck', 'gemini_zephyr', 'gemini_charon'
  similarity: number; // 0-100%
  ageCharacterAdjustment: 'young' | 'balanced' | 'mature';
  pitchAdjustment?: 'natural' | 'lower' | 'higher' | number;
  speedAdjustment?: number;
  emotionOverride?: string;
  avatarBgColor: string;
}

export interface DialogueSegment {
  id: string;
  speakerId: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  duration?: number;
  originalText: string;
  translatedText: string;
  detectedEmotion?: string;
  emotion?: string;
  speechFitRatio?: number; // e.g. 0.98 - translated speech fits within duration
  paceRatio?: number;
  audioUrl?: string;
  audioBase64?: string;
  isGeneratingAudio?: boolean;
  visemes?: VisemeFrame[];
}

export type ProcessingStageId =
  | 'import'
  | 'extraction'
  | 'speakers'
  | 'transcription'
  | 'translation'
  | 'voices'
  | 'mixing'
  | 'lipsync'
  | 'rendering'
  | 'complete';

export interface ProcessingStageInfo {
  id: ProcessingStageId;
  label: string;
  description: string;
  bengaliLabel: string;
  hindiLabel: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  progress: number;
}

export interface QualityWarning {
  id: string;
  type: 'translation' | 'timing' | 'clipping' | 'lipsync' | 'speaker_overlap';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  segmentId?: string;
}

export interface DubbingProject {
  id: string;
  title: string;
  videoUrl: string;
  videoType: 'sample' | 'url' | 'upload';
  duration: number; // in seconds
  thumbnailUrl?: string;
  fileSizeMb?: number;
  resolution?: string;
  
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  
  preserveVoiceCharacteristics: boolean;
  lipSyncEnabled: boolean;
  lipSyncQuality: LipSyncQuality;
  lipSyncSupportedForVideo?: boolean;
  
  originalMusicEnabled: boolean;
  originalSFXEnabled: boolean;
  backgroundVolume: number; // 0-100 (default 60)
  dialogueVolume: number; // 0-150 (default 100)
  sfxVolume: number; // 0-100 (default 90)
  
  subtitleOption: 'none' | 'bn' | 'hi' | 'en';
  subtitleMode?: 'burn' | 'separate';
  subtitleStyle?: SubtitleStyle;
  burnSubtitles: boolean;
  
  speakers: SpeakerProfile[];
  segments: DialogueSegment[];
  
  status: 'idle' | 'processing' | 'ready' | 'error';
  currentStageId: ProcessingStageId;
  overallProgress: number; // 0-100
  stages: ProcessingStageInfo[];
  estimatedRemainingSeconds?: number;
  errorMessage?: string;
  
  qualityWarnings?: QualityWarning[];
  
  creditsUsed?: number;
  createdAt: number;
  exportedResolution: '720p' | '1080p' | '4k';
}

export interface VideoSamplePreset {
  id: string;
  title: string;
  description: string;
  duration: number;
  thumbnail: string;
  videoUrl: string;
  speakersCount: number;
  tags: string[];
  speakers: SpeakerProfile[];
  segments: DialogueSegment[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  creditsRemaining: number;
  creditsTotal?: number;
  plan: 'Free Trial' | 'Creator Pro' | 'Studio Enterprise' | string;
  isLoggedIn: boolean;
}

export type NavTab = 'home' | 'projects' | 'create' | 'settings' | 'studio';
