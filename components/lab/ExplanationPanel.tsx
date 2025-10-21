import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  HandThumbDownIcon,
  HandThumbUpIcon,
  PaperAirplaneIcon,
  PlusCircleIcon
} from "react-native-heroicons/solid";
import Markdown from "react-native-markdown-display";
import HelpModalPage from "./HelpModalPage";
import IconButton from "./IconButton";
import PremadeMessagesModal from "./PremadeMessagesModal";
import TextButton from "./TextButton";

// Import Hook สำหรับ Repository และ Auth (จำเป็น)
import { useAuth } from "@/contexts/AuthContext";
import useRepositories from "@/hooks/useRepositories";

interface Props {
  correctAnswer: string;
  correctExplanation: string;
  incorrectAnswer: string;
  incorrectExplanation: string;
  explanation: string;
  helperStatus: { eliminate: boolean; double: boolean; change: boolean };
  explanationStatus: boolean;
  onPressNext: () => void;
  gameState?: "wait" | "correct" | "incorrect";
}

interface ChatMessage {
  id: number;
  sender: "user" | "bot";
  text: string;
}

type FeedbackState = "like" | "dislike" | null;

const PREMADE_MESSAGES_STORAGE_KEY = "premadeMessages";
const DEFAULT_PREMADE_MESSAGES = [
  "ช่วยอธิบายพร้อมยกตัวอย่าง",
  "อธิบายให้เด็ก 5 ขวบเข้าใจ",
  "ช่วยอธิบายแบบสั้น ๆ",
];

