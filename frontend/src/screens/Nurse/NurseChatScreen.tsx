// src/screens/Nurse/NurseChatScreen.tsx

import React, { useState } from "react";
import { View } from "react-native";
import { NurseChatBox, ChatMessage } from "../../../components/cards/NurseChatBox";
import { api } from "../../../services/api"; // you’ll add askNurse later
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
      // TODO: call backend nurse endpoint instead of dummy
      // const res = await api.askNurse({ message: text });
      // const replyText = res.reply;
      const replyText =
        "Thanks for your question. I’m still being connected to your medical records, but for now this is a placeholder response.";

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

  const handleMicPress = async () => {
    // Placeholder for voice logic
    // Later: start/stop recording with expo-av and send audio to backend STT[web:1160][web:1197]
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
