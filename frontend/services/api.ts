/**
 * API service for Bible Chat backend
 */
import axios from 'axios';
import Constants from 'expo-constants';
import { ChatResponse, Verse } from '../types';

// Get backend URL from env
const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Chat API
export const sendChatMessage = async (text: string, locale: 'en' | 'ru'): Promise<ChatResponse> => {
  try {
    const response = await api.post<ChatResponse>('/api/chat', { text, locale });
    return response.data;
  } catch (error) {
    console.error('[API] Chat error:', error);
    throw new Error('Network error. Please try again.');
  }
};

// Scripture API
export const getScripture = async (ref: string, locale: 'en' | 'ru'): Promise<Verse> => {
  try {
    const response = await api.get<{ success: boolean; data: Verse }>(`/api/scripture/${encodeURIComponent(ref)}`, {
      params: { locale },
    });
    return response.data.data;
  } catch (error) {
    console.error('[API] Scripture error:', error);
    throw new Error('Failed to load passage.');
  }
};

// Daily Verse API
export const getDailyVerse = async (locale: 'en' | 'ru'): Promise<Verse> => {
  try {
    const response = await api.get<{ success: boolean; data: Verse }>('/api/daily-verse', {
      params: { locale },
    });
    return response.data.data;
  } catch (error) {
    console.error('[API] Daily verse error:', error);
    throw new Error('Failed to load daily verse.');
  }
};

export default api;