export default function ExplanationPanel({
  correctAnswer,
  correctExplanation,
  incorrectAnswer,
  incorrectExplanation,
  explanation,
  helperStatus,
  explanationStatus,
  onPressNext: onPress,
  gameState,
}: Props) {
  const [openExplanation, setOpenExplanation] = useState(false);
  const [openHelper, setOpenHelper] = useState({
    eliminate: false,
    double: false,
    change: false,
  });
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isPremadeModalVisible, setIsPremadeModalVisible] = useState(false);
  const [premadeMessages, setPremadeMessages] = useState<string[]>([]);
  const [canGiveFeedback, setCanGiveFeedback] = useState(false);

  const auth = useAuth();
  const repos = useRepositories(auth.accessToken).current;
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedChat = await AsyncStorage.getItem("chatHistory");
        const savedFeedback =
          (await AsyncStorage.getItem("explanationFeedback")) as FeedbackState | null;
        const savedPremadeMessages = await AsyncStorage.getItem(
          PREMADE_MESSAGES_STORAGE_KEY
        );

        if (savedChat) setChatHistory(JSON.parse(savedChat));
        if (savedFeedback) setFeedback(savedFeedback);

        if (savedPremadeMessages) {
          setPremadeMessages(JSON.parse(savedPremadeMessages));
        } else {
          setPremadeMessages(DEFAULT_PREMADE_MESSAGES);
        }
      } catch (error) {
        console.error("Failed to load data from storage", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const clearChatData = async () => {
      console.log("New question detected, clearing chat history...");
      setChatHistory([]);
      setFeedback(null);
      setInputValue("");
      setCanGiveFeedback(false);

      try {
        await AsyncStorage.removeItem("chatHistory");
        await AsyncStorage.removeItem("explanationFeedback");
      } catch (error) {
        console.error("Failed to clear data from storage", error);
      }
    };

    clearChatData();
  }, [explanation, correctAnswer]);

  const toggleExplanation = () => {
    setOpenExplanation((prev) => !prev);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isChatLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: "user",
      text: inputValue,
    };
    const updatedChatHistory = [...chatHistory, userMessage];

    setChatHistory(updatedChatHistory);
    setInputValue("");
    setIsChatLoading(true);
    setCanGiveFeedback(false);

    try {
      await AsyncStorage.setItem(
        "chatHistory",
        JSON.stringify(updatedChatHistory)
      );
      const response = await repos.llm.generateText(userMessage.text);
      const botResponseText = response.result;

      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: botResponseText,
      };
      const finalChatHistory = [...updatedChatHistory, botMessage];

      setChatHistory(finalChatHistory);
      setCanGiveFeedback(true);

      await AsyncStorage.setItem(
        "chatHistory",
        JSON.stringify(finalChatHistory)
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: "ขออภัย, เกิดข้อผิดพลาดในการเชื่อมต่อ",
      };
      setChatHistory((prevHistory) => [...prevHistory, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleFeedback = async (newFeedback: "like" | "dislike") => {
    if (!canGiveFeedback) return;

    const updatedFeedback = feedback === newFeedback ? null : newFeedback;
    setFeedback(updatedFeedback);

    try {
      await AsyncStorage.setItem("explanationFeedback", updatedFeedback || "");
      if (updatedFeedback && auth.user?.id) {
        await repos.llm.sendFeedback({
          type: updatedFeedback,
          userId: auth.user.id
        });

      }
    } catch (error) {
      console.error("Failed to save feedback:", error);
    }
  };

  const handleUpdatePremadeMessages = async (newMessages: string[]) => {
    setPremadeMessages(newMessages);
    try {
      await AsyncStorage.setItem(
        PREMADE_MESSAGES_STORAGE_KEY,
        JSON.stringify(newMessages)
      );
    } catch (error) {
      console.error("Failed to save premade messages:", error);
    }
  };

  const handleSelectPremadeMessage = (message: string) => {
    setInputValue(message);
    setIsPremadeModalVisible(false);
  };

  const renderChatItem = ({ item }: { item: ChatMessage }) => (
    <View
      className={`p-3 rounded-lg my-1 max-w-[85%] ${item.sender === "bot"
        ? "bg-gray-700 self-start"
        : "bg-blue-600 self-end"
        }`}
    >
      <Text className="text-white text-base">{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 justify-end">
          <View className="bg-[#27548A] rounded-t-xl">

            {explanationStatus && (
              <View className="flex-row justify-center mt-[12]">
                <IconButton
                  iconImage={openExplanation ? "downArrow" : "upArrow"}
                  onPress={toggleExplanation}
                  isDisable={false}
                />
              </View>
            )}

            {/* ส่วน JSX  */}
            {explanationStatus && openExplanation && (
              <View className="mx-[40]">
                <View>
                  <Text className="text-green-500 text-2xl">{correctAnswer}</Text>
                  <Markdown style={styles}>{correctExplanation}</Markdown>

                  {gameState === "incorrect" && (
                    <>
                      <Text className="text-red-500 text-2xl">
                        {incorrectAnswer}
                      </Text>
                      <Markdown style={styles}>{incorrectExplanation}</Markdown>
                    </>
                  )}

                  <View className="mt-6 border-t border-gray-500 pt-4">
                    <FlatList
                      ref={flatListRef}
                      data={chatHistory}
                      renderItem={renderChatItem}
                      keyExtractor={(item) => item.id.toString()}
                      className="max-h-48 mb-2"
                      onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    />

                    {isChatLoading && (
                      <ActivityIndicator color="white" className="my-2" />
                    )}

                    <View className="flex-row items-end bg-gray-700 rounded-2xl p-2">
                      <TouchableOpacity
                        onPress={() => setIsPremadeModalVisible(true)}
                        className="p-2"
                      >
                        <PlusCircleIcon color="white" size={28} />
                      </TouchableOpacity>
                      <TextInput
                        className="flex-1 text-white text-lg px-2"
                        style={{ maxHeight: 120 }}
                        placeholder="Ask something..."
                        placeholderTextColor="#9ca3af"
                        value={inputValue}
                        onChangeText={setInputValue}
                        editable={!isChatLoading}
                        multiline
                      />
                      <TouchableOpacity
                        onPress={handleSendMessage}
                        disabled={isChatLoading || !inputValue.trim()}
                        className="p-2 bg-blue-600 rounded-full"
                      >
                        <PaperAirplaneIcon color="white" size={24} />
                      </TouchableOpacity>
                    </View>

                    <View className="flex-row items-center justify-end mt-4 space-x-4">
                      <TouchableOpacity
                        onPress={() => handleFeedback("like")}
                        disabled={!canGiveFeedback}
                      >
                        <HandThumbUpIcon
                          color={
                            !canGiveFeedback
                              ? "#6b7280"
                              : feedback === "like"
                                ? "#22c55e"
                                : "white"
                          }
                          size={28}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleFeedback("dislike")}
                        disabled={!canGiveFeedback}
                      >
                        <HandThumbDownIcon
                          color={
                            !canGiveFeedback
                              ? "#6b7280"
                              : feedback === "dislike"
                                ? "#ef4444"
                                : "white"
                          }
                          size={28}
                        />
                      </TouchableOpacity>
                    </View>

                    <View className="h-[8]"></View>
                    <Markdown style={styles}>{explanation}</Markdown>
                  </View>
                </View>
              </View>
            )}
            {/* สิ้นสุดส่วน JSX */}

            {gameState === "wait" && (
              <View className="flex-row justify-between my-[16] mx-[100]">
                <IconButton
                  iconImage="eliminateIcon"
                  isDisable={helperStatus["eliminate"]}
                  onPress={() =>
                    setOpenHelper({ eliminate: true, double: false, change: false })
                  }
                />
                <IconButton
                  iconImage="doubleIcon"
                  isDisable={helperStatus["double"]}
                  onPress={() =>
                    setOpenHelper({ eliminate: false, double: true, change: false })
                  }
                />
                <IconButton
                  iconImage="changeIcon"
                  isDisable={helperStatus["change"]}
                  onPress={() =>
                    setOpenHelper({ eliminate: false, double: false, change: true })
                  }
                />
              </View>
            )}
            {gameState === "incorrect" && (
              <View className="flex-row justify-center my-[16] mx-[40]">
                <TextButton text="Try Again" onPress={onPress} />
              </View>
            )}
            {gameState === "correct" && (
              <View className="flex-row justify-end my-[16] mx-[40]">
                <TextButton text="Next" onPress={onPress} />
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <HelpModalPage
        title="Eliminate"
        subtitle="Eliminate 2 wrong answers"
        isVisible={openHelper["eliminate"]}
        onPressPlay={() => { }}
        onClose={() =>
          setOpenHelper({ eliminate: false, double: false, change: false })
        }
        imageName="eliminate"
      />
      <HelpModalPage
        title="Double Chance"
        subtitle="Get 2 choices to answer"
        isVisible={openHelper["double"]}
        onPressPlay={() => { }}
        onClose={() =>
          setOpenHelper({ eliminate: false, double: false, change: false })
        }
        imageName="double"
      />
      <HelpModalPage
        title="Change Question"
        subtitle="Change to a new question"
        isVisible={openHelper["change"]}
        onPressPlay={() => { }}
        onClose={() =>
          setOpenHelper({ eliminate: false, double: false, change: false })
        }
        imageName="change"
      />
      <PremadeMessagesModal
        isVisible={isPremadeModalVisible}
        onClose={() => setIsPremadeModalVisible(false)}
        messages={premadeMessages}
        onUpdateMessages={handleUpdatePremadeMessages}
        onSelect={handleSelectPremadeMessage}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  body: {
    color: "white",
  },
  code_inline: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#3e3e3cff",
    padding: 8,
    borderRadius: 4,
    lineHeight: 40,
  },
});