export interface ConversationTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  topicId: string;
  startedAt: string;
  endedAt: string | null;
  duration: number | null;
  accuracy: number | null; // Now supports decimal values
  exchanges: ConversationExchange[];
}

export interface ConversationExchange {
  id: string;
  role: 'student' | 'ai';
  message: string;
  timestamp: string;
  accuracy?: number; // Now supports decimal values
  feedback?: string;
}

export interface LanguageProfile {
  language: string;
  proficiencyLevel: string;
  userId: string;
}