export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type UserRole = "admin" | "user";

export type ActiveAppTab = "checker" | "challenge" | "vocab" | "grammar" | "quiz" | "admin";

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  level: CEFRLevel;
  xp: number;
  streak: number;
  lessonsCompleted: number;
  testsCompleted: number;
  wordsLearned: number;
  sentencesChecked: number;
  correctAnswers: number;
  incorrectAnswers: number;
  status: "active" | "inactive";
  createdAt: string;
  lastLoginAt?: string | null;
}

export interface UserProfile {
  id?: string;
  username?: string;
  role?: UserRole;
  name: string;
  level: CEFRLevel;
  xp: number;
  streak: number;
  lessonsCompleted: number;
  testsCompleted: number;
  wordsLearned: number;
  correctAnswers: number;
  incorrectAnswers: number;
  sentencesChecked: number;
  lastActiveDate?: string;
}

export type LearningModeKey =
  | "free_conversation"
  | "daily_english"
  | "vocabulary"
  | "grammar"
  | "speaking"
  | "travel"
  | "interview"
  | "ielts"
  | "roleplay"
  | "school"
  | "business"
  | "debate"
  | "storytelling"
  | "beginner"
  | "advanced";

export interface LearningModeInfo {
  id: LearningModeKey;
  name: string;
  description: string;
  badge: string;
  promptGoal: string;
}

export interface ConversationSettings {
  mode: LearningModeKey;
  topic: string;
  difficulty: "adaptive" | "strict";
  correctionEnabled: boolean;
  englishOnly: boolean;
  conciseResponses: boolean;
  useUzbekExplanationsForBeginners: boolean;
  autoAudioPlayback: boolean;
}

export interface QuickCorrectionData {
  original: string;
  corrected: string;
  explanation: string;
  naturalAlternative?: string;
  uzbekNote?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model" | "system";
  text: string;
  timestamp: string;
  quickCorrection?: QuickCorrectionData | null;
}

export interface VocabWord {
  word: string;
  uzbekMeaning: string;
  partOfSpeech: string;
  phonetic?: string;
  exampleSentence: string;
  collocation: string;
  usageTip?: string;
  saved?: boolean;
}

export interface MistakeRecord {
  id: string;
  original: string;
  corrected: string;
  explanation: string;
  timestamp: string;
  topic?: string;
  reviewed?: boolean;
}
