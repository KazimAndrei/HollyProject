/**
 * User store with Zustand + AsyncStorage persistence
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Verse } from '../types';

interface CachedDailyVerse {
  verse: Verse;
  updatedAt: string; // ISO timestamp
}

interface UserState extends User {
  // Cached daily verses by translation
  cachedDailyVerses: Record<string, CachedDailyVerse>; // key: `dailyVerse:<translationId>`
  
  // Paywall state
  showPaywall: boolean;

  // Actions
  setLocale: (locale: 'en' | 'ru') => void;
  setTranslation: (translation: string) => void;
  completeOnboarding: () => void;
  setSubscriptionStatus: (status: User['subscriptionStatus']) => void;
  setSubscription: (data: {
    status: User['subscriptionStatus'];
    needsServerValidation?: boolean;
    trialEndsAt?: string;
    originalTransactionId?: string;
  }) => void;
  resetSubscription: () => void;
  incrementAnswersCount: () => void;
  resetAnswersCount: () => void;
  setCachedDailyVerse: (translationId: string, verse: Verse) => void;
  getCachedDailyVerse: (translationId: string) => CachedDailyVerse | null;
  invalidateDailyVerseCache: (translationId: string) => void;
  setShowPaywall: (show: boolean) => void;
}

// Check if cached verse is stale (> 24h)
const isCachedVerseStale = (updatedAt: string): boolean => {
  const cached = new Date(updatedAt);
  const now = new Date();
  const diffHours = (now.getTime() - cached.getTime()) / (1000 * 60 * 60);
  return diffHours > 24;
};

export const useUserStore = create<UserState>()(persist(
  (set, get) => ({
    // Initial state
    locale: 'en',
    translation: 'kjv',
    onboardingCompleted: false,
    subscriptionStatus: 'free',
    needsServerValidation: false,
    originalTransactionId: undefined,
    trialEndsAt: undefined,
    answersCount: 0,
    cachedDailyVerses: {},
    showPaywall: false,

    // Actions
    setLocale: (locale) => {
      const state = get();
      const oldTranslation = state.translation;
      
      set({ locale });
      
      // Update translation based on locale
      const newTranslation = locale === 'en' ? 'kjv' : 'rst';
      set({ translation: newTranslation });
      
      // Invalidate old translation cache when switching
      if (oldTranslation !== newTranslation) {
        get().invalidateDailyVerseCache(oldTranslation);
      }
    },

    setTranslation: (translation) => {
      const state = get();
      const oldTranslation = state.translation;
      
      set({ translation });
      
      // Invalidate old translation cache
      if (oldTranslation !== translation) {
        get().invalidateDailyVerseCache(oldTranslation);
      }
    },

    completeOnboarding: () => set({ onboardingCompleted: true }),

    setSubscriptionStatus: (status) => set({ subscriptionStatus: status }),

    incrementAnswersCount: () => set((state) => ({ answersCount: state.answersCount + 1 })),

    resetAnswersCount: () => set({ answersCount: 0 }),

    setCachedDailyVerse: (translationId, verse) => {
      const key = `dailyVerse:${translationId}`;
      set((state) => ({
        cachedDailyVerses: {
          ...state.cachedDailyVerses,
          [key]: {
            verse,
            updatedAt: new Date().toISOString(),
          },
        },
      }));
    },

    getCachedDailyVerse: (translationId) => {
      const key = `dailyVerse:${translationId}`;
      const cached = get().cachedDailyVerses[key];
      
      if (!cached) return null;
      
      // Check if stale
      if (isCachedVerseStale(cached.updatedAt)) {
        return null;
      }
      
      return cached;
    },

    invalidateDailyVerseCache: (translationId) => {
      const key = `dailyVerse:${translationId}`;
      set((state) => {
        const newCache = { ...state.cachedDailyVerses };
        delete newCache[key];
        return { cachedDailyVerses: newCache };
      });
    },

    setShowPaywall: (show) => set({ showPaywall: show }),
  }),
  {
    name: 'bc_user_v1',
    storage: createJSONStorage(() => AsyncStorage),
  }
));
