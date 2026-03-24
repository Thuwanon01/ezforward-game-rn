import {
  NewQuizChoice,
  QuizAnswerResponse,
  QuizQuestionResponse,
} from "@/apis/types";
import ChoiceBox from "@/components/lab/ChoiceBox";
import ExplanationPanel from "@/components/lab/ExplanationPanel";
import HeaderPanel from "@/components/lab/HeaderPanel";
import QuestionBox from "@/components/lab/QuestionBox";
import { useAuth } from "@/contexts/AuthContext";
import useRepositories from "@/hooks/useRepositories";
import { playSound } from "@/utils/sound";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const HELPER_ELIMINATE = "eliminate";
const HELPER_DOUBLE = "double";

type SessionHelperKind = "eliminate" | "double" | "change";

const GAME_SESSION_STORAGE_KEY = "ezram_game_session_v1";

type PersistedGameSession = {
  learningPlanId: number;
  sessionScore: number;
  sessionHelperUsed: SessionHelperKind | null;
  sessionTotal: number;
};

function parsePersistedGameSession(
  raw: string | null
): PersistedGameSession | null {
  if (raw == null) return null;
  try {
    const o = JSON.parse(raw) as Record<string, unknown>;
    if (typeof o.learningPlanId !== "number") return null;
    if (typeof o.sessionScore !== "number" || o.sessionScore < 0) return null;
    if (typeof o.sessionTotal !== "number" || o.sessionTotal < 1) return null;
    const h = o.sessionHelperUsed;
    if (
      h !== null &&
      h !== "eliminate" &&
      h !== "double" &&
      h !== "change"
    ) {
      return null;
    }
    return {
      learningPlanId: o.learningPlanId,
      sessionScore: o.sessionScore,
      sessionTotal: o.sessionTotal,
      sessionHelperUsed: h as SessionHelperKind | null,
    };
  } catch {
    return null;
  }
}

async function loadPersistedGameSession(): Promise<PersistedGameSession | null> {
  const raw = await AsyncStorage.getItem(GAME_SESSION_STORAGE_KEY);
  return parsePersistedGameSession(raw);
}

async function savePersistedGameSession(
  state: PersistedGameSession
): Promise<void> {
  await AsyncStorage.setItem(GAME_SESSION_STORAGE_KEY, JSON.stringify(state));
}

async function clearPersistedGameSession(): Promise<void> {
  await AsyncStorage.removeItem(GAME_SESSION_STORAGE_KEY);
}

/**
 * Pick IDs to eliminate. Always ensures at least 2 choices remain visible.
 * NOTE: correct answer may still be picked since we don't know it before submitting.
 * The server validates the final answer regardless.
 */
function pickTwoRandomChoiceIds(choiceIds: number[]): number[] {
  // Need at least 3 choices: 2 to eliminate + 1 remaining for user to pick.
  // We target leaving at least 2 visible, so need at least 4.
  // If not enough, eliminate min(count - 2, 2) and never leave 0 choices.
  const maxToEliminate = Math.max(0, choiceIds.length - 2);
  if (maxToEliminate === 0) return [];
  const toEliminate = Math.min(2, maxToEliminate);
  const shuffled = [...choiceIds];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, toEliminate);
}

