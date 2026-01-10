// src/screens/Nurse/NurseChatScreen.tsx

import React, { useState } from "react";
import { View } from "react-native";
import {
  NurseChatBox,
  ChatMessage,
} from "../../../components/cards/NurseChatBox";
import { api } from "../../../services/api";
import { COLORS } from "../../../constants/colors";

export const NurseChatScreen: React.FC<any> = ({ route }) => {
  const userName = route.params?.userName ?? "Patient";

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      type: "nurse",
      text: `Hello ${userName}! I'm VIORA, your AI nurse. I'm here to support your recovery. How are you feeling today?`,
      time: "Now",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const addMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      text,
      time: "Now",
    };
    addMessage(userMsg);
    setInput("");
    setIsTyping(true);

    try {
      // Call backend nurse endpoint
      const res = await api.askNurse({ message: text });
      const replyText =
        res.reply ??
        "I’m here with you. Based on what we understand so far, let’s go through this together.";

      const nurseMsg: ChatMessage = {
        id: `nurse-${Date.now()}`,
        type: "nurse",
        text: replyText,
        time: "Now",
      };
      addMessage(nurseMsg);
    } catch (e) {
      const errMsg: ChatMessage = {
        id: `nurse-error-${Date.now()}`,
        type: "nurse",
        text:
          "Sorry, I couldn’t reach the nurse service right now. Please try again in a few moments.",
        time: "Now",
      };
      addMessage(errMsg);
    } finally {
      setIsTyping(false);
    }
  };

  const handleMicPress = () => {
    // Placeholder for voice logic
    setIsRecording((prev) => !prev);
  };

  const handleQuickReply = (text: string) => {
    setInput(text);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <NurseChatBox
        messages={messages}
        input={input}
        onChangeInput={setInput}
        onSend={handleSend}
        isTyping={isTyping}
        isRecording={isRecording}
        onMicPress={handleMicPress}
        quickReplies={[
          "How should I take my meds?",
          "Report a side effect",
        ]}
        onQuickReplyPress={handleQuickReply}
        headerTitle="VIORA Nurse"
        headerSubtitle="Online • Responds in under 1 min"
      />
    </View>
  );
};
