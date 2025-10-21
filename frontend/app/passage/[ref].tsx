/**
 * Passage Viewer screen
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../store/useUserStore';
import { getScripture } from '../../services/api';
import PassageNavigator from '../../components/PassageNavigator';
import { normalizeRef, findFirstMatch } from '../../utils/deeplink';
import { Verse, Span } from '../../types';

export default function PassageViewerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ ref: string; from?: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { locale, setLocale } = useUserStore();
  const [verse, setVerse] = useState<Verse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ref = params.ref ? decodeURIComponent(params.ref as string) : '';
  const from = params.from as string | undefined;
  const translationName = locale === 'en' ? 'KJV' : 'Синодальный';

  const fetchPassage = async (refToFetch: string, localeToUse: 'en' | 'ru') => {
    try {
      setIsLoading(true);
      setError(null);

      const normalizedRef = normalizeRef(refToFetch, localeToUse);
      const verseData = await getScripture(normalizedRef, localeToUse);
      setVerse(verseData);

      // Analytics
      console.log('[Analytics] passage_open', {
        ref: normalizedRef,
        translation: localeToUse === 'en' ? 'kjv' : 'rst',
        from: from || 'unknown',
      });
    } catch (err) {
      console.error('[PassageViewer] Error fetching passage:', err);
      setError('Reference not found');
      setVerse(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (ref) {
      fetchPassage(ref, locale);
    }
  }, [ref, locale]);

  const handleTranslationToggle = () => {
    const newLocale = locale === 'en' ? 'ru' : 'en';
    console.log('[Analytics] translation_changed', { from: locale, to: newLocale });
    setLocale(newLocale);
  };

  const handleCopy = () => {
    if (!verse) return;
    Alert.alert(
      'Copy Passage',
      `${verse.ref}\n\n${verse.text}`,
      [
        { text: 'OK', style: 'default' },
      ]
    );
    console.log('[Analytics] copy_passage', { ref: verse.ref });
  };

  const handleBookmark = () => {
    if (!verse) return;
    console.log('[Analytics] bookmark_passage', { ref: verse.ref });
    Alert.alert('Bookmark', `Bookmarked: ${verse.ref}`, [{ text: 'OK' }]);
  };

  const handleBackToChat = () => {
    router.push('/chat');
  };

  const handleOpenInChat = () => {
    if (!verse) return;
    const prompt = locale === 'ru' ? `Что означает ${verse.ref}?` : `What does ${verse.ref} mean?`;
    console.log('[Analytics] open_in_chat', { ref: verse.ref, prompt });
    
    // Navigate to chat (prefill will be implemented when Chat accepts params)
    router.push('/chat');
    // TODO: Pass prompt as route param
  };

  const handleRetry = () => {
    if (ref) {
      fetchPassage(ref, locale);
    }
  };

  const handleTryOtherTranslation = () => {
    const newLocale = locale === 'en' ? 'ru' : 'en';
    Alert.alert(
      'Try Other Translation',
      `Switching to ${newLocale === 'en' ? 'English (KJV)' : 'Russian (Synodal)'}...`,
      [{ text: 'OK' }]
    );
    setLocale(newLocale);
  };

  // Render highlighted text with spans
  const renderHighlightedText = () => {
    if (!verse) return null;

    let spans = verse.spans || [];
    
    // If no spans from backend, try to find first match (fallback)
    if (spans.length === 0) {
      // Try to highlight first occurrence of query (simplified - would need actual query)
      // For MVP, skip fallback highlighting
      return (
        <Text
          style={[styles.verseText, isDark ? styles.textDark : styles.textLight]}
          accessible={true}
          accessibilityRole="text"
        >
          {verse.text}
        </Text>
      );
    }

    // Cap to max 3 highlighted ranges
    spans = spans.slice(0, 3);

    // Split text into segments with highlights
    const segments: { text: string; highlighted: boolean }[] = [];
    let lastIndex = 0;

    spans.forEach((span) => {
      if (span.start > lastIndex) {
        segments.push({
          text: verse.text.substring(lastIndex, span.start),
          highlighted: false,
        });
      }
      segments.push({
        text: verse.text.substring(span.start, span.end),
        highlighted: true,
      });
      lastIndex = span.end;
    });

    if (lastIndex < verse.text.length) {
      segments.push({
        text: verse.text.substring(lastIndex),
        highlighted: false,
      });
    }

    return (
      <Text
        style={[styles.verseText, isDark ? styles.textDark : styles.textLight]}
        accessible={true}
        accessibilityRole="text"
      >
        {segments.map((segment, index) =>
          segment.highlighted ? (
            <Text
              key={index}
              style={styles.highlight}
              accessible={true}
              accessibilityLabel="Highlighted text"
            >
              {segment.text}
            </Text>
          ) : (
            <Text key={index}>{segment.text}</Text>
          )
        )}
      </Text>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, isDark ? styles.headerDark : styles.headerLight]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessible={true}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#1A1A1A'} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, isDark ? styles.textDark : styles.textLight]} numberOfLines={1}>
            {verse?.ref || ref}
          </Text>
          {verse && (
            <View style={[styles.translationBadge, isDark ? styles.badgeDark : styles.badgeLight]}>
              <Text style={[styles.translationBadgeText, isDark ? styles.subtextDark : styles.subtextLight]}>
                {translationName}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.translationToggle}
          onPress={handleTranslationToggle}
          accessible={true}
          accessibilityLabel={`Switch to ${locale === 'en' ? 'Russian' : 'English'}`}
          accessibilityRole="button"
        >
          <Ionicons name="language" size={24} color="#4C7CF0" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4C7CF0" />
            <Text style={[styles.loadingText, isDark ? styles.textDark : styles.textLight]}>
              {locale === 'ru' ? 'Загрузка отрывка...' : 'Loading passage...'}
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <Text style={[styles.errorText, isDark ? styles.textDark : styles.textLight]}>
              {error}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>
                {locale === 'ru' ? 'Повторить' : 'Retry'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tryOtherButton} onPress={handleTryOtherTranslation}>
              <Text style={styles.tryOtherButtonText}>
                {locale === 'ru' ? 'Попробовать на английском' : 'Try in Russian'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : verse ? (
          <View style={styles.verseContainer}>
            {renderHighlightedText()}

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, isDark ? styles.actionButtonDark : styles.actionButtonLight]}
                onPress={handleCopy}
                activeOpacity={0.7}
              >
                <Ionicons name="copy-outline" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <Text style={[styles.actionButtonText, isDark ? styles.textDark : styles.textLight]}>
                  {locale === 'ru' ? 'Копировать' : 'Copy'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, isDark ? styles.actionButtonDark : styles.actionButtonLight]}
                onPress={handleBookmark}
                activeOpacity={0.7}
              >
                <Ionicons name="bookmark-outline" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <Text style={[styles.actionButtonText, isDark ? styles.textDark : styles.textLight]}>
                  {locale === 'ru' ? 'Закладка' : 'Bookmark'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={handleOpenInChat}
                activeOpacity={0.7}
              >
                <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonTextPrimary}>
                  {locale === 'ru' ? 'Открыть в чате' : 'Open in Chat'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, isDark ? styles.actionButtonDark : styles.actionButtonLight]}
                onPress={handleBackToChat}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back-outline" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <Text style={[styles.actionButtonText, isDark ? styles.textDark : styles.textLight]}>
                  {locale === 'ru' ? 'Назад в чат' : 'Back to Chat'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Navigator */}
      {verse && <PassageNavigator currentRef={verse.ref} />}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLight: {
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  headerDark: {
    borderBottomColor: '#374151',
    backgroundColor: '#1F2937',
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  translationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  badgeLight: {
    backgroundColor: '#E0E7FF',
  },
  badgeDark: {
    backgroundColor: '#374151',
  },
  translationBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  translationToggle: {
    padding: 4,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
  tryOtherButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  tryOtherButtonText: {
    color: '#4C7CF0',
    fontSize: 14,
    fontWeight: '600',
  },
  verseContainer: {
    paddingVertical: 20,
  },
  verseText: {
    fontSize: 18,
    lineHeight: 32,
    marginBottom: 24,
  },
  highlight: {
    backgroundColor: 'rgba(76, 124, 240, 0.2)',
    borderRadius: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
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
  actionButtonLight: {
    backgroundColor: '#F3F4F6',
  },
  actionButtonDark: {
    backgroundColor: '#374151',
  },
  actionButtonPrimary: {
    backgroundColor: '#4C7CF0',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtonTextPrimary: {
    color: '#FFFFFF',
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
});