export default function GamePage() {
  const [helperStatus, setHelperStatus] = useState({
    eliminate: false,
    double: false,
    change: false,
  });
  /** Choice ids hidden after Eliminate helper (not sent as the user's answer). */
  const [eliminatedChoiceIds, setEliminatedChoiceIds] = useState<number[]>([]);
  /** Next answer submission should record Double lifeline (first attempt only). */
  const [doubleSubmitPending, setDoubleSubmitPending] = useState(false);
  /** After a wrong answer while double was used, allow one more pick on the same question. */
  const [awaitingDoubleSecondPick, setAwaitingDoubleSecondPick] = useState(false);

  const [explanationStatus, setExplanationStatus] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [correctExplanation, setCorrectExplanation] = useState("");
  const [incorrectAnswer, setIncorrectAnswer] = useState("");
  const [incorrectExplanation, setIncorrectExplanation] = useState("");
  const [explanation, setExplanation] = useState("");
  const [status, setStatus] = useState("wait");
  const [question, setQuestion] = useState<QuizQuestionResponse | null>(null);
  const [choices, setChoices] = useState<NewQuizChoice[]>([]);
  const [answer, setAnswer] = useState<QuizAnswerResponse | null>(null);
  const [gameState, setGameState] = useState<"wait" | "correct" | "incorrect">(
    "wait"
  );
  /** Correct answers in the current session only (resets after summary or new session). */
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(10);
  const [sessionCompleteModalVisible, setSessionCompleteModalVisible] =
    useState(false);
  const [selectedChoice, setSelectedChoice] = useState<NewQuizChoice | null>(
    null
  );
  const timerRef = useRef<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);
  const [openMenu, setOpenMenu] = useState(false);
  /** At most one lifeline per 10-question session; resets when `learning_plan_id` changes. */
  const [sessionHelperUsed, setSessionHelperUsed] =
    useState<SessionHelperKind | null>(null);
  const learningPlanIdRef = useRef<number | null>(null);
  const [noContentModalVisible, setNoContentModalVisible] = useState(false);
  const noContentRedirectRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [isFetching, setIsFetching] = useState(false);

  const router = useRouter();

  const auth = useAuth();
  const repos = useRepositories(auth.accessToken).current;

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (noContentRedirectRef.current) {
        clearTimeout(noContentRedirectRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const planId = learningPlanIdRef.current;
    if (planId == null) return;
    void savePersistedGameSession({
      learningPlanId: planId,
      sessionScore,
      sessionHelperUsed,
      sessionTotal,
    });
  }, [sessionScore, sessionHelperUsed, sessionTotal]);

  const handleQuestionPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setStatus("wait");

    setTimeout(() => {
      setStatus("reading");

      timerRef.current = setTimeout(() => {
        setStatus("wait");
      }, 8500);
    }, 10);
  };

  /** Clears per-question helper UI; does not clear `sessionHelperUsed`. */
  const resetPerQuestionHelperState = () => {
    setHelperStatus({ eliminate: false, double: false, change: false });
    setEliminatedChoiceIds([]);
    setDoubleSubmitPending(false);
    setAwaitingDoubleSecondPick(false);
  };

  /**
   * No quiz data for this topic+level (e.g. API 500). Show a short message, then return to selection.
   */
  const goBackToSubjectAfterQuestionError = () => {
    setNoContentModalVisible(true);
    if (noContentRedirectRef.current) {
      clearTimeout(noContentRedirectRef.current);
    }
    noContentRedirectRef.current = setTimeout(() => {
      noContentRedirectRef.current = null;
      setNoContentModalVisible(false);
      router.replace("/subject");
    }, 3000);
  };

  const fetchData = async () => {
    setIsFetching(true);
    const selectedSubject = await AsyncStorage.getItem("selectedSubject");
    const myLevelStr = await AsyncStorage.getItem("myLevel");
    const selectedTopicStr = await AsyncStorage.getItem("selectedTopic");

    let questionData: Awaited<
      ReturnType<typeof repos.gamev2.fetchSuggestedQuestion>
    >;
    try {
      questionData = await repos.gamev2.fetchSuggestedQuestion(
        selectedSubject as string,
        myLevelStr as string,
        selectedTopicStr as string
      );
    } catch {
      setIsFetching(false);
      goBackToSubjectAfterQuestionError();
      return;
    }
    console.log("Fetched question data:", questionData);

    const planId = questionData.learning_plan_id;
    const prevPlanId = learningPlanIdRef.current;
    const persisted = await loadPersistedGameSession();

    if (prevPlanId !== null && planId !== prevPlanId) {
      await clearPersistedGameSession();
      setSessionHelperUsed(null);
      setSessionScore(0);
    } else if (persisted?.learningPlanId === planId) {
      setSessionScore(persisted.sessionScore);
      setSessionHelperUsed(persisted.sessionHelperUsed);
    } else {
      setSessionHelperUsed(null);
      setSessionScore(0);
    }

    learningPlanIdRef.current = planId;

    setQuestion(questionData.question);
    setChoices(
      questionData.question.choicelist.map((choice) => ({
        ...choice,
        is_selected: false,
      }))
    );
    setCurrentQuestionIndex(questionData.progress.current);
    setSessionTotal(questionData.progress.total);
    setStatus("wait");
    setGameState("wait");
    setExplanationStatus(false);
    setCorrectExplanation("");
    setIncorrectExplanation("");
    setAnswer(null);
    setSelectedChoice(null);
    resetPerQuestionHelperState();
    setIsFetching(false);
  };

  const handleConfirmEliminate = () => {
    if (sessionHelperUsed) return;
    if (choices.length <= 2) return; // not enough choices to safely eliminate
    const ids = pickTwoRandomChoiceIds(choices.map((c) => c.id));
    if (ids.length === 0) return;
    setEliminatedChoiceIds(ids);
    setSessionHelperUsed("eliminate");
    setHelperStatus((h) => ({ ...h, eliminate: true }));
  };

  const handleConfirmDouble = () => {
    if (sessionHelperUsed) return;
    setSessionHelperUsed("double");
    setDoubleSubmitPending(true);
    setHelperStatus((h) => ({ ...h, double: true }));
  };

  const handleConfirmChange = () => {
    if (sessionHelperUsed) return;
    setSessionHelperUsed("change");
    setHelperStatus((h) => ({ ...h, change: true }));
    void fetchData();
  };

  const handleSubmitAnswer = async (choiceId: any, index: any) => {
    if (!question) return;

    const useHelper: string[] = [];
    if (doubleSubmitPending) {
      useHelper.push(HELPER_DOUBLE);
      setDoubleSubmitPending(false);
    }
    if (eliminatedChoiceIds.length > 0) {
      useHelper.push(HELPER_ELIMINATE);
    }

    const choiceCutting = eliminatedChoiceIds.map(String);

    let answerData: Awaited<ReturnType<typeof repos.gamev2.fetchSubmitAnswer>>;
    try {
      answerData = await repos.gamev2.fetchSubmitAnswer(
        question.id as string,
        choiceId,
        0,
        0,
        useHelper,
        choiceCutting
      );
    } catch (error) {
      console.error("Failed to submit answer:", error);
      return;
    }
    console.log("Submitted answer data:", answerData);
    setExplanationStatus(true);
    setAnswer(answerData);

    const newChoices = [...choices];
    newChoices[index].is_selected = true;
    setChoices(newChoices);

    setSelectedChoice(newChoices[index]);

    const selectedWithServer = answerData.choices.find(
      (choice) => choice.id === choiceId
    );
    const isCorrect = !!selectedWithServer?.is_correct;

    if (isCorrect) {
      setGameState("correct");
      setStatus("correct");
      setSessionScore((s) => s + 1);
      playSound("yessound.mp3");
    } else {
      const usedDoubleThisRound =
        useHelper.includes(HELPER_DOUBLE) || awaitingDoubleSecondPick;

      if (usedDoubleThisRound && !awaitingDoubleSecondPick) {
        setAwaitingDoubleSecondPick(true);
        setExplanationStatus(false);
        setAnswer(null);
        setChoices((prev) =>
          prev.map((c) => ({ ...c, is_selected: false }))
        );
        setGameState("wait");
        setStatus("wait");
        setCorrectAnswer("");
        setIncorrectAnswer("");
        setCorrectExplanation("");
        setIncorrectExplanation("");
        setExplanation("");
        playSound("alarm.mp3");
        return;
      }

      setGameState("incorrect");
      setStatus("incorrect");
      playSound("alarm.mp3");
    }

    setAwaitingDoubleSecondPick(false);

    const incorrectUserChoice = newChoices.find(
      (c) => c.is_selected && !answerData.choices.find((ac) => ac.id === c.id)?.is_correct
    );
    const incorrectChoiceId = incorrectUserChoice?.id;

    setCorrectAnswer(
      answerData.choices.find((c) => c.is_correct)?.text ?? ""
    );
    setCorrectExplanation(
      answerData.choices.find((c) => c.is_correct)?.explanation ?? ""
    );
    setIncorrectAnswer(incorrectUserChoice?.text ?? "");
    setIncorrectExplanation(
      incorrectChoiceId != null
        ? answerData.choices.find((c) => c.id === incorrectChoiceId)?.explanation ??
          ""
        : ""
    );
    setExplanation(answerData.explanation);
  };

  const handleSelectChoice = (choiceId: number) => {
    if (answer?.choices.find((choice) => choice.id === choiceId)?.is_correct)
      return "correct";
    else if (
      choices.find((choice) => choice.id === choiceId)?.is_selected &&
      !answer?.choices.find((choice) => choice.id === choiceId)?.is_correct
    )
      return "incorrect";
    else {
      return "wait";
    }
  };

  const logOutHandler = async () => {
    await clearPersistedGameSession();
    learningPlanIdRef.current = null;
    await auth.logout();
    router.push("/login");
  };

  const settingHandler = () => {
    setOpenMenu(!openMenu);
  };

  const nextHandler = () => {
    if (
      sessionTotal > 0 &&
      currentQuestionIndex >= sessionTotal
    ) {
      setSessionCompleteModalVisible(true);
      return;
    }
    fetchData();
  };

  const handleContinueNextSession = () => {
    setSessionCompleteModalVisible(false);
    setSessionScore(0);
    setSessionHelperUsed(null);
    void fetchData();
  };

  const handleBackToSubject = () => {
    setSessionCompleteModalVisible(false);
    setSessionScore(0);
    setSessionHelperUsed(null);
    router.push("/subject");
  };

  const visibleChoices = choices.filter(
    (c) => !eliminatedChoiceIds.includes(c.id)
  );

  return (
    <View className="flex-1 flex-col justify-between bg-[#fffac9]">
      <ScrollView className="flex-1">
        <HeaderPanel
          title={"GameMunMun"}
          onPressBack={logOutHandler}
          onPressMenu={settingHandler}
          openMenu={openMenu}
          questionIndex={currentQuestionIndex}
          sessionTotal={sessionTotal}
        />

        <QuestionBox
          question={question?.text || "Loading question..."}
          status={status}
          onPressQuestion={handleQuestionPress}
          questionIndex={currentQuestionIndex}
        />

        <View>
          {visibleChoices.map((choice) => {
            const index = choices.findIndex((c) => c.id === choice.id);
            return (
              <ChoiceBox
                key={choice.id}
                text={choice.text}
                status={handleSelectChoice(choice.id)}
                onPress={() => {
                  handleSubmitAnswer(choice.id, index);
                }}
                disabled={gameState !== "wait"}
                index={index}
              />
            );
          })}
        </View>
      </ScrollView>

      <Modal
        visible={noContentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-[#FFFDE8] rounded-2xl p-6 w-full max-w-sm border border-[#183B4E]/20 items-center">
            <Text className="text-xl font-bold text-center text-[#183B4E]">
              This topic and level aren&apos;t ready yet
            </Text>
            <Text className="text-base text-center text-[#183B4E]/80 mt-3 leading-6">
              We&apos;re still preparing questions for this combination. You&apos;ll
              return to the selection screen in a moment to choose something else.
            </Text>
            <ActivityIndicator
              style={{ marginTop: 20 }}
              color="#183B4E"
              size="small"
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={sessionCompleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleContinueNextSession}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-[#FFFDE8] rounded-2xl p-6 w-full max-w-sm border border-[#183B4E]/20">
            <Text className="text-2xl font-bold text-center text-[#183B4E]">
              Session complete
            </Text>
            <Text className="text-lg text-center text-[#183B4E]/80 mt-3">
              You got {sessionScore} out of {sessionTotal} correct.
            </Text>
            <TouchableOpacity
              onPress={handleContinueNextSession}
              className="mt-6 py-3 rounded-full bg-[#FCC61D] items-center border border-[#183B4E]/20"
            >
              <Text className="text-lg font-bold text-white">
                Continue playing
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleBackToSubject}
              className="mt-3 py-3 rounded-full bg-[#183B4E]/10 items-center"
            >
              <Text className="text-lg font-bold text-[#183B4E]">
                Back to select subject
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View className="flex-shrink-0">
        <ExplanationPanel
          correctAnswer={correctAnswer}
          correctExplanation={correctExplanation}
          incorrectAnswer={incorrectAnswer}
          incorrectExplanation={incorrectExplanation}
          explanation={explanation}
          helperStatus={helperStatus}
          sessionHelperUsed={sessionHelperUsed}
          explanationStatus={explanationStatus}
          onPressNext={nextHandler}
          gameState={gameState}
          questionIndex={currentQuestionIndex}
          question={question}
          selectedChoice={selectedChoice}
          sessionTotal={sessionTotal}
          isFetching={isFetching}
          onConfirmEliminate={handleConfirmEliminate}
          onConfirmDouble={handleConfirmDouble}
          onConfirmChange={handleConfirmChange}
        />
      </View>
    </View>
  );
}
