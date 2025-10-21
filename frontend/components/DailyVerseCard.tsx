/**
 * Daily Verse Card component
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Verse } from '../types';
import { buildPassageDeeplink } from '../utils/deeplink';

interface DailyVerseCardProps {
  verse: Verse | null;
  isLoading: boolean;
  isOffline: boolean;
  translationName: string;
  locale: 'en' | 'ru';
  onRefresh: () => void;
  onReadContext: (ref: string) => void;
  onAskQuestion: (ref: string) => void;
}

export default function DailyVerseCard({
  verse,
  isLoading,
  isOffline,
  translationName,
  locale,
  onRefresh,
  onReadContext,
  onAskQuestion,
}: DailyVerseCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading && !verse) {
    return (
      <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
        <ActivityIndicator size="large" color="#4C7CF0" />
        <Text style={[styles.loadingText, isDark ? styles.textDark : styles.textLight]}>
          {locale === 'ru' ? 'Загрузка стиха дня...' : 'Loading daily verse...'}
        </Text>
      </View>
    );
  }

  if (!verse) {
    return (
      <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={[styles.errorText, isDark ? styles.textDark : styles.textLight]}>
          {locale === 'ru'
            ? 'Не удалось загрузить стих дня'
            : 'Failed to load daily verse'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>
            {locale === 'ru' ? 'Повторить' : 'Retry'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleReadContext = () => {
    const deeplink = buildPassageDeeplink(verse.ref, locale);
    console.log('[Analytics] read_context_tap', { ref: verse.ref });
    console.log('[Navigation] Navigate to:', deeplink);
    onReadContext(verse.ref);
  };

  const handleAskQuestion = () => {
    console.log('[Analytics] ask_question_tap', { ref: verse.ref });
    onAskQuestion(verse.ref);
  };

  return (
    <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="book" size={20} color="#4C7CF0" />
          <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>
            {locale === 'ru' ? 'Стих дня' : 'Daily Verse'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={isLoading}
          accessible={true}
          accessibilityLabel="Refresh daily verse"
          accessibilityRole="button"
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#4C7CF0" />
          ) : (
            <Ionicons name="refresh" size={20} color="#4C7CF0" />
          )}
        </TouchableOpacity>
      </View>

      {/* Offline Badge */}
      {isOffline && (
        <View style={styles.offlineBadge}>
          <Ionicons name="cloud-offline-outline" size={14} color="#F59E0B" />
          <Text style={styles.offlineBadgeText}>
            {locale === 'ru' ? 'Кэшированный стих' : 'Cached verse'}
          </Text>
        </View>
      )}

      {/* Reference & Translation */}
      <View style={styles.refRow}>
        <Text style={[styles.ref, isDark ? styles.textDark : styles.textLight]}>
          {verse.ref}
        </Text>
        <View style={[styles.translationBadge, isDark ? styles.badgeDark : styles.badgeLight]}>
          <Text style={[styles.translationBadgeText, isDark ? styles.subtextDark : styles.subtextLight]}>
            {translationName}
          </Text>
        </View>
      </View>

      {/* Verse Text */}
      <Text
        style={[
          styles.verseText,
          isDark ? styles.textDark : styles.textLight,
          !isExpanded && styles.verseTextClamped,
        ]}
        numberOfLines={isExpanded ? undefined : 6}
        accessible={true}
        accessibilityRole="text"
      >
        {verse.text}
      </Text>

      {/* Show More/Less */}
      {verse.text.length > 200 && (
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
          <Text style={styles.showMoreText}>
            {isExpanded
              ? locale === 'ru'
                ? 'Показать меньше'
                : 'Show less'
              : locale === 'ru'
              ? 'Показать ещё'
              : 'Show more'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonPrimary]}
          onPress={handleReadContext}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel="Read in context"
          accessibilityRole="button"
        >
          <Ionicons name="book-outline" size={18} color="#FFFFFF" />
          <Text style={styles.actionButtonTextPrimary}>
            {locale === 'ru' ? 'Открыть в контексте' : 'Read in context'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, isDark ? styles.actionButtonSecondaryDark : styles.actionButtonSecondaryLight]}
          onPress={handleAskQuestion}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel="Ask a question"
          accessibilityRole="button"
        >
          <Ionicons name="chatbubble-outline" size={18} color="#4C7CF0" />
          <Text style={[styles.actionButtonTextSecondary, isDark ? styles.textDark : styles.textLight]}>
            {locale === 'ru' ? 'Задать вопрос' : 'Ask a question'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  refreshButton: {
    padding: 4,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  offlineBadgeText: {
    fontSize: 12,
    color: '#92400E',
    marginLeft: 6,
    fontWeight: '500',
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ref: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  translationBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeLight: {
    backgroundColor: '#E0E7FF',
  },
  badgeDark: {
    backgroundColor: '#374151',
  },
  translationBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  verseText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  verseTextClamped: {
    // Will be clamped by numberOfLines
  },
  showMoreText: {
    fontSize: 14,
    color: '#4C7CF0',
    fontWeight: '500',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  actionButtonPrimary: {
    backgroundColor: '#4C7CF0',
  },
  actionButtonSecondaryLight: {
    backgroundColor: '#F3F4F6',
  },
  actionButtonSecondaryDark: {
    backgroundColor: '#374151',
  },
  actionButtonTextPrimary: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtonTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
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
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#4C7CF0',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
