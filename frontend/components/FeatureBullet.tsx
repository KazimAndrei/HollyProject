/**
 * Feature bullet component for paywall
 */
import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FeatureBulletProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  badge?: string;
}

export default function FeatureBullet({ icon, text, badge }: FeatureBulletProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color="#4C7CF0" />
      </View>
      <View style={styles.textContainer}>
        <Text
          style={[styles.text, isDark ? styles.textDark : styles.textLight]}
          numberOfLines={2}
        >
          {text}
        </Text>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 124, 240, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  textLight: {
    color: '#1A1A1A',
  },
  textDark: {
    color: '#F3F4F6',
  },
  badge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
  },
});
