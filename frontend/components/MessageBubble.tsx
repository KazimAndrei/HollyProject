/**
 * Message bubble component for chat
 */
import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Message } from '../types';
import CitationChip from './CitationChip';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : isDark ? styles.assistantBubbleDark : styles.assistantBubbleLight,
        ]}
      >
        <Text
          style={[
            styles.text,
            isUser ? styles.userText : isDark ? styles.assistantTextDark : styles.assistantTextLight,
          ]}
          accessible={true}
          accessibilityRole="text"
        >
          {message.content}
        </Text>

        {/* Citations (only for assistant messages) */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <View style={styles.citationsContainer}>
            {message.citations.map((citation, index) => (
              <CitationChip key={`${citation.ref}-${index}`} ref={citation.ref} />
            ))}
          </View>
        )}
      </View>

      {/* Timestamp */}
      <Text style={[styles.timestamp, isDark ? styles.timestampDark : styles.timestampLight]}>
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#4C7CF0',
  },
  assistantBubbleLight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  assistantBubbleDark: {
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantTextLight: {
    color: '#1A1A1A',
  },
  assistantTextDark: {
    color: '#F3F4F6',
  },
  citationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    marginHorizontal: 4,
  },
  timestampLight: {
    color: '#9CA3AF',
  },
  timestampDark: {
    color: '#6B7280',
  },
});
