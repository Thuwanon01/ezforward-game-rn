import React from "react";
import QuestionBox from "../../components/lab/QuestionBox";

const questionText = "What is the capital of France?";

export default function TextToSpeechPage() {
  return (
    <QuestionBox question={questionText} />
  );
}