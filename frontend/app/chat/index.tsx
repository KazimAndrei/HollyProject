/**
 * Chat screen
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../store/useUserStore';
import { useChatStore } from '../../store/useChatStore';
import { sendChatMessage } from '../../services/api';
import { parseCitations } from '../../utils/deeplink';
import MessageBubble from '../../components/MessageBubble';
import { Message } from '../../types';

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const { locale } = useUserStore();
  const { messages, isLoading, addMessage, setLoading } = useChatStore();

  const [inputText, setInputText] = useState('');
  const [showFallbackBanner, setShowFallbackBanner] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Analytics: chat_open
    console.log('[Analytics] chat_open');
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessageText = inputText.trim();
    setInputText('');

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessageText,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMessage);

    // Analytics: message_send
    console.log('[Analytics] message_send', { len: userMessageText.length });

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Call API
    setLoading(true);
    try {
      const response = await sendChatMessage(userMessageText, locale);

      // Parse citations from answer (fallback if backend doesn't provide)
      let citations = response.citations || [];
      if (citations.length === 0) {
        const parsedRefs = parseCitations(response.answer, locale);
        citations = parsedRefs.map((ref) => ({ ref, text: '', spans: [] }));
      }

      // Deduplicate and limit to 5
      const uniqueCitations = Array.from(
        new Map(citations.map((c) => [c.ref, c])).values()
      ).slice(0, 5);

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        citations: uniqueCitations,
        timestamp: new Date().toISOString(),
      };
      addMessage(assistantMessage);

      // Analytics: message_answered
      console.log('[Analytics] message_answered', {
        has_citations: uniqueCitations.length > 0,
        chip_count: uniqueCitations.length,
      });

      // Show fallback banner if no reliable sources
      if (!response.has_reliable_sources) {
        setShowFallbackBanner(true);
        console.log('[Analytics] fallback_banner_shown');
        setTimeout(() => setShowFallbackBanner(false), 5000);
      }

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      // Network error toast
      Alert.alert('Error', 'Network error. Please try again.', [{ text: 'OK' }]);
      console.error('[Chat] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, isDark ? styles.headerDark : styles.headerLight]}>
        <Text style={[styles.headerTitle, isDark ? styles.textDark : styles.textLight]}>
          Bible Chat
        </Text>
      </View>

      {/* Fallback Banner */}
      {showFallbackBanner && (
        <View style={[styles.banner, styles.bannerWarning]}>
          <Ionicons name="alert-circle-outline" size={18} color="#F59E0B" />
          <Text style={styles.bannerText}>
            {locale === 'ru'
              ? 'Офлайн-режим: показаны ближайшие отрывки.'
              : 'Offline mode: showing nearest passages.'}
          </Text>
        </View>
      )}

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="chatbubbles-outline"
                size={48}
                color={isDark ? '#4B5563' : '#D1D5DB'}
              />
              <Text style={[styles.emptyText, isDark ? styles.textDark : styles.textLight]}>
                {locale === 'ru'
                  ? 'Задайте вопрос о Библии'
                  : 'Ask a question about the Bible'}
              </Text>
            </View>
          }
        />

        {/* Input */}
        <View
          style={[
            styles.inputContainer,
            isDark ? styles.inputContainerDark : styles.inputContainerLight,
            { paddingBottom: insets.bottom || 16 },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              isDark ? styles.inputDark : styles.inputLight,
            ]}
            placeholder={
              locale === 'ru' ? 'Напишите ваш вопрос...' : 'Type your question...'
            }
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading}
            accessible={true}
            accessibilityLabel="Message input"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel="Send message"
            accessibilityRole="button"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  flex: {
    flex: 1,
  },
  header: {
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  textLight: {
    color: '#1A1A1A',
  },
  textDark: {
    color: '#FFFFFF',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  bannerWarning: {
    backgroundColor: '#FEF3C7',
  },
  bannerText: {
    fontSize: 13,
    color: '#92400E',
    marginLeft: 8,
    flex: 1,
  },
  messagesList: {
    paddingVertical: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  inputContainerLight: {
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  inputContainerDark: {
    borderTopColor: '#374151',
    backgroundColor: '#1F2937',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 15,
    marginRight: 8,
  },
  inputLight: {
    backgroundColor: '#F3F4F6',
    color: '#1A1A1A',
  },
  inputDark: {
    backgroundColor: '#374151',
    color: '#F3F4F6',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4C7CF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.5,
  },
});
