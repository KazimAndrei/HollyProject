/**
 * Chat store with Zustand
 */
import { create } from 'zustand';
import { Message } from '../types';

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  lastTappedCitationRef: string | null;

  // Actions
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  setLastTappedCitationRef: (ref: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  lastTappedCitationRef: null,

  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

  setLoading: (loading) => set({ isLoading: loading }),

  setLastTappedCitationRef: (ref) => set({ lastTappedCitationRef: ref }),

  clearMessages: () => set({ messages: [] }),
}));
