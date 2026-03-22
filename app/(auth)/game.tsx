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
import { Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const HELPER_ELIMINATE = "eliminate";
const HELPER_DOUBLE = "double";

function pickTwoRandomChoiceIds(choiceIds: number[]): number[] {
  if (choiceIds.length <= 2) {
    return [...choiceIds];
  }
  const shuffled = [...choiceIds];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 2);
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
  const [score, setScore] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<NewQuizChoice | null>(
    null
  );
  const timerRef = useRef<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);
  const [openMenu, setOpenMenu] = useState(false);

  const router = useRouter();

  const auth = useAuth();
  const repos = useRepositories(auth.accessToken).current;

  useEffect(() => {
    fetchData();
  }, []);

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

  const resetHelpersForNewQuestion = () => {
    setHelperStatus({ eliminate: false, double: false, change: false });
    setEliminatedChoiceIds([]);
    setDoubleSubmitPending(false);
    setAwaitingDoubleSecondPick(false);
  };

  const fetchData = async () => {
    const selectedSubject = await AsyncStorage.getItem("selectedSubject");
    const myLevelStr = await AsyncStorage.getItem("myLevel");
    const selectedTopicStr = await AsyncStorage.getItem("selectedTopic");

    const questionData = await repos.gamev2.fetchSuggestedQuestion(
      selectedSubject as string,
      myLevelStr as string,
      selectedTopicStr as string
    );
    console.log("Fetched question data:", questionData);
    setQuestion(questionData.question);
    setChoices(
      questionData.question.choicelist.map((choice) => ({
        ...choice,
        is_selected: false,
      }))
    );
    setCurrentQuestionIndex(questionData.progress.current);
    setStatus("wait");
    setGameState("wait");
    setExplanationStatus(false);
    setCorrectExplanation("");
    setIncorrectExplanation("");
    setAnswer(null);
    setSelectedChoice(null);
    resetHelpersForNewQuestion();
  };

  const handleConfirmEliminate = () => {
    if (!choices.length) return;
    const ids = pickTwoRandomChoiceIds(choices.map((c) => c.id));
    setEliminatedChoiceIds(ids);
    setHelperStatus((h) => ({ ...h, eliminate: true }));
  };

  const handleConfirmDouble = () => {
    setDoubleSubmitPending(true);
    setHelperStatus((h) => ({ ...h, double: true }));
  };

  const handleConfirmChange = () => {
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

    const answerData = await repos.gamev2.fetchSubmitAnswer(
      question.id as string,
      choiceId,
      0,
      0,
      useHelper,
      choiceCutting
    );
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
      setScore((s) => s + 1);
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
    await auth.logout();
    router.push("/login");
  };

  const settingHandler = () => {
    setOpenMenu(!openMenu);
  };

  const nextHandler = () => {
    fetchData();
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
        ></HeaderPanel>

        <View className="flex-row justify-end">
          <View className="flex-row mx-6 mt-4 bg-[#FCC61D] px-3 py-1 rounded-[20] border border-[#183B4E]/20">
            <Text className="text-xl font-bold text-[#183B4E]">{score}</Text>
          </View>
        </View>

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
                correctExplanation={correctExplanation}
                incorrectExplanation={incorrectExplanation}
              />
            );
          })}
        </View>
      </ScrollView>

      <View className="flex-shrink-0">
        <ExplanationPanel
          correctAnswer={correctAnswer}
          correctExplanation={correctExplanation}
          incorrectAnswer={incorrectAnswer}
          incorrectExplanation={incorrectExplanation}
          explanation={explanation}
          helperStatus={helperStatus}
          explanationStatus={explanationStatus}
          onPressNext={nextHandler}
          gameState={gameState}
          questionIndex={currentQuestionIndex}
          question={question}
          selectedChoice={selectedChoice}
          onConfirmEliminate={handleConfirmEliminate}
          onConfirmDouble={handleConfirmDouble}
          onConfirmChange={handleConfirmChange}
        />
      </View>
    </View>
  );
}
