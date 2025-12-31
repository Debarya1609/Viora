import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { analyzeSymptoms } from "../services/api";

export default function HomeScreen() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setInput("");
    setLoading(true);

    try {
      const data = await analyzeSymptoms(input);

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: data.response.message },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Sorry, I couldn't reach Viora right now." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.header}>Viora</Text>

      <ScrollView style={styles.chat} contentContainerStyle={{ padding: 16 }}>
        {messages.map((msg, i) => (
          <View
            key={i}
            style={[
              styles.bubble,
              msg.role === "user" ? styles.user : styles.ai,
            ]}
          >
            <Text
              style={[
                styles.text,
                msg.role === "user" && { color: "#fff" },
              ]}
            >
              {msg.text}
            </Text>
          </View>
        ))}

        {loading && (
          <Text style={{ color: "#666", marginTop: 10 }}>
            Viora is thinking…
          </Text>
        )}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Describe how you’re feeling…"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.send} onPress={sendMessage}>
          <Text style={{ color: "white" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5FAFC" },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0A6E8A",
    textAlign: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  chat: { flex: 1 },
  bubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  user: {
    backgroundColor: "#0A6E8A",
    alignSelf: "flex-end",
  },
  ai: {
    backgroundColor: "#E3F3F7",
    alignSelf: "flex-start",
  },
  text: { color: "#000" },
  inputBar: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 14,
    marginRight: 10,
  },
  send: {
    backgroundColor: "#0A6E8A",
    borderRadius: 20,
    paddingHorizontal: 18,
    justifyContent: "center",
  },
});
