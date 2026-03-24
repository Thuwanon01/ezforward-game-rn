import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { HandThumbDownIcon, HandThumbUpIcon, PaperAirplaneIcon, PlusCircleIcon } from "react-native-heroicons/solid";
import Markdown from 'react-native-markdown-display';
import HelpModalPage from './HelpModalPage';
import IconButton from './IconButton';
import PremadeMessagesModal from './PremadeMessagesModal';
import TextButton from './TextButton';

// Import Hook สำหรับ Repository และ Auth (จำเป็น)
import { NewQuizChoice, QuizQuestionResponse } from "@/apis/types";
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
  question?: QuizQuestionResponse | null;
  selectedChoice?: NewQuizChoice | null;
  score?: number;
  questionIndex: number;
  onConfirmEliminate?: () => void;
  onConfirmDouble?: () => void;
  onConfirmChange?: () => void;
  /** Which lifeline was used this 10-question session (only one allowed per session). */
  sessionHelperUsed?: "eliminate" | "double" | "change" | null;
  sessionTotal?: number;
  isFetching?: boolean;
}

interface ChatMessage {
  id: number;
  sender: "user" | "bot";
  text: string;
}

type FeedbackState = 'like' | 'dislike' | null;

const PREMADE_MESSAGES_STORAGE_KEY = "premadeMessages";
const DEFAULT_PREMADE_MESSAGES = [
  "ช่วยอธิบายพร้อมยกตัวอย่าง",
  "อธิบายให้เด็ก 5 ขวบเข้าใจ",
  "ช่วยอธิบายแบบสั้น ๆ",
];

