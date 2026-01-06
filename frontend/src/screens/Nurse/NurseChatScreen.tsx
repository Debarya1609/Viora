// src/screens/Nurse/NurseChatScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Send, Mic } from "lucide-react-native";
import { COLORS } from "../../../constants/colors";

export const NurseChatScreen: React.FC<any> = ({ route }) => {
  const userName = route.params?.userName ?? "Patient";
  const [message, setMessage] = useState("");
  const [isTyping] = useState(true);

  const messages = [
    {
      type: "nurse" as const,
      text: `Hello ${userName}! I'm VIORA, your AI nurse. I'm here to support your recovery. How are you feeling today?`,
      time: "10:30 AM",
    },
    {
      type: "user" as const,
      text: "Hi! I'm feeling a bit better today, but I have some questions about my medication.",
      time: "10:32 AM",
    },
    {
      type: "nurse" as const,
      text: "I'm glad to hear you're feeling better! I'd be happy to help with your medication questions. What would you like to know?",
      time: "10:32 AM",
    },
    {
      type: "user" as const,
      text: "Should I take my Metformin before or after eating?",
      time: "10:33 AM",
    },
    {
      type: "nurse" as const,
      text: "Great question! Metformin should be taken WITH food. This helps reduce stomach upset, which is a common side effect. Take it during or right after your meal.",
      time: "10:33 AM",
    },
    {
      type: "nurse" as const,
      text: "Is there anything else you'd like to know about your medications or recovery?",
      time: "10:34 AM",
    },
  ];

  const handleSend = () => {
    if (!message.trim()) return;
    // TODO: append to local list + call Azure later
    setMessage("");
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerEmoji}>👩‍⚕️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>VIORA Nurse</Text>
            <View style={styles.headerStatusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.headerStatusText}>
                Online • Responds in under 1 min
              </Text>
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
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, index) => {
            const isUser = msg.type === "user";
            return (
              <View
                key={index}
                style={[
                  styles.messageRow,
                  isUser ? styles.messageRowRight : styles.messageRowLeft,
                ]}
              >
                <View
                  style={[
                    styles.messageWrapper,
                    isUser ? styles.messageWrapperUser : null,
                  ]}
                >
                  {!isUser && (
                    <View style={styles.senderRow}>
                      <View style={styles.senderAvatar}>
                        <Text style={styles.senderEmoji}>👩‍⚕️</Text>
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
                    <Text style={styles.senderEmoji}>👩‍⚕️</Text>
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
            <TouchableOpacity style={styles.micButton}>
              <Mic size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.inputWrapper}>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Type your message..."
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                multiline
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSend}
                activeOpacity={0.9}
              >
                <Send size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickRow}
          >
            {[
              "How should I take my meds?",
              "Report a side effect",
              "Schedule appointment",
            ].map((quick) => (
              <TouchableOpacity key={quick} style={styles.quickChip}>
                <Text style={styles.quickChipText}>{quick}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
  headerEmoji: {
    fontSize: 26,
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
  senderEmoji: {
    fontSize: 18,
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
  },
  quickChipText: {
    fontSize: 12,
    color: COLORS.primaryBlue,
    fontWeight: "500",
  },
});
