import { User, Question, AssessmentAttempt, KnowledgeNode, Recommendation, VideoItem, NotificationItem, AwarenessCard, HardwareTelemetry } from '../types';

const BASE_URL = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('smart_station_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Offline queue in localStorage
const OFFLINE_QUEUE_KEY = 'smart_station_offline_queue';

export function getOfflineQueue(): any[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function queueOfflineAssessment(attemptData: any) {
  const queue = getOfflineQueue();
  queue.push(attemptData);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export function clearOfflineQueue() {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async register(data: any): Promise<{ token: string; user: User }> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async getCurrentUser(): Promise<{ user: User }> {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },

  async updateProfile(profileData: any): Promise<{ user: User }> {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  // Student Dashboard
  async getStudentDashboard(): Promise<{
    student: any;
    stats: any;
    nextActivity: any;
    knowledgeNodes: KnowledgeNode[];
    weakTopics: KnowledgeNode[];
    recommendations: Recommendation[];
    recentAttempts: AssessmentAttempt[];
    weeklyActivity: { day: string; minutes: number; assessments: number }[];
  }> {
    const res = await fetch(`${BASE_URL}/students/dashboard`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load dashboard');
    return res.json();
  },

  // Knowledge Profile
  async getKnowledgeProfile(): Promise<{ profile: KnowledgeNode[] }> {
    const res = await fetch(`${BASE_URL}/knowledge-profile`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load knowledge profile');
    return res.json();
  },

  // Subjects
  async getSubjects(): Promise<{ subjects: any[] }> {
    const res = await fetch(`${BASE_URL}/subjects`);
    if (!res.ok) throw new Error('Failed to load subjects');
    return res.json();
  },

  // Questions
  async getQuestions(filters?: any): Promise<{ questions: Question[]; total: number }> {
    const query = new URLSearchParams(filters || {}).toString();
    const res = await fetch(`${BASE_URL}/questions?${query}`);
    if (!res.ok) throw new Error('Failed to fetch questions');
    return res.json();
  },

  async createQuestion(questionData: any): Promise<{ question: Question }> {
    const res = await fetch(`${BASE_URL}/questions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(questionData),
    });
    if (!res.ok) throw new Error('Failed to create question');
    return res.json();
  },

  async deleteQuestion(id: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/questions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete question');
    return res.json();
  },

  // Assessments
  async startAssessment(data: { subject: string; chapter?: string; topic?: string; questionCount?: number }): Promise<any> {
    const res = await fetch(`${BASE_URL}/assessments/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to start assessment');
    return res.json();
  },

  async submitAssessment(data: {
    subject: string;
    chapter?: string;
    topic?: string;
    answers: { questionId: string; selectedAnswer: number; timeSpentSeconds: number }[];
  }): Promise<{
    attempt: AssessmentAttempt;
    updatedKnowledgeProfile: KnowledgeNode[];
    newRecommendations: Recommendation[];
  }> {
    const res = await fetch(`${BASE_URL}/assessments/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit assessment');
    return res.json();
  },

  async getAssessmentHistory(): Promise<{ attempts: AssessmentAttempt[] }> {
    const res = await fetch(`${BASE_URL}/assessments/history`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load assessment history');
    return res.json();
  },

  // Recommendations
  async getRecommendations(): Promise<{ recommendations: Recommendation[] }> {
    const res = await fetch(`${BASE_URL}/recommendations`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load recommendations');
    return res.json();
  },

  async completeRecommendation(id: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/recommendations/${id}/complete`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // AI Tutor
  async askAITutor(message: string, subject?: string, topic?: string, mode?: string): Promise<{
    reply: string;
    followUpSuggestions: string[];
    recommendedAction?: any;
    source: 'gemini' | 'rule_fallback';
  }> {
    const res = await fetch(`${BASE_URL}/ai/tutor`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, subject, topic, mode }),
    });
    if (!res.ok) throw new Error('AI Tutor unavailable');
    return res.json();
  },

  async explainFormula(formula: string, concept?: string, subject?: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/ai/explain`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ formula, concept, subject }),
    });
    if (!res.ok) throw new Error('Explanation failed');
    return res.json();
  },

  // Videos
  async getVideos(subject?: string, topic?: string, search?: string): Promise<{ videos: VideoItem[] }> {
    const query = new URLSearchParams();
    if (subject) query.append('subject', subject);
    if (topic) query.append('topic', topic);
    if (search) query.append('search', search);

    const res = await fetch(`${BASE_URL}/videos?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load videos');
    return res.json();
  },

  async watchVideo(id: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/videos/${id}/watch`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Analytics
  async getStudentAnalytics(): Promise<any> {
    const res = await fetch(`${BASE_URL}/analytics/student`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load analytics');
    return res.json();
  },

  // Parent
  async getParentDashboard(): Promise<{ students: any[]; alerts: NotificationItem[] }> {
    const res = await fetch(`${BASE_URL}/parents/dashboard`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load parent dashboard');
    return res.json();
  },

  async linkStudent(linkingCode: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/parents/link-student`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ linkingCode }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to link student');
    }
    return res.json();
  },

  // Teacher
  async getTeacherDashboard(): Promise<any> {
    const res = await fetch(`${BASE_URL}/teachers/dashboard`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load teacher dashboard');
    return res.json();
  },

  // Admin
  async getAdminDashboard(): Promise<any> {
    const res = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load admin dashboard');
    return res.json();
  },

  async resetDatabase(): Promise<any> {
    const res = await fetch(`${BASE_URL}/admin/seed-reset`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    const res = await fetch(`${BASE_URL}/notifications`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load notifications');
    return res.json();
  },

  async markAllNotificationsRead(): Promise<any> {
    const res = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Awareness
  async getAwareness(): Promise<{ awareness: AwarenessCard[] }> {
    const res = await fetch(`${BASE_URL}/awareness`);
    if (!res.ok) throw new Error('Failed to load awareness content');
    return res.json();
  },

  // Hardware Status
  async getHardwareStatus(): Promise<{ hardware: HardwareTelemetry }> {
    const res = await fetch(`${BASE_URL}/hardware/status`);
    if (!res.ok) throw new Error('Failed to load hardware status');
    return res.json();
  },

  // Offline Sync
  async syncOfflineQueue(queuedAssessments: any[]): Promise<any> {
    const res = await fetch(`${BASE_URL}/offline/sync`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ queuedAssessments }),
    });
    return res.json();
  },
};
