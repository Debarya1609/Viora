// src/components/NurseChatBox.tsx

import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Image,
} from "react-native";
import { Send, Mic } from "lucide-react-native";
import { COLORS } from "../../constants/colors";

export type ChatMessage = {
  id: string;
  type: "user" | "nurse";
  text: string;
  time: string;
};

type Props = {
  messages: ChatMessage[];
  input: string;
  onChangeInput: (value: string) => void;
  onSend: () => void;
  isTyping: boolean;
  isRecording: boolean;
  onMicPress: () => void;
  quickReplies?: string[];
  onQuickReplyPress?: (text: string) => void;
  headerTitle?: string;
  headerSubtitle?: string;
};

export const NurseChatBox: React.FC<Props> = ({
  messages,
  input,
  onChangeInput,
  onSend,
  isTyping,
  isRecording,
  onMicPress,
  quickReplies = [],
  onQuickReplyPress,
  headerTitle = "VIORA Nurse",
  headerSubtitle = "Online • Responds in under 1 min",
}) => {
  const scrollRef = useRef<ScrollView | null>(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  const handleContentSizeChange = (_w: number, _h: number) => {
    scrollToBottom();
  };

  const handleScroll = (_e: NativeSyntheticEvent<NativeScrollEvent>) => {
    // reserved for future (infinite scroll / load older messages)
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerAvatar}>
            <Image
              source={require("../../assets/images/nurse-icon.png")}
              style={styles.headerAvatarImage}
              resizeMode="contain"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{headerTitle}</Text>
            <View style={styles.headerStatusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.headerStatusText}>{headerSubtitle}</Text>
            </View>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={handleContentSizeChange}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {messages.map((msg) => {
            const isUser = msg.type === "user";
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  isUser ? styles.messageRowRight : styles.messageRowLeft,
                ]}
              >
                <View
                  style={[
                    styles.messageWrapper,
                    isUser && styles.messageWrapperUser,
                  ]}
                >
                  {!isUser && (
                    <View style={styles.senderRow}>
                      <View style={styles.senderAvatar}>
                        <Image
                          source={require("../../assets/images/nurse-icon.png")}
                          style={styles.senderAvatarImage}
                          resizeMode="contain"
                        />
                      </View>
                      <Text style={styles.senderName}>VIORA</Text>
                    </View>
                  )}

                  <View
                    style={[
                      styles.bubble,
                      isUser ? styles.bubbleUser : styles.bubbleNurse,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isUser && styles.messageTextUser,
                      ]}
                    >
                      {msg.text}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.timeText,
                      isUser ? styles.timeTextRight : styles.timeTextLeft,
                    ]}
                  >
                    {msg.time}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <View style={styles.messageRowLeft}>
              <View style={styles.messageWrapper}>
                <View style={styles.senderRow}>
                  <View style={styles.senderAvatar}>
                    <Image
                      source={require("../../assets/images/nurse-icon.png")}
                      style={styles.senderAvatarImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.senderName}>VIORA</Text>
                </View>
                <View style={styles.typingBubble}>
                  <View style={[styles.dot, { opacity: 0.3 }]} />
                  <View style={[styles.dot, { opacity: 0.6 }]} />
                  <View style={[styles.dot, { opacity: 1 }]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input bar */}
        <View style={styles.inputBar}>
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={[
                styles.micButton,
                isRecording && { backgroundColor: "#EF4444" },
              ]}
              onPress={onMicPress}
              activeOpacity={0.9}
            >
              <Mic size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.inputWrapper}>
              <TextInput
                value={input}
                onChangeText={onChangeInput}
                placeholder="Type your message..."
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                multiline
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={onSend}
                activeOpacity={0.9}
              >
                <Send size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {quickReplies.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickRow}
            >
              {quickReplies.map((quick) => (
                <TouchableOpacity
                  key={quick}
                  style={styles.quickChip}
                  onPress={() => onQuickReplyPress?.(quick)}
                >
                  <Text style={styles.quickChipText}>{quick}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: COLORS.primaryBlue,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#BBF7D0",
  },
  headerStatusText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageRow: {
    marginBottom: 10,
    flexDirection: "row",
  },
  messageRowLeft: {
    justifyContent: "flex-start",
  },
  messageRowRight: {
    justifyContent: "flex-end",
  },
  messageWrapper: {
    maxWidth: "80%",
  },
  messageWrapperUser: {
    alignItems: "flex-end",
  },
  senderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  senderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(59,130,246,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  senderAvatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  senderName: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "500",
  },
  bubble: {
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  bubbleNurse: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#BFDBFE",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  bubbleUser: {
    backgroundColor: COLORS.primaryBlue,
  },
  messageText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  messageTextUser: {
    color: "#FFFFFF",
  },
  timeText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  timeTextRight: {
    textAlign: "right",
  },
  timeTextLeft: {
    textAlign: "left",
  },
  typingBubble: {
    marginTop: 2,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#BFDBFE",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primaryBlue,
  },
  inputBar: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primaryBlue,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primaryBlue,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  quickRow: {
    marginTop: 8,
    paddingHorizontal: 4,
    gap: 8,
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginRight: 8,
  },
  quickChipText: {
    fontSize: 12,
    color: COLORS.primaryBlue,
    fontWeight: "500",
  },
});
