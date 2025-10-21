/**
 * Citation chip component
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, useColorScheme, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { truncateCitation } from '../utils/deeplink';
import { useChatStore } from '../store/useChatStore';
import { useUserStore } from '../store/useUserStore';

interface CitationChipProps {
  ref: string;
  onPress?: (ref: string) => void;
}

export default function CitationChip({ ref, onPress }: CitationChipProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { locale } = useUserStore();
  const { setLastTappedCitationRef } = useChatStore();

  const handlePress = () => {
    console.log('[Analytics] citation_tap', { ref });
    
    // Store last tapped ref
    setLastTappedCitationRef(ref);
    
    // Navigate to Passage Viewer
    router.push(`/passage/${encodeURIComponent(ref)}?from=chat_citation`);
    
    if (onPress) {
      onPress(ref);
    }
  };

  const handleLongPress = () => {
    // Copy full ref on long press
    Alert.alert('Citation', ref, [
      { text: 'OK', style: 'default' },
    ]);
  };

  const displayRef = truncateCitation(ref, 25);

  return (
    <TouchableOpacity
      style={[styles.chip, isDark ? styles.chipDark : styles.chipLight]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={`Open passage ${ref}`}
      accessibilityRole="button"
    >
      <Ionicons name="book-outline" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
      <Text style={[styles.chipText, isDark ? styles.chipTextDark : styles.chipTextLight]}>
        {displayRef}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginTop: 8,
  },
  chipLight: {
    backgroundColor: '#E0E7FF',
  },
  chipDark: {
    backgroundColor: '#1F2937',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },
  chipTextLight: {
    color: '#4C7CF0',
  },
  chipTextDark: {
    color: '#93C5FD',
  },
});
