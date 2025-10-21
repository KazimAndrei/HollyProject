/**
 * Passage Navigator component (minimal - placeholders for prev/next)
 */
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PassageNavigatorProps {
  currentRef: string;
  onPrevious?: () => void;
  onNext?: () => void;
}

export default function PassageNavigator({
  currentRef,
  onPrevious,
  onNext,
}: PassageNavigatorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handlePrevious = () => {
    console.log('[PassageNavigator] Previous verse (not yet implemented)');
    if (onPrevious) onPrevious();
  };

  const handleNext = () => {
    console.log('[PassageNavigator] Next verse (not yet implemented)');
    if (onNext) onNext();
  };

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <TouchableOpacity
        style={[styles.button, isDark ? styles.buttonDark : styles.buttonLight]}
        onPress={handlePrevious}
        activeOpacity={0.7}
        accessible={true}
        accessibilityLabel="Previous verse"
        accessibilityRole="button"
      >
        <Ionicons name="chevron-back" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
        <Text style={[styles.buttonText, isDark ? styles.textDark : styles.textLight]}>Previous</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, isDark ? styles.buttonDark : styles.buttonLight]}
        onPress={handleNext}
        activeOpacity={0.7}
        accessible={true}
        accessibilityLabel="Next verse"
        accessibilityRole="button"
      >
        <Text style={[styles.buttonText, isDark ? styles.textDark : styles.textLight]}>Next</Text>
        <Ionicons name="chevron-forward" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  containerLight: {
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    borderTopColor: '#374151',
    backgroundColor: '#1F2937',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonLight: {
    backgroundColor: '#F3F4F6',
  },
  buttonDark: {
    backgroundColor: '#374151',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 4,
  },
  textLight: {
    color: '#6B7280',
  },
  textDark: {
    color: '#9CA3AF',
  },
});
