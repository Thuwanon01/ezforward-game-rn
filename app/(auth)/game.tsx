import { NewQuizChoice, QuizAnswerResponse, QuizResponse } from "@/apis/types";
import ChoiceBox from "@/components/lab/ChoiceBox";
import ExplanationPanel from "@/components/lab/ExplanationPanel";
import HeaderPanel from "@/components/lab/HeaderPanel";
import QuestionBox from "@/components/lab/QuestionBox";
import { useAuth } from "@/contexts/AuthContext";
import useRepositories from "@/hooks/useRepositories";
import { playSound } from "@/utils/sound";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function GamePage() {
  const [helperStatus, setHelperStatus] = useState({
    eliminate: false,
    double: false,
    change: false,
  });
  const [explanationStatus, setExplanationStatus] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [correctExplanation, setCorrectExplanation] = useState("");
  const [incorrectAnswer, setIncorrectAnswer] = useState("");
  const [incorrectExplanation, setIncorrectExplanation] = useState("");
  const [explanation, setExplanation] = useState("");
  const [status, setStatus] = useState("wait");
  const [question, setQuestion] = useState<QuizResponse | null>(null);
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

  const router = useRouter();

  const auth = useAuth();
  const repos = useRepositories(auth.accessToken).current;

  useEffect(() => {
    fetchData();
  }, []);

  // สร้างฟังก์ชันที่จะส่งลงไปให้ QuestionBox
  const handleQuestionPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // ทำให้ state เปลี่ยนเสมอเพื่อ re-trigger speech
    // โดยการเซ็ตเป็น 'wait' ก่อน เพื่อให้ useEffect ใน QuestionBox ทำงาน (ส่วน cleanup) และหยุดเสียงพูดปัจจุบัน
    setStatus("wait");

    // ใช้ setTimeout เล็กน้อย (10ms) เพื่อให้ React อัปเดต UI เป็น 'wait' ก่อน
    // แล้วค่อยสั่งให้เป็น 'reading' อีกครั้ง
    setTimeout(() => {
      setStatus("reading");

      // เมื่อเข้าสู่สถานะ 'reading' แล้ว ให้ตั้ง Timer ใหม่เพื่อนับ 5 วินาที
      timerRef.current = setTimeout(() => {
        setStatus("wait"); // กลับเป็น wait หลังครบ 5 วิ
      }, 8500);
    }, 10);
  };

  const fetchData = async () => {
    // const questionData = await fetchRandomQuestion();
    const questionData = await repos.gamev2.fetchSuggestedQuestion();
    console.log("Fetched question data:", questionData);
    setQuestion(questionData);
    setChoices(
      questionData.choicelist.map((choice) => ({
        ...choice,
        is_selected: false,
      }))
    );
    setStatus("wait"); // เริ่มต้นด้วยสถานะ wait
    setGameState("wait");
    setExplanationStatus(false);
    setCorrectExplanation("");
    setIncorrectExplanation("");
  };

  const handleSubmitAnswer = async (choiceId: any, index: any) => {
    if (!question) return;
    const answerData = await repos.gamev2.fetchSubmitAnswer(
      question.id as string,
      choiceId,
      0,
      0,
      [],
      []
    );
    console.log("Submitted answer data:", answerData);
    setExplanationStatus(true);
    setAnswer(answerData);

    // Update choices to mark the selected one
    const newChoices = [...choices];
    newChoices[index].is_selected = true;
    setChoices(newChoices);

    // Track the selected choice for AI context
    setSelectedChoice(newChoices[index]);

    if (
      answerData.choices.find((choice) => choice.id === choiceId)?.is_correct
    ) {
      setGameState("correct");
      setStatus("correct");
      setScore(score + 1);
      playSound("yessound.mp3");
    } else {
      setGameState("incorrect");
      setStatus("incorrect");
      setScore(0);
      playSound("alarm.mp3");
    }

    // TODO: Too hard to read
    const incorrectChoiceId = newChoices.find(
      (choice) =>
        choice.is_selected &&
        !answerData.choices.find((ansChoice) => ansChoice.id === choice.id)
          ?.is_correct
    )?.id;
    setCorrectAnswer(
      answerData.choices.find((choice) => choice.is_correct)?.text || ""
    );
    setCorrectExplanation(
      answerData.choices.find((choice) => choice.is_correct)?.explanation || ""
    );
    setIncorrectAnswer(
      newChoices.find(
        (choice) =>
          choice.is_selected &&
          !answerData.choices.find((ansChoice) => ansChoice.id === choice.id)
            ?.is_correct
      )?.text || ""
    );
    setIncorrectExplanation(
      answerData.choices.find((choice) => choice.id === incorrectChoiceId)
        ?.explanation || ""
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

  return (
    <View className="flex-1">
      {/* for test components */}
      <ScrollView className="flex-1">
        <HeaderPanel
          title={"GameMunMun"}
          onPressBack={logOutHandler}
          onPressMenu={() => { }}
        ></HeaderPanel>

        <View className="flex-row justify-end">
          <View className="flex-row mx-6 mt-4 bg-[#FCC61D] px-3 py-1 rounded-[20]">
            {gameState === "incorrect" ? (
              <Text className="text-xl font-bold">Game Over : {score}</Text>
            ) : (
              <Text className="text-xl font-bold">{score}</Text>
            )}
          </View>
        </View>

        {/* Question */}
        <QuestionBox
          question={question?.text || "Loading question..."}
          status={status}
          onPressQuestion={handleQuestionPress}
        />

        {/* Choices */}
        <View>
          {choices.map((choice, index) => (
            <ChoiceBox
              key={index}
              text={choice.text}
              status={handleSelectChoice(choice.id)}
              onPress={() => {
                handleSubmitAnswer(choice.id, index);
              }}
              disabled={gameState !== "wait"}
            />
          ))}
        </View>
      </ScrollView>

      {/* Components for use */}
      <ExplanationPanel
        correctAnswer={correctAnswer}
        correctExplanation={correctExplanation}
        incorrectAnswer={incorrectAnswer}
        incorrectExplanation={incorrectExplanation}
        explanation={explanation}
        helperStatus={helperStatus}
        explanationStatus={explanationStatus}
        onPressNext={fetchData}
        gameState={gameState}
        question={question}
        selectedChoice={selectedChoice}
      />
    </View>
  );
}
