/**
 * User store with Zustand + AsyncStorage persistence
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface UserState extends User {
  // Actions
  setLocale: (locale: 'en' | 'ru') => void;
  setTranslation: (translation: string) => void;
  completeOnboarding: () => void;
  setSubscriptionStatus: (status: User['subscriptionStatus']) => void;
  incrementAnswersCount: () => void;
  resetAnswersCount: () => void;
}

export const useUserStore = create<UserState>()(persist(
  (set) => ({
    // Initial state
    locale: 'en',
    translation: 'kjv',
    onboardingCompleted: false,
    subscriptionStatus: 'free',
    answersCount: 0,

    // Actions
    setLocale: (locale) => {
      set({ locale });
      // Also update translation based on locale
      const translation = locale === 'en' ? 'kjv' : 'rst';
      set({ translation });
    },

    setTranslation: (translation) => set({ translation }),

    completeOnboarding: () => set({ onboardingCompleted: true }),

    setSubscriptionStatus: (status) => set({ subscriptionStatus: status }),

    incrementAnswersCount: () => set((state) => ({ answersCount: state.answersCount + 1 })),

    resetAnswersCount: () => set({ answersCount: 0 }),
  }),
  {
    name: 'bc_user_v1',
    storage: createJSONStorage(() => AsyncStorage),
  }
));
