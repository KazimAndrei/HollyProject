/**
 * TypeScript types for Bible Chat app
 */

// User types
export interface User {
  locale: 'en' | 'ru';
  translation: string; // 'kjv' | 'rst'
  onboardingCompleted: boolean;
  subscriptionStatus: 'free' | 'trial' | 'active' | 'expired';
  needsServerValidation: boolean; // Flag for Phase 5 server validation
  trialEndsAt?: string;
  originalTransactionId?: string;
  answersCount: number; // For teaser limit
}

// Translation types
export interface Translation {
  id: string;
  lang: 'en' | 'ru';
  name: string;
  description?: string;
}

// Scripture types
export interface Verse {
  ref: string;
  book: string;
  chapter: number;
  verse: number | string;
  text: string;
  spans?: Span[];
}

export interface Span {
  start: number;
  end: number;
}

// Chat types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp: string;
}

export interface Citation {
  ref: string;
  text: string;
  spans?: Span[];
}

export interface ChatResponse {
  success: boolean;
  answer: string;
  citations: Citation[];
  has_reliable_sources: boolean;
}

// Analytics events
export type AnalyticsEvent =
  | 'onboarding_view'
  | 'translation_selected'
  | 'disclaimer_accepted'
  | 'onboarding_completed'
  | 'chat_open'
  | 'message_send'
  | 'message_answered'
  | 'citation_tap'
  | 'daily_verse_view';
