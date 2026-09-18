/**
 * CareerPilot — AI Career Coach Chat Screen
 *
 * A chat interface where users can ask follow-up questions about their
 * analysis results. The chat sends the analysis context along with each
 * message so the AI can give contextual answers.
 *
 * Part of the bottom tab navigator.
 */

import { useState, useRef, useEffect } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCareer, ChatMessage } from "../context/CareerContext";
import { sendChatMessage } from "../api/chatApi";
import { colors, spacing, radii } from "../theme";

export default function ChatScreen() {
  const career = useCareer();
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  const messages = career.chatMessages;

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  async function handleSend() {
    const text = inputText.trim();
    if (!text || isLoading) return;

    setInputText("");

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text,
    };
    career.addChatMessage(userMsg);
    setIsLoading(true);

    try {
      // Build context from the analysis result
      const context = career.result
        ? JSON.stringify(career.result)
        : "No analysis has been run yet.";

      const aiResponse = await sendChatMessage(text, context);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: aiResponse,
      };
      career.addChatMessage(aiMsg);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text:
          err instanceof Error
            ? `Sorry, I encountered an error: ${err.message}`
            : "Sorry, something went wrong. Please try again.",
      };
      career.addChatMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  function renderMessage({ item }: { item: ChatMessage }) {
    const isUser = item.role === "user";
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        {!isUser && (
          <Text style={styles.aiLabel}>CareerPilot</Text>
        )}
        <Text style={[styles.messageText, isUser && styles.userText]}>
          {item.text}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>AI Career Coach</Text>
          <Text style={styles.emptyText}>
            Ask me anything about your career assessment, skills to
            develop, or next steps.
          </Text>

          <View style={styles.suggestions}>
            <SuggestionChip
              text="Should I apply for this job?"
              onPress={() => setInputText("Should I apply for this job?")}
            />
            <SuggestionChip
              text="What project should I build next?"
              onPress={() => setInputText("What project should I build next?")}
            />
            <SuggestionChip
              text="How can I improve my GitHub?"
              onPress={() => setInputText("How can I improve my GitHub profile?")}
            />
            <SuggestionChip
              text="What skills should I learn first?"
              onPress={() => setInputText("What skills should I learn first?")}
            />
          </View>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask about your career..."
          placeholderTextColor={colors.textDim}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isLoading) && styles.sendDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
          activeOpacity={0.7}
        >
          <Text style={styles.sendText}>{isLoading ? "⏳" : "→"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function SuggestionChip({
  text,
  onPress,
}: {
  text: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.chip} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.chipText}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.screenPadding,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  suggestions: {
    gap: spacing.sm,
    alignItems: "center",
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  chipText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },

  // Message list
  messageList: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.sm,
  },
  messageBubble: {
    maxWidth: "85%",
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  userBubble: {
    backgroundColor: colors.primary,
    alignSelf: "flex-end",
    borderBottomRightRadius: radii.xs || 4,
  },
  aiBubble: {
    backgroundColor: colors.bgCard,
    alignSelf: "flex-start",
    borderBottomLeftRadius: radii.xs || 4,
  },
  aiLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  userText: {
    color: colors.textOnPrimary,
  },

  // Input bar
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    padding: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendDisabled: {
    opacity: 0.4,
  },
  sendText: {
    fontSize: 20,
    color: colors.textOnPrimary,
    fontWeight: "700",
  },
});
