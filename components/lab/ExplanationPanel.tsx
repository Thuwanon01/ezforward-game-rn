import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  HandThumbDownIcon,
  HandThumbUpIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
} from "react-native-heroicons/solid";
import Markdown from "react-native-markdown-display";
import HelpModalPage from "./HelpModalPage";
import IconButton from "./IconButton";
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

// ---เพิ่ม Interface สำหรับ Chat และ Feedback ---
interface ChatMessage {
  id: number;
  sender: "user" | "bot";
  text: string;
}

interface Feedback {
  id: number;
  messageId: number;
  userId: number;
  type: FeedbackState;
}
type FeedbackState = "like" | "dislike";

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
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  // เรียกใช้ Repository ผ่าน Hook
  const auth = useAuth();
  const repos = useRepositories(auth.accessToken).current;

  // (useEffect สำหรับโหลดข้อมูล)
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedChat = await AsyncStorage.getItem("chatHistory");
        const savedFeedback = (await AsyncStorage.getItem(
          "explanationFeedback"
        )) as FeedbackState;
        if (savedChat) {
          setChatHistory(JSON.parse(savedChat));
        }
        if (savedFeedback) {
          setFeedback(savedFeedback);
        }
      } catch (error) {
        console.error("Failed to load data from storage", error);
      }
    };
    loadData();
  }, []);

  const toggleExplanation = () => {
    openExplanation ? setOpenExplanation(false) : setOpenExplanation(true);
  };
  console.log(openExplanation);

  // ---handleSendMessage ให้ใช้ Repository---
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: "user",
      text: inputValue,
    };
    const updatedChatHistory = [...chatHistory, userMessage];

    setChatHistory(updatedChatHistory);
    setInputValue("");
    setIsChatLoading(true);

    try {
      await AsyncStorage.setItem(
        "chatHistory",
        JSON.stringify(updatedChatHistory)
      );

      // --- ยิง API จริง ---
      // เรียกใช้ generateText จาก LLMRepository
      const response = await repos.llm.generateText(userMessage.text);

      // ดึงข้อความตอบกลับจาก response
      // !! สำคัญ: ปรับแก้ .text ให้ตรงกับ key ที่ Backend ส่งกลับมา !!
      const botResponseText = response.result;
      // --- สิ้นสุดการยิง API จริง ---

      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: botResponseText,
      };
      const finalChatHistory = [...updatedChatHistory, botMessage];

      setChatHistory(finalChatHistory);
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
    const updatedFeedback = feedback === newFeedback ? null : newFeedback;
    setFeedback(updatedFeedback);

    try {
      await AsyncStorage.setItem("explanationFeedback", updatedFeedback || "");
      console.log("Feedback saved:", updatedFeedback);
      // --- ยิง API เพื่อส่ง Report (ไม่รอคำตอบ) ---
      if (updatedFeedback) {
        // Use a type assertion to avoid TypeScript error if sendFeedback doesn't exist on the LLM repository type.
        const llmRepo: any = repos.llm;

        // Build payload and include userId only when auth.user is available
        const payload: any = { type: updatedFeedback };
        if (
          auth &&
          auth.user &&
          typeof auth.user.id !== "undefined" &&
          auth.user !== null
        ) {
          payload.userId = auth.user.id;
        }

        if (typeof llmRepo?.sendFeedback === "function") {
          await llmRepo.sendFeedback(payload);
        } else if (typeof llmRepo?.reportFeedback === "function") {
          // fallback if the repository exposes a differently named method
          await llmRepo.reportFeedback(payload);
        } else {
          console.warn(
            "LLM repository has no sendFeedback/reportFeedback method; skipping remote report."
          );
        }
      }
    } catch (error) {
      console.error("Failed to save feedback:", error);
    }
  };

  // --- ฟังก์ชันสำหรับ Render Chat ---
  const renderChatItem = ({ item }: { item: ChatMessage }) => (
    <View
      className={`p-3 rounded-lg my-1 max-w-[85%] ${
        item.sender === "bot"
          ? "bg-gray-700 self-start"
          : "bg-blue-600 self-end"
      }`}
    >
      <Text className="text-white text-base">{item.text}</Text>
    </View>
  );

  return (
    //All box of footer
<<<<<<< HEAD
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="bg-[#27548A] rounded-t-xl">
=======
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView className='bg-[#27548A] rounded-t-xl'>

>>>>>>> 868ced6278439961ce5389c5f4aed76f390631c4
        {/* Condition to show pop-up arrow */}
        {explanationStatus && (
          <View className="flex-row justify-center mt-[12]">
            {openExplanation ? (
              <IconButton
                iconImage="downArrow"
                onPress={toggleExplanation}
                isDisable={false}
              />
            ) : (
              <IconButton
                iconImage="upArrow"
                onPress={toggleExplanation}
                isDisable={false}
              />
            )}
          </View>
        )}

        {/* Text explanation */}
        {explanationStatus && openExplanation && (
          <View className="mx-[40]">
            <View>
              <Text className="text-green-500 text-2xl">{correctAnswer}</Text>
              {/* <Text className="text-white text-lg">{`  - ${correctExplanation}`}</Text> */}
              <Markdown style={styles}>{correctExplanation}</Markdown>

              {gameState === "incorrect" && (
                <>
                  <Text className="text-red-500 text-2xl">
                    {incorrectAnswer}
                  </Text>
                  {/* <Text className="text-white text-lg">{`  - ${incorrectExplanation}`}</Text> */}
                  <Markdown style={styles}>{incorrectExplanation}</Markdown>
                </>
              )}

              {/* --- เพิ่ม UI ส่วนใหม่เข้ามาที่นี่ --- */}
              <View className="mt-6 border-t border-gray-500 pt-4">
                <FlatList
                  data={chatHistory}
                  renderItem={renderChatItem}
                  keyExtractor={(item) => item.id.toString()}
                  className="max-h-48 mb-2"
                />

                {isChatLoading && (
                  <ActivityIndicator color="white" className="my-2" />
                )}

                <View className="flex-row items-center bg-gray-700 rounded-full p-2">
                  <MagnifyingGlassIcon
                    color="white"
                    size={24}
                    style={{ marginLeft: 8 }}
                  />
                  <TextInput
                    className="flex-1 text-white text-lg px-3"
                    placeholder="Ask something..."
                    placeholderTextColor="#9ca3af"
                    value={inputValue}
                    onChangeText={setInputValue}
                    editable={!isChatLoading}
                  />
                  <TouchableOpacity
                    onPress={handleSendMessage}
                    disabled={isChatLoading}
                    className="p-2 bg-blue-600 rounded-full"
                  >
                    <PaperAirplaneIcon color="white" size={24} />
                  </TouchableOpacity>
                </View>

                <View className="flex-row items-center justify-end mt-4 space-x-4">
                  <TouchableOpacity onPress={() => handleFeedback("like")}>
                    <HandThumbUpIcon
                      color={feedback === "like" ? "#22c55e" : "white"}
                      size={28}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleFeedback("dislike")}>
                    <HandThumbDownIcon
                      color={feedback === "dislike" ? "#ef4444" : "white"}
                      size={28}
                    />
                  </TouchableOpacity>
                </View>

                <View className="h-[8]"></View>
                {/* <Text className="text-white font-bold ">{explanation}</Text> */}
                <Markdown style={styles}>{explanation}</Markdown>
              </View>
            </View>
          </View>
        )}

        {/* Icon and button  */}
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

        {/* Modal page */}
