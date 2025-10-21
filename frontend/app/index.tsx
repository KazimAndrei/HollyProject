/**
 * Home screen with Daily Verse
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUserStore } from '../store/useUserStore';
import { getDailyVerse } from '../services/api';
import DailyVerseCard from '../components/DailyVerseCard';
import { Verse } from '../types';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { locale, translation, getCachedDailyVerse, setCachedDailyVerse } = useUserStore();

  const [dailyVerse, setDailyVerse] = useState<Verse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const translationName = translation === 'kjv' ? 'KJV' : 'Синодальный';

  const fetchDailyVerse = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const verse = await getDailyVerse(locale);
      setDailyVerse(verse);
      setIsOffline(false);

      // Cache the verse
      setCachedDailyVerse(translation, verse);

      // Analytics
      console.log('[Analytics] daily_verse_view', { ref: verse.ref, translation });
      console.log('[Analytics] daily_verse_refresh', { status: 'success' });
    } catch (error) {
      console.error('[Home] Failed to load daily verse:', error);

      // Try to load from cache
      const cached = getCachedDailyVerse(translation);
      if (cached) {
        setDailyVerse(cached.verse);
        setIsOffline(true);
        console.log('[Analytics] daily_verse_refresh', { status: 'offline' });
      } else {
        setDailyVerse(null);
        console.log('[Analytics] daily_verse_refresh', { status: 'error' });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Check cache first
    const cached = getCachedDailyVerse(translation);
    if (cached) {
      setDailyVerse(cached.verse);
      setIsLoading(false);
      setIsOffline(false);
      console.log('[Analytics] daily_verse_view', { ref: cached.verse.ref, translation, cached: true });
    }

    // Fetch fresh daily verse
    fetchDailyVerse();
  }, [translation, locale]);

  const handleRefresh = () => {
    fetchDailyVerse(true);
  };

  const handleReadContext = (ref: string) => {
    // Navigate to Passage Viewer
    router.push(`/passage/${encodeURIComponent(ref)}?from=daily_verse`);
  };

  const handleAskQuestion = (ref: string) => {
    // Navigate to chat with prefilled prompt
    const prompt = locale === 'ru' ? `Что означает ${ref}?` : `What does ${ref} mean?`;
    
    // For now, just navigate to chat (prefill will be implemented when Chat accepts route params)
    router.push('/chat');
    
    // TODO: Pass prompt as route param in Phase 2D
    console.log('[Navigation] Navigate to Chat with prompt:', prompt);
  };

  return (
    <SafeAreaView
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#4C7CF0"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, isDark ? styles.textDark : styles.textLight]}>
            {locale === 'ru' ? 'Добро пожаловать' : 'Welcome'}
          </Text>
          <Text style={[styles.subtitle, isDark ? styles.subtextDark : styles.subtextLight]}>
            {locale === 'ru'
              ? 'Шагните в живое Слово'
              : 'Step Into the Living Word'}
          </Text>
        </View>

        {/* Daily Verse Card */}
        <DailyVerseCard
          verse={dailyVerse}
          isLoading={isLoading}
          isOffline={isOffline}
          translationName={translationName}
          locale={locale}
          onRefresh={handleRefresh}
          onReadContext={handleReadContext}
          onAskQuestion={handleAskQuestion}
        />

        {/* Coming Soon Section */}
        <View style={[styles.comingSoonCard, isDark ? styles.cardDark : styles.cardLight]}>
          <Text style={[styles.comingSoonTitle, isDark ? styles.textDark : styles.textLight]}>
            {locale === 'ru' ? 'Скоро' : 'Coming Soon'}
          </Text>
          <Text style={[styles.comingSoonText, isDark ? styles.subtextDark : styles.subtextLight]}>
            {locale === 'ru'
              ? '• Планы чтения\n• Закладки и заметки\n• Напоминания'
              : '• Reading plans\n• Bookmarks & Notes\n• Reminders'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#F7F8FA',
  },
  containerDark: {
    backgroundColor: '#0E1115',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  textLight: {
    color: '#1A1A1A',
  },
  textDark: {
    color: '#FFFFFF',
  },
  subtextLight: {
    color: '#6B7280',
  },
  subtextDark: {
    color: '#9CA3AF',
  },
  comingSoonCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
