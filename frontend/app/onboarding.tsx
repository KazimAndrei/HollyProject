/**
 * Onboarding screen: Translation selection + Disclaimer
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/useUserStore';
import { Translation } from '../types';

const TRANSLATIONS: Translation[] = [
  { id: 'kjv', lang: 'en', name: 'King James Version', description: 'English' },
  { id: 'rst', lang: 'ru', name: 'Russian Synodal Translation', description: 'Русский' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { locale, setLocale, completeOnboarding } = useUserStore();
  const [selectedLocale, setSelectedLocale] = useState<'en' | 'ru' | null>(locale || null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  useEffect(() => {
    // Analytics: onboarding_view
    console.log('[Analytics] onboarding_view');
  }, []);

  const handleSelectTranslation = (translation: Translation) => {
    setSelectedLocale(translation.lang);
    console.log('[Analytics] translation_selected', { translation: translation.id });
  };

  const handleDisclaimerToggle = () => {
    setDisclaimerAccepted(!disclaimerAccepted);
    if (!disclaimerAccepted) {
      console.log('[Analytics] disclaimer_accepted');
    }
  };

  const handleContinue = () => {
    if (!selectedLocale || !disclaimerAccepted) return;

    setLocale(selectedLocale);
    completeOnboarding();
    console.log('[Analytics] onboarding_completed', { locale: selectedLocale });
    router.replace('/');
  };

  const canContinue = selectedLocale !== null && disclaimerAccepted;

  return (
    <ScrollView
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>
          Welcome to Bible Chat
        </Text>
        <Text style={[styles.subtitle, isDark ? styles.subtextDark : styles.subtextLight]}>
          Step Into the Living Word
        </Text>
      </View>

      {/* Translation Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark ? styles.textDark : styles.textLight]}>
          Choose Your Translation
        </Text>
        {TRANSLATIONS.map((translation) => (
          <TouchableOpacity
            key={translation.id}
            style={[
              styles.translationCard,
              selectedLocale === translation.lang && styles.translationCardSelected,
              isDark ? styles.cardDark : styles.cardLight,
            ]}
            onPress={() => handleSelectTranslation(translation)}
            activeOpacity={0.7}
          >
            <View style={styles.translationContent}>
              <Text style={[styles.translationName, isDark ? styles.textDark : styles.textLight]}>
                {translation.name}
              </Text>
              <Text style={[styles.translationDesc, isDark ? styles.subtextDark : styles.subtextLight]}>
                {translation.description}
              </Text>
            </View>
            <View style={styles.radio}>
              {selectedLocale === translation.lang ? (
                <View style={styles.radioSelected}>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
              ) : (
                <View style={styles.radioUnselected} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Disclaimer */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.disclaimerRow}
          onPress={handleDisclaimerToggle}
          activeOpacity={0.7}
        >
          <View style={styles.checkbox}>
            {disclaimerAccepted ? (
              <View style={styles.checkboxSelected}>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              </View>
            ) : (
              <View style={styles.checkboxUnselected} />
            )}
          </View>
          <Text style={[styles.disclaimerText, isDark ? styles.subtextDark : styles.subtextLight]}>
            {selectedLocale === 'ru'
              ? 'Приложение предоставляет информационную поддержку на основе Библии. Это не замена пасторскому наставлению и профессиональным рекомендациям.'
              : 'This app provides informational support based on the Bible. It is not a replacement for pastoral counsel or professional advice.'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={[
          styles.continueButton,
          !canContinue && styles.continueButtonDisabled,
        ]}
        onPress={handleContinue}
        disabled={!canContinue}
        activeOpacity={0.8}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </ScrollView>
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
  content: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  translationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  translationCardSelected: {
    borderColor: '#4C7CF0',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
  },
  cardDark: {
    backgroundColor: '#1F2937',
  },
  translationContent: {
    flex: 1,
  },
  translationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  translationDesc: {
    fontSize: 14,
  },
  radio: {
    marginLeft: 12,
  },
  radioUnselected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#9CA3AF',
  },
  radioSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4C7CF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  checkboxUnselected: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#9CA3AF',
  },
  checkboxSelected: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#4C7CF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimerText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4C7CF0',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  continueButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