<<<<<<< HEAD
        <HelpModalPage
          title="Eliminate"
          subtitle="Eliminate 2 wrong answers"
          isVisible={openHelper["eliminate"]}
          onPressPlay={() => {}}
          onClose={() =>
            setOpenHelper({ eliminate: false, double: false, change: false })
          }
          imageName="eliminate"
        ></HelpModalPage>
        <HelpModalPage
          title="Double Chance"
          subtitle="Get 2 choices to answer"
          isVisible={openHelper["double"]}
          onPressPlay={() => {}}
          onClose={() =>
            setOpenHelper({ eliminate: false, double: false, change: false })
          }
          imageName="double"
        ></HelpModalPage>
        <HelpModalPage
          title="Change Question"
          subtitle="Change to a new question"
          isVisible={openHelper["change"]}
          onPressPlay={() => {}}
          onClose={() =>
            setOpenHelper({ eliminate: false, double: false, change: false })
          }
          imageName="change"
        ></HelpModalPage>
      </View>
=======
        <HelpModalPage title='Eliminate' subtitle='Eliminate 2 wrong answers' isVisible={openHelper['eliminate']}
          onPressPlay={() => { }} onClose={() => setOpenHelper({ 'eliminate': false, 'double': false, 'change': false })} imageName='eliminate' ></HelpModalPage>
        <HelpModalPage title='Double Chance' subtitle='Get 2 choices to answer' isVisible={openHelper['double']}
          onPressPlay={() => { }} onClose={() => setOpenHelper({ 'eliminate': false, 'double': false, 'change': false })} imageName='double' ></HelpModalPage>
        <HelpModalPage title='Change Question' subtitle='Change to a new question' isVisible={openHelper['change']}
          onPressPlay={() => { }} onClose={() => setOpenHelper({ 'eliminate': false, 'double': false, 'change': false })} imageName='change' ></HelpModalPage>
      </ScrollView>
>>>>>>> 868ced6278439961ce5389c5f4aed76f390631c4
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