/** Flip to true when Double Chance + Change Question are production-ready. */
const SHOW_DOUBLE_AND_CHANGE_HELPERS = false;

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
  question,
  selectedChoice,
  score,
  questionIndex,
  onConfirmEliminate,
  onConfirmDouble,
  onConfirmChange,
  sessionHelperUsed = null,
  sessionTotal = 10,
  isFetching = false,
}: Props) {
  const helpersLocked =
    !!sessionHelperUsed ||
    helperStatus.eliminate ||
    helperStatus.double ||
    helperStatus.change;

  const helperFooterLabel = (): string => {
    if (sessionHelperUsed === "eliminate") {
      return "Eliminate used — 1 helper per session";
    }
    if (sessionHelperUsed === "double") {
      return "Double chance used — 1 helper per session";
    }
    if (sessionHelperUsed === "change") {
      return "Change question used — 1 helper per session";
    }
    if (helperStatus.eliminate) return "Eliminate used";
    if (helperStatus.double) return "Double chance used";
    if (helperStatus.change) return "Change question used";
    return "";
  };

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
  const [isPremadeModalVisible, setIsPremadeModalVisible] = useState(false);
  const [premadeMessages, setPremadeMessages] = useState<string[]>([]);



  const auth = useAuth();
  const repos = useRepositories(auth.accessToken).current;

  // โหลดแค่ premade messages (chat history จะถูก clear ทุกครั้งที่ question เปลี่ยน)
  useEffect(() => {
    const loadPremadeMessages = async () => {
      try {
        const saved = await AsyncStorage.getItem(PREMADE_MESSAGES_STORAGE_KEY);
        if (saved) {
          setPremadeMessages(JSON.parse(saved));
        } else {
          setPremadeMessages(DEFAULT_PREMADE_MESSAGES);
        }
      } catch (error) {
        console.error("Failed to load premade messages", error);
      }
    };
    loadPremadeMessages();
  }, []);


  // --- เพิ่ม useEffect ใหม่สำหรับเคลียร์ข้อมูล ---
  // useEffect นี้จะทำงาน "ทุกครั้งที่คำถามเปลี่ยนไป"
  useEffect(() => {
    const clearChatData = async () => {
      console.log("New question detected, clearing chat history...");
      // เคลียร์ State ของ chat
      setChatHistory([]);
      setFeedback(null);
      setInputValue('');

      // เคลียร์ข้อมูลใน AsyncStorage
      try {
        await AsyncStorage.removeItem('chatHistory');
        await AsyncStorage.removeItem('explanationFeedback');
      } catch (error) {
        console.error("Failed to clear data from storage", error);
      }
    };

    clearChatData();

    // ใส่ props ที่ใช้ระบุคำถามปัจจุบันใน dependency array
    // เพื่อให้ useEffect นี้ทำงานเมื่อ props เหล่านี้เปลี่ยนค่า (เมื่อไปข้อใหม่)
  }, [explanation, correctAnswer]);

  const toggleExplanation = () => {
    setOpenExplanation(!openExplanation);
  };


  const buildContextPrompt = (userMessage: string): string => {
    let context = "";
    if (question) {
      context += `Question: ${question.text}\n\n`;
    }
    if (selectedChoice) {
      context += `Your selected choice: ${selectedChoice.text}\n\n`;
    }
    if (explanationStatus && openExplanation) {
      context += `Correct Answer: ${correctAnswer}\nExplanation: ${correctExplanation}\n`;
      if (gameState === 'incorrect') {
        context += `Incorrect Answer: ${incorrectAnswer}\nExplanation: ${incorrectExplanation}\n`;
      }
      context += `Overall Explanation: ${explanation}\n\n`;
    }
    context += `User's question: ${userMessage}`;
    return context;
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


    try {
      await AsyncStorage.setItem(
        "chatHistory",
        JSON.stringify(updatedChatHistory)
      );

      const contextPrompt = buildContextPrompt(inputValue);
      console.log("Context prompt being sent to LLM:", contextPrompt);

      const response = await repos.llm.generateText(contextPrompt);
      const botResponseText = response.result;

      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: botResponseText,
      };
      const finalChatHistory = [...updatedChatHistory, botMessage];

      setChatHistory(finalChatHistory);


      await AsyncStorage.setItem('chatHistory', JSON.stringify(finalChatHistory));

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


  const handleFeedback = async (newFeedback: 'like' | 'dislike') => {


    const updatedFeedback = feedback === newFeedback ? null : newFeedback;
    setFeedback(updatedFeedback);

    try {
      if (updatedFeedback) {
        await AsyncStorage.setItem('explanationFeedback', updatedFeedback);
      } else {
        await AsyncStorage.removeItem('explanationFeedback');
      }
      console.log("Feedback saved:", updatedFeedback);
      if (updatedFeedback) {
        const llmRepo: any = repos.llm;
        const payload: any = { type: updatedFeedback };
        if (auth && auth.user && typeof auth.user.id !== 'undefined' && auth.user !== null) {
          payload.userId = auth.user.id;
        }

        if (typeof llmRepo?.sendFeedback === 'function') {
          await llmRepo.sendFeedback(payload);
        } else if (typeof llmRepo?.reportFeedback === 'function') {
          await llmRepo.reportFeedback(payload);
        } else {
          console.warn('LLM repository has no sendFeedback/reportFeedback method; skipping remote report.');
        }
      }
    } catch (error) {
      console.error("Failed to save feedback:", error);
    }
  };

  // (ฟังก์ชัน Premade Message)
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
    <ScrollView style={{ maxHeight: 800 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={panelStyles.container}>

          {/* ── WAIT STATE: Lifeline buttons ── */}
          {gameState === "wait" && (
            <View style={panelStyles.lifelineArea}>
              <View style={panelStyles.lifelineRow}>
                <TouchableOpacity
                  style={[
                    panelStyles.lifelineBtn,
                    (helpersLocked) && panelStyles.lifelineBtnUsed,
                  ]}
                  onPress={() => setOpenHelper({ eliminate: true, double: false, change: false })}
                  disabled={helpersLocked}
                >
                  <Text style={panelStyles.lifelineIcon}>✂️</Text>
                  <Text style={panelStyles.lifelineLabel}>ELIMINATE</Text>
                </TouchableOpacity>

                {SHOW_DOUBLE_AND_CHANGE_HELPERS && (
                  <>
                    <TouchableOpacity
                      style={[panelStyles.lifelineBtn, helpersLocked && panelStyles.lifelineBtnUsed]}
                      onPress={() => setOpenHelper({ eliminate: false, double: true, change: false })}
                      disabled={helpersLocked}
                    >
                      <Text style={panelStyles.lifelineIcon}>2️⃣</Text>
                      <Text style={panelStyles.lifelineLabel}>DOUBLE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[panelStyles.lifelineBtn, helpersLocked && panelStyles.lifelineBtnUsed]}
                      onPress={() => setOpenHelper({ eliminate: false, double: false, change: true })}
                      disabled={helpersLocked}
                    >
                      <Text style={panelStyles.lifelineIcon}>🔀</Text>
                      <Text style={panelStyles.lifelineLabel}>CHANGE</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
              {helpersLocked && (
                <Text style={panelStyles.lifelineUsedLabel}>{helperFooterLabel()}</Text>
              )}
            </View>
          )}

          {/* ── ANSWERED STATE: Result + Explanation + Next ── */}
          {gameState !== "wait" && questionIndex <= sessionTotal && (
            <View style={panelStyles.resultArea}>

              {/* Result badge */}
              <View style={[
                panelStyles.resultBadge,
                gameState === 'correct' ? panelStyles.resultBadgeCorrect : panelStyles.resultBadgeIncorrect,
              ]}>
                <Text style={panelStyles.resultIcon}>
                  {gameState === 'correct' ? '✅' : '❌'}
                </Text>
                <View>
                  <Text style={panelStyles.resultLabel}>
                    {gameState === 'correct' ? 'Correct!' : 'Incorrect'}
                  </Text>
                  <Text style={panelStyles.resultAnswer}>
                    {gameState === 'correct'
                      ? correctAnswer
                      : `Correct: ${correctAnswer}`}
                  </Text>
                </View>
              </View>

              {/* Explanation toggle (chat / extra context) */}
              {explanationStatus && (
                <TouchableOpacity style={panelStyles.explanationToggle} onPress={toggleExplanation}>
                  <Text style={panelStyles.explanationToggleText}>
                    💬 {openExplanation ? 'Hide chat' : 'Ask AI about this question'}
                  </Text>
                  <Text style={panelStyles.explanationChevron}>
                    {openExplanation ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Chat section */}
              {explanationStatus && openExplanation && (
                <View style={panelStyles.explanationBody}>
                  <View style={panelStyles.chatSection}>
                    {chatHistory.map((item) => (
                      <React.Fragment key={item.id}>
                        {renderChatItem({ item })}
                      </React.Fragment>
                    ))}

                    {isChatLoading && (
                      <ActivityIndicator color="white" style={{ marginVertical: 8 }} />
                    )}

                    {/* Chat Input Bar */}
                    <View style={panelStyles.chatInputBar}>
                      <TouchableOpacity onPress={() => setIsPremadeModalVisible(true)} style={{ padding: 8 }}>
                        <PlusCircleIcon color="white" size={28} />
                      </TouchableOpacity>
                      <TextInput
                        style={panelStyles.chatInput}
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
                        style={panelStyles.chatSendBtn}
                      >
                        <PaperAirplaneIcon color="white" size={24} />
                      </TouchableOpacity>
                    </View>

                    {/* Feedback Buttons */}
                    <View style={panelStyles.feedbackRow}>
                      <TouchableOpacity onPress={() => handleFeedback("like")}>
                        <HandThumbUpIcon color={feedback === "like" ? "#22c55e" : "white"} size={28} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleFeedback("dislike")}>
                        <HandThumbDownIcon color={feedback === "dislike" ? "#ef4444" : "white"} size={28} />
                      </TouchableOpacity>
                    </View>

                  </View>
                </View>
              )}

              {/* Next button */}
              <TouchableOpacity
                style={[panelStyles.nextBtn, isFetching && panelStyles.nextBtnDisabled]}
                onPress={onPress}
                disabled={isFetching}
              >
                <Text style={[panelStyles.nextBtnText, isFetching && panelStyles.nextBtnTextDisabled]}>
                  Next Question →
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {/* ย้าย Modals มาไว้ที่นี่ (นอก ScrollView แต่ใน KAV) */}
          <HelpModalPage
            title="Eliminate"
            subtitle="Eliminate 2 wrong answers"
            isVisible={openHelper["eliminate"]}
            onPressPlay={() => {
              onConfirmEliminate?.();
              setOpenHelper({ eliminate: false, double: false, change: false });
            }}
            onClose={() =>
              setOpenHelper({ eliminate: false, double: false, change: false })
            }
            imageName="eliminate"
          />
          {SHOW_DOUBLE_AND_CHANGE_HELPERS && (
            <>
              <HelpModalPage
                title="Double Chance"
                subtitle="Get 2 choices to answer"
                isVisible={openHelper["double"]}
                onPressPlay={() => {
                  onConfirmDouble?.();
                  setOpenHelper({ eliminate: false, double: false, change: false });
                }}
                onClose={() =>
                  setOpenHelper({ eliminate: false, double: false, change: false })
                }
                imageName="double"
              />
              <HelpModalPage
                title="Change Question"
                subtitle="Change to a new question"
                isVisible={openHelper["change"]}
                onPressPlay={() => {
                  onConfirmChange?.();
                  setOpenHelper({ eliminate: false, double: false, change: false });
                }}
                onClose={() =>
                  setOpenHelper({ eliminate: false, double: false, change: false })
                }
                imageName="change"
              />
            </>
          )}
          <PremadeMessagesModal
            isVisible={isPremadeModalVisible}
            onClose={() => setIsPremadeModalVisible(false)}
            messages={premadeMessages}
            onUpdateMessages={handleUpdatePremadeMessages}
            onSelect={handleSelectPremadeMessage}
          />
        </View>
      </KeyboardAvoidingView>
    </ScrollView >
  )
}

const panelStyles = StyleSheet.create({
  container: {
    backgroundColor: '#183B4E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  // ── Wait state ──
  lifelineArea: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  lifelineRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  lifelineBtn: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  lifelineBtnUsed: {
    opacity: 0.35,
  },
  lifelineIcon: {
    fontSize: 22,
  },
  lifelineLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.4,
  },
  lifelineUsedLabel: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
  },
  // ── Answered state ──
  resultArea: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 10,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    marginBottom: 2,
  },
  resultBadgeCorrect: {
    backgroundColor: 'rgba(52,211,153,0.15)',
  },
  resultBadgeIncorrect: {
    backgroundColor: 'rgba(248,113,113,0.15)',
  },
  resultIcon: {
    fontSize: 20,
  },
  resultLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: 'white',
  },
  resultAnswer: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 1,
  },
  explanationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
  },
  explanationToggleText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
  },
  explanationChevron: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  explanationBody: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
  },
  chatSection: {
    gap: 4,
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 8,
    marginTop: 8,
  },
  chatInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    paddingHorizontal: 8,
    maxHeight: 120,
  },
  chatSendBtn: {
    padding: 8,
    backgroundColor: '#2563eb',
    borderRadius: 999,
  },
  feedbackRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  nextBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#FCC61D',
    alignItems: 'center',
    shadowColor: '#FCC61D',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    marginTop: 4,
    marginBottom: 8,
  },
  nextBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#183B4E',
  },
  nextBtnTextDisabled: {
    color: 'rgba(255,255,255,0.4)',
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    color: 'white',
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