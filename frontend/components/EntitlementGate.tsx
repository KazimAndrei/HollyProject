/**
 * Entitlement Gate component - shows when free limit reached
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { paywallStrings } from '../strings/paywall';

interface EntitlementGateProps {
  isGated: boolean;
  locale: 'en' | 'ru';
  onOpenPaywall: () => void;
}

export default function EntitlementGate({ isGated, locale, onOpenPaywall }: EntitlementGateProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const strings = paywallStrings[locale];

  if (!isGated) return null;

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <View style={styles.content}>
        <Ionicons name="lock-closed" size={24} color="#F59E0B" />
        <View style={styles.textContainer}>
          <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>
            {strings.freeLimitReached}
          </Text>
          <Text style={[styles.prompt, isDark ? styles.subtextDark : styles.subtextLight]}>
            {strings.unlockPrompt}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.unlockButton}
        onPress={onOpenPaywall}
        activeOpacity={0.7}
        accessible={true}
        accessibilityLabel={strings.unlockButton}
        accessibilityRole="button"
      >
        <Text style={styles.unlockButtonText}>{strings.unlockButton}</Text>
        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  containerLight: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  containerDark: {
    backgroundColor: '#78350F',
    borderColor: '#92400E',
  },
  content: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  prompt: {
    fontSize: 13,
    lineHeight: 18,
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4C7CF0',
    paddingVertical: 12,
    borderRadius: 8,
  },
  unlockButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  textLight: {
    color: '#78350F',
  },
  textDark: {
    color: '#FEF3C7',
  },
  subtextLight: {
    color: '#92400E',
  },
  subtextDark: {
    color: '#FDE68A',
  },
});
