export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  institution?: string;
  educationLevel?: string;
  stream?: string;
  preferredLanguage?: string;
  studentLinkingCode?: string;
  linkedStudentIds?: string[];
  subjectsTaught?: string[];
  streak: number;
  lastActive: string;
  createdAt: string;
}

export interface Question {
  _id: string;
  subject: string;
  chapter: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: string[];
  correctAnswer?: number;
  explanation?: string;
  marks: number;
  timeLimitSeconds: number;
  formula?: string;
  tags?: string[];
}

export interface AssessmentAttempt {
  _id: string;
  userId: string;
  subject: string;
  chapter: string;
  topic: string;
  score: number;
  totalMarks: number;
  accuracy: number;
  timeTakenSeconds: number;
  difficultyProgression: ('easy' | 'medium' | 'hard')[];
  answers: {
    questionId: string;
    questionText: string;
    selectedAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
    timeSpentSeconds: number;
    explanation: string;
  }[];
  topicBreakdown: { [topic: string]: { correct: number; total: number; percentage: number } };
  createdAt: string;
}

export interface KnowledgeNode {
  topic: string;
  subject: string;
  mastery: number; // 0-100
  status: 'MASTERED' | 'GOOD' | 'NEEDS PRACTICE' | 'NEEDS ATTENTION';
  assessmentsTaken: number;
  lastAssessed: string;
  history: { date: string; mastery: number }[];
}

export interface Recommendation {
  _id: string;
  userId: string;
  type: 'video' | 'practice' | 'quiz' | 'ai_tutor' | 'notes';
  title: string;
  reason: string;
  subject: string;
  topic: string;
  priority: 'high' | 'medium' | 'low';
  targetUrl?: string;
  actionText: string;
  completed: boolean;
  createdAt: string;
}

export interface VideoItem {
  _id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  durationMinutes: number;
  thumbnail: string;
  videoUrl: string;
  description: string;
  uploadedBy: string;
  views: number;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'assessment' | 'achievement' | 'alert' | 'recommendation' | 'content';
  read: boolean;
  createdAt: string;
}

export interface AwarenessCard {
  _id: string;
  category: 'Environmental Awareness' | 'Cyber Safety' | 'Social Responsibility' | 'Health & Wellbeing';
  title: string;
  description: string;
  keyPoints: string[];
  quiz: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
  iconName: string;
}

export interface HardwareTelemetry {
  stationId: string;
  stationName: string;
  status: 'ONLINE' | 'STANDBY' | 'OFFLINE';
  raspberryPiModel: string;
  osVersion: string;
  cpuTempCelsius: number;
  cpuUsagePercent: number;
  ramUsagePercent: number;
  peripherals: {
    touchscreen: { connected: boolean; resolution: string };
    camera: { connected: boolean; model: string; fps: number };
    microphone: { connected: boolean; status: string };
    speaker: { connected: boolean; volumePercent: number };
    pirSensor: { motionDetected: boolean; status: string };
    oledDisplay: { connected: boolean; currentScreen: string };
    rgbLed: { color: string; brightness: number };
    buzzer: { status: string };
  };
  aiService: { status: string; latencyMs: number };
  databaseService: { status: string; latencyMs: number };
  lastSync: string;
  currentActiveStudentId: string | null;
}
